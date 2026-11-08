
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Building2,
  Droplet,
  HeartPulse,
  ClipboardList,
  Package,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  UserRound,
  Activity,
} from "lucide-react";

function Sidebar({ role = "admin", collapsed, onToggleCollapse }) {
  const navigate = useNavigate();

  const menuItems = {
    admin: [
      { label: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Donors", path: "/admin/donors", icon: Users },
      { label: "Hospitals", path: "/admin/hospitals", icon: Building2 },
      { label: "Blood Groups", path: "/admin/blood-groups", icon: Droplet },
      { label: "Donations", path: "/admin/donations", icon: HeartPulse },
      { label: "Blood Stock", path: "/admin/stock", icon: Package },
      { label: "Blood Requests", path: "/admin/requests", icon: ClipboardList },
      { label: "Blood Issues", path: "/admin/issues", icon: FileText },
    ],

    donor: [
      { label: "Dashboard", path: "/donor/dashboard", icon: LayoutDashboard },
      { label: "My Profile", path: "/donor/profile", icon: UserRound },
      { label: "My Donations", path: "/donor/donations", icon: HeartPulse },
      { label: "Blood Groups", path: "/donor/blood-groups", icon: Droplet },
    ],

    hospital: [
      { label: "Dashboard", path: "/hospital/dashboard", icon: LayoutDashboard },
      { label: "Blood Stock", path: "/hospital/stock", icon: Package },
      { label: "Submit Blood Request", path: "/hospital/submit-request", icon: ClipboardList },
      { label: "My Requests", path: "/hospital/requests", icon: FileText },
      { label: "Blood Issues", path: "/hospital/issues", icon: Activity },
    ],
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const currentMenu = menuItems[role?.toLowerCase()] || menuItems.admin;

  return (
    <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Droplet size={23} />
          </div>

          {!collapsed && (
            <div className="brand-text">
              <h2>BloodCare</h2>
              <span>Blood Management</span>
            </div>
          )}
        </div>

        <button
          className="sidebar-toggle"
          onClick={onToggleCollapse}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <div className="sidebar-menu">
        {!collapsed && <p className="sidebar-section-label">MAIN MENU</p>}

        <nav>
          {currentMenu.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
                title={collapsed ? item.label : ""}
              >
                <Icon size={19} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="sidebar-footer">
        <button
          className="sidebar-logout"
          onClick={handleLogout}
          title={collapsed ? "Logout" : ""}
        >
          <LogOut size={19} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
