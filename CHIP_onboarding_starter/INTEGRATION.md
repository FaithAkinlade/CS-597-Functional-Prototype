# CHIP onboarding starter — integration guide

Copy the contents of this folder into the root of your existing CHIP repository.
Do not overwrite existing homepage or shared files without reviewing them first.
This is an onboarding starter, not the completed homepage or chatbot.

## Run
From the repository root: `python3 -m http.server 8000`
Visit http://localhost:8000. Use the same origin for every feature.

## Shared styles
Every feature page one folder below the root should include:
```html
<link rel="stylesheet" href="../styles.css">
<script src="../shared.js" defer></script>
<script src="script.js" defer></script>
```
Use `.app-shell`, `.app-header`, `.page-content`, `.card`, `.field`,
`.btn`, `.btn-primary`, `.btn-secondary`, `.btn-block`, `.muted`,
and `.bottom-nav` as appropriate. Add feature-specific CSS after the shared stylesheet.
Do not redefine shared classes globally in feature stylesheets.
The burgundy palette and mobile width are proposed defaults; align them with Figma before finalizing.

## Shared profile
`CHIP.getProfile()` returns `{ name: "Alex" }` or null.
`CHIP.saveProfile("Alex")` saves it under `chip.profile`.
Use textContent when displaying user input.
Edit profile: `../onboarding/index.html?edit=1` from a feature folder.
Home: `../index.html` from a feature folder.

## Shared storage
`CHIP.read(CHIP.keys.schedule, [])` reads schedule data.
`CHIP.write(CHIP.keys.schedule, events)` writes it.
Keys match the previous README: chip.profile, campus.schedule, chip.checklist, chip.chat.
Agree with CF on the event schema before connecting Free Time and the assistant.
No real LLM or backend is included.

## Test manually
1. Open the root URL in a fresh browser profile: onboarding should appear.
2. Enter a name and submit: home should greet you by name.
3. Refresh: name should remain.
4. Edit profile, save a new name: greeting should update.
5. Try whitespace-only input: it should not save.
6. Open onboarding directly after saving: it should return to home.
7. To restart onboarding, remove only `chip.profile` in browser developer tools.
