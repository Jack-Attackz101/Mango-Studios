import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

let _db: Database.Database | undefined;
export function db() {
  if (_db) return _db;
  const dir = resolve(import.meta.dirname, "../data");
  mkdirSync(dir, { recursive: true });
  _db = new Database(process.env.DB_PATH || resolve(dir, "app.db"));
  _db.pragma("journal_mode = WAL");
  _db.exec(`
    CREATE TABLE IF NOT EXISTS decisions(id INTEGER PRIMARY KEY, ts TEXT, job TEXT, model TEXT, state_text TEXT,
      questions_json TEXT, answers_json TEXT, latency_ms REAL, cost_usd REAL);
    CREATE TABLE IF NOT EXISTS race_runs(id INTEGER PRIMARY KEY, ts TEXT, job TEXT, input TEXT, jev_json TEXT, claude_json TEXT);
    CREATE TABLE IF NOT EXISTS spend(day TEXT PRIMARY KEY, usd REAL NOT NULL DEFAULT 0);
  `);
  return _db;
}
