
import { useEffect, useState } from "react";
import {
  Droplet,
  Search,
  RefreshCw,
  Heart,
  Info
} from "lucide-react";
import API from "../services/api";

const compatibility = {
  "A+": {
    donateTo: ["A+", "AB+"],
    receiveFrom: ["A+", "A-", "O+", "O-"]
  },
  "A-": {
    donateTo: ["A+", "A-", "AB+", "AB-"],
    receiveFrom: ["A-", "O-"]
  },
  "B+": {
    donateTo: ["B+", "AB+"],
    receiveFrom: ["B+", "B-", "O+", "O-"]
  },
  "B-": {
    donateTo: ["B+", "B-", "AB+", "AB-"],
    receiveFrom: ["B-", "O-"]
  },
  "AB+": {
    donateTo: ["AB+"],
    receiveFrom: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
  },
  "AB-": {
    donateTo: ["AB+", "AB-"],
    receiveFrom: ["A-", "B-", "AB-", "O-"]
  },
  "O+": {
    donateTo: ["A+", "B+", "AB+", "O+"],
    receiveFrom: ["O+", "O-"]
  },
  "O-": {
    donateTo: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    receiveFrom: ["O-"]
  }
};

function BloodGroups() {
  const [bloodGroups, setBloodGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchBloodGroups = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await API.get("/blood-groups");

      setBloodGroups(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      console.error("Blood groups error:", err);
      setError(
        err.response?.data?.message ||
        "Unable to load blood groups. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBloodGroups();
  }, []);

  const filteredGroups = bloodGroups.filter((group) =>
    group.blood_group?.toLowerCase().includes(search.toLowerCase())
  );

  const getCompatibility = (group) => {
    return compatibility[group] || {
      donateTo: [],
      receiveFrom: []
    };
  };

  return (
    <div className="page-container blood-groups-page">
      <div className="page-heading">
        <div>
          <h1>Blood Groups</h1>
          <p>
            Understand blood donation and receiving compatibility.
          </p>
        </div>

        <button
          className="blood-groups-refresh"
          onClick={() => fetchBloodGroups(true)}
          disabled={loading || refreshing}
        >
          <RefreshCw
            size={16}
            className={refreshing ? "refresh-spinning" : ""}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <div className="blood-compatibility-info">
        <div className="blood-compatibility-info-icon">
          <Info size={21} />
        </div>
        <div>
          <h3>Understanding Compatibility</h3>
          <p>
            Compatibility below is based on standard red blood cell
            transfusion rules. Actual blood transfusions require
            blood typing and crossmatching by medical professionals.
          </p>
        </div>
      </div>

      <div className="blood-groups-section">
        <div className="section-title">
          <div>
            <h2>Available Blood Groups</h2>
            <p>Explore all blood groups and their compatibility.</p>
          </div>
          <Droplet size={22} />
        </div>

        <div className="blood-groups-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search blood group..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {error && <div className="auth-error">{error}</div>}

        {loading ? (
          <div className="dashboard-message">
            Loading blood groups...
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="dashboard-message">
            No blood groups found.
          </div>
        ) : (
          <div className="blood-groups-grid">
            {filteredGroups.map((item) => {
              const group = item.blood_group;
              const details = getCompatibility(group);

              return (
                <div
                  className="blood-group-card"
                  key={item.blood_group_id}
                >
                  <div className="blood-group-card-header">
                    <div className="blood-group-icon">
                      <Droplet size={25} />
                    </div>
                    <h3>{group}</h3>
                  </div>

                  <div className="compatibility-block">
                    <h4>
                      <Heart size={15} />
                      Can Donate To
                    </h4>
                    <div className="compatibility-tags">
                      {details.donateTo.map((value) => (
                        <span key={value}>{value}</span>
                      ))}
                    </div>
                  </div>

                  <div className="compatibility-block">
                    <h4>
                      <Droplet size={15} />
                      Can Receive From
                    </h4>
                    <div className="compatibility-tags receive-tags">
                      {details.receiveFrom.map((value) => (
                        <span key={value}>{value}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="blood-compatibility-note">
        <strong>Important:</strong> This page shows general red blood
        cell compatibility. Plasma compatibility differs, and
        compatibility information must not replace professional
        medical testing.
      </div>
    </div>
  );
}

export default BloodGroups;
