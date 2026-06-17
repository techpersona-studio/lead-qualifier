import type { QualificationResult } from "@/types/lead";

interface Props {
  result: QualificationResult | null;
}

const GRADE_COLOR: Record<string, string> = {
  A: "var(--grade-a)",
  B: "var(--grade-b)",
  C: "var(--grade-c)",
  D: "var(--grade-d)",
};

const DIMENSIONS = ["fit", "intent", "budget", "urgency"] as const;
type Dim = (typeof DIMENSIONS)[number];

function DimBar({
  label,
  value,
  gradeColor,
  delay,
}: {
  label: string;
  value: number;
  gradeColor: string;
  delay: number;
}) {
  const pct = `${(value / 10) * 100}%`;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-baseline">
        <span
          className="text-[11px] font-medium tracking-[0.08em] uppercase"
          style={{ color: "var(--text-dim)" }}
        >
          {label}
        </span>
        <span
          className="text-sm"
          style={{ color: "var(--text-primary)", fontFamily: "var(--font-geist-mono)" }}
        >
          {value} / 10
        </span>
      </div>
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height: 5, background: "var(--bar-bg)" }}
      >
        <div
          className="dim-bar-fill rounded-full"
          style={
            {
              "--bar-target-width": pct,
              "--bar-color": gradeColor,
              "--bar-delay": `${delay}ms`,
            } as React.CSSProperties
          }
        />
      </div>
    </div>
  );
}

export function QualificationResultCard({ result }: Props) {
  if (!result) {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center">
        <div
          className="flex flex-col items-center gap-3 rounded-lg px-10 py-12"
          style={{ border: "1px dashed var(--border-input)" }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "var(--text-muted)" }}
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <p className="text-sm text-center" style={{ color: "var(--text-muted)" }}>
            Run an analysis to see the qualification score.
          </p>
        </div>
      </div>
    );
  }

  const gradeColor = GRADE_COLOR[result.grade];

  return (
    <div className="result-enter space-y-8">
      {/* Zone 1: Verdict header */}
      <div className="flex items-start gap-6">
        <span
          className="leading-none select-none"
          style={{
            fontFamily: "var(--font-dm-serif)",
            fontSize: 96,
            color: gradeColor,
          }}
        >
          {result.grade}
        </span>
        <div className="pt-3 flex flex-col gap-1">
          <span
            className="text-[28px] leading-none"
            style={{
              fontFamily: "var(--font-geist-mono)",
              color: "var(--text-primary)",
            }}
          >
            {result.score} / 100
          </span>
          <span
            className="text-[11px] font-medium tracking-[0.1em] uppercase"
            style={{ color: "var(--accent)" }}
          >
            {result.recommendedAction}
          </span>
        </div>
      </div>

      {/* Zone 2: Summary */}
      <div>
        <div className="mb-4 h-px" style={{ background: "var(--divider)" }} />
        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "var(--text-body)" }}
        >
          {result.summary}
        </p>
      </div>

      {/* Zone 3: Dimensions */}
      <div className="space-y-5">
        {DIMENSIONS.map((dim: Dim, i) => (
          <DimBar
            key={dim}
            label={dim}
            value={result[dim]}
            gradeColor={gradeColor}
            delay={200 + i * 50}
          />
        ))}
      </div>

      {/* Zone 4: Flags */}
      {result.flags.length > 0 && (
        <div>
          <div className="mb-3 h-px" style={{ background: "var(--divider)" }} />
          <div className="flex flex-wrap gap-2">
            {result.flags.map((flag, i) => (
              <span
                key={i}
                className="text-[12px] rounded-full px-3 py-1"
                style={{
                  background: "var(--flag-bg)",
                  color: "var(--flag-text)",
                }}
              >
                ⚠ {flag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
