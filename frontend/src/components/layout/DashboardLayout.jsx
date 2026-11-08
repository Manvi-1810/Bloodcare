
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";


function DashboardLayout({ role = "admin" }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const currentPage = location.pathname
    .split("/")
    .filter(Boolean)
    .pop();

  const title = currentPage
    ? currentPage
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
    : "Dashboard";

  return (
    <div className="dashboard-shell">
      <Sidebar
        role={role}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      <div className={`dashboard-main ${collapsed ? "sidebar-collapsed" : ""}`}>
        <Topbar
          title={title}
          user={{ ...user, role: user.role || role }}
        />

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;