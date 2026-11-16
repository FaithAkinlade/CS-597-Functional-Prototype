const dateInput = document.getElementById("selectedDate");
const dayViewBtn = document.getElementById("dayView");
const weekViewBtn = document.getElementById("weekView");
const availabilityList = document.getElementById("availabilityList");
const availabilityTitle = document.getElementById("availabilityTitle");
const availabilitySubtitle = document.getElementById("availabilitySubtitle");
const emptyState = document.getElementById("emptyState");

const bookingCard = document.getElementById("bookingCard");
const selectedSlotText = document.getElementById("selectedSlotText");
const durationInput = document.getElementById("studyDuration");
const studyTitleInput = document.getElementById("studyTitle");
const bookingError = document.getElementById("bookingError");

const successCard = document.getElementById("successCard");
const successMessage = document.getElementById("successMessage");

let currentView = "day";
let selectedSlot = null;

// Use local dates rather than UTC dates.
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date, amount) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function getMonday(date) {
  const result = new Date(date);
  const difference = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - difference);
  return result;
}

function displayDate(date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric"
  });
}

function displayTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;

  return `${displayHour}:${String(mins).padStart(2, "0")} ${suffix}`;
}

function parseTime(value) {
  if (typeof value !== "string") return null;

  const match = value.trim().match(
    /^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i
  );

  if (!match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3]?.toUpperCase();

  if (minutes > 59 || hours > 23) return null;

  if (period) {
    if (hours < 1 || hours > 12) return null;
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
  }

  return hours * 60 + minutes;
}

function getSchedule() {
  const events = CHIP.read(CHIP.keys.schedule, []);
  return Array.isArray(events) ? events : [];
}

function saveSchedule(events) {
  CHIP.write(CHIP.keys.schedule, events);
}

// Find events belonging to a particular date.
// Events with a date use that date; events with only a weekday
// are treated as weekly recurring events.
function getEventsForDate(date) {
  const dateString = formatDate(date);
  const weekday = date.toLocaleDateString("en-US", {
    weekday: "long"
  }).toLowerCase();

  return getSchedule()
    .filter(event => {
      if (!event || typeof event !== "object") return false;

      if (event.date) {
        return event.date === dateString;
      }

      if (event.day) {
        return String(event.day).toLowerCase() === weekday;
      }

      return false;
    })
    .map(event => ({
      ...event,
      startMinutes: parseTime(event.start),
      endMinutes: parseTime(event.end)
    }))
    .filter(event =>
      event.startMinutes !== null &&
      event.endMinutes !== null &&
      event.endMinutes > event.startMinutes
    )
    .sort((a, b) => a.startMinutes - b.startMinutes);
}

// Calculate available gaps between 9 AM and 9 PM.
function calculateFreeSlots(date) {
  const events = getEventsForDate(date);

  const startOfDay = 9 * 60;
  const endOfDay = 21 * 60;

  const slots = [];
  let cursor = startOfDay;

  events.forEach(event => {
    const start = Math.max(event.startMinutes, startOfDay);
    const end = Math.min(event.endMinutes, endOfDay);

    if (end <= start || end <= cursor) return;

    if (start - cursor >= 30) {
      slots.push({
        date: formatDate(date),
        start: cursor,
        end: start
      });
    }

    cursor = Math.max(cursor, end);
  });

  if (endOfDay - cursor >= 30) {
    slots.push({
      date: formatDate(date),
      start: cursor,
      end: endOfDay
    });
  }

  return slots;
}

function renderSlots() {
  const selectedDate = parseDate(dateInput.value);
  const dates = [];

  if (currentView === "day") {
    dates.push(selectedDate);
    availabilityTitle.textContent = "Your available time";
    availabilitySubtitle.textContent = displayDate(selectedDate);
  } else {
    const monday = getMonday(selectedDate);

    for (let i = 0; i < 7; i++) {
      dates.push(addDays(monday, i));
    }

    availabilityTitle.textContent = "Your week at a glance";
    availabilitySubtitle.textContent =
      `${displayDate(dates[0])} – ${displayDate(dates[6])}`;
  }

  availabilityList.innerHTML = "";
  bookingCard.hidden = true;
  successCard.hidden = true;
  selectedSlot = null;

  let totalSlots = 0;

  dates.forEach(date => {
    const slots = calculateFreeSlots(date);

    if (slots.length === 0) return;

    if (currentView === "week") {
      const heading = document.createElement("h3");
      heading.className = "day-heading";
      heading.textContent = displayDate(date);
      availabilityList.appendChild(heading);
    }

    slots.forEach(slot => {
      totalSlots++;

      const duration = slot.end - slot.start;

      const card = document.createElement("article");
      card.className = "time-card";

      card.innerHTML = `
        <div class="time-card-top">
          <h3>${currentView === "day" ? "Available slot" : "Free time"}</h3>
          <span class="free-badge">Available</span>
        </div>

        <p class="time-range">
          ${displayTime(slot.start)} – ${displayTime(slot.end)}
        </p>

        <span class="duration-label">
          ${duration >= 60
            ? `${Math.floor(duration / 60)} hr ${duration % 60 ? `${duration % 60} min` : ""}`
            : `${duration} minutes`} available
        </span>

        <button class="btn btn-primary choose-slot" type="button">
          Use this time
        </button>
      `;

      card.querySelector(".choose-slot").addEventListener("click", () => {
        openBooking(slot);
      });

      availabilityList.appendChild(card);
    });
  });

  emptyState.hidden = totalSlots !== 0;
}

function openBooking(slot) {
  selectedSlot = slot;

  const date = parseDate(slot.date);
  const availableMinutes = slot.end - slot.start;

  selectedSlotText.textContent =
    `${displayDate(date)} · ${displayTime(slot.start)} – ${displayTime(slot.end)}`;

  // Select the longest standard duration that fits.
  const options = [120, 90, 60, 30];
  const bestDuration = options.find(value => value <= availableMinutes) || 30;
  durationInput.value = String(bestDuration);

  bookingError.textContent = "";
  bookingCard.hidden = false;
  successCard.hidden = true;

  bookingCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

function saveStudySession() {
  if (!selectedSlot) return;

  const duration = Number(durationInput.value);
  const title = studyTitleInput.value.trim() || "Study session";

  const end = selectedSlot.start + duration;

  if (duration > selectedSlot.end - selectedSlot.start) {
    bookingError.textContent =
      "That duration does not fit in the selected free-time slot.";
    return;
  }

  const events = getSchedule();

  // Check for overlapping events before saving.
  const overlapping = events.some(event => {
    if (!event || event.date !== selectedSlot.date) return false;

    const start = parseTime(event.start);
    const finish = parseTime(event.end);

    if (start === null || finish === null) return false;

    return selectedSlot.start < finish && end > start;
  });

  if (overlapping) {
    bookingError.textContent =
      "Your schedule has changed. Please select another time.";
    renderSlots();
    return;
  }

  const date = parseDate(selectedSlot.date);
  const weekday = date.toLocaleDateString("en-US", {
    weekday: "long"
  });

  const newEvent = {
    id: `study-${Date.now()}`,
    title,
    day: weekday,
    date: selectedSlot.date,
    start: displayTime(selectedSlot.start),
    end: displayTime(end),
    type: "study"
  };

  events.push(newEvent);
  saveSchedule(events);

  bookingCard.hidden = true;
  successCard.hidden = false;

  successMessage.textContent =
    `${title} has been added to your schedule for ${displayDate(date)}, ` +
    `${displayTime(selectedSlot.start)} – ${displayTime(end)}.`;

  successCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

dayViewBtn.addEventListener("click", () => {
  currentView = "day";
  dayViewBtn.classList.add("active");
  weekViewBtn.classList.remove("active");
  renderSlots();
});

weekViewBtn.addEventListener("click", () => {
  currentView = "week";
  weekViewBtn.classList.add("active");
  dayViewBtn.classList.remove("active");
  renderSlots();
});

dateInput.addEventListener("change", renderSlots);

document.getElementById("saveStudyBtn")
  .addEventListener("click", saveStudySession);

document.getElementById("cancelBookingBtn")
  .addEventListener("click", () => {
    bookingCard.hidden = true;
    selectedSlot = null;
  });

document.getElementById("backToAvailability")
  .addEventListener("click", () => {
    successCard.hidden = true;
    renderSlots();
  });

// Initialize the page.
dateInput.value = formatDate(new Date());
dateInput.min = formatDate(new Date());
renderSlots();
