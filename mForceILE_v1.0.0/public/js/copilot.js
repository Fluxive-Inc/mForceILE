/**
 * copilot.js
 * Mock AI Chat Interface.
 */

// Phase 2: Context Logic
let currentContext = "";

window.setCopilotContext = function (text) {
    currentContext = text;
    // visual cue?
    const input = document.getElementById('chat-input');
    if (input) input.placeholder = "Ask about this lesson context...";
};

window.sendMessage = function () {
    const input = document.getElementById('chat-input');
    const messages = document.getElementById('chat-messages');
    const text = input.value.trim();

    if (!text) return;

    // User Message
    addMessage(text, 'user');
    input.value = '';

    // Mock "Thinking"
    const thinkingId = addMessage('Thinking...', 'ai', true);

    setTimeout(() => {
        // Remove thinking
        document.getElementById(thinkingId).remove();

        // Mock Response based on context or generic
        let response = "";

        // 1. Check Context
        if (currentContext && (text.toLowerCase().includes('this') || text.toLowerCase().includes('context'))) {
            response += `Based on the current lesson ("${currentContext.substring(0, 50)}..."), `;
        }

        if (text.toLowerCase().includes('fluxive')) {
            response += "Fluxive is designed to streamline agentic workflows. In this module, we see how the ILE integrates distinct tools.";
        } else if (text.toLowerCase().includes('code')) {
            response += "You can use the Sandbox below to test your implementation. Try running a console.log() to see output.";
        } else {
            response += "That's an interesting point. ";
            if (currentContext) {
                response += "Relating back to our topic, we should consider how this impacts the architecture.";
            } else {
                response += "How can I help you further with this course?";
            }
        }

        streamMessage(response, 'ai');

    }, 1500);
};

function addMessage(text, listClass, isTemp = false) {
    const messages = document.getElementById('chat-messages');
    const div = document.createElement('div');
    const id = 'msg-' + Date.now();
    div.id = id;
    div.className = `chat-message ${listClass}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return id;
}

function streamMessage(text, listClass) {
    const messages = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = `chat-message ${listClass}`;
    messages.appendChild(div);

    let i = 0;
    const interval = setInterval(() => {
        div.textContent += text.charAt(i);
        messages.scrollTop = messages.scrollHeight;
        i++;
        if (i >= text.length) clearInterval(interval);
    }, 30);
}

// Allow Enter key
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('chat-input');
    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') window.sendMessage();
        });
    }
});
