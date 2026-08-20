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
