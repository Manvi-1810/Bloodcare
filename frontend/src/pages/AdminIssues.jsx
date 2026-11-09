import { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Droplet,
  Plus,
  X,
  CalendarDays,
  Building2,
  ClipboardList,
} from "lucide-react";
import api from "../services/api";

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const AdminIssues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    request_id: "",
    units_issued: "",
    issue_date: getTodayDate(),
  });

  // Fetch all blood issues
  const fetchIssues = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/issues/");

      setIssues(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load blood issues."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  // Calculate statistics
  const totalIssues = issues.length;

  const totalUnits = issues.reduce(
    (sum, issue) => sum + Number(issue.units_issued || 0),
    0
  );

  const totalHospitals = new Set(
    issues.map((issue) => issue.hospital_id)
  ).size;

  // Search functionality
  const filteredIssues = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    if (!searchValue) return issues;

    return issues.filter((issue) => {
      return (
        String(issue.issue_id || "").includes(searchValue) ||
        String(issue.request_id || "").includes(searchValue) ||
        String(issue.hospital_name || "")
          .toLowerCase()
          .includes(searchValue) ||
        String(issue.blood_group || "")
          .toLowerCase()
          .includes(searchValue)
      );
    });
  }, [issues, search]);

  // Handle form input
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Add blood issue
  const handleSubmit = async (e) => {
    e.preventDefault();

    setFormError("");
    setSuccessMessage("");

    const requestId = Number(formData.request_id);
    const unitsIssued = Number(formData.units_issued);

    if (
      !Number.isInteger(requestId) ||
      requestId <= 0 ||
      !Number.isInteger(unitsIssued) ||
      unitsIssued <= 0 ||
      !formData.issue_date
    ) {
      setFormError("Please enter valid issue details.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await api.post("/issues/add", {
        request_id: requestId,
        units_issued: unitsIssued,
        issue_date: formData.issue_date,
      });

      setSuccessMessage(
        response.data.message || "Blood issued successfully!"
      );

      setFormData({
        request_id: "",
        units_issued: "",
        issue_date: getTodayDate(),
      });

      setShowForm(false);

      await fetchIssues();
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to issue blood. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="page-container admin-issues-page">

      {/* Page Heading */}
      <div className="admin-issues-heading">
        <div>
          <h1>Blood Issues</h1>
          <p>Monitor and manage blood issued to hospitals.</p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className="admin-issues-refresh"
            onClick={fetchIssues}
            disabled={loading}
            type="button"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            className="admin-issues-refresh"
            onClick={() => {
              setShowForm(!showForm);
              setFormError("");
            }}
            type="button"
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? "Close Form" : "Issue Blood"}
          </button>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="admin-issues-success">
          {successMessage}
        </div>
      )}

      {/* Issue Form */}
      {showForm && (
        <div className="admin-issues-section admin-issues-form-section">
          <div className="admin-issues-section-header">
            <h2>Issue Blood to Hospital</h2>
          </div>

          <form onSubmit={handleSubmit}>
            {formError && (
              <div className="admin-issues-error">
                {formError}
              </div>
            )}

            <div className="admin-issues-form-grid">
              <div className="admin-issues-form-group">
                <label htmlFor="request_id">Request ID</label>
                <input
                  type="number"
                  id="request_id"
                  name="request_id"
                  placeholder="Enter approved request ID"
                  value={formData.request_id}
                  onChange={handleChange}
                  min="1"
                  required
                />
                <small>Enter an approved blood request ID.</small>
              </div>

              <div className="admin-issues-form-group">
                <label htmlFor="units_issued">Units to Issue</label>
                <input
                  type="number"
                  id="units_issued"
                  name="units_issued"
                  placeholder="Enter units"
                  value={formData.units_issued}
                  onChange={handleChange}
                  min="1"
                  step="1"
                  required
                />
              </div>

              <div className="admin-issues-form-group">
                <label htmlFor="issue_date">Issue Date</label>
                <input
                  type="date"
                  id="issue_date"
                  name="issue_date"
                  value={formData.issue_date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="admin-issues-form-actions">
              <button
                type="button"
                className="admin-issues-cancel-btn"
                onClick={() => {
                  setShowForm(false);
                  setFormError("");
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="admin-issues-submit-btn"
                disabled={submitting}
              >
                <Droplet size={16} />
                {submitting ? "Issuing..." : "Confirm Issue"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Statistics */}
      <div className="admin-issues-stats">

        <div className="admin-issue-stat-card">
          <div className="admin-issue-stat-icon">
            <ClipboardList size={23} />
          </div>

          <div className="admin-issue-stat-info">
            <h3>Total Issues</h3>
            <strong>{totalIssues}</strong>
          </div>
        </div>

        <div className="admin-issue-stat-card">
          <div className="admin-issue-stat-icon">
            <Droplet size={23} />
          </div>

          <div className="admin-issue-stat-info">
            <h3>Total Units Issued</h3>
            <strong>{totalUnits}</strong>
          </div>
        </div>

        <div className="admin-issue-stat-card">
          <div className="admin-issue-stat-icon">
            <Building2 size={23} />
          </div>

          <div className="admin-issue-stat-info">
            <h3>Hospitals Served</h3>
            <strong>{totalHospitals}</strong>
          </div>
        </div>

      </div>

      {/* Issues Table */}
      <div className="admin-issues-section">

        <div className="admin-issues-section-header">
          <h2>Blood Issue Records</h2>

          <div className="admin-issues-toolbar">
            <div className="admin-issues-search">
              <Search size={17} />

              <input
                type="text"
                placeholder="Search issue, hospital, blood group..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="admin-issues-error">
            {error}
          </div>
        )}

        {loading ? (
          <div className="admin-issues-loading">
            Loading blood issue records...
          </div>
        ) : filteredIssues.length === 0 ? (
          <div className="admin-issues-empty">
            <Droplet size={38} />

            <h3>
              {search ? "No matching records found" : "No blood issues yet"}
            </h3>

            <p>
              {search
                ? "Try searching with a different keyword."
                : "Blood issue records will appear here after blood is issued."}
            </p>
          </div>
        ) : (
          <div className="admin-issues-table-wrapper">
            <table className="admin-issues-table">
              <thead>
                <tr>
                  <th>Issue ID</th>
                  <th>Request ID</th>
                  <th>Hospital</th>
                  <th>Blood Group</th>
                  <th>Units Issued</th>
                  <th>Issue Date</th>
                </tr>
              </thead>

              <tbody>
                {filteredIssues.map((issue) => (
                  <tr key={issue.issue_id}>
                    <td>
                      <span className="admin-issue-id">
                        #{issue.issue_id}
                      </span>
                    </td>

                    <td>#{issue.request_id}</td>

                    <td>{issue.hospital_name || "—"}</td>

                    <td>
                      <span className="admin-issue-blood-group">
                        {issue.blood_group || "—"}
                      </span>
                    </td>

                    <td>
                      <span className="admin-issue-units">
                        {issue.units_issued}
                      </span>
                    </td>

                    <td>
                      <span style={{ display: "inline-flex", gap: "7px" }}>
                        <CalendarDays size={15} />
                        {formatDate(issue.issue_date)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredIssues.length > 0 && (
          <div className="admin-issues-footer">
            <span>
              Showing {filteredIssues.length} of {issues.length} records
            </span>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminIssues;