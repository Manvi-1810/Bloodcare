
const express = require("express");
const router = express.Router();
const db = require("../config/db");

const {
    verifyToken,
    authorizeRole
} = require("../middleware/authMiddleware");

// Get all blood stock - All logged-in users
router.get("/", verifyToken, (req, res) => {
    const sql = `
        SELECT bs.stock_id, bg.blood_group, bs.units_available
        FROM Blood_Stock bs
        JOIN Blood_Groups bg
        ON bs.blood_group_id = bg.blood_group_id
        ORDER BY bg.blood_group
    `;

    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json(result);
    });
});

// Get stock by blood group ID - All logged-in users
router.get("/:id", verifyToken, (req, res) => {
    const bloodGroupId = Number(req.params.id);

    if (!Number.isInteger(bloodGroupId) || bloodGroupId <= 0) {
        return res.status(400).json({
            message: "Invalid blood group ID"
        });
    }

    const sql = `
        SELECT bg.blood_group, bs.units_available
        FROM Blood_Stock bs
        JOIN Blood_Groups bg
        ON bs.blood_group_id = bg.blood_group_id
        WHERE bs.blood_group_id = ?
    `;

    db.query(sql, [bloodGroupId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (result.length === 0) {
            return res.status(404).json({
                message: "Blood stock not found"
            });
        }

        res.json(result[0]);
    });
});

// Update blood stock - Admin only
router.put(
    "/:id",
    verifyToken,
    authorizeRole("admin"),
    (req, res) => {
        const { units_available } = req.body;
        const bloodGroupId = Number(req.params.id);

        if (
            !Number.isInteger(bloodGroupId) ||
            bloodGroupId <= 0 ||
            !Number.isInteger(units_available) ||
            units_available < 0
        ) {
            return res.status(400).json({
                message: "Please provide valid stock details"
            });
        }

        const sql = `
            UPDATE Blood_Stock
            SET units_available = ?
            WHERE blood_group_id = ?
        `;

        db.query(
            sql,
            [units_available, bloodGroupId],
            (err, result) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }

                if (result.affectedRows === 0) {
                    return res.status(404).json({
                        message: "Blood group stock not found"
                    });
                }

                res.json({
                    message: "Blood stock updated successfully!"
                });
            }
        );
    }
);

module.exports = router;
