document.addEventListener('DOMContentLoaded', () => {
    const apiBase = 'http://localhost:3000/api/courses';
    const path = window.location.pathname;

    if (path.endsWith('index.html') || path === '/') {
        loadCourses();
    } else if (path.endsWith('course.html')) {
        loadCourseDetail();
    } else if (path.endsWith('module.html')) {
        loadModulePlayer();
    } else if (path.endsWith('admin.html')) {
        loadAdminDashboard();
    }
});

/* Mock Auth / Subscription */
function isSubscribed() {
    // Simulate check. In a real app, this would verify a token.
    return localStorage.getItem('isAuth') === 'true';
}

function loginMock() {
    localStorage.setItem('isAuth', 'true');
    alert('Simulated Login Successful. Access Granted.');
    location.reload();
}

async function fetchCourses() {
    try {
        const response = await fetch('http://localhost:3000/api/courses');
        return await response.json();
    } catch (error) {
        console.error('Failed to fetch courses:', error);
        return [];
    }
}

async function loadCourses() {
    const listContainer = document.getElementById('course-list');
    const courses = await fetchCourses();

    if (courses.length === 0) {
        listContainer.innerHTML = '<p class="loading">No data units found in the archive.</p>';
        return;
    }

    listContainer.innerHTML = courses.map(course => `
        <div class="course-card" onclick="window.location.href='course.html?id=${course.id}'">
            <div class="course-thumb" style="background-image: url('${course.image}');" onerror="this.style.backgroundColor='#111'"></div>
            <div class="course-info">
                <div class="course-meta">
                    <span>${course.folder || 'UNIT'}</span>
                    <span>${course.price === 0 ? 'OPEN ACCESS' : '$' + course.price}</span>
                </div>
                <h3 class="course-title">${course.title}</h3>
                <p class="course-desc">${course.description}</p>
                <div style="margin-top:20px;">
                    <span class="cyber-btn cyber-btn-sm">Initialize &rarr;</span>
                </div>
            </div>
        </div>
    `).join('');
}

async function loadCourseDetail() {
    const params = new URLSearchParams(window.location.search);
    const courseId = params.get('id');
    const container = document.getElementById('course-detail-view');

    if (!courseId) return;

    // Fetch specific course details
    try {
        const response = await fetch(`http://localhost:3000/api/courses/${courseId}`);
        if (!response.ok) throw new Error('Course not found');
        const course = await response.json();

        renderCourseDetail(course, container, courseId);
    } catch (err) {
        console.error(err);
        container.innerHTML = '<div style="padding:40px; text-align:center;"><h2>Course not found</h2><a href="index.html" style="color:var(--accent-cyan)">Return to Catalog</a></div>';
    }
}

function renderCourseDetail(course, container, courseId) {
    const meta = course.Metadata;
    // Normalize modules
    let modules = [];
    if (course.Content && course.Content.Module) {
        modules = Array.isArray(course.Content.Module) ? course.Content.Module : [course.Content.Module];
    }
    const ensureArray = (item) => Array.isArray(item) ? item : (item ? [item] : []);

    // Check if we have an image
    const hasImage = meta.Image && meta.Image !== 'undefined' && meta.Image !== '';

    // Fallback/Placeholder if "Show Graphic" is toggled on but image is missing? 
    // For now, we render it if it exists.

    container.innerHTML = `
        <div class="course-detail-container animate-fade-in">
            
            <div class="course-header-standard">
                 <div class="course-header-meta" style="margin-bottom:10px;">
                    <span style="color:var(--accent-blue);">Course Sequence</span>
                    <span>/</span>
                    <span>${meta.Folder || 'General'}</span>
                 </div>
                 <h1>${meta.Title}</h1>
                 <div class="course-header-meta">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="width:24px; height:24px; background:#333; border-radius:50%; display:inline-block;"></span>
                        <span>${meta.Author}</span>
                    </div>
                    <span>•</span>
                    <span>${meta.Duration || 'Self-Paced'}</span>
                    <span>•</span>
                    <span>${modules.length} Modules</span>
                 </div>
            </div>

            <div class="course-layout-grid">
                <!-- Left: Content & Outline -->
                <div class="course-main-column">
                    <div class="course-description">
                        <h3 style="color:var(--text-secondary); margin-bottom:15px; text-transform:uppercase; font-size:0.9rem; letter-spacing:0.05em;">About this Unit</h3>
                        <p style="font-size:1.1rem; line-height:1.7; color:#ddd;">
                            ${meta.Description}
                        </p>
                    </div>

                     <div class="course-outline-section">
                        <h3 style="color:var(--text-secondary); margin-bottom:20px; text-transform:uppercase; font-size:0.9rem; letter-spacing:0.05em;">Curriculum</h3>
                        <div class="modules-container">
                            ${modules.map(mod => `
                                <div class="module-item-detail" style="background:transparent; border:1px solid var(--border-color); margin-bottom:15px; border-radius:8px;">
                                    <div class="module-header" style="background:rgba(255,255,255,0.02); padding:15px; border-bottom:1px solid var(--border-color);">
                                        <h4 style="margin:0; font-size:1rem;">${mod.Metadata ? mod.Metadata.Title : mod.Title}</h4>
                                        <span style="font-size:0.8rem; color:#666;">${mod.Unit ? ensureArray(mod.Unit).length : 0} Units</span>
                                    </div>
                                    <ul class="unit-list" style="padding:10px 15px;">
                                        ${mod.Unit ? ensureArray(mod.Unit).map(unit => `
                                            <li class="unit-item" style="padding:8px 0; border-bottom:1px dashed rgba(255,255,255,0.05); display:flex; gap:10px;">
                                                <div class="unit-icon" style="color:var(--accent-blue);">${getUnitIcon(unit['@_type'])}</div>
                                                <div style="flex-grow:1; font-size:0.9rem; color:#ccc;">${unit.Title}</div>
                                                <span style="font-size:0.8rem; color:#555;">${unit.Duration || ''}</span>
                                            </li>
                                        `).join('') : '<li style="padding:10px; color:#555;">No units available</li>'}
                                    </ul>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>

                <!-- Right: Graphic & Actions -->
                <div class="course-sidebar-column">
                    ${hasImage ? `
                        <div class="course-poster" style="background-image: url('${meta.Image}');"></div>
                    ` : ''}

                    <div class="sidebar-widget">
                        <h3>Enrollment Options</h3>
                        <div style="font-size:2.5rem; font-weight:800; margin-bottom:5px; color: #fff;">
                            ${meta.Price === 0 || meta.Price === '0' ? 'Free' : '$' + meta.Price}
                        </div>
                         <div style="font-size:0.9rem; color:var(--accent-cyan); margin-bottom:20px;">
                            ${meta.Price === 0 ? 'Open Access License' : 'One-time Payment'}
                        </div>
                        
                        <button onclick="checkSubscription('${courseId}')" class="cyber-btn" style="width:100%; text-align:center; justify-content:center;">
                            Initialize Sequence
                        </button>
                        
                        <div style="margin-top:20px; font-size:0.8rem; color:#666; display:flex; flex-direction:column; gap:8px;">
                            <div>✓ Full Lifetime Access</div>
                            <div>✓ Access on Mobile and Desktop</div>
                            <div>✓ Certificate of Completion</div>
                        </div>
                    </div>

                    <div class="sidebar-widget">
                        <h3>System Requirements</h3>
                        <ul style="padding-left:20px; color:#888; font-size:0.85rem; line-height:1.6; margin:0;">
                            <li>Fluxive Ecosystem Account</li>
                            <li>Modern Browser (Chrome/Firefox)</li>
                            <li>Basic understanding of Agentic workflows</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getUnitIcon(type) {
    if (type === 'video') return '&#9658;'; // Play
    if (type === 'quiz') return '?';
    if (type === 'text') return '&#128196;'; // Doc
    return '&#8226;'; // Bullet
}

function checkSubscription(courseId) {
    if (isSubscribed()) {
        window.location.href = `module.html?courseId=${courseId}`;
    } else {
        // Trigger Launchpad Sign In
        const launchpad = document.querySelector('mforce-launchpad');
        if (launchpad) {
            launchpad.openModal('signin');
        } else {
             alert("Launchpad not found. Please reload or check connection.");
        }
    }
}

/* ILE LOGIC */
let currentCourseId = null;

// Enhanced ILE Logic
async function loadModulePlayer() {
    const params = new URLSearchParams(window.location.search);
    currentCourseId = params.get('courseId');
    const lessonId = params.get('lessonId');

    document.getElementById('back-to-course').href = `course.html?id=${currentCourseId}`;

    // Fetch Course Data
    let courseData = null;
    try {
        const response = await fetch(`http://localhost:3000/api/courses/${currentCourseId}`);
        if (!response.ok) throw new Error('Course not found');
        courseData = await response.json();
    } catch (err) {
        console.error(err);
        window.location.href = 'index.html';
        return;
    }

    // Normalize Data Structure
    const modulesRaw = courseData.Content && courseData.Content.Module
        ? (Array.isArray(courseData.Content.Module) ? courseData.Content.Module : [courseData.Content.Module])
        : [];

    const modules = modulesRaw.map(m => ({
        title: m.Metadata ? m.Metadata.Title : m.Title,
        lessons: m.Unit ? (Array.isArray(m.Unit) ? m.Unit : [m.Unit]).map(u => ({
            id: u['@_id'],
            title: u.Title,
            type: u['@_type'],
            duration: u.Duration,
            content: u.BodyContent || u.Description || '',
            source: u.SourceURL
        })) : []
    }));

    const course = {
        id: courseData['@_id'],
        modules: modules,
        artifacts: [],
        resources: []
    };

    // Flatten for Navigation Calculation
    let allLessons = [];
    course.modules.forEach(m => allLessons.push(...m.lessons));

    const sensitiveLessonId = lessonId || (allLessons.length > 0 ? allLessons[0].id : null);
    const currentLessonIndex = allLessons.findIndex(l => l.id === sensitiveLessonId);
    const currentLesson = allLessons[currentLessonIndex];

    // Progress Tracking (Local Storage)
    const completedKey = `fluxive_progress_${currentCourseId}`;
    let completedLessons = JSON.parse(localStorage.getItem(completedKey) || '[]');

    // Populate Sidebar
    const navContainer = document.getElementById('lesson-nav');
    if (course.modules && course.modules.length > 0) {
        navContainer.innerHTML = course.modules.map(mod => `
            <div class="nav-module">
                <div class="nav-module-title">${mod.title}</div>
                ${mod.lessons.map(lesson => {
            const isCompleted = completedLessons.includes(lesson.id);
            const isActive = lesson.id === sensitiveLessonId;
            return `
                        <a href="?courseId=${currentCourseId}&lessonId=${lesson.id}" 
                           class="lesson-link ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}">
                           ${lesson.title}
                           ${isCompleted ? '<span class="status-icon">✓</span>' : ''}
                        </a>
                    `;
        }).join('')}
            </div>
        `).join('');
    }

    // Render Main Content
    if (currentLesson) {
        document.getElementById('lesson-title').textContent = currentLesson.title;
        const contentBody = document.getElementById('lesson-content');

        let mediaHtml = '';
        if (currentLesson.type === 'video') {
            mediaHtml = renderVideo(currentLesson);
        } else if (currentLesson.type === 'quiz') {
            mediaHtml = renderQuiz(currentLesson, currentCourseId);
        } else {
            mediaHtml = `<div class="text-lesson animate-fade-in">${currentLesson.content}</div>`;
        }

        // Render content logic
        contentBody.innerHTML = `
            ${mediaHtml}
            <div style="margin-top:20px; border-top:1px solid #333; padding-top:10px; font-size:0.85rem; color:#666;">
                Duration: ${currentLesson.duration} | Type: ${currentLesson.type ? currentLesson.type.toUpperCase() : 'UNKNOWN'}
            </div>
        `;

        // Navigation Buttons Logic
        const prevLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
        const nextLesson = currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null;

        // Render Nav into separate container to avoid Hover Engine conflicts
        let navFooter = document.getElementById('lesson-nav-footer');
        if (!navFooter) {
            navFooter = document.createElement('div');
            navFooter.id = 'lesson-nav-footer';
            contentBody.parentNode.insertBefore(navFooter, contentBody.nextSibling);
        }

        navFooter.innerHTML = `
            <div class="lesson-navigation">
                ${prevLesson
                ? `<a href="?courseId=${currentCourseId}&lessonId=${prevLesson.id}" class="nav-btn prev">&larr; Previous</a>`
                : '<div></div>'}
                
                ${currentLesson.type !== 'quiz'
                ? `<button onclick="completeLesson('${currentCourseId}', '${currentLesson.id}', '${nextLesson ? nextLesson.id : ''}')" class="nav-btn next">
                        ${nextLesson ? 'Complete & Continue &rarr;' : 'Finish Course'}
                       </button>`
                : ''
            }
            </div>
        `;

        // Init Context Engine (will only affect contentBody)
        if (window.initHoverEngine) {
            setTimeout(window.initHoverEngine, 100);
        }
    }

    loadNotes(currentCourseId);
}

// Helper Renderers
function renderVideo(lesson) {
    // Simple logic to convert youtube links to embed
    let src = lesson.source || '';
    if (src.includes('youtube.com/watch?v=')) {
        src = src.replace('watch?v=', 'embed/');
    } else if (src.includes('youtu.be/')) {
        src = src.replace('youtu.be/', 'www.youtube.com/embed/');
    }

    return `
        <div class="video-container animate-fade-in">
            <iframe src="${src}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
        <div class="video-description">${lesson.content}</div>
    `;
}

function renderQuiz(lesson, courseId) {
    // Basic parser for markdown-style quizzes
    // Looking for lines like: - [ ] Answer or - [x] Correct Answer
    // And separating questions. 

    // For MVP "Fluxive 101", we know the structure is simple HTML lists in CDATA.
    // Let's rely on standard DOM manipulation of the content string.

    // Create a temporary container to parse HTML string
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = lesson.content;

    // Convert <ul><li>[ ] ...</li></ul> to Radio Inputs
    const questions = [];
    // This is a naive parser assuming 1 question for the sample. 
    // In a real app, we'd parse structured JSON quizzes.

    // Let's try to extract the list items and make them interactive.
    const listItems = tempDiv.querySelectorAll('li');
    let formHtml = '<form id="quiz-form" onsubmit="return false;">';

    if (listItems.length > 0) {
        formHtml += '<ul class="quiz-options">';
        listItems.forEach((li, index) => {
            const text = li.textContent.trim();
            const isCorrect = text.includes('[x]');
            const cleanText = text.replace(/\[\s?x?\s?\]/, '').trim();

            formHtml += `
                <li class="quiz-option" onclick="selectQuizOption(this)">
                    <label>
                        <input type="radio" name="q1" value="${isCorrect ? 'correct' : 'wrong'}">
                        <span class="option-text">${cleanText}</span>
                    </label>
                </li>
            `;
        });
        formHtml += '</ul>';
    } else {
        formHtml += lesson.content; // Fallback if no list found
    }

    formHtml += `
        <div class="quiz-actions">
            <!-- Use global currentCourseId in logic to avoid putting it in HTML attribute where Hover Engine breaks it -->
            <button onclick="submitQuiz('${lesson.id}')" class="btn-primary">Submit Answer</button>
            <div id="quiz-feedback"></div>
        </div>
    `;

    formHtml += '</form>';

    return `
        <div class="quiz-container animate-fade-in">
            ${tempDiv.querySelector('h3') ? `<h3>${tempDiv.querySelector('h3').textContent}</h3>` : ''}
            ${tempDiv.querySelector('p') ? `<p>${tempDiv.querySelector('p').textContent}</p>` : ''}
            ${formHtml}
        </div>
    `;
}

// Interactive Logic
window.selectQuizOption = function (el) {
    // Visual selection
    document.querySelectorAll('.quiz-option').forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
    el.querySelector('input').checked = true;
}

window.submitQuiz = function (lessonId) {
    const form = document.getElementById('quiz-form');
    const selected = form.querySelector('input[name="q1"]:checked');
    const feedback = document.getElementById('quiz-feedback');
    const courseId = currentCourseId; // Use global scope

    if (!selected) {
        feedback.textContent = "Please select an answer.";
        feedback.className = "feedback-error";
        return;
    }

    if (selected.value === 'correct') {
        feedback.textContent = "Correct! Protocol Verified.";
        feedback.className = "feedback-success";
        // Auto-advance logic could go here

        // Mark complete
        completeLesson(courseId, lessonId, null, false); // Don't redirect immediately to allow reading feedback

        // Show "Next" button
        const modules = document.querySelectorAll('.lesson-link'); // Hacky way to find next?
        // Better:
        // Inject a next button into feedback
        feedback.innerHTML += ` <br><button onclick="window.location.reload()" class="cyber-btn cyber-btn-sm" style="margin-top:10px;">Continue &rarr;</button>`;

    } else {
        feedback.textContent = "Incorrect. Review the Neural Architecture nodes.";
        feedback.className = "feedback-error";
    }
}

window.completeLesson = function (courseId, lessonId, nextLessonId, autoRedirect = true) {
    const key = `fluxive_progress_${courseId}`;
    let completed = JSON.parse(localStorage.getItem(key) || '[]');

    if (!completed.includes(lessonId)) {
        completed.push(lessonId);
        localStorage.setItem(key, JSON.stringify(completed));
    }

    if (autoRedirect && nextLessonId) {
        window.location.href = `?courseId=${courseId}&lessonId=${nextLessonId}`;
    } else if (autoRedirect) {
        // Finished course
        alert("Course Sequence Completed. Returning to Hub.");
        window.location.href = 'course.html?id=' + courseId;
    }
}


// Learner Tools Logic
function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

    // Find button based on onclick attribute parsing
    // This is more robust than indices
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
        if (btn.getAttribute('onclick').includes(`'${tabName}'`)) {
            btn.classList.add('active');
        }
    });

    document.getElementById(`tab-${tabName}`).classList.add('active');

    // Lazy render specific tabs
    if (tabName === 'flashcards' && window.renderFlashcards) {
        window.renderFlashcards();
    }
}

function loadArtifacts(list) {
    const container = document.getElementById('artifacts-list');
    if (!list || list.length === 0) {
        container.innerHTML = '<p style="font-size:0.85rem; color:#444;">No artifacts.</p>';
        return;
    }
    container.innerHTML = list.map(item => `
        <div class="artifact-item">
            <span class="artifact-icon">&#128196;</span>
            <a href="${item.url}" style="color:#ccc; text-decoration:none; font-size:0.9rem;">${item.name}</a>
        </div>
    `).join('');
}

function loadResources(list) {
    const container = document.getElementById('resources-list');
    if (!list || list.length === 0) {
        container.innerHTML = '<p style="font-size:0.85rem; color:#444;">No resources.</p>';
        return;
    }
    container.innerHTML = list.map(item => `
        <div class="artifact-item">
            <span class="artifact-icon">&#128279;</span>
            <a href="${item.url}" target="_blank" style="color:#ccc; text-decoration:none; font-size:0.9rem;">${item.title}</a>
        </div>
    `).join('');
}

// Notes Logic (Persistence)
function loadNotes(courseId) {
    const teaxtarea = document.getElementById('notes-area');
    const saved = localStorage.getItem(`notes_${courseId}`);
    if (saved) teaxtarea.value = saved;

    teaxtarea.addEventListener('input', (e) => {
        localStorage.setItem(`notes_${courseId}`, e.target.value);
    });
}

/* ADMIN LOGIC */
async function loadAdminDashboard() {
    const courses = await fetchCourses();

    document.getElementById('total-courses').textContent = courses.length;

    const tableBody = document.getElementById('course-table');
    tableBody.innerHTML = courses.map(c => `
        <tr>
            <td>
                <div style="font-weight:bold; color:var(--text-color);">${c.title}</div>
            </td>
            <td>${c.id}</td>
            <td>${c.price === 0 || c.price === '0' ? 'Free' : '$' + c.price}</td>
            <td>
                <button style="background:transparent; border:1px solid #333; color:var(--accent-cyan); padding:5px 10px; cursor:pointer; margin-right:5px;" onclick="openCourseEditor('${c.id}')">Edit</button>
            </td>
        </tr>
    `).join('');
}

let isEditing = false;
let editingId = null;

window.openCourseEditor = async function (courseId = null) {
    const modal = document.getElementById('editor-modal');
    const titleInput = document.getElementById('edit-title');
    const idInput = document.getElementById('edit-id');
    const xmlInput = document.getElementById('edit-xml');
    const deleteBtn = document.getElementById('btn-delete');
    const modalTitle = document.getElementById('modal-title');

    modal.style.display = 'flex';

    if (courseId) {
        // Edit Mode
        isEditing = true;
        editingId = courseId;
        modalTitle.textContent = 'Edit Course';
        idInput.value = courseId;
        idInput.disabled = true;
        deleteBtn.style.display = 'block';

        // Fetch XML content
        // Note: The API currently returns parsed JSON for details. 
        // We need a way to get RAW XML or specific fields.
        // For now, I'll reconstruct the XML or fetch it via a new endpoint? 
        // Wait, the requirement said "Crud ... edit this in this xml style format".
        // I need an endpoint that returns the raw XML file content.
        // Let's assume GET /api/courses/:id returns JSON. 
        // I should probably add ?format=xml to the API or just reconstruct it.
        // Reconstructing is hard. Let's modify the API in server.js to support ?raw=true.
        // OR, just for now, populate with a template if we can't fetch raw.
        // Actually, I can fetch the file directly if it's in public? No, public/data/courses/:id/course.xml is accessible?
        // Yes! It's static files! "app.use(express.static...)"

        try {
            const res = await fetch(`data/courses/${courseId}/course.xml`);
            if (res.ok) {
                const text = await res.text();
                xmlInput.value = text;
                // Parse title from XML simple regex for display (optional as we have ID)
                const titleMatch = text.match(/<Title>(.*?)<\/Title>/);
                if (titleMatch) titleInput.value = titleMatch[1];
            } else {
                xmlInput.value = 'Error loading XML';
            }
        } catch (e) {
            xmlInput.value = 'Error loading XML';
        }

    } else {
        // Create Mode
        isEditing = false;
        editingId = null;
        modalTitle.textContent = 'Create New Course';
        idInput.value = '';
        idInput.disabled = false;
        titleInput.value = '';
        xmlInput.value = `<?xml version="1.0" encoding="UTF-8"?>
<Course id="new_course" version="1.0">
  <Metadata>
    <Title>New Course Title</Title>
    <Author>Instructor Name</Author>
    <Description>Course Description</Description>
    <Price>0</Price>
    <Image>assets/thumb.jpg</Image>
  </Metadata>
  <Content>
  </Content>
</Course>`;
        deleteBtn.style.display = 'none';
    }
};

window.closeCourseEditor = function () {
    document.getElementById('editor-modal').style.display = 'none';
};

window.saveCourse = async function () {
    const id = document.getElementById('edit-id').value;
    const title = document.getElementById('edit-title').value;
    const xmlContent = document.getElementById('edit-xml').value;

    if (!id) return alert('ID is required');

    try {
        if (isEditing) {
            // PUT Update
            // We'll send the raw XML to the PUT endpoint.
            // Server needs to handle raw string body or JSON wrapping.
            // Let's send JSON with { xml: ... }
            const res = await fetch(`http://localhost:3000/api/courses/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ xml: xmlContent })
            });
            if (res.ok) {
                alert('Course updated!');
                closeCourseEditor();
                loadAdminDashboard();
            } else {
                alert('Failed to update');
            }
        } else {
            // POST Create
            // First create the folder/skeletion
            const res = await fetch(`http://localhost:3000/api/courses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, title })
            });

            if (res.ok) {
                // Then immediately update with the XML content if it changed from default
                // Or just rely on the API providing a default and then user edits it.
                // For better UX, let's update it immediately.
                await fetch(`http://localhost:3000/api/courses/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ xml: xmlContent })
                });

                alert('Course created!');
                closeCourseEditor();
                loadAdminDashboard();
            } else {
                const data = await res.json();
                alert('Failed to create: ' + data.error);
            }
        }
    } catch (err) {
        console.error(err);
        alert('Error saving course');
    }
};

window.deleteCourse = async function () {
    if (!editingId) return;
    if (!confirm('Are you sure you want to archive this course?')) return;

    try {
        const res = await fetch(`http://localhost:3000/api/courses/${editingId}`, {
            method: 'DELETE'
        });
        if (res.ok) {
            alert('Course archived');
            closeCourseEditor();
            loadAdminDashboard();
        } else {
            alert('Failed to delete');
        }
    } catch (err) {
        console.error(err);
        alert('Error deleting course');
    }
};

/* --- Extended Admin Logic --- */

// State for Filters
let learnerFilter = { search: '', sort: 'name' };
let messageFilter = { search: '', user: '', sort: 'newest' };

window.switchAdminTab = function (tabName) {
    // Buttons (Sidebar Items)
    document.querySelectorAll('.admin-sidebar .nav-item').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(tabName)) {
            btn.classList.add('active');
        }
    });

    // Panes
    document.querySelectorAll('.admin-tab-pane').forEach(pane => {
        pane.style.display = 'none';
        pane.classList.remove('active');
    });
    const activePane = document.getElementById(`admin-${tabName}`);
    if (activePane) {
        activePane.style.display = 'block';
        setTimeout(() => activePane.classList.add('active'), 10);
    }

    // Update Header
    const currentSection = document.getElementById('current-section');
    if (currentSection) {
        currentSection.textContent = tabName.charAt(0).toUpperCase() + tabName.slice(1);
    }

    // Refresh Data
    if (tabName === 'learners') loadLearners();
    if (tabName === 'messages') loadMessages();
    if (tabName === 'paths') loadPaths();
    if (tabName === 'cases') loadCases();
}

// Mock Data Generators for Admin Demo
function getMockLearners() {
    return [
        { name: "Alice Vector", email: "alice@fluxive.ai", courses: ["Fluxive 101"], progress: 80 },
        { name: "Bob Tensor", email: "bob@fluxive.ai", courses: ["Fluxive 101", "Advanced Agents"], progress: 25 },
        { name: "Charlie Node", email: "charlie@fluxive.ai", courses: [], progress: 0 },
        { name: "Dave Matrix", email: "dave@fluxive.ai", courses: ["Fluxive 101"], progress: 100 },
        { name: "Eve Synapse", email: "eve@fluxive.ai", courses: ["Advanced Agents"], progress: 15 }
    ];
}

function getMockMessages() {
    return [
        { user: "Alice Vector", subject: "Question about Agent Nodes", time: Date.now() - 7200000, body: "I'm stuck on the Neural Architecture section. Do agents require independent memory?" },
        { user: "Bob Tensor", subject: "Billing Inquiry", time: Date.now() - 86400000, body: "Can I upgrade my plan to include the Sandbox features?" },
        { user: "Charlie Node", subject: "Login Issue", time: Date.now() - 172800000, body: "I forgot my password and the reset link isn't working." },
        { user: "Alice Vector", subject: "Feature Request", time: Date.now() - 10000000, body: "Can we get dark mode for the code editor?" }
    ];
}

// Filtering Logic
window.filterLearners = function () {
    const searchInput = document.getElementById('learner-search');
    const sortSelect = document.getElementById('learner-sort');

    if (searchInput) learnerFilter.search = searchInput.value.toLowerCase();
    if (sortSelect) learnerFilter.sort = sortSelect.value;

    loadLearners();
}

window.filterMessages = function () {
    const searchInput = document.getElementById('message-search');
    const sortSelect = document.getElementById('message-sort');

    if (searchInput) messageFilter.search = searchInput.value.toLowerCase();
    if (sortSelect) messageFilter.sort = sortSelect.value;

    loadMessages();
}

window.clearMessageUserFilter = function () {
    messageFilter.user = '';
    loadMessages();
}

window.jumpToMessages = function (userName) {
    messageFilter.user = userName;
    switchAdminTab('messages');
}

window.loadLearners = function () {
    let learners = getMockLearners();

    // Filter
    if (learnerFilter.search) {
        learners = learners.filter(l =>
            l.name.toLowerCase().includes(learnerFilter.search) ||
            l.email.toLowerCase().includes(learnerFilter.search)
        );
    }

    // Sort
    if (learnerFilter.sort === 'name') {
        learners.sort((a, b) => a.name.localeCompare(b.name));
    } else if (learnerFilter.sort === 'progress') {
        learners.sort((a, b) => b.progress - a.progress);
    }

    document.getElementById('total-learners').textContent = learners.length;

    const tbody = document.getElementById('learner-table');
    if (tbody) {
        tbody.innerHTML = learners.map(l => `
            <tr>
                <td style="color:#fff; font-weight:bold;">${l.name}</td>
                <td>${l.email}</td>
                <td>${l.courses.join(", ")}</td>
                <td>
                    <div style="background:#333; height:6px; width:100px; border-radius:3px; overflow:hidden;">
                        <div style="background:var(--accent-cyan); width:${l.progress}%; height:100%;"></div>
                    </div>
                    <span style="font-size:0.8em; color:#888;">${l.progress}%</span>
                </td>
                <td style="text-align:right;">
                    <button style="border:1px solid #555; background:transparent; color:#ccc; padding:4px 8px; cursor:pointer;" onclick="jumpToMessages('${l.name}')" title="View Messages">💬</button>
                    <button style="border:1px solid #555; background:transparent; color:#ccc; padding:4px 8px; cursor:pointer;" onclick="alert('Manage User Mock')">Manage</button>
                </td>
            </tr>
        `).join('');
    }
}

window.loadMessages = function () {
    let messages = getMockMessages();

    // Filter by User (Deep Link)
    if (messageFilter.user) {
        messages = messages.filter(m => m.user === messageFilter.user);
    }

    // Filter by Search
    if (messageFilter.search) {
        messages = messages.filter(m =>
            m.subject.toLowerCase().includes(messageFilter.search) ||
            m.body.toLowerCase().includes(messageFilter.search) ||
            m.user.toLowerCase().includes(messageFilter.search)
        );
    }

    // Sort
    if (messageFilter.sort === 'newest') {
        messages.sort((a, b) => b.time - a.time);
    } else {
        messages.sort((a, b) => a.time - b.time);
    }

    // Update Filter Chips
    const activeFilters = document.getElementById('active-filters');
    if (activeFilters) {
        activeFilters.innerHTML = '';
        if (messageFilter.user) {
            activeFilters.innerHTML += `<div class="filter-chip">User: ${messageFilter.user} <button onclick="clearMessageUserFilter()">×</button></div>`;
        }
    }

    document.getElementById('unread-messages').textContent = messages.length;

    const list = document.getElementById('message-list');
    if (list) {
        if (messages.length === 0) {
            list.innerHTML = '<div style="color:#666; font-style:italic; padding:20px;">No messages found.</div>';
        } else {
            list.innerHTML = messages.map(m => {
                const timeStr = new Date(m.time).toLocaleString();
                return `
                <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:8px; margin-bottom:10px; border-left:3px solid var(--accent-cyan);">
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                        <strong style="color:#fff;">${m.subject}</strong>
                        <span style="color:#666; font-size:0.8em;">${timeStr}</span>
                    </div>
                    <div style="font-size:0.9em; color:#aaa; margin-bottom:10px;">From: ${m.user}</div>
                    <div style="color:#ddd;">${m.body}</div>
                    <button style="margin-top:10px; background:transparent; border:1px solid var(--accent-blue); color:var(--accent-blue); padding:5px 15px; cursor:pointer;" onclick="alert('Reply Logic Mock')">Reply</button>
                </div>
                `;
            }).join('');
        }
    }
}

/* --- LEARNING PATHS LOGIC --- */
let allPaths = [];
let currentPathBuffer = [];

window.loadPaths = async function () {
    try {
        const res = await fetch('/api/paths');
        if (res.ok) {
            allPaths = await res.json();
            renderPaths();
        }
        populateCourseSelect();
    } catch (err) {
        console.error('Error loading paths:', err);
    }
};

window.renderPaths = function () {
    const grid = document.getElementById('paths-grid');
    if (!grid) return;

    if (allPaths.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:#666; padding:40px;">No learning paths found. Create one to get started.</div>';
        return;
    }

    grid.innerHTML = allPaths.map(path => {
        const itemCount = path.items ? path.items.length : 0;
        return `
        <div class="stat-card" style="display:flex; flex-direction:column; justify-content:space-between;">
            <div>
                <h3 style="color:#fff; margin-bottom:5px;">${path.title}</h3>
                <div style="color:var(--accent-cyan); font-size:0.85rem; margin-bottom:15px;">ID: ${path.id}</div> 
                <p style="color:#aaa; font-size:0.9rem; margin-bottom:15px;">${path.description || 'No description'}</p>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:10px;">
                <span style="font-size:0.8rem; color:#666;">${itemCount} Items</span>
                <button onclick="openPathEditor('${path.id}')" style="background:transparent; border:1px solid var(--accent-cyan); color:var(--accent-cyan); padding:4px 10px; border-radius:4px; cursor:pointer;">Edit</button>
            </div>
        </div>
        `;
    }).join('');
};

window.populateCourseSelect = async function () {
    try {
        const res = await fetch('/api/courses');
        if (res.ok) {
            const courses = await res.json();
            const select = document.getElementById('new-item-course-select');
            if (select) {
                select.innerHTML = courses.map(c => `<option value="${c.id}">${c.title}</option>`).join('');
            }
        }
    } catch (e) { console.error('Error loading courses for select:', e); }
};

window.togglePathItemInput = function () {
    const type = document.getElementById('new-item-type').value;
    const courseInput = document.getElementById('new-item-course-input');
    const extInput = document.getElementById('new-item-external-input');

    if (type === 'course') {
        courseInput.style.display = 'block';
        extInput.style.display = 'none';
    } else {
        courseInput.style.display = 'none';
        extInput.style.display = 'block';
    }
};

window.addPathItemToBuffer = function () {
    const type = document.getElementById('new-item-type').value;
    let item = { type };

    if (type === 'course') {
        const select = document.getElementById('new-item-course-select');
        item.id = select.value;
        item.title = select.options[select.selectedIndex].text;
    } else {
        const url = document.getElementById('new-item-url').value;
        const title = document.getElementById('new-item-title').value;
        if (!url || !title) return alert('URL and Title are required for external items.');
        item.url = url;
        item.title = title;
    }

    currentPathBuffer.push(item);
    renderPathEditorItems();

    document.getElementById('new-item-url').value = '';
    document.getElementById('new-item-title').value = '';
};

window.removePathItem = function (index) {
    currentPathBuffer.splice(index, 1);
    renderPathEditorItems();
};

window.renderPathEditorItems = function () {
    const list = document.getElementById('path-items-list');
    if (!list) return;

    list.innerHTML = currentPathBuffer.map((item, idx) => `
        <div style="background:rgba(255,255,255,0.05); padding:8px 12px; margin-bottom:5px; border-radius:4px; display:flex; justify-content:space-between; align-items:center;">
            <div>
                <span style="font-size:0.75rem; text-transform:uppercase; color:var(--accent-cyan); margin-right:8px;">${item.type}</span>
                <span style="color:#ddd;">${item.title}</span>
            </div>
            <button onclick="removePathItem(${idx})" style="color:#f44; background:transparent; border:none; cursor:pointer;">×</button>
        </div>
    `).join('');
};

window.openPathEditor = async function (pathId = null) {
    const modal = document.getElementById('path-editor-modal');
    modal.style.display = 'flex';

    const idInput = document.getElementById('path-id');
    const titleInput = document.getElementById('path-title');
    const descInput = document.getElementById('path-desc');
    const modalTitle = document.getElementById('path-modal-title');

    currentPathBuffer = [];

    if (pathId) {
        const path = allPaths.find(p => p.id === pathId);
        if (path) {
            idInput.value = path.id;
            idInput.disabled = true;
            titleInput.value = path.title;
            descInput.value = path.description;
            currentPathBuffer = [...path.items];
            modalTitle.textContent = 'Edit Learning Path';
        }
    } else {
        idInput.value = '';
        idInput.disabled = false;
        titleInput.value = '';
        descInput.value = '';
        modalTitle.textContent = 'Create New Learning Path';
    }

    renderPathEditorItems();
    togglePathItemInput();
};

window.savePath = async function () {
    const id = document.getElementById('path-id').value;
    const title = document.getElementById('path-title').value;
    const description = document.getElementById('path-desc').value;

    if (!id || !title) return alert('ID and Title are required.');

    const newPath = {
        id,
        title,
        description,
        items: currentPathBuffer
    };

    const existingIdx = allPaths.findIndex(p => p.id === id);
    if (existingIdx >= 0) {
        allPaths[existingIdx] = newPath;
    } else {
        allPaths.push(newPath);
    }

    try {
        const res = await fetch('/api/paths', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paths: allPaths })
        });

        if (res.ok) {
            alert('Path saved successfully');
            document.getElementById('path-editor-modal').style.display = 'none';
            renderPaths();
        } else {
            alert('Error saving path');
        }
    } catch (e) {
        console.error(e);
        alert('Server Error');
    }
};

/* --- CASES LOGIC --- */
let allCases = [];

window.loadCases = async function () {
    try {
        const res = await fetch('/api/cases');
        if (res.ok) {
            allCases = await res.json();
            renderCases();
        }
    } catch (err) {
        console.error('Error loading cases:', err);
    }
};

window.renderCases = function () {
    const tbody = document.getElementById('case-table');
    if (!tbody) return;

    // Filter
    const search = document.getElementById('case-search') ? document.getElementById('case-search').value.toLowerCase() : '';
    const statusFilter = document.getElementById('case-filter-status') ? document.getElementById('case-filter-status').value : 'all';

    const filtered = allCases.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(search) || c.id.toLowerCase().includes(search);
        const matchesStatus = statusFilter === 'all' || c.status.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:#666;">No cases found.</td></tr>';
        return;
    }

    tbody.innerHTML = filtered.map(c => `
        <tr>
            <td>${c.id}</td>
            <td style="font-weight:bold; color:#fff;">${c.title}</td>
            <td>${c.difficulty || 'Intermediate'}</td>
            <td>
                <span style="padding:4px 8px; border-radius:4px; font-size:0.8rem; background:${c.status === 'Active' ? 'rgba(0, 255, 0, 0.1); color:#5f5' : 'rgba(255, 255, 255, 0.1); color:#aaa'};">
                    ${c.status || 'Active'}
                </span>
            </td>
            <td style="text-align:right;">
                <button onclick="openCaseEditor('${c.id}')" style="background:transparent; border:1px solid var(--accent-cyan); color:var(--accent-cyan); padding:4px 10px; border-radius:4px; cursor:pointer;">Edit</button>
            </td>
        </tr>
    `).join('');
};

window.filterCases = function () {
    renderCases();
};

window.openCaseEditor = function (caseId = null) {
    const modal = document.getElementById('case-editor-modal');
    modal.style.display = 'flex';

    const idInput = document.getElementById('case-id');
    const titleInput = document.getElementById('case-title');
    const descInput = document.getElementById('case-desc');
    const diffInput = document.getElementById('case-difficulty');
    const statusInput = document.getElementById('case-status');
    const modalTitle = document.getElementById('case-modal-title');
    const deleteBtn = document.getElementById('btn-delete-case');

    if (caseId) {
        const c = allCases.find(i => i.id === caseId);
        if (c) {
            idInput.value = c.id;
            idInput.disabled = true;
            titleInput.value = c.title;
            descInput.value = c.description;
            diffInput.value = c.difficulty;
            statusInput.value = c.status;
            modalTitle.textContent = 'Edit Case';
            deleteBtn.style.display = 'block';
            deleteBtn.onclick = () => deleteCase(c.id);
        }
    } else {
        idInput.value = '';
        idInput.disabled = false;
        titleInput.value = '';
        descInput.value = '';
        diffInput.value = 'Novice';
        statusInput.value = 'Active';
        modalTitle.textContent = 'Create New Case';
        deleteBtn.style.display = 'none';
    }
};

window.saveCase = async function () {
    const id = document.getElementById('case-id').value;
    const title = document.getElementById('case-title').value;
    const description = document.getElementById('case-desc').value;
    const difficulty = document.getElementById('case-difficulty').value;
    const status = document.getElementById('case-status').value;

    if (!id || !title) return alert('Case ID and Title are required.');

    const payload = { id, title, description, difficulty, status };
    const isEdit = document.getElementById('case-id').disabled;
    const url = isEdit ? `/api/cases/${id}` : '/api/cases';
    const method = isEdit ? 'PUT' : 'POST';

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert('Case saved.');
            document.getElementById('case-editor-modal').style.display = 'none';
            loadCases();
        } else {
            const err = await res.json();
            alert('Error: ' + err.error);
        }
    } catch (e) {
        console.error(e);
        alert('Failed to save case.');
    }
};

window.deleteCase = async function (id) {
    if (!confirm('Are you sure you want to delete this case?')) return;
    try {
        const res = await fetch(`/api/cases/${id}`, { method: 'DELETE' });
        if (res.ok) {
            alert('Case deleted.');
            document.getElementById('case-editor-modal').style.display = 'none';
            loadCases();
        } else {
            alert('Failed to delete case.');
        }
    } catch (e) {
        alert('Error deleting case.');
    }
};
