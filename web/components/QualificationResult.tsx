"use client";
import { useRef, useState } from "react";
import type { QualificationResult } from "@/types/lead";

interface Props {
  result: QualificationResult;
  onReset?: () => void;
}

// Score → color: readable white at the low end, bright purple at 100
function scoreToColor(score: number): string {
  // low scores stay clean white (low purple), high scores warm into vivid lavender
  if (score >= 85) return "#d4ceff";  // vivid lavender-white, very bright
  if (score >= 70) return "#b8b0f8";  // medium purple
  if (score >= 50) return "#9890e8";  // muted lavender
  if (score >= 35) return "#c9c6e6";  // soft white with a faint purple tint
  return "#e6e4f2";                   // near-white, very low purple — readable for cold leads
}

function scoreToGlow(score: number): string {
  if (score >= 85) return "0 0 32px rgba(180,170,255,0.55), 0 0 60px rgba(160,150,255,0.2)";
  if (score >= 70) return "0 0 20px rgba(160,150,255,0.35)";
  if (score >= 50) return "0 0 12px rgba(140,130,240,0.2)";
  // cold leads still glow for readability — white with only a hint of purple
  return "0 0 18px rgba(220,216,245,0.3), 0 0 36px rgba(180,172,255,0.12)";
}

const GRADE_LABEL: Record<string, string> = {
  A: "Hot Lead",
  B: "Warm Lead",
  C: "Cool Lead",
  D: "Cold Lead",
};

const DIMENSIONS = [
  { key: "fit" as const, label: "Fit" },
  { key: "intent" as const, label: "Intent" },
  { key: "budget" as const, label: "Budget" },
  { key: "urgency" as const, label: "Urgency" },
];

// ── Floating bubble component ─────────────────────
interface BubbleItem {
  id: number;
  text: string;
  x: number;      // % from center
  y: number;      // % from center
  size: number;   // px diameter
  duration: number;
  delay: number;
  positive: boolean;
}

function BubbleField({
  items,
  width,
  height,
}: {
  items: BubbleItem[];
  width: number;
  height: number;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [offsets, setOffsets] = useState<Record<number, { dx: number; dy: number }>>({});
  const fieldRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!fieldRef.current) return;
    const rect = fieldRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / rect.width;
    const dy = (e.clientY - cy) / rect.height;

    const newOffsets: Record<number, { dx: number; dy: number }> = {};
    items.forEach((b) => {
      // Each bubble repels gently from cursor
      const bx = (b.x / 100) * rect.width / 2;
      const by = (b.y / 100) * rect.height / 2;
      const mouseX = dx * rect.width / 2;
      const mouseY = dy * rect.height / 2;
      const dist = Math.sqrt((mouseX - bx) ** 2 + (mouseY - by) ** 2);
      const influence = Math.max(0, 1 - dist / 90);
      newOffsets[b.id] = {
        dx: -(mouseX - bx) * influence * 0.18,
        dy: -(mouseY - by) * influence * 0.18,
      };
    });
    setOffsets(newOffsets);
  };

  const handleMouseLeave = () => {
    setOffsets({});
    setHovered(null);
  };

  const halfW = width / 2;
  const halfH = height / 2;

  return (
    <div
      ref={fieldRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="bubble-field-enter"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "all",
      }}
    >
      {items.map((b) => {
        const off = offsets[b.id] ?? { dx: 0, dy: 0 };
        const isHov = hovered === b.id;
        const left = halfW + (b.x / 100) * halfW + off.dx;
        const top = halfH + (b.y / 100) * halfH + off.dy;

        return (
          <div
            key={b.id}
            onMouseEnter={() => setHovered(b.id)}
            onMouseLeave={() => setHovered(null)}
            className={`bubble-float`}
            style={{
              position: "absolute",
              left,
              top,
              minWidth: b.size,
              minHeight: b.size,
              maxWidth: 200,
              width: "auto",
              height: "auto",
              padding: "12px 22px",
              borderRadius: "50% / 60%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "default",
              "--bubble-dur": `${b.duration}s`,
              "--bubble-delay": `${b.delay}s`,
              transition: "transform 400ms cubic-bezier(0.22,1,0.36,1), box-shadow 300ms ease, background 300ms ease, filter 300ms ease, opacity 300ms ease",
              background: b.positive
                ? isHov
                  ? "rgba(180,170,255,0.14)"
                  : "rgba(160,150,255,0.07)"
                : isHov
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(255,255,255,0.04)",
              border: `1px solid ${b.positive
                ? isHov ? "rgba(180,170,255,0.4)" : "rgba(160,150,255,0.18)"
                : isHov ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)"}`,
              boxShadow: b.positive && isHov
                ? "0 0 16px rgba(160,150,255,0.25), inset 0 0 8px rgba(160,150,255,0.1)"
                : "none",
              // Pushed back in depth: smaller, softly blurred, dimmed. On hover they
              // surface toward the viewer (full scale, sharp, opaque). The float
              // keyframe reads --bubble-scale so depth survives the animation.
              "--bubble-scale": isHov ? 1 : 0.88,
              filter: isHov ? "blur(0px)" : "blur(0.2px)",
              opacity: isHov ? 1 : 0.85,
              zIndex: isHov ? 10 : 1,
            } as React.CSSProperties}
          >
            <span
              style={{
                fontSize: Math.max(8, b.size * 0.14),
                fontWeight: 600,
                letterSpacing: "0.04em",
                color: b.positive
                  ? isHov ? "rgba(214,210,255,0.98)" : "rgba(202,196,255,0.82)"
                  : isHov ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.55)",
                textAlign: "center",
                lineHeight: 1.25,
                userSelect: "none",
                transition: "color 300ms ease",
                whiteSpace: "normal",
                wordBreak: "normal",
                overflowWrap: "normal",
              }}
            >
              {b.text}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function buildBubbles(
  flags: string[],
  score: number,
): BubbleItem[] {
  const items: BubbleItem[] = [];
  const isGood = score >= 60;

  // Good lead: use positive signal words; bad lead: use flags
  const labels = isGood
    ? ["Strong fit", "High intent", "Budget ready", "Timely", "Qualified", ...flags.slice(0, 2)]
    : flags.length > 0
      ? flags
      : ["Low intent", "Unclear fit", "Weak signal"];

  const total = Math.min(labels.length, 6);

  // Distribute bubbles on the left/right flanks, stacked within the score's
  // vertical band so they spread sideways but never above/below or over the arc.
  const orbits = [
    { x: -78, y: -60 }, { x: 78, y: -60 },
    { x: -88, y: 0 },   { x: 88, y: 0 },
    { x: -78, y: 60 },  { x: 78, y: 60 },
  ];

  for (let i = 0; i < total; i++) {
    const pos = orbits[i % orbits.length];
    const diameter = 68 + (i % 3) * 10; // 68, 78, 88px
    items.push({
      id: i,
      text: labels[i],
      x: pos.x,
      y: pos.y,
      size: diameter,
      duration: 3.5 + i * 0.6,
      delay: i * 0.4,
      positive: isGood,
    });
  }
  return items;
}

// ── Main card ─────────────────────────────────────
export function QualificationResultCard({ result, onReset }: Props) {
  const color = scoreToColor(result.score);
  const glow = scoreToGlow(result.score);
  const showNextSteps = (result.grade === "A" || result.grade === "B") && result.nextSteps?.length > 0;

  // Rebuild bubbles with real flags for the arc
  const bubbleItems = buildBubbles(result.flags ?? [], result.score);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>

      {/* Score + grade badge */}
      <div className="result-reveal result-reveal-1" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        {/* Override BubbleField to use real flags */}
        <div style={{ position: "relative", width: 520, height: 320, margin: "0 auto" }}>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              // Score sits forward in depth: scaled up slightly above the receded
              // bubbles, with a soft cast shadow so it reads as nearest to the viewer.
              transform: "translate(-50%, -50%) scale(1.06)",
              width: 220,
              height: 220,
              zIndex: 5,
              filter: "drop-shadow(0 10px 28px rgba(0,0,0,0.55))",
            }}
          >
            {/* Track */}
            <svg width="220" height="220" viewBox="0 0 220 220" style={{ position: "absolute", inset: 0 }}>
              <circle
                cx={110} cy={110} r={90}
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="1"
                strokeDasharray={`${2 * Math.PI * 90 * 0.75} ${2 * Math.PI * 90 * 0.25}`}
                transform="rotate(135 110 110)"
              />
            </svg>
            {/* Fill */}
            <svg width="220" height="220" viewBox="0 0 220 220" style={{ position: "absolute", inset: 0 }}>
              <defs>
                <filter id="arcGlow2">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              <circle
                cx={110} cy={110} r={90}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray={`${(result.score / 100) * 2 * Math.PI * 90 * 0.75} ${2 * Math.PI * 90}`}
                transform="rotate(135 110 110)"
                className="arc-fill"
                filter={result.score >= 70 ? "url(#arcGlow2)" : undefined}
                style={{ "--arc-offset": `${2 * Math.PI * 90 - (result.score / 100) * 2 * Math.PI * 90 * 0.75}` } as React.CSSProperties}
              />
            </svg>
            {/* Score */}
            <div
              className="score-number"
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-geist-mono)",
                  fontSize: 58,
                  fontWeight: 400,
                  lineHeight: 1,
                  color,
                  letterSpacing: "-0.02em",
                  textShadow: glow,
                }}
              >
                {result.score}
              </span>
              <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(240,237,232,0.25)" }}>
                out of 100
              </span>
            </div>
          </div>
          <BubbleField items={bubbleItems} width={520} height={320} />
        </div>

        {/* Grade badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            border: `1px solid ${color}30`,
            borderRadius: 2,
            padding: "8px 18px",
          }}
        >
          <div
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: color,
              boxShadow: glow !== "none" ? `0 0 8px ${color}` : "none",
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color,
            }}
          >
            {GRADE_LABEL[result.grade]}
          </span>
        </div>
      </div>

      {/* TechPersona Agent Finding — no box border, just readable text */}
      <div className="result-reveal result-reveal-2">
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(240,237,232,0.28)",
            marginBottom: 14,
          }}
        >
          TechPersona Agent Finding
        </div>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.8,
            color: "rgba(240,237,232,0.72)",
            letterSpacing: "0.01em",
          }}
        >
          {result.summary}
        </p>
      </div>

      {/* Recommended Action — the headline decision */}
      {result.recommendedAction && (
        <div className="result-reveal result-reveal-2">
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(240,237,232,0.28)",
              marginBottom: 14,
            }}
          >
            Recommended Action
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
              background: `${color}0a`,
              border: `1px solid ${color}26`,
              borderRadius: 4,
              padding: "16px 20px",
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: color,
                boxShadow: glow !== "none" ? `0 0 8px ${color}` : "none",
                marginTop: 7,
                flexShrink: 0,
              }}
            />
            <p style={{ fontSize: 15, lineHeight: 1.7, color: "rgba(240,237,232,0.82)" }}>
              {result.recommendedAction}
            </p>
          </div>
        </div>
      )}

      {/* Breakdown */}
      <div className="result-reveal result-reveal-3">
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(240,237,232,0.28)",
            marginBottom: 20,
          }}
        >
          Breakdown
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {DIMENSIONS.map(({ key, label }, i) => {
            const pct = `${(result[key] / 10) * 100}%`;
            return (
              <div key={key}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(240,237,232,0.45)" }}>
                    {label}
                  </span>
                  <span style={{ fontFamily: "var(--font-geist-mono)", fontSize: 12, color: "rgba(240,237,232,0.55)" }}>
                    {result[key]}<span style={{ color: "rgba(240,237,232,0.22)" }}>/10</span>
                  </span>
                </div>
                <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.05)", borderRadius: 1, overflow: "hidden" }}>
                  <div
                    className="dim-bar"
                    style={{
                      "--bar-w": pct,
                      "--bar-color": color,
                      "--bar-delay": `${600 + i * 80}ms`,
                    } as React.CSSProperties}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Next Steps */}
      {showNextSteps && (
        <div className="result-reveal result-reveal-4">
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(240,237,232,0.28)", marginBottom: 16 }}>
            Recommended Next Steps
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {result.nextSteps.map((step, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 4,
                  padding: "14px 18px",
                }}
              >
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: color, boxShadow: glow !== "none" ? `0 0 6px ${color}` : "none", marginTop: 6, flexShrink: 0 }} />
                <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(240,237,232,0.65)" }}>{step}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reset */}
      {onReset && (
        <div className="result-reveal result-reveal-5" style={{ display: "flex", justifyContent: "center", paddingTop: 8 }}>
          <button onClick={onReset} className="btn-secondary">
            Analyze Another Lead
          </button>
        </div>
      )}
    </div>
  );
}
