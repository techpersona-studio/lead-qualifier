import type { Metadata } from "next";
import { Syne, Geist_Mono, Fraunces, Hanken_Grotesk } from "next/font/google";
import { cookies } from "next/headers";
import { Nav } from "@/components/Nav";
import { createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Lead Qualifier",
  description: "AI-powered lead qualification",
};

async function getWorkspaceProps() {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { workspaces: [], activeOrgId: "", isAdmin: false };

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: memberships } = await admin
      .from("org_members")
      .select("org_id, role, orgs(name)")
      .eq("user_id", user.id);

    const cookieStore = await cookies();
    const activeOrgId = cookieStore.get("active_org_id")?.value ?? memberships?.[0]?.org_id ?? "";

    const workspaces = (memberships ?? []).map((m: { org_id: string; role: string; orgs: { name: string }[] | { name: string } | null }) => ({
      orgId: m.org_id,
      orgName: (Array.isArray(m.orgs) ? m.orgs[0]?.name : m.orgs?.name) ?? "Workspace",
    }));

    const activeMembership = memberships?.find((m) => m.org_id === activeOrgId) ?? memberships?.[0];
    const isAdmin = activeMembership?.role === "admin";

    return { workspaces, activeOrgId, isAdmin };
  } catch {
    return { workspaces: [], activeOrgId: "", isAdmin: false };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { workspaces, activeOrgId, isAdmin } = await getWorkspaceProps();

  return (
    <html
      lang="en"
      className={`${syne.variable} ${geistMono.variable} ${fraunces.variable} ${hankenGrotesk.variable} h-full antialiased`}
    >
      <body className="h-full" suppressHydrationWarning>
        <Nav workspaces={workspaces} activeOrgId={activeOrgId} isAdmin={isAdmin} />
        {children}
      </body>
    </html>
  );
}
