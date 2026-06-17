"use client";
import { useState } from "react";

interface Member {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

interface Props {
  members: Member[];
  isAdmin: boolean;
  currentUserId: string;
}

export function MembersClient({ members: initial, isAdmin, currentUserId }: Props) {
  const [members, setMembers] = useState(initial);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteStatus, setInviteStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [inviteError, setInviteError] = useState<string | null>(null);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteStatus("sending");
    setInviteError(null);
    try {
      const res = await fetch("/api/org/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        setInviteError(error ?? "Failed to send invite.");
        setInviteStatus("error");
        return;
      }
      setInviteEmail("");
      setInviteStatus("sent");
    } catch {
      setInviteError("Network error.");
      setInviteStatus("error");
    }
  };

  const handleRemove = async (memberId: string) => {
    const res = await fetch(`/api/org/members/${memberId}`, { method: "DELETE" });
    if (res.ok) {
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            {["User", "Role", "Joined", ...(isAdmin ? [""] : [])].map((h) => (
              <th
                key={h}
                style={{
                  padding: "0 0 12px",
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  textAlign: "left",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {members.map((m) => {
            const joined = new Date(m.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            return (
              <tr
                key={m.id}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
              >
                <td style={{ padding: "14px 0", fontSize: 13, color: "var(--text-primary)", fontFamily: "var(--font-geist-mono)" }}>
                  {m.user_id}
                </td>
                <td style={{ padding: "14px 16px", fontSize: 12, color: "var(--text-muted)", textTransform: "capitalize" }}>
                  {m.role}
                </td>
                <td style={{ padding: "14px 16px", fontSize: 12, color: "var(--text-muted)" }}>
                  {joined}
                </td>
                {isAdmin && (
                  <td style={{ padding: "14px 0", textAlign: "right" }}>
                    {m.user_id !== currentUserId && (
                      <button
                        onClick={() => handleRemove(m.id)}
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          letterSpacing: "0.14em",
                          textTransform: "uppercase",
                          background: "transparent",
                          border: "1px solid rgba(255,80,80,0.25)",
                          color: "rgba(255,100,100,0.65)",
                          borderRadius: 2,
                          padding: "5px 12px",
                          cursor: "pointer",
                          transition: "border-color 150ms, color 150ms",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "rgba(255,80,80,0.5)";
                          e.currentTarget.style.color = "rgba(255,100,100,0.9)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "rgba(255,80,80,0.25)";
                          e.currentTarget.style.color = "rgba(255,100,100,0.65)";
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>

      {isAdmin && (
        <div>
          <div
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              marginBottom: 16,
            }}
          >
            Invite a member
          </div>
          <form onSubmit={handleInvite} style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>
            <div style={{ flex: 1 }}>
              <input
                type="email"
                required
                className="field-input"
                placeholder="colleague@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={inviteStatus === "sending"}
              className="btn-secondary"
              style={{ padding: "12px 24px", flexShrink: 0 }}
            >
              {inviteStatus === "sending" ? "Sending…" : "Send invite"}
            </button>
          </form>
          {inviteStatus === "sent" && (
            <p style={{ fontSize: 13, color: "var(--accent)", marginTop: 12 }}>
              Invite sent.
            </p>
          )}
          {inviteStatus === "error" && inviteError && (
            <p role="alert" style={{ fontSize: 13, color: "rgba(255,100,100,0.85)", marginTop: 12 }}>
              {inviteError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
