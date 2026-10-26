import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";
import "./styles.css";

type Probs = Record<string, number>;
interface Race {
  jev: { ok: true; kind: string; confidence: number; probs: Probs; seconds: number; cost: number; heat: number; provider: string } | { ok: false; error: string };
  claude: { ok: true; model: string; pick: string; text: string; seconds: number; cost: number | null } | { ok: false; error: string };
  faster: number | null; cheaper: number | null;
}
interface Status { spent: number; cap: number; calls: number; provider: string }
const api = async (path: string, body?: unknown) => {
  const r = await fetch(path, body ? { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) } : undefined);
  const j = await r.json(); if (!r.ok) throw new Error(j.error ?? r.statusText); return j;
};
const usd = (n: number) => (n < 0.01 ? `$${n.toFixed(6)}` : `$${n.toFixed(4)}`);

function Bars({ probs, color }: { probs: Probs; color: string }) {
  return <div style={{ ["--c" as string]: color }}>{Object.entries(probs).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
    <div className="bar" key={k}><span className="mono">{k}</span><span><i style={{ width: `${v * 100}%` }} /></span><span className="mono">{(v * 100).toFixed(0)}%</span></div>))}</div>;
}

function RacePage({ onRan }: { onRan: () => void }) {
  const [text, setText] = useState("Bro this changed how I run my agency. Where do I sign up for the course?");
  const [seed, setSeed] = useState<{ id: number; text: string }[]>([]);
  const [res, setRes] = useState<Race | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [hist, setHist] = useState<{ runs: number; jevSeconds?: number; claudeSeconds?: number; jevCost?: number; claudeCost?: number | null }>({ runs: 0 });
  const loadHist = () => api("/api/race/history").then(setHist).catch(() => {});
  useEffect(() => { api("/api/comments/seed").then((d) => setSeed(d.comments)).catch(() => {}); loadHist(); }, []);
  const run = async () => {
    setBusy(true); setErr(""); setRes(null);
    try { setRes(await api("/api/race", { text })); loadHist(); onRan(); } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };
  return (<>
    <h1>Race: Jev vs Claude</h1>
    <p className="note">Same comment, same labels. Times and costs below are measured live, never hard-coded.</p>
    <textarea value={text} onChange={(e) => setText(e.target.value)} aria-label="Comment to classify" />
    <div className="row">
      <select aria-label="Seeded demo comments" onChange={(e) => e.target.value && setText(e.target.value)} value="">
        <option value="">Demo comments…</option>{seed.map((s) => <option key={s.id} value={s.text}>{s.text.slice(0, 70)}</option>)}
      </select><span className="demo">DEMO DATA</span>
      <button className="go" onClick={run} disabled={busy || !text.trim()}>{busy ? "Racing…" : "Run race"}</button>
    </div>
    {err && <p className="err">{err}</p>}
    {res && (<>
      <div className="cards">
        <div className="card" style={{ ["--c" as string]: "var(--jev)" }}><h3>Jev · decision model</h3>
          {res.jev.ok ? (<><div className="big">{res.jev.kind} <span className="mono" style={{ fontSize: 18 }}>{(res.jev.confidence * 100).toFixed(0)}%</span></div>
            <div className="stats mono"><span><b>{res.jev.seconds.toFixed(2)}s</b></span><span><b>{usd(res.jev.cost)}</b></span><span>heat {res.jev.heat.toFixed(2)}/2</span></div>
            <Bars probs={res.jev.probs} color="var(--jev)" /></>) : <p className="err">{res.jev.error}</p>}</div>
        <div className="card" style={{ ["--c" as string]: "var(--claude)" }}><h3>Claude {res.claude.ok ? res.claude.model : ""} · via CLI</h3>
          {res.claude.ok ? (<><div className="big">{res.claude.pick}</div>
            <div className="stats mono"><span><b>{res.claude.seconds.toFixed(2)}s</b></span><span><b>{res.claude.cost != null ? usd(res.claude.cost) : "n/a"}</b></span></div>
            <p>{res.claude.text}</p></>) : <p className="err">{res.claude.error}</p>}</div>
      </div>
      {res.faster && <div className="verdict"><b className="mono">{res.faster.toFixed(1)}x faster</b>{res.cheaper && <> · <b className="mono">{res.cheaper.toFixed(0)}x cheaper</b></>} on this run.
        <div className="note">Claude cost is the CLI's reported total, which includes its own system-prompt overhead, so the cost ratio flatters Jev. Don't quote one run; see the average below.</div></div>}
    </>)}
    {hist.runs > 0 && <p className="note mono">Average of last {hist.runs} run(s): Jev {hist.jevSeconds!.toFixed(2)}s / {usd(hist.jevCost!)} · Claude {hist.claudeSeconds!.toFixed(2)}s / {hist.claudeCost != null ? usd(hist.claudeCost) : "n/a"}</p>}
  </>);
}

function App() {
  const [st, setSt] = useState<Status | null>(null);
  const load = () => api("/api/status").then(setSt).catch(() => {});
  useEffect(() => { load(); }, []);
  return (<div className="app">
    <nav><b>Agentic OS</b><a className="on">Race</a>{["Inbox", "Chat", "Invoices", "Taste", "Library", "Memory"].map((n) => <a key={n} className="soon">{n}</a>)}</nav>
    <main><RacePage onRan={load} /></main>
    <footer className="mono">{st ? <><span>spend {usd(st.spent)} / ${st.cap.toFixed(2)}</span><span>{st.calls} decisions</span><span>provider: {st.provider}</span></> : "api offline"}</footer>
  </div>);
}
createRoot(document.getElementById("root")!).render(<App />);
