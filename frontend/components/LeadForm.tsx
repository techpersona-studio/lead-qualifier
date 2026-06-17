"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import type { LeadFormData, QualificationResult } from "@/types/lead";

interface Props {
  onResult: (result: QualificationResult) => void;
  onAnalyzing: (v: boolean) => void;
}

const INDUSTRIES = [
  "SaaS", "Fintech", "E-commerce", "Healthcare", "Manufacturing",
  "Real Estate", "Legal", "Media & Publishing", "Logistics", "Other",
];
const COMPANY_SIZES = ["1–10", "11–50", "51–200", "201–1000", "1000+"];
// Per-project budget, aligned with the backend scoring guide
const BUDGET_RANGES = [
  "$5,000+", "$2,000–$5,000", "$1,000–$2,000", "$500–$1,000", "Under $500",
];
const URGENCY_OPTIONS = [
  "ASAP / this month", "This quarter", "Next 3–6 months",
  "Sometime this year", "Just exploring",
];

// Preset use-case chips. Multi-select; "Other" reveals a free-text input.
const USE_CASE_OPTIONS = [
  "Website redesign & conversion",
  "Business bottlenecks & inefficiencies automation",
  "Customer support automation",
  "Lead generation",
];
const OTHER_USE_CASE = "Describe your use case…";

// ── Portal dropdown ───────────────────────────────
// Renders the panel + overlay via createPortal onto document.body,
// fully escaping any CSS animation stacking context.
interface SelectProps {
  id: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
  suffix?: string;
  openId: string | null;
  setOpenId: (id: string | null) => void;
}

function CustomSelect({
  id, value, onChange, options, placeholder = "Select…",
  required, suffix, openId, setOpenId,
}: SelectProps) {
  const open = openId === id;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [panelRect, setPanelRect] = useState<{ top: number; left: number; width: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const updateRect = useCallback(() => {
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setPanelRect({ top: r.bottom + 4, left: r.left, width: r.width });
    }
  }, []);

  const handleToggle = () => {
    if (!open) updateRect();
    setOpenId(open ? null : id);
  };

  // Reposition on scroll/resize
  useEffect(() => {
    if (!open) return;
    const handler = () => updateRect();
    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("resize", handler);
    };
  }, [open, updateRect]);

  const display = value
    ? suffix ? `${value} ${suffix}` : value
    : placeholder;

  return (
    <div style={{ position: "relative" }}>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          borderBottom: `1px solid ${open ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)"}`,
          borderRadius: 0,
          padding: "12px 20px 12px 2px",
          textAlign: "left",
          fontSize: 16,
          fontFamily: "var(--font-syne), sans-serif",
          color: value ? "rgba(240,237,232,0.88)" : "rgba(240,237,232,0.25)",
          letterSpacing: "0.01em",
          cursor: "pointer",
          transition: "border-color 250ms ease",
          position: "relative",
        }}
      >
        {display}
        <svg
          width="10" height="6" viewBox="0 0 10 6" fill="none"
          style={{
            position: "absolute",
            right: 2,
            top: "50%",
            transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`,
            transition: "transform 220ms ease",
            opacity: 0.35,
          }}
        >
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Portal: overlay + panel rendered on document.body — escapes all stacking contexts */}
      {mounted && open && panelRect && createPortal(
        <>
          {/* Overlay blocks all pointer events to the rest of the page */}
          <div
            onClick={() => setOpenId(null)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 99998,
              cursor: "default",
            }}
          />
          {/* Panel sits above the overlay */}
          <div
            style={{
              position: "fixed",
              top: panelRect.top,
              left: panelRect.left,
              width: panelRect.width,
              background: "#080910",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 6,
              overflow: "hidden auto",
              maxHeight: 240,
              zIndex: 99999,
              animation: "dropdownIn 160ms cubic-bezier(0.22,1,0.36,1) forwards",
            }}
          >
            {options.map((opt) => {
              const label = suffix ? `${opt} ${suffix}` : opt;
              const selected = opt === value;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onChange(opt); setOpenId(null); }}
                  style={{
                    width: "100%",
                    background: selected ? "rgba(180,170,255,0.12)" : "transparent",
                    border: "none",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    padding: "12px 14px",
                    textAlign: "left",
                    fontSize: 15,
                    fontFamily: "var(--font-syne), sans-serif",
                    color: selected ? "rgba(210,205,255,0.95)" : "rgba(240,237,232,0.9)",
                    letterSpacing: "0.01em",
                    cursor: "pointer",
                    transition: "background 150ms ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!selected) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    if (!selected) (e.currentTarget as HTMLButtonElement).style.background = selected ? "rgba(180,170,255,0.12)" : "transparent";
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </>,
        document.body
      )}

      {required && (
        <input
          tabIndex={-1}
          required
          value={value}
          onChange={() => {}}
          style={{ opacity: 0, height: 0, width: 0, position: "absolute" }}
        />
      )}
    </div>
  );
}

// ── Field wrapper ─────────────────────────────────
function Field({ label, children, delay }: { label: string; children: React.ReactNode; delay: number }) {
  return (
    <div className={`fade-up fade-up-${delay}`}>
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}

// ── Form ──────────────────────────────────────────
export function LeadForm({ onResult, onAnalyzing }: Props) {
  const [form, setForm] = useState<LeadFormData>({
    companyName: "",
    contactName: "",
    industry: "",
    companySize: "",
    budgetRange: "",
    urgency: "",
    useCase: "",
    websiteUrl: "",
  });

  const [openId, setOpenId] = useState<string | null>(null);

  // Use-case is captured as multi-select chips + an optional "Other" free-text field.
  // The derived string lands in form.useCase via the effect below.
  const [selectedUseCases, setSelectedUseCases] = useState<string[]>([]);
  const [otherActive, setOtherActive] = useState(false);
  const [otherText, setOtherText] = useState("");

  const setField = (field: keyof LeadFormData) => (v: string) =>
    setForm((prev) => ({ ...prev, [field]: v }));

  const toggleUseCase = (option: string) =>
    setSelectedUseCases((prev) =>
      prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
    );

  // "Other" text overrides chip selection; otherwise join selected chips.
  useEffect(() => {
    const useCase = otherActive && otherText.trim()
      ? otherText.trim()
      : selectedUseCases.join("; ");
    setForm((prev) => ({ ...prev, useCase }));
  }, [selectedUseCases, otherActive, otherText]);

  const setInput = (field: keyof LeadFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyzing(true);
    try {
      const res = await fetch("/api/qualify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      onResult(data);
    } finally {
      onAnalyzing(false);
    }
  };

  const selectProps = { openId, setOpenId };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
        <Field label="Contact name" delay={1}>
          <input required className="field-input" value={form.contactName} onChange={setInput("contactName")} placeholder="Jane Smith" />
        </Field>
        <Field label="Company name" delay={2}>
          <input required className="field-input" value={form.companyName} onChange={setInput("companyName")} placeholder="Acme Corp" />
        </Field>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
        <Field label="Industry" delay={3}>
          <CustomSelect id="industry" value={form.industry} onChange={setField("industry")} options={INDUSTRIES} required {...selectProps} />
        </Field>
        <Field label="Company size" delay={3}>
          <CustomSelect id="companySize" value={form.companySize} onChange={setField("companySize")} options={COMPANY_SIZES} suffix="employees" required {...selectProps} />
        </Field>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 32px" }}>
        <Field label="Budget range" delay={4}>
          <CustomSelect id="budgetRange" value={form.budgetRange} onChange={setField("budgetRange")} options={BUDGET_RANGES} required {...selectProps} />
        </Field>
        <Field label="Timeline" delay={4}>
          <CustomSelect id="urgency" value={form.urgency} onChange={setField("urgency")} options={URGENCY_OPTIONS} required {...selectProps} />
        </Field>
      </div>

      <Field label="Tell us your pain point or use case." delay={5}>
        <div className="chip-row">
          {USE_CASE_OPTIONS.map((option) => {
            const selected = selectedUseCases.includes(option);
            return (
              <button
                key={option}
                type="button"
                className={`chip${selected ? " chip-selected" : ""}`}
                aria-pressed={selected}
                onClick={() => toggleUseCase(option)}
              >
                {option}
              </button>
            );
          })}
          <button
            type="button"
            className={`chip${otherActive ? " chip-selected" : ""}`}
            aria-pressed={otherActive}
            onClick={() => setOtherActive((v) => !v)}
          >
            {OTHER_USE_CASE}
          </button>
        </div>
        {otherActive && (
          <input
            autoFocus
            className="field-input"
            style={{ marginTop: 16 }}
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
            placeholder="Describe your use case…"
          />
        )}
      </Field>

      <Field label="Website URL (optional)" delay={6}>
        <input className="field-input" value={form.websiteUrl} onChange={setInput("websiteUrl")} placeholder="https://acme.com" />
      </Field>

      <div className="fade-up fade-up-7" style={{ paddingTop: 8 }}>
        <button type="submit" className="btn-primary">
          Analyze Lead
        </button>
      </div>
    </form>
  );
}
