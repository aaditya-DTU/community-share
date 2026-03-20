import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div style={{ fontFamily: "var(--font-body)", overflowX: "hidden" }}>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section
        style={{
          minHeight: "calc(100dvh - var(--navbar-h))",
          background: "linear-gradient(135deg, #f0fdf4 0%, #ffffff 50%, #f8fafc 100%)",
          display: "flex",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background blobs */}
        <div style={{
          position: "absolute", top: "-120px", right: "-80px",
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "-100px", left: "-60px",
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div className="content-container" style={{ paddingTop: "4rem", paddingBottom: "4rem", position: "relative" }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4rem",
            alignItems: "center",
          }}
          className="hero-grid"
          >
            {/* Left — copy */}
            <div className="animate-fade-up">
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  background: "var(--brand-100)",
                  color: "var(--brand-700)",
                  padding: "0.375rem 0.875rem",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  marginBottom: "1.5rem",
                  border: "1px solid var(--brand-200)",
                }}
              >
                🌱 Community-powered sharing
              </div>

              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "clamp(2.25rem, 5vw, 3.75rem)",
                  lineHeight: 1.08,
                  color: "var(--gray-900)",
                  letterSpacing: "-0.03em",
                  marginBottom: "1.25rem",
                }}
              >
                Share more,<br />
                <span style={{ color: "var(--brand-500)" }}>buy less.</span>
              </h1>

              <p
                style={{
                  fontSize: "clamp(1rem, 2vw, 1.175rem)",
                  color: "var(--gray-500)",
                  lineHeight: 1.7,
                  maxWidth: 480,
                  marginBottom: "2rem",
                }}
              >
                Borrow items from neighbours, lend what you rarely use,
                and build genuine trust within your local community.
              </p>

              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <Link
                  to={user ? "/home" : "/register"}
                  className="btn btn-primary btn-lg"
                  style={{ textDecoration: "none" }}
                >
                  {user ? "Browse items →" : "Start for free →"}
                </Link>
                {!user && (
                  <Link
                    to="/login"
                    className="btn btn-outline btn-lg"
                    style={{ textDecoration: "none" }}
                  >
                    Sign in
                  </Link>
                )}
              </div>

              {/* Social proof */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  marginTop: "2rem",
                  flexWrap: "wrap",
                }}
              >
                {[
                  { val: "100%", label: "Free to use" },
                  { val: "⭐ Trust", label: "Score system" },
                  { val: "📍 Local", label: "Geo discovery" },
                ].map(({ val, label }) => (
                  <div key={label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.9375rem", color: "var(--gray-800)" }}>{val}</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — visual card stack */}
            <div
              className="animate-fade-up delay-200 hero-visual"
              style={{ position: "relative", height: 420, display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              {/* Back card */}
              <div style={{
                position: "absolute",
                top: 30, left: 30,
                width: "85%",
                background: "white",
                borderRadius: "var(--radius-xl)",
                boxShadow: "var(--shadow-md)",
                border: "1px solid var(--gray-100)",
                padding: "1.5rem",
                transform: "rotate(-3deg)",
                opacity: 0.7,
              }}>
                <div style={{ height: 12, width: "60%", borderRadius: 6, background: "var(--gray-100)", marginBottom: 8 }} />
                <div style={{ height: 10, width: "80%", borderRadius: 6, background: "var(--gray-100)" }} />
              </div>

              {/* Main card */}
              <div style={{
                position: "relative",
                width: "85%",
                background: "white",
                borderRadius: "var(--radius-xl)",
                boxShadow: "var(--shadow-xl)",
                border: "1px solid var(--gray-100)",
                padding: "1.75rem",
                zIndex: 2,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <span className="badge badge-green">Available</span>
                  <span style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>0.3 km away</span>
                </div>

                <div style={{
                  height: 120,
                  background: "linear-gradient(135deg, var(--brand-50), var(--brand-100))",
                  borderRadius: "var(--radius-lg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "3rem",
                  marginBottom: "1rem",
                }}>
                  🔧
                </div>

                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", color: "var(--gray-900)", margin: "0 0 0.25rem" }}>
                  Power Drill
                </h3>
                <p style={{ fontSize: "0.8125rem", color: "var(--gray-500)", margin: "0 0 1rem" }}>
                  Bosch GSB 550 · Excellent condition
                </p>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: "50%",
                      background: "var(--brand-100)", color: "var(--brand-700)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.65rem", fontWeight: 700,
                    }}>RK</div>
                    <span style={{ fontSize: "0.8125rem", color: "var(--gray-600)", fontWeight: 500 }}>Rahul K.</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--accent-amber)" }}>⭐ 4.8</span>
                  </div>
                  <button className="btn btn-primary btn-sm">Request</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────── */}
      <section style={{ background: "white", padding: "5rem 0" }}>
        <div className="content-container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }} className="animate-fade-up">
            <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--brand-600)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
              Simple process
            </p>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, color: "var(--gray-900)", letterSpacing: "-0.025em" }}>
              How it works
            </h2>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "1.5rem",
            position: "relative",
          }}
          className="steps-grid"
          >
            {/* Connector line */}
            <div style={{
              position: "absolute",
              top: 36, left: "12%", right: "12%",
              height: 2,
              background: "linear-gradient(90deg, var(--brand-200), var(--brand-100))",
              zIndex: 0,
            }}
            className="steps-line"
            />

            {[
              { emoji: "🔍", title: "Discover",    desc: "Find items shared by neighbours near you",       delay: "delay-100" },
              { emoji: "📨", title: "Request",     desc: "Send a borrow request with a message",           delay: "delay-200" },
              { emoji: "🔁", title: "Use & Return",desc: "Borrow, use it, then return on time",            delay: "delay-300" },
              { emoji: "🛡️", title: "Build Trust", desc: "Leave reviews and grow your trust score",       delay: "delay-400" },
            ].map(({ emoji, title, desc, delay }, i) => (
              <div
                key={title}
                className={`animate-fade-up ${delay}`}
                style={{
                  background: "var(--gray-50)",
                  borderRadius: "var(--radius-xl)",
                  padding: "1.75rem 1.25rem",
                  textAlign: "center",
                  border: "1px solid var(--gray-100)",
                  position: "relative",
                  zIndex: 1,
                  transition: "transform var(--duration-base) var(--ease-smooth), box-shadow var(--duration-base) var(--ease-smooth)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "var(--shadow-md)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{
                  width: 56, height: 56,
                  borderRadius: "var(--radius-full)",
                  background: "white",
                  border: "2px solid var(--brand-200)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.5rem",
                  margin: "0 auto 1rem",
                  boxShadow: "var(--shadow-sm)",
                }}>
                  {emoji}
                </div>
                <div style={{
                  position: "absolute", top: 16, right: 16,
                  width: 20, height: 20,
                  borderRadius: "50%",
                  background: "var(--brand-500)",
                  color: "white",
                  fontSize: "0.65rem",
                  fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {i + 1}
                </div>
                <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", color: "var(--gray-900)", marginBottom: "0.5rem" }}>
                  {title}
                </h4>
                <p style={{ fontSize: "0.875rem", color: "var(--gray-500)", lineHeight: 1.6, margin: 0 }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section style={{ padding: "5rem 0", background: "var(--gray-50)" }}>
        <div className="content-container">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <p style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--brand-600)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.5rem" }}>
              Why CommunityShare
            </p>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, color: "var(--gray-900)", letterSpacing: "-0.025em" }}>
              Built on trust
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.25rem" }} className="features-grid">
            {[
              { icon: "💰", title: "Save money",        desc: "Borrow instead of buying things you'll rarely use again." },
              { icon: "🌱", title: "Reduce waste",       desc: "Give idle items a purpose and keep them out of landfills." },
              { icon: "📍", title: "Hyper-local",        desc: "Discover items within walking distance using geo search." },
              { icon: "⭐", title: "Trust & safety",     desc: "Reviews and trust scores ensure every interaction is accountable." },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="card animate-fade-up"
                style={{ padding: "1.5rem", display: "flex", gap: "1rem", alignItems: "flex-start" }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: "var(--radius-lg)",
                  background: "var(--brand-100)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.25rem", flexShrink: 0,
                }}>
                  {icon}
                </div>
                <div>
                  <h4 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", color: "var(--gray-900)", marginBottom: "0.25rem" }}>
                    {title}
                  </h4>
                  <p style={{ fontSize: "0.875rem", color: "var(--gray-500)", margin: 0, lineHeight: 1.6 }}>
                    {desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section
        style={{
          padding: "5rem 0",
          background: "linear-gradient(135deg, var(--brand-600) 0%, var(--brand-700) 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{
          position: "absolute", top: "-80px", right: "-40px",
          width: 300, height: 300, borderRadius: "50%",
          background: "rgba(255,255,255,0.06)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: "-60px", left: "10%",
          width: 200, height: 200, borderRadius: "50%",
          background: "rgba(255,255,255,0.04)",
          pointerEvents: "none",
        }} />

        <div className="content-container" style={{ textAlign: "center", position: "relative" }}>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              color: "white",
              letterSpacing: "-0.025em",
              marginBottom: "0.75rem",
            }}
          >
            Ready to start sharing?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1.0625rem", marginBottom: "2rem" }}>
            Join your community. Borrow smarter. Live lighter.
          </p>
          <Link
            to={user ? "/home" : "/register"}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "white",
              color: "var(--brand-700)",
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: "1rem",
              padding: "0.875rem 2rem",
              borderRadius: "var(--radius-lg)",
              textDecoration: "none",
              boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
              transition: "transform var(--duration-base) var(--ease-smooth), box-shadow var(--duration-base) var(--ease-smooth)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.15)";
            }}
          >
            {user ? "Browse items →" : "Get started free →"}
          </Link>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .hero-visual { display: none !important; }
          .steps-grid { grid-template-columns: 1fr 1fr !important; }
          .steps-line { display: none !important; }
          .features-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .steps-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
