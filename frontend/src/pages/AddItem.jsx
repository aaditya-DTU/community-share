import { useState } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import ItemForm from "../components/items/ItemForm";
import { useNotifications } from "../context/NotificationContext";

const AddItem = () => {
  const navigate = useNavigate();
  const { addToast } = useNotifications();

  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    latitude: "",
    longitude: "",
  });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((prev) => ({
          ...prev,
          latitude:  pos.coords.latitude,
          longitude: pos.coords.longitude,
        }));
        setError("");
      },
      () => setError("Failed to get location. Please allow location access.")
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/items", {
        title:       form.title,
        category:    form.category,
        description: form.description,
        location: {
          type:        "Point",
          coordinates: [Number(form.longitude), Number(form.latitude)],
        },
      });
      addToast({ message: `"${form.title}" listed successfully!`, type: "success" });
      navigate("/my-items");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100dvh - var(--navbar-h))",
        background: "var(--gray-50)",
        padding: "2rem var(--content-pad) 3rem",
      }}
    >
      <div style={{ maxWidth: 520, margin: "0 auto" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", fontSize: "0.8125rem" }}>
          <Link to="/my-items" style={{ color: "var(--gray-400)", textDecoration: "none" }}>
            My Items
          </Link>
          <span style={{ color: "var(--gray-300)" }}>›</span>
          <span style={{ color: "var(--gray-600)", fontWeight: 600 }}>Add New</span>
        </div>

        {/* Card */}
        <div
          className="card animate-fade-up"
          style={{ padding: "2rem" }}
        >
          {/* Header */}
          <div style={{ marginBottom: "1.75rem" }}>
            <div style={{
              width: 44, height: 44,
              background: "var(--brand-100)",
              borderRadius: "var(--radius-lg)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.25rem",
              marginBottom: "1rem",
            }}>
              📦
            </div>
            <h1 style={{
              fontFamily: "var(--font-display)",
              fontWeight: 800,
              fontSize: "1.5rem",
              color: "var(--gray-900)",
              letterSpacing: "-0.025em",
              margin: "0 0 0.25rem",
            }}>
              List a new item
            </h1>
            <p style={{ fontSize: "0.9rem", color: "var(--gray-500)", margin: 0 }}>
              Share something you rarely use with your community
            </p>
          </div>

          <ItemForm
            form={form}
            onChange={handleChange}
            onLocationClick={getCurrentLocation}
            error={error}
            loading={loading}
            onSubmit={handleSubmit}
          />
        </div>

        {/* Tip */}
        <div style={{
          marginTop: "1rem",
          padding: "0.875rem 1rem",
          background: "var(--brand-50)",
          borderRadius: "var(--radius-lg)",
          border: "1px solid var(--brand-100)",
          fontSize: "0.8125rem",
          color: "var(--brand-700)",
        }}>
          💡 <strong>Tip:</strong> Items with good descriptions and accurate locations get more borrow requests.
        </div>
      </div>
    </div>
  );
};

export default AddItem;
