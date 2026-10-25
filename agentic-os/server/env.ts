import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const file = resolve(import.meta.dirname, "../.env.local");
if (existsSync(file)) {
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !line.trim().startsWith("#") && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
}

/** Fail closed: no fallback secrets anywhere. */
export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}. Add it to agentic-os/.env.local (see .env.example). Feature disabled.`);
  return v;
}
export const env = (name: string, fallback = "") => process.env[name] ?? fallback;
