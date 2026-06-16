"use client";
import { useState } from "react";
import { LeadForm } from "@/components/LeadForm";
import { QualificationResultCard } from "@/components/QualificationResult";
import type { QualificationResult } from "@/types/lead";

export default function Home() {
  const [result, setResult] = useState<QualificationResult | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Lead Qualifier</h1>
          <p className="text-gray-500 mt-1">Fill in the lead details and click Analyze.</p>
        </div>
        <LeadForm onResult={setResult} onLoading={setLoading} />
        {loading && <p className="text-center text-gray-500">Analyzing lead...</p>}
        {result && <QualificationResultCard result={result} />}
      </div>
    </main>
  );
}
