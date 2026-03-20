import { useEffect, useState } from "react";
import { fetchOwnerRequests, approveRequest, rejectRequest } from "../api/requestApi";
import { useNotifications } from "../context/NotificationContext";
import PageWrapper from "../components/common/PageWrapper";

/**
 * OwnerRequests — Incoming Requests page
 * Owner's responsibility: Approve / Reject pending requests only.
 * Rating the borrower is done separately in the "Rate Borrowers" tab.
 */
const OwnerRequests = () => {
  const { addToast } = useNotifications();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [actingId, setActingId] = useState(null);

  const load = async () => {
    try {
      const data = await fetchOwnerRequests();
      setRequests(data);
    } catch (err) {
      console.error("Failed to load requests", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAction = async (id, action) => {
    setActingId(`${id}-${action}`);
    try {
      if (action === "approve") await approveRequest(id);
      else await rejectRequest(id);
      addToast({
        message: action === "approve" ? "Request approved!" : "Request rejected",
        type: action === "approve" ? "success" : "info",
      });
      load();
    } catch (err) {
      addToast({ message: err?.response?.data?.message || "Action failed", type: "error" });
    } finally {
      setActingId(null);
    }
  };

  const pending  = requests.filter((r) => r.status === "pending");
  const active   = requests.filter((r) => r.status === "approved");
  const returned = requests.filter((r) => r.status === "returned");
  const rejected = requests.filter((r) => r.status === "rejected");

  // Count borrowers awaiting rating
  const awaitingRating = returned.filter((r) => !r.ownerReviewed).length;

  return (
    <PageWrapper
      title={
        <span style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          Incoming Requests
          {pending.length > 0 && (
            <span style={{ background: "var(--accent-amber)", color: "white", fontSize: "0.75rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: "var(--radius-full)", fontFamily: "var(--font-body)" }}>
              {pending.length} pending
            </span>
          )}
        </span>
      }
      subtitle="Approve or reject borrow requests for your items"
    >
      {/* Rate borrowers nudge */}
      {awaitingRating > 0 && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "linear-gradient(135deg, var(--brand-50), #fffbeb)",
          border: "1px solid var(--brand-200)",
          borderRadius: "var(--radius-lg)",
          padding: "0.875rem 1.25rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap", gap: "0.75rem",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
            <span style={{ fontSize: "1.25rem" }}>⭐</span>
            <div>
              <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--gray-800)", margin: 0 }}>
                {awaitingRating} borrower{awaitingRating > 1 ? "s" : ""} awaiting your rating
              </p>
              <p style={{ fontSize: "0.8rem", color: "var(--gray-500)", margin: "0.1rem 0 0" }}>
                Rate them to build mutual trust in the community
              </p>
            </div>
          </div>
          <a
            href="#returned"
            style={{
              fontSize: "0.8125rem", fontWeight: 700,
              color: "var(--brand-700)", textDecoration: "none",
              background: "var(--brand-100)",
              padding: "0.375rem 0.875rem",
              borderRadius: "var(--radius-full)",
            }}
          >
            Rate now ↓
          </a>
        </div>
      )}

      {loading ? (
        <SkeletonList />
      ) : requests.length === 0 ? (
        <div className="empty-state" style={{ paddingTop: "3rem" }}>
          <div className="empty-state__icon">📨</div>
          <p className="empty-state__title">No requests yet</p>
          <p className="empty-state__desc">When someone wants to borrow your items, it'll appear here</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

          {pending.length > 0 && (
            <Group label={`Awaiting response (${pending.length})`} accent="var(--accent-amber)">
              {pending.map((req, i) => (
                <RequestCard key={req._id} request={req} index={i}
                  onAction={handleAction} actingId={actingId} showActions />
              ))}
            </Group>
          )}

          {active.length > 0 && (
            <Group label={`Currently out on loan (${active.length})`} accent="var(--brand-500)">
              {active.map((req, i) => (
                <RequestCard key={req._id} request={req} index={i} />
              ))}
            </Group>
          )}

          {returned.length > 0 && (
            <div id="returned">
              <Group label={`Returned · rate the borrower (${returned.length})`} accent="var(--accent-amber)">
                {returned.map((req, i) => (
                  <RequestCard key={req._id} request={req} index={i} />
                ))}
              </Group>
              <p style={{ fontSize: "0.8125rem", color: "var(--gray-400)", marginTop: "0.5rem", paddingLeft: "0.25rem" }}>
                💡 Go to <strong>My Items</strong> page to rate borrowers for returned items.
              </p>
            </div>
          )}

          {rejected.length > 0 && (
            <Group label={`Rejected (${rejected.length})`} accent="var(--gray-200)">
              {rejected.map((req, i) => (
                <RequestCard key={req._id} request={req} index={i} />
              ))}
            </Group>
          )}
        </div>
      )}
    </PageWrapper>
  );
};

// ── Shared sub-components ─────────────────────────────────────

const Group = ({ label, accent, children }) => (
  <section>
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.875rem" }}>
      <div style={{ width: 3, height: 16, background: accent, borderRadius: 2 }} />
      <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
        {label}
      </p>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>{children}</div>
  </section>
);

const getInitials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

const STATUS_CONFIG = {
  pending:  { cls: "badge-amber", label: "Pending"  },
  approved: { cls: "badge-green", label: "Active"   },
  rejected: { cls: "badge-rose",  label: "Rejected" },
  returned: { cls: "badge-gray",  label: "Returned" },
};

const RequestCard = ({ request, index, onAction, actingId, showActions = false }) => {
  const item     = request.item     || {};
  const borrower = request.borrower || {};
  const cfg      = STATUS_CONFIG[request.status] || { cls: "badge-gray", label: request.status };

  return (
    <div
      className="card animate-fade-up"
      style={{
        padding: 0, overflow: "hidden",
        animationDelay: `${index * 50}ms`,
        borderLeft: showActions ? "3px solid var(--accent-amber)" : "3px solid transparent",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1.125rem 1.25rem" }}>

        {/* Borrower avatar */}
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          background: "var(--brand-100)", color: "var(--brand-700)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "0.875rem",
          flexShrink: 0,
        }}>
          {getInitials(borrower.name || "?")}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--gray-900)", margin: 0 }}>
            <span style={{ color: "var(--brand-700)" }}>{borrower.name || "Someone"}</span>
            {" · "}
            <span style={{ color: "var(--gray-700)" }}>{item.title || "your item"}</span>
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.2rem", flexWrap: "wrap" }}>
            {borrower.trustScore !== undefined && (
              <span style={{ fontSize: "0.75rem", color: "var(--accent-amber)" }}>⭐ {borrower.trustScore}</span>
            )}
            {request.message && (
              <span style={{ fontSize: "0.8125rem", color: "var(--gray-400)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220 }}>
                "{request.message}"
              </span>
            )}
            {request.approvedAt && (
              <span style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>
                Since {new Date(request.approvedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </span>
            )}
            {request.status === "returned" && (
              <span style={{ fontSize: "0.75rem", fontWeight: 600, color: request.ownerReviewed ? "var(--brand-600)" : "var(--accent-amber)" }}>
                {request.ownerReviewed ? "✓ You rated this borrower" : "⭐ Rating pending — go to My Items"}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
          <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
          {showActions && (
            <>
              <button className="btn btn-primary btn-sm" disabled={!!actingId}
                onClick={() => onAction(request._id, "approve")}>
                {actingId === `${request._id}-approve` ? "…" : "✓ Approve"}
              </button>
              <button className="btn btn-danger btn-sm" disabled={!!actingId}
                onClick={() => onAction(request._id, "reject")}>
                {actingId === `${request._id}-reject` ? "…" : "Reject"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const SkeletonList = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="skeleton" style={{ height: 76, borderRadius: "var(--radius-lg)" }} />
    ))}
  </div>
);

export default OwnerRequests;