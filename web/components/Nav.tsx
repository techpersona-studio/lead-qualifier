"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { getNavVisibility } from "@/lib/nav";
import { WorkspaceSwitcher } from "@/components/WorkspaceSwitcher";

interface Workspace { orgId: string; orgName: string; }

interface NavProps {
  workspaces: Workspace[];
  activeOrgId: string;
  isAdmin: boolean;
}

function AgencyLogo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2.5, width: 16, height: 16 }}>
        <div style={{ background: "var(--accent)", borderRadius: 2, opacity: 0.9 }} />
        <div style={{ background: "var(--accent)", borderRadius: 2, opacity: 0.35 }} />
        <div style={{ background: "var(--accent)", borderRadius: 2, opacity: 0.35 }} />
        <div style={{ background: "var(--accent)", borderRadius: 2, opacity: 0.1 }} />
      </div>
      <span>
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "rgba(240, 237, 232, 0.65)",
        }}>
          TechPersona
        </span>
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          marginLeft: 5,
        }}>
          Studio
        </span>
      </span>
    </div>
  );
}

const linkStyle = (active: boolean): React.CSSProperties => ({
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: active ? "var(--text-primary)" : "var(--text-secondary)",
  textDecoration: "none",
  transition: "color 150ms ease",
});

export function Nav({ workspaces, activeOrgId, isAdmin }: NavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user as { id: string } | null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user as { id: string } | null ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { showNav, showSignOut } = getNavVisibility(pathname, user);

  if (!showNav) return null;

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
        display: "grid",
        gridTemplateColumns: "1fr auto 1fr",
        alignItems: "center",
        padding: "0 40px",
        zIndex: 20,
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
        background: scrolled ? "rgba(5,8,15,0.65)" : "rgba(5,8,15,0.92)",
        backdropFilter: "blur(12px)",
        transition: "background 0.2s ease, border-color 0.2s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <AgencyLogo />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        {workspaces.length > 0 && (
          <WorkspaceSwitcher workspaces={workspaces} activeOrgId={activeOrgId} />
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 32, justifyContent: "flex-end" }}>
        <Link href="/" style={linkStyle(pathname === "/")}>New Lead</Link>
        <Link href="/leads" style={linkStyle(pathname === "/leads")}>Leads</Link>
        {isAdmin && (
          <Link href="/settings/members" style={linkStyle(pathname.startsWith("/settings"))}>Team</Link>
        )}
        {showSignOut && (
          <button
            data-testid="signout-button"
            onClick={handleSignOut}
            className="btn-secondary"
            style={{ padding: "8px 18px", fontSize: 10 }}
          >
            Sign out
          </button>
        )}
      </div>
    </nav>
  );
}
