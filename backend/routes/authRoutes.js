require("dotenv").config();
const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        {
            user_id: user.user_id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );
};

// ===============================
// USER LOGIN
// ===============================

router.post("/login", (req, res) => {
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    const sql = "SELECT * FROM Users WHERE email = ?";

    db.query(sql, [email], async (err, result) => {
        if (err) {
            console.error("Login database error:", err);
            return res.status(500).json({
                message: "Database error"
            });
        }

        if (result.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const user = result[0];

        try {
            // Verify bcrypt password
            const isMatch = await bcrypt.compare(
                password,
                user.password
            );

            if (!isMatch) {
                return res.status(401).json({
                    message: "Invalid email or password"
                });
            }

            const token = generateToken(user);

            return res.status(200).json({
                message: "Login successful!",
                token,
                user: {
                    user_id: user.user_id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            });

        } catch (error) {
            console.error("Login error:", error);

            return res.status(500).json({
                message: "Login failed"
            });
        }
    });
});

// ===============================
// USER REGISTRATION
// ===============================

router.post("/register", async (req, res) => {
    const {
        username,
        email,
        password,
        role,
        phone,
        address,
        blood_group_id,
        hospital_name
    } = req.body;

    if (!username?.trim() || !email?.trim() || !password || !role) {
        return res.status(400).json({
            message: "Please fill all required fields"
        });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedRole = role.toLowerCase();

    if (!["donor", "hospital"].includes(normalizedRole)) {
        return res.status(400).json({
            message: "Only donor and hospital registration is allowed"
        });
    }

    if (password.length < 8) {
        return res.status(400).json({
            message: "Password must contain at least 8 characters"
        });
    }

    if (normalizedRole === "donor" && !blood_group_id) {
        return res.status(400).json({
            message: "Blood group is required for donors"
        });
    }

    if (normalizedRole === "hospital" && !hospital_name?.trim()) {
        return res.status(400).json({
            message: "Hospital name is required"
        });
    }

    let connection;
    let transactionStarted = false;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        connection = await new Promise((resolve, reject) => {
            db.getConnection((err, conn) => {
                if (err) reject(err);
                else resolve(conn);
            });
        });

        await new Promise((resolve, reject) => {
            connection.beginTransaction(err => {
                if (err) reject(err);
                else {
                    transactionStarted = true;
                    resolve();
                }
            });
        });

        const userResult = await new Promise((resolve, reject) => {
            connection.query(
                `INSERT INTO Users
                (username, email, password, role)
                VALUES (?, ?, ?, ?)`,
                [
                    username.trim(),
                    normalizedEmail,
                    hashedPassword,
                    normalizedRole
                ],
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });

        const userId = userResult.insertId;

        if (normalizedRole === "donor") {
            await new Promise((resolve, reject) => {
                connection.query(
                    `INSERT INTO Donors
                    (user_id, name, blood_group_id, phone, address)
                    VALUES (?, ?, ?, ?, ?)`,
                    [
                        userId,
                        username.trim(),
                        Number(blood_group_id),
                        phone || null,
                        address || null
                    ],
                    (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    }
                );
            });
        }

        if (normalizedRole === "hospital") {
            await new Promise((resolve, reject) => {
                connection.query(
                    `INSERT INTO Hospitals
                    (user_id, hospital_name, phone, address)
                    VALUES (?, ?, ?, ?)`,
                    [
                        userId,
                        hospital_name.trim(),
                        phone || null,
                        address || null
                    ],
                    (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    }
                );
            });
        }

        await new Promise((resolve, reject) => {
            connection.commit(err => {
                if (err) reject(err);
                else {
                    transactionStarted = false;
                    resolve();
                }
            });
        });

        const newUser = {
            user_id: userId,
            username: username.trim(),
            email: normalizedEmail,
            role: normalizedRole
        };

        const token = generateToken(newUser);

        return res.status(201).json({
            message: "Registration successful!",
            token,
            user: newUser
        });

    } catch (error) {
        if (connection && transactionStarted) {
            await new Promise(resolve => {
                connection.rollback(() => resolve());
            });
        }

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "Email address is already registered"
            });
        }

        console.error("Registration error:", error);

        return res.status(500).json({
            message: "Registration failed"
        });

    } finally {
        if (connection) {
            connection.release();
        }
    }
});

module.exports = router;
