
/* =========================================
   CHIP — STUDY SPACES
   Search, filters, details, favourites
   and simulated reservations.
========================================= */

// -----------------------------------------
// 1. SAMPLE STUDY SPACE DATA
// -----------------------------------------

const studySpaces = [
    {
        id: "babbio304",
        name: "Babbio 304",
        building: "Babbio Center",
        category: "quiet",
        type: "Quiet Study",
        availability: "Available until 4:00 PM",
        hours: "9:00 AM – 4:00 PM",
        capacity: "4 students",
        description:
            "A quiet study room suitable for individual work and focused study sessions.",
        amenities: ["Wi-Fi", "Study desks", "Power outlets"],
        icon: "📚"
    },
    {
        id: "mclean200",
        name: "McLean 200",
        building: "McLean Hall",
        category: "quiet",
        type: "Quiet Study",
        availability: "Available until 3:00 PM",
        hours: "9:00 AM – 3:00 PM",
        capacity: "2 students",
        description:
            "A smaller study space for students who prefer a quieter environment.",
        amenities: ["Wi-Fi", "Study desks", "Power outlets"],
        icon: "📖"
    },
    {
        id: "burchard100",
        name: "Burchard 100",
        building: "Burchard Building",
        category: "group",
        type: "Group Study",
        availability: "Available until 8:00 PM",
        hours: "9:00 AM – 8:00 PM",
        capacity: "6 students",
        description:
            "A collaborative space suitable for group assignments and discussions.",
        amenities: ["Wi-Fi", "Group seating", "Whiteboard"],
        icon: "👥"
    },
    {
        id: "babbio201",
        name: "Babbio 201",
        building: "Babbio Center",
        category: "group",
        type: "Group Study",
        availability: "Available until 6:30 PM",
        hours: "9:00 AM – 6:30 PM",
        capacity: "4 students",
        description:
            "A flexible study area for students working together on projects.",
        amenities: ["Wi-Fi", "Group seating", "Power outlets"],
        icon: "💻"
    }
];


// -----------------------------------------
// 2. LOCAL STORAGE
// -----------------------------------------

const RESERVATIONS_KEY = "chip.studySpaces.reservations";
const FAVORITES_KEY = "chip.studySpaces.favorites";

function getReservations() {
    return CHIP.read(RESERVATIONS_KEY, []);
}

function saveReservations(reservations) {
    CHIP.write(RESERVATIONS_KEY, reservations);
}

function getFavorites() {
    return CHIP.read(FAVORITES_KEY, []);
}

function saveFavorites(favorites) {
    CHIP.write(FAVORITES_KEY, favorites);
}


// -----------------------------------------
// 3. PAGE ELEMENTS
// -----------------------------------------

const browseScreen = document.getElementById("browseScreen");
const detailScreen = document.getElementById("detailScreen");
const reservationScreen = document.getElementById("reservationScreen");
const confirmationScreen = document.getElementById("confirmationScreen");

const searchInput = document.getElementById("searchInput");
const filterList = document.getElementById("filterList");
const spaceList = document.getElementById("spaceList");
const resultCount = document.getElementById("resultCount");
const emptyState = document.getElementById("emptyState");

const spaceDetails = document.getElementById("spaceDetails");

const backToSpaces = document.getElementById("backToSpaces");
const backToDetails = document.getElementById("backToDetails");

const reserveBtn = document.getElementById("reserveBtn");
const directionsBtn = document.getElementById("directionsBtn");

const reservationForm = document.getElementById("reservationForm");
const reservationSpaceName = document.getElementById("reservationSpaceName");
const reservationDate = document.getElementById("reservationDate");
const startTime = document.getElementById("startTime");
const duration = document.getElementById("duration");

const confirmationDetails = document.getElementById("confirmationDetails");
const confirmationDirections = document.getElementById("confirmationDirections");
const findAnotherBtn = document.getElementById("findAnotherBtn");


// -----------------------------------------
// 4. CURRENT PAGE STATE
// -----------------------------------------

let activeFilter = "all";
let selectedSpace = null;
let lastReservation = null;


// -----------------------------------------
// 5. SCREEN NAVIGATION
// -----------------------------------------

function showScreen(screen) {
    browseScreen.hidden = screen !== "browse";
    detailScreen.hidden = screen !== "details";
    reservationScreen.hidden = screen !== "reservation";
    confirmationScreen.hidden = screen !== "confirmation";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// -----------------------------------------
// 6. DISPLAY STUDY SPACES
// -----------------------------------------

function renderSpaces() {
    const searchTerm = searchInput.value.trim().toLowerCase();

    const filteredSpaces = studySpaces.filter(space => {

        const matchesSearch =
            space.name.toLowerCase().includes(searchTerm) ||
            space.building.toLowerCase().includes(searchTerm) ||
            space.type.toLowerCase().includes(searchTerm);

        const matchesFilter =
            activeFilter === "all" ||
            space.category === activeFilter;

        return matchesSearch && matchesFilter;
    });

    spaceList.innerHTML = "";

    resultCount.textContent =
        `${filteredSpaces.length} spaces`;

    emptyState.hidden = filteredSpaces.length !== 0;

    filteredSpaces.forEach(space => {

        const isFavorite = getFavorites().includes(space.id);

        const card = document.createElement("button");

        card.type = "button";
        card.className = "space-card";

        card.innerHTML = `
            <div class="space-image">
                ${space.icon}
            </div>

            <div class="space-info">
                <h3>${space.name}</h3>

                <p>${space.building}</p>

                <div class="space-meta">
                    <span class="space-tag">${space.type}</span>
                </div>

                <div class="space-meta">
                    <span class="availability">
                        ● ${space.availability}
                    </span>
                </div>
            </div>

            <span class="space-arrow">
                ${isFavorite ? "♥" : "›"}
            </span>
        `;

        card.addEventListener("click", () => {
            openSpaceDetails(space.id);
        });

        spaceList.appendChild(card);
    });
}


// -----------------------------------------
// 7. SEARCH
// -----------------------------------------

searchInput.addEventListener("input", renderSpaces);


// -----------------------------------------
// 8. CATEGORY FILTERS
// -----------------------------------------

filterList.addEventListener("click", event => {

    const button = event.target.closest(".filter-btn");

    if (!button) return;

    activeFilter = button.dataset.filter;

    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    button.classList.add("active");

    renderSpaces();
});


// -----------------------------------------
// 9. OPEN STUDY SPACE DETAILS
// -----------------------------------------

function openSpaceDetails(spaceId) {

    selectedSpace = studySpaces.find(
        space => space.id === spaceId
    );

    if (!selectedSpace) return;

    const isFavorite = getFavorites().includes(selectedSpace.id);

    spaceDetails.innerHTML = `

        <div class="detail-image">
            ${selectedSpace.icon}
        </div>

        <h1 class="detail-title">
            ${selectedSpace.name}
        </h1>

        <p class="detail-description">
            ${selectedSpace.building}
        </p>

        <span class="space-tag">
            ${selectedSpace.type}
        </span>

        <section class="detail-section">
            <h3>About this space</h3>
            <p class="muted">
                ${selectedSpace.description}
            </p>
        </section>

        <section class="detail-section">
            <h3>Space information</h3>

            <div class="detail-info-grid">

                <div class="detail-info">
                    <span>Availability</span>
                    <strong>${selectedSpace.availability}</strong>
                </div>

                <div class="detail-info">
                    <span>Opening hours</span>
                    <strong>${selectedSpace.hours}</strong>
                </div>

                <div class="detail-info">
                    <span>Capacity</span>
                    <strong>${selectedSpace.capacity}</strong>
                </div>

                <div class="detail-info">
                    <span>Study type</span>
                    <strong>${selectedSpace.type}</strong>
                </div>

            </div>
        </section>

        <section class="detail-section">
            <h3>Facilities</h3>

            <div class="amenity-list">
                ${selectedSpace.amenities.map(item => `
                    <span class="amenity">${item}</span>
                `).join("")}
            </div>
        </section>

        <section class="detail-section">
            <button
                class="btn btn-secondary btn-block"
                id="favoriteBtn"
                type="button"
            >
                ${isFavorite ? "♥ Remove from favourites" : "♡ Save to favourites"}
            </button>
        </section>

        <p class="muted" style="font-size: 0.75rem; margin-top: 18px;">
            Availability and room information are simulated
            sample data for this prototype.
        </p>
    `;

    showScreen("details");

    document.getElementById("favoriteBtn")
        .addEventListener("click", toggleFavorite);
}


// -----------------------------------------
// 10. SAVE / REMOVE FAVOURITES
// -----------------------------------------

function toggleFavorite() {

    if (!selectedSpace) return;

    let favorites = getFavorites();

    if (favorites.includes(selectedSpace.id)) {

        favorites = favorites.filter(
            id => id !== selectedSpace.id
        );

    } else {

        favorites.push(selectedSpace.id);

    }

    saveFavorites(favorites);

    const button = document.getElementById("favoriteBtn");

    const isFavorite = favorites.includes(selectedSpace.id);

    button.textContent = isFavorite
        ? "♥ Remove from favourites"
        : "♡ Save to favourites";

    renderSpaces();
}


// -----------------------------------------
// 11. NAVIGATION BETWEEN SCREENS
// -----------------------------------------

backToSpaces.addEventListener("click", () => {
    showScreen("browse");
});

backToDetails.addEventListener("click", () => {
    showScreen("details");
});


// -----------------------------------------
// 12. OPEN RESERVATION FORM
// -----------------------------------------

reserveBtn.addEventListener("click", () => {

    if (!selectedSpace) return;

    reservationSpaceName.textContent =
        `${selectedSpace.name} — ${selectedSpace.building}`;

    reservationForm.reset();

    reservationDate.min = getLocalDateString();

    reservationDate.value = getLocalDateString();

    showScreen("reservation");
});


// -----------------------------------------
// 13. DATE HELPER
// -----------------------------------------

function getLocalDateString() {

    const today = new Date();

    const year = today.getFullYear();

    const month = String(today.getMonth() + 1).padStart(2, "0");

    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// -----------------------------------------
// 14. TIME FORMATTING
// -----------------------------------------

function formatTime(time) {

    const [hours, minutes] = time.split(":").map(Number);

    const date = new Date();

    date.setHours(hours, minutes);

    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit"
    });
}


// -----------------------------------------
// 15. SUBMIT RESERVATION
// -----------------------------------------

reservationForm.addEventListener("submit", event => {

    event.preventDefault();

    if (!selectedSpace) return;

    const date = reservationDate.value;
    const start = startTime.value;
    const hours = Number(duration.value);

    if (!date || !start || !hours) {
        alert("Please complete all reservation details.");
        return;
    }

    if (date < getLocalDateString()) {
        alert("Please select today or a future date.");
        return;
    }

    const [startHour, startMinute] = start.split(":").map(Number);

    const endHour = startHour + hours;

    if (endHour > 16) {
        alert("Please select a time that finishes by 4:00 PM for this prototype.");
        return;
    }

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = startMinutes + hours * 60;

    const reservations = getReservations();

    const conflict = reservations.some(reservation => {

        if (
            reservation.spaceId !== selectedSpace.id ||
            reservation.date !== date
        ) {
            return false;
        }

        const existingStart = reservation.startMinutes;
        const existingEnd = reservation.endMinutes;

        return (
            startMinutes < existingEnd &&
            endMinutes > existingStart
        );
    });

    if (conflict) {
        alert("This space is already reserved during that time. Please choose another time.");
        return;
    }

    const reservation = {

        id: Date.now(),

        spaceId: selectedSpace.id,

        spaceName: selectedSpace.name,

        building: selectedSpace.building,

        date: date,

        start: start,

        duration: hours,

        startMinutes: startMinutes,

        endMinutes: endMinutes,

        createdAt: new Date().toISOString()

    };

    reservations.push(reservation);

    saveReservations(reservations);

    lastReservation = reservation;

    showConfirmation(reservation);
});


// -----------------------------------------
// 16. DISPLAY RESERVATION CONFIRMATION
// -----------------------------------------

function showConfirmation(reservation) {

    const formattedDate = new Date(
        `${reservation.date}T12:00:00`
    ).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric"
    });

    const endTimeMinutes =
        reservation.startMinutes + reservation.duration * 60;

    const endTime = formatTime(
        `${String(Math.floor(endTimeMinutes / 60)).padStart(2, "0")}:${String(endTimeMinutes % 60).padStart(2, "0")}`
    );

    confirmationDetails.innerHTML = `

        <p><strong>Study space:</strong> ${reservation.spaceName}</p>

        <p><strong>Building:</strong> ${reservation.building}</p>

        <p><strong>Date:</strong> ${formattedDate}</p>

        <p><strong>Time:</strong>
            ${formatTime(reservation.start)} – ${endTime}
        </p>

        <p><strong>Duration:</strong>
            ${reservation.duration} hour(s)
        </p>

        <p><strong>Status:</strong>
            <span class="availability">Confirmed</span>
        </p>

    `;

    showScreen("confirmation");
}


// -----------------------------------------
// 17. DIRECTIONS ACTION
// -----------------------------------------

function openDirections() {

    if (!selectedSpace) return;

    const destination = encodeURIComponent(
        `${selectedSpace.building}, Stevens Institute of Technology, Hoboken, NJ`
    );

    window.location.href =
        `../directions/index.html?destination=${destination}`;
}

directionsBtn.addEventListener("click", event => {
    event.preventDefault();
    openDirections();
});

confirmationDirections.addEventListener("click", event => {
    event.preventDefault();
    openDirections();
});


// -----------------------------------------
// 18. FIND ANOTHER SPACE
// -----------------------------------------

findAnotherBtn.addEventListener("click", () => {

    selectedSpace = null;

    searchInput.value = "";

    activeFilter = "all";

    document.querySelectorAll(".filter-btn").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.filter === "all"
        );
    });

    renderSpaces();

    showScreen("browse");
});


// -----------------------------------------
// 19. INITIALIZE STUDY SPACES
// -----------------------------------------

function initializeStudySpaces() {

    if (!window.CHIP) {
        console.error("CHIP shared storage could not be loaded.");
        return;
    }

    renderSpaces();

    showScreen("browse");

}

initializeStudySpaces();
