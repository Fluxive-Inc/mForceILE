# Project Documentation: fluxive-academy-ile
Generated: 2026_01_22-18:33:48

## Directory Structure
```
.
./server.js
./Dockerfile
./cloudbuild.yaml
./project_docs.md
./document_project.md
./todo.md
./public
./public/index.html
./public/admin.html
./public/css
./public/module.html
./public/js
./public/course.html
./public/data
./public/assets
./package-lock.json
./package.json
./mForce.sh
./features.md
./tech_stack.md
./profile.md
```

## Content of document_project.md

## Content of features.md
# Fluxive Academy - Product Features

## 1. Integrated Learning Environment (ILE)
**Target**: `module.html`
- **Lecture Player**: Supports Video (YouTube Embeds) and Text Content.
- **Interactive Quizzes**: In-lesson multiple choice questions with immediate feedback.
- **Learner Tools Pane**: 
    - **Notes**: Persistent scratchpad (saved to localStorage).
    - **Artifacts**: Downloadable course files.
    - **Resources**: External links.
- **Hover Engine**: Contextual glossary definitions on hover.

## 2. Admin Dashboard
**Target**: `admin.html`
- **Course Management**:
    - List view with sorting.
    - Edit Metadata (Title, Price, etc.) via Modal.
    - Delete/Archive Courses.
- **Learner Management**:
    - Progress visualization bars.
    - Filtering by Name/Email.
- **Message Center**:
    - View learner inquiries.
    - Filter by User or Search text.

## 3. Advanced Features
- **Learning Paths**: 
    - Curated bundles of Courses + Videos + Articles.
    - Drag-and-drop builder (Visual representation in `admin.html`).
- **Case Management** (For Flux Investigator):
    - Full CRUD interface.
    - Fields: ID, Title, Description, Difficulty, Status.
    - Status tracking (Active/Closed).

## 4. Design System
- **Theme**: Dark Mode Only.
- **Components**: 
    - `.glass-panel`: Semi-transparent backgrounds with blur.
    - `.cyber-btn`: Neon accented buttons with hover glows.
    - `.app-sidebar`: Fixed navigation with active states.

## Content of profile.md
---
id: "fx_edu_ile_docs"
name: "fxEdu_ILE"
model: "gemini-2.0-pro"
temperature: 0.2
version: "1.1.0"
capabilities:
  - "full_stack_development"
  - "technical_writing"
  - "ui_ux_design"
tags: ["education", "ile", "admin_panel", "fluxive"]
---
**Fluxive Academy** is the comprehensive learning platform for Fluxive.ai. It mimics the production environment's visual style and provides a "Google AI Studio"-like Integrated Learning Environment (ILE) for coursework, alongside a powerful Admin Dashboard.

## Identity
- **Name**: Fluxive Academy
- **Type**: Web Application (Local Prototype)
- **Aesthetic**: Cyberpunk/Modern Dark (Fluxive Brand), Futuristic/Technical (ILE)
- **Status**: Phase 3 (Feature Complete / Polish)

## Application Map
The application is divided into three distinct sections:

1.  **integrated Learning Environment (ILE)**
    - **Goal**: Immersive learning experience.
    - **Pages**: `module.html`.
    - **Key Features**:
        - 3-Pane Layout (Nav, Content, Tools).
        - Learner Tools: Context Notes, Artifacts, Resources.
        - Interactive Quizzes and Flashcards.
        - Hover Engine for glossary terms.

2.  **Admin Dashboard**
    - **Goal**: Content and User management.
    - **Pages**: `admin.html`.
    - **Key Features**:
        - **Courses**: Listings, Stats, Editor Modal.
        - **Learners**: Progress tracking, Filtering.
        - **Learning Paths**: Path Builder (Courses + External items).
        - **Cases**: Case Management System (CRUD for Flux Investigator).
        - **Messages**: User communication log.

3.  **Public Marketplace**
    - **Goal**: Discovery and Sales.
    - **Pages**: `index.html` (Catalog), `course.html` (Details).

## Technical Stack
- **Runtime**: Node.js
- **Server**: Express.js (serving static files and mock APIs)
- **Frontend**: HTML5, CSS3 (Glassmorphism, Flexbox/Grid), Vanilla JavaScript
- **Data Source**: 
    - Courses: XML Files (`public/data/courses/*/course.xml`)
    - Paths: JSON (`public/data/paths.json`)
    - Cases: JSON (`public/data/cases.json`)
- **Persistence**: `localStorage` (for Learner Notes and Mock Auth)

## Agent Directives
- **Code**: Maintain separation of concerns. `main.js` handles ILE and Admin logic (consider splitting if it grows too large).
- **Design**: Strict adherence to "Fluxive Dark" aesthetic (Glass panels, active glows, `Inter`/`JetBrains Mono` fonts).
- **Mocking**: No Database. Use JSON/XML files in `public/data/` for all persistence.

## Content of tech_stack.md
# Technical Stack & Guidelines

## Core Architecture
- **Type**: Multi-page Application (MPA) served via Express.
- **Entry Point**: `server.js` handling route serving and API endpoints.

## Backend (Node/Express)
- **API Style**: RESTful-ish (Mock).
- **Data Persistence**:
    - **XML**: Used for legacy/complex Course Data (`course.xml`).
    - **JSON**: Used for modern features (`paths.json`, `cases.json`).
    - **Read/Write**: Direct filesystem operations using `fs`.
- **Statics**: `public/` directory served as root.

## Frontend (Vanilla)
- **No Frameworks**: Pure HTML/CSS/JS.
- **State Management**: Global variables in `main.js` (e.g., `currentCourseId`, `allCases`).
- **Templating**: Template literals in JS functions (`renderCases()`, `renderPaths()`).
- **DOM Manipulation**: Direct `document.getElementById` and `innerHTML` injection.

## Design System (CSS)
- **File**: `public/css/style.css`
- **Variables**:
    - `--bg-dark`: Black/Dark Gray backgrounds.
    - `--glass-bg`: `rgba(255, 255, 255, 0.05)`
    - `--accent-cyan`: `#00f3ff` (Primary Action)
    - `--text-color`: `#e0e0e0`
- **Layouts**: Primarily Flexbox for components, Grid for layout containers.

## Development Rules
1.  **Keep it Simple**: Do not introduce build steps (Webpack/Vite) unless requested.
2.  **Mock First**: If a backend feature is missing, mock it in `server.js` or client-side before building complex DB logic.
3.  **Preserve Aesthetics**: Always maintain the "Glass/Cyber" look. No default browser styles.

## Content of todo.md
This is a powerful aesthetic direction. Combining **Flux.ai** (technical, schematic, infinite canvas, collaborative) with **Google AI Studio** (clean, pane-based, minimalist, rounded corners) creates a look that is **"utilitarian futuristic."**

It signals to the learner: *"You are not here to just watch; you are here to engineer your own understanding."*

### The Design Philosophy: "The Cognitive Workshop"

**Visual Style:**

* **Background:** Deep Charcoal / Slate Grey (Hex `#1A1A1A` or similar). Avoid pure black. Use a subtle, faint dot-grid pattern (Flux style) to imply a workspace or blueprint.
* **Containers:** "Floating" cards with rounded corners (Google AI Studio style). Instead of solid borders, use subtle drop shadows and 1px borders with low opacity (e.g., white at 10% opacity) to create depth.
* **Accent Colors:** Use "Electric" colors for actions (Flux style).
* *Primary Action (Run/Quiz):* Electric Blue or Google Blue.
* *Success/Growth:* Neon Lime.
* *Focus Mode:* Amber/Orange.


* **Typography:**
* *Headings/UI:* A crisp geometric sans-serif (e.g., *Inter* or *Roboto*).
* *Reading Content:* A highly legible serif for long-form text (e.g., *Merriweather*).
* *Data/Notes:* A monospaced font (e.g., *JetBrains Mono*) to give that "developer" feel.



**The Layout (3-Column "Bento Box"):**
The screen is a single viewport (no scrolling the whole page, only individual panes scroll).

1. **Left Sidebar (Navigation & Map):** Collapsible. Darker than the main stage. Contains the "Knowledge Graph" (nodes and edges visualization).
2. **Center Stage (The Workbench):** The largest area. Split horizontally. Top 70% is the Content (Video/Doc). Bottom 30% is the Sandbox/Interactive layer.
3. **Right Sidebar (The Toolkit):** A tabbed column for Notepad, AI Copilot, and Flashcards.

---

### The Implementation Todo List

Here is your roadmap to building this Integrated Learning Environment (ILE).

#### Phase 1: Foundation & Layout (The "Shell")

* [x] **Set up the CSS Grid/Flexbox Skeleton:** Create a non-scrolling viewport (`100vh`) with a 3-column resizeable layout (Left, Center, Right).
* [x] **Implement "Dark Mode" Base:** Set background to `#1E1F22` (dark grey). Add a faint CSS radial-gradient or SVG dot pattern overlay to mimic the Flux.ai canvas.
* [x] **Create "Glassmorphic" Panes:** Style the three main content areas as "cards" with `border-radius: 12px`, a slightly lighter background color (`#2B2D31`), and a subtle border (`1px solid rgba(255,255,255,0.1)`).
* [x] **Add Resizable Handles:** Implement drag-handles between columns so users can widen the "Notepad" or "Video" as needed (crucial for an IDE feel).

#### Phase 2: Core "Cool" Integrations (The Logic)

* [ ] **Build the Contextual "Hover" Engine:**
* [ ] Identify keywords in text transcripts/documents.
* [ ] Create a React/JS tooltip component that fetches definitions/diagrams on hover.


* [ ] **Integrate the "Sandbox" Widget:**
* [ ] Embed an `iframe` or library (like CodeMirror for code, Desmos for math) in the bottom half of the Center Stage.
* [ ] **Linkage:** Write script so that clicking a "Try it" button in the course document auto-populates the Sandbox.


* [ ] **Develop the AI Co-Pilot Sidebar:**
* [ ] Create a chat interface in the Right Sidebar (Google AI Studio style—clean input, distinct bubbles).
* [ ] **Context Injection:** Ensure the chat input automatically includes the current transcript segment as a "system prompt" context.



#### Phase 3: "Memory" & Progress Features

* [ ] **Build the "Flashcard" Action:**
* [ ] Add a context menu (Right-Click) to the Notepad/Documents with an option: *"Convert selection to Flashcard."*
* [ ] Create a storage array for these cards.


* [ ] **Implement the Knowledge Graph:**
* [ ] Replace the standard "List of Modules" sidebar with a node-graph library (like `react-force-graph`).
* [ ] Style nodes: Grey (unlocked), Neon Green (mastered), Locked (dimmed).


* [ ] **Create the "Commit Log":**
* [ ] Build a modal that triggers when the user tries to exit the session: *"Commit your learning? Write a 2-sentence summary."*



#### Phase 4: Workflow & Focus Tools

* [ ] **Add the "Focus Mode" Toggle:**
* [ ] Create a button in the header.
* [ ] **Action:** When clicked, collapse Left and Right sidebars, dim the interface, and start a 25-minute countdown timer overlay.


* [ ] **Implement Split-Screen Presets:**
* [ ] Add small icon buttons in the top-right corner (e.g., "📖" for Reading Layout, "🖥️" for Watch Layout).
* [ ] **Logic:** Clicking these auto-resizes the CSS Grid columns to predefined percentages.


* [ ] **Integrate "Social Annotations":**
* [ ] Overlay a highlight layer on course text.
* [ ] Fetch "public highlights" from a database and render them as faint underlines (Medium.com style).



#### Phase 5: Polish & Micro-Interactions

* [ ] **Typing Animation:** When the AI Co-Pilot responds, stream the text (don't dump it all at once) to mimic the "thinking" feel of Google AI Studio.
* [ ] **Toast Notifications:** When a user completes a module or earns a badge, pop a sleek, dark-themed notification (bottom right).
* [ ] **Keyboard Shortcuts:** Add IDE-standard shortcuts:
* `Ctrl/Cmd + /` to toggle the Sidebar.
* `Ctrl/Cmd + K` to open a "Command Palette" (search for concepts/files).



### Next Step

Would you like me to write the **CSS code for the "Glassmorphic" Pane style** or the **JavaScript logic for the "Right-Click to Flashcard"** feature first?