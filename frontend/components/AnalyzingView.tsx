"use client";
import { useEffect, useState } from "react";

const STEPS = [
  "Researching lead",
  "Cross-referencing industry signals",
  "Evaluating budget alignment",
  "Scoring intent indicators",
  "Running qualification metrics",
  "Assessing company fit",
  "Analyzing urgency signals",
  "Compiling findings",
  "Finalizing score",
];

export function AnalyzingView() {
  const [stepIndex, setStepIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const r = 96;
  const cx = 120;
  const cy = 120;
  const circumference = 2 * Math.PI * r;

  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        idx = (idx + 1) % STEPS.length;
        setStepIndex(idx);
        setVisible(true);
      }, 400);
    }, 3400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="view-in"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "340px",
        gap: "36px",
      }}
    >
      <div style={{ position: "relative", width: 240, height: 240 }}>
        {/* Outer static ring */}
        <svg width="240" height="240" viewBox="0 0 240 240" style={{ position: "absolute", inset: 0 }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        </svg>

        {/* Spinning arc */}
        <svg width="240" height="240" viewBox="0 0 240 240" className="spin-arc" style={{ position: "absolute", inset: 0 }}>
          <defs>
            <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.7)" />
            </linearGradient>
          </defs>
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke="url(#arcGrad)"
            strokeWidth="1"
            strokeLinecap="round"
            strokeDasharray={`${circumference * 0.22} ${circumference * 0.78}`}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        </svg>

        {/* Counter-rotating inner arc */}
        <svg
          width="240" height="240" viewBox="0 0 240 240"
          className="spin-arc"
          style={{ position: "absolute", inset: 0, animationDuration: "2.2s", animationDirection: "reverse", opacity: 0.35 }}
        >
          <circle
            cx={cx} cy={cy} r={r - 10}
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1"
            strokeLinecap="round"
            strokeDasharray={`${circumference * 0.08} ${circumference * 0.92}`}
            transform={`rotate(45 ${cx} ${cy})`}
          />
        </svg>

        {/* Center dot */}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.6)" }} />
        </div>
      </div>

      {/* Step label with crossfade */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "rgba(240,237,232,0.25)",
            transition: "opacity 250ms ease",
          }}
        >
          TechPersona Agent
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: visible ? "rgba(240,237,232,0.65)" : "rgba(240,237,232,0)",
            transition: "opacity 450ms ease, transform 450ms ease",
            transform: visible ? "translateY(0)" : "translateY(4px)",
            minWidth: 220,
            textAlign: "center",
          }}
        >
          {STEPS[stepIndex]}
        </div>
        {/* Dot trail */}
        <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 3,
                height: 3,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                animation: `analyzeTextPulse 1.4s ease-in-out ${i * 200}ms infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
