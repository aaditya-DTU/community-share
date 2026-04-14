import { useState } from "react";
import RequestModal from "../requests/RequestModal";
import { useAuth } from "../../context/AuthContext";

const CATEGORY_EMOJI = {
  tools: "🔧", books: "📚", electronics: "💻",
  sports: "⚽", kitchen: "🍳", appliances: "🏠", others: "📦", other: "📦",
};

const CATEGORY_BG = {
  tools:       ["#fef3c7", "#92400e"],
  books:       ["#dbeafe", "#1e40af"],
  electronics: ["#ede9fe", "#5b21b6"],
  sports:      ["#dcfce7", "#166534"],
  kitchen:     ["#ffedd5", "#9a3412"],
  appliances:  ["#f0fdf4", "#15803d"],
  others:      ["#f1f5f9", "#334155"],
  other:       ["#f1f5f9", "#334155"],
};

const getInitials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

const ItemCard = ({ item, onRequestSuccess }) => {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);

  const cat     = item.category?.toLowerCase() || "other";
  const emoji   = CATEGORY_EMOJI[cat] || "📦";
  const [bg, fg] = CATEGORY_BG[cat] || ["#f1f5f9", "#334155"];
  const isOwn   = user?._id === (item.owner?._id || item.owner);

  return (
    <>
      <div
        style={{
          background: "white",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--gray-100)",
          boxShadow: "var(--shadow-sm)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          transition: "transform var(--duration-base) var(--ease-smooth), box-shadow var(--duration-base) var(--ease-smooth)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-3px)";
          e.currentTarget.style.boxShadow = "var(--shadow-lg)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "var(--shadow-sm)";
        }}
      >
        {/* ── Category banner ────────────────────────────────── */}
        <div
          style={{
            height: 100,
            background: `linear-gradient(135deg, ${bg}, ${bg}dd)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2.75rem",
            position: "relative",
          }}
        >
          {item.images?.[0] ? (
            <img
              src={item.images[0]}
              alt={item.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ fontSize: "2.75rem" }}>{emoji}</span>
          )}
          {/* Availability pill */}
          <span
            className={`badge ${item.isAvailable ? "badge-green" : "badge-rose"}`}
            style={{
              position: "absolute",
              top: "0.625rem",
              right: "0.625rem",
            }}
          >
            {item.isAvailable ? "Available" : "On loan"}
          </span>
        </div>

        {/* ── Body ───────────────────────────────────────────── */}
        <div style={{ padding: "1rem 1.125rem", flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {/* Category chip */}
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              color: fg,
              background: bg,
              padding: "0.2rem 0.5rem",
              borderRadius: "var(--radius-full)",
              alignSelf: "flex-start",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {item.category}
          </span>

          {/* Title */}
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "1rem",
              color: "var(--gray-900)",
              margin: 0,
              lineHeight: 1.3,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {item.title}
          </h3>

          {/* Description */}
          {item.description && (
            <p
              style={{
                fontSize: "0.8125rem",
                color: "var(--gray-500)",
                margin: 0,
                lineHeight: 1.5,
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {item.description}
            </p>
          )}

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Owner row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: "0.625rem",
              borderTop: "1px solid var(--gray-100)",
              marginTop: "0.375rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div
                style={{
                  width: 26, height: 26, borderRadius: "50%",
                  background: "var(--brand-100)", color: "var(--brand-700)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.65rem", fontWeight: 800,
                  fontFamily: "var(--font-display)",
                }}
              >
                {getInitials(item.owner?.name)}
              </div>
              <div>
                <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--gray-700)", margin: 0 }}>
                  {item.owner?.name || "Unknown"}
                </p>
                {item.owner?.trustScore !== undefined && (
                  <p style={{ fontSize: "0.7rem", color: "var(--accent-amber)", margin: 0 }}>
                    ⭐ {item.owner.trustScore}
                  </p>
                )}
              </div>
            </div>

            {/* Distance */}
            {item.distance !== undefined && (
              <span style={{ fontSize: "0.75rem", color: "var(--gray-400)" }}>
                📍 {item.distance < 1 ? `${Math.round(item.distance * 1000)}m` : `${item.distance.toFixed(1)}km`}
              </span>
            )}
          </div>

          {/* CTA */}
          {!isOwn && (
            <button
              onClick={() => setShowModal(true)}
              disabled={!item.isAvailable}
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "0.625rem" }}
            >
              {item.isAvailable ? "Request to borrow" : "Currently unavailable"}
            </button>
          )}

          {isOwn && (
            <div
              style={{
                textAlign: "center",
                padding: "0.5rem",
                background: "var(--gray-50)",
                borderRadius: "var(--radius-md)",
                fontSize: "0.8125rem",
                color: "var(--gray-400)",
                fontWeight: 500,
                marginTop: "0.625rem",
              }}
            >
              Your listing
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <RequestModal
          item={item}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            setShowModal(false);
            onRequestSuccess?.();
          }}
        />
      )}
    </>
  );
};

export default ItemCard;