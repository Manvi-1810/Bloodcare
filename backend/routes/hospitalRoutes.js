
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcryptjs");

const {
    verifyToken,
    authorizeRole
} = require("../middleware/authMiddleware");

// Get all hospitals - Admin only
router.get("/", verifyToken, authorizeRole("admin"), (req, res) => {
    const sql = "SELECT * FROM Hospitals";

    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        res.json(result);
    });
});

// Get logged-in hospital profile - Hospital only
router.get(
    "/my-profile",
    verifyToken,
    authorizeRole("hospital"),
    (req, res) => {
        const sql = `
            SELECT
                hospital_id,
                user_id,
                hospital_name,
                phone,
                address
            FROM Hospitals
            WHERE user_id = ?
        `;

        db.query(sql, [req.user.user_id], (err, result) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (result.length === 0) {
                return res.status(404).json({
                    message: "Hospital profile not found"
                });
            }

            res.json(result[0]);
        });
    }
);

// Get hospital by ID - Admin or own hospital
router.get("/:id", verifyToken, (req, res) => {
    const hospitalId = Number(req.params.id);

    if (!Number.isInteger(hospitalId) || hospitalId <= 0) {
        return res.status(400).json({
            message: "Invalid hospital ID"
        });
    }

    const sql = "SELECT * FROM Hospitals WHERE hospital_id = ?";

    db.query(sql, [hospitalId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (result.length === 0) {
            return res.status(404).json({
                message: "Hospital not found"
            });
        }

        if (req.user.role.toLowerCase() === "admin") {
            return res.json(result[0]);
        }

        if (req.user.role.toLowerCase() !== "hospital") {
            return res.status(403).json({
                message: "Access forbidden"
            });
        }

        const userSql = `
            SELECT hospital_id
            FROM Hospitals
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
                userResult[0].hospital_id !== hospitalId
            ) {
                return res.status(403).json({
                    message: "Access forbidden"
                });
            }

            res.json(result[0]);
        });
    });
});

// Register hospital - Admin only
router.post(
    "/register",
    verifyToken,
    authorizeRole("admin"),
    (req, res) => {
        const {
            username,
            email,
            password,
            hospital_name,
            phone,
            address
        } = req.body;

        if (!username || !email || !password || !hospital_name) {
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
                    VALUES (?, ?, ?, 'Hospital')
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

                        const hospitalSql = `
                            INSERT INTO Hospitals
                            (user_id, hospital_name, phone, address)
                            VALUES (?, ?, ?, ?)
                        `;

                        db.query(
                            hospitalSql,
                            [
                                userResult.insertId,
                                hospital_name,
                                phone || null,
                                address || null
                            ],
                            (hospitalErr, hospitalResult) => {
                                if (hospitalErr) {
                                    return db.rollback(() => {
                                        res.status(500).json({
                                            error: hospitalErr.message
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
                                        message: "Hospital registered successfully!",
                                        hospital_id: hospitalResult.insertId
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
