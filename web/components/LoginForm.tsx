"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        return;
      }
      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      <div>
        <label className="field-label" htmlFor="email">Email</label>
        <input
          id="email"
          data-testid="email-input"
          type="email"
          required
          autoComplete="email"
          className="field-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
        />
      </div>
      <div>
        <label className="field-label" htmlFor="password">Password</label>
        <input
          id="password"
          data-testid="password-input"
          type="password"
          required
          autoComplete="current-password"
          className="field-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
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
        data-testid="signin-button"
        disabled={loading}
        className="btn-primary"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
