import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { createReview } from "../api/reviewApi";
import ReviewModal from "../components/reviews/ReviewModal";
import PageWrapper from "../components/common/PageWrapper";
import { useNotifications } from "../context/NotificationContext";

const CATEGORY_EMOJI = {
  tools: "🔧", books: "📚", electronics: "💻",
  sports: "⚽", kitchen: "🍳", appliances: "🏠", others: "📦",
};

const MyItems = () => {
  const { addToast } = useNotifications();
  const [items, setItems]                       = useState([]);
  const [returnedRequests, setReturnedRequests] = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [reviewingRequest, setReviewingRequest] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [itemsRes, requestsRes] = await Promise.all([
          api.get("/items/my-items"),
          // fetch returned requests where owner hasn't rated yet
          api.get("/requests/incoming"),
        ]);
        setItems(itemsRes.data);
        // only keep returned ones where owner hasn't reviewed yet
        setReturnedRequests(
          requestsRes.data.filter((r) => r.status === "returned")
        );
      } catch (err) {
        console.error("Failed to load", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmitReview = async (data) => {
    try {
      await createReview(data);
      setReturnedRequests((prev) =>
        prev.map((r) =>
          r._id === reviewingRequest._id ? { ...r, ownerReviewed: true } : r
        )
      );
      setReviewingRequest(null);
      addToast({ message: "Review submitted! Trust score updated.", type: "success" });
    } catch (err) {
      addToast({ message: err?.response?.data?.message || "Failed to submit review", type: "error" });
    }
  };

  const available = items.filter((i) => i.isAvailable).length;
  const onLoan    = items.filter((i) => !i.isAvailable).length;
  const pendingRatings = returnedRequests.filter((r) => !r.ownerReviewed).length;

  return (
    <PageWrapper
      title="My Items"
      subtitle="Items you've listed for the community"
      actions={
        <Link to="/add-item" className="btn btn-primary btn-sm" style={{ textDecoration: "none" }}>
          + Add item
        </Link>
      }
    >
      {/* ── Rate borrowers banner ───────────────────────────── */}
      {!loading && pendingRatings > 0 && (
        <div
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "linear-gradient(135deg, #fffbeb, var(--brand-50))",
            border: "1px solid var(--accent-amber)",
            borderRadius: "var(--radius-lg)",
            padding: "1rem 1.25rem",
            marginBottom: "1.75rem",
            flexWrap: "wrap", gap: "0.75rem",
          }}
          className="animate-fade-down"
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "1.5rem" }}>⭐</span>
            <div>
              <p style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--gray-900)", margin: 0 }}>
                {pendingRatings} borrower{pendingRatings > 1 ? "s" : ""} waiting for your rating
              </p>
              <p style={{ fontSize: "0.8125rem", color: "var(--gray-500)", margin: "0.2rem 0 0" }}>
                Mutual reviews build trust and keep the community safe
              </p>
            </div>
          </div>
          <a href="#rate-borrowers" style={{
            fontSize: "0.8125rem", fontWeight: 700,
            color: "white", textDecoration: "none",
            background: "var(--accent-amber)",
            padding: "0.5rem 1rem",
            borderRadius: "var(--radius-full)",
          }}>
            Rate now ↓
          </a>
        </div>
      )}

      {/* ── Stats row ───────────────────────────────────────── */}
      {!loading && items.length > 0 && (
        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }} className="animate-fade-up">
          {[
            { label: "Total listed", value: items.length,  color: "var(--gray-700)",  bg: "var(--gray-100)" },
            { label: "Available",    value: available,      color: "var(--brand-700)", bg: "var(--brand-50)" },
            { label: "On loan",      value: onLoan,         color: "#92400e",           bg: "#fef3c7" },
          ].map(({ label, value, color, bg }) => (
            <div key={label} style={{ background: bg, borderRadius: "var(--radius-lg)", padding: "0.625rem 1rem", display: "flex", alignItems: "center", gap: "0.625rem" }}>
              <span style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.25rem", color }}>{value}</span>
              <span style={{ fontSize: "0.8125rem", color: "var(--gray-500)", fontWeight: 500 }}>{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Items grid ──────────────────────────────────────── */}
      {loading ? (
        <SkeletonGrid />
      ) : items.length === 0 ? (
        <div className="empty-state" style={{ paddingTop: "4rem" }}>
          <div className="empty-state__icon">📦</div>
          <p className="empty-state__title">No items listed yet</p>
          <p className="empty-state__desc">Share items you rarely use and help your community</p>
          <Link to="/add-item" className="btn btn-primary" style={{ marginTop: "0.75rem", textDecoration: "none" }}>
            List your first item
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
          {items.map((item, i) => (
            <MyItemCard key={item._id} item={item} index={i} />
          ))}
        </div>
      )}

      {/* ── Rate borrowers section ──────────────────────────── */}
      {!loading && returnedRequests.length > 0 && (
        <div id="rate-borrowers" style={{ marginTop: "3rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <div style={{ width: 3, height: 20, background: "var(--accent-amber)", borderRadius: 2 }} />
            <div>
              <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.125rem", color: "var(--gray-900)", margin: 0 }}>
                Rate Your Borrowers
              </h2>
              <p style={{ fontSize: "0.8125rem", color: "var(--gray-500)", margin: "0.2rem 0 0" }}>
                Your items were returned — share your experience with the community
              </p>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {returnedRequests.map((req, i) => (
              <BorrowerRatingCard
                key={req._id}
                request={req}
                index={i}
                onRate={setReviewingRequest}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Review modal ────────────────────────────────────── */}
      {reviewingRequest && (
        <ReviewModal
          request={reviewingRequest}
          revieweeName={reviewingRequest.borrower?.name || "the borrower"}
          context="owner"
          onClose={() => setReviewingRequest(null)}
          onSubmit={handleSubmitReview}
        />
      )}
    </PageWrapper>
  );
};

// ── Borrower rating card ──────────────────────────────────────
const BorrowerRatingCard = ({ request, index, onRate }) => {
  const item     = request.item     || {};
  const borrower = request.borrower || {};
  const rated    = request.ownerReviewed;

  const getInitials = (name = "") =>
    name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  return (
    <div
      className="card animate-fade-up"
      style={{
        padding: 0, overflow: "hidden",
        animationDelay: `${index * 50}ms`,
        borderLeft: rated ? "3px solid var(--brand-500)" : "3px solid var(--accent-amber)",
        opacity: rated ? 0.75 : 1,
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
          {getInitials(borrower.name)}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--gray-900)", margin: 0 }}>
            <span style={{ color: "var(--brand-700)" }}>{borrower.name || "Borrower"}</span>
            {" returned "}
            <span style={{ color: "var(--gray-700)" }}>{item.title || "your item"}</span>
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginTop: "0.2rem" }}>
            {borrower.trustScore !== undefined && (
              <span style={{ fontSize: "0.75rem", color: "var(--accent-amber)" }}>⭐ {borrower.trustScore}</span>
            )}
            {request.returnedAt && (
              <span style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>
                Returned {new Date(request.returnedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </span>
            )}
          </div>
        </div>

        {/* Action */}
        <div style={{ flexShrink: 0 }}>
          {rated ? (
            <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--brand-600)" }}>
              ✓ Rated
            </span>
          ) : (
            <button
              className="btn btn-sm"
              onClick={() => onRate(request)}
              style={{
                background: "var(--accent-amber)",
                color: "white",
                boxShadow: "0 2px 8px rgba(245,158,11,0.35)",
              }}
            >
              ⭐ Rate borrower
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── My item card ──────────────────────────────────────────────
const MyItemCard = ({ item, index }) => {
  const cat   = item.category?.toLowerCase() || "others";
  const emoji = CATEGORY_EMOJI[cat] || "📦";

  return (
    <div className="card animate-fade-up" style={{ padding: 0, overflow: "hidden", animationDelay: `${index * 50}ms` }}>
      <div style={{
        height: 72,
        background: item.isAvailable
          ? "linear-gradient(135deg, var(--brand-50), var(--brand-100))"
          : "linear-gradient(135deg, var(--gray-50), var(--gray-100))",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "2rem", position: "relative",
      }}>
        {emoji}
        <span className={`badge ${item.isAvailable ? "badge-green" : "badge-amber"}`}
          style={{ position: "absolute", top: "0.5rem", right: "0.625rem" }}>
          {item.isAvailable ? "Available" : "On loan"}
        </span>
      </div>
      <div style={{ padding: "1rem 1.125rem" }}>
        <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {item.category}
        </span>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", color: "var(--gray-900)", margin: "0.25rem 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {item.title}
        </h3>
        {item.description && (
          <p style={{ fontSize: "0.8125rem", color: "var(--gray-400)", margin: "0.375rem 0 0", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {item.description}
          </p>
        )}
      </div>
    </div>
  );
};

const SkeletonGrid = () => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.25rem" }}>
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="skeleton" style={{ height: 180, borderRadius: "var(--radius-xl)" }} />
    ))}
  </div>
);

export default MyItems;