
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  HeartPulse,
  Droplet,
  CalendarDays,
} from "lucide-react";
import API from "../services/api";

function AdminDonations() {
  const [donations, setDonations] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDonations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/donations");
      setDonations(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load donation records."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const filteredDonations = useMemo(() => {
    const term = search.toLowerCase().trim();

    return donations.filter((donation) =>
      [
        donation.donation_id,
        donation.donor_id,
        donation.name,
        donation.blood_group,
        donation.status,
        donation.units,
        donation.donation_date,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(term)
      )
    );
  }, [donations, search]);

  const totalUnits = donations.reduce(
    (total, donation) => total + Number(donation.units || 0),
    0
  );

  const completedCount = donations.filter(
    (donation) => donation.status?.toLowerCase() === "completed"
  ).length;

  const formatDate = (date) => {
    if (!date) return "—";
    const value = String(date).slice(0, 10);
    const [year, month, day] = value.split("-");
    return year && month && day ? `${day}/${month}/${year}` : value;
  };

  return (
    <div className="page-container admin-donations-page">
      <div className="page-heading">
        <div>
          <h1>Donations Management</h1>
          <p>Monitor and review all recorded blood donations.</p>
        </div>

        <button className="btn-secondary" onClick={fetchDonations}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="donation-stats-grid">
        <div className="donor-summary-card">
          <div className="donor-summary-icon">
            <HeartPulse size={23} />
          </div>
          <div>
            <span>Total Donations</span>
            <h2>{donations.length}</h2>
          </div>
        </div>

        <div className="donor-summary-card">
          <div className="donor-summary-icon">
            <Droplet size={23} />
          </div>
          <div>
            <span>Total Units Donated</span>
            <h2>{totalUnits}</h2>
          </div>
        </div>

        <div className="donor-summary-card">
          <div className="donor-summary-icon">
            <CalendarDays size={23} />
          </div>
          <div>
            <span>Completed Donations</span>
            <h2>{completedCount}</h2>
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="table-toolbar">
          <div>
            <h2>All Donation Records</h2>
            <p>Donation history stored in the database</p>
          </div>

          <div className="search-box">
            <Search size={17} />
            <input
              type="text"
              placeholder="Search donor, blood group, status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="page-loading">Loading donations...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : filteredDonations.length === 0 ? (
          <div className="empty-state">
            {donations.length === 0
              ? "No donation records found."
              : "No donations match your search."}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Donation ID</th>
                  <th>Donor Name</th>
                  <th>Blood Group</th>
                  <th>Donation Date</th>
                  <th>Units</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredDonations.map((donation) => (
                  <tr key={donation.donation_id}>
                    <td>#{donation.donation_id}</td>
                    <td>
                      <div className="donor-name-cell">
                        <div className="donor-avatar">
                          {donation.name?.charAt(0)?.toUpperCase() || "D"}
                        </div>
                        <strong>{donation.name || `Donor #${donation.donor_id}`}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="blood-group-badge">
                        <Droplet size={13} />
                        {donation.blood_group || "—"}
                      </span>
                    </td>
                    <td>{formatDate(donation.donation_date)}</td>
                    <td>{donation.units}</td>
                    <td>
                      <span
                        className={`status-badge ${donation.status?.toLowerCase()}`}
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

        {!loading && !error && (
          <div className="table-footer">
            Showing {filteredDonations.length} of {donations.length} donation records
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDonations;
