import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100dvh - var(--navbar-h))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f0fdf4 0%, #ffffff 55%, #f8fafc 100%)",
        padding: "2rem var(--content-pad)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background blobs */}
      <div style={{
        position: "absolute", top: "-80px", right: "-60px",
        width: 360, height: 360, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(34,197,94,0.10) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-60px", left: "-40px",
        width: 280, height: 280, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(14,165,233,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "white",
          borderRadius: "var(--radius-2xl)",
          boxShadow: "var(--shadow-xl)",
          border: "1px solid var(--gray-100)",
          padding: "2.5rem",
          position: "relative",
          zIndex: 1,
        }}
        className="animate-scale-in"
      >
        {/* Brand mark */}
        <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
          <div style={{
            width: 48, height: 48,
            background: "var(--brand-500)",
            borderRadius: "var(--radius-lg)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.5rem",
            margin: "0 auto 1rem",
            boxShadow: "var(--shadow-brand)",
          }}>
            🤝
          </div>
          <h2 style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "1.625rem",
            color: "var(--gray-900)",
            letterSpacing: "-0.025em",
            margin: "0 0 0.25rem",
          }}>
            Welcome back
          </h2>
          <p style={{ fontSize: "0.9rem", color: "var(--gray-500)", margin: 0 }}>
            Sign in to your community
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: "#fff1f2",
              border: "1px solid #fecdd3",
              borderRadius: "var(--radius-md)",
              padding: "0.625rem 0.875rem",
              marginBottom: "1.25rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
            className="animate-fade-down"
          >
            <span style={{ fontSize: "0.875rem" }}>⚠️</span>
            <p style={{ fontSize: "0.875rem", color: "var(--accent-rose)", margin: 0, fontWeight: 500 }}>
              {error}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label className="label">Email address</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="label">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%", marginTop: "0.5rem", padding: "0.75rem" }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <LoadingSpinner /> Signing in...
              </span>
            ) : (
              "Sign in →"
            )}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--gray-500)", marginTop: "1.5rem" }}>
          Don't have an account?{" "}
          <Link
            to="/register"
            style={{ color: "var(--brand-600)", fontWeight: 600, textDecoration: "none" }}
          >
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
};

const LoadingSpinner = () => (
  <svg
    width="16" height="16" viewBox="0 0 16 16" fill="none"
    style={{ animation: "spin 0.7s linear infinite" }}
  >
    <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
    <path d="M8 2a6 6 0 0 1 6 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </svg>
);

export default Login;
