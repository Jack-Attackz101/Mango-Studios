// THE ONLY file that knows how decisions are made. Providers: TypeSafe direct, OpenRouter, or OpenAI logprobs.
// Docs: https://docs.typesafe.ai/ , https://openrouter.ai/docs/guides/community/jev-tutorial
import { z } from "zod";
import { db } from "./db.js";
import { env, requireEnv } from "./env.js";
import { addSpend, assertUnderCap } from "./cost.js";
import { HttpError } from "./errors.js";
import { decideOpenAI, type Question } from "./providers/openai-decisions.js";

export type { Question };
const prob = z.number();
const Answer = z.discriminatedUnion("type", [
  z.object({ type: z.literal("noul"), noul: prob }),
  z.object({ type: z.literal("choice"), choice: z.string(), confidence: prob, probabilities: z.record(prob) }),
  z.object({ type: z.literal("score"), score: prob, confidence: prob, probabilities: z.record(prob), legend: z.record(z.string()).optional() }),
]);
const Response = z.object({
  answers: z.record(Answer), model: z.string().optional(),
  usage: z.object({ input_tokens: z.number(), output_tokens: z.number().optional(), cost: z.number().optional() }).passthrough(),
});
export type Answers = z.infer<typeof Response>["answers"];
export interface Decision { answers: Answers; usage: { input_tokens: number; cost: number }; model: string; provider: string; latencyMs: number }

const JEV_PRICE_IN = () => Number(env("JEV_PRICE_IN_PER_M", "0.042")); // USD per 1M input tokens; TypeSafe's API reports no cost field
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function withRetry<T>(fn: () => Promise<T>, tries = 4, baseMs = 300): Promise<T> {
  for (let i = 0; ; i++) {
    try { return await fn(); } catch (e) {
      const status = (e as HttpError).status;
      const retryable = status === 429 || (status !== undefined && status >= 500) || (e as Error).name === "TimeoutError";
      if (!retryable || i >= tries - 1) throw e;
      await sleep(baseMs * 2 ** i * (0.5 + Math.random()));
    }
  }
}

async function callJev(body: { state: unknown; questions: Record<string, Question> }): Promise<{ raw: unknown; provider: string }> {
  const direct = !!process.env.TYPESAFE_API_KEY;
  const url = direct ? "https://api.typesafe.ai/v1/systemone" : "https://openrouter.ai/api/alpha/decisions";
  const key = direct ? process.env.TYPESAFE_API_KEY! : requireEnv("OPENROUTER_API_KEY");
  const model = direct ? env("JEV_TS_MODEL", "jev-latest") : env("JEV_MODEL", "typesafe/jev-1.13");
  const res = await fetch(url, {
    method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, ...body }), signal: AbortSignal.timeout(10_000),
  });
  const raw = await res.json().catch(() => ({}));
  if (!res.ok) throw new HttpError(res.status, `Jev HTTP ${res.status}: ${JSON.stringify(raw).slice(0, 300)}`);
  return { raw, provider: direct ? "typesafe" : "openrouter" };
}

export async function decide(opts: { job: string; state: unknown; questions: Record<string, Question> }): Promise<Decision> {
  assertUnderCap();
  const t0 = performance.now();
  let out: Omit<Decision, "latencyMs">;
  if (env("DECISION_PROVIDER", "jev") === "openai") {
    const r = await withRetry(() => decideOpenAI({ state: opts.state, questions: opts.questions }));
    out = { answers: r.answers as Answers, usage: r.usage, model: r.model, provider: "openai" };
  } else {
    const { raw, provider } = await withRetry(() => callJev({ state: opts.state, questions: opts.questions }));
    const parsed = Response.safeParse(raw);
    if (!parsed.success) throw new Error(`Unexpected decisions response shape (API drift?). See https://docs.typesafe.ai/ . ${parsed.error.message.slice(0, 300)}`);
    const u = parsed.data.usage;
    out = { answers: parsed.data.answers, usage: { input_tokens: u.input_tokens, cost: u.cost ?? (u.input_tokens * JEV_PRICE_IN()) / 1e6 }, model: parsed.data.model ?? "jev", provider };
  }
  const latencyMs = Math.round(performance.now() - t0);
  addSpend(out.usage.cost);
  const stateText = (typeof opts.state === "string" ? opts.state : JSON.stringify(opts.state)).slice(0, 4096);
  db().prepare("INSERT INTO decisions(ts,job,model,state_text,questions_json,answers_json,latency_ms,cost_usd) VALUES(?,?,?,?,?,?,?,?)")
    .run(new Date().toISOString(), opts.job, `${out.provider}:${out.model}`, stateText, JSON.stringify(opts.questions), JSON.stringify(out.answers), latencyMs, out.usage.cost);
  return { ...out, latencyMs };
}
