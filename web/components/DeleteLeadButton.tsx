"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

interface Props {
  leadId: string;
  companyName: string;
  redirectTo?: string;
  variant?: "button" | "inline";
}

export function DeleteLeadButton({
  leadId,
  companyName,
  redirectTo = "/leads",
  variant = "button",
}: Props) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/leads/${leadId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Delete failed");
      }
      setConfirmOpen(false);
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const triggerStyle: React.CSSProperties =
    variant === "inline"
      ? {
          background: "transparent",
          border: "none",
          padding: "4px 8px",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "rgba(248, 113, 113, 0.75)",
          cursor: "pointer",
        }
      : {
          background: "transparent",
          border: "1px solid rgba(248, 113, 113, 0.35)",
          borderRadius: 6,
          padding: "10px 16px",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "rgba(248, 113, 113, 0.9)",
          cursor: "pointer",
        };

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setConfirmOpen(true);
        }}
        style={triggerStyle}
      >
        Remove
      </button>

      {confirmOpen && createPortal(
        <>
          <div
            onClick={() => !deleting && setConfirmOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 99998,
              background: "rgba(6, 8, 16, 0.72)",
              cursor: "default",
            }}
          />
          <div
            role="dialog"
            aria-labelledby="delete-lead-title"
            aria-modal="true"
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 99999,
              width: "min(440px, calc(100vw - 48px))",
              padding: 24,
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 8,
              background: "#0d1120",
              boxShadow: "0 24px 64px rgba(0,0,0,0.45)",
            }}
          >
            <p id="delete-lead-title" style={{ margin: "0 0 8px", color: "var(--text-primary)", fontSize: 16, fontWeight: 600 }}>
              Remove lead?
            </p>
            <p style={{ margin: "0 0 16px", color: "rgba(240,237,232,0.75)", lineHeight: 1.5 }}>
              This permanently removes {companyName} and any linked opportunity maps. This cannot be undone.
            </p>
            {error && (
              <p style={{ margin: "0 0 16px", color: "#f87171", fontSize: 14 }}>{error}</p>
            )}
            <div style={{ display: "flex", gap: 12 }}>
              <button
                type="button"
                className="btn-primary"
                onClick={handleDelete}
                disabled={deleting}
                style={{ background: "rgba(248, 113, 113, 0.15)", borderColor: "rgba(248, 113, 113, 0.35)" }}
              >
                {deleting ? "Removing…" : "Remove lead"}
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)" }}
                onClick={() => setConfirmOpen(false)}
                disabled={deleting}
              >
                Cancel
              </button>
            </div>
          </div>
        </>,
        document.body,
      )}
    </>
  );
}
