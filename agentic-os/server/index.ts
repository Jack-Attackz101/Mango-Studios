import { serve } from "@hono/node-server";
import { Hono } from "hono";
import "./env.js";
import { db } from "./db.js";
import { env } from "./env.js";

db(); // create tables on boot
const app = new Hono();
app.get("/api/health", (c) =>
  c.json({
    ok: true,
    keys: { openrouter: !!process.env.OPENROUTER_API_KEY, fish: !!process.env.FISH_API_KEY },
    jevModel: env("JEV_MODEL", "typesafe/jev-1.13"),
  }),
);

const port = Number(env("PORT", "8094"));
serve({ fetch: app.fetch, port, hostname: "127.0.0.1" }, () => console.log(`API on http://127.0.0.1:${port}`));
