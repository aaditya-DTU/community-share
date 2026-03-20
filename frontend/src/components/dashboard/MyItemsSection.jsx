import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const MyItemsSection = () => {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/items/my-items")
      .then((res) => setItems(res.data))
      .catch((err) => console.error("Failed to load my items", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <SectionSkeleton />;

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">My Listed Items</h2>
        <Link to="/add-item" className="btn btn-primary btn-sm" style={{ textDecoration: "none" }}>
          + Add item
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">📦</div>
          <p className="empty-state__title">No items listed yet</p>
          <p className="empty-state__desc">Share something you rarely use with your community</p>
          <Link to="/add-item" className="btn btn-primary btn-sm" style={{ marginTop: "0.5rem", textDecoration: "none" }}>
            List your first item
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {items.map((item, i) => (
            <ItemRow key={item._id} item={item} index={i} />
          ))}
        </div>
      )}
    </div>
  );
};

const ItemRow = ({ item, index }) => (
  <div
    className="card-flat animate-fade-up"
    style={{
      padding: "1rem 1.25rem",
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      animationDelay: `${index * 50}ms`,
    }}
  >
    {/* Emoji / image placeholder */}
    <div style={{
      width: 48, height: 48,
      borderRadius: "var(--radius-md)",
      background: "var(--brand-50)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "1.375rem", flexShrink: 0,
    }}>
      {CATEGORY_EMOJI[item.category?.toLowerCase()] || "📦"}
    </div>

    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--gray-800)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {item.title}
      </p>
      <p style={{ fontSize: "0.8125rem", color: "var(--gray-400)", margin: "0.15rem 0 0" }}>
        {item.category} {item.location?.city ? `· ${item.location.city}` : ""}
      </p>
    </div>

    <span className={`badge ${item.isAvailable ? "badge-green" : "badge-amber"}`}>
      {item.isAvailable ? "Available" : "On loan"}
    </span>
  </div>
);

const CATEGORY_EMOJI = {
  tools: "🔧", books: "📚", electronics: "💻",
  sports: "⚽", kitchen: "🍳", other: "📦",
};

const SectionSkeleton = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="skeleton" style={{ height: 72, borderRadius: "var(--radius-lg)" }} />
    ))}
  </div>
);

export default MyItemsSection;
