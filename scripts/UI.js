// Campus Life Planner - UI Module
// Responsive interface components and interactions

import { appState } from './state.js';

export class UIManager {
    constructor() {
        this.currentSection = 'dashboard';
        this.editingRecord = null;
        this.sortDirection = 'asc';
        this.currentSortBy = 'dueDate';
        this.isMobile = window.innerWidth <= 768;
        this.currentSearchResults = null; // store search results

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupKeyboardNavigation();
        this.setupResponsiveHandling();
        this.loadInitialData();

        // Listen to state changes
        appState.on('dataChanged', () => {
            this.refreshRecordsView();
            this.updateStats();
        });
        appState.on('recordAdded', () => {
            this.closeModal();
            this.refreshRecordsView();
            this.updateStats();
        });
        appState.on('recordUpdated', () => {
            this.closeModal();
            this.refreshRecordsView();
            this.updateStats();
        });
        appState.on('recordDeleted', () => {
            this.refreshRecordsView();
            this.updateStats();
        });
        appState.on('settingsChanged', () => {
            this.loadSettings();
            this.updateStats();
        });
    }

    setupEventListeners() {
        // Navigation
        document.addEventListener('click', (e) => {
            if (e.target.closest('.nav-link')) {
                e.preventDefault();
                const section = e.target.closest('.nav-link').getAttribute('href').substring(1);
                this.showSection(section);
            }
        });

        // Mobile navigation toggle
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        if (navToggle) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });
        }

        // Record management
        this.setupRecordEventListeners();

        // Search functionality
        this.setupSearchEventListeners();

        // Settings
        this.setupSettingsEventListeners();

        // Import/Export
        this.setupImportExportEventListeners();
    }

    setupRecordEventListeners() {
        // Add record button
        const addRecordBtn = document.getElementById('addRecordBtn');
        if (addRecordBtn) {
            addRecordBtn.addEventListener('click', () => this.openAddRecordModal());
        }

        // Form submission
        const recordForm = document.getElementById('recordForm');
        if (recordForm) {
            recordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRecordSubmit();
            });
        }

        // Modal controls
        const modalClose = document.getElementById('modalClose');
        const cancelRecord = document.getElementById('cancelRecord');
        const modal = document.getElementById('modal');

        if (modalClose) modalClose.addEventListener('click', () => this.closeModal());
        if (cancelRecord) cancelRecord.addEventListener('click', () => this.closeModal());
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeModal();
            });
        }

        // Sorting controls
        const sortBy = document.getElementById('sortBy');
        const sortDirection = document.getElementById('sortDirection');

        if (sortBy) {
            sortBy.addEventListener('change', (e) => {
                this.currentSortBy = e.target.value;
                this.refreshRecordsView();
            });
        }

        if (sortDirection) {
            sortDirection.addEventListener('click', () => {
                this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
                this.updateSortDirectionIcon();
                this.refreshRecordsView();
            });
        }

        // Event delegation for edit/delete/toggle in table/cards
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) return;

            const recordId = target.dataset.id;
            const action = target.dataset.action;

            if (!recordId && action !== 'add') return;

            switch (action) {
                case 'edit':
                    this.editRecord(recordId);
                    break;
                case 'delete':
                    this.deleteRecord(recordId);
                    break;
                case 'toggle':
                    this.toggleRecordStatus(recordId);
                    break;
                case 'add':
                    this.openAddRecordModal();
                    break;
            }
        });
    }

    setupSearchEventListeners() {
        const regexSearch = document.getElementById('regexSearch');
        const caseInsensitive = document.getElementById('caseInsensitive');
        const clearSearch = document.getElementById('clearSearch');

        if (regexSearch) {
            let searchTimeout;
            regexSearch.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => this.performSearch(e.target.value), 300);
            });

            regexSearch.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.performSearch(e.target.value);
                }
            });
        }

        if (caseInsensitive) {
            caseInsensitive.addEventListener('change', () => {
                const searchTerm = regexSearch ? regexSearch.value : '';
                if (searchTerm) this.performSearch(searchTerm);
            });
        }

        if (clearSearch) {
            clearSearch.addEventListener('click', () => {
                if (regexSearch) regexSearch.value = '';
                this.clearSearch();
            });
        }
    }

    performSearch(term) {
        const caseInsensitive = document.getElementById('caseInsensitive')?.checked ?? true;
        this.currentSearchResults = appState.searchRecords(term, caseInsensitive);
        this.refreshRecordsView();
    }

    clearSearch() {
        this.currentSearchResults = null;
        this.refreshRecordsView();
    }

    setupSettingsEventListeners() {
        const saveSettings = document.getElementById('saveSettings');
        const loadSampleData = document.getElementById('loadSampleData');
        const clearAllData = document.getElementById('clearAllData');

        if (saveSettings) saveSettings.addEventListener('click', () => this.saveSettings());
        if (loadSampleData) loadSampleData.addEventListener('click', () => this.loadSampleData());
        if (clearAllData) clearAllData.addEventListener('click', () => this.confirmClearData());
    }

    setupImportExportEventListeners() {
        const exportData = document.getElementById('exportData');
        if (exportData) exportData.addEventListener('click', () => this.exportData());

        this.setupFileImport();
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' && !e.shiftKey && e.target === document.body) {
                const skipLink = document.querySelector('.skip-to-content');
                if (skipLink) skipLink.focus();
            }

            if (e.key === 'Escape') this.closeModal();

            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'f':
                        e.preventDefault();
                        const searchInput = document.getElementById('regexSearch');
                        if (searchInput) searchInput.focus();
                        break;
                    case 'n':
                        e.preventDefault();
                        this.openAddRecordModal();
                        break;
                }
            }
        });

        document.addEventListener('focusin', (e) => {
            const modal = document.getElementById('modal');
            if (modal && modal.style.display !== 'none') {
                const focusable = modal.querySelectorAll('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
                if (!modal.contains(e.target) && focusable.length > 0) focusable[0].focus();
            }
        });
    }

    setupResponsiveHandling() {
        const mediaQuery = window.matchMedia('(max-width: 768px)');
        const handleResponsiveChange = (e) => {
            this.isMobile = e.matches;
            this.refreshRecordsView();
        };
        mediaQuery.addListener(handleResponsiveChange);
        handleResponsiveChange(mediaQuery);
    }

    loadInitialData() {
        this.updateStats();
        this.refreshRecordsView();
        this.loadSettings();
    }

    showSection(sectionId) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) link.classList.add('active');
        });

        document.querySelectorAll('.section').forEach(section => section.classList.remove('active'));
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;
            this.loadSectionData(sectionId);
        }

        const navMenu = document.getElementById('navMenu');
        const navToggle = document.getElementById('navToggle');
        if (navMenu && navToggle) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        }
    }

    loadSectionData(sectionId) {
        switch (sectionId) {
            case 'dashboard':
                this.updateStats();
                this.updateTrendChart();
                break;
            case 'records':
                this.refreshRecordsView();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }

    refreshRecordsView() {
        const records = this.currentSearchResults || appState.getRecords({ sortBy: this.currentSortBy, sortDirection: this.sortDirection });
        if (this.isMobile) this.renderRecordsCards(records);
        else this.renderRecordsTable(records);
        this.updateRecordsCount(records.length);
    }

    // --------------------------
    // Records rendering (table/cards)
    // --------------------------
    renderRecordsTable(records) {
        const tableBody = document.getElementById('recordsTableBody');
        const cardsContainer = document.getElementById('recordsCards');
        if (!tableBody) return;

        const tableContainer = document.querySelector('.table-responsive');
        if (tableContainer) tableContainer.style.display = 'block';
        if (cardsContainer) cardsContainer.style.display = 'none';

        tableBody.innerHTML = '';

        if (records.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="6" class="empty-state">
                <div class="empty-state-content">
                    <i class="fas fa-inbox"></i>
                    <h3>No records found</h3>
                    <p>Add your first record to get started!</p>
                    <button class="btn btn-primary" data-action="add">Add Record</button>
                </div>
            </td>`;
            tableBody.appendChild(row);
            return;
        }

        records.forEach(record => {
            const row = document.createElement('tr');
            const isOverdue = this.isOverdue(record);
            const isCompleted = record.status === 'completed';
            if (isCompleted) row.classList.add('completed');
            if (isOverdue) row.classList.add('overdue');

            row.innerHTML = `
                <td>${record._highlighted?.title || this.escapeHtml(record.title)} ${isOverdue ? '<span class="overdue-badge">Overdue</span>' : ''}</td>
                <td>${this.formatDate(record.dueDate)}</td>
                <td>${record.duration} hr</td>
                <td>${record.tag}</td>
                <td>${record.status}</td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-secondary" data-id="${record.id}" data-action="edit"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger" data-id="${record.id}" data-action="delete"><i class="fas fa-trash"></i></button>
                    <button class="btn btn-sm btn-success" data-id="${record.id}" data-action="toggle"><i class="fas fa-check"></i></button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    renderRecordsCards(records) {
        const cardsContainer = document.getElementById('recordsCards');
        const tableContainer = document.querySelector('.table-responsive');
        if (!cardsContainer) return;

        if (tableContainer) tableContainer.style.display = 'none';
        cardsContainer.style.display = 'grid';
        cardsContainer.innerHTML = '';

        if (records.length === 0) {
            cardsContainer.innerHTML = `<div class="empty-state">
                <i class="fas fa-inbox"></i>
                <h3>No records found</h3>
                <p>Add your first record to get started!</p>
                <button class="btn btn-primary" data-action="add">Add Record</button>
            </div>`;
            return;
        }

        records.forEach(record => {
            const isOverdue = this.isOverdue(record);
            const isCompleted = record.status === 'completed';
            const card = document.createElement('div');
            card.classList.add('card');
            if (isCompleted) card.classList.add('completed');
            if (isOverdue) card.classList.add('overdue');

            card.innerHTML = `
                <h4>${record._highlighted?.title || this.escapeHtml(record.title)}</h4>
                <p><strong>Due:</strong> ${this.formatDate(record.dueDate)}</p>
                <p><strong>Duration:</strong> ${record.duration} hr</p>
                <p><strong>Tag:</strong> ${record.tag}</p>
                <p><strong>Status:</strong> ${record.status}</p>
                <div class="card-actions">
                    <button class="btn btn-sm btn-secondary" data-id="${record.id}" data-action="edit"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-sm btn-danger" data-id="${record.id}" data-action="delete"><i class="fas fa-trash"></i></button>
                    <button class="btn btn-sm btn-success" data-id="${record.id}" data-action="toggle"><i class="fas fa-check"></i></button>
                </div>
            `;
            cardsContainer.appendChild(card);
        });
    }

    updateRecordsCount(count) {
        const countElem = document.getElementById('recordsCount');
        if (countElem) countElem.textContent = count;
    }

    // --------------------------
    // Dashboard statistics
    // --------------------------
    updateStats() {
        const stats = appState.getStats();
        const settings = appState.getSettings();

        this.updateElement('totalRecords', stats.totalRecords);
        this.updateElement('weeklyProgress', `${stats.weeklyProgress}%`);
        this.updateElement('topCategory', stats.topTag || '-');
        this.updateTargetStatus(stats, settings);
    }

    updateTargetStatus(stats, settings) {
        const elem = document.getElementById('targetStatus');
        if (!elem) return;
        if (!settings.weeklyTarget) {
            elem.textContent = 'No weekly target set';
            return;
        }
        const status = stats.weeklyProgress >= 100 ? 'Goal Achieved!' : `${stats.weeklyProgress}% of weekly target`;
        elem.textContent = status;
    }

    updateElement(id, value) {
        const elem = document.getElementById(id);
        if (elem) elem.textContent = value;
    }

    formatDate(date) {
        if (!date) return '-';
        const d = new Date(date);
        return d.toLocaleDateString();
    }

    escapeHtml(text) {
        if (!text) return '';
        return text.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    isOverdue(record) {
        return record.status !== 'completed' && new Date(record.dueDate) < new Date();
    }

    editRecord(recordId) {
        const record = appState.getRecord(recordId);
        if (!record) return;
        this.editingRecord = record;
        this.openAddRecordModal(record);
    }

    deleteRecord(recordId) {
        if (!appState.getRecord(recordId)) return;
        if (confirm('Are you sure you want to delete this record?')) {
            appState.deleteRecord(recordId);
            this.refreshRecordsView();
            this.updateStats();
        }
    }

    toggleRecordStatus(recordId) {
        const record = appState.getRecord(recordId);
        if (!record) return;
        record.status = record.status === 'completed' ? 'pending' : 'completed';
        appState.updateRecord(record);
        this.refreshRecordsView();
        this.updateStats();
    }

    openAddRecordModal(record = null) {
        const modal = document.getElementById('modal');
        const titleInput = document.getElementById('recordTitle');
        if (modal) modal.style.display = 'block';
        if (titleInput && record) titleInput.value = record.title || '';
        this.editingRecord = record;
    }

    closeModal() {
        const modal = document.getElementById('modal');
        if (modal) modal.style.display = 'none';
        this.editingRecord = null;
        const form = document.getElementById('recordForm');
        if (form) form.reset();
    }

    handleRecordSubmit() {
        const titleInput = document.getElementById('recordTitle');
        const dueDateInput = document.getElementById('recordDueDate');
        const durationInput = document.getElementById('recordDuration');
        const tagInput = document.getElementById('recordTag');

        if (!titleInput || !dueDateInput || !durationInput || !tagInput) return;

        const recordData = {
            title: titleInput.value.trim(),
            dueDate: dueDateInput.value,
            duration: parseFloat(durationInput.value),
            tag: tagInput.value.trim(),
            status: 'pending'
        };

        if (this.editingRecord) {
            recordData.id = this.editingRecord.id;
            recordData.status = this.editingRecord.status;
            appState.updateRecord(recordData);
        } else {
            appState.addRecord(recordData);
        }

        this.closeModal();
        this.refreshRecordsView();
        this.updateStats();
    }

    updateSortDirectionIcon() {
        const sortDirBtn = document.getElementById('sortDirection');
        if (sortDirBtn) sortDirBtn.textContent = this.sortDirection === 'asc' ? '↑' : '↓';
    }

    // Placeholder methods
    loadSettings() { /* load user settings */ }
    saveSettings() { /* save settings */ }
    loadSampleData() { appState.loadSampleData(); this.refreshRecordsView(); this.updateStats(); }
    confirmClearData() { if (confirm('Clear all data?')) { appState.clearAllData(); this.refreshRecordsView(); this.updateStats(); } }
    exportData() { appState.exportData(); }
    setupFileImport() { /* file import handling */ }
    updateTrendChart() { /* optional chart rendering */ }
}
