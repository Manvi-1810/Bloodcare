
import { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  Package,
  Droplet,
  AlertTriangle,
  Pencil,
  Save,
  X,
} from "lucide-react";
import API from "../services/api";

function AdminStock() {
  const [stock, setStock] = useState([]);
  const [bloodGroups, setBloodGroups] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editUnits, setEditUnits] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  const fetchStock = async () => {
    try {
      setLoading(true);
      setError("");

      const [stockResponse, groupsResponse] = await Promise.all([
        API.get("/stock"),
        API.get("/blood-groups"),
      ]);

      setStock(
        stockResponse.data.map((item) => {
          const group = groupsResponse.data.find(
            (g) => g.blood_group === item.blood_group
          );

          return {
            ...item,
            blood_group_id: group?.blood_group_id,
          };
        })
      );

      setBloodGroups(groupsResponse.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load blood stock."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const totalUnits = stock.reduce(
    (total, item) => total + Number(item.units_available || 0),
    0
  );

  const lowStock = stock.filter(
    (item) => Number(item.units_available) > 0 &&
      Number(item.units_available) <= 5
  ).length;

  const emptyStock = stock.filter(
    (item) => Number(item.units_available) === 0
  ).length;

  const filteredStock = stock.filter((item) =>
    item.blood_group?.toLowerCase().includes(search.toLowerCase().trim())
  );

  const startEditing = (item) => {
    setEditingId(item.blood_group_id);
    setEditUnits(String(item.units_available));
    setSuccess("");
    setError("");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditUnits("");
  };

  const updateStock = async (bloodGroupId) => {
    const units = Number(editUnits);

    if (
      editUnits.trim() === "" ||
      !Number.isInteger(units) ||
      units < 0
    ) {
      setError("Enter a valid non-negative whole number of units.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await API.put(`/stock/${bloodGroupId}`, {
        units_available: units,
      });

      setSuccess("Blood stock updated successfully.");
      setEditingId(null);
      setEditUnits("");

      await fetchStock();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update blood stock."
      );
    } finally {
      setSaving(false);
    }
  };

  const getStockStatus = (units) => {
    if (Number(units) === 0) return "Empty";
    if (Number(units) <= 5) return "Low Stock";
    return "Available";
  };

  return (
    <div className="page-container admin-stock-page">
      <div className="page-heading">
        <div>
          <h1>Blood Stock Management</h1>
          <p>Monitor and update available blood units.</p>
        </div>

        <button className="btn-secondary" onClick={fetchStock}>
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      <div className="donation-stats-grid">
        <div className="donor-summary-card">
          <div className="donor-summary-icon">
            <Package size={23} />
          </div>
          <div>
            <span>Total Available Units</span>
            <h2>{totalUnits}</h2>
          </div>
        </div>

        <div className="donor-summary-card">
          <div className="donor-summary-icon">
            <AlertTriangle size={23} />
          </div>
          <div>
            <span>Low Stock Groups</span>
            <h2>{lowStock}</h2>
          </div>
        </div>

        <div className="donor-summary-card">
          <div className="donor-summary-icon">
            <Droplet size={23} />
          </div>
          <div>
            <span>Empty Stock Groups</span>
            <h2>{emptyStock}</h2>
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="table-toolbar">
          <div>
            <h2>Blood Inventory</h2>
            <p>Available units by blood group</p>
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

        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="page-loading">Loading blood stock...</div>
        ) : stock.length === 0 ? (
          <div className="empty-state">No stock records found.</div>
        ) : filteredStock.length === 0 ? (
          <div className="empty-state">No matching blood groups found.</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Blood Group</th>
                  <th>Available Units</th>
                  <th>Stock Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredStock.map((item) => (
                  <tr key={item.stock_id}>
                    <td>
                      <span className="blood-group-badge">
                        <Droplet size={14} />
                        {item.blood_group}
                      </span>
                    </td>

                    <td>
                      {editingId === item.blood_group_id ? (
                        <input
                          className="stock-edit-input"
                          type="number"
                          min="0"
                          step="1"
                          value={editUnits}
                          onChange={(e) => setEditUnits(e.target.value)}
                        />
                      ) : (
                        <strong>{item.units_available}</strong>
                      )}
                    </td>

                    <td>
                      <span
                        className={`status-badge ${
                          Number(item.units_available) === 0
                            ? "rejected"
                            : Number(item.units_available) <= 5
                              ? "pending"
                              : "approved"
                        }`}
                      >
                        {getStockStatus(item.units_available)}
                      </span>
                    </td>

                    <td>
                      {editingId === item.blood_group_id ? (
                        <div className="stock-action-buttons">
                          <button
                            className="stock-save-btn"
                            onClick={() => updateStock(item.blood_group_id)}
                            disabled={saving}
                          >
                            <Save size={15} />
                            {saving ? "Saving..." : "Save"}
                          </button>

                          <button
                            className="stock-cancel-btn"
                            onClick={cancelEditing}
                            disabled={saving}
                          >
                            <X size={15} />
                          </button>
                        </div>
                      ) : (
                        <button
                          className="stock-edit-btn"
                          onClick={() => startEditing(item)}
                          disabled={!item.blood_group_id}
                        >
                          <Pencil size={15} />
                          Update
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && !error && (
          <div className="table-footer">
            Showing {filteredStock.length} of {stock.length} blood groups
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminStock;
