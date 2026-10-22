const http = require("http");

const vehicle = JSON.stringify({
    name: "BMW M4",
    brand: "BMW",
    price: 14500000,
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e",
    description: "2024 BMW M4 with a 3.0L Turbo engine and automatic transmission."
});

const options = {
    hostname: "localhost",
    port: 3000,
    path: "/api/vehicles",
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(vehicle)
    }
};

const request = http.request(options, (response) => {
    let data = "";

    response.on("data", (chunk) => {
        data += chunk;
    });

    response.on("end", () => {
        console.log(data);
    });
});

request.on("error", (error) => {
    console.error(error);
});

request.write(vehicle);
request.end();