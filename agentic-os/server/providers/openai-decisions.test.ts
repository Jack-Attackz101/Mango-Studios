import { describe, expect, it } from "vitest";
import { aggregate, buildPrompt } from "./openai-decisions.js";

describe("aggregate", () => {
  it("merges case/space variants and normalises", () => {
    const p = aggregate([{ token: "A", logprob: Math.log(0.6) }, { token: " a", logprob: Math.log(0.2) }, { token: "B", logprob: Math.log(0.2) }, { token: "zzz", logprob: Math.log(0.5) }], ["A", "B"]);
    expect(p.A).toBeCloseTo(0.8); expect(p.B).toBeCloseTo(0.2);
  });
  it("returns zeros when no candidate appears", () => {
    expect(aggregate([{ token: "x", logprob: -1 }], ["A", "B"])).toEqual({ A: 0, B: 0 });
  });
});
describe("buildPrompt", () => {
  it("maps choice labels to letters", () => {
    const b = buildPrompt({ type: "choice", instructions: "q", criteria: { buyer: "x", spam: "y" } });
    expect(b.tokens).toEqual(["A", "B"]); expect(b.labels).toEqual(["buyer", "spam"]);
  });
  it("rejects score scales over 10", () => {
    expect(() => buildPrompt({ type: "score", instructions: "q", criteria: Array(11).fill("x") })).toThrow();
  });
});
