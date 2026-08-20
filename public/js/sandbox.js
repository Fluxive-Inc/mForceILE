/**
 * sandbox.js
 * Simple code sandbox mock.
 */

window.runSandbox = function () {
    const code = document.getElementById('sandbox-code').value;
    const output = document.getElementById('sandbox-output');

    output.innerHTML = '<span style="color:#888">Running...</span>';

    setTimeout(() => {
        try {
            // Dangerous in production, but okay for a local mock/prototype
            // capturing console.log
            let logs = [];
            const originalLog = console.log;
            console.log = (...args) => logs.push(args.join(' '));

            // Eval the code
            eval(code);

            console.log = originalLog;

            if (logs.length > 0) {
                output.innerHTML = logs.join('<br>');
                output.style.color = '#fff';
            } else {
                output.innerHTML = '<span style="color:#aaa">Executed (No Output)</span>';
            }
        } catch (e) {
            output.innerHTML = `<span style="color:#ff5555">${e.message}</span>`;
        }
    }, 500); // Simulate processing time
}

// Phase 2: Linkage Logic
window.setSandboxCode = function (code) {
    const editor = document.getElementById('sandbox-code');
    if (editor) {
        editor.value = code;
        // Optional: Highlight effect
        editor.style.transition = 'background 0.3s';
        editor.style.background = '#333';
        setTimeout(() => editor.style.background = '#1e1e1e', 300);
    }
}

// Simple Code Sandbox Logic
document.addEventListener('DOMContentLoaded', () => {
    // We might have multiple editors if we expand, but for now just one main one.
    // The previous implementation assumed CodeMirror or similar, but let's stick to the textarea for MVP.

    const editorArea = document.querySelector('.code-editor .editor-content'); // This is a div in the HTML, might need valid textarea or contenteditable
    // Checking module.html: <div class="editor-content" contenteditable="true">

    if (!editorArea) return;

    const runBtn = document.querySelector('.panel-header .btn-icon'); // Play button
    const outputConsole = document.createElement('div');
    outputConsole.className = 'sandbox-console';
    outputConsole.style.cssText = "background:#111; color:#0f0; padding:10px; font-family:monospace; font-size:0.8rem; border-top:1px solid #333; height:100px; overflow-y:auto;";
    editorArea.parentNode.appendChild(outputConsole);
    outputConsole.textContent = "> Ready to execute...";

    // Persistence
    const sandBoxKey = "fluxive_sandbox_code";
    const savedCode = localStorage.getItem(sandBoxKey);
    if (savedCode) {
        editorArea.textContent = savedCode;
    } else {
        editorArea.textContent = "// Write your JavaScript here\nconsole.log('Hello Fluxive!');";
    }

    editorArea.addEventListener('input', () => {
        localStorage.setItem(sandBoxKey, editorArea.textContent);
    });

    // Run Logic
    if (runBtn) {
        runBtn.addEventListener('click', () => {
            const code = editorArea.textContent;
            outputConsole.innerHTML = ""; // Clear

            // Console Catch
            const logs = [];
            const originalLog = console.log;
            console.log = (...args) => {
                logs.push(args.join(' '));
                originalLog.apply(console, args);
            };

            try {
                // Warning: Evaluates code. Since this is local/demo, it's acceptable.
                // In production, use WebWorkers or sandboxed iframes.
                const result = eval(code);

                logs.forEach(l => {
                    outputConsole.innerHTML += `<div>> ${l}</div>`;
                });
                if (result !== undefined) {
                    outputConsole.innerHTML += `<div style="color:#aaf">< ${result}</div>`;
                } else {
                    outputConsole.innerHTML += `<div style="color:#666">< [Done]</div>`;
                }

            } catch (err) {
                outputConsole.innerHTML += `<div style="color:#f55">! ${err}</div>`;
            }

            console.log = originalLog; // Restore
        });
    }
});

// Listen for custom events from module content
document.addEventListener('run-sandbox', (e) => {
    if (e.detail && e.detail.code) {
        window.setSandboxCode(e.detail.code);
        // Auto-run? Maybe wait for user.
        // window.runSandbox(); 
    }
});
