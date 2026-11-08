
import { useEffect, useState } from "react";
import {
  ClipboardList,
  Search,
  RefreshCw
} from "lucide-react";
import API from "../services/api";

function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const profileResponse = await API.get("/hospitals/my-profile");
      const hospitalId = profileResponse.data.hospital_id;

      const response = await API.get(
        `/requests/hospital/${hospitalId}`
      );

      setRequests(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      console.error("My requests error:", err);
      setError(
        err.response?.data?.message ||
        "Unable to load your requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter((request) =>
    [
      request.request_id,
      request.blood_group,
      request.status
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="page-container">

      <div className="page-heading requests-heading">
        <div>
          <h1>My Blood Requests</h1>
          <p>View and track all your hospital blood requests.</p>
        </div>

        <button
          className="requests-refresh-button"
          onClick={fetchRequests}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="request-summary-card">
        <div className="request-summary-icon">
          <ClipboardList size={23} />
        </div>

        <div>
          <h2>{requests.length}</h2>
          <p>Total Blood Requests</p>
        </div>
      </div>

      <div className="dashboard-section my-requests-section">

        <div className="section-title">
          <div>
            <h2>Request Records</h2>
            <p>All requests submitted by your hospital.</p>
          </div>
        </div>

        <div className="requests-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search by request ID, blood group or status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {error && (
          <div className="auth-error">{error}</div>
        )}

        {loading ? (
          <div className="dashboard-message">
            Loading requests...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="dashboard-message">
            No matching blood requests found.
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Blood Group</th>
                  <th>Units</th>
                  <th>Request Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.request_id}>
                    <td>#{request.request_id}</td>

                    <td>
                      <strong>
                        {request.blood_group || `Group #${request.blood_group_id}`}
                      </strong>
                    </td>

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

export default MyRequests;
