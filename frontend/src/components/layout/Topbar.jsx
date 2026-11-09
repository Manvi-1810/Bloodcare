
import { useEffect, useState } from "react";
import {
  Bell,
  ChevronDown,
  UserRound,
  CheckCheck,
  LoaderCircle
} from "lucide-react";
import API from "../../services/api";

function Topbar({ title = "Dashboard", user = {} }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState("");

  const displayName = user.username || user.name || "User";
  const displayRole = user.role || "Member";

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      setNotificationError("");

      const [notificationsResponse, countResponse] = await Promise.all([
        API.get("/notifications"),
        API.get("/notifications/unread-count")
      ]);

      setNotifications(notificationsResponse.data);
      setUnreadCount(Number(countResponse.data.unread_count) || 0);
    } catch (error) {
      console.error("Fetch notifications error:", error);
      setNotificationError("Unable to load notifications.");
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await API.put(`/notifications/${notificationId}/read`);

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.notification_id === notificationId
            ? { ...notification, is_read: 1 }
            : notification
        )
      );

      setUnreadCount((previous) => Math.max(0, previous - 1));
    } catch (error) {
      console.error("Mark notification read error:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await API.put("/notifications/mark-all-read");

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          is_read: 1
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("Mark all notifications read error:", error);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

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
              const nextState = !showNotifications;

              setShowNotifications(nextState);
              setShowProfile(false);

              if (nextState) {
                fetchNotifications();
              }
            }}
            aria-label="Notifications"
          >
            <Bell size={20} />

            {unreadCount > 0 && (
              <span className="notification-count">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="dropdown-heading">
                <strong>Notifications</strong>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              {loadingNotifications ? (
                <div className="empty-notifications">
                  <LoaderCircle size={24} />
                  <span>Loading notifications...</span>
                </div>
              ) : notificationError ? (
                <div className="empty-notifications">
                  <span>{notificationError}</span>
                  <button onClick={fetchNotifications}>
                    Try again
                  </button>
                </div>
              ) : notifications.length === 0 ? (
                <div className="empty-notifications">
                  <Bell size={25} />
                  <strong>No notifications</strong>
                  <span>You're all caught up.</span>
                </div>
              ) : (
                <div className="notification-list">
                  {notifications.map((notification) => (
                    <button
                      type="button"
                      className={`notification-item ${
                        notification.is_read ? "" : "unread"
                      }`}
                      key={notification.notification_id}
                      onClick={() => {
                        if (!notification.is_read) {
                          handleMarkAsRead(
                            notification.notification_id
                          );
                        }
                      }}
                    >
                      <strong>{notification.title}</strong>
                      <p>{notification.message}</p>
                      <small>
                        {formatDate(notification.created_at)}
                      </small>
                    </button>
                  ))}
                </div>
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
