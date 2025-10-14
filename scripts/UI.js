// Campus Life Planner - UI Module
// Responsive interface components and interactions

import { appState } from './state.js';
import { searchManager } from './search.js';
import { Validators } from './validators.js';

export class UIManager {
    constructor() {
        this.currentSection = 'dashboard';
        this.editingRecord = null;
        this.sortDirection = 'asc';
        this.currentSortBy = 'dueDate';
        this.isMobile = window.innerWidth <= 768;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupKeyboardNavigation();
        this.setupResponsiveHandling();
        this.loadInitialData();

        // Listen to state changes
        appState.on('dataChanged', () => this.refreshRecordsView());
        appState.on('recordAdded', () => this.closeModal());
        appState.on('recordUpdated', () => this.closeModal());
    }

    setupEventListeners() {
        // Navigation
        document.addEventListener('click', (e) => {
            if (e.target.matches('.nav-link')) {
                e.preventDefault();
                const section = e.target.getAttribute('href').substring(1);
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
    }

    setupSearchEventListeners() {
        const regexSearch = document.getElementById('regexSearch');
        const caseInsensitive = document.getElementById('caseInsensitive');
        const clearSearch = document.getElementById('clearSearch');
        const searchStatus = document.getElementById('searchStatus');

        if (regexSearch) {
            // Debounced search
            let searchTimeout;
            regexSearch.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.performSearch(e.target.value);
                }, 300);
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
                if (searchTerm) {
                    this.performSearch(searchTerm);
                }
            });
        }

        if (clearSearch) {
            clearSearch.addEventListener('click', () => {
                if (regexSearch) regexSearch.value = '';
                this.clearSearch();
            });
        }
    }

    setupSettingsEventListeners() {
        const saveSettings = document.getElementById('saveSettings');
        const loadSampleData = document.getElementById('loadSampleData');
        const clearAllData = document.getElementById('clearAllData');

        if (saveSettings) {
            saveSettings.addEventListener('click', () => this.saveSettings());
        }

        if (loadSampleData) {
            loadSampleData.addEventListener('click', () => this.loadSampleData());
        }

        if (clearAllData) {
            clearAllData.addEventListener('click', () => this.confirmClearData());
        }
    }

    setupImportExportEventListeners() {
        const exportData = document.getElementById('exportData');

        if (exportData) {
            exportData.addEventListener('click', () => this.exportData());
        }

        // File import handling
        this.setupFileImport();
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Skip to content (accessibility)
            if (e.key === 'Tab' && !e.shiftKey && e.target === document.body) {
                const skipLink = document.querySelector('.skip-to-content');
                if (skipLink) {
                    skipLink.focus();
                }
            }

            // Modal controls
            if (e.key === 'Escape') {
                this.closeModal();
            }

            // Navigation shortcuts
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

        // Focus management for modal
        document.addEventListener('focusin', (e) => {
            const modal = document.getElementById('modal');
            if (modal && modal.style.display !== 'none') {
                const focusableElements = modal.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );

                if (!modal.contains(e.target) && focusableElements.length > 0) {
                    focusableElements[0].focus();
                }
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

    // Section management
    showSection(sectionId) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
                link.classList.add('active');
            }
        });

        // Update sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });

        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionId;

            // Load section-specific data
            this.loadSectionData(sectionId);
        }

        // Close mobile menu
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

    // Records display
    refreshRecordsView() {
        const records = appState.getRecords({
            sortBy: this.currentSortBy,
            sortDirection: this.sortDirection
        });

        if (this.isMobile) {
            this.renderRecordsCards(records);
        } else {
            this.renderRecordsTable(records);
        }

        this.updateRecordsCount(records.length);
    }

    renderRecordsTable(records) {
        const tableBody = document.getElementById('recordsTableBody');
        const cardsContainer = document.getElementById('recordsCards');

        if (!tableBody) return;

        // Show table, hide cards
        const tableContainer = document.querySelector('.table-responsive');
        if (tableContainer) tableContainer.style.display = 'block';
        if (cardsContainer) cardsContainer.style.display = 'none';

        tableBody.innerHTML = '';

        if (records.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="6" class="empty-state">
                    <div class="empty-state-content">
                        <i class="fas fa-inbox" aria-hidden="true"></i>
                        <h3>No records found</h3>
                        <p>Add your first record to get started!</p>
                        <button class="btn btn-primary" onclick="ui.openAddRecordModal()">
                            <i class="fas fa-plus"></i> Add Record
                        </button>
                    </div>
                </td>
            `;
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
                <td>
                    <div class="record-title">
                        ${record._highlighted?.title || this.escapeHtml(record.title)}
                        ${isOverdue ? '<span class="overdue-badge">Overdue</span>' : ''}
                    </div>
                </td>
                <td>
                    <time datetime="${record.dueDate}">
                        ${record._highlighted?.dueDate || this.formatDate(record.dueDate)}
                    </time>
                </td>
                <td>
                    <span class="duration">
                        ${record._highlighted?.duration || appState.formatDuration(record.duration)}
                    </span>
                </td>
                <td>
                    <span class="tag tag-${this.getTagClass(record.tag)}">
                        ${record._highlighted?.tag || this.escapeHtml(record.tag)}
                    </span>
                </td>
                <td>
                    <span class="status status-${record.status}">
                        <i class="fas ${this.getStatusIcon(record.status)}" aria-hidden="true"></i>
                        ${this.capitalizeFirst(record.status)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-secondary" onclick="ui.editRecord('${record.id}')" 
                                title="Edit record" aria-label="Edit ${record.title}">
                            <i class="fas fa-edit" aria-hidden="true"></i>
                        </button>
                        <button class="btn btn-sm ${isCompleted ? 'btn-warning' : 'btn-success'}" 
                                onclick="ui.toggleRecordStatus('${record.id}')"
                                title="${isCompleted ? 'Mark as pending' : 'Mark as completed'}"
                                aria-label="${isCompleted ? 'Mark' : 'Complete'} ${record.title}">
                            <i class="fas ${isCompleted ? 'fa-undo' : 'fa-check'}" aria-hidden="true"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="ui.deleteRecord('${record.id}')"
                                title="Delete record" aria-label="Delete ${record.title}">
                            <i class="fas fa-trash" aria-hidden="true"></i>
                        </button>
                    </div>
                </td>
            `;

            tableBody.appendChild(row);
        });
    }

    renderRecordsCards(records) {
        const cardsContainer = document.getElementById('recordsCards');
        const tableContainer = document.querySelector('.table-responsive');

        if (!cardsContainer) return;

        // Show cards, hide table
        if (tableContainer) tableContainer.style.display = 'none';
        cardsContainer.style.display = 'block';

        cardsContainer.innerHTML = '';

        if (records.length === 0) {
            cardsContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-content">
                        <i class="fas fa-inbox" aria-hidden="true"></i>
                        <h3>No records found</h3>
                        <p>Add your first record to get started!</p>
                        <button class="btn btn-primary" onclick="ui.openAddRecordModal()">
                            <i class="fas fa-plus"></i> Add Record
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        records.forEach(record => {
            const card = document.createElement('div');
            const isOverdue = this.isOverdue(record);
            const isCompleted = record.status === 'completed';

            card.className = `record-card ${isCompleted ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`;

            card.innerHTML = `
                <div class="record-card-header">
                    <h3 class="record-title">
                        ${record._highlighted?.title || this.escapeHtml(record.title)}
                    </h3>
                    <div class="record-actions">
                        <button class="btn btn-sm btn-secondary" onclick="ui.editRecord('${record.id}')"
                                aria-label="Edit ${record.title}">
                            <i class="fas fa-edit" aria-hidden="true"></i>
                        </button>
                        <button class="btn btn-sm ${isCompleted ? 'btn-warning' : 'btn-success'}" 
                                onclick="ui.toggleRecordStatus('${record.id}')"
                                aria-label="${isCompleted ? 'Mark as pending' : 'Mark as completed'} ${record.title}">
                            <i class="fas ${isCompleted ? 'fa-undo' : 'fa-check'}" aria-hidden="true"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="ui.deleteRecord('${record.id}')"
                                aria-label="Delete ${record.title}">
                            <i class="fas fa-trash" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
                
                <div class="record-card-body">
                    <div class="record-info">
                        <div class="info-item">
                            <i class="fas fa-calendar" aria-hidden="true"></i>
                            <span>Due: <time datetime="${record.dueDate}">
                                ${record._highlighted?.dueDate || this.formatDate(record.dueDate)}
                            </time></span>
                            ${isOverdue ? '<span class="overdue-badge">Overdue</span>' : ''}
                        </div>
                        <div class="info-item">
                            <i class="fas fa-clock" aria-hidden="true"></i>
                            <span>Duration: ${record._highlighted?.duration || appState.formatDuration(record.duration)}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-tag" aria-hidden="true"></i>
                            <span class="tag tag-${this.getTagClass(record.tag)}">
                                ${record._highlighted?.tag || this.escapeHtml(record.tag)}
                            </span>
                        </div>
                        <div class="info-item">
                            <i class="fas ${this.getStatusIcon(record.status)}" aria-hidden="true"></i>
                            <span class="status status-${record.status}">
                                ${this.capitalizeFirst(record.status)}
                            </span>
                        </div>
                    </div>
                </div>
            `;

            cardsContainer.appendChild(card);
        });
    }

    // Modal management
    openAddRecordModal() {
        this.editingRecord = null;
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('recordForm');

        if (modal && modalTitle && form) {
            modalTitle.textContent = 'Add Record';
            form.reset();

            // Set default values
            const settings = appState.getSettings();
            const defaultTagInput = document.getElementById('recordTag');
            if (defaultTagInput && settings.defaultTag) {
                defaultTagInput.value = settings.defaultTag;
            }

            // Set default due date to tomorrow
            const dueDateInput = document.getElementById('recordDueDate');
            if (dueDateInput) {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                dueDateInput.value = tomorrow.toISOString().split('T')[0];
            }

            this.showModal();
        }
    }

    editRecord(recordId) {
        const record = appState.getRecord(recordId);
        if (!record) return;

        this.editingRecord = record;
        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('recordForm');

        if (modal && modalTitle && form) {
            modalTitle.textContent = 'Edit Record';

            // Populate form
            document.getElementById('recordTitle').value = record.title;
            document.getElementById('recordDueDate').value = record.dueDate;
            document.getElementById('recordDuration').value = record.duration;
            document.getElementById('recordTag').value = record.tag;

            this.showModal();
        }
    }

    showModal() {
        const modal = document.getElementById('modal');
        if (modal) {
            modal.style.display = 'flex';
            document.body.classList.add('modal-open');

            // Focus first input
            const firstInput = modal.querySelector('input, select, textarea');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }

            // Announce modal to screen readers
            this.announceToScreenReader('Modal opened');
        }
    }

    closeModal() {
        const modal = document.getElementById('modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
            this.editingRecord = null;
            this.clearFormErrors();

            // Announce to screen readers
            this.announceToScreenReader('Modal closed');
        }
    }

    handleRecordSubmit() {
        const form = document.getElementById('recordForm');
        if (!form) return;

        const formData = new FormData(form);
        const recordData = {
            title: formData.get('title'),
            dueDate: formData.get('dueDate'),
            duration: parseFloat(formData.get('duration')),
            tag: formData.get('tag')
        };

        // Clear previous errors
        this.clearFormErrors();

        try {
            if (this.editingRecord) {
                appState.updateRecord(this.editingRecord.id, recordData);
                this.showSuccessMessage('Record updated successfully');
            } else {
                appState.addRecord(recordData);
                this.showSuccessMessage('Record added successfully');
            }
        } catch (error) {
            this.handleFormErrors(error.message);
        }
    }

    clearFormErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });

        const inputs = document.querySelectorAll('.form-input');
        inputs.forEach(input => input.classList.remove('error'));
    }

    handleFormErrors(errorMessage) {
        try {
            const errors = JSON.parse(errorMessage.replace('Validation failed: ', ''));

            Object.keys(errors).forEach(field => {
                const errorElement = document.getElementById(`${field}Error`);
                const inputElement = document.getElementById(`record${this.capitalizeFirst(field)}`);

                if (errorElement && inputElement) {
                    errorElement.textContent = errors[field];
                    errorElement.style.display = 'block';
                    inputElement.classList.add('error');
                }
            });

            // Announce errors to screen readers
            this.announceToScreenReader('Form contains errors. Please check and correct the highlighted fields.');
        } catch {
            // If not JSON, show general error
            this.showErrorMessage(errorMessage);
        }
    }

    // Record actions
    toggleRecordStatus(recordId) {
        const record = appState.getRecord(recordId);
        if (record) {
            const newStatus = record.status === 'completed' ? 'pending' : 'completed';
            appState.updateRecord(recordId, { status: newStatus });

            const action = newStatus === 'completed' ? 'completed' : 'marked as pending';
            this.announceToScreenReader(`Record ${action}`);
        }
    }

    deleteRecord(recordId) {
        const record = appState.getRecord(recordId);
        if (!record) return;

        if (confirm(`Are you sure you want to delete "${record.title}"? This action cannot be undone.`)) {
            appState.deleteRecord(recordId);
            this.showSuccessMessage('Record deleted successfully');
            this.announceToScreenReader('Record deleted');
        }
    }

    // Search functionality
    performSearch(searchTerm) {
        const caseInsensitive = document.getElementById('caseInsensitive');
        const searchStatus = document.getElementById('searchStatus');

        appState.setFilters({
            search: searchTerm,
            caseInsensitive: caseInsensitive ? caseInsensitive.checked : true
        });

        const records = appState.getRecords();

        // Update search status
        if (searchStatus) {
            if (searchTerm) {
                const error = searchManager.getSearchError();
                if (error) {
                    searchStatus.innerHTML = `<span class="error">Search error: ${error}</span>`;
                    searchStatus.setAttribute('role', 'alert');
                } else {
                    searchStatus.innerHTML = `Found ${records.length} matching records`;
                    searchStatus.setAttribute('role', 'status');
                }
            } else {
                searchStatus.innerHTML = '';
                searchStatus.removeAttribute('role');
            }
        }

        this.refreshRecordsView();
    }

    clearSearch() {
        appState.setFilters({ search: '' });
        const searchStatus = document.getElementById('searchStatus');
        if (searchStatus) {
            searchStatus.innerHTML = '';
            searchStatus.removeAttribute('role');
        }
        this.refreshRecordsView();
    }

    // Statistics and dashboard
    updateStats() {
        const stats = appState.getStats();
        const settings = appState.getSettings();

        // Update basic stats
        this.updateElement('totalRecords', stats.totalRecords);
        this.updateElement('totalDuration', appState.formatDuration(stats.totalDuration));
        this.updateElement('topCategory', stats.topTag);
        this.updateElement('weeklyProgress', `${stats.weeklyProgress}%`);

        // Update target status with ARIA live region
        this.updateTargetStatus(stats, settings);
    }

    updateTargetStatus(stats, settings) {
        const targetStatus = document.getElementById('targetStatus');
        if (!targetStatus || !settings.weeklyTarget) return;

        const { weeklyDuration, weeklyProgress } = stats;
        const remaining = settings.weeklyTarget - weeklyDuration;

        let message = '';
        let ariaLevel = 'polite';

        if (remaining > 0) {
            message = `${appState.formatDuration(remaining)} remaining to reach weekly target`;
        } else if (remaining === 0) {
            message = 'Weekly target achieved!';
        } else {
            message = `Weekly target exceeded by ${appState.formatDuration(Math.abs(remaining))}`;
            ariaLevel = 'assertive';
        }

        targetStatus.textContent = message;
        targetStatus.setAttribute('aria-live', ariaLevel);
    }

    updateTrendChart() {
        const chartContainer = document.getElementById('trendChart');
        if (!chartContainer) return;

        const stats = appState.getStats();
        const trendData = stats.last7Days;

        chartContainer.innerHTML = '';

        // Create simple CSS bar chart
        const maxDuration = Math.max(...trendData.map(d => d.duration), 1);

        trendData.forEach((day, index) => {
            const bar = document.createElement('div');
            bar.className = 'chart-bar';

            const height = (day.duration / maxDuration) * 100;
            bar.style.height = `${height}%`;

            const label = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
            bar.setAttribute('title', `${label}: ${appState.formatDuration(day.duration)} (${day.count} tasks)`);
            bar.setAttribute('aria-label', `${label}: ${appState.formatDuration(day.duration)}, ${day.count} tasks`);

            bar.innerHTML = `
                <div class="chart-bar-fill" style="height: ${height}%"></div>
                <div class="chart-bar-label">${label}</div>
            `;

            chartContainer.appendChild(bar);
        });
    }

    // Settings management
    loadSettings() {
        const settings = appState.getSettings();

        // Load target settings
        this.updateElement('weeklyTarget', settings.weeklyTarget, 'value');
        this.updateElement('dailyTarget', settings.dailyTarget, 'value');
        this.updateElement('defaultTag', settings.defaultTag, 'value');

        // Load theme
        this.updateElement('darkModeToggle', settings.theme === 'dark', 'checked');
        document.documentElement.setAttribute('data-theme', settings.theme);

        // Load notifications
        this.updateElement('dueSoonAlerts', settings.notifications.dueSoon, 'checked');
        this.updateElement('targetAlerts', settings.notifications.targetExceeded, 'checked');
    }

    saveSettings() {
        const settings = {
            weeklyTarget: parseFloat(document.getElementById('weeklyTarget').value) || 25,
            dailyTarget: parseFloat(document.getElementById('dailyTarget').value) || 4,
            defaultTag: document.getElementById('defaultTag').value || 'General',
            theme: document.getElementById('darkModeToggle').checked ? 'dark' : 'light',
            notifications: {
                dueSoon: document.getElementById('dueSoonAlerts').checked,
                targetExceeded: document.getElementById('targetAlerts').checked
            }
        };

        try {
            appState.updateSettings(settings);
            document.documentElement.setAttribute('data-theme', settings.theme);
            this.showSuccessMessage('Settings saved successfully');
            this.updateStats(); // Refresh stats with new targets
        } catch (error) {
            this.showErrorMessage('Failed to save settings: ' + error.message);
        }
    }

    // Import/Export functionality
    exportData() {
        try {
            const data = appState.exportData();
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `campus-planner-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showSuccessMessage('Data exported successfully');
        } catch (error) {
            this.showErrorMessage('Export failed: ' + error.message);
        }
    }

    setupFileImport() {
        // Create hidden file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.style.display = 'none';
        document.body.appendChild(fileInput);

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const result = appState.importData(e.target.result);
                        this.showSuccessMessage(`Import successful: ${result.imported} records imported`);
                        this.refreshRecordsView();
                        this.updateStats();
                    } catch (error) {
                        this.showErrorMessage('Import failed: ' + error.message);
                    }
                };
                reader.readAsText(file);
            }
        });

        // Add import button if it doesn't exist
        const exportBtn = document.getElementById('exportData');
        if (exportBtn && !document.getElementById('importData')) {
            const importBtn = document.createElement('button');
            importBtn.id = 'importData';
            importBtn.className = 'btn btn-secondary';
            importBtn.innerHTML = '<i class="fas fa-download"></i> Import Data';
            importBtn.addEventListener('click', () => fileInput.click());
            exportBtn.parentNode.insertBefore(importBtn, exportBtn);
        }
    }

    loadSampleData() {
        if (confirm('This will replace all existing data with sample records. Continue?')) {
            // Load from seed.json
            fetch('./seed.json')
                .then(response => response.json())
                .then(data => {
                    const result = appState.importData(JSON.stringify(data));
                    this.showSuccessMessage(`Sample data loaded: ${result.imported} records`);
                    this.refreshRecordsView();
                    this.updateStats();
                })
                .catch(error => {
                    this.showErrorMessage('Failed to load sample data: ' + error.message);
                });
        }
    }

    confirmClearData() {
        if (confirm('Are you sure you want to delete ALL data? This action cannot be undone.')) {
            if (confirm('This will permanently delete all records and settings. Type "DELETE" to confirm.')) {
                appState.clearAllData();
                this.showSuccessMessage('All data cleared successfully');
                this.refreshRecordsView();
                this.updateStats();
                this.loadSettings();
            }
        }
    }

    // Utility methods
    updateElement(id, value, property = 'textContent') {
        const element = document.getElementById(id);
        if (element) {
            element[property] = value;
        }
    }

    updateRecordsCount(count) {
        const countElement = document.querySelector('.records-count');
        if (countElement) {
            countElement.textContent = `${count} records`;
        }
    }

    updateSortDirectionIcon() {
        const sortBtn = document.getElementById('sortDirection');
        if (sortBtn) {
            const icon = sortBtn.querySelector('i');
            if (icon) {
                icon.className = this.sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
            }
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const diffTime = date.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Tomorrow';
        if (diffDays === -1) return 'Yesterday';
        if (diffDays > 0 && diffDays <= 7) return `In ${diffDays} days`;
        if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} days ago`;

        return date.toLocaleDateString();
    }

    isOverdue(record) {
        if (record.status === 'completed') return false;
        const today = new Date();
        const dueDate = new Date(record.dueDate);
        return dueDate < today;
    }

    getTagClass(tag) {
        // Convert tag to a CSS-friendly class name
        return tag.toLowerCase().replace(/[^a-z0-9]/g, '');
    }

    getStatusIcon(status) {
        const icons = {
            pending: 'fa-clock',
            completed: 'fa-check-circle',
            overdue: 'fa-exclamation-triangle'
        };
        return icons[status] || 'fa-question';
    }

    capitalizeFirst(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Accessibility helpers
    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.position = 'absolute';
        announcement.style.left = '-10000px';
        announcement.textContent = message;

        document.body.appendChild(announcement);

        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    showSuccessMessage(message) {
        this.showMessage(message, 'success');
    }

    showErrorMessage(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type = 'info') {
        // Create or get message container
        let messageContainer = document.getElementById('messageContainer');
        if (!messageContainer) {
            messageContainer = document.createElement('div');
            messageContainer.id = 'messageContainer';
            messageContainer.className = 'message-container';
            messageContainer.setAttribute('aria-live', 'polite');
            document.body.appendChild(messageContainer);
        }

        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check' : 'fa-exclamation-triangle'}" aria-hidden="true"></i>
            <span>${message}</span>
            <button class="message-close" aria-label="Close message">
                <i class="fas fa-times" aria-hidden="true"></i>
            </button>
        `;

        // Add close functionality
        messageEl.querySelector('.message-close').addEventListener('click', () => {
            messageEl.remove();
        });

        messageContainer.appendChild(messageEl);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageEl.parentNode) {
                messageEl.remove();
            }
        }, 5000);

        // Announce to screen readers
        this.announceToScreenReader(message);
    }
}

// Create and export singleton instance
export const ui = new UIManager();

// Make UI available globally for onclick handlers
window.ui = ui;