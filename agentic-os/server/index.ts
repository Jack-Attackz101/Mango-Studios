import { serve } from "@hono/node-server";
import { Hono } from "hono";
import "./env.js";
import { db } from "./db.js";
import { env } from "./env.js";
import { cap, callsToday, spentToday } from "./cost.js";
import { SpendCapError } from "./errors.js";
import { classifyComment } from "./jobs/comments.js";
import { race, raceHistory } from "./jobs/race.js";
import { batch } from "./decide.js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

db();
const app = new Hono();
app.onError((e, c) => c.json({ error: e.message, capReached: e instanceof SpendCapError }, e instanceof SpendCapError ? 429 : 500));

app.get("/api/health", (c) => c.json({ ok: true, keys: { jev: !!(process.env.TYPESAFE_API_KEY || process.env.OPENROUTER_API_KEY), openai: !!process.env.OPENAI_API_KEY, fish: !!process.env.FISH_API_KEY } }));
app.get("/api/status", (c) => c.json({ spent: spentToday(), cap: cap(), calls: callsToday(), provider: env("DECISION_PROVIDER", "jev") }));

app.get("/api/comments/seed", (c) => c.json({ demo: true, comments: JSON.parse(readFileSync(resolve(import.meta.dirname, "../seed/comments.json"), "utf8")) }));
app.post("/api/comments/classify", async (c) => c.json(await classifyComment(String((await c.req.json()).text ?? ""))));
app.post("/api/comments/spot-buyers", async (c) => {
  const { texts } = (await c.req.json()) as { texts: string[] };
  const t0 = performance.now();
  const rows = await batch(texts, async (text) => ({ text, ...(await classifyComment(text)) }), { concurrency: 8 });
  rows.sort((a, b) => Number(b.kind === "buyer") - Number(a.kind === "buyer") || b.heat - a.heat);
  return c.json({ rows, seconds: (performance.now() - t0) / 1000, cost: rows.reduce((s, r) => s + r.cost, 0) });
});
app.post("/api/race", async (c) => c.json(await race(String((await c.req.json()).text ?? ""))));
app.get("/api/race/history", (c) => c.json(raceHistory()));

const port = Number(env("PORT", "8094"));
serve({ fetch: app.fetch, port, hostname: "127.0.0.1" }, () => console.log(`API on http://127.0.0.1:${port}`));
