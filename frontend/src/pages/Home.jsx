import { useEffect, useState, useCallback } from "react";
import { fetchNearbyItems } from "../api/itemApi";
import ItemCard from "../components/items/ItemCard";
import PageWrapper from "../components/common/PageWrapper";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = [
  "All",
  "Tools",
  "Books",
  "Electronics",
  "Sports",
  "Kitchen",
  "Other",
];

const Home = () => {
  const { user } = useAuth();
  const lng = user?.location?.coordinates?.[0] ?? 77.2167;
  const lat = user?.location?.coordinates?.[1] ?? 28.6448;
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchNearbyItems(lng, lat);
      setItems(data);
      setFiltered(data);
    } catch (err) {
      console.error("Failed to fetch items", err);
    } finally {
      setLoading(false);
    }
  }, [lng, lat]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Filter on search / category change
  useEffect(() => {
    let result = items;
    if (category !== "All") {
      result = result.filter(
        (item) => item.category?.toLowerCase() === category.toLowerCase(),
      );
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.title?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q),
      );
    }
    setFiltered(result);
  }, [search, category, items]);

  return (
    <PageWrapper
      title={`Hey ${user?.name?.split(" ")[0]} 👋`}
      subtitle="Discover items available in your community"
    >
      {/* ── Search + filter bar ─────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          marginBottom: "1.75rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {/* Search */}
        <div style={{ position: "relative", flex: "1 1 240px", minWidth: 200 }}>
          <span
            style={{
              position: "absolute",
              left: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--gray-400)",
              fontSize: "0.9rem",
              pointerEvents: "none",
            }}
          >
            🔍
          </span>
          <input
            type="text"
            className="input"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "2.25rem" }}
          />
        </div>

        {/* Category chips */}
        <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: "0.4rem 0.875rem",
                borderRadius: "var(--radius-full)",
                fontSize: "0.8125rem",
                fontWeight: 600,
                cursor: "pointer",
                border: "1.5px solid",
                transition: "all var(--duration-fast) var(--ease-smooth)",
                background: category === cat ? "var(--brand-500)" : "white",
                color: category === cat ? "white" : "var(--gray-600)",
                borderColor:
                  category === cat ? "var(--brand-500)" : "var(--gray-200)",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Refresh */}
        <button
          onClick={loadItems}
          className="btn btn-secondary btn-sm"
          style={{ flexShrink: 0 }}
          disabled={loading}
        >
          ↺ Refresh
        </button>
      </div>

      {/* Results count */}
      {!loading && items.length > 0 && (
        <p
          style={{
            fontSize: "0.8125rem",
            color: "var(--gray-400)",
            marginBottom: "1rem",
          }}
        >
          {filtered.length === items.length
            ? `${items.length} items nearby`
            : `${filtered.length} of ${items.length} items`}
        </p>
      )}

      {/* ── Content ─────────────────────────────────────────── */}
      {loading ? (
        <SkeletonGrid />
      ) : filtered.length === 0 ? (
        <EmptyState hasItems={items.length > 0} search={search} />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {filtered.map((item, i) => (
            <div
              key={item._id}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <ItemCard item={item} />
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
};

// ── Skeleton loader grid ──────────────────────────────────────
const SkeletonGrid = () => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
      gap: "1.25rem",
    }}
  >
    {Array.from({ length: 6 }).map((_, i) => (
      <div
        key={i}
        style={{
          background: "white",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--gray-100)",
          overflow: "hidden",
          padding: "1rem",
        }}
      >
        <div
          className="skeleton"
          style={{ height: 160, marginBottom: "0.875rem" }}
        />
        <div
          className="skeleton"
          style={{ height: 14, width: "70%", marginBottom: "0.5rem" }}
        />
        <div className="skeleton" style={{ height: 12, width: "50%" }} />
      </div>
    ))}
  </div>
);

// ── Empty state ───────────────────────────────────────────────
const EmptyState = ({ hasItems, search }) => (
  <div className="empty-state" style={{ paddingTop: "4rem" }}>
    <div className="empty-state__icon" style={{ fontSize: "1.75rem" }}>
      {hasItems ? "🔍" : "📦"}
    </div>
    <p className="empty-state__title">
      {hasItems ? "No matching items" : "No items nearby yet"}
    </p>
    <p className="empty-state__desc">
      {hasItems
        ? `Nothing matches "${search}" in this category. Try adjusting your search.`
        : "Be the first to list something in your community!"}
    </p>
    {!hasItems && (
      <Link
        to="/add-item"
        className="btn btn-primary"
        style={{ marginTop: "0.75rem", textDecoration: "none" }}
      >
        + List an item
      </Link>
    )}
  </div>
);

export default Home;
