import { useEffect, useRef, useState } from "react";
import { useNotifications } from "../../context/NotificationContext";

const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleToggle = () => setOpen((p) => !p);

  const handleNotifClick = (n) => {
    if (!n.isRead) markAsRead(n._id);
  };

  // Relative time helper
  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1)  return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24)  return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div ref={panelRef} style={{ position: "relative" }}>
      {/* Bell button */}
      <button
        onClick={handleToggle}
        style={{
          position: "relative",
          width: 36,
          height: 36,
          borderRadius: "var(--radius-md)",
          background: open ? "var(--gray-100)" : "transparent",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "1.1rem",
          transition: "background var(--duration-fast) var(--ease-smooth)",
          color: "var(--gray-600)",
        }}
        onMouseEnter={(e) => { if (!open) e.currentTarget.style.background = "var(--gray-100)"; }}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.background = "transparent"; }}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
      >
        🔔
        {unreadCount > 0 && <span className="notif-dot" />}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            right: 0,
            width: 340,
            background: "var(--surface-card)",
            borderRadius: "var(--radius-xl)",
            boxShadow: "var(--shadow-xl)",
            border: "1px solid var(--gray-100)",
            overflow: "hidden",
            animation: "fade-down var(--duration-base) var(--ease-smooth) both",
            zIndex: 50,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0.875rem 1rem 0.75rem",
              borderBottom: "1px solid var(--gray-100)",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "0.9375rem",
                color: "var(--gray-900)",
              }}
            >
              Notifications
              {unreadCount > 0 && (
                <span
                  style={{
                    marginLeft: "0.5rem",
                    background: "var(--brand-500)",
                    color: "white",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    padding: "0.1rem 0.4rem",
                    borderRadius: "var(--radius-full)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "var(--brand-600)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "var(--radius-sm)",
                  transition: "background var(--duration-fast)",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--brand-50)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "none"}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 320, overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div className="empty-state" style={{ padding: "2rem 1rem" }}>
                <div className="empty-state__icon">🔔</div>
                <p className="empty-state__title">All caught up!</p>
                <p className="empty-state__desc">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n, i) => (
                <button
                  key={n._id}
                  onClick={() => handleNotifClick(n)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.75rem",
                    padding: "0.75rem 1rem",
                    background: n.isRead ? "transparent" : "var(--brand-50)",
                    border: "none",
                    borderBottom: i < notifications.length - 1 ? "1px solid var(--gray-100)" : "none",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background var(--duration-fast) var(--ease-smooth)",
                    animation: `fade-up var(--duration-slow) var(--ease-smooth) ${i * 40}ms both`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = n.isRead ? "var(--gray-50)" : "var(--brand-100)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = n.isRead ? "transparent" : "var(--brand-50)";
                  }}
                >
                  {/* Dot indicator */}
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: n.isRead ? "transparent" : "var(--brand-500)",
                      flexShrink: 0,
                      marginTop: "0.4rem",
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--gray-700)",
                        fontWeight: n.isRead ? 400 : 500,
                        lineHeight: 1.5,
                        margin: 0,
                      }}
                    >
                      {n.message}
                    </p>
                    {n.createdAt && (
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--gray-400)",
                          marginTop: "0.2rem",
                          display: "block",
                        }}
                      >
                        {timeAgo(n.createdAt)}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
