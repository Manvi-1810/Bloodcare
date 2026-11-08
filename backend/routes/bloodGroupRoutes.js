
const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET ALL BLOOD GROUPS - PUBLIC ACCESS
router.get("/", (req, res) => {
    console.log("Public blood groups route reached");

    const sql = "SELECT * FROM Blood_Groups ORDER BY blood_group";

    db.query(sql, (err, result) => {
        if (err) {
            console.error("Blood groups error:", err);
            return res.status(500).json({
                message: "Database error",
                error: err.message
            });
        }

        return res.status(200).json(result);
    });
});

// GET BLOOD GROUP BY ID - LOGIN REQUIRED
router.get("/:id", (req, res, next) => {
    const { verifyToken } = require("../middleware/authMiddleware");
    verifyToken(req, res, next);
}, (req, res) => {
    const bloodGroupId = Number(req.params.id);

    if (!Number.isInteger(bloodGroupId) || bloodGroupId <= 0) {
        return res.status(400).json({
            message: "Invalid blood group ID"
        });
    }

    const sql = `
        SELECT * FROM Blood_Groups
        WHERE blood_group_id = ?
    `;

    db.query(sql, [bloodGroupId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (result.length === 0) {
            return res.status(404).json({
                message: "Blood group not found"
            });
        }

        return res.json(result[0]);
    });
});

module.exports = router;
