
import { useState } from "react";
import {
  Bell,
  ChevronDown,
  UserRound,
  CheckCheck
} from "lucide-react";


function Topbar({ title = "Dashboard", user = {} }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // No fake notifications. Connect real notifications when that feature is implemented.
  const notifications = [];

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const displayName = user.username || user.name || "User";
  const displayRole = user.role || "Member";

  return (
    <header className="topbar">
      <div className="topbar-heading">
        <h1>{title}</h1>
        <p>BloodCare <span>/</span> {title}</p>
      </div>

      <div className="topbar-actions">
        <div className="notification-wrapper">
          <button
            className="topbar-icon-button"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfile(false);
            }}
            aria-label="Notifications"
          >
            <Bell size={20} />

            {unreadCount > 0 && (
              <span className="notification-count">{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="dropdown-heading">
                <strong>Notifications</strong>
                {unreadCount > 0 && (
                  <span>{unreadCount} unread</span>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="empty-notifications">
                  <Bell size={25} />
                  <strong>No notifications</strong>
                  <span>You're all caught up.</span>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    className="notification-item"
                    key={notification.id}
                  >
                    <strong>{notification.title}</strong>
                    <p>{notification.message}</p>
                    <small>{notification.time}</small>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="profile-wrapper">
          <button
            className="profile-button"
            onClick={() => {
              setShowProfile(!showProfile);
              setShowNotifications(false);
            }}
          >
            <div className="profile-avatar">
              <UserRound size={19} />
            </div>

            <div className="profile-details">
              <strong>{displayName}</strong>
              <span>{displayRole}</span>
            </div>

            <ChevronDown size={16} />
          </button>

          {showProfile && (
            <div className="profile-dropdown">
              <div className="profile-dropdown-user">
                <strong>{displayName}</strong>
                <span>{displayRole}</span>
              </div>
              <div className="profile-dropdown-info">
                <CheckCheck size={16} />
                Signed in
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
