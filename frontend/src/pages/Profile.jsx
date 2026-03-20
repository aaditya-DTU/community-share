import { useEffect, useState } from "react";
import api from "../api/axios";
import PageWrapper from "../components/common/PageWrapper";

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

const Profile = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/users/me")
      .then((res) => setData(res.data))
      .catch((err) => console.error("Failed to load profile", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <PageWrapper title="Profile">
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 80, borderRadius: "var(--radius-lg)" }} />
        ))}
      </div>
    </PageWrapper>
  );

  if (!data) return (
    <PageWrapper title="Profile">
      <div className="empty-state">
        <div className="empty-state__icon">⚠️</div>
        <p className="empty-state__title">Failed to load profile</p>
      </div>
    </PageWrapper>
  );

  const { user, myItems = [], borrowedItems = [], incomingRequests = [] } = data;
  const [bg, fg] = nameToColor(user?.name);
  const trustScore = user?.trustScore ?? 0;
  const trustPct   = Math.min((trustScore / 100) * 100, 100);

  return (
    <PageWrapper title="My Profile">
      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "1.5rem", alignItems: "start" }} className="profile-grid">

        {/* ── Left: Identity card ─────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="card" style={{ padding: "1.75rem", textAlign: "center" }}>
            {/* Avatar */}
            <div style={{
              width: 80, height: 80,
              borderRadius: "50%",
              background: bg, color: fg,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.75rem",
              margin: "0 auto 1rem",
              boxShadow: "var(--shadow-md)",
            }}>
              {getInitials(user?.name)}
            </div>

            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.25rem", color: "var(--gray-900)", margin: "0 0 0.25rem" }}>
              {user?.name}
            </h2>
            <p style={{ fontSize: "0.875rem", color: "var(--gray-400)", margin: "0 0 1.25rem" }}>
              {user?.email}
            </p>

            {/* Trust score */}
            <div style={{
              background: "var(--brand-50)",
              border: "1px solid var(--brand-200)",
              borderRadius: "var(--radius-lg)",
              padding: "0.875rem 1rem",
              marginBottom: "1rem",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--gray-600)" }}>⭐ Trust Score</span>
                <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, color: "var(--brand-700)" }}>{trustScore}</span>
              </div>
              <div style={{ height: 6, background: "var(--brand-100)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                <div style={{
                  height: "100%", width: `${trustPct}%`,
                  background: "linear-gradient(90deg, var(--brand-400), var(--brand-600))",
                  borderRadius: "var(--radius-full)",
                }} />
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
              {[
                { label: "Listed",   value: myItems.length },
                { label: "Borrowed", value: borrowedItems.length },
                { label: "Pending",  value: incomingRequests.length },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: "var(--gray-50)", borderRadius: "var(--radius-md)", padding: "0.625rem 0.25rem", textAlign: "center" }}>
                  <p style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.25rem", color: "var(--gray-900)", margin: 0 }}>{value}</p>
                  <p style={{ fontSize: "0.7rem", color: "var(--gray-400)", margin: "0.15rem 0 0", fontWeight: 500 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Activity ──────────────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <ActivitySection title="📦 Listed Items" items={myItems} renderItem={(i) => i.title} emptyMsg="No items listed yet" />
          <ActivitySection title="🔁 Borrowed Items" items={borrowedItems} renderItem={(i) => i.item?.title || "Item"} emptyMsg="Nothing borrowed yet" />
          <ActivitySection title="📨 Incoming Requests" items={incomingRequests} renderItem={(i) => `${i.requester?.name || "Someone"} → ${i.item?.title || "item"}`} emptyMsg="No incoming requests" />
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .profile-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </PageWrapper>
  );
};

const ActivitySection = ({ title, items, renderItem, emptyMsg }) => (
  <div className="card" style={{ padding: "1.25rem 1.5rem" }}>
    <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.9375rem", color: "var(--gray-900)", margin: "0 0 1rem" }}>
      {title}
      <span style={{ marginLeft: "0.5rem", fontFamily: "var(--font-body)", fontSize: "0.8rem", color: "var(--gray-400)", fontWeight: 500 }}>
        ({items.length})
      </span>
    </h3>

    {items.length === 0 ? (
      <p style={{ fontSize: "0.875rem", color: "var(--gray-400)", margin: 0 }}>{emptyMsg}</p>
    ) : (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {items.slice(0, 5).map((item, i) => (
          <div
            key={item._id || i}
            style={{
              padding: "0.5rem 0.75rem",
              background: "var(--gray-50)",
              borderRadius: "var(--radius-md)",
              fontSize: "0.875rem",
              color: "var(--gray-700)",
              fontWeight: 500,
            }}
          >
            {renderItem(item)}
          </div>
        ))}
        {items.length > 5 && (
          <p style={{ fontSize: "0.8125rem", color: "var(--gray-400)", margin: "0.25rem 0 0" }}>
            +{items.length - 5} more
          </p>
        )}
      </div>
    )}
  </div>
);

export default Profile;
