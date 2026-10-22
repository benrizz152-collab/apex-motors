const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./apex_motors.db", (err) => {
    if (err) {
        console.error("Database connection failed:", err.message);
    } else {
        console.log("Connected to Apex Motors database.");
    }
});

// Create our tables
db.serialize(() => {

    // Vehicles table
    db.run(`
        CREATE TABLE IF NOT EXISTS vehicles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            brand TEXT NOT NULL,
            price REAL NOT NULL,
            image TEXT,
            description TEXT
        )
    `);

    // Customers table
    db.run(`
        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL
        )
    `);

    // Inquiries table
    db.run(`
        CREATE TABLE IF NOT EXISTS inquiries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER,
            message TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (customer_id) REFERENCES customers(id)
        )
    `);

    // Add status column to existing inquiries table if needed
db.all("PRAGMA table_info(inquiries)", (err, columns) => {
    if (err) {
        console.error("Could not check inquiries table:", err);
        return;
    }

    const statusExists = columns.some(
        (column) => column.name === "status"
    );

    if (!statusExists) {
        db.run(
            "ALTER TABLE inquiries ADD COLUMN status TEXT NOT NULL DEFAULT 'Pending'",
            (alterErr) => {
                if (alterErr) {
                    console.error(
                        "Could not add inquiry status:",
                        alterErr
                    );
                } else {
                    console.log(
                        "Inquiry status column added successfully."
                    );
                }
            }
        );
    } else {
        console.log("Inquiry status column already exists.");
    }
});

    // Bookings table
    db.run(`
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER,
            vehicle_id INTEGER,
            booking_date TEXT NOT NULL,
            FOREIGN KEY (customer_id) REFERENCES customers(id),
            FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
        )
    `);

    console.log("Database tables created successfully.");
});

module.exports = db;