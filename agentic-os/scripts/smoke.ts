// Phase 0 live smoke tests. Each check skips (loudly) if its key is missing. Total cost ~ $0.00002.
import "../server/env.js";
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const results: [string, string][] = [];
const report = (name: string, status: string) => { results.push([name, status]); console.log(`[${name}] ${status}`); };

async function openai() {
  if (!process.env.OPENAI_API_KEY) return report("openai", "SKIPPED: OPENAI_API_KEY missing");
  const { decideOpenAI } = await import("../server/providers/openai-decisions.js");
  const t0 = performance.now();
  const r = await decideOpenAI({
    state: { customer_tier: "enterprise", ticket: "My checkout page shows a blank screen after I click Pay." },
    questions: {
      is_bug: { type: "noul", instructions: "Is the customer reporting a software defect?" },
      team: { type: "choice", instructions: "Which team should own this ticket?", criteria: { payments: "Checkout, billing, or payment issues.", frontend: "Rendering or browser issues.", account: "Login or profile issues." } },
      urgency: { type: "score", instructions: "How urgent is this ticket?", criteria: ["Can wait", "Fix this week", "Blocking revenue now"] },
    },
  });
  console.log(JSON.stringify(r.answers, null, 2));
  report("openai", `OK ${Math.round(performance.now() - t0)} ms, cost $${r.usage.cost.toFixed(8)}, model ${r.model}`);
}

async function jev() {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return report("jev", "SKIPPED: OPENROUTER_API_KEY missing");
  const model = process.env.JEV_MODEL || "typesafe/jev-1.13";
  const body = {
    model,
    state: { customer_tier: "enterprise", ticket: "My checkout page shows a blank screen after I click Pay." },
    questions: {
      is_bug: { type: "noul", instructions: "Is the customer reporting a software defect?",
        criteria: { true: "The customer describes broken or unexpected product behavior.", false: "The customer is asking a question or requesting a feature." } },
      team: { type: "choice", instructions: "Which team should own this ticket?",
        criteria: { payments: "Checkout, billing, or payment processing issues.", frontend: "Rendering, layout, or browser compatibility issues.", account: "Login, permissions, or profile issues." } },
      urgency: { type: "score", instructions: "How urgent is this ticket?",
        criteria: ["Can wait for the next release", "Should be fixed this week", "Blocking revenue right now"] },
    },
  };
  const t0 = performance.now();
  const res = await fetch("https://openrouter.ai/api/alpha/decisions", {
    method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  const ms = Math.round(performance.now() - t0);
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok) return report("jev", `FAILED: HTTP ${res.status} ${JSON.stringify(json).slice(0, 300)}`);
  console.log(JSON.stringify(json.answers, null, 2));
  report("jev", `OK ${ms} ms, cost $${json.usage?.cost}, served by ${json.model}`);
}

async function fish() {
  const key = process.env.FISH_API_KEY;
  if (!key) return report("fish", "SKIPPED: FISH_API_KEY missing");
  const model = process.env.FISH_MODEL || "s2.1-pro-free";
  const payload: Record<string, unknown> = { text: "Good evening. All systems are online.", format: "mp3" };
  if (process.env.FISH_VOICE_ID) payload.reference_id = process.env.FISH_VOICE_ID;
  const t0 = performance.now();
  const res = await fetch("https://api.fish.audio/v1/tts", {
    method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", model }, body: JSON.stringify(payload),
  });
  const ms = Math.round(performance.now() - t0);
  if (!res.ok) return report("fish", `FAILED: HTTP ${res.status} ${(await res.text()).slice(0, 300)}`);
  const buf = Buffer.from(await res.arrayBuffer());
  mkdirSync(resolve(import.meta.dirname, "../out"), { recursive: true });
  const file = resolve(import.meta.dirname, "../out/smoke-tts.mp3");
  writeFileSync(file, buf);
  report("fish", `OK ${ms} ms, ${buf.length} bytes, model ${model}, saved ${file}`);
}

function claude() {
  const t0 = performance.now();
  const r = spawnSync("claude", ["-p", "say hi", "--output-format", "json", "--model", "haiku"], { encoding: "utf8", timeout: 90_000 });
  const ms = Math.round(performance.now() - t0);
  if (r.status !== 0) return report("claude", `FAILED: ${(r.stderr || r.stdout || "").slice(0, 300)}`);
  const j = JSON.parse(r.stdout);
  report("claude", `OK ${ms} ms, fields: ${Object.keys(j).join(",")}, total_cost_usd=${j.total_cost_usd ?? "n/a"}, session_id=${j.session_id ?? "n/a"}`);
}

for (const step of [openai, jev, fish, async () => claude()]) {
  try { await step(); } catch (e) { report(step.name || "step", `ERROR: ${(e as Error).message}`); }
}
console.log("\nSUMMARY"); results.forEach(([n, s]) => console.log(`  ${n}: ${s.split(":")[0].split(" ")[0]}`));
process.exit(results.some(([, s]) => s.startsWith("FAILED") || s.startsWith("ERROR")) ? 1 : 0);
