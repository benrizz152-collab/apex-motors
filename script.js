// ===============================
// STORE ALL VEHICLES
// ===============================

let allVehicles = [];


// ===============================
// LOAD VEHICLES FROM THE DATABASE
// ===============================

async function loadVehicles() {
    const container = document.getElementById("vehicle-container");

    try {
        const response = await fetch("http://localhost:3000/api/vehicles");

        if (!response.ok) {
            throw new Error("Failed to load vehicles.");
        }

        allVehicles = await response.json();

        populateBrandFilter();
        displayVehicles(allVehicles);

    } catch (error) {
        console.error("Error loading vehicles:", error);

        container.innerHTML =
            "<p>Unable to load vehicles. Please make sure the backend server is running.</p>";
    }
}


// ===============================
// POPULATE THE BRAND FILTER
// ===============================

function populateBrandFilter() {
    const brandFilter = document.getElementById("brand-filter");

    if (!brandFilter) {
        return;
    }

    const brands = [...new Set(
        allVehicles.map(vehicle => vehicle.brand)
    )].filter(Boolean).sort();

    brandFilter.innerHTML = '<option value="">All Brands</option>';

    brands.forEach(function (brand) {
        const option = document.createElement("option");

        option.value = brand;
        option.textContent = brand;

        brandFilter.appendChild(option);
    });
}


// ===============================
// DISPLAY VEHICLES
// ===============================

function displayVehicles(vehicles) {
    const container = document.getElementById("vehicle-container");

    container.innerHTML = "";

    if (vehicles.length === 0) {
        container.innerHTML =
            "<p>No vehicles match your search. Try different filters.</p>";
        return;
    }

    vehicles.forEach(function (vehicle) {
        const card = document.createElement("div");
        card.className = "vehicle-card";

        const image = document.createElement("img");
        image.src = vehicle.image;
        image.alt = vehicle.name;

        image.onerror = function () {
            this.alt = vehicle.name + " image unavailable";
        };

        const title = document.createElement("h3");
        title.textContent = vehicle.name;

        const description = document.createElement("p");
        description.textContent = vehicle.description;

        const price = document.createElement("h4");
        price.textContent =
            "KSh " + Number(vehicle.price).toLocaleString("en-KE");

        const button = document.createElement("button");
        button.textContent = "View Vehicle";

        button.addEventListener("click", function () {
            showMessage(vehicle);
        });

        card.appendChild(image);
        card.appendChild(title);
        card.appendChild(description);
        card.appendChild(price);
        card.appendChild(button);

        container.appendChild(card);
    });
}


// ===============================
// SEARCH AND FILTER VEHICLES
// ===============================

function filterVehicles() {
    const searchInput = document.getElementById("vehicle-search");
    const brandFilter = document.getElementById("brand-filter");
    const priceFilter = document.getElementById("price-filter");

    const searchTerm = searchInput
        ? searchInput.value.toLowerCase().trim()
        : "";

    const selectedBrand = brandFilter
        ? brandFilter.value
        : "";

    const selectedPrice = priceFilter
        ? priceFilter.value
        : "";

    let filteredVehicles = allVehicles.filter(function (vehicle) {
        const matchesSearch =
            vehicle.name.toLowerCase().includes(searchTerm) ||
            vehicle.brand.toLowerCase().includes(searchTerm);

        const matchesBrand =
            selectedBrand === "" || vehicle.brand === selectedBrand;

        let matchesPrice = true;

        if (selectedPrice !== "") {
            const priceRange = selectedPrice.split("-");
            const minimumPrice = Number(priceRange[0]);
            const maximumPrice = Number(priceRange[1]);

            matchesPrice =
                Number(vehicle.price) >= minimumPrice &&
                Number(vehicle.price) <= maximumPrice;
        }

        return matchesSearch && matchesBrand && matchesPrice;
    });

    displayVehicles(filteredVehicles);
}


// ===============================
// CONNECT THE FILTER CONTROLS
// ===============================

const searchInput = document.getElementById("vehicle-search");
const brandFilter = document.getElementById("brand-filter");
const priceFilter = document.getElementById("price-filter");

if (searchInput) {
    searchInput.addEventListener("input", filterVehicles);
}

if (brandFilter) {
    brandFilter.addEventListener("change", filterVehicles);
}

if (priceFilter) {
    priceFilter.addEventListener("change", filterVehicles);
}


// ===============================
// SHOW VEHICLE DETAILS
// ===============================

function showMessage(vehicle) {
    document.getElementById("modal-title").textContent = vehicle.name;

    document.getElementById("modal-description").textContent =
        vehicle.description +
        " Price: KSh " +
        Number(vehicle.price).toLocaleString("en-KE");

    document.getElementById("vehicle-modal").style.display = "flex";
}


// ===============================
// CLOSE VEHICLE MODAL
// ===============================

function closeModal() {
    document.getElementById("vehicle-modal").style.display = "none";
}


// ===============================
// CONTACT THE DEALER
// ===============================

function contactDealer() {
    closeModal();

    document.getElementById("contact").scrollIntoView({
        behavior: "smooth"
    });
}


// ===============================
// CONTACT FORM
// ===============================

async function submitForm(event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!name || !email || !phone || !message) {
        alert("Please fill in all the fields.");
        return;
    }

    const submitButton = event.target.querySelector(
        'button[type="submit"]'
    );

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
    }

    try {
        const response = await fetch("http://localhost:3000/api/inquiries", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: name,
                email: email,
                phone: phone,
                message: message
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Failed to submit inquiry.");
        }

        alert(
            "Thank you, " + name +
            "! Your inquiry has been saved successfully."
        );

        event.target.reset();

    } catch (error) {
        console.error("Error submitting inquiry:", error);

        alert(
            "We couldn't submit your inquiry. Please check that the backend server is running and try again."
        );

    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "Send Message";
        }
    }
}


// ===============================
// MOBILE NAVIGATION
// ===============================

function toggleMenu() {
    document.getElementById("nav-menu").classList.toggle("active");
}

function closeMenu() {
    document.getElementById("nav-menu").classList.remove("active");
}


// ===============================
// START THE WEBSITE
// ===============================

loadVehicles();