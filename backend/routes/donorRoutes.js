
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcryptjs");

const {
    verifyToken,
    authorizeRole
} = require("../middleware/authMiddleware");

// =====================================
// GET ALL DONORS - ADMIN ONLY
// =====================================

router.get("/", verifyToken, authorizeRole("admin"), (req, res) => {

    const sql = `
        SELECT d.*, bg.blood_group
        FROM Donors d
        JOIN Blood_Groups bg
        ON d.blood_group_id = bg.blood_group_id
    `;

    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json(result);
    });
});

// =====================================
// GET LOGGED-IN DONOR PROFILE
// =====================================

router.get("/my-profile", verifyToken, authorizeRole("donor"), (req, res) => {

    const sql = `
        SELECT d.*, bg.blood_group
        FROM Donors d
        JOIN Blood_Groups bg
        ON d.blood_group_id = bg.blood_group_id
        WHERE d.user_id = ?
    `;

    db.query(sql, [req.user.user_id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (result.length === 0) {
            return res.status(404).json({
                message: "Donor profile not found"
            });
        }

        res.json(result[0]);
    });
});

// =====================================
// GET DONOR BY ID
// ADMIN OR THE SAME DONOR
// =====================================

router.get("/:id", verifyToken, (req, res) => {

    const donorId = Number(req.params.id);

    if (!Number.isInteger(donorId) || donorId <= 0) {
        return res.status(400).json({
            message: "Invalid donor ID"
        });
    }

    if (!["admin", "donor"].includes(req.user.role.toLowerCase())) {
        return res.status(403).json({
            message: "Access forbidden"
        });
    }

    const sql = `
        SELECT d.*, bg.blood_group
        FROM Donors d
        JOIN Blood_Groups bg
        ON d.blood_group_id = bg.blood_group_id
        WHERE d.donor_id = ?
    `;

    db.query(sql, [donorId], (err, result) => {

        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (result.length === 0) {
            return res.status(404).json({
                message: "Donor not found"
            });
        }

        if (req.user.role.toLowerCase() === "donor") {

            const userSql = `
                SELECT donor_id
                FROM Donors
                WHERE user_id = ?
            `;

            db.query(userSql, [req.user.user_id], (userErr, userResult) => {

                if (userErr) {
                    return res.status(500).json({
                        error: userErr.message
                    });
                }

                if (
                    userResult.length === 0 ||
                    userResult[0].donor_id !== donorId
                ) {
                    return res.status(403).json({
                        message: "Access forbidden"
                    });
                }

                res.json(result[0]);
            });

            return;
        }

        res.json(result[0]);
    });
});

// =====================================
// REGISTER DONOR - ADMIN ONLY
// =====================================

router.post(
    "/register",
    verifyToken,
    authorizeRole("admin"),
    (req, res) => {

        const {
            username,
            email,
            password,
            name,
            blood_group_id,
            phone,
            address
        } = req.body;

        if (!username || !email || !password || !name || !blood_group_id) {
            return res.status(400).json({
                message: "Please provide all required fields"
            });
        }

        db.beginTransaction((err) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            bcrypt.hash(password, 10, (hashErr, hashedPassword) => {

                if (hashErr) {
                    return db.rollback(() => {
                        res.status(500).json({
                            error: "Password hashing failed"
                        });
                    });
                }

                const userSql = `
                    INSERT INTO Users (username, email, password, role)
                    VALUES (?, ?, ?, 'Donor')
                `;

                db.query(
                    userSql,
                    [username, email, hashedPassword],
                    (userErr, userResult) => {

                        if (userErr) {
                            return db.rollback(() => {
                                res.status(500).json({
                                    error: userErr.message
                                });
                            });
                        }

                        const donorSql = `
                            INSERT INTO Donors
                            (user_id, name, blood_group_id, phone, address)
                            VALUES (?, ?, ?, ?, ?)
                        `;

                        db.query(
                            donorSql,
                            [
                                userResult.insertId,
                                name,
                                blood_group_id,
                                phone || null,
                                address || null
                            ],
                            (donorErr, donorResult) => {

                                if (donorErr) {
                                    return db.rollback(() => {
                                        res.status(500).json({
                                            error: donorErr.message
                                        });
                                    });
                                }

                                db.commit((commitErr) => {

                                    if (commitErr) {
                                        return db.rollback(() => {
                                            res.status(500).json({
                                                error: commitErr.message
                                            });
                                        });
                                    }

                                    res.status(201).json({
                                        message: "Donor registered successfully!",
                                        donor_id: donorResult.insertId
                                    });
                                });
                            }
                        );
                    }
                );
            });
        });
    }
);

module.exports = router;
