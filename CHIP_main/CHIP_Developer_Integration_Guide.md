# CHIP — Developer Integration Guide

Campus Host Intelligence Portal | Functional prototype

This reference summarizes the shared design and integration conventions for CHIP. Feature-specific layouts and functionality are open to each contributor's design decisions. The prototype uses HTML, CSS, JavaScript and browser storage.

## Shared Design Guidelines

- Follow the existing Figma prototype for flow and functionality, incorporating feedback from the Assignment 5 usability evaluation.
- Use consistent colors, typography, spacing, buttons, and navigation across features.
- Link each feature page to the homepage and shared navigation.
- Use realistic content rather than placeholder text.
- Provide visible feedback when users perform actions.
- Keep the prototype focused on the agreed target screen size; responsive design is not required.

The shared design system in `styles.css` provides a common visual foundation while allowing flexibility in feature-specific layouts and interactions.

## Shared visual design

The root `styles.css` defines the common design tokens. Feature styles can reference these variables so the application retains a consistent visual identity.

| CSS variable | Value | Intended use |
| --- | --- | --- |
| `--primary-color` | `#8c2030` | Burgundy branding, primary actions, links |
| `--primary-hover` | `#701827` | Primary button hover |
| `--background-color` | `#f8f8fa` | Page background |
| `--card-color` | `#ffffff` | Cards and surfaces |
| `--text-color` | `#222222` | Main text |
| `--secondary-text` | `#62636b` | Supporting text |
| `--border-color` | `#dedee4` | Borders and separators |
| `--accent-color` | `#f2e0e3` | Soft burgundy highlights |
| `--border-radius` | `16px` | Card corners |
| `--page-width` | `480px` | Current mobile-oriented shell width |
| `--font-family` | System UI, Apple system, BlinkMacSystemFont, Segoe UI, sans-serif | Shared typography |

The current layout uses 24px page padding, 20px card padding, 12px grid gaps, 12px button corners and a 48px minimum button/input height. Body line height is 1.5. The shared stylesheet includes a visible burgundy keyboard-focus outline. These are existing defaults, not restrictions on feature-specific layouts.

### Reusable CSS classes

| Class | Appearance / purpose |
| --- | --- |
| `.app-shell` | Centered application container |
| `.app-header` | White header with spaced navigation |
| `.brand` | Burgundy CHIP wordmark |
| `.page-content` | Main content padding |
| `.card` | White rounded surface with border |
| `.muted` | Secondary text color |
| `.btn` | Common button dimensions and typography |
| `.btn-primary` / `.btn-secondary` | Filled burgundy / outlined white button |
| `.btn-block` | Full-width button |
| `.field` | Form label and input layout |
| `.error` | Burgundy error text |
| `.feature-grid` / `.feature-card` | Two-column feature card layout |
| `.bottom-nav` | Optional bottom navigation |

Example of feature-specific styling using the shared palette:

```css
.availability-card {
    background: var(--card-color);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    color: var(--text-color);
}
```

## Project structure

```text
CHIP_main/
├── index.html              # Homepage and chat interface
├── home.js                 # Homepage and simulated assistant logic
├── home.css                # Homepage-specific styles
├── styles.css              # Shared design system
├── shared.js               # Shared storage and profile utilities
├── onboarding/
│   ├── index.html          # Preferred-name form
│   ├── onboarding.css      # Onboarding styles
│   └── script.js           # Profile saving, editing and redirects
├── study-spaces/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── schedule/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── directions/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── free-time/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── assets/                 # Optional shared images, icons and maps
├── README.md
└── DEVELOPER_INTEGRATION_GUIDE.md
```

The feature directories are intended as starting points. Their HTML files connect to the shared resources and homepage; their local CSS and JavaScript can contain any feature-specific implementation. The assets directory is optional.

### Shared imports

From any feature directory, the existing relative paths are:

```html
<link rel="stylesheet" href="../styles.css">
<link rel="stylesheet" href="style.css">
<script src="../shared.js" defer></script>
<script src="script.js" defer></script>
```

The local stylesheet follows the shared stylesheet, allowing feature-specific styling. The shared script loads before the feature script. The homepage links to `study-spaces/index.html`, `schedule/index.html`, `directions/index.html` and `free-time/index.html`. Feature pages link back through `../index.html`.

## Shared data interface

`shared.js` exposes the `CHIP` object to pages that import it. It wraps JSON serialization and browser `localStorage`.

| Interface | Purpose |
| --- | --- |
| `CHIP.keys` | Shared storage key constants |
| `CHIP.read(key, fallback)` | Read JSON data; return fallback if missing or invalid |
| `CHIP.write(key, value)` | Save JSON data and return the value |
| `CHIP.getProfile()` | Return saved profile or `null` |
| `CHIP.saveProfile(name)` | Save preferred name (1–40 characters after trimming) |

| Key | Storage name | Purpose |
| --- | --- | --- |
| `CHIP.keys.profile` | `chip.profile` | Student profile |
| `CHIP.keys.schedule` | `campus.schedule` | Schedule events |
| `CHIP.keys.checklist` | `chip.checklist` | Checklist items |
| `CHIP.keys.chat` | `chip.chat` | Chat key; homepage currently uses sessionStorage for history |

Example shared reads:

```javascript
const profile = CHIP.getProfile();
const events = CHIP.read(CHIP.keys.schedule, []);
const tasks = CHIP.read(CHIP.keys.checklist, []);
```

Example shared write:

```javascript
CHIP.write(CHIP.keys.schedule, events);
```

## Feature integration points

The homepage checks for a saved profile and redirects to onboarding when needed. Onboarding saves the name and returns to the homepage. The edit-profile link uses `onboarding/index.html?edit=1`.

The homepage assistant currently uses simulated, keyword-based responses and links to the four features. It reads schedule and checklist arrays from shared storage. Chat history is stored in `sessionStorage` for the current browser tab; profile and shared feature data use `localStorage`.

Schedule, Free Time and the assistant have a natural shared-data dependency. The following are proposed example shapes for team discussion, not finalized requirements. Additional fields or alternative structures can be incorporated based on feature needs. The existing shared storage keys and utility functions are already implemented; changes to the data format should be coordinated across the relevant features to maintain compatibility with the assistant and Free Time.

```javascript
// Schedule event
{ id: "event-1", title: "Database Management", day: "Monday", start: "18:30", end: "21:00" }

// Checklist item
{ id: "task-1", title: "Submit assignment", completed: false }
```

The existing assistant recognizes event `title` or `name`, and displays `day`, `date` and `start` when present. For checklist items it recognizes `title`, `text` or `name`, and treats `completed` or `done` as completion flags. Free Time calculations and any additional fields can be coordinated with Schedule. Directions and Study Spaces can maintain their own feature data as needed.

## Local preview

From the project root:

```bash
python3 -m http.server 8000
```

Preview: http://localhost:8000

All pages share browser storage when served from the same origin (scheme, host and port). A different port has separate storage. No backend or external AI service is required for the current prototype.

## Integration status

Onboarding, personalized homepage, shared styling and simulated chat are the existing foundation. The four feature templates are starting points; their functionality and final layouts are developed separately. Schedule/checklist schemas remain open for team coordination. This guide reflects the generated starter implementation and can evolve with the project.
