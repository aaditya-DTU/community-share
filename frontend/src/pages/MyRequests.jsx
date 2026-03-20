import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMyRequests, returnItem } from "../api/requestApi";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import PageWrapper from "../components/common/PageWrapper";

const STATUS_CONFIG = {
  pending:  { cls: "badge-amber",  label: "Pending",  desc: "Waiting for owner to respond" },
  approved: { cls: "badge-green",  label: "Approved", desc: "You can collect this item" },
  returned: { cls: "badge-gray",   label: "Returned", desc: "Successfully returned" },
  rejected: { cls: "badge-rose",   label: "Rejected", desc: "Owner declined your request" },
};

const MyRequests = () => {
  const { user } = useAuth();
  const { addToast } = useNotifications();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [returningId, setReturningId] = useState(null);

  const loadRequests = async () => {
    try {
      const data = await fetchMyRequests();
      setRequests(data);
    } catch (err) {
      console.error("Failed to load requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRequests(); }, []);

  const handleReturn = async (id) => {
    setReturningId(id);
    // Optimistic UI
    setRequests((prev) => prev.map((r) => r._id === id ? { ...r, status: "returned" } : r));
    try {
      await returnItem(id);
      addToast({ message: "Item returned successfully!", type: "success" });
    } catch (err) {
      if (err?.response?.status !== 400) {
        console.error("Unexpected return error", err);
        loadRequests();
        addToast({ message: "Failed to return. Please try again.", type: "error" });
      }
    } finally {
      setReturningId(null);
    }
  };

  // Group by status
  const active   = requests.filter((r) => r.status === "approved");
  const pending  = requests.filter((r) => r.status === "pending");
  const resolved = requests.filter((r) => r.status === "returned" || r.status === "rejected");

  return (
    <PageWrapper
      title="My Requests"
      subtitle="Borrow requests you've made"
    >
      {loading ? (
        <SkeletonList />
      ) : requests.length === 0 ? (
        <div className="empty-state" style={{ paddingTop: "4rem" }}>
          <div className="empty-state__icon">📋</div>
          <p className="empty-state__title">No requests yet</p>
          <p className="empty-state__desc">Find items nearby and send your first borrow request</p>
          <Link to="/home" className="btn btn-primary" style={{ marginTop: "0.75rem", textDecoration: "none" }}>
            Browse items
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

          {active.length > 0 && (
            <Group label={`Active (${active.length})`} accent="var(--brand-500)">
              {active.map((req, i) => (
                <RequestRow key={req._id} request={req} index={i} user={user} onReturn={handleReturn} returningId={returningId} />
              ))}
            </Group>
          )}

          {pending.length > 0 && (
            <Group label={`Pending (${pending.length})`} accent="var(--accent-amber)">
              {pending.map((req, i) => (
                <RequestRow key={req._id} request={req} index={i} user={user} onReturn={handleReturn} returningId={returningId} />
              ))}
            </Group>
          )}

          {resolved.length > 0 && (
            <Group label={`History (${resolved.length})`} accent="var(--gray-300)">
              {resolved.map((req, i) => (
                <RequestRow key={req._id} request={req} index={i} user={user} onReturn={handleReturn} returningId={returningId} />
              ))}
            </Group>
          )}

        </div>
      )}
    </PageWrapper>
  );
};

const Group = ({ label, accent, children }) => (
  <section>
    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.875rem" }}>
      <div style={{ width: 3, height: 16, background: accent, borderRadius: 2 }} />
      <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
        {label}
      </p>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {children}
    </div>
  </section>
);

const RequestRow = ({ request, index, user, onReturn, returningId }) => {
  const item = request.item || {};
  const cfg  = STATUS_CONFIG[request.status] || { cls: "badge-gray", label: request.status, desc: "" };
  const canReturn = request.status === "approved" &&
    (request.borrower?._id === user?._id || request.borrower === user?._id);

  return (
    <div
      className="card-flat animate-fade-up"
      style={{
        padding: "1.125rem 1.25rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        animationDelay: `${index * 50}ms`,
      }}
    >
      <div style={{
        width: 44, height: 44,
        borderRadius: "var(--radius-md)",
        background: "var(--gray-50)",
        border: "1px solid var(--gray-100)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1.25rem", flexShrink: 0,
      }}>
        📋
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--gray-800)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {item.title || "Item"}
        </p>
        <p style={{ fontSize: "0.8125rem", color: "var(--gray-400)", margin: "0.15rem 0 0" }}>
          {cfg.desc}{request.owner?.name ? ` · ${request.owner.name}` : ""}
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", flexShrink: 0 }}>
        <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
        {canReturn && (
          <button
            className="btn btn-sm"
            disabled={returningId === request._id}
            onClick={() => onReturn(request._id)}
            style={{
              background: "var(--accent-violet)",
              color: "white",
              boxShadow: "0 2px 8px rgba(139,92,246,0.3)",
            }}
          >
            {returningId === request._id ? "Returning…" : "Return"}
          </button>
        )}
      </div>
    </div>
  );
};

const SkeletonList = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="skeleton" style={{ height: 72, borderRadius: "var(--radius-lg)" }} />
    ))}
  </div>
);

export default MyRequests;
