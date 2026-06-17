import type { QualificationResult } from "@/types/lead";

interface Lead {
  id: string;
  company_name: string;
  contact_name: string;
  grade: QualificationResult["grade"];
  score: number;
  created_at: string;
}

const GRADE_COLOR: Record<string, string> = {
  A: "var(--grade-a)",
  B: "var(--grade-b)",
  C: "var(--grade-c)",
  D: "var(--grade-d)",
};

const GRADE_LABEL: Record<string, string> = {
  A: "Hot",
  B: "Warm",
  C: "Cool",
  D: "Cold",
};

export function LeadRow({ lead }: { lead: Lead }) {
  const color = GRADE_COLOR[lead.grade] ?? "var(--text-muted)";
  const date = new Date(lead.created_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <tr
      data-testid="lead-row"
      style={{
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        cursor: "pointer",
        transition: "background 150ms ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <td style={{ padding: "14px 0", fontSize: 14, color: "var(--text-primary)", fontWeight: 500 }}>
        {lead.company_name}
      </td>
      <td style={{ padding: "14px 16px" }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color,
            border: `1px solid ${color}40`,
            borderRadius: 2,
            padding: "4px 10px",
          }}
        >
          {GRADE_LABEL[lead.grade]}
        </span>
      </td>
      <td style={{ padding: "14px 16px", fontFamily: "var(--font-geist-mono)", fontSize: 13, color: "var(--text-secondary)" }}>
        {lead.score}
      </td>
      <td style={{ padding: "14px 16px", fontSize: 13, color: "var(--text-secondary)" }}>
        {lead.contact_name}
      </td>
      <td style={{ padding: "14px 0", fontSize: 12, color: "var(--text-muted)", textAlign: "right" }}>
        {date}
      </td>
    </tr>
  );
}
