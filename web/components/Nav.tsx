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
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 40px",
        zIndex: 20,
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
        background: scrolled ? "rgba(5,8,15,0.65)" : "rgba(5,8,15,0.92)",
        backdropFilter: "blur(12px)",
        transition: "background 0.2s ease, border-color 0.2s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span className="wordmark">Lead Qualifier</span>
        {workspaces.length > 0 && (
          <WorkspaceSwitcher workspaces={workspaces} activeOrgId={activeOrgId} />
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        <Link
          href="/"
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--text-secondary)",
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
            color: "var(--text-secondary)",
            textDecoration: "none",
          }}
        >
          Leads
        </Link>
        {isAdmin && (
          <Link
            href="/settings/members"
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--text-secondary)",
              textDecoration: "none",
            }}
          >
            Team
          </Link>
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
