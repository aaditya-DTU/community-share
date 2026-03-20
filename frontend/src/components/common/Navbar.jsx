import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "./NotificationBell";
import ProfileMenu from "./ProfileMenu";

const NAV_LINKS = [
  { to: "/home",     label: "Browse" },
  { to: "/dashboard", label: "Dashboard" },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mobileRef = useRef(null);

  // Shadow on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setMobileOpen(false), [location.pathname]);

  // Close on outside click
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e) => {
      if (mobileRef.current && !mobileRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [mobileOpen]);

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      ref={mobileRef}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        height: "var(--navbar-h)",
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: `1px solid ${scrolled ? "var(--gray-200)" : "var(--gray-100)"}`,
        boxShadow: scrolled ? "var(--shadow-sm)" : "none",
        transition: "box-shadow var(--duration-base) var(--ease-smooth), border-color var(--duration-base) var(--ease-smooth)",
      }}
    >
      <div
        style={{
          maxWidth: "var(--content-max)",
          margin: "0 auto",
          padding: "0 var(--content-pad)",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        {/* ── Brand ─────────────────────────────────────────── */}
        <Link
          to="/"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "1.2rem",
            color: "var(--brand-600)",
            letterSpacing: "-0.03em",
            display: "flex",
            alignItems: "center",
            gap: "0.375rem",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              width: 28,
              height: 28,
              background: "var(--brand-500)",
              borderRadius: "var(--radius-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.875rem",
            }}
          >
            🤝
          </span>
          CommunityShare
        </Link>

        {/* ── Desktop nav ───────────────────────────────────── */}
        {user && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              flex: 1,
              justifyContent: "center",
            }}
            className="desktop-nav"
          >
            {NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: isActive(to) ? 600 : 500,
                  fontSize: "0.9rem",
                  color: isActive(to) ? "var(--brand-600)" : "var(--gray-600)",
                  background: isActive(to) ? "var(--brand-50)" : "transparent",
                  padding: "0.4rem 0.875rem",
                  borderRadius: "var(--radius-md)",
                  textDecoration: "none",
                  transition: "all var(--duration-fast) var(--ease-smooth)",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  if (!isActive(to)) {
                    e.currentTarget.style.background = "var(--gray-100)";
                    e.currentTarget.style.color = "var(--gray-800)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(to)) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "var(--gray-600)";
                  }
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        )}

        {/* ── Right section ─────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
          {user ? (
            <>
              <Link
                to="/add-item"
                className="btn btn-primary btn-sm"
                style={{ textDecoration: "none" }}
              >
                <span style={{ fontSize: "1rem", lineHeight: 1 }}>+</span>
                List Item
              </Link>

              <div
                style={{
                  width: 1,
                  height: 24,
                  background: "var(--gray-200)",
                }}
              />

              <NotificationBell />
              <ProfileMenu user={user} logout={logout} />

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen((p) => !p)}
                className="mobile-menu-btn"
                style={{
                  display: "none",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 36,
                  height: 36,
                  borderRadius: "var(--radius-md)",
                  background: mobileOpen ? "var(--gray-100)" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--gray-700)",
                  fontSize: "1.25rem",
                }}
                aria-label="Toggle menu"
              >
                {mobileOpen ? "✕" : "☰"}
              </button>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Link
                to="/login"
                className="btn btn-ghost btn-sm"
                style={{ textDecoration: "none" }}
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="btn btn-primary btn-sm"
                style={{ textDecoration: "none" }}
              >
                Get started
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile dropdown ───────────────────────────────────── */}
      {user && mobileOpen && (
        <div
          style={{
            position: "absolute",
            top: "var(--navbar-h)",
            left: 0,
            right: 0,
            background: "white",
            borderBottom: "1px solid var(--gray-200)",
            boxShadow: "var(--shadow-lg)",
            padding: "0.75rem var(--content-pad)",
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
            animation: "fade-down var(--duration-base) var(--ease-smooth) both",
          }}
        >
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              style={{
                fontWeight: isActive(to) ? 600 : 500,
                fontSize: "0.9375rem",
                color: isActive(to) ? "var(--brand-600)" : "var(--gray-700)",
                background: isActive(to) ? "var(--brand-50)" : "transparent",
                padding: "0.625rem 0.875rem",
                borderRadius: "var(--radius-md)",
                textDecoration: "none",
                display: "block",
              }}
            >
              {label}
            </Link>
          ))}
          <Link
            to="/add-item"
            style={{
              fontWeight: 600,
              fontSize: "0.9375rem",
              color: "var(--brand-600)",
              padding: "0.625rem 0.875rem",
              borderRadius: "var(--radius-md)",
              textDecoration: "none",
              display: "block",
            }}
          >
            + List Item
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
