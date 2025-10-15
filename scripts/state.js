export const KEY = 'campus-planner:data';

export function loadState() {
    try {
        return JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch {
        return [];
    }
}

export function saveState(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
}

export let appState = {
    records: loadState(),
    editingId: null,
    unit: 'minutes'
};
