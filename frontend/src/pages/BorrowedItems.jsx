import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchBorrowedItems, returnItem } from "../api/requestApi";
import { createReview } from "../api/reviewApi";
import ReviewModal from "../components/reviews/ReviewModal";
import PageWrapper from "../components/common/PageWrapper";
import { useNotifications } from "../context/NotificationContext";

const STATUS_CONFIG = {
  approved: { cls: "badge-green", label: "Active" },
  returned: { cls: "badge-gray",  label: "Returned" },
};

const BorrowedItems = () => {
  const { addToast } = useNotifications();
  const [borrowed, setBorrowed]                 = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [reviewingRequest, setReviewingRequest] = useState(null);
  const [returningId, setReturningId]           = useState(null);

  const load = async () => {
    try {
      const data = await fetchBorrowedItems();
      setBorrowed(data);
    } catch (err) {
      console.error("Failed to load borrowed items", err);
      addToast({ message: "Failed to load borrowed items", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleReturn = async (id) => {
    setReturningId(id);
    setBorrowed((prev) => prev.map((r) => r._id === id ? { ...r, status: "returned" } : r));
    try {
      await returnItem(id);
      addToast({ message: "Item returned! Please leave a review.", type: "success" });
    } catch (err) {
      console.error("Return failed", err);
      load();
      addToast({ message: "Failed to return item. Please try again.", type: "error" });
    } finally {
      setReturningId(null);
    }
  };

  const handleSubmitReview = async (data) => {
    try {
      await createReview(data);
      // mark as reviewed locally so button disappears
      setBorrowed((prev) =>
        prev.map((r) => r._id === reviewingRequest._id ? { ...r, borrowerReviewed: true } : r)
      );
      setReviewingRequest(null);
      addToast({ message: "Review submitted! Thank you.", type: "success" });
    } catch (err) {
      addToast({ message: err?.response?.data?.message || "Failed to submit review", type: "error" });
    }
  };

  const active   = borrowed.filter((r) => r.status === "approved");
  const returned = borrowed.filter((r) => r.status === "returned");

  return (
    <PageWrapper
      title="Borrowed Items"
      subtitle="Items you're currently borrowing or have borrowed"
    >
      {loading ? (
        <SkeletonList />
      ) : borrowed.length === 0 ? (
        <div className="empty-state" style={{ paddingTop: "4rem" }}>
          <div className="empty-state__icon">🔁</div>
          <p className="empty-state__title">Nothing borrowed yet</p>
          <p className="empty-state__desc">Browse nearby items and send a borrow request</p>
          <Link to="/home" className="btn btn-primary" style={{ marginTop: "0.75rem", textDecoration: "none" }}>
            Browse items
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

          {/* ── Active borrows ──────────────────────────────── */}
          {active.length > 0 && (
            <section>
              <SectionLabel text={`Currently borrowing (${active.length})`} accent="var(--brand-500)" />
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {active.map((req, i) => (
                  <BorrowCard
                    key={req._id}
                    request={req}
                    index={i}
                    onReturn={handleReturn}
                    returningId={returningId}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── Returned ───────────────────────────────────── */}
          {returned.length > 0 && (
            <section>
              <SectionLabel text={`Returned (${returned.length})`} accent="var(--gray-300)" />
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {returned.map((req, i) => (
                  <BorrowCard
                    key={req._id}
                    request={req}
                    index={i}
                    onReview={setReviewingRequest}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {reviewingRequest && (
        <ReviewModal
          request={reviewingRequest}
          revieweeId={reviewingRequest.owner?._id || reviewingRequest.owner}
          revieweeName={reviewingRequest.owner?.name || "the owner"}
          context="borrower" // borrower reviews owner
          onClose={() => setReviewingRequest(null)}
          onSubmit={handleSubmitReview}
        />
      )}
    </PageWrapper>
  );
};

const SectionLabel = ({ text, accent }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.875rem" }}>
    <div style={{ width: 3, height: 16, background: accent, borderRadius: 2 }} />
    <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--gray-400)", textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>
      {text}
    </p>
  </div>
);

const CATEGORY_EMOJI = {
  tools: "🔧", books: "📚", electronics: "💻",
  sports: "⚽", kitchen: "🍳", appliances: "🏠", others: "📦",
};

const BorrowCard = ({ request, index, onReturn, onReview, returningId }) => {
  const item       = request.item || {};
  const isActive   = request.status === "approved";
  const isReturned = request.status === "returned";
  const cfg        = STATUS_CONFIG[request.status] || { cls: "badge-gray", label: request.status };
  const emoji      = CATEGORY_EMOJI[item.category?.toLowerCase()] || "📦";
  const canReview  = isReturned && !request.borrowerReviewed;

  return (
    <div
      className="card animate-fade-up"
      style={{
        padding: 0,
        overflow: "hidden",
        animationDelay: `${index * 50}ms`,
        borderLeft: isActive ? "3px solid var(--brand-500)" : "3px solid transparent",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1.125rem 1.25rem" }}>

        {/* Emoji icon */}
        <div style={{
          width: 52, height: 52,
          borderRadius: "var(--radius-lg)",
          background: isActive ? "var(--brand-50)" : "var(--gray-100)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.5rem", flexShrink: 0,
        }}>
          {emoji}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--gray-900)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {item.title || "Item"}
          </p>
          <p style={{ fontSize: "0.8125rem", color: "var(--gray-400)", margin: "0.2rem 0 0" }}>
            Owner: <span style={{ fontWeight: 600, color: "var(--gray-600)" }}>{request.owner?.name || "—"}</span>
            {request.approvedAt && (
              <span> · Since {new Date(request.approvedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
            )}
            {isReturned && request.returnedAt && (
              <span> · Returned {new Date(request.returnedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
            )}
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", flexShrink: 0 }}>
          <span className={`badge ${cfg.cls}`}>{cfg.label}</span>

          {isActive && (
            <button
              className="btn btn-sm"
              disabled={returningId === request._id}
              onClick={() => onReturn(request._id)}
              style={{ background: "var(--accent-violet)", color: "white", boxShadow: "0 2px 8px rgba(139,92,246,0.3)" }}
            >
              {returningId === request._id ? "Returning…" : "↩ Return"}
            </button>
          )}

          {canReview && (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => onReview(request)}
              style={{ borderColor: "var(--accent-amber)", color: "var(--accent-amber)" }}
            >
              ⭐ Rate owner
            </button>
          )}

          {isReturned && request.borrowerReviewed && (
            <span style={{ fontSize: "0.75rem", color: "var(--brand-600)", fontWeight: 600 }}>
              ✓ Reviewed
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const SkeletonList = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="skeleton" style={{ height: 80, borderRadius: "var(--radius-lg)" }} />
    ))}
  </div>
);

export default BorrowedItems;