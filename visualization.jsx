import { useState, useRef, useEffect } from "react";

const N = 8;
const POP = 50;

function initP() {
  return new Array(N).fill(0.5);
}

function generate(p) {
  return p.map((pi) => (Math.random() < pi ? 1 : 0));
}

function leadingOnes(x) {
  let s = 0;
  for (let i = 0; i < x.length; i++) {
    if (x[i] === 1) s++;
    else break;
  }
  return s;
}

function step(p, pop) {
  const a = generate(p);
  const b = generate(p);
  const sa = leadingOnes(a);
  const sb = leadingOnes(b);
  const winner = sa >= sb ? a : b;
  const loser = sa >= sb ? b : a;

  const newP = [...p];
  for (let i = 0; i < N; i++) {
    if (winner[i] !== loser[i]) {
      if (winner[i] === 1) newP[i] += 1 / pop;
      else newP[i] -= 1 / pop;
      newP[i] = Math.max(1 / N, Math.min(1 - 1 / N, newP[i]));
    }
  }

  return {
    p: newP,
    a,
    b,
    sa,
    sb,
    winner,
    loser,
    winScore: Math.max(sa, sb),
    loseScore: Math.min(sa, sb),
  };
}

function Bar({ value, index }) {
  const h = Math.round(value * 100);
  const color =
    value > 0.8 ? "#22c55e" : value > 0.6 ? "#84cc16" : value < 0.3 ? "#ef4444" : "#64748b";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
      <div
        style={{
          width: "100%",
          height: 120,
          background: "#1e293b",
          borderRadius: 6,
          display: "flex",
          alignItems: "flex-end",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "100%",
            height: `${h}%`,
            background: color,
            borderRadius: "4px 4px 0 0",
            transition: "height 0.15s ease, background 0.15s ease",
          }}
        />
      </div>
      <div style={{ fontSize: 11, color: "#94a3b8", fontFamily: "monospace" }}>
        {value.toFixed(2)}
      </div>
      <div style={{ fontSize: 10, color: "#475569" }}>p[{index + 1}]</div>
    </div>
  );
}

function BitRow({ label, bits, score, isWinner }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        background: isWinner ? "rgba(34,197,94,0.08)" : "rgba(15,23,42,0.4)",
        borderRadius: 8,
        border: isWinner ? "1px solid #166534" : "1px solid #1e293b",
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: isWinner ? "#4ade80" : "#ef4444",
          fontWeight: 700,
          width: 46,
        }}
      >
        {label}
      </div>
      {bits.map((b, i) => {
        const contributes = i < score;
        const isBreaker = i === score && b === 0 && score < N;
        return (
          <div
            key={i}
            style={{
              width: 30,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 6,
              fontSize: 15,
              fontWeight: 700,
              fontFamily: "monospace",
              background: contributes
                ? "#14532d"
                : isBreaker
                  ? "#7f1d1d"
                  : "#0f172a",
              border: `1px solid ${contributes ? "#22c55e" : isBreaker ? "#ef4444" : "#1e293b"}`,
              color: contributes ? "#4ade80" : isBreaker ? "#ef4444" : "#334155",
            }}
          >
            {b}
          </div>
        );
      })}
      <div
        style={{
          marginLeft: "auto",
          fontSize: 16,
          fontWeight: 800,
          fontFamily: "monospace",
          color: score === N ? "#facc15" : "#e2e8f0",
        }}
      >
        {score}
      </div>
    </div>
  );
}

export default function App() {
  const [p, setP] = useState(initP);
  const [iter, setIter] = useState(0);
  const [last, setLast] = useState(null);
  const [bestEver, setBestEver] = useState(0);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(80);
  const runRef = useRef(false);
  const pRef = useRef(p);
  const iterRef = useRef(0);
  const bestRef = useRef(0);

  useEffect(() => {
    pRef.current = p;
  }, [p]);

  const doStep = () => {
    const result = step(pRef.current, POP);
    pRef.current = result.p;
    iterRef.current += 1;
    if (result.winScore > bestRef.current) bestRef.current = result.winScore;
    setP(result.p);
    setIter(iterRef.current);
    setLast(result);
    setBestEver(bestRef.current);
  };

  useEffect(() => {
    if (!running) return;
    runRef.current = true;
    const id = setInterval(() => {
      if (!runRef.current) return;
      doStep();
    }, speed);
    return () => {
      runRef.current = false;
      clearInterval(id);
    };
  }, [running, speed]);

  const reset = () => {
    setRunning(false);
    runRef.current = false;
    setP(initP());
    pRef.current = initP();
    setIter(0);
    iterRef.current = 0;
    setLast(null);
    setBestEver(0);
    bestRef.current = 0;
  };

  const solution = p.map((v) => (v >= 0.5 ? 1 : 0));
  const solScore = leadingOnes(solution);
  const solved = solScore === N;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "#e2e8f0",
        fontFamily: "system-ui, sans-serif",
        padding: "24px 20px",
        maxWidth: 520,
        margin: "0 auto",
      }}
    >
      <h1 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 4px" }}>
        cGA · LeadingOnes
      </h1>
      <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 20px" }}>
        n={N}, population_size={POP}
      </p>

      {/* Controls */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        <button
          onClick={doStep}
          disabled={running}
          style={{
            padding: "8px 18px",
            borderRadius: 8,
            border: "1px solid #334155",
            background: "#1e293b",
            color: "#e2e8f0",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            opacity: running ? 0.4 : 1,
          }}
        >
          Step
        </button>
        <button
          onClick={() => setRunning(!running)}
          style={{
            padding: "8px 18px",
            borderRadius: 8,
            border: "none",
            background: running ? "#dc2626" : "#16a34a",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {running ? "Stop" : "Run"}
        </button>
        <button
          onClick={reset}
          style={{
            padding: "8px 18px",
            borderRadius: 8,
            border: "1px solid #334155",
            background: "#0f172a",
            color: "#94a3b8",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Reset
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
          <span style={{ fontSize: 11, color: "#64748b" }}>Speed</span>
          <input
            type="range"
            min={10}
            max={300}
            value={300 - speed}
            onChange={(e) => setSpeed(300 - Number(e.target.value))}
            style={{ width: 80 }}
          />
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "flex",
          gap: 16,
          marginBottom: 20,
          padding: "10px 14px",
          background: "#0f172a",
          borderRadius: 10,
          border: "1px solid #1e293b",
        }}
      >
        {[
          { label: "Iteration", value: iter },
          { label: "Best LO", value: bestEver },
          { label: "Current", value: solScore + " / " + N },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase" }}>
              {s.label}
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                fontFamily: "monospace",
                color: s.label === "Current" && solved ? "#facc15" : "#e2e8f0",
              }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Probability vector bars */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8, fontWeight: 600 }}>
          Probability vector p
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {p.map((v, i) => (
            <Bar key={i} value={v} index={i} />
          ))}
        </div>
      </div>

      {/* Current solution */}
      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 20,
          padding: "8px 10px",
          background: solved ? "rgba(250,204,21,0.08)" : "#0f172a",
          borderRadius: 8,
          border: solved ? "1px solid #a16207" : "1px solid #1e293b",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 11, color: "#64748b", width: 56, fontWeight: 600 }}>
          Solution
        </span>
        {solution.map((b, i) => (
          <div
            key={i}
            style={{
              width: 30,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 6,
              fontSize: 15,
              fontWeight: 700,
              fontFamily: "monospace",
              background: b === 1 ? "#14532d" : "#1e293b",
              border: `1px solid ${b === 1 ? "#22c55e" : "#334155"}`,
              color: b === 1 ? "#4ade80" : "#475569",
              flex: 1,
            }}
          >
            {b}
          </div>
        ))}
        {solved && (
          <span style={{ fontSize: 13, fontWeight: 800, color: "#facc15", marginLeft: 8 }}>
            SOLVED
          </span>
        )}
      </div>

      {/* Last iteration detail */}
      {last && (
        <div>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 8, fontWeight: 600 }}>
            Last comparison (iteration {iter})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <BitRow
              label="Winner"
              bits={last.winner}
              score={last.winScore}
              isWinner={true}
            />
            <BitRow
              label="Loser"
              bits={last.loser}
              score={last.loseScore}
              isWinner={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}
