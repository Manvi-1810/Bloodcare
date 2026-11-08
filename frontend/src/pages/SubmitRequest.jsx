
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Droplet,
  CalendarDays,
  Send,
  ClipboardList,
  CheckCircle
} from "lucide-react";
import API from "../services/api";

function SubmitRequest() {
  const navigate = useNavigate();

  const [bloodGroups, setBloodGroups] = useState([]);
  const [bloodGroupId, setBloodGroupId] = useState("");
  const [units, setUnits] = useState("");
  const [requestDate, setRequestDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [loading, setLoading] = useState(false);
  const [fetchingGroups, setFetchingGroups] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchBloodGroups = async () => {
      try {
        const response = await API.get("/blood-groups");

        const data = Array.isArray(response.data)
          ? response.data
          : response.data.bloodGroups || response.data.data || [];

        setBloodGroups(data);
      } catch (err) {
        console.error("Blood group loading error:", err);
        setError("Unable to load blood groups. Please try again.");
      } finally {
        setFetchingGroups(false);
      }
    };

    fetchBloodGroups();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const unitValue = Number(units);

    if (!bloodGroupId || !Number.isInteger(unitValue) || unitValue <= 0 || !requestDate) {
      setError("Please enter valid blood request details.");
      return;
    }

    try {
      setLoading(true);

      const response = await API.post("/requests/add", {
        blood_group_id: Number(bloodGroupId),
        units_requested: unitValue,
        request_date: requestDate
      });

      setSuccess(
        `${response.data.message} Request ID: #${response.data.request_id}`
      );

      setBloodGroupId("");
      setUnits("");
      setRequestDate(new Date().toISOString().split("T")[0]);

    } catch (err) {
      console.error("Blood request error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to submit blood request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">

      <div className="page-heading">
        <h1>Submit Blood Request</h1>
        <p>Request blood units for your hospital through BloodCare.</p>
      </div>

      <div className="request-page-layout">

        <div className="dashboard-section request-form-section">

          <div className="section-title">
            <div>
              <h2>Blood Request Details</h2>
              <p>Enter the required information below.</p>
            </div>
            <ClipboardList size={21} />
          </div>

          {error && (
            <div className="auth-error">{error}</div>
          )}

          {success && (
            <div className="auth-success request-success">
              <CheckCircle size={18} />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="request-form">

            <div className="form-group">
              <label htmlFor="bloodGroup">Required Blood Group</label>

              <div className="request-input-wrapper">
                <Droplet size={18} />

                <select
                  id="bloodGroup"
                  value={bloodGroupId}
                  onChange={(e) => setBloodGroupId(e.target.value)}
                  required
                  disabled={fetchingGroups}
                >
                  <option value="">
                    {fetchingGroups
                      ? "Loading blood groups..."
                      : "Select blood group"}
                  </option>

                  {bloodGroups.map((group) => (
                    <option
                      key={group.blood_group_id}
                      value={group.blood_group_id}
                    >
                      {group.blood_group}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="units">Number of Units Required</label>

              <div className="request-input-wrapper">
                <ClipboardList size={18} />

                <input
                  id="units"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Enter number of units"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="requestDate">Request Date</label>

              <div className="request-input-wrapper">
                <CalendarDays size={18} />

                <input
                  id="requestDate"
                  type="date"
                  value={requestDate}
                  onChange={(e) => setRequestDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="request-submit-button"
              disabled={loading || fetchingGroups}
            >
              <Send size={17} />
              {loading ? "Submitting..." : "Submit Blood Request"}
            </button>

          </form>
        </div>

        <div className="request-information-card">
          <div className="request-information-icon">
            <Droplet size={25} />
          </div>

          <h3>Request Information</h3>

          <p>
            Your blood request will be submitted to the BloodCare
            administration team.
          </p>

          <ul>
            <li>Requests are initially marked as Pending.</li>
            <li>Admin reviews and updates the request status.</li>
            <li>You can track your requests in the Hospital Dashboard.</li>
          </ul>

          <button
            type="button"
            className="request-history-button"
            onClick={() => navigate("/hospital/dashboard")}
          >
            View Request History
          </button>
        </div>

      </div>
    </div>
  );
}

export default SubmitRequest;
