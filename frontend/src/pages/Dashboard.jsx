import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import StatCard from "../components/dashboard/StatCard";
import { fetchDashboardStats } from "../api/dashboardApi";
import MyItemsSection from "../components/dashboard/MyItemsSection";
import BorrowedSection from "../components/dashboard/BorrowedSection";
import IncomingRequestsSection from "../components/dashboard/IncomingRequestsSection";
import MyRequestsSection from "../components/dashboard/MyRequestsSection";
import ProfileSection from "../components/dashboard/ProfileSection";

const TABS = [
  { id: "My Items",          icon: "📦" },
  { id: "Borrowed",          icon: "🔁" },
  { id: "Incoming Requests", icon: "📨" },
  { id: "My Requests",       icon: "📋" },
  { id: "Profile",           icon: "👤" },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("My Items");
  const [stats, setStats]         = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await fetchDashboardStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load dashboard stats");
      } finally {
        setStatsLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="page-wrapper" style={{ paddingBottom: "3rem" }}>
      <div className="content-container">

        {/* ── Header ──────────────────────────────────────────── */}
        <div
          style={{
            paddingTop: "2rem",
            paddingBottom: "1.5rem",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
          }}
          className="animate-fade-up"
        >
          <div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "clamp(1.4rem, 3vw, 1.875rem)",
                color: "var(--gray-900)",
                letterSpacing: "-0.025em",
                margin: 0,
              }}
            >
              Dashboard
            </h1>
            <p style={{ fontSize: "0.9375rem", color: "var(--gray-500)", margin: "0.25rem 0 0" }}>
              Welcome back, {user?.name?.split(" ")[0]}
            </p>
          </div>
        </div>

        {/* ── Stats row ───────────────────────────────────────── */}
        {activeTab !== "Profile" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
              marginBottom: "2rem",
            }}
            className="animate-fade-up delay-100"
          >
            {statsLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="skeleton"
                    style={{ height: 80, borderRadius: "var(--radius-lg)" }}
                  />
                ))
              : stats && (
                  <>
                    <StatCard title="My Items"          value={stats.myItems} />
                    <StatCard title="Borrowed"          value={stats.borrowed} />
                    <StatCard title="Incoming Requests" value={stats.incomingRequests} />
                    <StatCard title="My Requests"       value={stats.myRequests} />
                  </>
                )}
          </div>
        )}

        {/* ── Tab bar ─────────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            gap: "0.25rem",
            borderBottom: "2px solid var(--gray-100)",
            marginBottom: "2rem",
            overflowX: "auto",
            paddingBottom: "0",
          }}
          className="animate-fade-up delay-150"
        >
          {TABS.map(({ id, icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  padding: "0.625rem 1rem",
                  fontSize: "0.875rem",
                  fontWeight: active ? 700 : 500,
                  fontFamily: "var(--font-body)",
                  color: active ? "var(--brand-600)" : "var(--gray-500)",
                  background: "none",
                  border: "none",
                  borderBottom: active ? "2px solid var(--brand-500)" : "2px solid transparent",
                  marginBottom: "-2px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all var(--duration-fast) var(--ease-smooth)",
                  borderRadius: "var(--radius-md) var(--radius-md) 0 0",
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.color = "var(--gray-800)";
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.color = "var(--gray-500)";
                }}
              >
                <span style={{ fontSize: "0.875rem" }}>{icon}</span>
                {id}
              </button>
            );
          })}
        </div>

        {/* ── Active section ──────────────────────────────────── */}
        <div className="animate-fade-up delay-200" key={activeTab}>
          {activeTab === "My Items"          && <MyItemsSection />}
          {activeTab === "Borrowed"          && <BorrowedSection />}
          {activeTab === "Incoming Requests" && <IncomingRequestsSection />}
          {activeTab === "My Requests"       && <MyRequestsSection />}
          {activeTab === "Profile"           && <ProfileSection />}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
