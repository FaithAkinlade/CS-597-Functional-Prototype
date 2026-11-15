
const BUILDINGS = [
  { id: "eas",      name: "Edwin A. Stevens Hall",       short: "EAS",       x: 28, y: 10, note: "Home of DeBaun Auditorium" },
  { id: "carnegie", name: "Carnegie Laboratory",         short: "Carnegie",  x: 40, y: 15 },
  { id: "burchard", name: "Burchard Hall",               short: "Burchard",  x: 54, y: 19 },
  { id: "babbio",   name: "Babbio Center",               short: "Babbio",    x: 78, y: 12, note: "School of Business" },
  { id: "gateway",  name: "Gateway Academic Center",     short: "Gateway",   x: 16, y: 27 },
  { id: "mpk",      name: "Morton-Peirce-Kidde Complex", short: "Kidde",     x: 40, y: 38 },
  { id: "library",  name: "Samuel C. Williams Library",  short: "Library",   x: 54, y: 50, hill: true },
  { id: "howe",     name: "Wesley J. Howe Center",       short: "Howe",      x: 68, y: 52, hill: true, note: "14-story building on Castle Point" },
  { id: "mclean",   name: "McLean Hall",                 short: "McLean",    x: 34, y: 58 },
  { id: "north",    name: "North Building",              short: "North",     x: 24, y: 74 },
  { id: "abs",      name: "ABS Engineering Center",      short: "ABS",       x: 46, y: 80 },
  { id: "schaefer", name: "Schaefer Athletic Center",    short: "Schaefer",  x: 72, y: 84 }
];
const METERS_PER_UNIT = 6;   // whole campus ≈ 600 m across
const WALK_M_PER_MIN = 75;

const KEYS = { saved: "chip_dir_saved", recent: "chip_dir_recent", last: "chip_dir_last" };
const load = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch (e) { return fb; } };
const store = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

/* ---------- Helpers ---------- */
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const byId = id => BUILDINGS.find(b => b.id === id);

function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 1800);
}

function floorText(room) {
  const digits = (room || "").match(/\d+/);
  if (!digits) return "";
  const n = digits[0];
  const floor = n.length >= 3 ? parseInt(n.slice(0, n.length - 2), 10) : 1;
  if (floor <= 1) return "on the 1st floor";
  const suf = floor === 2 ? "nd" : floor === 3 ? "rd" : "th";
  return `on the ${floor}${suf} floor`;
}

/* ---------- Route generation ---------- */
const DIRS = { north: [0, 1], south: [0, -1], east: [1, 0], west: [-1, 0] };
const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
const meters = units => Math.max(20, Math.round(units * METERS_PER_UNIT / 10) * 10);
// Show distances in feet plus walking time, e.g. "230 ft (~1 min)"
const feet = m => Math.round(m * 3.281 / 10) * 10;
const walkMins = m => Math.max(1, Math.round(m / WALK_M_PER_MIN));
const distText = m => `${feet(m)} ft (~${walkMins(m)} min)`;

function buildRoute(from, to, room) {
  const dx = to.x - from.x, dy = to.y - from.y;
  const steps = [];
  steps.push({ icon: "🚪", text: `Exit ${from.name} through the main entrance.`, m: 0 });

  // Walk the longer direction first, then turn for the shorter one.
  const firstIsNS = Math.abs(dy) >= Math.abs(dx);
  const legs = firstIsNS
    ? [{ dir: dy >= 0 ? "north" : "south", len: Math.abs(dy), axis: "y" }, { dir: dx >= 0 ? "east" : "west", len: Math.abs(dx), axis: "x" }]
    : [{ dir: dx >= 0 ? "east" : "west", len: Math.abs(dx), axis: "x" }, { dir: dy >= 0 ? "north" : "south", len: Math.abs(dy), axis: "y" }];
  const corner = firstIsNS ? { x: from.x, y: to.y } : { x: to.x, y: from.y };

  // Landmark passed on the first leg
  const landmark = passedBuilding(from, corner, [from.id, to.id]);
  let firstText = `Head ${legs[0].dir} along the campus walkway for about ${distText(meters(legs[0].len))}`;
  if (landmark) firstText += `, passing ${landmark.b.short} on your ${landmark.side}`;
  firstText += ".";
  if (to.hill && !from.hill && legs[0].dir === "north") firstText += " The path goes uphill toward Castle Point.";
  steps.push({ icon: "🚶", text: firstText, m: meters(legs[0].len), dir: legs[0].dir });

  if (legs[1].len > 6) {
    const turn = cross(DIRS[legs[0].dir], DIRS[legs[1].dir]) > 0 ? "left" : "right";
    let t = `Turn ${turn} and walk ${legs[1].dir} for about ${distText(meters(legs[1].len))}.`;
    if (to.hill && !from.hill && legs[0].dir !== "north") t += " Take the steps up Castle Point.";
    steps.push({ icon: turn === "left" ? "↰" : "↱", text: t, m: meters(legs[1].len), dir: legs[1].dir });
  }

  // Which side the destination appears on, relative to the last heading
  const lastDir = legs[1].len > 6 ? legs[1].dir : legs[0].dir;
  const lastStart = legs[1].len > 6 ? corner : from;
  const side = Math.abs(cross(DIRS[lastDir], [to.x - lastStart.x, to.y - lastStart.y])) < 3 ? "ahead of you"
             : cross(DIRS[lastDir], [to.x - lastStart.x, to.y - lastStart.y]) > 0 ? "on your left" : "on your right";
  let arrive = `${to.name} is ${side}.`;
  const ft = floorText(room);
  if (room) arrive += ` Room ${room} is ${ft || "inside"}.`;
  steps.push({ icon: "📍", text: arrive, m: 0 });

  const totalM = steps.reduce((s, st) => s + st.m, 0);
  return { from, to, room, steps, corner, totalM, mins: Math.max(1, Math.round(totalM / WALK_M_PER_MIN)) };
}

// Closest building to the first leg (not the start or end), if it is near the path.
function passedBuilding(a, b, exclude) {
  let best = null;
  BUILDINGS.forEach(bd => {
    if (exclude.includes(bd.id)) return;
    const vx = b.x - a.x, vy = b.y - a.y, len2 = vx * vx + vy * vy;
    if (len2 === 0) return;
    const t = ((bd.x - a.x) * vx + (bd.y - a.y) * vy) / len2;
    if (t < 0.15 || t > 0.95) return;
    const px = a.x + t * vx, py = a.y + t * vy;
    const dist = Math.hypot(bd.x - px, bd.y - py);
    if (dist < 16 && (!best || dist < best.dist)) {
      best = { b: bd, dist, side: cross([vx, vy], [bd.x - a.x, bd.y - a.y]) > 0 ? "left" : "right" };
    }
  });
  return best;
}

/* ---------- Map (SVG) ---------- */
const MX = x => 20 + x * 2.8;            // map x
const MY = y => 280 - y * 2.6;           // map y (north is up)

function drawMap(route) {
  const svg = $("map");
  const parts = [];
  // campus boundary + labels
  parts.push(`<rect x="8" y="8" width="304" height="284" rx="14" class="map-bg"/>`);
  parts.push(`<text x="14" y="150" class="map-street" transform="rotate(-90 14 150)">Hudson St</text>`);
  parts.push(`<text x="306" y="150" class="map-street" transform="rotate(90 306 150)">Hudson River</text>`);
  parts.push(`<text x="160" y="290" class="map-street" text-anchor="middle">5th St</text>`);
  parts.push(`<ellipse cx="${MX(61)}" cy="${MY(51)}" rx="44" ry="26" class="map-hill"/>`);
  parts.push(`<text x="${MX(61)}" y="${MY(51) - 30}" class="map-street" text-anchor="middle">Castle Point</text>`);

  // route line
  if (route) {
    const pts = [route.from, route.corner, route.to].map(p => `${MX(p.x)},${MY(p.y)}`).join(" ");
    parts.push(`<polyline points="${pts}" class="map-route"/>`);
  }

  // buildings
  BUILDINGS.forEach(b => {
    const role = route && b.id === route.from.id ? "start" : route && b.id === route.to.id ? "end" : "";
    parts.push(`<g class="map-bldg ${role}">
      <rect x="${MX(b.x) - 9}" y="${MY(b.y) - 7}" width="18" height="14" rx="3"/>
      <text x="${MX(b.x)}" y="${MY(b.y) + 20}" text-anchor="middle">${esc(b.short)}</text>
    </g>`);
  });
  svg.innerHTML = parts.join("");
}

/* ---------- State & navigation ---------- */
const state = { route: null, step: 0, history: [] };
const HEADERS = {
  start: ["Campus Directions", () => "Walk between Stevens buildings"],
  detail: ["Walking Route", () => `${state.route.from.short} → ${state.route.to.short}`],
  trip: ["On Your Way", () => `To ${state.route.to.name}`],
  arrived: ["Arrived", () => state.route.to.name]
};
function show(name, push = true) {
  const cur = document.querySelector(".screen.active");
  if (push && cur) state.history.push(cur.id.replace("screen-", ""));
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  $("screen-" + name).classList.add("active");
  $("headerTitle").textContent = HEADERS[name][0];
  $("headerSub").textContent = HEADERS[name][1]();
  window.scrollTo(0, 0);
}
$("backBtn").onclick = () => {
  if (state.history.length) show(state.history.pop(), false);
  else window.location.href = "../index.html";
};

/* ---------- Screen 1 ---------- */
function fillSelects() {
  const opts = BUILDINGS.map(b => `<option value="${b.id}">${esc(b.name)}</option>`).join("");
  $("fromSelect").innerHTML = `<option value="">Choose a starting building</option>` + opts;
  $("toSelect").innerHTML = `<option value="">Choose a destination</option>` + opts;
  const last = load(KEYS.last, null);
  if (last) { $("fromSelect").value = last.from; $("toSelect").value = last.to; }
}

function renderLists() {
  const saved = load(KEYS.saved, []);
  $("savedList").innerHTML = saved.length ? saved.map((s, i) => `
    <div class="dir-card mini">
      <button class="mini-main" data-i="${i}">
        <span class="mini-icon">★</span>
        <span><strong>${esc(byId(s.from).short)} → ${esc(byId(s.to).short)}</strong>${s.room ? " · Room " + esc(s.room) : ""}<br>
        <span class="muted">${esc(byId(s.to).name)}</span></span>
      </button>
      <button class="mini-x" data-i="${i}" aria-label="Remove saved route">✕</button>
    </div>`).join("") : `<p class="muted empty">Save routes you walk often, like your way to class.</p>`;
  $("savedList").querySelectorAll(".mini-main").forEach(b => b.onclick = () => {
    const s = saved[b.dataset.i]; openRoute(s.from, s.to, s.room);
  });
  $("savedList").querySelectorAll(".mini-x").forEach(b => b.onclick = () => {
    saved.splice(b.dataset.i, 1); store(KEYS.saved, saved); renderLists(); toast("Route removed");
  });

  const recent = load(KEYS.recent, []);
  $("recentList").innerHTML = recent.length ? recent.slice(0, 5).map((r, i) => `
    <button class="dir-card mini mini-main" data-i="${i}">
      <span class="mini-icon">↺</span>
      <span><strong>${esc(byId(r.from).short)} → ${esc(byId(r.to).short)}</strong>${r.room ? " · Room " + esc(r.room) : ""}<br>
      <span class="muted">${esc(r.when)}</span></span>
    </button>`).join("") : `<p class="muted empty">Routes you look up will appear here.</p>`;
  $("recentList").querySelectorAll(".mini-main").forEach(b => b.onclick = () => {
    const r = recent[b.dataset.i]; openRoute(r.from, r.to, r.room);
  });
}

$("swapBtn").onclick = () => {
  const f = $("fromSelect").value;
  $("fromSelect").value = $("toSelect").value;
  $("toSelect").value = f;
};

$("goBtn").onclick = () => {
  const from = $("fromSelect").value, to = $("toSelect").value;
  const room = $("roomInput").value.trim();
  if (!from || !to) return showError("Please choose both a starting building and a destination.");
  if (from === to) return showError("You're already there! Choose a different destination.");
  if (room && !/^[A-Za-z]?\d{1,4}[A-Za-z]?$/.test(room)) return showError("Room numbers look like 204 or B12.");
  $("formError").textContent = "";
  openRoute(from, to, room);
};
function showError(msg) { $("formError").textContent = msg; }

/* ---------- Screen 2 ---------- */
function openRoute(fromId, toId, room = "") {
  state.route = buildRoute(byId(fromId), byId(toId), room);
  store(KEYS.last, { from: fromId, to: toId });

  const recent = load(KEYS.recent, []).filter(r => !(r.from === fromId && r.to === toId && r.room === room));
  recent.unshift({ from: fromId, to: toId, room,
    when: new Date().toLocaleString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit" }) });
  store(KEYS.recent, recent.slice(0, 8));

  const r = state.route;
  const arrive = new Date(Date.now() + r.mins * 60000).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  $("summary").innerHTML = `
    <div class="summary-top"><span class="summary-mins">${r.mins} min</span><span class="muted">${feet(r.totalM)} ft · arrive ~${arrive}</span></div>
    <div class="summary-route"><span class="dot dot-start"></span>${esc(r.from.name)}</div>
    <div class="summary-route"><span class="dot dot-end"></span>${esc(r.to.name)}${r.room ? " · Room " + esc(r.room) : ""}</div>
    ${r.to.note ? `<p class="muted small">${esc(r.to.note)}</p>` : ""}`;
  $("steps").innerHTML = r.steps.map(s => `
    <li><span class="tl-icon">${s.icon}</span><div>${esc(s.text)}</div></li>`).join("");
  drawMap(r);
  updateSave();
  show("detail");
}

const sameRoute = s => s.from === state.route.from.id && s.to === state.route.to.id && (s.room || "") === (state.route.room || "");
function updateSave() {
  const on = load(KEYS.saved, []).some(sameRoute);
  $("saveBtn").textContent = on ? "★ Saved" : "☆ Save route";
  $("saveBtn").classList.toggle("on", on);
}
$("saveBtn").onclick = () => {
  let saved = load(KEYS.saved, []);
  if (saved.some(sameRoute)) { saved = saved.filter(s => !sameRoute(s)); toast("Removed from saved routes"); }
  else { saved.unshift({ from: state.route.from.id, to: state.route.to.id, room: state.route.room }); toast("Route saved"); }
  store(KEYS.saved, saved);
  updateSave();
};

/* ---------- Screen 3 ---------- */
$("startBtn").onclick = () => { state.step = 0; renderStep(); show("trip"); };
function renderStep() {
  const steps = state.route.steps, s = steps[state.step];
  $("tripBar").style.width = ((state.step + 1) / steps.length * 100) + "%";
  $("tripCount").textContent = `Step ${state.step + 1} of ${steps.length}`;
  $("tripIcon").textContent = s.icon;
  $("tripText").textContent = s.text;
  const left = steps.slice(state.step).reduce((sum, st) => sum + st.m, 0);
  $("tripMeta").textContent = left ? `${feet(left)} ft · about ${walkMins(left)} min to go` : "";
  $("prevBtn").disabled = state.step === 0;
  $("nextBtn").textContent = state.step === steps.length - 1 ? "I've arrived" : "Next step";
}
$("prevBtn").onclick = () => { if (state.step > 0) { state.step--; renderStep(); } };
$("nextBtn").onclick = () => {
  if (state.step < state.route.steps.length - 1) { state.step++; renderStep(); return; }
  $("arrivedTitle").textContent = `You've arrived at ${state.route.to.short}!`;
  $("arrivedText").textContent = state.route.room
    ? `Head to Room ${state.route.room}, ${floorText(state.route.room) || "inside"}.`
    : `Walked about ${feet(state.route.totalM)} ft in ${state.route.mins} min.`;
  show("arrived");
};
$("endBtn").onclick = () => { show("detail", false); toast("Walk ended"); };
$("doneBtn").onclick = () => { state.history = []; renderLists(); show("start", false); };

/* ---------- Init ---------- */
// Other pages can link here, e.g. directions/index.html?from=library&to=babbio&room=122
fillSelects();
renderLists();
const q = new URLSearchParams(location.search);
if (byId(q.get("from") || "") && byId(q.get("to") || "") && q.get("from") !== q.get("to")) {
  openRoute(q.get("from"), q.get("to"), q.get("room") || "");
} else if (byId(q.get("to") || "")) {
  $("toSelect").value = q.get("to");
}
