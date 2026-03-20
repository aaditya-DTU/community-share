const PRESETS = {
  "My Items":          { icon: "📦", color: "var(--brand-500)",   bg: "var(--brand-50)" },
  "Borrowed":          { icon: "🔁", color: "var(--accent-sky)",  bg: "#e0f2fe" },
  "Incoming Requests": { icon: "📨", color: "var(--accent-amber)",bg: "#fef3c7" },
  "My Requests":       { icon: "📋", color: "var(--accent-violet)",bg: "#ede9fe" },
};

const StatCard = ({ title, value, icon, color, bg }) => {
  const preset = PRESETS[title] || {};
  const _icon  = icon  || preset.icon  || "📊";
  const _color = color || preset.color || "var(--brand-500)";
  const _bg    = bg    || preset.bg    || "var(--brand-50)";

  return (
    <div
      className="card"
      style={{
        padding: "1.25rem 1.5rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "var(--radius-lg)",
          background: _bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.25rem",
          flexShrink: 0,
        }}
      >
        {_icon}
      </div>

      <div>
        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--gray-500)",
            fontWeight: 600,
            letterSpacing: "0.02em",
            margin: 0,
          }}
        >
          {title}
        </p>
        <p
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1.875rem",
            fontWeight: 800,
            color: _color,
            lineHeight: 1.1,
            margin: "0.125rem 0 0",
          }}
        >
          {value ?? "—"}
        </p>
      </div>
    </div>
  );
};

export default StatCard;
