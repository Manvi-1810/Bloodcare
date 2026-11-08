
import { useEffect, useState } from "react";
import {
  ClipboardList,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import API from "../services/api";

function AdminRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/requests");

      setRequests(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      console.error("Admin requests error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load blood requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (requestId, status) => {
    try {
      setUpdatingId(requestId);
      setError("");

      await API.put(`/requests/${requestId}/status`, {
        status
      });

      setRequests((previousRequests) =>
        previousRequests.map((request) =>
          request.request_id === requestId
            ? { ...request, status }
            : request
        )
      );
    } catch (err) {
      console.error("Status update error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to update request status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredRequests = requests.filter((request) =>
    [
      request.request_id,
      request.hospital_name,
      request.blood_group,
      request.status
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const pendingCount = requests.filter(
    (request) => request.status?.toLowerCase() === "pending"
  ).length;

  const approvedCount = requests.filter(
    (request) => request.status?.toLowerCase() === "approved"
  ).length;

  const rejectedCount = requests.filter(
    (request) => request.status?.toLowerCase() === "rejected"
  ).length;

  return (
    <div className="page-container">

      <div className="page-heading admin-requests-heading">
        <div>
          <h1>Blood Requests Management</h1>
          <p>Review and manage requests submitted by hospitals.</p>
        </div>

        <button
          className="admin-request-refresh"
          onClick={fetchRequests}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Request Statistics */}

      <div className="stats-grid admin-request-stats">

        <div className="stat-card">
          <div className="stat-icon">
            <ClipboardList size={21} />
          </div>
          <h2>{requests.length}</h2>
          <p>Total Requests</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Clock size={21} />
          </div>
          <h2>{pendingCount}</h2>
          <p>Pending Requests</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <CheckCircle size={21} />
          </div>
          <h2>{approvedCount}</h2>
          <p>Approved Requests</p>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <XCircle size={21} />
          </div>
          <h2>{rejectedCount}</h2>
          <p>Rejected Requests</p>
        </div>

      </div>

      {/* Requests Table */}

      <div className="dashboard-section admin-requests-section">

        <div className="section-title">
          <div>
            <h2>All Blood Requests</h2>
            <p>Requests from all registered hospitals.</p>
          </div>

          <ClipboardList size={21} />
        </div>

        <div className="admin-request-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search request ID, hospital, blood group or status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {error && (
          <div className="auth-error">{error}</div>
        )}

        {loading ? (
          <div className="dashboard-message">
            Loading blood requests...
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="dashboard-message">
            No blood requests found.
          </div>
        ) : (
          <div className="table-wrapper">

            <table className="data-table">
              <thead>
                <tr>
                  <th>Request ID</th>
                  <th>Hospital</th>
                  <th>Blood Group</th>
                  <th>Units</th>
                  <th>Request Date</th>
                  <th>Status</th>
                  <th>Update Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.request_id}>

                    <td>#{request.request_id}</td>

                    <td>
                      {request.hospital_name ||
                        `Hospital #${request.hospital_id}`}
                    </td>

                    <td>
                      <strong className="admin-request-blood-group">
                        {request.blood_group ||
                          `Group #${request.blood_group_id}`}
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
                        {request.status}
                      </span>
                    </td>

                    <td>
                      <select
                        className="admin-request-status-select"
                        value={request.status}
                        disabled={updatingId === request.request_id}
                        onChange={(e) =>
                          updateStatus(
                            request.request_id,
                            e.target.value
                          )
                        }
                      >
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Completed">Completed</option>
                      </select>

                      {updatingId === request.request_id && (
                        <span className="admin-request-updating">
                          Updating...
                        </span>
                      )}
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

export default AdminRequests;
