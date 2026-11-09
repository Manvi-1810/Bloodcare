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
        SELECT
            d.*,
            bg.blood_group,
            u.email
        FROM Donors d
        JOIN Blood_Groups bg
            ON d.blood_group_id = bg.blood_group_id
        JOIN Users u
            ON d.user_id = u.user_id
        ORDER BY d.donor_id DESC
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

router.get(
    "/my-profile",
    verifyToken,
    authorizeRole("donor"),
    (req, res) => {

        const sql = `
            SELECT
                d.*,
                bg.blood_group,
                u.email
            FROM Donors d
            JOIN Blood_Groups bg
                ON d.blood_group_id = bg.blood_group_id
            JOIN Users u
                ON d.user_id = u.user_id
            WHERE d.user_id = ?
        `;

        db.query(sql, [req.user.user_id], (err, result) => {

            if (err) {
                return res.status(500).json({ error: err.message });
            }

            if (result.length === 0) {
                return res.status(404).json({
                    message: "Donor profile not found."
                });
            }

            res.json(result[0]);
        });

    }
);


// =====================================
// UPDATE LOGGED-IN DONOR PROFILE
// =====================================

router.put(
    "/my-profile",
    verifyToken,
    authorizeRole("donor"),
    (req, res) => {

        const {
            name,
            email,
            phone,
            address,
            blood_group_id
        } = req.body;

        const userId = req.user.user_id;

        // Validate required fields
        if (
            typeof name !== "string" ||
            !name.trim() ||
            typeof email !== "string" ||
            !email.trim() ||
            blood_group_id === undefined ||
            blood_group_id === null ||
            blood_group_id === ""
        ) {
            return res.status(400).json({
                message: "Name, email and blood group are required."
            });
        }

        const normalizedName = name.trim();
        const normalizedEmail = email.trim().toLowerCase();
        const bloodGroupId = Number(blood_group_id);

        // Validate email
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(normalizedEmail)) {
            return res.status(400).json({
                message: "Please enter a valid email address."
            });
        }

        // Validate blood group ID
        if (
            !Number.isInteger(bloodGroupId) ||
            bloodGroupId <= 0
        ) {
            return res.status(400).json({
                message: "Please select a valid blood group."
            });
        }

        // Validate optional fields
        if (
            phone !== undefined &&
            phone !== null &&
            typeof phone !== "string"
        ) {
            return res.status(400).json({
                message: "Invalid phone number."
            });
        }

        if (
            address !== undefined &&
            address !== null &&
            typeof address !== "string"
        ) {
            return res.status(400).json({
                message: "Invalid address."
            });
        }

        const normalizedPhone = phone?.trim() || null;
        const normalizedAddress = address?.trim() || null;

        // Check donor profile
        const donorSql = `
            SELECT donor_id
            FROM Donors
            WHERE user_id = ?
        `;

        db.query(donorSql, [userId], (donorErr, donorResult) => {

            if (donorErr) {
                return res.status(500).json({
                    error: donorErr.message
                });
            }

            if (donorResult.length === 0) {
                return res.status(404).json({
                    message: "Donor profile not found."
                });
            }

            // Check duplicate email
            const emailSql = `
                SELECT user_id
                FROM Users
                WHERE email = ?
                AND user_id != ?
            `;

            db.query(
                emailSql,
                [normalizedEmail, userId],
                (emailErr, emailResult) => {

                    if (emailErr) {
                        return res.status(500).json({
                            error: emailErr.message
                        });
                    }

                    if (emailResult.length > 0) {
                        return res.status(409).json({
                            message: "This email is already registered."
                        });
                    }

                    // Check blood group
                    const bloodGroupSql = `
                        SELECT blood_group_id
                        FROM Blood_Groups
                        WHERE blood_group_id = ?
                    `;

                    db.query(
                        bloodGroupSql,
                        [bloodGroupId],
                        (groupErr, groupResult) => {

                            if (groupErr) {
                                return res.status(500).json({
                                    error: groupErr.message
                                });
                            }

                            if (groupResult.length === 0) {
                                return res.status(400).json({
                                    message: "Selected blood group does not exist."
                                });
                            }

                            // Get dedicated connection from pool
                            db.getConnection((connectionErr, connection) => {

                                if (connectionErr) {
                                    return res.status(500).json({
                                        error: connectionErr.message
                                    });
                                }

                                connection.beginTransaction((transactionErr) => {

                                    if (transactionErr) {
                                        connection.release();

                                        return res.status(500).json({
                                            error: transactionErr.message
                                        });
                                    }

                                    // Rollback helper
                                    const rollbackWithError = (error) => {
                                        connection.rollback(() => {
                                            connection.release();

                                            res.status(500).json({
                                                error: error.message
                                            });
                                        });
                                    };

                                    // Update user email
                                    const updateUserSql = `
                                        UPDATE Users
                                        SET email = ?
                                        WHERE user_id = ?
                                    `;

                                    connection.query(
                                        updateUserSql,
                                        [normalizedEmail, userId],
                                        (userErr) => {

                                            if (userErr) {
                                                return rollbackWithError(userErr);
                                            }

                                            // Update donor details
                                            const updateDonorSql = `
                                                UPDATE Donors
                                                SET
                                                    name = ?,
                                                    phone = ?,
                                                    address = ?,
                                                    blood_group_id = ?
                                                WHERE user_id = ?
                                            `;

                                            connection.query(
                                                updateDonorSql,
                                                [
                                                    normalizedName,
                                                    normalizedPhone,
                                                    normalizedAddress,
                                                    bloodGroupId,
                                                    userId
                                                ],
                                                (updateErr) => {

                                                    if (updateErr) {
                                                        return rollbackWithError(updateErr);
                                                    }

                                                    // Commit transaction
                                                    connection.commit((commitErr) => {

                                                        if (commitErr) {
                                                            return rollbackWithError(commitErr);
                                                        }

                                                        connection.release();

                                                        res.json({
                                                            message: "Profile updated successfully."
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

                }
            );

        });

    }
);


// =====================================
// GET DONOR BY ID
// ADMIN OR THE SAME DONOR
// =====================================

router.get("/:id", verifyToken, (req, res) => {

    const donorId = Number(req.params.id);
    const role = String(req.user.role || "").toLowerCase();

    if (!Number.isInteger(donorId) || donorId <= 0) {
        return res.status(400).json({
            message: "Invalid donor ID."
        });
    }

    if (!["admin", "donor"].includes(role)) {
        return res.status(403).json({
            message: "Access forbidden."
        });
    }

    const sql = `
        SELECT
            d.*,
            bg.blood_group,
            u.email
        FROM Donors d
        JOIN Blood_Groups bg
            ON d.blood_group_id = bg.blood_group_id
        JOIN Users u
            ON d.user_id = u.user_id
        WHERE d.donor_id = ?
    `;

    db.query(sql, [donorId], (err, result) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        if (result.length === 0) {
            return res.status(404).json({
                message: "Donor not found."
            });
        }

        // Donor can access only their own record
        if (role === "donor") {

            const userSql = `
                SELECT donor_id
                FROM Donors
                WHERE user_id = ?
            `;

            db.query(
                userSql,
                [req.user.user_id],
                (userErr, userResult) => {

                    if (userErr) {
                        return res.status(500).json({
                            error: userErr.message
                        });
                    }

                    if (
                        userResult.length === 0 ||
                        Number(userResult[0].donor_id) !== donorId
                    ) {
                        return res.status(403).json({
                            message: "Access forbidden."
                        });
                    }

                    res.json(result[0]);

                }
            );

            return;
        }

        // Admin can access any donor
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

        // Validate required fields
        if (
            !username ||
            !email ||
            !password ||
            !name ||
            !blood_group_id
        ) {
            return res.status(400).json({
                message: "Please provide all required fields."
            });
        }

        // Get dedicated connection from pool
        db.getConnection((connectionErr, connection) => {

            if (connectionErr) {
                return res.status(500).json({
                    error: connectionErr.message
                });
            }

            connection.beginTransaction((transactionErr) => {

                if (transactionErr) {
                    connection.release();

                    return res.status(500).json({
                        error: transactionErr.message
                    });
                }

                // Rollback helper
                const rollbackWithError = (error) => {
                    connection.rollback(() => {
                        connection.release();

                        res.status(500).json({
                            error: error.message
                        });
                    });
                };

                // Hash password
                bcrypt.hash(password, 10, (hashErr, hashedPassword) => {

                    if (hashErr) {
                        return rollbackWithError(hashErr);
                    }

                    // Insert user
                    const userSql = `
                        INSERT INTO Users
                        (username, email, password, role)
                        VALUES (?, ?, ?, 'Donor')
                    `;

                    connection.query(
                        userSql,
                        [username, email, hashedPassword],
                        (userErr, userResult) => {

                            if (userErr) {
                                return rollbackWithError(userErr);
                            }

                            // Insert donor
                            const donorSql = `
                                INSERT INTO Donors
                                (
                                    user_id,
                                    name,
                                    blood_group_id,
                                    phone,
                                    address
                                )
                                VALUES (?, ?, ?, ?, ?)
                            `;

                            connection.query(
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
                                        return rollbackWithError(donorErr);
                                    }

                                    // Commit transaction
                                    connection.commit((commitErr) => {

                                        if (commitErr) {
                                            return rollbackWithError(commitErr);
                                        }

                                        connection.release();

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

        });

    }
);


// =====================================
// EXPORT ROUTER
// =====================================

module.exports = router;