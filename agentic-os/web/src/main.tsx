import { createRoot } from "react-dom/client";
import { useEffect, useState } from "react";

function App() {
  const [health, setHealth] = useState<unknown>(null);
  useEffect(() => { fetch("/api/health").then((r) => r.json()).then(setHealth).catch(() => setHealth("api down")); }, []);
  return (
    <main style={{ fontFamily: "system-ui", background: "#0b0d12", color: "#e8e6e1", minHeight: "100vh", padding: 32 }}>
      <h1>Agentic OS</h1>
      <p>Phase 0 shell. API health:</p>
      <pre>{JSON.stringify(health, null, 2)}</pre>
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
