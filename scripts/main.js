/* ========================================
   Campus Life Planner - Main.js
   Fully Functional | 2025
   Designed by Nyayath Lual Deng Chol
======================================== */

/* -----------------------------
   Storage Keys & App Data
------------------------------ */
const STORAGE_KEYS = {
    tasks: 'campusPlanner_tasks',
    events: 'campusPlanner_events',
    classes: 'campusPlanner_classes'
};

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.tasks)) || [];
let events = JSON.parse(localStorage.getItem(STORAGE_KEYS.events)) || [];
let todaySchedule = JSON.parse(localStorage.getItem(STORAGE_KEYS.classes)) || [];

/* -----------------------------
   Utility Functions
------------------------------ */
function saveData() {
    localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
    localStorage.setItem(STORAGE_KEYS.events, JSON.stringify(events));
    localStorage.setItem(STORAGE_KEYS.classes, JSON.stringify(todaySchedule));
    renderDashboard();
}

function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(sec => sec.classList.remove('active'));

    const activeSection = document.getElementById(sectionId);
    if (activeSection) activeSection.classList.add('active');

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
    if (activeLink) activeLink.classList.add('active');

    // Render section content when switching
    if (sectionId === 'dashboard') renderDashboard();
    if (sectionId === 'records') renderRecords();
    if (sectionId === 'schedule') renderSchedule();
    if (sectionId === 'events') renderEvents();
    if (sectionId === 'tasks') renderTasks();
}

/* -----------------------------
   Navigation Handlers
------------------------------ */
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const target = link.getAttribute('href').replace('#', '');
        showSection(target);
    });
});

/* -----------------------------
   Modals
------------------------------ */
const modal = document.getElementById('modal');
const modalTitle = document.getElementById('modalTitle');
const modalBody = document.getElementById('modalBody');
const modalClose = document.getElementById('modalClose');

function openModal(type) {
    if (type === 'task') {
        modalTitle.textContent = 'Add Task';
        modalBody.innerHTML = `
            <form id="taskForm">
                <div class="form-group">
                    <label>Task Title</label>
                    <input type="text" class="form-input" required>
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select class="form-input">
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="overdue">Overdue</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary">Add Task</button>
            </form>
        `;
        const form = document.getElementById('taskForm');
        form.addEventListener('submit', e => {
            e.preventDefault();
            const title = form.querySelector('input').value;
            const status = form.querySelector('select').value;
            tasks.push({ title, status });
            saveData();
            closeModal();
        });
    }

    if (type === 'event') {
        modalTitle.textContent = 'Add Event';
        modalBody.innerHTML = `
            <form id="eventForm">
                <div class="form-group">
                    <label>Event Title</label>
                    <input type="text" class="form-input" required>
                </div>
                <div class="form-group">
                    <label>Date</label>
                    <input type="date" class="form-input" required>
                </div>
                <div class="form-group">
                    <label>Location</label>
                    <input type="text" class="form-input" required>
                </div>
                <button type="submit" class="btn btn-primary">Add Event</button>
            </form>
        `;
        const form = document.getElementById('eventForm');
        form.addEventListener('submit', e => {
            e.preventDefault();
            const title = form.querySelector('input[type=text]').value;
            const date = form.querySelector('input[type=date]').value;
            const location = form.querySelectorAll('input[type=text]')[1].value;
            events.push({ title, date, location });
            saveData();
            closeModal();
        });
    }

    if (type === 'class') {
        modalTitle.textContent = 'Add Class';
        modalBody.innerHTML = `
            <form id="classForm">
                <div class="form-group">
                    <label>Course</label>
                    <input type="text" class="form-input" required>
                </div>
                <div class="form-group">
                    <label>Time</label>
                    <input type="text" class="form-input" required placeholder="9:00 AM">
                </div>
                <div class="form-group">
                    <label>Day</label>
                    <input type="text" class="form-input" required placeholder="Monday">
                </div>
                <button type="submit" class="btn btn-primary">Add Class</button>
            </form>
        `;
        const form = document.getElementById('classForm');
        form.addEventListener('submit', e => {
            e.preventDefault();
            const course = form.querySelectorAll('input')[0].value;
            const time = form.querySelectorAll('input')[1].value;
            const day = form.querySelectorAll('input')[2].value;
            todaySchedule.push({ course, time, day });
            saveData();
            closeModal();
        });
    }

    modal.style.display = 'flex';
}

function closeModal() {
    modal.style.display = 'none';
}
modalClose.addEventListener('click', closeModal);
window.addEventListener('click', e => { if (e.target === modal) closeModal(); });

/* -----------------------------
   Render Functions
------------------------------ */
function renderDashboard() {
    // Stats
    document.getElementById('totalRecords').textContent = tasks.length + events.length + todaySchedule.length;
    const totalHours = todaySchedule.length * 1; // Example 1hr per class
    document.getElementById('totalHours').textContent = totalHours;

    // Top category
    const categories = { tasks: tasks.length, events: events.length, classes: todaySchedule.length };
    let topCat = Object.keys(categories).reduce((a,b)=> categories[a]>categories[b]?a:b);
    document.getElementById('topCategory').textContent = topCat;

    // Weekly Target (dummy example)
    const weeklyTarget = 10;
    const progress = Math.min(Math.round((totalHours / weeklyTarget)*100), 100);
    document.getElementById('weeklyProgress').textContent = progress + '%';
}

function renderRecords() {
    const container = document.querySelector('#records .container');
    container.innerHTML = `<h2><i class="fas fa-folder-open"></i> Records</h2>`;
    if (tasks.length || events.length || todaySchedule.length) {
        const table = document.createElement('table');
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Type</th><th>Title/Course</th><th>Details</th>
                </tr>
            </thead>
            <tbody>
                ${tasks.map(t=>`<tr><td>Task</td><td>${t.title}</td><td>${t.status}</td></tr>`).join('')}
                ${events.map(e=>`<tr><td>Event</td><td>${e.title}</td><td>${e.date} | ${e.location}</td></tr>`).join('')}
                ${todaySchedule.map(c=>`<tr><td>Class</td><td>${c.course}</td><td>${c.day} | ${c.time}</td></tr>`).join('')}
            </tbody>
        `;
        container.appendChild(table);
    } else {
        container.innerHTML += '<p>No records added yet.</p>';
    }
}

function renderSchedule() {
    const container = document.getElementById('calendarView');
    container.innerHTML = todaySchedule.map(c => `<div class="schedule-item">${c.day} - ${c.time} - ${c.course}</div>`).join('');
}

function renderEvents() {
    const container = document.getElementById('eventsGrid');
    container.innerHTML = events.map(e => `
        <div class="card event-card">
            <h4>${e.title}</h4>
            <p>${e.date} | ${e.location}</p>
        </div>
    `).join('');
}

function renderTasks(filter='all') {
    const container = document.getElementById('tasksList');
    container.innerHTML = tasks.filter(t => filter==='all'||t.status===filter)
        .map(t=>`<div class="task-item">${t.title} (${t.status})</div>`).join('');
}

/* -----------------------------
   Task Filter Buttons
------------------------------ */
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderTasks(btn.dataset.filter);
    });
});

/* -----------------------------
   Quick Actions
------------------------------ */
document.querySelectorAll('.quick-actions .btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const action = btn.textContent.trim();
        if (action.includes('Class')) openModal('class');
        if (action.includes('Event')) openModal('event');
        if (action.includes('Task')) openModal('task');
    });
});

/* -----------------------------
   Dark Mode Toggle
------------------------------ */
const darkToggle = document.getElementById('darkModeToggle');
if (darkToggle) darkToggle.addEventListener('change', e => {
    document.body.classList.toggle('dark-mode', e.target.checked);
});

/* -----------------------------
   Initialize App
------------------------------ */
document.addEventListener('DOMContentLoaded', () => {
    renderDashboard();
    renderRecords();
    renderSchedule();
    renderEvents();
    renderTasks();
});
