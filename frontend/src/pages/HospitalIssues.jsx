
import { useEffect, useState } from "react";
import {
  Droplet,
  RefreshCw,
  Package,
  ClipboardList
} from "lucide-react";
import API from "../services/api";

function HospitalIssues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchIssues = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      // 1. Get the logged-in hospital profile.
      const profileResponse = await API.get("/hospitals/my-profile");
      const hospitalId = profileResponse.data.hospital_id;

      if (!hospitalId) {
        throw new Error("Hospital profile not found.");
      }

      // 2. Get requests belonging to this hospital.
      const requestResponse = await API.get(
        `/requests/hospital/${hospitalId}`
      );

      const requests = Array.isArray(requestResponse.data)
        ? requestResponse.data
        : [];

      // 3. Get issued blood records for each request.
      const issueResponses = await Promise.all(
        requests.map(async (request) => {
          try {
            const response = await API.get(
              `/issues/request/${request.request_id}`
            );

            return Array.isArray(response.data)
              ? response.data
              : [];
          } catch (err) {
            console.error(
              `Unable to load issues for request ${request.request_id}:`,
              err
            );
            return [];
          }
        })
      );

      // 4. Combine all issue records.
      const allIssues = issueResponses.flat();

      // Remove duplicate issue records.
      const uniqueIssues = [
        ...new Map(
          allIssues.map((issue) => [issue.issue_id, issue])
        ).values()
      ];

      setIssues(uniqueIssues);
    } catch (err) {
      console.error("Hospital issues error:", err);

      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to load issued blood details."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const totalUnits = issues.reduce(
    (total, issue) =>
      total + Number(issue.units_issued || 0),
    0
  );

  return (
    <div className="page-container hospital-issues-page">
      <div className="page-heading">
        <div>
          <h1>Blood Issues</h1>
          <p>View blood units issued against your requests.</p>
        </div>

        <button
          className="hospital-issues-refresh"
          onClick={() => fetchIssues(true)}
          disabled={loading || refreshing}
        >
          <RefreshCw
            size={16}
            className={refreshing ? "refresh-spinning" : ""}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="hospital-issues-summary">
        <div className="hospital-issues-summary-icon">
          <Package size={23} />
        </div>

        <div>
          <h2>{totalUnits}</h2>
          <p>Total Units Received</p>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-title">
          <div>
            <h2>Issued Blood Records</h2>
            <p>Details of blood issued against your requests.</p>
          </div>

          <Droplet size={21} />
        </div>

        {error && <div className="auth-error">{error}</div>}

        {loading ? (
          <div className="dashboard-message">
            Loading blood issue records...
          </div>
        ) : issues.length === 0 ? (
          <div className="hospital-issues-empty">
            <ClipboardList size={35} />
            <h3>No Blood Issues Yet</h3>
            <p>
              Issued blood records will appear here once blood
              is issued against your approved requests.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Issue ID</th>
                  <th>Request ID</th>
                  <th>Blood Group</th>
                  <th>Units Issued</th>
                  <th>Issue Date</th>
                </tr>
              </thead>

              <tbody>
                {issues.map((issue) => (
                  <tr key={issue.issue_id}>
                    <td>#{issue.issue_id}</td>
                    <td>#{issue.request_id}</td>
                    <td>
                      <strong className="hospital-issue-blood-group">
                        {issue.blood_group || "—"}
                      </strong>
                    </td>
                    <td>{issue.units_issued}</td>
                    <td>
                      {issue.issue_date
                        ? new Date(
                            issue.issue_date
                          ).toLocaleDateString()
                        : "—"}
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

export default HospitalIssues;
