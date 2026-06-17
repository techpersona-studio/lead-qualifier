import type { Metadata } from "next";
import { Syne, Geist_Mono } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Lead Qualifier",
  description: "AI-powered lead qualification",
};

async function getWorkspaceProps() {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { workspaces: [], activeOrgId: "" };

    const admin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data: memberships } = await admin
      .from("org_members")
      .select("org_id, orgs(name)")
      .eq("user_id", user.id);

    const cookieStore = await cookies();
    const activeOrgId = cookieStore.get("active_org_id")?.value ?? memberships?.[0]?.org_id ?? "";

    const workspaces = (memberships ?? []).map((m: { org_id: string; orgs: { name: string }[] | { name: string } | null }) => ({
      orgId: m.org_id,
      orgName: (Array.isArray(m.orgs) ? m.orgs[0]?.name : m.orgs?.name) ?? "Workspace",
    }));

    return { workspaces, activeOrgId };
  } catch {
    return { workspaces: [], activeOrgId: "" };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { workspaces, activeOrgId } = await getWorkspaceProps();

  return (
    <html
      lang="en"
      className={`${syne.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full" suppressHydrationWarning>
        <Nav workspaces={workspaces} activeOrgId={activeOrgId} />
        {children}
      </body>
    </html>
  );
}
