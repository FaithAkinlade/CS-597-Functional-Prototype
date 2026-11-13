const form = document.getElementById("profile-form");
const nameInput = document.getElementById("student-name");
const error = document.getElementById("error");
const profile = CHIP.getProfile();
const editing = new URLSearchParams(location.search).get("edit") === "1";

if (profile && !editing) {
  location.replace("../index.html");
} else if (profile && editing) {
  nameInput.value = profile.name;
  document.getElementById("heading").textContent = "Update your profile";
  document.getElementById("intro-text").textContent = "Tell me what you'd like to be called.";
  document.getElementById("submit-button").textContent = "Save changes";
  document.getElementById("cancel-link").hidden = false;
}
form.addEventListener("submit", event => {
  event.preventDefault();
  error.hidden = true;
  try {
    CHIP.saveProfile(nameInput.value);
    location.replace("../index.html");
  } catch (err) {
    error.textContent = nameInput.value.trim() ? "Unable to save your profile. Check browser storage settings." : "Please enter your preferred name.";
    error.hidden = false;
    nameInput.focus();
  }
});
