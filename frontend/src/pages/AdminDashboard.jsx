
import { useEffect, useState } from "react";
import {
  Users,
  Hospital,
  Droplet,
  ClipboardList,
  HandHeart,
  Activity,
  ArrowUpRight,
  Clock
} from "lucide-react";
import API from "../services/api";

function AdminDashboard() {
  const [stats, setStats] = useState({
    donors: 0,
    hospitals: 0,
    donations: 0,
    requests: 0,
    stock: 0,
    issues: 0
  });

  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          donorsRes,
          hospitalsRes,
          donationsRes,
          requestsRes,
          stockRes,
          issuesRes
        ] = await Promise.all([
          API.get("/donors"),
          API.get("/hospitals"),
          API.get("/donations"),
          API.get("/requests"),
          API.get("/stock"),
          API.get("/issues")
        ]);

        const donors = donorsRes.data;
        const hospitals = hospitalsRes.data;
        const donations = donationsRes.data;
        const requests = requestsRes.data;
        const stock = stockRes.data;
        const issues = issuesRes.data;

        const donorList = Array.isArray(donors) ? donors : donors.data || [];
        const hospitalList = Array.isArray(hospitals) ? hospitals : hospitals.data || [];
        const donationList = Array.isArray(donations) ? donations : donations.data || [];
        const requestList = Array.isArray(requests) ? requests : requests.data || [];
        const stockList = Array.isArray(stock) ? stock : stock.data || [];
        const issueList = Array.isArray(issues) ? issues : issues.data || [];

        setStats({
          donors: donorList.length,
          hospitals: hospitalList.length,
          donations: donationList.length,
          requests: requestList.length,
          stock: stockList.reduce(
            (total, item) => total + Number(item.units_available || 0),
            0
          ),
          issues: issueList.length
        });

        setRecentRequests(requestList.slice(-5).reverse());

      } catch (err) {
        console.error("Dashboard loading error:", err);
        setError(
          err.response?.data?.message ||
          "Unable to load dashboard data. Please check the backend APIs."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    { label: "Total Donors", value: stats.donors, icon: Users },
    { label: "Registered Hospitals", value: stats.hospitals, icon: Hospital },
    { label: "Total Donations", value: stats.donations, icon: HandHeart },
    { label: "Blood Requests", value: stats.requests, icon: ClipboardList },
    { label: "Available Blood Units", value: stats.stock, icon: Droplet },
    { label: "Blood Issues", value: stats.issues, icon: Activity }
  ];

  return (
    <div className="page-container">
      <div className="page-heading">
        <h1>Admin Dashboard</h1>
        <p>Overview of BloodCare management activities.</p>
      </div>

      {loading ? (
        <div className="dashboard-message">Loading dashboard data...</div>
      ) : (
        <>
          {error && <div className="auth-error">{error}</div>}

          <div className="stats-grid">
            {statCards.map((card) => {
              const Icon = card.icon;

              return (
                <div className="stat-card" key={card.label}>
                  <div className="stat-card-top">
                    <div className="stat-icon">
                      <Icon size={21} />
                    </div>
                    <ArrowUpRight size={17} className="stat-arrow" />
                  </div>

                  <h2>{card.value}</h2>
                  <p>{card.label}</p>
                </div>
              );
            })}
          </div>

          <div className="dashboard-section">
            <div className="section-title">
              <div>
                <h2>Recent Blood Requests</h2>
                <p>Latest requests received from hospitals.</p>
              </div>
              <Clock size={20} />
            </div>

            {recentRequests.length === 0 ? (
              <div className="dashboard-message">
                No blood requests available.
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Request ID</th>
                      <th>Hospital ID</th>
                      <th>Blood Group ID</th>
                      <th>Units Requested</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentRequests.map((request) => (
                      <tr key={request.request_id}>
                        <td>#{request.request_id}</td>
                        <td>{request.hospital_id}</td>
                        <td>{request.blood_group_id}</td>
                        <td>{request.units_requested}</td>
                        <td>
                          <span className={`status-badge ${String(request.status || "").toLowerCase()}`}>
                            {request.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default AdminDashboard;
