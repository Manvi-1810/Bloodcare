
const express = require("express");
const router = express.Router();
const db = require("../config/db");

const {
    verifyToken,
    authorizeRole
} = require("../middleware/authMiddleware");

// Get all blood issues - Admin only
router.get("/", verifyToken, authorizeRole("admin"), (req, res) => {
    const sql = `
        SELECT bi.*, br.hospital_id, h.hospital_name, bg.blood_group
        FROM Blood_Issues bi
        JOIN Blood_Requests br ON bi.request_id = br.request_id
        JOIN Hospitals h ON br.hospital_id = h.hospital_id
        JOIN Blood_Groups bg ON br.blood_group_id = bg.blood_group_id
        ORDER BY bi.issue_date DESC
    `;

    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json(result);
    });
});

// Get issues for a particular request - Admin or that hospital
router.get("/request/:id", verifyToken, (req, res) => {
    const requestId = Number(req.params.id);

    if (!Number.isInteger(requestId) || requestId <= 0) {
        return res.status(400).json({ message: "Invalid request ID" });
    }

    const sql = `
        SELECT bi.*, br.hospital_id, h.hospital_name, bg.blood_group
        FROM Blood_Issues bi
        JOIN Blood_Requests br ON bi.request_id = br.request_id
        JOIN Hospitals h ON br.hospital_id = h.hospital_id
        JOIN Blood_Groups bg ON br.blood_group_id = bg.blood_group_id
        WHERE bi.request_id = ?
    `;

    db.query(sql, [requestId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (req.user.role.toLowerCase() === "admin") {
            return res.json(result);
        }

        if (req.user.role.toLowerCase() !== "hospital") {
            return res.status(403).json({ message: "Access forbidden" });
        }

        db.query(
            `SELECT hospital_id FROM Hospitals WHERE user_id = ?`,
            [req.user.user_id],
            (err, hospitalResult) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                if (
                    hospitalResult.length === 0 ||
                    result.some(
                        issue =>
                            issue.hospital_id !== hospitalResult[0].hospital_id
                    )
                ) {
                    return res.status(403).json({ message: "Access forbidden" });
                }

                res.json(result);
            }
        );
    });
});

// Add blood issue - Admin only
router.post("/add", verifyToken, authorizeRole("admin"), (req, res) => {
    const { request_id, units_issued, issue_date } = req.body;

    if (
        !Number.isInteger(request_id) ||
        request_id <= 0 ||
        !Number.isInteger(units_issued) ||
        units_issued <= 0 ||
        !issue_date
    ) {
        return res.status(400).json({
            message: "Please provide valid issue details"
        });
    }

    // Check request and available stock before issuing
    const sql = `
        SELECT
            br.request_id,
            br.units_requested,
            br.status,
            br.blood_group_id,
            COALESCE(SUM(bi.units_issued), 0) AS already_issued,
            bs.units_available
        FROM Blood_Requests br
        LEFT JOIN Blood_Issues bi ON br.request_id = bi.request_id
        LEFT JOIN Blood_Stock bs ON br.blood_group_id = bs.blood_group_id
        WHERE br.request_id = ?
        GROUP BY
            br.request_id,
            br.units_requested,
            br.status,
            br.blood_group_id,
            bs.units_available
    `;

    db.query(sql, [request_id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: "Request not found" });
        }

        const request = result[0];
        const remainingUnits =
            request.units_requested - Number(request.already_issued);

        if (request.status !== "Approved") {
            return res.status(400).json({
                message: "Only approved requests can receive blood"
            });
        }

        if (units_issued > remainingUnits) {
            return res.status(400).json({
                message: `Only ${remainingUnits} units remain for this request`
            });
        }

        if (
            request.units_available === null ||
            units_issued > request.units_available
        ) {
            return res.status(400).json({
                message: "Insufficient blood stock"
            });
        }

        // The after_blood_issue trigger automatically reduces stock.
        db.query(
            `INSERT INTO Blood_Issues (request_id, units_issued, issue_date)
             VALUES (?, ?, ?)`,
            [request_id, units_issued, issue_date],
            (err, insertResult) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                res.status(201).json({
                    message: "Blood issued successfully!",
                    issue_id: insertResult.insertId
                });
            }
        );
    });
});

module.exports = router;
