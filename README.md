# CHIP — Campus Host Intelligence Portal

*Your personal guide to campus life.*

## Project Overview

CHIP is a high-fidelity, semi-functional web prototype designed to help international students navigate university life. The application builds on our previous design and usability evaluation, incorporating feedback to improve navigation, usability, and the overall student experience.

## Features

| Feature | Description | Owner |
| --- | --- | --- |
| Home Page | Central navigation to and from other functions | Faith |
| Study Spaces | Find and filter campus study locations and view their details. | TBD |
| Schedule & Checklist | Manage schedules and create, edit, and complete checklist items. | Christopher |
| Campus Directions | Select campus locations and view directions between buildings. | Yifei |
| Free Time | Identify available time slots based on the student's schedule. | TBD |

## Technologies

- HTML — page structure and content
- CSS — styling and layout
- Vanilla JavaScript — interactive functionality
- Browser localStorage — shared and persistent prototype data where needed
- Git and GitHub — version control and collaboration

Note for our reference: No backend, external API, or database is required. Sample data may be used for functionality that would normally require external services.

## Proposed Project Structure

```text
chip/
├── index.html              # Home page
├── styles.css              # Shared styles
├── shared.js               # Shared data and utilities
├── study-spaces/
│   ├── index.html
│   ├── script.js
│   └── styles.css          # Optional feature-specific styles
├── schedule/
│   ├── index.html
│   ├── script.js
│   └── styles.css
├── directions/
│   ├── index.html
│   ├── script.js
│   └── styles.css
├── free-time/
│   ├── index.html
│   ├── script.js
│   └── styles.css
├── assets/                 # Images, icons, and maps
└── README.md
```

Each team member is responsible for their assigned feature folder. Feature-specific CSS files are optional. All pages should use the shared styles and navigation to maintain a consistent design.

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd <repository-folder>
```

Replace the placeholders with the actual repository URL and folder name.

### 2. Run the application

Open the project in VS Code and use the Live Server extension to launch `index.html`.

Alternatively, if Python 3 is installed, run the following command from the project root:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000 in your browser. On Windows, use `py -m http.server 8000` if `python3` is unavailable.

Use a local server rather than opening HTML files directly so that shared browser storage behaves consistently across pages.

## Collaboration Workflow

Each team member should develop their feature on a separate Git branch:

- `feature/study-spaces`
- `feature/schedule`
- `feature/directions`
- `feature/free-time`

Before starting, update your local main branch and create your assigned feature branch:

```bash
git switch main
git pull origin main
git switch -c feature/study-spaces
```

Replace `feature/study-spaces` with your assigned branch name.

After making and testing your changes:

```bash
git add .
git commit -m "Implement study spaces feature"
git push -u origin feature/study-spaces
```

Open a pull request on GitHub to merge your feature into `main`. Coordinate changes to shared files with the team before editing them. Do not commit directly to `main` during feature development.

## Shared Design Guidelines

- Follow the existing Figma prototype and Assignment 5 usability feedback.
- Use consistent colors, typography, spacing, buttons, and navigation.
- Link each feature page to the home page and shared navigation.
- Use realistic content rather than placeholder text.
- Provide visible feedback when users perform actions.
- Keep the prototype focused on the agreed target screen size; responsive design is not required.

## Shared Data and State

Use JavaScript for interactions and `localStorage` where data needs to persist across page navigation. The Schedule and Free Time features should agree on a common schedule format before development begins.

Proposed storage key: `campus.schedule`

Example schedule data:

```json
[
  {
    "id": "event-1",
    "title": "UX Class",
    "date": "2026-11-17",
    "start": "18:30",
    "end": "21:00"
  }
]
```

Save data:

```javascript
localStorage.setItem("campus.schedule", JSON.stringify(schedule));
```

Read data:

```javascript
const schedule = JSON.parse(
  localStorage.getItem("campus.schedule") || "[]"
);
```

The Schedule feature owns schedule updates; Free Time reads the same data to calculate available time slots. Both developers can use agreed sample data while developing independently. Confirm the schema, sample data, and availability rules together before implementation. Avoid overwriting existing user data when initializing sample data.

## Definition of Done

Each feature should:

- [ ] Support its complete assigned user task.
- [ ] Respond to user interactions through working source code.
- [ ] Retain user input where appropriate when navigating between pages.
- [ ] Incorporate relevant usability evaluation feedback.
- [ ] Match the shared visual design.
- [ ] Handle empty or invalid input where relevant.
- [ ] Work without broken links or console errors.
- [ ] Include a brief description of how to test the feature.

## Proposed Timeline

| Date | Milestone |
| --- | --- |
| November 12 | Repository setup, feature assignments, shared design and data agreement |
| November 13–14 | Individual feature development |
| November 15 | Merge and integrate features |
| November 16 | End-to-end testing, documentation, and demo rehearsal |
| November 17 | Final submission and demonstration |

## Team Contributions

Each team member should document their contributions, the usability feedback addressed, and any known limitations of their feature.

| Team member | Feature | Contributions / usability improvements |
| --- | --- | --- |
| TBD | Home Page | TBD |
| TBD | Study Spaces | TBD |
| TBD | Schedule & Checklist | TBD |
| TBD | Campus Directions | TBD |
| TBD | Free Time | TBD |
