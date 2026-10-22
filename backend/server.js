require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./database");

const bcrypt = require("bcryptjs");
const session = require("express-session");


const app = express();
const PORT = 3000;


app.use(cors({
    origin: [
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "https://benrizz152-collab.github.io"
    ],
    credentials: true
}));


app.use(express.json());


app.use(session({
    name: "apex.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: 30 * 60 * 1000
    }
}));


// Home/test route
app.get("/", (req, res) => {
    res.send("Apex Motors backend is running!");
});

// Get all vehicles
app.get("/api/vehicles", (req, res) => {
    db.all("SELECT * FROM vehicles", [], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: err.message });
        }

        res.json(rows);
    });
});

// Add a vehicle
app.post("/api/vehicles", requireAdmin, (req, res) => {
    const { name, brand, price, image, description } = req.body;

    const sql = `
        INSERT INTO vehicles (name, brand, price, image, description)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.run(
        sql,
        [name, brand, price, image, description],
        function (err) {
            if (err) {
                console.error(err.message);
                return res.status(500).json({ error: err.message });
            }

            res.json({
                message: "Vehicle added successfully!",
                vehicleId: this.lastID
            });
        }
    );
});
// ===============================
// UPDATE AN EXISTING VEHICLE
// ===============================

app.put("/api/vehicles/:id", requireAdmin, (req, res) => {
    const { name, brand, price, image, description } = req.body;
    const vehicleId = req.params.id;

    if (
        !name || !brand || price === undefined ||
        !image || !description
    ) {
        return res.status(400).json({
            error: "Please provide all vehicle details."
        });
    }

    const sql = `
        UPDATE vehicles
        SET name = ?, brand = ?, price = ?, image = ?, description = ?
        WHERE id = ?
    `;

    db.run(
        sql,
        [name, brand, price, image, description, vehicleId],
        function (err) {
            if (err) {
                console.error("Error updating vehicle:", err.message);

                return res.status(500).json({
                    error: "Unable to update vehicle."
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    error: "Vehicle not found."
                });
            }

            res.json({
                message: "Vehicle updated successfully!"
            });
        }
    );
});


// ===============================
// DELETE A VEHICLE
// ===============================

app.delete("/api/vehicles/:id", requireAdmin, (req, res) => {
    const vehicleId = req.params.id;

    db.run(
        "DELETE FROM vehicles WHERE id = ?",
        [vehicleId],
        function (err) {
            if (err) {
                console.error("Error deleting vehicle:", err.message);

                return res.status(500).json({
                    error: "Unable to delete vehicle."
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    error: "Vehicle not found."
                });
            }

            res.json({
                message: "Vehicle deleted successfully!"
            });
        }
    );
});
// ===============================
// SAVE CUSTOMER INQUIRIES
// ===============================

app.post("/api/inquiries", (req, res) => {
    const { name, email, phone, message } = req.body;

    // Check that all fields have been provided
    if (
        !name || !email || !phone || !message ||
        !name.trim() || !email.trim() ||
        !phone.trim() || !message.trim()
    ) {
        return res.status(400).json({
            error: "Please fill in all the fields."
        });
    }

    // Save the customer details
    const customerSql = `
        INSERT INTO customers (name, email, phone)
        VALUES (?, ?, ?)
    `;

    db.run(
        customerSql,
        [name.trim(), email.trim(), phone.trim()],
        function (err) {
            if (err) {
                console.error("Error saving customer:", err.message);

                return res.status(500).json({
                    error: "Unable to save customer details."
                });
            }

            const customerId = this.lastID;

            // Save the customer's inquiry
            const inquirySql = `
                INSERT INTO inquiries (customer_id, message)
                VALUES (?, ?)
            `;

            db.run(
                inquirySql,
                [customerId, message.trim()],
                function (err) {
                    if (err) {
                        console.error("Error saving inquiry:", err.message);

                        return res.status(500).json({
                            error: "Customer saved, but inquiry could not be saved."
                        });
                    }

                    res.status(201).json({
                        message: "Your inquiry has been submitted successfully!",
                        customerId: customerId,
                        inquiryId: this.lastID
                    });
                }
            );
        }
    );
});

function requireAdmin(req, res, next) {
    if (req.session && req.session.isAdmin === true) {
        return next();
    }

    return res.status(401).json({
        error: "Administrator login required."
    });
}

// ADMIN LOGIN
app.post("/api/admin/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (
            typeof username !== "string" ||
            typeof password !== "string" ||
            !process.env.ADMIN_USERNAME ||
            !process.env.ADMIN_PASSWORD_HASH
        ) {
            return res.status(400).json({
                error: "Invalid login details."
            });
        }

        const usernameMatches =
            username === process.env.ADMIN_USERNAME;

        const passwordMatches = await bcrypt.compare(
            password,
            process.env.ADMIN_PASSWORD_HASH
        );

        if (!usernameMatches || !passwordMatches) {
            return res.status(401).json({
                error: "Incorrect username or password."
            });
        }

        req.session.regenerate((err) => {
            if (err) {
                return res.status(500).json({
                    error: "Could not create login session."
                });
            }

            req.session.isAdmin = true;

            req.session.save((saveErr) => {
                if (saveErr) {
                    return res.status(500).json({
                        error: "Could not save login session."
                    });
                }

                return res.json({
                    message: "Admin login successful."
                });
            });
        });
    } catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({
            error: "An unexpected login error occurred."
        });
    }
});

// CHECK WHETHER ADMIN IS LOGGED IN
app.get("/api/admin/me", requireAdmin, (req, res) => {
    res.json({ authenticated: true });
});

// ADMIN LOGOUT
app.post("/api/admin/logout", requireAdmin, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                error: "Could not log out."
            });
        }

        res.clearCookie("apex.sid", {
            httpOnly: true,
            sameSite: "lax",
            secure: false
        });

        res.json({ message: "Logged out successfully." });
    });
});

 // GET CUSTOMER INQUIRIES (ADMIN ONLY)
app.get("/api/inquiries", requireAdmin, (req, res) => {
    const sql = `
        SELECT
            inquiries.id,
            customers.name,
            customers.email,
            customers.phone,
            inquiries.message,
            inquiries.created_at
        FROM inquiries
        JOIN customers
            ON inquiries.customer_id = customers.id
        ORDER BY inquiries.created_at DESC
    `;

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("Error loading inquiries:", err);

            return res.status(500).json({
                error: "Could not load customer inquiries."
            });
        }

        res.json(rows);
    });
});


// UPDATE CUSTOMER INQUIRY STATUS (ADMIN ONLY)
app.put("/api/inquiries/:id/status", requireAdmin, (req, res) => {
    const inquiryId = Number(req.params.id);
    const { status } = req.body;

    const allowedStatuses = ["Pending", "Contacted", "Resolved"];

    if (!Number.isInteger(inquiryId) || inquiryId <= 0) {
        return res.status(400).json({
            error: "Invalid inquiry ID."
        });
    }

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            error: "Invalid inquiry status."
        });
    }

    db.run(
        "UPDATE inquiries SET status = ? WHERE id = ?",
        [status, inquiryId],
        function (err) {
            if (err) {
                console.error("Status update error:", err);

                return res.status(500).json({
                    error: "Could not update inquiry status."
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    error: "Inquiry not found."
                });
            }

            res.json({
                message: "Inquiry status updated successfully.",
                status: status
            });
        }
    );
});


// Start server
app.listen(PORT, () => {
    console.log(`Apex Motors server running at http://localhost:${PORT}`);
});