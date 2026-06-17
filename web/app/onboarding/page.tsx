import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { OnboardingForm } from "./OnboardingForm";

export default async function OnboardingPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Already has an org — skip onboarding
  const { data: memberships } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", user.id)
    .limit(1);

  if (memberships?.[0]) redirect("/");

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        position: "relative",
      }}
    >
      <div aria-hidden="true" className="page-spotlight" />
      <div style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 1 }}>
        <div style={{ marginBottom: 40 }}>
          <span className="wordmark">Lead Qualifier</span>
        </div>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            marginBottom: 8,
            color: "var(--text-primary)",
          }}
        >
          Name your workspace
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 40 }}>
          This is your team's shared space. You can invite teammates after setup.
        </p>
        <OnboardingForm />
      </div>
    </main>
  );
}
