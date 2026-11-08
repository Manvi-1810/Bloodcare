
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Droplet,
  Eye,
  EyeOff,
  UserRound,
  Mail,
  Phone,
  MapPin,
  LockKeyhole,
  ArrowLeft,
  Hospital
} from "lucide-react";
import API from "../services/api";

function RegisterPage() {
  const navigate = useNavigate();

  const [role, setRole] = useState("donor");
  const [bloodGroups, setBloodGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    blood_group_id: "",
    hospital_name: ""
  });

  useEffect(() => {
    const fetchBloodGroups = async () => {
      try {
        const response = await API.get("/blood-groups");
        const data = response.data;

        setBloodGroups(
          Array.isArray(data)
            ? data
            : Array.isArray(data.bloodGroups)
              ? data.bloodGroups
              : Array.isArray(data.data)
                ? data.data
                : []
        );
      } catch (err) {
        console.error("Unable to load blood groups:", err);
        setError("Unable to load blood groups. Please refresh the page.");
      }
    };

    fetchBloodGroups();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getDashboardPath = (userRole) => {
    const normalizedRole = userRole?.toLowerCase();

    if (normalizedRole === "admin") return "/admin/dashboard";
    if (normalizedRole === "donor") return "/donor/dashboard";
    if (normalizedRole === "hospital") return "/hospital/dashboard";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (role === "donor" && !formData.blood_group_id) {
      setError("Please select your blood group.");
      return;
    }

    if (role === "hospital" && !formData.hospital_name.trim()) {
      setError("Please enter your hospital name.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role,
        phone: formData.phone.trim(),
        address: formData.address.trim()
      };

      if (role === "donor") {
        payload.blood_group_id = Number(formData.blood_group_id);
      }

      if (role === "hospital") {
        payload.hospital_name = formData.hospital_name.trim();
      }

      const response = await API.post("/auth/register", payload);

      const data = response.data;
      const token = data.token;
      const user = data.user;

      if (!token || !user?.role) {
        throw new Error("Registration succeeded, but login information was not returned.");
      }

      const dashboardPath = getDashboardPath(user.role);

      if (!dashboardPath) {
        throw new Error("Your account has an unrecognized role.");
      }

      // Save authentication details
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setSuccess("Account created successfully! Opening your dashboard...");

      navigate(dashboardPath, { replace: true });

    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Registration failed. Please try again."
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
          <h1>Join BloodCare.</h1>
          <p>
            Create your account and become part of a connected
            blood management system that brings donors and
            hospitals together.
          </p>
        </div>

        <div className="auth-left-footer">
          BloodCare Management System
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-container register-container">
          <div className="auth-heading">
            <h2>Create an account</h2>
            <p>Enter your details to get started.</p>
          </div>

          <div className="role-selector">
            <button
              type="button"
              className={role === "donor" ? "role-option selected" : "role-option"}
              onClick={() => setRole("donor")}
              disabled={loading}
            >
              <Droplet size={18} /> Donor
            </button>

            <button
              type="button"
              className={role === "hospital" ? "role-option selected" : "role-option"}
              onClick={() => setRole("hospital")}
              disabled={loading}
            >
              <Hospital size={18} /> Hospital
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">Full Name / Contact Person</label>
              <div className="auth-input-wrapper">
                <UserRound size={18} />
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your name"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {role === "hospital" && (
              <div className="form-group">
                <label htmlFor="hospital_name">Hospital Name</label>
                <div className="auth-input-wrapper">
                  <Hospital size={18} />
                  <input
                    id="hospital_name"
                    name="hospital_name"
                    type="text"
                    placeholder="Enter hospital name"
                    value={formData.hospital_name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="auth-input-wrapper">
                <Mail size={18} />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <div className="auth-input-wrapper">
                <Phone size={18} />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={15}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <div className="auth-input-wrapper">
                <MapPin size={18} />
                <input
                  id="address"
                  name="address"
                  type="text"
                  placeholder="Enter your address"
                  value={formData.address}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            {role === "donor" && (
              <div className="form-group">
                <label htmlFor="blood_group_id">Blood Group</label>
                <select
                  id="blood_group_id"
                  name="blood_group_id"
                  value={formData.blood_group_id}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="">Select blood group</option>

                  {bloodGroups.map((group) => (
                    <option
                      key={group.blood_group_id}
                      value={group.blood_group_id}
                    >
                      {group.blood_group}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="auth-input-wrapper">
                <LockKeyhole size={18} />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  minLength={8}
                  required
                  disabled={loading}
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
            {success && <div className="auth-success">{success}</div>}

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
