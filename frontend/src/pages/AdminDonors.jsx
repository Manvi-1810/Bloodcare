
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Users,
  Droplet,
  Phone,
  MapPin,
} from "lucide-react";
import API from "../services/api";

function AdminDonors() {
  const [donors, setDonors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDonors = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/donors");

      setDonors(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load donors. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  const filteredDonors = useMemo(() => {
    const term = search.toLowerCase().trim();

    return donors.filter((donor) =>
      [
        donor.name,
        donor.blood_group,
        donor.phone,
        donor.address,
        donor.donor_id,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(term)
      )
    );
  }, [donors, search]);

  return (
    <div className="page-container admin-donors-page">
      {/* Page heading */}
      <div className="page-heading">
        <div>
          <h1>Donor Management</h1>
          <p>View and manage registered blood donors.</p>
        </div>

        <button
          className="secondary-button"
          onClick={fetchDonors}
          disabled={loading}
        >
          <RefreshCw size={16} />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Donor summary */}
      <div className="donor-summary-card">
        <div className="donor-summary-icon">
          <Users size={23} />
        </div>

        <div>
          <span>Total Registered Donors</span>
          <h2>{donors.length}</h2>
        </div>
      </div>

      {/* Donor table section */}
      <div className="dashboard-section donor-table-section">
        <div className="table-toolbar">
          <div>
            <h2>All Donors</h2>
            <p>Registered donor information</p>
          </div>

          <div className="search-box">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search name, blood group, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="page-loading">Loading donors...</div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button className="secondary-button" onClick={fetchDonors}>
              Try Again
            </button>
          </div>
        ) : filteredDonors.length === 0 ? (
          <div className="empty-state">
            {donors.length === 0
              ? "No donors registered yet."
              : "No donors match your search."}
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Donor ID</th>
                  <th>Donor Name</th>
                  <th>Blood Group</th>
                  <th>Phone</th>
                  <th>Address</th>
                </tr>
              </thead>

              <tbody>
                {filteredDonors.map((donor) => (
                  <tr key={donor.donor_id}>
                    <td>#{donor.donor_id}</td>

                    <td>
                      <div className="donor-name-cell">
                        <div className="donor-avatar">
                          {donor.name?.charAt(0)?.toUpperCase() || "D"}
                        </div>
                        <strong>{donor.name || "Unknown"}</strong>
                      </div>
                    </td>

                    <td>
                      <span className="blood-group-badge">
                        <Droplet size={13} />
                        {donor.blood_group || "N/A"}
                      </span>
                    </td>

                    <td>
                      <span className="donor-detail-cell">
                        <Phone size={14} />
                        {donor.phone || "Not provided"}
                      </span>
                    </td>

                    <td>
                      <span className="donor-detail-cell">
                        <MapPin size={14} />
                        {donor.address || "Not provided"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && (
          <div className="table-footer">
            Showing {filteredDonors.length} of {donors.length} donors
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDonors;
