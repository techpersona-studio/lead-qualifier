"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function OnboardingForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/org/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const { error } = await res.json();
        setError(error ?? "Failed to create workspace.");
        return;
      }
      window.location.href = "/";
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <label className="field-label" htmlFor="workspace-name">Workspace name</label>
        <input
          id="workspace-name"
          type="text"
          required
          className="field-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Acme Inc."
          autoFocus
        />
      </div>

      {error && (
        <p
          role="alert"
          aria-live="polite"
          style={{ fontSize: 13, color: "rgba(255, 100, 100, 0.85)", marginTop: -8 }}
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !name.trim()}
        className="btn-primary"
      >
        {loading ? "Creating…" : "Create workspace"}
      </button>
    </form>
  );
}
