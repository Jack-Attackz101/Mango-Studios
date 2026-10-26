// Labelled-data check for Job 01. Live; costs well under a cent.
import "../server/env.js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { classifyComment } from "../server/jobs/comments.js";
import { batch } from "../server/decide.js";

const dir = resolve(import.meta.dirname, "../seed");
const seed = JSON.parse(readFileSync(resolve(dir, "comments.json"), "utf8")) as { id: number; text: string }[];
const labels = JSON.parse(readFileSync(resolve(dir, "labels.json"), "utf8")).comments as Record<string, string>;
const t0 = performance.now();
const rows = await batch(seed, async (s) => ({ s, r: await classifyComment(s.text) }), { concurrency: 8 });
const secs = (performance.now() - t0) / 1000;
const wrong = rows.filter(({ s, r }) => r.kind !== labels[s.id]);
const first = rows[0];
console.log(`accuracy ${rows.length - wrong.length}/${rows.length}  total ${secs.toFixed(1)}s  cost $${rows.reduce((a, { r }) => a + r.cost, 0).toFixed(6)}`);
console.log(`canonical comment -> ${first.r.kind} p=${first.r.confidence.toFixed(3)} in ${first.r.latencyMs} ms`);
for (const { s, r } of wrong) console.log(`MISS #${s.id} expected ${labels[s.id]} got ${r.kind} (${r.confidence.toFixed(2)}): ${s.text}`);
process.exit(wrong.length > 4 || first.r.kind !== "buyer" ? 1 : 0);
