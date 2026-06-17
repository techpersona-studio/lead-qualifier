"use client";
import { useState } from "react";
import { LeadForm } from "@/components/LeadForm";
import { QualificationResultCard } from "@/components/QualificationResult";
import type { QualificationResult } from "@/types/lead";

export default function Home() {
  const [result, setResult] = useState<QualificationResult | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <main className="flex min-h-screen lg:h-screen">
      {/* Left panel — form */}
      <div
        className="flex flex-col w-full lg:w-[45%] lg:sticky lg:top-0 lg:h-screen overflow-y-auto px-8 lg:px-12 py-14"
        style={{ background: "var(--bg-left)" }}
      >
        {/* Wordmark */}
        <p
          className="mb-10 text-[11px] font-medium tracking-[0.12em] uppercase"
          style={{ color: "var(--text-secondary)" }}
        >
          Lead Qualifier
        </p>

        <h1
          className="mb-8 text-2xl font-medium leading-snug"
          style={{ color: "var(--text-primary)" }}
        >
          Qualify a lead
        </h1>

        <LeadForm onResult={setResult} onLoading={setLoading} isLoading={loading} />
      </div>

      {/* Divider */}
      <div className="hidden lg:block w-px self-stretch" style={{ background: "var(--divider)" }} />

      {/* Right panel — result */}
      <div
        className="flex-1 px-8 lg:px-12 py-14"
        style={{ background: "var(--bg-right)" }}
      >
        <QualificationResultCard result={result} />
      </div>
    </main>
  );
}
