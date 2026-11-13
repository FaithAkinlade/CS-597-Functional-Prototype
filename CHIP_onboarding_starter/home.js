// Starter homepage: retain this profile check when building the chat UI.
const profile = CHIP.getProfile();
if (!profile) {
  location.replace("onboarding/index.html");
} else {
  document.getElementById("greeting").textContent = `Hi, ${profile.name}!`;
  document.getElementById("home").hidden = false;
}
