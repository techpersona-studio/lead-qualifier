"use client";
import { useState } from "react";

interface Workspace {
  orgId: string;
  orgName: string;
}

interface Props {
  workspaces: Workspace[];
  activeOrgId: string;
}

export function WorkspaceSwitcher({ workspaces, activeOrgId }: Props) {
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const active = workspaces.find((w) => w.orgId === activeOrgId) ?? workspaces[0];

  if (workspaces.length <= 1) {
    return (
      <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "var(--text-muted)" }}>
        {active?.orgName ?? "Workspace"}
      </span>
    );
  }

  const switchTo = async (orgId: string) => {
    if (orgId === activeOrgId) { setOpen(false); return; }
    setSwitching(true);
    await fetch("/api/org/switch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgId }),
    });
    window.location.reload();
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={switching}
        style={{
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.1em",
          color: "var(--text-muted)",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        {active?.orgName ?? "Workspace"}
        <span style={{ fontSize: 8 }}>▼</span>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            background: "rgba(14,16,26,0.98)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            padding: "4px 0",
            minWidth: 180,
            zIndex: 100,
            backdropFilter: "blur(12px)",
          }}
        >
          {workspaces.map((w) => (
            <button
              key={w.orgId}
              onClick={() => switchTo(w.orgId)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "8px 16px",
                fontSize: 12,
                fontWeight: w.orgId === activeOrgId ? 700 : 400,
                color: w.orgId === activeOrgId ? "var(--text-primary)" : "var(--text-secondary)",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              {w.orgName}
              {w.orgId === activeOrgId && (
                <span style={{ marginLeft: 8, fontSize: 10, color: "var(--text-muted)" }}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
