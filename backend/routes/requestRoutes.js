
const express = require("express");
const router = express.Router();
const db = require("../config/db");

const {
    verifyToken,
    authorizeRole
} = require("../middleware/authMiddleware");

// Get all requests - Admin only
router.get("/", verifyToken, authorizeRole("admin"), (req, res) => {
    const sql = `
        SELECT br.*, h.hospital_name, bg.blood_group
        FROM Blood_Requests br
        JOIN Hospitals h ON br.hospital_id = h.hospital_id
        JOIN Blood_Groups bg ON br.blood_group_id = bg.blood_group_id
        ORDER BY br.request_date DESC
    `;

    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json(result);
    });
});

// Get requests for a specific hospital - Admin or that hospital
router.get("/hospital/:id", verifyToken, (req, res) => {
    const hospitalId = Number(req.params.id);

    if (!Number.isInteger(hospitalId) || hospitalId <= 0) {
        return res.status(400).json({ message: "Invalid hospital ID" });
    }

    if (req.user.role.toLowerCase() === "admin") {
        return getHospitalRequests(hospitalId, res);
    }

    if (req.user.role.toLowerCase() !== "hospital") {
        return res.status(403).json({ message: "Access forbidden" });
    }

    db.query(
        "SELECT hospital_id FROM Hospitals WHERE user_id = ?",
        [req.user.user_id],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (
                result.length === 0 ||
                result[0].hospital_id !== hospitalId
            ) {
                return res.status(403).json({ message: "Access forbidden" });
            }

            getHospitalRequests(hospitalId, res);
        }
    );
});

// Helper function
function getHospitalRequests(hospitalId, res) {
    const sql = `
        SELECT br.*, h.hospital_name, bg.blood_group
        FROM Blood_Requests br
        JOIN Hospitals h ON br.hospital_id = h.hospital_id
        JOIN Blood_Groups bg ON br.blood_group_id = bg.blood_group_id
        WHERE br.hospital_id = ?
        ORDER BY br.request_date DESC
    `;

    db.query(sql, [hospitalId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json(result);
    });
}

// Create request - Hospital only
router.post("/add", verifyToken, authorizeRole("hospital"), (req, res) => {
    const { blood_group_id, units_requested, request_date } = req.body;

    if (
        !blood_group_id ||
        !Number.isInteger(units_requested) ||
        units_requested <= 0 ||
        !request_date
    ) {
        return res.status(400).json({
            message: "Please provide valid request details"
        });
    }

    // Get hospital ID from logged-in user
    db.query(
        "SELECT hospital_id FROM Hospitals WHERE user_id = ?",
        [req.user.user_id],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (result.length === 0) {
                return res.status(404).json({
                    message: "Hospital profile not found"
                });
            }

            const hospitalId = result[0].hospital_id;

            const sql = `
                INSERT INTO Blood_Requests
                (hospital_id, blood_group_id, units_requested, request_date, status)
                VALUES (?, ?, ?, ?, 'Pending')
            `;

            db.query(
                sql,
                [hospitalId, blood_group_id, units_requested, request_date],
                (err, insertResult) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }

                    res.status(201).json({
                        message: "Blood request submitted successfully!",
                        request_id: insertResult.insertId
                    });
                }
            );
        }
    );
});

// Update request status - Admin only
router.put(
    "/:id/status",
    verifyToken,
    authorizeRole("admin"),
    (req, res) => {
        const { status } = req.body;
        const allowedStatuses = [
            "Pending",
            "Approved",
            "Rejected",
            "Completed"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid request status"
            });
        }

        const sql = `
            UPDATE Blood_Requests
            SET status = ?
            WHERE request_id = ?
        `;

        db.query(sql, [status, req.params.id], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Request not found"
                });
            }

            res.json({
                message: "Request status updated successfully!"
            });
        });
    }
);

module.exports = router;
