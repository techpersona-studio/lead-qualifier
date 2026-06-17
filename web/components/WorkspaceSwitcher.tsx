"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Workspace {
  orgId: string;
  orgName: string;
}

interface Props {
  workspaces: Workspace[];
  activeOrgId: string;
}

const chevron = (
  <svg width="8" height="5" viewBox="0 0 8 5" fill="none" style={{ flexShrink: 0 }}>
    <path d="M1 1L4 4L7 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function WorkspaceSwitcher({ workspaces, activeOrgId }: Props) {
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const router = useRouter();
  const active = workspaces.find((w) => w.orgId === activeOrgId) ?? workspaces[0];

  const switchTo = async (orgId: string) => {
    setOpen(false);
    if (orgId === activeOrgId) return;
    setSwitching(true);
    await fetch("/api/org/switch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgId }),
    });
    window.location.reload();
  };

  const handleCreateWorkspace = () => {
    setOpen(false);
    router.push("/onboarding");
  };

  const triggerStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "var(--text-secondary)",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 6,
    cursor: switching ? "not-allowed" : "pointer",
    padding: "5px 10px 5px 12px",
    display: "flex",
    alignItems: "center",
    gap: 7,
    transition: "background 150ms ease, border-color 150ms ease, color 150ms ease",
  };

  const dropdownStyle: React.CSSProperties = {
    position: "absolute",
    top: "calc(100% + 6px)",
    left: "50%",
    transform: "translateX(-50%)",
    background: "rgba(10,12,20,0.98)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 8,
    padding: "4px 0",
    minWidth: 200,
    zIndex: 100,
    backdropFilter: "blur(16px)",
    animation: "dropdownIn 140ms cubic-bezier(0.22,1,0.36,1) forwards",
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={switching}
        style={triggerStyle}
        onMouseEnter={(e) => {
          if (!switching) {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.15)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--text-primary)";
          }
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.09)";
          (e.currentTarget as HTMLButtonElement).style.color = "var(--text-secondary)";
        }}
      >
        {active?.orgName ?? "Workspace"}
        {chevron}
      </button>

      {open && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 99 }}
            onClick={() => setOpen(false)}
          />
          <div style={dropdownStyle}>
            {workspaces.map((w) => (
              <button
                key={w.orgId}
                onClick={() => switchTo(w.orgId)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "9px 16px",
                  fontSize: 12,
                  fontWeight: w.orgId === activeOrgId ? 700 : 400,
                  color: w.orgId === activeOrgId ? "var(--text-primary)" : "var(--text-secondary)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  letterSpacing: "0.02em",
                }}
              >
                {w.orgName}
                {w.orgId === activeOrgId && (
                  <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                    <path d="M1 4.5L4.5 8L11 1" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            ))}
            <div style={{ margin: "4px 12px", height: 1, background: "rgba(255,255,255,0.06)" }} />
            <button
              onClick={handleCreateWorkspace}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "9px 16px",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              + New workspace
            </button>
          </div>
        </>
      )}
    </div>
  );
}
