// Homepage and simulated assistant. Requires shared.js from onboarding starter.
(() => {
  const profile = CHIP.getProfile();
  if (!profile) { location.replace("onboarding/index.html"); return; }
  const $ = id => document.getElementById(id);
  $("greeting").textContent = `Hi, ${profile.name}!`;
  $("home").hidden = false;
  const routes = {
    study: ["study-spaces/index.html", "Explore study spaces"],
    schedule: ["schedule/index.html", "Open my schedule"],
    directions: ["directions/index.html", "Open directions"],
    free: ["free-time/index.html", "Find free time"]
  };
  function items(key) {
    const data = CHIP.read(key, []);
    return Array.isArray(data) ? data.filter(x => x && typeof x === "object") : [];
  }
  function scheduleText() {
    const events = items(CHIP.keys.schedule);
    if (!events.length) return "No scheduled events yet. Add events in My Schedule.";
    return events.slice(0,5).map(e => `${e.title || e.name || "Event"}${e.day ? " · " + e.day : ""}${e.date ? " · " + e.date : ""}${e.start ? " · " + e.start : ""}`).join("\n");
  }
  $("schedule-summary").textContent = scheduleText();
  $("schedule-summary").style.whiteSpace = "pre-line";
  function reply(question) {
    const q = question.toLowerCase();
    if (/my name|who am i/.test(q)) return {text:`Your preferred name is ${profile.name}!`};
    if (/free time|available|when am i free|break|free today/.test(q)) return {text:"I can help you find gaps in your schedule. Open Free Time to check your availability.",route:"free"};
    if (/direction|how (do|can) i get|where is|navigate|way to/.test(q)) return {text:"Let's find your way around campus. Choose your starting point and destination in Directions.",route:"directions"};
    if (/checklist|to.do|tasks|assignment/.test(q)) {
      const tasks = items(CHIP.keys.checklist).filter(t => !t.completed && !t.done);
      return {text:tasks.length ? "Here are your pending tasks:\n" + tasks.slice(0,5).map(t => "• " + (t.title || t.text || t.name || "Task")).join("\n") : "I don't see any pending checklist items. You can manage your tasks in My Schedule.",route:"schedule"};
    }
    if (/schedule|class|calendar|events/.test(q)) return {text:scheduleText(),route:"schedule"};
    if (/study|quiet|library|focus/.test(q)) return {text:"Let's find a study spot that suits you. You can explore campus locations and their amenities in Study Spaces.",route:"study"};
    if (/^(hi|hello|hey)[!. ]*$/.test(q)) return {text:`Hello, ${profile.name}! What would you like help with?`};
    return {text:`I can help with study spaces, your schedule, campus directions, and free time, ${profile.name}. Try asking about one of those topics.`};
  }
  let history = [];
  try { const saved = JSON.parse(sessionStorage.getItem("chip.chat") || "[]"); if(Array.isArray(saved)) history = saved.filter(m => m && typeof m.text === "string" && ["user","assistant"].includes(m.role)); } catch {}
  function persist() { try { sessionStorage.setItem("chip.chat",JSON.stringify(history)); } catch {} }
  function render() {
    const log = $("chat-log");
    log.replaceChildren();
    for (const m of history) {
      const bubble = document.createElement("div");
      bubble.className = "message " + m.role;
      bubble.textContent = m.text;
      if (m.role === "assistant" && Object.hasOwn(routes,m.route)) {
        const a = document.createElement("a");
        [a.href,a.textContent] = routes[m.route];
        bubble.append(a);
      }
      log.append(bubble);
    }
    log.scrollTop = log.scrollHeight;
  }
  $("chat-form").addEventListener("submit", e => {
    e.preventDefault();
    const q = $("question").value.trim();
    if (!q) return;
    history.push({role:"user",text:q},{role:"assistant",...reply(q)});
    history = history.slice(-40);
    persist(); render(); $("question").value = ""; $("question").focus();
  });
  $("clear-chat").addEventListener("click", () => {history=[];persist();render();$("question").focus();});
  render();
})();
