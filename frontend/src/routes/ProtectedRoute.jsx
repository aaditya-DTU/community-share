import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--gray-50)",
          gap: "1rem",
        }}
      >
        {/* Spinning brand mark */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "var(--radius-lg)",
            background: "var(--brand-500)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
            boxShadow: "var(--shadow-brand)",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        >
          🤝
        </div>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "0.9rem",
            color: "var(--gray-400)",
            fontWeight: 500,
          }}
        >
          Loading...
        </p>
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1);    opacity: 1; }
            50%       { transform: scale(0.92); opacity: 0.7; }
          }
        `}</style>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
