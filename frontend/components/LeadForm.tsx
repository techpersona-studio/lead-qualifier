"use client";
import { useState } from "react";
import type { LeadFormData, QualificationResult } from "@/types/lead";

interface Props {
  onResult: (result: QualificationResult) => void;
  onLoading: (loading: boolean) => void;
  isLoading: boolean;
}

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-1000", "1000+"];
const BUDGET_RANGES = ["< $5k", "$5k-$20k", "$20k-$50k", "$50k-$100k", "> $100k"];

function FieldGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6 pb-8 mb-8 border-b" style={{ borderColor: "var(--divider)" }}>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        className="block mb-1 text-[11px] font-medium tracking-[0.08em] uppercase"
        style={{ color: "var(--text-secondary)" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export function LeadForm({ onResult, onLoading, isLoading }: Props) {
  const [form, setForm] = useState<LeadFormData>({
    companyName: "",
    contactName: "",
    industry: "",
    companySize: "",
    budgetRange: "",
    useCase: "",
    websiteUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onLoading(true);
    try {
      const res = await fetch("/api/qualify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      onResult(data);
    } finally {
      onLoading(false);
    }
  };

  const set =
    (field: keyof LeadFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      {/* Group 1: Person */}
      <FieldGroup>
        <Field label="Contact name">
          <input
            required
            className="input-field"
            value={form.contactName}
            onChange={set("contactName")}
            placeholder="Jane Smith"
          />
        </Field>
        <Field label="Company name">
          <input
            required
            className="input-field"
            value={form.companyName}
            onChange={set("companyName")}
            placeholder="Acme Corp"
          />
        </Field>
        <Field label="Website URL">
          <input
            className="input-field"
            value={form.websiteUrl}
            onChange={set("websiteUrl")}
            placeholder="https://acme.com (optional)"
          />
        </Field>
      </FieldGroup>

      {/* Group 2: Company */}
      <FieldGroup>
        <Field label="Industry">
          <input
            required
            className="input-field"
            value={form.industry}
            onChange={set("industry")}
            placeholder="SaaS / Fintech / E-commerce…"
          />
        </Field>
        <Field label="Company size">
          <select
            required
            className="input-field"
            value={form.companySize}
            onChange={set("companySize")}
          >
            <option value="">Select…</option>
            {COMPANY_SIZES.map((s) => (
              <option key={s} value={s}>
                {s} employees
              </option>
            ))}
          </select>
        </Field>
      </FieldGroup>

      {/* Group 3: Deal */}
      <div className="space-y-6 mb-10">
        <Field label="Budget range">
          <select
            required
            className="input-field"
            value={form.budgetRange}
            onChange={set("budgetRange")}
          >
            <option value="">Select…</option>
            {BUDGET_RANGES.map((b) => (
              <option key={b} value={b}>
                {b} / year
              </option>
            ))}
          </select>
        </Field>
        <Field label="Use case">
          <textarea
            required
            className="input-field resize-none"
            value={form.useCase}
            onChange={set("useCase")}
            placeholder="Describe the problem they're trying to solve…"
            rows={4}
          />
        </Field>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`btn-analyze${isLoading ? " btn-loading" : ""}`}
      >
        {isLoading ? "Analyzing…" : "Analyze Lead"}
      </button>
    </form>
  );
}
