import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
process.env.DB_PATH = ":memory:";
process.env.TYPESAFE_API_KEY = "test-key";
process.env.DECISION_PROVIDER = "jev";

const Q = { q: { type: "choice" as const, instructions: "x", criteria: { a: "A", b: "B" } } };
const ok = { model: "jev-1.14.0", answers: { q: { type: "choice", choice: "a", confidence: 0.9, probabilities: { a: 0.9, b: 0.1 } } }, usage: { input_tokens: 1000, output_tokens: 5 } };
const res = (status: number, body: unknown) => new Response(JSON.stringify(body), { status });
let jev: typeof import("./jev.js"), cost: typeof import("./cost.js"), errors: typeof import("./errors.js");
beforeAll(async () => { jev = await import("./jev.js"); cost = await import("./cost.js"); errors = await import("./errors.js"); });
beforeEach(() => { process.env.DAILY_CAP_USD = "1.00"; });
afterEach(() => vi.restoreAllMocks());

describe("decide()", () => {
  it("parses a good response, computes cost from tokens, and meters spend", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(res(200, ok));
    const before = cost.spentToday();
    const d = await jev.decide({ job: "t", state: "s", questions: Q });
    expect(d.answers.q).toMatchObject({ choice: "a" });
    expect(d.usage.cost).toBeCloseTo((1000 * 0.042) / 1e6);
    expect(cost.spentToday() - before).toBeCloseTo(d.usage.cost);
  });
  it("retries on 429 then succeeds", async () => {
    const f = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(res(429, {})).mockResolvedValueOnce(res(200, ok));
    await jev.decide({ job: "t", state: "s", questions: Q });
    expect(f).toHaveBeenCalledTimes(2);
  });
  it("does not retry on 401", async () => {
    const f = vi.spyOn(globalThis, "fetch").mockResolvedValue(res(401, { error: "bad key" }));
    await expect(jev.decide({ job: "t", state: "s", questions: Q })).rejects.toThrow(/401/);
    expect(f).toHaveBeenCalledTimes(1);
  });
  it("throws a clear error on a drifted response shape", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(res(200, { answers: { q: { type: "choice" } }, usage: {} }));
    await expect(jev.decide({ job: "t", state: "s", questions: Q })).rejects.toThrow(/API drift/);
  });
  it("refuses to call the network once the daily cap is hit", async () => {
    process.env.DAILY_CAP_USD = "0.000001";
    const f = vi.spyOn(globalThis, "fetch");
    await expect(jev.decide({ job: "t", state: "s", questions: Q })).rejects.toBeInstanceOf(errors.SpendCapError);
    expect(f).not.toHaveBeenCalled();
  });
});
