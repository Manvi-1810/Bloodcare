
const express = require("express");
const router = express.Router();
const db = require("../config/db");

const {
    verifyToken,
    authorizeRole
} = require("../middleware/authMiddleware");

// Get all donations - Admin only
router.get("/", verifyToken, authorizeRole("admin"), (req, res) => {
    const sql = `
        SELECT d.*, donors.name, bg.blood_group
        FROM Donations d
        JOIN Donors donors ON d.donor_id = donors.donor_id
        JOIN Blood_Groups bg ON donors.blood_group_id = bg.blood_group_id
    `;

    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json(result);
    });
});

// Get donations for a specific donor - Admin or that donor
router.get("/donor/:id", verifyToken, (req, res) => {
    const donorId = Number(req.params.id);

    if (!Number.isInteger(donorId) || donorId <= 0) {
        return res.status(400).json({ message: "Invalid donor ID" });
    }

    const sql = `
        SELECT * FROM Donors WHERE donor_id = ?
    `;

    db.query(sql, [donorId], (err, donors) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (donors.length === 0) {
            return res.status(404).json({ message: "Donor not found" });
        }

        if (req.user.role.toLowerCase() === "admin") {
            return getDonations(donorId, res);
        }

        if (req.user.role.toLowerCase() !== "donor") {
            return res.status(403).json({ message: "Access forbidden" });
        }

        db.query(
            "SELECT donor_id FROM Donors WHERE user_id = ?",
            [req.user.user_id],
            (userErr, userResult) => {
                if (userErr) {
                    return res.status(500).json({ error: userErr.message });
                }

                if (
                    userResult.length === 0 ||
                    userResult[0].donor_id !== donorId
                ) {
                    return res.status(403).json({ message: "Access forbidden" });
                }

                getDonations(donorId, res);
            }
        );
    });
});

// Helper function
function getDonations(donorId, res) {
    const sql = `
        SELECT * FROM Donations
        WHERE donor_id = ?
        ORDER BY donation_date DESC
    `;

    db.query(sql, [donorId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json(result);
    });
}

// Add donation - Admin only
router.post("/add", verifyToken, authorizeRole("admin"), (req, res) => {
    const { donor_id, donation_date, units } = req.body;

    if (
        !donor_id ||
        !donation_date ||
        !Number.isInteger(units) ||
        units <= 0
    ) {
        return res.status(400).json({
            message: "Please provide valid donation details"
        });
    }

    const sql = `
        INSERT INTO Donations (donor_id, donation_date, units, status)
        VALUES (?, ?, ?, 'Completed')
    `;

    db.query(sql, [donor_id, donation_date, units], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.status(201).json({
            message: "Donation recorded successfully!",
            donation_id: result.insertId
        });
    });
});

module.exports = router;
