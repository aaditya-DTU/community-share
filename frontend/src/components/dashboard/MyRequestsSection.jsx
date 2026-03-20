import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

const MyRequestsSection = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get("/requests/my-requests")
      .then((res) => setRequests(res.data))
      .catch((err) => console.error("Failed to load my requests", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <SectionSkeleton />;

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">My Requests</h2>
      </div>

      {requests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">📋</div>
          <p className="empty-state__title">No requests yet</p>
          <p className="empty-state__desc">Find items nearby and send your first borrow request</p>
          <Link to="/home" className="btn btn-primary btn-sm" style={{ marginTop: "0.5rem", textDecoration: "none" }}>
            Browse items
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {requests.map((req, i) => (
            <MyRequestRow key={req._id} request={req} index={i} />
          ))}
        </div>
      )}
    </div>
  );
};

const STATUS_CONFIG = {
  pending:  { cls: "badge-amber",  label: "Pending",  desc: "Waiting for owner's approval" },
  approved: { cls: "badge-green",  label: "Approved", desc: "You can now borrow this item" },
  rejected: { cls: "badge-rose",   label: "Rejected", desc: "Owner declined your request" },
  returned: { cls: "badge-gray",   label: "Returned", desc: "Successfully returned" },
};

const MyRequestRow = ({ request, index }) => {
  const item = request.item || {};
  const cfg  = STATUS_CONFIG[request.status] || { cls: "badge-gray", label: request.status, desc: "" };

  return (
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
      <div style={{
        width: 48, height: 48,
        borderRadius: "var(--radius-md)",
        background: "var(--gray-50)",
        border: "1px solid var(--gray-100)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "1.375rem", flexShrink: 0,
      }}>
        📋
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--gray-800)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {item.title || "Item"}
        </p>
        <p style={{ fontSize: "0.8125rem", color: "var(--gray-400)", margin: "0.15rem 0 0" }}>
          {cfg.desc}{request.owner?.name ? ` · Owner: ${request.owner.name}` : ""}
        </p>
      </div>

      <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
    </div>
  );
};

const SectionSkeleton = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="skeleton" style={{ height: 72, borderRadius: "var(--radius-lg)" }} />
    ))}
  </div>
);

export default MyRequestsSection;
