"use client";
import { useState } from "react";
import type { LeadFormData, QualificationResult } from "@/types/lead";

interface Props {
  onResult: (result: QualificationResult) => void;
  onLoading: (loading: boolean) => void;
}

const COMPANY_SIZES = ["1-10", "11-50", "51-200", "201-1000", "1000+"];
const BUDGET_RANGES = ["< $5k", "$5k-$20k", "$20k-$50k", "$50k-$100k", "> $100k"];

export function LeadForm({ onResult, onLoading }: Props) {
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        required
        placeholder="Company name"
        value={form.companyName}
        onChange={set("companyName")}
        className="input"
      />
      <input
        required
        placeholder="Contact name"
        value={form.contactName}
        onChange={set("contactName")}
        className="input"
      />
      <input
        required
        placeholder="Industry"
        value={form.industry}
        onChange={set("industry")}
        className="input"
      />
      <select required value={form.companySize} onChange={set("companySize")} className="input">
        <option value="">Company size</option>
        {COMPANY_SIZES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <select required value={form.budgetRange} onChange={set("budgetRange")} className="input">
        <option value="">Budget range</option>
        {BUDGET_RANGES.map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
      </select>
      <textarea
        required
        placeholder="Use case / problem description"
        value={form.useCase}
        onChange={set("useCase")}
        className="input"
        rows={3}
      />
      <input
        placeholder="Website URL (optional)"
        value={form.websiteUrl}
        onChange={set("websiteUrl")}
        className="input"
      />
      <button type="submit" className="btn-primary w-full">
        Analyze Lead
      </button>
    </form>
  );
}
