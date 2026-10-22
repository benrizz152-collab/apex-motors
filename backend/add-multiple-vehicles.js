const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./apex_motors.db", (err) => {
    if (err) {
        console.error("Database connection failed:", err.message);
        return;
    }

    console.log("Connected to Apex Motors database.");
});

const vehicles = [
    {
        name: "Mercedes-Benz GLE",
        brand: "Mercedes-Benz",
        price: 12000000,
        image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8",
        description: "Luxury Mercedes-Benz GLE SUV with premium comfort and advanced technology."
    },
    {
        name: "Range Rover Sport",
        brand: "Land Rover",
        price: 18000000,
        image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6",
        description: "Premium Range Rover Sport combining performance, luxury and off-road capability."
    },
    {
        name: "Toyota Land Cruiser 300",
        brand: "Toyota",
        price: 22000000,
        image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b",
        description: "Powerful Toyota Land Cruiser 300 built for comfort and demanding journeys."
    },
    {
        name: "Porsche 911 Carrera",
        brand: "Porsche",
        price: 25000000,
        image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
        description: "Sporty Porsche 911 Carrera delivering exciting performance and iconic styling."
    }
];

db.serialize(() => {
    const statement = db.prepare(`
        INSERT INTO vehicles (name, brand, price, image, description)
        VALUES (?, ?, ?, ?, ?)
    `);

    vehicles.forEach((vehicle) => {
        statement.run(
            [
                vehicle.name,
                vehicle.brand,
                vehicle.price,
                vehicle.image,
                vehicle.description
            ],
            (err) => {
                if (err) {
                    console.error("Error adding vehicle:", err.message);
                } else {
                    console.log("Added:", vehicle.name);
                }
            }
        );
    });

    statement.finalize((err) => {
        if (err) {
            console.error("Error finishing inserts:", err.message);
        }

        db.close((closeErr) => {
            if (closeErr) {
                console.error(closeErr.message);
            } else {
                console.log("Vehicle insertion finished.");
            }
        });
    });
});