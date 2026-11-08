
import { useEffect, useState } from "react";
import {
  Building2,
  Phone,
  MapPin,
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  Droplet
} from "lucide-react";
import API from "../services/api";

function HospitalDashboard() {
  const [hospital, setHospital] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHospitalData = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch logged-in hospital profile
        const profileResponse = await API.get("/hospitals/my-profile");
        const hospitalData = profileResponse.data;

        setHospital(hospitalData);

        // Fetch requests belonging to this hospital
        const requestResponse = await API.get(
          `/requests/hospital/${hospitalData.hospital_id}`
        );

        setRequests(
          Array.isArray(requestResponse.data)
            ? requestResponse.data
            : []
        );

      } catch (err) {
        console.error("Hospital dashboard error:", err);

        setError(
          err.response?.data?.message ||
          "Unable to load hospital information. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchHospitalData();
  }, []);

  const pendingRequests = requests.filter(
    request => request.status?.toLowerCase() === "pending"
  );

  const approvedRequests = requests.filter(
    request => request.status?.toLowerCase() === "approved"
  );

  const rejectedRequests = requests.filter(
    request => request.status?.toLowerCase() === "rejected"
  );

  const stats = [
    {
      label: "Total Requests",
      value: requests.length,
      icon: ClipboardList
    },
    {
      label: "Pending Requests",
      value: pendingRequests.length,
      icon: Clock
    },
    {
      label: "Approved Requests",
      value: approvedRequests.length,
      icon: CheckCircle
    },
    {
      label: "Rejected Requests",
      value: rejectedRequests.length,
      icon: XCircle
    }
  ];

  if (loading) {
    return (
      <div className="page-container">
        <div className="dashboard-message">
          Loading hospital dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="page-heading">
          <h1>Hospital Dashboard</h1>
        </div>
        <div className="auth-error">{error}</div>
      </div>
    );
  }

  if (!hospital) return null;

  return (
    <div className="page-container">

      {/* Page Heading */}
      <div className="page-heading">
        <h1>Hospital Dashboard</h1>
        <p>Monitor your blood requests and hospital information.</p>
      </div>

      {/* Hospital Welcome Card */}
      <div className="hospital-welcome-card">
        <div className="hospital-avatar">
          <Building2 size={30} />
        </div>

        <div className="hospital-welcome-info">
          <span>REGISTERED HOSPITAL</span>
          <h2>{hospital.hospital_name}</h2>
          <p>Welcome to your BloodCare dashboard.</p>
        </div>

        <div className="hospital-id">
          <span>Hospital ID</span>
          <strong>#{hospital.hospital_id}</strong>
        </div>
      </div>

      {/* Request Statistics */}
      <div className="stats-grid hospital-stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div className="stat-card" key={stat.label}>
              <div className="stat-card-top">
                <div className="stat-icon">
                  <Icon size={21} />
                </div>
              </div>

              <h2 className="hospital-stat-value">
                {stat.value}
              </h2>

              <p>{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Hospital Information */}
      <div className="dashboard-section hospital-profile-section">
        <div className="section-title">
          <div>
            <h2>Hospital Information</h2>
            <p>Your registered hospital details.</p>
          </div>
          <Building2 size={20} />
        </div>

        <div className="hospital-details-grid">

          <div className="hospital-detail">
            <Building2 size={19} />
            <div>
              <span>Hospital Name</span>
              <strong>{hospital.hospital_name}</strong>
            </div>
          </div>

          <div className="hospital-detail">
            <Phone size={19} />
            <div>
              <span>Contact Number</span>
              <strong>{hospital.phone || "Not provided"}</strong>
            </div>
          </div>

          <div className="hospital-detail">
            <MapPin size={19} />
            <div>
              <span>Address</span>
              <strong>{hospital.address || "Not provided"}</strong>
            </div>
          </div>

          <div className="hospital-detail">
            <Droplet size={19} />
            <div>
              <span>Hospital ID</span>
              <strong>#{hospital.hospital_id}</strong>
            </div>
          </div>

        </div>
      </div>

      {/* Blood Request History */}
      <div className="dashboard-section hospital-history-section">
        <div className="section-title">
          <div>
            <h2>Blood Request History</h2>
            <p>Track the status of your blood requests.</p>
          </div>
          <ClipboardList size={20} />
        </div>

        {requests.length === 0 ? (
          <div className="dashboard-message">
            You have not submitted any blood requests yet.
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Blood Group ID</th>
                  <th>Units Requested</th>
                  <th>Request Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {requests.map((request) => (
                  <tr key={request.request_id}>
                    <td>#{request.request_id}</td>
                    <td>#{request.blood_group_id}</td>
                    <td>{request.units_requested}</td>
                    <td>
                      {request.request_date
                        ? new Date(request.request_date).toLocaleDateString()
                        : "—"}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${String(
                          request.status || ""
                        ).toLowerCase()}`}
                      >
                        {request.status || "Unknown"}
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

export default HospitalDashboard;
