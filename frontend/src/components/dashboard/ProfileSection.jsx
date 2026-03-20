import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";

const nameToColor = (name = "") => {
  const colors = [
    ["#dcfce7", "#166534"], ["#dbeafe", "#1e40af"], ["#fce7f3", "#9d174d"],
    ["#fef3c7", "#92400e"], ["#ede9fe", "#5b21b6"], ["#ffedd5", "#9a3412"],
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

const ProfileSection = () => {
  const { user } = useAuth();
  const [bg, fg] = nameToColor(user?.name);
  const trustScore = user?.trustScore ?? 0;
  const trustMax   = 100;
  const trustPct   = Math.min((trustScore / trustMax) * 100, 100);

  return (
    <div style={{ maxWidth: 540 }}>
      <div className="section-header">
        <h2 className="section-title">Profile</h2>
        <Link to="/profile" className="btn btn-outline btn-sm" style={{ textDecoration: "none" }}>
          View full profile
        </Link>
      </div>

      {/* Profile card */}
      <div
        className="card"
        style={{ padding: "1.75rem" }}
      >
        {/* Avatar + name */}
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", marginBottom: "1.5rem" }}>
          <div style={{
            width: 64, height: 64,
            borderRadius: "50%",
            background: bg,
            color: fg,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-display)",
            fontWeight: 800, fontSize: "1.375rem",
            flexShrink: 0,
            boxShadow: "var(--shadow-sm)",
          }}>
            {getInitials(user?.name)}
          </div>
          <div>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.125rem", color: "var(--gray-900)", margin: 0 }}>
              {user?.name}
            </h3>
            <p style={{ fontSize: "0.875rem", color: "var(--gray-400)", margin: "0.15rem 0 0" }}>
              {user?.email}
            </p>
          </div>
        </div>

        <hr className="divider" style={{ margin: "0 0 1.25rem" }} />

        {/* Trust score */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--gray-600)" }}>
              ⭐ Trust Score
            </span>
            <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.125rem", color: "var(--brand-600)" }}>
              {trustScore}
              <span style={{ fontSize: "0.75rem", color: "var(--gray-400)", fontWeight: 500 }}> / {trustMax}</span>
            </span>
          </div>
          <div style={{
            height: 8,
            background: "var(--gray-100)",
            borderRadius: "var(--radius-full)",
            overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${trustPct}%`,
              background: "linear-gradient(90deg, var(--brand-400), var(--brand-600))",
              borderRadius: "var(--radius-full)",
              transition: "width 0.8s var(--ease-smooth)",
            }} />
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--gray-400)", marginTop: "0.375rem" }}>
            {trustScore < 30 ? "Keep borrowing & returning to build trust" :
             trustScore < 70 ? "Good standing in the community" :
             "Highly trusted member 🎉"}
          </p>
        </div>

        {/* Info rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {[
            { label: "Member ID", value: user?._id?.slice(-8).toUpperCase() || "—" },
            { label: "Account",   value: "Active" },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.8125rem", color: "var(--gray-500)" }}>{label}</span>
              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--gray-700)" }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
