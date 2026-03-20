import { useState, useEffect } from "react";

const LABELS = { 1: "Poor 😕", 2: "Fair 😐", 3: "Good 🙂", 4: "Great 😊", 5: "Excellent 🌟" };
const LABEL_COLORS = {
  1: "var(--accent-rose)",
  2: "#f97316",
  3: "var(--accent-amber)",
  4: "var(--brand-500)",
  5: "var(--brand-600)",
};

const PROMPTS = {
  borrower: [
    "Was the item as described?",
    "Was the owner responsive and helpful?",
    "Would you borrow from them again?",
  ],
  owner: [
    "Did they return the item on time?",
    "Was the item returned in good condition?",
    "Would you lend to them again?",
  ],
};

const ReviewModal = ({ request, revieweeName, context = "borrower", onClose, onSubmit }) => {
  const [rating,  setRating]  = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(null);

  const item          = request?.item || {};
  const activeRating  = hovered ?? rating;
  const prompts       = PROMPTS[context] || PROMPTS.borrower;
  const title         = context === "owner" ? "Rate the borrower" : "Rate the owner";

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit({
        requestId: request._id,
        rating:    Number(rating),
        comment,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-panel" style={{ maxWidth: 460 }}>

        {/* Header */}
        <div style={{
          padding: "1.25rem 1.5rem 1rem",
          borderBottom: "1px solid var(--gray-100)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", color: "var(--gray-900)", margin: 0 }}>
              {title}
            </h2>
            <p style={{ fontSize: "0.8125rem", color: "var(--gray-400)", margin: "0.2rem 0 0" }}>
              {revieweeName} · {item.title}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: "var(--radius-md)", background: "none", border: "none", cursor: "pointer", fontSize: "1rem", color: "var(--gray-400)", display: "flex", alignItems: "center", justifyContent: "center" }}
            onMouseEnter={(e) => e.currentTarget.style.background = "var(--gray-100)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "none"}
          >✕</button>
        </div>

        <div style={{ padding: "1.25rem 1.5rem 1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* Star rating */}
          <div>
            <label className="label">Your rating</label>
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    fontSize: "2.25rem",
                    background: "none", border: "none", cursor: "pointer",
                    padding: "0.1rem", lineHeight: 1,
                    transition: "transform var(--duration-fast) var(--ease-spring)",
                    transform: star <= activeRating ? "scale(1.2)" : "scale(1)",
                    filter: star <= activeRating ? "none" : "grayscale(1) opacity(0.25)",
                  }}
                >⭐</button>
              ))}
            </div>
            <p style={{ fontSize: "1rem", fontWeight: 700, color: LABEL_COLORS[activeRating], margin: 0, transition: "color var(--duration-fast)" }}>
              {LABELS[activeRating]}
            </p>
          </div>

          {/* Prompt chips */}
          <div>
            <label className="label" style={{ marginBottom: "0.5rem" }}>Quick prompts</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
              {prompts.map((p) => {
                const active = comment.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setComment((prev) =>
                      prev.includes(p) ? prev.replace(p, "").trim() : (prev ? `${prev} ${p}` : p)
                    )}
                    style={{
                      fontSize: "0.8125rem",
                      padding: "0.35rem 0.75rem",
                      borderRadius: "var(--radius-full)",
                      border: "1.5px solid",
                      cursor: "pointer",
                      fontFamily: "var(--font-body)",
                      fontWeight: 500,
                      transition: "all var(--duration-fast)",
                      background: active ? "var(--brand-500)" : "white",
                      color: active ? "white" : "var(--gray-600)",
                      borderColor: active ? "var(--brand-500)" : "var(--gray-200)",
                    }}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="label">
              Write a review{" "}
              <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(optional)</span>
            </label>
            <textarea
              placeholder="Share your experience..."
              className="input"
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ resize: "vertical", minHeight: 80 }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }} disabled={loading}>
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={loading} className="btn btn-primary" style={{ flex: 2 }}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <LoadingSpinner /> Submitting...
                </span>
              ) : "Submit review →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const LoadingSpinner = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: "spin 0.7s linear infinite" }}>
    <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
    <path d="M8 2a6 6 0 0 1 6 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </svg>
);

export default ReviewModal;