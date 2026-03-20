const CATEGORIES = [
  { value: "tools",       label: "🔧 Tools" },
  { value: "books",       label: "📚 Books" },
  { value: "electronics", label: "💻 Electronics" },
  { value: "appliances",  label: "🏠 Appliances" },
  { value: "sports",      label: "⚽ Sports" },
  { value: "kitchen",     label: "🍳 Kitchen" },
  { value: "others",      label: "📦 Others" },
];

const ItemForm = ({ form, onChange, onLocationClick, error, loading, onSubmit }) => {
  return (
    <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Error banner */}
      {error && (
        <div
          style={{
            background: "#fff1f2",
            border: "1px solid #fecdd3",
            borderRadius: "var(--radius-md)",
            padding: "0.625rem 0.875rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
          className="animate-fade-down"
        >
          <span>⚠️</span>
          <p style={{ fontSize: "0.875rem", color: "var(--accent-rose)", margin: 0, fontWeight: 500 }}>
            {error}
          </p>
        </div>
      )}

      {/* Title */}
      <div>
        <label className="label">Item title</label>
        <input
          name="title"
          placeholder="e.g. Power Drill, Camping Tent"
          value={form.title}
          onChange={onChange}
          className="input"
          required
        />
      </div>

      {/* Category */}
      <div>
        <label className="label">Category</label>
        <select
          name="category"
          value={form.category}
          onChange={onChange}
          className="input"
          required
          style={{ cursor: "pointer" }}
        >
          <option value="">Select a category</option>
          {CATEGORIES.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="label">
          Description{" "}
          <span style={{ fontWeight: 400, color: "var(--gray-400)" }}>(optional)</span>
        </label>
        <textarea
          name="description"
          placeholder="Condition, usage notes, anything useful for the borrower..."
          value={form.description}
          onChange={onChange}
          rows={3}
          className="input"
          style={{ resize: "vertical", minHeight: 80 }}
        />
      </div>

      {/* Location */}
      <div>
        <label className="label">Location</label>
        <div
          style={{
            background: "var(--gray-50)",
            border: "1.5px solid var(--gray-200)",
            borderRadius: "var(--radius-md)",
            padding: "0.875rem 1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            {form.latitude && form.longitude ? (
              <div>
                <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--brand-700)", margin: 0 }}>
                  📍 Location captured
                </p>
                <p style={{ fontSize: "0.75rem", color: "var(--gray-400)", margin: "0.2rem 0 0" }}>
                  {Number(form.latitude).toFixed(5)}, {Number(form.longitude).toFixed(5)}
                </p>
              </div>
            ) : (
              <p style={{ fontSize: "0.875rem", color: "var(--gray-400)", margin: 0 }}>
                No location set yet
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onLocationClick}
            className="btn btn-outline btn-sm"
          >
            📍 Use my location
          </button>
        </div>
        {/* Hidden required inputs so form validation works */}
        <input type="hidden" name="latitude"  value={form.latitude}  required />
        <input type="hidden" name="longitude" value={form.longitude} required />
      </div>

      {/* Submit */}
      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading || !form.latitude}
        style={{ width: "100%", padding: "0.75rem", marginTop: "0.25rem" }}
      >
        {loading ? (
          <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <LoadingSpinner /> Listing item...
          </span>
        ) : (
          "List item →"
        )}
      </button>
    </form>
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

export default ItemForm;
