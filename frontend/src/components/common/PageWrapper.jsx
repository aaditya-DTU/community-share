const PageWrapper = ({ title, subtitle, actions, children, narrow = false }) => {
  return (
    <div className="page-wrapper" style={{ paddingBottom: "3rem" }}>
      <div
        className="content-container"
        style={{ maxWidth: narrow ? 720 : "var(--content-max)" }}
      >
        {/* Page header */}
        {title && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "1rem",
              marginBottom: "1.75rem",
              paddingTop: "2rem",
              flexWrap: "wrap",
            }}
            className="animate-fade-up"
          >
            <div>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "clamp(1.4rem, 3vw, 1.875rem)",
                  color: "var(--gray-900)",
                  margin: 0,
                  letterSpacing: "-0.025em",
                }}
              >
                {title}
              </h1>
              {subtitle && (
                <p
                  style={{
                    fontSize: "0.9375rem",
                    color: "var(--gray-500)",
                    marginTop: "0.3rem",
                    marginBottom: 0,
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>

            {/* Optional action buttons slot */}
            {actions && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  flexShrink: 0,
                }}
              >
                {actions}
              </div>
            )}
          </div>
        )}

        {/* Page content */}
        <div className="animate-fade-up delay-75">{children}</div>
      </div>
    </div>
  );
};

export default PageWrapper;
