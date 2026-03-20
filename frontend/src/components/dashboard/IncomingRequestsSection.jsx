import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNotifications } from "../../context/NotificationContext";

const IncomingRequestsSection = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const { addToast } = useNotifications();

  const load = () => {
    setLoading(true);
    api.get("/requests/incoming")
      .then((res) => setRequests(res.data))
      .catch((err) => console.error("Failed to load incoming requests", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (id, action) => {
    try {
      await api.patch(`/requests/${id}/${action}`);
      addToast({
        message: action === "approve" ? "Request approved!" : "Request rejected",
        type: action === "approve" ? "success" : "info",
      });
      load();
    } catch (err) {
      addToast({ message: "Action failed. Please try again.", type: "error" });
    }
  };

  if (loading) return <SectionSkeleton />;

  const pending  = requests.filter((r) => r.status === "pending");
  const resolved = requests.filter((r) => r.status !== "pending");

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">
          Incoming Requests
          {pending.length > 0 && (
            <span
              style={{
                marginLeft: "0.5rem",
                background: "var(--accent-amber)",
                color: "white",
                fontSize: "0.7rem",
                fontWeight: 700,
                padding: "0.1rem 0.45rem",
                borderRadius: "var(--radius-full)",
              }}
            >
              {pending.length} pending
            </span>
          )}
        </h2>
      </div>

      {requests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">📨</div>
          <p className="empty-state__title">No incoming requests</p>
          <p className="empty-state__desc">When someone requests to borrow your items, they'll appear here</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {/* Pending first */}
          {pending.map((req, i) => (
            <RequestRow key={req._id} request={req} index={i} onAction={handleAction} showActions />
          ))}
          {/* Resolved */}
          {resolved.length > 0 && (
            <>
              {pending.length > 0 && (
                <p style={{ fontSize: "0.75rem", color: "var(--gray-400)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", marginTop: "0.5rem" }}>
                  Resolved
                </p>
              )}
              {resolved.map((req, i) => (
                <RequestRow key={req._id} request={req} index={i} onAction={handleAction} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

const RequestRow = ({ request, index, onAction, showActions = false }) => {
  const [acting, setActing] = useState(null);
  const item = request.item || {};

  const handle = async (action) => {
    setActing(action);
    await onAction(request._id, action);
    setActing(null);
  };

  return (
    <div
      className="card-flat animate-fade-up"
      style={{
        padding: "1rem 1.25rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        animationDelay: `${index * 50}ms`,
        borderLeft: showActions ? "3px solid var(--accent-amber)" : "3px solid var(--gray-100)",
      }}
    >
      <div style={{
        width: 40, height: 40,
        borderRadius: "50%",
        background: "var(--brand-100)",
        color: "var(--brand-700)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--font-display)",
        fontWeight: 700, fontSize: "0.8125rem",
        flexShrink: 0,
      }}>
        {(request.requester?.name || "?")[0].toUpperCase()}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--gray-800)", margin: 0 }}>
          {request.requester?.name || "Someone"} wants to borrow{" "}
          <span style={{ color: "var(--brand-700)" }}>{item.title || "your item"}</span>
        </p>
        {request.message && (
          <p style={{ fontSize: "0.8125rem", color: "var(--gray-500)", margin: "0.2rem 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            "{request.message}"
          </p>
        )}
      </div>

      {showActions ? (
        <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
          <button
            className="btn btn-primary btn-sm"
            disabled={!!acting}
            onClick={() => handle("approve")}
          >
            {acting === "approve" ? "…" : "✓ Approve"}
          </button>
          <button
            className="btn btn-danger btn-sm"
            disabled={!!acting}
            onClick={() => handle("reject")}
          >
            {acting === "reject" ? "…" : "Reject"}
          </button>
        </div>
      ) : (
        <StatusBadge status={request.status} />
      )}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    approved: { cls: "badge-green",  label: "Approved" },
    rejected: { cls: "badge-rose",   label: "Rejected" },
    returned: { cls: "badge-gray",   label: "Returned" },
  };
  const { cls, label } = map[status] || { cls: "badge-gray", label: status };
  return <span className={`badge ${cls}`}>{label}</span>;
};

const SectionSkeleton = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="skeleton" style={{ height: 72, borderRadius: "var(--radius-lg)" }} />
    ))}
  </div>
);

export default IncomingRequestsSection;
