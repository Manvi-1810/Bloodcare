
import { useEffect, useMemo, useState } from "react";
import { Search, RefreshCw, Droplet } from "lucide-react";
import API from "../services/api";

function AdminBloodGroups() {
  const [bloodGroups, setBloodGroups] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBloodGroups = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/blood-groups");
      setBloodGroups(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load blood groups."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBloodGroups();
  }, []);

  const filteredGroups = useMemo(() => {
    const term = search.toLowerCase().trim();

    return bloodGroups.filter((group) =>
      [
        group.blood_group,
        group.blood_group_id,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(term)
      )
    );
  }, [bloodGroups, search]);

  return (
    <div className="page-container admin-blood-groups-page">
      <div className="page-heading">
        <div>
          <h1>Blood Groups</h1>
          <p>View all available blood groups in the system.</p>
        </div>

        <button className="btn-secondary" onClick={fetchBloodGroups}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="donor-summary-card">
        <div className="donor-summary-icon">
          <Droplet size={23} />
        </div>
        <div>
          <span>Total Blood Groups</span>
          <h2>{bloodGroups.length}</h2>
        </div>
      </div>

      <div className="content-card">
        <div className="table-toolbar">
          <div>
            <h2>Available Blood Groups</h2>
            <p>Blood group records stored in the database</p>
          </div>

          <div className="search-box">
            <Search size={17} />
            <input
              type="text"
              placeholder="Search blood group..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="page-loading">Loading blood groups...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : filteredGroups.length === 0 ? (
          <div className="empty-state">
            {bloodGroups.length === 0
              ? "No blood groups found."
              : "No blood groups match your search."}
          </div>
        ) : (
          <div className="blood-group-grid">
            {filteredGroups.map((group) => (
              <div
                className="blood-group-card"
                key={group.blood_group_id}
              >
                <div className="blood-group-card-icon">
                  <Droplet size={23} />
                </div>

                <div>
                  <span>Blood Group</span>
                  <h2>{group.blood_group}</h2>
                  <p>ID: {group.blood_group_id}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !error && (
          <div className="table-footer">
            Showing {filteredGroups.length} of {bloodGroups.length} blood groups
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminBloodGroups;
