/**
 * resizable.js
 * Handles the 3-column resizable layout for the ILE.
 */

document.addEventListener('DOMContentLoaded', () => {
    initResize();
});

function initResize() {
    const sidebar = document.querySelector('.ile-sidebar');
    const main = document.querySelector('.ile-main'); // Middle
    const tools = document.querySelector('.ile-mm-tools');

    // Resizers
    const dragLeft = document.querySelector('#drag-left');
    const dragRight = document.querySelector('#drag-right');

    if (!sidebar || !tools || !dragLeft || !dragRight) {
        console.warn('Resize elements not found');
        return;
    }

    // --- LEFT RESIZER (Sidebar <-> Main) ---
    dragLeft.addEventListener('mousedown', (e) => {
        e.preventDefault();
        dragLeft.classList.add('resizing');
        document.body.style.cursor = 'col-resize';

        const startX = e.clientX;
        const startWidth = sidebar.getBoundingClientRect().width;

        const onMouseMove = (moveEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const newWidth = Math.max(200, Math.min(600, startWidth + deltaX)); // Min 200, Max 600

            sidebar.style.width = `${newWidth}px`;
            // Keep flex-shrink 0 to ensure it holds size
        };

        const onMouseUp = () => {
            dragLeft.classList.remove('resizing');
            document.body.style.cursor = 'default';
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    // --- RIGHT RESIZER (Main <-> Tools) ---
    dragRight.addEventListener('mousedown', (e) => {
        e.preventDefault();
        dragRight.classList.add('resizing');
        document.body.style.cursor = 'col-resize';

        const startX = e.clientX;
        const startWidth = tools.getBoundingClientRect().width;

        const onMouseMove = (moveEvent) => {
            const deltaX = moveEvent.clientX - startX;
            // Dragging left (negative delta) INCREASE width
            const newWidth = Math.max(250, Math.min(500, startWidth - deltaX));

            tools.style.width = `${newWidth}px`;
        };

        const onMouseUp = () => {
            dragRight.classList.remove('resizing');
            document.body.style.cursor = 'default';
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
}
