import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    location: null
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await register(
        form.name,
        form.email,
        form.password
      );

      navigate("/home");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100dvh - var(--navbar-h))",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #f0fdf4 0%, #ffffff 55%, #f8fafc 100%)",
        padding: "2rem var(--content-pad)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "white",
          borderRadius: "var(--radius-2xl)",
          boxShadow: "var(--shadow-xl)",
          border: "1px solid var(--gray-100)",
          padding: "2.5rem",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontWeight: 700,
            marginBottom: "1rem",
          }}
        >
          Create Account
        </h2>

        {error && (
          <p style={{ color: "red", fontSize: "0.9rem" }}>{error}</p>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            required
            className="input"
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className="input"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className="input"
          />

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? "Creating..." : "Register"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "1rem",
            fontSize: "0.85rem",
          }}
        >
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>

        {/* Info */}
        <p
          style={{
            fontSize: "0.75rem",
            color: "#888",
            textAlign: "center",
            marginTop: "1rem",
          }}
        >
          📍 Location is used to show nearby items
        </p>
      </div>
    </div>
  );
};

export default Register;