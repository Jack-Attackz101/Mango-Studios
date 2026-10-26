import { db } from "../db.js";
import { runClaude } from "../claude.js";
import { env } from "../env.js";
import { classifyComment, KINDS } from "./comments.js";

const labels = Object.keys(KINDS);
const prompt = (text: string) =>
  `Classify this comment left on my YouTube channel. Answer with exactly one of: ${labels.join(", ")}, then one sentence why.\n\nComment: """${text}"""`;

export async function race(text: string) {
  const claudeModel = env("RACE_CLAUDE_MODEL", "opus");
  const [jev, claude] = await Promise.allSettled([classifyComment(text), runClaude(prompt(text), { model: claudeModel })]);
  const j = jev.status === "fulfilled" ? { ok: true as const, ...jev.value, seconds: jev.value.latencyMs / 1000 } : { ok: false as const, error: String((jev as PromiseRejectedResult).reason?.message ?? jev.reason) };
  const c = claude.status === "fulfilled"
    ? { ok: true as const, model: claudeModel, pick: labels.find((l) => claude.value.text.toLowerCase().includes(l)) ?? "unclear", text: claude.value.text, seconds: claude.value.ms / 1000, cost: claude.value.costUsd }
    : { ok: false as const, error: String((claude as PromiseRejectedResult).reason?.message ?? claude.reason) };
  // Ratios are computed from this run only; nothing is hard-coded.
  const faster = j.ok && c.ok ? c.seconds / j.seconds : null;
  const cheaper = j.ok && c.ok && c.cost != null && j.cost > 0 ? c.cost / j.cost : null;
  const result = { input: text, jev: j, claude: c, faster, cheaper };
  db().prepare("INSERT INTO race_runs(ts,job,input,jev_json,claude_json) VALUES(?,?,?,?,?)").run(new Date().toISOString(), "comments", text, JSON.stringify(j), JSON.stringify(c));
  return result;
}

/** Average of past runs, so the headline is "typical of N runs" and not one lucky result. */
export function raceHistory() {
  const rows = db().prepare("SELECT jev_json j, claude_json c FROM race_runs ORDER BY id DESC LIMIT 20").all() as { j: string; c: string }[];
  const both = rows.map((r) => ({ j: JSON.parse(r.j), c: JSON.parse(r.c) })).filter((r) => r.j.ok && r.c.ok);
  if (!both.length) return { runs: 0 };
  const avg = (f: (r: (typeof both)[0]) => number) => both.reduce((s, r) => s + f(r), 0) / both.length;
  const costed = both.filter((r) => r.c.cost != null);
  return { runs: both.length, jevSeconds: avg((r) => r.j.seconds), claudeSeconds: avg((r) => r.c.seconds), jevCost: avg((r) => r.j.cost), claudeCost: costed.length ? costed.reduce((s, r) => s + r.c.cost, 0) / costed.length : null };
}
