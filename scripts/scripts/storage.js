const STORAGE_KEY = 'campus:tasks';

// Load tasks from localStorage
export function loadTasks() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (err) {
        console.error('Error loading tasks:', err);
        return [];
    }
}

// Save tasks to localStorage
export function saveTasks(tasks) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (err) {
        console.error('Error saving tasks:', err);
    }
}

// Import JSON (validate structure before saving)
export function importTasks(jsonString) {
    try {
        const data = JSON.parse(jsonString);
        if (!Array.isArray(data)) throw new Error('Invalid JSON: must be an array');
        const valid = data.every(validateStructure);
        if (!valid) throw new Error('Invalid JSON: some records are malformed');
        saveTasks(data);
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
}

// Export JSON string
export function exportTasks() {
    const tasks = loadTasks();
    return JSON.stringify(tasks, null, 2);
}

// Validate structure of a task (minimal check)
function validateStructure(task) {
    return task.id && task.title && task.dueDate && task.duration && task.tag;
}
