
import { useEffect, useMemo, useState } from "react";
import {
  Droplet,
  CalendarDays,
  HeartHandshake,
  Search,
  RefreshCw,
  Activity,
  Clock,
} from "lucide-react";
import API from "../services/api";

function MyDonations() {
  const [donations, setDonations] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchDonations = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const profileResponse = await API.get("/donors/my-profile");
      const donorId = profileResponse.data.donor_id;

      const donationResponse = await API.get(
        `/donations/donor/${donorId}`
      );

      setDonations(
        Array.isArray(donationResponse.data)
          ? donationResponse.data
          : []
      );
    } catch (err) {
      console.error("My donations error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load donation history. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const completedDonations = donations.filter(
    (donation) =>
      String(donation.status || "").toLowerCase() === "completed"
  );

  const totalUnits = completedDonations.reduce(
    (total, donation) => total + Number(donation.units || 0),
    0
  );

  const filteredDonations = useMemo(() => {
    const term = search.trim().toLowerCase();

    return donations.filter((donation) => {
      const matchesSearch = [
        donation.donation_id,
        donation.donation_date,
        donation.units,
        donation.status,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(term)
      );

      const matchesStatus =
        statusFilter === "All" ||
        String(donation.status || "").toLowerCase() ===
          statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [donations, search, statusFilter]);

  const formatDate = (date) => {
    if (!date) return "Not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Not available";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="dashboard-message">
          Loading your donation history...
        </div>
      </div>
    );
  }

  return (
    <div className="page-container my-donations-page">

      {/* Page Heading */}

      <div className="page-heading">
        <div>
          <h1>My Donations</h1>
          <p>View and track your blood donation history.</p>
        </div>

        <button
          type="button"
          className="donations-refresh-button"
          onClick={() => fetchDonations(true)}
          disabled={refreshing}
        >
          <RefreshCw
            size={16}
            className={refreshing ? "refresh-spinning" : ""}
          />
          <span>
            {refreshing ? "Refreshing..." : "Refresh"}
          </span>
        </button>
      </div>

      {/* Error Message */}

      {error && (
        <div className="auth-error">
          {error}
          <button
            type="button"
            onClick={() => fetchDonations(true)}
          >
            Try again
          </button>
        </div>
      )}

      {/* Summary Cards */}

      <div className="stats-grid donations-summary-grid">

        <div className="stat-card">
          <div className="stat-card-top">
            <div className="stat-icon">
              <HeartHandshake size={21} />
            </div>
          </div>

          <h2 className="donor-stat-value">
            {completedDonations.length}
          </h2>

          <p>Completed Donations</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <div className="stat-icon">
              <Droplet size={21} />
            </div>
          </div>

          <h2 className="donor-stat-value">
            {totalUnits}
          </h2>

          <p>Total Units Donated</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <div className="stat-icon">
              <Activity size={21} />
            </div>
          </div>

          <h2 className="donor-stat-value">
            {donations.length}
          </h2>

          <p>Total Records</p>
        </div>

      </div>

      {/* Donation History */}

      <div className="dashboard-section donations-history-card">

        <div className="section-title">
          <div>
            <h2>Donation History</h2>
            <p>All your recorded blood donations.</p>
          </div>

          <Clock size={20} />
        </div>

        {/* Search and Filter */}

        <div className="donations-toolbar">

          <div className="search-box">
            <Search size={17} />

            <input
              type="text"
              placeholder="Search donation records..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="donation-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
          </select>

        </div>

        {/* Donation Table */}

        {donations.length === 0 ? (

          <div className="donations-empty-state">
            <Droplet size={34} />
            <h3>No donations yet</h3>
            <p>Your donation records will appear here.</p>
          </div>

        ) : filteredDonations.length === 0 ? (

          <div className="donations-empty-state">
            <Search size={30} />
            <h3>No matching records</h3>
            <p>Try changing your search or status filter.</p>
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
                {filteredDonations.map((donation) => (

                  <tr key={donation.donation_id}>

                    <td>
                      <strong>#{donation.donation_id}</strong>
                    </td>

                    <td>
                      <span className="donation-date-cell">
                        <CalendarDays size={15} />
                        {formatDate(donation.donation_date)}
                      </span>
                    </td>

                    <td>
                      <span className="donation-units-cell">
                        <Droplet size={15} />
                        {donation.units} units
                      </span>
                    </td>

                    <td>
                      <span
                        className={`donation-status ${
                          String(donation.status || "")
                            .toLowerCase()
                            .replace(/\s+/g, "-")
                        }`}
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

        {/* Table Footer */}

        <div className="donations-table-footer">
          Showing {filteredDonations.length} of {donations.length} records
        </div>

      </div>
    </div>
  );
}

export default MyDonations;
