import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
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
          Sign in
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 40 }}>
          Access is by invitation only.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
