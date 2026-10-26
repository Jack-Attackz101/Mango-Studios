import { decide, type Answers } from "./jev.js";

type Meta = { latencyMs: number; cost: number };
const meta = (d: Awaited<ReturnType<typeof decide>>): Meta => ({ latencyMs: d.latencyMs, cost: d.usage.cost });

export async function choice(job: string, state: unknown, instructions: string, criteria: Record<string, string>) {
  const d = await decide({ job, state, questions: { q: { type: "choice", instructions, criteria } } });
  const a = d.answers.q as Extract<Answers[string], { type: "choice" }>;
  return { pick: a.choice, probs: a.probabilities, confidence: a.probabilities[a.choice] ?? a.confidence, ...meta(d) };
}
export async function noul(job: string, state: unknown, instructions: string, criteria?: { true?: string; false?: string }) {
  const d = await decide({ job, state, questions: { q: { type: "noul", instructions, criteria } } });
  return { p: (d.answers.q as { noul: number }).noul, ...meta(d) };
}
export async function score(job: string, state: unknown, instructions: string, levels: string[]) {
  const d = await decide({ job, state, questions: { q: { type: "score", instructions, criteria: levels } } });
  const a = d.answers.q as Extract<Answers[string], { type: "score" }>;
  return { score: a.score, probs: a.probabilities, confidence: a.confidence, ...meta(d) };
}

/** Run fn over items with a concurrency limit and a progress callback. Results keep input order. */
export async function batch<T, R>(items: T[], fn: (item: T, i: number) => Promise<R>, opts: { concurrency?: number; onProgress?: (done: number, total: number) => void } = {}) {
  const out = new Array<R>(items.length);
  let next = 0, done = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i], i);
      opts.onProgress?.(++done, items.length);
    }
  };
  await Promise.all(Array.from({ length: Math.min(opts.concurrency ?? 8, items.length) }, worker));
  return out;
}
