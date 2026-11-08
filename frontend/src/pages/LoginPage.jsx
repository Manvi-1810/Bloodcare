
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Droplet, ArrowLeft, LockKeyhole, Mail } from "lucide-react";
import API from "../services/api";

function LoginPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email.trim() || !formData.password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await API.post("/auth/login", formData);

      const data = response.data;

      const token = data.token || data.access_token;
      const user = data.user || data;

      if (!token || !user.role) {
        throw new Error("Invalid login response from server.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      const role = user.role.toLowerCase();

      if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "donor") {
        navigate("/donor/dashboard");
      } else if (role === "hospital") {
        navigate("/hospital/dashboard");
      } else {
        setError("Your account has an unrecognized role.");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }

    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <Link to="/" className="auth-back">
          <ArrowLeft size={17} /> Back to Home
        </Link>

        <div className="auth-brand">
          <Droplet size={32} fill="currentColor" />
          <span>BloodCare</span>
        </div>

        <div className="auth-message">
          <h1>Welcome back.</h1>
          <p>
            Sign in to access your BloodCare account and manage
            blood donations, requests and inventory.
          </p>
        </div>

        <div className="auth-left-footer">
          BloodCare Management System
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-container">
          <div className="auth-heading">
            <h2>Sign in to your account</h2>
            <p>Enter your registered email and password.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>

              <div className="auth-input-wrapper">
                <Mail size={18} />
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>

              <div className="auth-input-wrapper">
                <LockKeyhole size={18} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && <div className="auth-error">{error}</div>}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
