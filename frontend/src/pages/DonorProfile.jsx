
import { useEffect, useState } from "react";
import {
  UserRound,
  Mail,
  Phone,
  MapPin,
  Droplet,
  Activity,
  Pencil,
  Save,
  X,
  RefreshCw
} from "lucide-react";
import API from "../services/api";

function DonorProfile() {
  const [profile, setProfile] = useState(null);
  const [bloodGroups, setBloodGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    blood_group_id: ""
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const [profileResponse, groupsResponse] = await Promise.all([
        API.get("/donors/my-profile"),
        API.get("/blood-groups")
      ]);

      const donor = profileResponse.data;

      setProfile(donor);
      setBloodGroups(
        Array.isArray(groupsResponse.data) ? groupsResponse.data : []
      );

      setFormData({
        name: donor.name || "",
        email: donor.email || "",
        phone: donor.phone || "",
        address: donor.address || "",
        blood_group_id: String(donor.blood_group_id || "")
      });
    } catch (err) {
      console.error("Donor profile error:", err);
      setError(
        err.response?.data?.message ||
        "Unable to load your profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleEdit = () => {
    setMessage("");
    setFormError("");

    setFormData({
      name: profile.name || "",
      email: profile.email || "",
      phone: profile.phone || "",
      address: profile.address || "",
      blood_group_id: String(profile.blood_group_id || "")
    });

    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setFormError("");

    setFormData({
      name: profile.name || "",
      email: profile.email || "",
      phone: profile.phone || "",
      address: profile.address || "",
      blood_group_id: String(profile.blood_group_id || "")
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    setFormError("");
    setMessage("");

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.blood_group_id
    ) {
      setFormError("Please fill in all required fields.");
      return;
    }

    try {
      setSaving(true);

      await API.put("/donors/my-profile", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        blood_group_id: Number(formData.blood_group_id)
      });

      setEditing(false);
      setMessage("Your profile has been updated successfully.");

      await fetchProfile();
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
        "Unable to update profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="dashboard-message">
          Loading your profile...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="page-heading">
          <div>
            <h1>My Profile</h1>
            <p>View and manage your donor information.</p>
          </div>
        </div>

        <div className="auth-error">{error}</div>

        <button className="secondary-button" onClick={fetchProfile}>
          <RefreshCw size={16} />
          Try Again
        </button>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="page-container donor-dashboard-page">
      <div className="page-heading">
        <div>
          <h1>My Profile</h1>
          <p>View and manage your registered donor information.</p>
        </div>
      </div>

      {message && (
        <div className="donor-success-message">
          {message}
        </div>
      )}

      <div className="donor-welcome-card">
        <div className="donor-avatar">
          <UserRound size={32} />
        </div>

        <div className="donor-welcome-info">
          <span>REGISTERED BLOOD DONOR</span>
          <h2>{profile.name}</h2>
          <p>Thank you for being part of BloodCare.</p>
        </div>

        <div className="donor-blood-group">
          <Droplet size={24} fill="currentColor" />
          <strong>{profile.blood_group || "N/A"}</strong>
          <span>Blood Group</span>
        </div>
      </div>

      <div className="dashboard-section donor-profile-section">
        <div className="section-title">
          <div>
            <h2>Personal Information</h2>
            <p>Your registered donor details.</p>
          </div>

          {!editing && (
            <button
              className="secondary-button"
              onClick={handleEdit}
            >
              <Pencil size={15} />
              Edit Profile
            </button>
          )}
        </div>

        {editing ? (
          <form className="donor-edit-form" onSubmit={handleSave}>
            <div className="donor-form-grid">
              <div className="donor-form-field">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="donor-form-field">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="donor-form-field">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  maxLength={15}
                />
              </div>

              <div className="donor-form-field">
                <label>Blood Group *</label>
                <select
                  name="blood_group_id"
                  value={formData.blood_group_id}
                  onChange={handleInputChange}
                  required
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

              <div className="donor-form-field donor-address-field">
                <label>Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>
            </div>

            {formError && (
              <div className="auth-error">{formError}</div>
            )}

            <div className="donor-form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={handleCancel}
                disabled={saving}
              >
                <X size={16} />
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                <Save size={16} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <div className="donor-details-grid">
            <div className="donor-detail">
              <UserRound size={18} />
              <div>
                <span>Full Name</span>
                <strong>{profile.name}</strong>
              </div>
            </div>

            <div className="donor-detail">
              <Mail size={18} />
              <div>
                <span>Email Address</span>
                <strong>{profile.email || "Not provided"}</strong>
              </div>
            </div>

            <div className="donor-detail">
              <Phone size={18} />
              <div>
                <span>Phone Number</span>
                <strong>{profile.phone || "Not provided"}</strong>
              </div>
            </div>

            <div className="donor-detail">
              <MapPin size={18} />
              <div>
                <span>Address</span>
                <strong>{profile.address || "Not provided"}</strong>
              </div>
            </div>

            <div className="donor-detail">
              <Droplet size={18} />
              <div>
                <span>Blood Group</span>
                <strong>{profile.blood_group || "N/A"}</strong>
              </div>
            </div>

            <div className="donor-detail">
              <Activity size={18} />
              <div>
                <span>Donor ID</span>
                <strong>#{profile.donor_id}</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DonorProfile;
