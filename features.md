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
