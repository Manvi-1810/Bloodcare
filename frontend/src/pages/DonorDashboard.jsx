
import { useEffect, useState } from "react";
import {
  Droplet,
  CalendarDays,
  HeartHandshake,
  UserRound,
  Phone,
  MapPin,
  Activity,
  Clock
} from "lucide-react";
import API from "../services/api";

function DonorDashboard() {
  const [profile, setProfile] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDonorData = async () => {
      try {
        setLoading(true);
        setError("");

        const profileResponse = await API.get("/donors/my-profile");
        const donor = profileResponse.data;

        setProfile(donor);

        const donationResponse = await API.get(
          `/donations/donor/${donor.donor_id}`
        );

        const donationData = Array.isArray(donationResponse.data)
          ? donationResponse.data
          : [];

        setDonations(donationData);

      } catch (err) {
        console.error("Donor dashboard error:", err);

        setError(
          err.response?.data?.message ||
          "Unable to load donor information. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDonorData();
  }, []);

  const completedDonations = donations.filter(
    donation => donation.status?.toLowerCase() === "completed"
  );

  const totalUnits = completedDonations.reduce(
    (total, donation) => total + Number(donation.units || 0),
    0
  );

  const latestDonation = donations.length > 0 ? donations[0] : null;

  if (loading) {
    return (
      <div className="page-container">
        <div className="dashboard-message">Loading your dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="page-heading">
          <h1>Donor Dashboard</h1>
        </div>
        <div className="auth-error">{error}</div>
      </div>
    );
  }

  if (!profile) return null;

  const stats = [
    {
      label: "Total Donations",
      value: completedDonations.length,
      icon: HeartHandshake
    },
    {
      label: "Units Donated",
      value: totalUnits,
      icon: Droplet
    },
    {
      label: "Latest Donation",
      value: latestDonation
        ? new Date(latestDonation.donation_date).toLocaleDateString()
        : "No donations",
      icon: CalendarDays
    }
  ];

  return (
    <div className="page-container">

      <div className="page-heading">
        <h1>Donor Dashboard</h1>
        <p>Welcome back, {profile.name}. Here's your donation overview.</p>
      </div>

      {/* Donor Profile Card */}

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

      {/* Donation Statistics */}

      <div className="stats-grid donor-stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div className="stat-card" key={stat.label}>
              <div className="stat-card-top">
                <div className="stat-icon">
                  <Icon size={21} />
                </div>
              </div>

              <h2 className="donor-stat-value">{stat.value}</h2>
              <p>{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Personal Information */}

      <div className="dashboard-section donor-profile-section">
        <div className="section-title">
          <div>
            <h2>Personal Information</h2>
            <p>Your registered donor details.</p>
          </div>
          <UserRound size={20} />
        </div>

        <div className="donor-details-grid">
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
      </div>

      {/* Donation History */}

      <div className="dashboard-section donor-history-section">
        <div className="section-title">
          <div>
            <h2>Donation History</h2>
            <p>Your previously recorded blood donations.</p>
          </div>
          <Clock size={20} />
        </div>

        {donations.length === 0 ? (
          <div className="dashboard-message">
            No donation records found.
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Donation ID</th>
                  <th>Donation Date</th>
                  <th>Units Donated</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {donations.map((donation) => (
                  <tr key={donation.donation_id}>
                    <td>#{donation.donation_id}</td>
                    <td>
                      {new Date(donation.donation_date).toLocaleDateString()}
                    </td>
                    <td>{donation.units}</td>
                    <td>
                      <span
                        className={`status-badge ${String(
                          donation.status || ""
                        ).toLowerCase()}`}
                      >
                        {donation.status || "Unknown"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

export default DonorDashboard;
