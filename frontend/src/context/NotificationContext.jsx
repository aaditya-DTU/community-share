import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";
import api from "../api/axios";

const NotificationContext = createContext(null);

const POLL_INTERVAL = 30_000; // 30s polling

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const intervalRef = useRef(null);

  // ── Fetch notifications ─────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data } = await api.get("/notifications");
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ── Mark single as read ─────────────────────────────────────
  const markAsRead = useCallback(async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  }, []);

  // ── Mark all as read ────────────────────────────────────────
  const markAllAsRead = useCallback(async () => {
    try {
      await api.patch("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  }, []);

  // ── Toast helpers ────────────────────────────────────────────
  const addToast = useCallback(({ message, type = "info", duration = 3500 }) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Polling ──────────────────────────────────────────────────
  useEffect(() => {
    if (user) {
      fetchNotifications();
      intervalRef.current = setInterval(fetchNotifications, POLL_INTERVAL);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
    return () => clearInterval(intervalRef.current);
  }, [user, fetchNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        toasts,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        addToast,
        removeToast,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </NotificationContext.Provider>
  );
};

// ── Toast UI ─────────────────────────────────────────────────
const TOAST_ICONS = {
  success: "✓",
  error:   "✕",
  info:    "ℹ",
  warning: "⚠",
};

const TOAST_STYLES = {
  success: { bg: "var(--brand-600)",   text: "#fff" },
  error:   { bg: "var(--accent-rose)", text: "#fff" },
  info:    { bg: "var(--gray-800)",    text: "#fff" },
  warning: { bg: "var(--accent-amber)",text: "#fff" },
};

function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null;
  return (
    <div
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        alignItems: "flex-end",
      }}
    >
      {toasts.map((toast) => {
        const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
        return (
          <div
            key={toast.id}
            onClick={() => onRemove(toast.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              background: style.bg,
              color: style.text,
              padding: "0.625rem 1rem",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-lg)",
              fontSize: "0.875rem",
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              cursor: "pointer",
              maxWidth: "320px",
              animation: "slide-in-right var(--duration-slow) var(--ease-smooth) both",
            }}
          >
            <span
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                flexShrink: 0,
              }}
            >
              {TOAST_ICONS[toast.type]}
            </span>
            <span style={{ flex: 1 }}>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
}

export const useNotifications = () => useContext(NotificationContext);
