# CHIP — Campus Host Intelligence Portal

*Your personal guide to campus life.*

## Project Overview

CHIP is a high-fidelity, semi-functional web prototype designed to help international students navigate university life through a personalized, conversational campus assistant. Students can ask CHIP questions, receive simulated context-aware answers, and access campus tools through quick actions. Onboarding collects the student’s preferred name so CHIP can greet them personally. The application builds on our previous design and usability evaluation, incorporating feedback to improve navigation, usability, and the overall student experience.

## Features

| Feature | Description | Owner |
| --- | --- | --- |
| Home & CHIP Assistant | Personalized greeting, conversational interface, quick actions, and navigation. | FA |
| Study Spaces | Find and filter campus study locations and view their details. | AN |
| Schedule & Checklist | Manage schedules and create, edit, and complete checklist items. | CF |
| Campus Directions | Select campus locations and view directions between buildings. | YD |
| Free Time | Identify available time slots based on the student's schedule. | TBD (Optional) |

## Technologies

- HTML — page structure and content
- CSS — styling and layout
- JavaScript — interactive functionality
- Browser localStorage — shared and persistent prototype data where needed
- Git and GitHub — version control and collaboration

No backend, external API, or database is required. Sample data may be used for functionality that would normally require external services. CHIP will simulate an LLM-style assistant using JavaScript rules and shared prototype data; no real LLM or API key is required.

## Proposed Project Structure

```text
CHIP_main/
├── index.html              # Homepage and chat interface
├── home.js                 # Homepage and assistant response logic
├── home.css                # Homepage-specific styles
├── styles.css              # Shared application styles
├── shared.js               # Shared data and utility functions
│
├── onboarding/
│   ├── index.html          # Student onboarding interface
│   ├── onboarding.css      # Onboarding-specific styles
│   └── script.js           # Save and update student profile
│
├── study-spaces/
│   ├── index.html          # Study space finder interface
│   ├── script.js           # Study space functionality
│   └── style.css           # Feature-specific styles
│
├── schedule/
│   ├── index.html          # Schedule and checklist interface
│   ├── script.js           # Schedule and checklist functionality
│   └── style.css           # Feature-specific styles
│
├── directions/
│   ├── index.html          # Campus directions interface
│   ├── script.js           # Navigation functionality
│   └── style.css           # Feature-specific styles
│
├── free-time/
│   ├── index.html          # Free time finder interface
│   ├── script.js           # Free time functionality
│   └── style.css           # Feature-specific styles
│
├── assets/                                         # Images, icons, and maps (as needed)
├── README.md                                       # Project overview and setup instructions
└── DEVELOPER_INTEGRATION_GUIDE.md                  # Technical integration documentation
```

Note: All pages should use the shared styles and navigation to maintain a consistent design.

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

## Division of Work

Each team member should develop their feature on a separate Git branch:

- `feature/home-onboarding` (FA)
- `feature/study-spaces` (AN)
- `feature/schedule` (CF)
- `feature/directions` (YD)
- `feature/free-time` (TBD - optional)

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

## CHIP Assistant and Onboarding

### User flow

1. On first visit, ask the student what name CHIP should use.
2. Save the preferred name locally and open the homepage.
3. Greet the student by name and display a chat input and four quick actions.
4. Accept typed questions, show the student's message, and return a relevant simulated response.
5. Offer links to the appropriate feature page when a task requires more interaction.
6. Allow the student to update their name and retain it across navigation.

### Supported questions

| Example question | Expected behavior |
| --- | --- |
| What is my name? | Read the saved student profile. |
| Where can I study? | Suggest a sample study space and link to Study Spaces. |
| What is on my schedule? | Read saved schedule entries and link to Schedule. |
| What do I need to do today? | Read pending checklist items. |
| How do I get to the library? | Offer a predefined route or link to Directions. |
| When am I free today? | Use schedule gaps or link to Free Time. |

Use keyword matching and predefined responses for the prototype. For unsupported questions, explain what CHIP can help with instead of inventing an answer. Keep chat history visible during the session; sessionStorage may be used to retain it across page navigation. The assistant is simulated, not a general-purpose LLM.

## Shared Data and State

### Proposed shared storage keys

| Key | Data | Owner |
| --- | --- | --- |
| `chip.profile` | Object containing `name` | FA |
| `campus.schedule` | Array of scheduled events | CF |
| `chip.checklist` | Array of tasks with `id`, `title`, `completed`, and optional `date` | CF |
| `chip.chat` | Session chat history (optional, sessionStorage) | FA |

Example profile:

```javascript
localStorage.setItem("chip.profile", JSON.stringify({ name: "Alex" }));
const profile = JSON.parse(localStorage.getItem("chip.profile") || "null");
```

Use `textContent` when displaying user-entered names and chat messages. Agree on shared keys and data formats before integrating features. Use sample data for independent development, and do not overwrite saved user input.

### Schedule and free-time integration

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

## Integration and Demo Checks

- [ ] Complete onboarding, navigate away, and return to a personalized greeting.
- [ ] Ask CHIP a supported question and see a response and relevant feature link.
- [ ] Add a schedule event or checklist item and verify it is still present after navigating away.
- [ ] Verify CHIP reads the updated schedule and Free Time reflects schedule changes.
- [ ] Navigate to all four features and back home without broken links.
- [ ] Test unsupported questions and empty input.

## Proposed Timeline

| Date | Milestone |
| --- | --- |
| November 12 | Repository setup, feature assignments, shared design and data agreement |
| November 13–14 | Individual feature development |
| November 15 | Merge and integrate features |
| November 16 | End-to-end testing, documentation, and demo rehearsal |
| November 17 | Final submission and demonstration |

## Team Contributions

| Team member | Feature | Contributions / usability improvements |
| --- | --- | --- |
| FA | Home, CHIP Assistant & Onboarding | Personalized greeting, chat, quick actions, profile and shared navigation; usability improvements TBD |
| AN | Study Spaces | TBD |
| CF | Schedule & Checklist | TBD |
| YD | Campus Directions | TBD |
| TBD | Free Time | TBD |
