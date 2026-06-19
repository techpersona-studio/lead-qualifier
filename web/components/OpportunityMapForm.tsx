"use client";

import { useCallback, useRef, useState } from "react";
import type { OpportunityMap } from "@/types/opportunity-map";

interface LeadOption {
  id: string;
  company_name: string;
  contact_name: string;
  grade: string | null;
  score: number | null;
}

interface Props {
  leads: LeadOption[];
}

const ACCEPTED_EXTENSIONS = [".txt", ".md"];
const ACCEPTED_TYPES = "text/plain,text/markdown,.txt,.md";

function isAcceptedFile(file: File): boolean {
  const lowerName = file.name.toLowerCase();
  return ACCEPTED_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
}

export function OpportunityMapForm({ leads }: Props) {
  const [leadId, setLeadId] = useState(leads[0]?.id ?? "");
  const [conversation, setConversation] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const readFiles = useCallback(async (files: FileList | File[] | null) => {
    if (!files?.length) return;

    const accepted = Array.from(files).filter(isAcceptedFile);
    if (accepted.length === 0) {
      setError("Only .txt and .md files are supported.");
      return;
    }

    const chunks = await Promise.all(accepted.map((file) => file.text()));
    setConversation((prev) => [prev, ...chunks].filter(Boolean).join("\n\n").trim());
    setUploadedFiles((prev) => [...prev, ...accepted.map((file) => file.name)]);
    setError(null);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    await readFiles(e.dataTransfer.files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId || !conversation.trim()) {
      setError("Select a lead and provide the call conversation.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/opportunity-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, conversation }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Generation failed");
      }
      window.location.href = `/opportunity-map/${data.id}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (leads.length === 0) {
    return (
      <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
        No leads yet. Qualify a lead first, then return here to generate an opportunity map.
      </p>
    );
  }

  const hasContent = conversation.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div>
        <label className="field-label">Lead</label>
        <select
          className="field-input"
          value={leadId}
          onChange={(e) => setLeadId(e.target.value)}
          required
          style={{ width: "100%" }}
        >
          {leads.map((lead) => (
            <option key={lead.id} value={lead.id}>
              {lead.company_name} ({lead.contact_name})
              {lead.grade ? ` — ${lead.grade}` : ""}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="field-label">Call conversation</label>
        <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12, lineHeight: 1.5 }}>
          Paste a transcript or drop context files. Long conversations are supported.
        </p>

        <div
          className={`file-drop-zone${isDragging ? " file-drop-zone--active" : ""}${hasContent ? " file-drop-zone--filled" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES}
            multiple
            hidden
            onChange={(e) => {
              void readFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <p className="file-drop-zone__title">
            {isDragging ? "Drop files here" : "Drag and drop .txt or .md files"}
          </p>
          <p className="file-drop-zone__hint">or click to browse</p>
          {uploadedFiles.length > 0 && (
            <ul className="file-drop-zone__files">
              {uploadedFiles.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          )}
        </div>

        <textarea
          className="field-input"
          value={conversation}
          onChange={(e) => setConversation(e.target.value)}
          placeholder="Paste the discovery call transcript here, or add files above."
          rows={12}
          required
          style={{ width: "100%", resize: "vertical", minHeight: 220, marginTop: 16 }}
        />
      </div>

      {error && (
        <p style={{ color: "#f87171", fontSize: 14, margin: 0 }}>{error}</p>
      )}

      <button type="submit" disabled={submitting} className="btn-primary" data-loading={submitting}>
        {submitting ? "Generating map…" : "Generate opportunity map"}
      </button>
    </form>
  );
}

export function OpportunityMapReport({ map }: { map: OpportunityMap }) {
  return (
    <article className="opportunity-map-report">
      <header style={{ marginBottom: 40 }}>
        <p style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 12 }}>
          Opportunity map
        </p>
        <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16, color: "var(--text-primary)" }}>
          {map.client.businessName}
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: "rgba(240,237,232,0.88)", marginBottom: 20 }}>
          {map.summary}
        </p>
        <div
          style={{
            padding: 20,
            borderRadius: 8,
            border: "1px solid rgba(180,170,255,0.25)",
            background: "rgba(180,170,255,0.08)",
          }}
        >
          <p style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>
            Recommended first move
          </p>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: "var(--text-primary)" }}>
            {map.recommendedFirstMove}
          </p>
        </div>
      </header>

      <section style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {map.opportunities.map((opportunity) => (
          <div
            key={opportunity.rank}
            style={{
              padding: 24,
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 12, flexWrap: "wrap" }}>
              <h2 style={{ margin: 0, fontSize: 20, color: "var(--text-primary)" }}>
                #{opportunity.rank} {opportunity.title}
              </h2>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>ICE {opportunity.iceScore}/10</span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    padding: "4px 10px",
                    borderRadius: 999,
                    background: "rgba(180,170,255,0.15)",
                    color: "rgba(210,205,255,0.95)",
                  }}
                >
                  {opportunity.grade}
                </span>
              </div>
            </div>

            <p style={{ margin: "0 0 12px", color: "rgba(240,237,232,0.75)", lineHeight: 1.6 }}>
              <strong style={{ color: "var(--text-primary)" }}>Problem:</strong> {opportunity.problem}
            </p>
            <p style={{ margin: "0 0 12px", color: "rgba(240,237,232,0.75)", lineHeight: 1.6 }}>
              <strong style={{ color: "var(--text-primary)" }}>Proposed service:</strong> {opportunity.proposedService}
            </p>
            <p style={{ margin: "0 0 12px", color: "rgba(240,237,232,0.88)", lineHeight: 1.6 }}>
              <strong style={{ color: "var(--text-primary)" }}>Expected outcome:</strong> {opportunity.expectedOutcome}
            </p>
            <p style={{ margin: "0 0 12px", color: "rgba(240,237,232,0.75)", lineHeight: 1.6 }}>
              <strong style={{ color: "var(--text-primary)" }}>Effort:</strong> {opportunity.effort}
            </p>
            <p style={{ margin: "0 0 12px", color: "rgba(240,237,232,0.75)", lineHeight: 1.6 }}>
              <strong style={{ color: "var(--text-primary)" }}>Risks:</strong> {opportunity.risks}
            </p>
            <p style={{ margin: 0, color: "rgba(240,237,232,0.88)", lineHeight: 1.6 }}>
              <strong style={{ color: "var(--text-primary)" }}>Next action:</strong> {opportunity.nextAction}
            </p>
          </div>
        ))}
      </section>

      {map.flags.length > 0 && (
        <section style={{ marginTop: 32 }}>
          <h3 style={{ fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 12 }}>
            Flags
          </h3>
          <ul style={{ margin: 0, paddingLeft: 18, color: "rgba(240,237,232,0.75)" }}>
            {map.flags.map((flag) => (
              <li key={flag}>{flag}</li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
