const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./apex_motors.db", (err) => {
    if (err) {
        console.error("Database connection failed:", err.message);
        return;
    }

    console.log("Connected to Apex Motors database.");
});

db.run(
    "DELETE FROM vehicles WHERE id NOT IN (SELECT MIN(id) FROM vehicles GROUP BY name, brand)",
    function (err) {
        if (err) {
            console.error("Cleanup failed:", err.message);
        } else {
            console.log("Duplicate vehicles removed:", this.changes);

            db.all("SELECT * FROM vehicles", [], (err, rows) => {
                if (err) {
                    console.error(err.message);
                } else {
                    console.log("Remaining vehicles:", rows);
                }

                db.close();
            });
        }
    }
);