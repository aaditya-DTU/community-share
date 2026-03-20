import { useState, useEffect } from "react";
import { createBorrowRequest } from "../../api/requestApi";
import { useNotifications } from "../../context/NotificationContext";

const CATEGORY_EMOJI = {
  tools: "🔧", books: "📚", electronics: "💻",
  sports: "⚽", kitchen: "🍳", appliances: "🏠", others: "📦", other: "📦",
};

const getInitials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

const RequestModal = ({ item, onClose, onSuccess }) => {
  const { addToast } = useNotifications();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);

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
      await createBorrowRequest(item._id, message);
      setSent(true);
      addToast({ message: `Request sent for "${item.title}"!`, type: "success" });
    } catch (err) {
      addToast({
        message: err?.response?.data?.message || "Failed to send request",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const cat   = item.category?.toLowerCase() || "other";
  const emoji = CATEGORY_EMOJI[cat] || "📦";

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-panel" style={{ maxWidth: 440 }}>

        {/* ── Success state ──────────────────────────────────── */}
        {sent ? (
          <div style={{ padding: "2.5rem 2rem", textAlign: "center" }}>
            <div style={{
              width: 64, height: 64,
              borderRadius: "50%",
              background: "var(--brand-100)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "2rem",
              margin: "0 auto 1.25rem",
              animation: "scale-in var(--duration-base) var(--ease-spring) both",
            }}>
              ✓
            </div>
            <h3 style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800, fontSize: "1.25rem",
              color: "var(--gray-900)", margin: "0 0 0.5rem",
            }}>
              Request sent!
            </h3>
            <p style={{ fontSize: "0.9rem", color: "var(--gray-500)", margin: "0 0 1.75rem" }}>
              Your request for <strong style={{ color: "var(--gray-800)" }}>{item.title}</strong> has been sent to the owner. You'll get notified when they respond.
            </p>
            <button
              className="btn btn-primary"
              style={{ width: "100%" }}
              onClick={() => { onSuccess?.(); onClose(); }}
            >
              Done
            </button>
          </div>
        ) : (
          <>
            {/* ── Header ───────────────────────────────────────── */}
            <div style={{
              padding: "1.25rem 1.5rem 1rem",
              borderBottom: "1px solid var(--gray-100)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <h2 style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800, fontSize: "1.1rem",
                color: "var(--gray-900)", margin: 0,
              }}>
                Request to borrow
              </h2>
              <button
                onClick={onClose}
                style={{
                  width: 32, height: 32,
                  borderRadius: "var(--radius-md)",
                  background: "none", border: "none",
                  cursor: "pointer", fontSize: "1rem",
                  color: "var(--gray-400)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "background var(--duration-fast)",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--gray-100)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* ── Item preview ─────────────────────────────────── */}
            <div style={{ padding: "1rem 1.5rem" }}>
              <div style={{
                background: "var(--gray-50)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--gray-100)",
                padding: "0.875rem 1rem",
                display: "flex", alignItems: "center", gap: "0.875rem",
              }}>
                <div style={{
                  width: 44, height: 44,
                  borderRadius: "var(--radius-md)",
                  background: "var(--brand-100)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.375rem", flexShrink: 0,
                }}>
                  {emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--gray-900)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.title}
                  </p>
                  <p style={{ fontSize: "0.8125rem", color: "var(--gray-400)", margin: "0.15rem 0 0" }}>
                    {item.category}
                  </p>
                </div>
                <span className="badge badge-green">Available</span>
              </div>

              {/* Owner info */}
              {item.owner && (
                <div style={{
                  display: "flex", alignItems: "center", gap: "0.625rem",
                  marginTop: "0.75rem", padding: "0 0.25rem",
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: "var(--brand-100)", color: "var(--brand-700)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.7rem",
                  }}>
                    {getInitials(item.owner.name)}
                  </div>
                  <div>
                    <span style={{ fontSize: "0.8125rem", color: "var(--gray-600)", fontWeight: 500 }}>
                      {item.owner.name}
                    </span>
                    {item.owner.trustScore !== undefined && (
                      <span style={{ fontSize: "0.75rem", color: "var(--accent-amber)", marginLeft: "0.375rem" }}>
                        ⭐ {item.owner.trustScore}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ── Message ──────────────────────────────────────── */}
            <div style={{ padding: "0 1.5rem 1.25rem" }}>
              <label className="label">
                Message to owner{" "}
                <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(optional)</span>
              </label>
              <textarea
                placeholder="Introduce yourself, explain why you need it, when you'd return it..."
                className="input"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ resize: "vertical", minHeight: 80 }}
              />
              <p style={{ fontSize: "0.75rem", color: "var(--gray-400)", marginTop: "0.375rem" }}>
                A good message increases your chances of approval.
              </p>
            </div>

            {/* ── Actions ──────────────────────────────────────── */}
            <div style={{
              padding: "1rem 1.5rem 1.5rem",
              display: "flex", gap: "0.75rem",
              borderTop: "1px solid var(--gray-100)",
            }}>
              <button
                onClick={onClose}
                className="btn btn-secondary"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn btn-primary"
                style={{ flex: 2 }}
              >
                {loading ? (
                  <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <LoadingSpinner /> Sending...
                  </span>
                ) : (
                  "Send request →"
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const LoadingSpinner = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
    style={{ animation: "spin 0.7s linear infinite" }}>
    <circle cx="8" cy="8" r="6" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
    <path d="M8 2a6 6 0 0 1 6 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </svg>
);

export default RequestModal;
