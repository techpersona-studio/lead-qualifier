"use client";
import { useState } from "react";
import Link from "next/link";
import { LeadForm } from "@/components/LeadForm";
import { QualificationResultCard } from "@/components/QualificationResult";
import { ParticleCanvas } from "@/components/ParticleCanvas";
import { AnalyzingView } from "@/components/AnalyzingView";
import type { QualificationResult } from "@/types/lead";

type View = "form" | "analyzing" | "result";

export default function Home() {
  const [view, setView] = useState<View>("form");
  const [result, setResult] = useState<QualificationResult | null>(null);
  const [leadId, setLeadId] = useState<string | null>(null);

  const handleResult = (r: QualificationResult & { id?: string }) => {
    const { id, ...rest } = r;
    setLeadId(id ?? null);
    setResult(rest as QualificationResult);
    setView("result");
  };

  const handleAnalyzing = (v: boolean) => {
    if (v) setView("analyzing");
  };

  const handleReset = () => {
    setResult(null);
    setLeadId(null);
    setView("form");
  };

  return (
    <>
      <ParticleCanvas />

      {/* Wide spotlight beam from top — focused on the heading area */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: "-60px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "1100px",
          height: "700px",
          background: "radial-gradient(ellipse 62% 62% at 50% 0%, rgba(210,205,255,0.16) 0%, rgba(180,172,255,0.07) 35%, rgba(140,132,240,0.02) 60%, transparent 75%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Centered content — vertically centered on viewport */}
      <main
        style={{
          position: "relative",
          zIndex: 1,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "136px 24px 112px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 560 }}>

          {view === "form" && (
            <div key="form" className="view-in">
              {/* Header — "LEAD" gets the spotlight focus */}
              <div style={{ marginBottom: 48 }}>
                <h1
                  className="fade-up fade-up-1"
                  style={{
                    fontSize: "clamp(42px, 6vw, 60px)",
                    fontWeight: 700,
                    letterSpacing: "-0.03em",
                    lineHeight: 1.08,
                    marginBottom: 14,
                  }}
                >
                  {/* "LEAD" is the brightest word — sits under the spotlight cone */}
                  <span style={{ color: "#f5f3ff" }}>Qualify</span>
                  {" "}
                  <span
                    style={{
                      color: "#ffffff",
                      textShadow: "0 0 40px rgba(210,205,255,0.55), 0 0 80px rgba(180,172,255,0.2)",
                    }}
                  >
                    a lead
                  </span>
                </h1>
                <p
                  className="fade-up fade-up-2"
                  style={{
                    fontSize: 13,
                    color: "rgba(240,237,232,0.38)",
                    letterSpacing: "0.01em",
                    lineHeight: 1.65,
                  }}
                >
                  AI-powered scoring across fit, intent, budget, and urgency.
                </p>
              </div>

              <LeadForm onResult={handleResult} onAnalyzing={handleAnalyzing} />
            </div>
          )}

          {view === "analyzing" && (
            <div key="analyzing">
              <AnalyzingView />
            </div>
          )}

          {view === "result" && result && (
            <div key="result" className="view-in">
              <QualificationResultCard result={result} onReset={handleReset} />
              {leadId && (
                <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
                  <Link
                    href={`/leads/${leadId}`}
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: "var(--text-muted)",
                      textDecoration: "none",
                    }}
                  >
                    View in history →
                  </Link>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </>
  );
}
