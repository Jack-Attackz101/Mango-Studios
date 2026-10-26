// Runs the logged-in `claude` CLI headlessly (no Anthropic API key needed).
import { spawn } from "node:child_process";

export interface ClaudeResult { text: string; ms: number; costUsd: number | null; sessionId: string | null; model: string }

export function runClaude(prompt: string, opts: { model?: string; timeoutMs?: number; system?: string } = {}): Promise<ClaudeResult> {
  const model = opts.model ?? "sonnet";
  // No tools: pure text answer. Anything that edits files or runs shell is a separate, confirmed path (Phase 3).
  const args = ["-p", prompt, "--output-format", "json", "--model", model, "--tools", ""];
  if (opts.system) args.push("--append-system-prompt", opts.system);
  return new Promise((resolve, reject) => {
    const t0 = performance.now();
    const p = spawn("claude", args, { stdio: ["ignore", "pipe", "pipe"] });
    let out = "", err = "";
    const timer = setTimeout(() => { p.kill("SIGKILL"); reject(new Error("claude CLI timed out")); }, opts.timeoutMs ?? 120_000);
    p.stdout.on("data", (d) => (out += d)); p.stderr.on("data", (d) => (err += d));
    p.on("error", (e) => { clearTimeout(timer); reject(e); });
    p.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0) return reject(new Error(`claude exited ${code}: ${(err || out).slice(0, 300)}`));
      try {
        const j = JSON.parse(out);
        resolve({ text: String(j.result ?? ""), ms: Math.round(performance.now() - t0), costUsd: typeof j.total_cost_usd === "number" ? j.total_cost_usd : null, sessionId: j.session_id ?? null, model });
      } catch (e) { reject(new Error(`bad claude output: ${out.slice(0, 200)}`)); }
    });
  });
}
