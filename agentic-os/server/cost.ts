import { db } from "./db.js";
import { env } from "./env.js";
import { SpendCapError } from "./errors.js";

const today = () => new Date().toISOString().slice(0, 10);
export const cap = () => Number(env("DAILY_CAP_USD", "1.00"));
export function spentToday(): number {
  return (db().prepare("SELECT usd FROM spend WHERE day=?").get(today()) as { usd: number } | undefined)?.usd ?? 0;
}
export function assertUnderCap() {
  const spent = spentToday();
  if (spent >= cap()) throw new SpendCapError(spent, cap());
}
export function addSpend(usd: number) {
  db().prepare("INSERT INTO spend(day,usd) VALUES(?,?) ON CONFLICT(day) DO UPDATE SET usd=usd+excluded.usd").run(today(), usd);
}
export function callsToday(): number {
  return (db().prepare("SELECT COUNT(*) n FROM decisions WHERE ts>=?").get(today()) as { n: number }).n;
}
