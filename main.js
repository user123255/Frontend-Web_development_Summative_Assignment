import { loadTasks, saveTasks, importTasks, exportTasks } from './storage.js';
import { validateTask } from './validators.js';
import { searchManager } from './search.js';

// DOM Elements
const dashboardTotal = document.getElementById('total-tasks');
const dashboardDuration = document.getElementById('total-duration');
const dashboardTopTag = document.getElementById('top-tag');

const tableBody = document.getElementById('tasks-table-body');

const form = document.getElementById('task-form');
const formTitle = document.getElementById('task-title');
const formDueDate = document.getElementById('task-dueDate');
const formDuration = document.getElementById('task-duration');
const formTag = document.getElementById('task-tag');
const formError = document.getElementById('form-error');

const searchInput = document.getElementById('search-input');

const importInput = document.getElementById('import-json');
const exportBtn = document.getElementById('export-json');

let tasks = loadTasks();
let editingTaskId = null;

// --- Dashboard ---
function updateDashboard() {
    dashboardTotal.textContent = tasks.length;
    const totalDuration = tasks.reduce((sum, t) => sum + Number(t.duration), 0);
    dashboardDuration.textContent = totalDuration + ' mins';

    const tagCount = {};
    tasks.forEach(t => {
        tagCount[t.tag] = (tagCount[t.tag] || 0) + 1;
    });
    const topTag = Object.keys(tagCount).reduce((a, b) => tagCount[a] > tagCount[b] ? a : b, '-') || '-';
    dashboardTopTag.textContent = topTag;
}

// --- Render Table ---
function renderTasks(filtered = tasks) {
    tableBody.innerHTML = '';
    filtered.forEach(task => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${task.title}</td>
            <td>${task.dueDate}</td>
            <td>${task.duration}</td>
            <td>${task.tag}</td>
            <td>
                <button data-id="${task.id}" class="edit-btn">Edit</button>
                <button data-id="${task.id}" class="delete-btn">Delete</button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

// --- Add/Edit Form ---
form.addEventListener('submit', e => {
    e.preventDefault();

    const taskData = {
        id: editingTaskId || `task_${Date.now()}`,
        title: formTitle.value.trim(),
        dueDate: formDueDate.value.trim(),
        duration: formDuration.value.trim(),
        tag: formTag.value.trim(),
        createdAt: editingTaskId ? tasks.find(t => t.id === editingTaskId).createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    const error = validateTask(taskData);
    if (error) {
        formError.textContent = error;
        return;
    }
    formError.textContent = '';

    if (editingTaskId) {
        tasks = tasks.map(t => t.id === editingTaskId ? taskData : t);
        editingTaskId = null;
    } else {
        tasks.push(taskData);
    }

    saveTasks(tasks);
    renderTasks();
    updateDashboard();
    form.reset();
});

// --- Edit/Delete ---
tableBody.addEventListener('click', e => {
    const id = e.target.dataset.id;
    if (!id) return;

    if (e.target.classList.contains('edit-btn')) {
        const task = tasks.find(t => t.id === id);
        formTitle.value = task.title;
        formDueDate.value = task.dueDate;
        formDuration.value = task.duration;
        formTag.value = task.tag;
        editingTaskId = id;
    }

    if (e.target.classList.contains('delete-btn')) {
        if (confirm('Delete this task?')) {
            tasks = tasks.filter(t => t.id !== id);
            saveTasks(tasks);
            renderTasks();
            updateDashboard();
        }
    }
});

// --- Search ---
searchInput.addEventListener('input', e => {
    const term = e.target.value;
    if (!term) return renderTasks();

    const result = searchManager.searchRecords(tasks, term, { highlight: true });
    renderTasks(result.results.map(t => {
        if (t._highlighted) return { ...t, ...t._highlighted };
        return t;
    }));
});

// --- Import JSON ---
importInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        const res = importTasks(reader.result);
        if (res.success) {
            tasks = loadTasks();
            renderTasks();
            updateDashboard();
            alert('Import successful!');
        } else {
            alert('Import failed: ' + res.error);
        }
    };
    reader.readAsText(file);
});

// --- Export JSON ---
exportBtn.addEventListener('click', () => {
    const data = exportTasks();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'tasks.json';
    a.click();
    URL.revokeObjectURL(url);
});

// --- Initialize ---
renderTasks();
updateDashboard();
