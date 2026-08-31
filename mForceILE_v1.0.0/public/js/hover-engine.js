/**
 * hover-engine.js
 * Implements a simple contextual dictionary lookup.
 */


let glossary = {};

async function loadGlossary() {
    try {
        const response = await fetch('data/glossary.json');
        glossary = await response.json();
    } catch (error) {
        console.error('Failed to load glossary:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // We need to wait for content to be loaded. 
    // main.js loads content async. We can expose a function to call or observe DOM.
    // Let's expose a global function for main.js to call.
    window.initHoverEngine = async function () {
        const contentDiv = document.getElementById('lesson-content');
        if (!contentDiv) return;

        if (Object.keys(glossary).length === 0) {
            await loadGlossary();
        }

        // Simple text walker
        // Warning: replacing innerHTML can break event listeners if any. 
        // For read-only lesson content, it's mostly fine.

        let html = contentDiv.innerHTML;

        Object.keys(glossary).forEach(term => {
            // Regex to match whole words, case insensitive
            const regex = new RegExp(`\\b(${term})\\b`, 'gi');
            html = html.replace(regex, (match) => {
                // Ensure we don't replace inside tags
                return `<span class="context-term" data-term="${match}">${match}</span>`;
            });
        });

        contentDiv.innerHTML = html;

        // Attach event listeners
        attachHoverEvents();
    };
});

function attachHoverEvents() {
    // Remove existing tooltip if any to prevent duplicates during re-init
    const existing = document.querySelector('.context-tooltip');
    if (existing) existing.remove();

    const tooltip = document.createElement('div');
    tooltip.className = 'context-tooltip';
    document.body.appendChild(tooltip);

    document.querySelectorAll('.context-term').forEach(span => {
        span.addEventListener('mouseenter', (e) => {
            const term = e.target.getAttribute('data-term');
            // Normalize key lookup
            const defKey = Object.keys(glossary).find(k => k.toLowerCase() === term.toLowerCase());
            const def = glossary[defKey] || "Definition not found.";

            tooltip.textContent = def;
            tooltip.classList.add('visible');

            // Positioning logic
            const rect = e.target.getBoundingClientRect();
            let left = rect.left;
            let top = rect.bottom + 8; // Slight gap

            // Boundary check (right edge)
            if (left + 250 > window.innerWidth) { // Assuming ~250px width
                left = window.innerWidth - 260;
            }

            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${top}px`;
        });

        span.addEventListener('mouseleave', () => {
            tooltip.classList.remove('visible');
        });
    });
}
