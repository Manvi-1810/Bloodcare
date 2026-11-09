
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Public Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Dashboard Layout
import DashboardLayout from "./components/layout/DashboardLayout";

// Dashboard Pages
import AdminDashboard from "./pages/AdminDashboard";
import DonorDashboard from "./pages/DonorDashboard";
import HospitalDashboard from "./pages/HospitalDashboard";

// Admin Pages
import AdminRequests from "./pages/AdminRequests";
import AdminDonors from "./pages/AdminDonors";
import AdminHospitals from "./pages/AdminHospitals";
import AdminBloodGroups from "./pages/AdminBloodGroups";
import AdminDonations from "./pages/AdminDonations";
import AdminStock from "./pages/AdminStock";
import AdminIssues from "./pages/AdminIssues";

// Donor Pages
import DonorProfile from "./pages/DonorProfile";
import MyDonations from "./pages/MyDonations";
import BloodGroups from "./pages/BloodGroups";

// Hospital Pages
import SubmitRequest from "./pages/SubmitRequest";
import MyRequests from "./pages/MyRequests";
import BloodStock from "./pages/BloodStock";
import HospitalIssues from "./pages/HospitalIssues";

// Authentication
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <DashboardLayout role="admin" />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="requests" element={<AdminRequests />} />
          <Route path="donors" element={<AdminDonors />} />
          <Route path="hospitals" element={<AdminHospitals />} />
          <Route path="blood-groups" element={<AdminBloodGroups />} />
          <Route path="donations" element={<AdminDonations />} />
          <Route path="stock" element={<AdminStock />} />
          <Route path="issues" element={<AdminIssues />} />
        </Route>

        {/* Donor Routes */}
        <Route
          path="/donor"
          element={
            <ProtectedRoute allowedRole="donor">
              <DashboardLayout role="donor" />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DonorDashboard />} />
          <Route path="profile" element={<DonorProfile />} />
          <Route path="donations" element={<MyDonations />} />
          <Route path="blood-groups" element={<BloodGroups />} />
        </Route>

        {/* Hospital Routes */}
        <Route
          path="/hospital"
          element={
            <ProtectedRoute allowedRole="hospital">
              <DashboardLayout role="hospital" />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<HospitalDashboard />} />
          <Route path="submit-request" element={<SubmitRequest />} />
          <Route path="requests" element={<MyRequests />} />
          <Route path="stock" element={<BloodStock />} />
          <Route path="issues" element={<HospitalIssues />} />
        </Route>

        {/* Unknown Routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
