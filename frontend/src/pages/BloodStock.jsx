
import { useEffect, useState } from "react";
import {
  Droplet,
  Search,
  RefreshCw,
  Package
} from "lucide-react";
import API from "../services/api";

function BloodStock() {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchStock = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/stock");

      setStock(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      console.error("Blood stock error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load blood stock. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const filteredStock = stock.filter((item) =>
    item.blood_group?.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnits = stock.reduce(
    (total, item) => total + Number(item.units_available || 0),
    0
  );

  const getStockStatus = (units) => {
    if (units === 0) return "Out of Stock";
    if (units <= 5) return "Low Stock";
    return "Available";
  };

  const getStatusClass = (units) => {
    if (units === 0) return "out-of-stock";
    if (units <= 5) return "low-stock";
    return "available";
  };

  return (
    <div className="page-container">

      {/* Page Heading */}
      <div className="page-heading stock-heading">
        <div>
          <h1>Blood Stock</h1>
          <p>View the current availability of blood units.</p>
        </div>

        <button
          className="stock-refresh-button"
          onClick={fetchStock}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Total Stock */}
      <div className="stock-summary-card">
        <div className="stock-summary-icon">
          <Package size={24} />
        </div>

        <div>
          <h2>{totalUnits}</h2>
          <p>Total Available Units</p>
        </div>
      </div>

      {/* Blood Group Stock */}
      <div className="dashboard-section stock-table-section">

        <div className="section-title">
          <div>
            <h2>Blood Group Availability</h2>
            <p>Current blood stock records.</p>
          </div>

          <Droplet size={21} />
        </div>

        <div className="stock-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search blood group..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {error && (
          <div className="auth-error">{error}</div>
        )}

        {loading ? (
          <div className="dashboard-message">
            Loading blood stock...
          </div>
        ) : filteredStock.length === 0 ? (
          <div className="dashboard-message">
            No blood stock records found.
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Stock ID</th>
                  <th>Blood Group</th>
                  <th>Available Units</th>
                  <th>Availability Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredStock.map((item) => (
                  <tr key={item.stock_id}>
                    <td>#{item.stock_id}</td>

                    <td>
                      <strong className="stock-blood-group">
                        {item.blood_group}
                      </strong>
                    </td>

                    <td>
                      {item.units_available}
                    </td>

                    <td>
                      <span
                        className={`stock-status ${getStatusClass(
                          Number(item.units_available)
                        )}`}
                      >
                        {getStockStatus(Number(item.units_available))}
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

export default BloodStock;
