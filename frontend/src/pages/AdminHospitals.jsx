
import { useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  Building2,
  Phone,
  MapPin,
} from "lucide-react";
import API from "../services/api";

function AdminHospitals() {
  const [hospitals, setHospitals] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchHospitals = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await API.get("/hospitals");
      setHospitals(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load hospitals."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const filteredHospitals = useMemo(() => {
    const term = search.toLowerCase().trim();

    return hospitals.filter((hospital) =>
      [
        hospital.hospital_name,
        hospital.phone,
        hospital.address,
        hospital.hospital_id,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(term)
      )
    );
  }, [hospitals, search]);

  return (
    <div className="page-container admin-hospitals-page">
      <div className="page-heading admin-hospitals-heading">
        <div>
          <h1>Hospital Management</h1>
          <p>View and manage registered hospitals.</p>
        </div>

        <button
          className="admin-hospitals-refresh"
          onClick={() => fetchHospitals(true)}
          disabled={loading || refreshing}
        >
          <RefreshCw
            size={16}
            className={refreshing ? "refresh-spinning" : ""}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="donor-summary-card">
        <div className="donor-summary-icon">
          <Building2 size={23} />
        </div>

        <div>
          <span>Total Registered Hospitals</span>
          <h2>{hospitals.length}</h2>
        </div>
      </div>

      <div className="content-card admin-hospitals-card">
        <div className="table-toolbar">
          <div>
            <h2>All Hospitals</h2>
            <p>Registered hospital information</p>
          </div>

          <div className="search-box">
            <Search size={17} />
            <input
              type="text"
              placeholder="Search hospital, phone, address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="page-loading">Loading hospitals...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : filteredHospitals.length === 0 ? (
          <div className="empty-state">
            {hospitals.length === 0
              ? "No hospitals registered yet."
              : "No hospitals match your search."}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Hospital ID</th>
                  <th>Hospital Name</th>
                  <th>Phone</th>
                  <th>Address</th>
                </tr>
              </thead>

              <tbody>
                {filteredHospitals.map((hospital) => (
                  <tr key={hospital.hospital_id}>
                    <td>#{hospital.hospital_id}</td>

                    <td>
                      <div className="donor-name-cell">
                        <div className="donor-avatar hospital-avatar">
                          <Building2 size={17} />
                        </div>
                        <strong>{hospital.hospital_name}</strong>
                      </div>
                    </td>

                    <td>
                      <span className="donor-detail-cell">
                        <Phone size={14} />
                        {hospital.phone || "Not provided"}
                      </span>
                    </td>

                    <td>
                      <span className="donor-detail-cell">
                        <MapPin size={14} />
                        {hospital.address || "Not provided"}
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
            Showing {filteredHospitals.length} of {hospitals.length} hospitals
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminHospitals;
