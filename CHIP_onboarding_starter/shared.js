/* Shared storage contract. Load before feature scripts. */
window.CHIP = (() => {
  const keys = Object.freeze({
    profile: "chip.profile",
    schedule: "campus.schedule",
    checklist: "chip.checklist",
    chat: "chip.chat"
  });
  function read(key, fallback = null) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? fallback : JSON.parse(value);
    } catch { return fallback; }
  }
  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    return value;
  }
  function getProfile() {
    const profile = read(keys.profile);
    return profile && typeof profile.name === "string" && profile.name.trim() ? profile : null;
  }
  function saveProfile(name) {
    const clean = String(name).trim();
    if (!clean || clean.length > 40) throw new Error("Enter a name between 1 and 40 characters.");
    return write(keys.profile, { ...getProfile(), name: clean });
  }
  return Object.freeze({ keys, read, write, getProfile, saveProfile });
})();
