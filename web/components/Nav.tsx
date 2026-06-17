"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export function Nav() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 40px",
        zIndex: 20,
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: "rgba(5,8,15,0.85)",
        backdropFilter: "blur(12px)",
      }}
    >
      <span className="wordmark">Lead Qualifier</span>

      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <Link
          href="/"
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            textDecoration: "none",
          }}
        >
          New Lead
        </Link>
        <Link
          href="/leads"
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            textDecoration: "none",
          }}
        >
          Leads
        </Link>
        <button
          data-testid="signout-button"
          onClick={handleSignOut}
          className="btn-secondary"
          style={{ padding: "8px 18px", fontSize: 10 }}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
