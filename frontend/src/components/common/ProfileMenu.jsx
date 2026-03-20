import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Generate a consistent color from a name
const nameToColor = (name = "") => {
  const colors = [
    ["#dcfce7", "#166534"],
    ["#dbeafe", "#1e40af"],
    ["#fce7f3", "#9d174d"],
    ["#fef3c7", "#92400e"],
    ["#ede9fe", "#5b21b6"],
    ["#ffedd5", "#9a3412"],
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const MENU_ITEMS = [
  { label: "View Profile",  icon: "👤", path: "/profile" },
  { label: "Dashboard",     icon: "📊", path: "/dashboard" },
  { label: "My Items",      icon: "📦", path: "/my-items" },
  { label: "My Requests",   icon: "📋", path: "/my-requests" },
];

const ProfileMenu = ({ user, logout }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const [bg, fg] = nameToColor(user?.name);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleNav = (path) => {
    navigate(path);
    setOpen(false);
  };

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((p) => !p)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          background: open ? "var(--gray-100)" : "transparent",
          border: "none",
          borderRadius: "var(--radius-full)",
          padding: "0.25rem 0.5rem 0.25rem 0.25rem",
          cursor: "pointer",
          transition: "background var(--duration-fast) var(--ease-smooth)",
        }}
        onMouseEnter={(e) => { if (!open) e.currentTarget.style.background = "var(--gray-100)"; }}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.background = "transparent"; }}
        aria-label="Account menu"
      >
        {/* Avatar */}
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: bg,
            color: fg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "0.75rem",
            flexShrink: 0,
          }}
        >
          {getInitials(user?.name)}
        </span>

        {/* Name — hidden on small screens */}
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: "0.875rem",
            color: "var(--gray-700)",
            maxWidth: 100,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          className="profile-name"
        >
          {user?.name?.split(" ")[0]}
        </span>

        {/* Chevron */}
        <span
          style={{
            fontSize: "0.6rem",
            color: "var(--gray-400)",
            transition: "transform var(--duration-fast) var(--ease-smooth)",
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            lineHeight: 1,
          }}
        >
          ▼
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: 220,
            background: "var(--surface-card)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-xl)",
            border: "1px solid var(--gray-100)",
            overflow: "hidden",
            animation: "fade-down var(--duration-base) var(--ease-smooth) both",
            zIndex: 50,
          }}
        >
          {/* User info header */}
          <div
            style={{
              padding: "0.875rem 1rem",
              borderBottom: "1px solid var(--gray-100)",
              background: "var(--gray-50)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "0.9rem",
                color: "var(--gray-900)",
                marginBottom: "0.125rem",
              }}
            >
              {user?.name}
            </div>
            <div
              style={{
                fontSize: "0.75rem",
                color: "var(--gray-400)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user?.email}
            </div>
            {user?.trustScore !== undefined && (
              <div
                style={{
                  marginTop: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                }}
              >
                <span style={{ fontSize: "0.7rem" }}>⭐</span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--brand-700)",
                  }}
                >
                  Trust score: {user.trustScore}
                </span>
              </div>
            )}
          </div>

          {/* Nav items */}
          <div style={{ padding: "0.375rem" }}>
            {MENU_ITEMS.map(({ label, icon, path }) => (
              <button
                key={path}
                onClick={() => handleNav(path)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.625rem",
                  padding: "0.5rem 0.625rem",
                  borderRadius: "var(--radius-md)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  color: "var(--gray-700)",
                  fontFamily: "var(--font-body)",
                  fontWeight: 500,
                  textAlign: "left",
                  transition: "background var(--duration-fast)",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--gray-100)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "none"}
              >
                <span style={{ fontSize: "0.9rem", width: 18, textAlign: "center" }}>{icon}</span>
                {label}
              </button>
            ))}
          </div>

          {/* Divider + logout */}
          <div
            style={{
              borderTop: "1px solid var(--gray-100)",
              padding: "0.375rem",
            }}
          >
            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "0.625rem",
                padding: "0.5rem 0.625rem",
                borderRadius: "var(--radius-md)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "0.875rem",
                color: "var(--accent-rose)",
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                textAlign: "left",
                transition: "background var(--duration-fast)",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#fff1f2"}
              onMouseLeave={(e) => e.currentTarget.style.background = "none"}
            >
              <span style={{ fontSize: "0.9rem", width: 18, textAlign: "center" }}>🚪</span>
              Sign out
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .profile-name { display: none; }
        }
      `}</style>
    </div>
  );
};

export default ProfileMenu;
