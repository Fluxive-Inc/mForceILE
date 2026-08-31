/**
 * flashcards.js
 * Implements the Flashcard "Memory" system.
 */

const FLASHCARD_KEY = 'fx_flashcards';

window.FlashcardStore = {
    getAll: () => {
        try {
            return JSON.parse(localStorage.getItem(FLASHCARD_KEY) || '[]');
        } catch (e) { return []; }
    },

    add: (front, back) => {
        const cards = window.FlashcardStore.getAll();
        const newCard = {
            id: 'fc-' + Date.now(),
            front: front.trim(),
            back: back ? back.trim() : 'Context from: ' + new Date().toLocaleTimeString(),
            mastered: false,
            created: Date.now()
        };
        cards.push(newCard);
        localStorage.setItem(FLASHCARD_KEY, JSON.stringify(cards));

        // Trigger UI update if visible
        window.renderFlashcards();
    },

    remove: (id) => {
        let cards = window.FlashcardStore.getAll();
        cards = cards.filter(c => c.id !== id);
        localStorage.setItem(FLASHCARD_KEY, JSON.stringify(cards));
        window.renderFlashcards();
    }
};

window.renderFlashcards = function () {
    const container = document.getElementById('flashcards-list');
    if (!container) return;

    const cards = window.FlashcardStore.getAll();

    if (cards.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:40px; color:#555;">
                <div style="font-size:2rem; margin-bottom:10px; opacity:0.3;">🗃️</div>
                <p>No cards yet.</p>
                <div style="font-size:0.8rem;">Select text in the lesson to create one.</div>
            </div>`;
        return;
    }

    container.innerHTML = cards.map(card => `
        <div class="flashcard-item">
            <div class="card-front">${card.front}</div>
            <div class="card-meta">
                <span>Created: ${new Date(card.created).toLocaleDateString()}</span>
                <button onclick="window.FlashcardStore.remove('${card.id}')" class="btn-icon">&times;</button>
            </div>
        </div>
    `).join('');
};

// Selection Listener for Context Menu
document.addEventListener('mouseup', handleSelection);

function handleSelection(e) {
    // Only if inside lesson-content
    if (!e.target.closest('#lesson-content')) return;

    const selection = window.getSelection();
    if (selection.toString().trim().length === 0) {
        hideSelectionTooltip();
        return;
    }

    // Show Tooltip
    showSelectionTooltip(e.clientX, e.clientY, selection.toString());
}

let tooltipEl = null;

function showSelectionTooltip(x, y, text) {
    if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.className = 'selection-tooltip';
        tooltipEl.innerHTML = `
            <button id="btn-create-card">Make Flashcard</button>
        `;
        document.body.appendChild(tooltipEl);
    }

    tooltipEl.style.display = 'block';
    tooltipEl.style.left = `${x}px`;
    tooltipEl.style.top = `${y - 40}px`;

    // Clear old listener to prevent duplicates (simple hack)
    const btn = tooltipEl.querySelector('#btn-create-card');
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener('click', () => {
        const back = prompt("Enter the 'Back' of the card (Definition/Note):");
        if (back) {
            window.FlashcardStore.add(text, back);
            hideSelectionTooltip();
            // Switch tabs to show it
            if (window.switchTab) window.switchTab('flashcards');
        }
    });
}

function hideSelectionTooltip() {
    if (tooltipEl) tooltipEl.style.display = 'none';
}
