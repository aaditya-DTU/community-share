import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const BorrowedSection = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get("/requests/borrowed")
      .then((res) => setRequests(res.data))
      .catch((err) => console.error("Failed to load borrowed items", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="skeleton" style={{ height: 72, borderRadius: "var(--radius-lg)" }} />
      ))}
    </div>
  );

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">Borrowed Items</h2>
        <Link
          to="/borrowed"
          className="btn btn-primary btn-sm"
          style={{ textDecoration: "none" }}
        >
          Manage → Return & Review
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">🔁</div>
          <p className="empty-state__title">Nothing borrowed yet</p>
          <p className="empty-state__desc">Browse nearby items to borrow something</p>
          <Link to="/home" className="btn btn-primary btn-sm" style={{ marginTop: "0.5rem", textDecoration: "none" }}>
            Browse items
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {requests.map((req, i) => (
            <div
              key={req._id}
              className="card-flat animate-fade-up"
              style={{
                padding: "1rem 1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                animationDelay: `${i * 50}ms`,
                borderLeft: req.status === "approved" ? "3px solid var(--brand-500)" : "3px solid var(--gray-200)",
              }}
            >
              <div style={{
                width: 44, height: 44,
                borderRadius: "var(--radius-md)",
                background: req.status === "approved" ? "var(--brand-50)" : "var(--gray-100)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.25rem", flexShrink: 0,
              }}>
                🔁
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--gray-800)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {req.item?.title || "Item"}
                </p>
                <p style={{ fontSize: "0.8125rem", color: "var(--gray-400)", margin: "0.15rem 0 0" }}>
                  Owner: {req.owner?.name || "—"}
                  {req.approvedAt && ` · Since ${new Date(req.approvedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`}
                </p>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                <span className={`badge ${req.status === "approved" ? "badge-green" : "badge-gray"}`}>
                  {req.status === "approved" ? "Active" : "Returned"}
                </span>
                {/* Direct link to /borrowed for return action */}
                {req.status === "approved" && (
                  <Link
                    to="/borrowed"
                    className="btn btn-sm"
                    style={{
                      textDecoration: "none",
                      background: "var(--accent-violet)",
                      color: "white",
                      boxShadow: "0 2px 8px rgba(139,92,246,0.3)",
                    }}
                  >
                    ↩ Return
                  </Link>
                )}
              </div>
            </div>
          ))}

          {/* Footer link */}
          <Link
            to="/borrowed"
            style={{
              display: "block",
              textAlign: "center",
              fontSize: "0.8125rem",
              color: "var(--brand-600)",
              fontWeight: 600,
              padding: "0.5rem",
              textDecoration: "none",
            }}
          >
            Go to Borrowed Items to return & leave reviews →
          </Link>
        </div>
      )}
    </div>
  );
};

export default BorrowedSection;