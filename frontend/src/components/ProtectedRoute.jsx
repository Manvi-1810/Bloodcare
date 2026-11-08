
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRole }) {
  const token = localStorage.getItem("token");

  let user = null;

  try {
    user = JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  // Check whether the user is logged in
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check whether the user's role is authorized
  if (allowedRole && user.role?.toLowerCase() !== allowedRole.toLowerCase()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
