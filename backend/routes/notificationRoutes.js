
const express = require("express");
const router = express.Router();

const db = require("../config/db");
const { verifyToken } = require("../middleware/authMiddleware");

// Get notifications for the logged-in user
router.get("/", verifyToken, (req, res) => {
    const userId = req.user.user_id;

    const sql = `
        SELECT *
        FROM Notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
    `;

    db.query(sql, [userId], (err, notifications) => {
        if (err) {
            console.error("Fetch notifications error:", err);
            return res.status(500).json({
                message: "Failed to fetch notifications"
            });
        }

        res.json(notifications);
    });
});

// Get unread notification count
router.get("/unread-count", verifyToken, (req, res) => {
    const userId = req.user.user_id;

    const sql = `
        SELECT COUNT(*) AS unread_count
        FROM Notifications
        WHERE user_id = ? AND is_read = FALSE
    `;

    db.query(sql, [userId], (err, result) => {
        if (err) {
            console.error("Unread count error:", err);
            return res.status(500).json({
                message: "Failed to fetch unread count"
            });
        }

        res.json({
            unread_count: result[0].unread_count
        });
    });
});

// Mark one notification as read
router.put("/:id/read", verifyToken, (req, res) => {
    const userId = req.user.user_id;
    const notificationId = req.params.id;

    const sql = `
        UPDATE Notifications
        SET is_read = TRUE
        WHERE notification_id = ? AND user_id = ?
    `;

    db.query(sql, [notificationId, userId], (err, result) => {
        if (err) {
            console.error("Mark notification read error:", err);
            return res.status(500).json({
                message: "Failed to update notification"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Notification not found"
            });
        }

        res.json({
            message: "Notification marked as read"
        });
    });
});

// Mark all notifications as read
router.put("/mark-all-read", verifyToken, (req, res) => {
    const userId = req.user.user_id;

    const sql = `
        UPDATE Notifications
        SET is_read = TRUE
        WHERE user_id = ? AND is_read = FALSE
    `;

    db.query(sql, [userId], (err) => {
        if (err) {
            console.error("Mark all notifications read error:", err);
            return res.status(500).json({
                message: "Failed to update notifications"
            });
        }

        res.json({
            message: "All notifications marked as read"
        });
    });
});

module.exports = router;
