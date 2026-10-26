import { decide } from "../jev.js";

export const KINDS = {
  buyer: "The person shows intent to purchase or sign up, or asks how to buy, join or get access.",
  question: "A genuine question that is not about buying.",
  praise: "Compliment or thanks with no buying intent.",
  criticism: "Complaint, disagreement or negative feedback.",
  spam: "Promotion, scam, bot-like or irrelevant text.",
};
const HEAT = ["cold: no buying intent", "warm: interested, not ready", "hot: ready to buy now"];

export async function classifyComment(text: string) {
  const d = await decide({
    job: "comments",
    state: { source: "youtube_comment_on_my_channel", text },
    questions: {
      kind: { type: "choice", instructions: "What kind of comment is this?", criteria: KINDS },
      heat: { type: "score", instructions: "How likely is this person to buy soon?", criteria: HEAT },
    },
  });
  const k = d.answers.kind as { choice: string; probabilities: Record<string, number> };
  const h = d.answers.heat as { score: number };
  return { kind: k.choice, probs: k.probabilities, confidence: k.probabilities[k.choice], heat: h.score, latencyMs: d.latencyMs, cost: d.usage.cost, provider: d.provider };
}
