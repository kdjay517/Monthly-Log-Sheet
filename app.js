// Application Data
const projectData = [
    { projectId: "IN-1100-NA", subCode: "0010", projectTitle: "General Overhead" },
    { projectId: "WV-1112-4152", subCode: "0210", projectTitle: "AS_Strategy" },
    { projectId: "WV-1112-4152", subCode: "1010", projectTitle: "AS_Strategy" },
    { projectId: "WV-1112-4152", subCode: "1020", projectTitle: "AS_Strategy" },
    { projectId: "RW-1173-9573P00303", subCode: "0010", projectTitle: "RW Tracking" },
    { projectId: "WV-1137-D75B1-C4285-08-03", subCode: "1250", projectTitle: "MERCIA_INSIGNIA_ElectronicController_Mil" },
    { projectId: "WV-1116-4306", subCode: "0020", projectTitle: "SensorLess_Controller_Demo" }
];

const entryTypes = {
    work: { label: "Work Entry", color: "#3b82f6", maxHours: 8 },
    fullLeave: { label: "Full Day Leave", color: "#ef4444", maxHours: 8 },
    halfLeave: { label: "Half Day Leave", color: "#f97316", maxHours: 4 },
    holiday: { label: "Holiday", color: "#22c55e", maxHours: 8 }
};

const halfDayPeriods = {
    morning: { label: "Morning (8:00 AM - 12:00 PM)", hours: 4 },
    afternoon: { label: "Afternoon (1:00 PM - 5:00 PM)", hours: 4 }
};

// Monthly Work Log Tracker Class
class MonthlyWorkLogTracker {
    constructor() {
        this.currentUser = null;
        this.isGuestMode = false;
        this.currentDate = new Date();
        this.selectedDate = null;
        this.editingEntry = null;
        this.workLogData = {};
        this.chartInstance = null;
        this.syncStatus = 'local';
        
        this.elements = this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        return {
            // Auth elements
            authContainer: document.getElementById('authContainer'),
            appContainer: document.getElementById('appContainer'),
            authTabs: document.querySelectorAll('.auth-tab'),
            loginForm: document.getElementById('loginForm'),
            registerForm: document.getElementById('registerForm'),
            guestForm: document.getElementById('guestForm'),
            guestModeBtn: document.getElementById('guestModeBtn'),
            authErrors: document.getElementById('authErrors'),
            
            // App elements
            syncStatus: document.getElementById('syncStatus'),
            userProfile: document.getElementById('userProfile'),
            logoutBtn: document.getElementById('logoutBtn'),
            calendarGrid: document.getElementById('calendarGrid'),
            currentMonth: document.getElementById('currentMonth'),
            monthSelector: document.getElementById('monthSelector'),
            yearSelector: document.getElementById('yearSelector'),
            prevMonthBtn: document.getElementById('prevMonthBtn'),
            nextMonthBtn: document.getElementById('nextMonthBtn'),
            
            // Entry form elements
            selectedDateDisplay: document.getElementById('selectedDateDisplay'),
            totalHours: document.getElementById('totalHours'),
            validationWarning: document.getElementById('validationWarning'),
            entryForm: document.getElementById('entryForm'),
            formTitle: document.getElementById('formTitle'),
            entryType: document.getElementById('entryType'),
            projectGroup: document.getElementById('projectGroup'),
            project: document.getElementById('project'),
            hoursGroup: document.getElementById('hoursGroup'),
            hours: document.getElementById('hours'),
            halfDayPeriodGroup: document.getElementById('halfDayPeriodGroup'),
            halfDayPeriod: document.getElementById('halfDayPeriod'),
            comments: document.getElementById('comments'),
            addEntryBtn: document.getElementById('addEntryBtn'),
            cancelEntryBtn: document.getElementById('cancelEntryBtn'),
            formErrors: document.getElementById('formErrors'),
            entriesList: document.getElementById('entriesList'),
            
            // Statistics elements
            statsDashboard: document.getElementById('statsDashboard'),
            totalWorkHours: document.getElementById('totalWorkHours'),
            workDays: document.getElementById('workDays'),
            leaveDays: document.getElementById('leaveDays'),
            holidays: document.getElementById('holidays'),
            projectChart: document.getElementById('projectChart'),
            
            // Other elements
            exportBtn: document.getElementById('exportBtn'),
            statsBtn: document.getElementById('statsBtn'),
            toast: document.getElementById('toast'),
            toastMessage: document.getElementById('toastMessage'),
            confirmModal: document.getElementById('confirmModal'),
            confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
            cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
            statsModal: document.getElementById('statsModal'),
            closeStatsBtn: document.getElementById('closeStatsBtn'),
            statsModalContent: document.getElementById('statsModalContent')
        };
    }

    setupEventListeners() {
        // Auth event listeners
        this.elements.authTabs.forEach(tab => {
            tab.addEventListener('click', (e) => this.handleAuthTabChange(e));
        });
        
        this.elements.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        this.elements.registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        this.elements.guestModeBtn.addEventListener('click', () => this.setupGuestMode());
        this.elements.logoutBtn.addEventListener('click', () => this.logout());
        
        // Calendar navigation
        this.elements.prevMonthBtn.addEventListener('click', () => this.navigateToMonth(-1));
        this.elements.nextMonthBtn.addEventListener('click', () => this.navigateToMonth(1));
        this.elements.monthSelector.addEventListener('change', () => this.handleMonthSelectorChange());
        this.elements.yearSelector.addEventListener('change', () => this.handleYearSelectorChange());
        
        // Entry form
        this.elements.entryType.addEventListener('change', () => this.handleEntryTypeChange());
        this.elements.addEntryBtn.addEventListener('click', () => this.handleAddEntry());
        this.elements.cancelEntryBtn.addEventListener('click', () => this.cancelEdit());
        this.elements.hours.addEventListener('input', () => this.validateHours());
        
        // Other buttons
        this.elements.exportBtn.addEventListener('click', () => this.exportMonthData());
        this.elements.statsBtn.addEventListener('click', () => this.showStatsModal());
        this.elements.closeStatsBtn.addEventListener('click', () => this.hideStatsModal());
        this.elements.confirmDeleteBtn.addEventListener('click', () => this.confirmDelete());
        this.elements.cancelDeleteBtn.addEventListener('click', () => this.cancelDelete());
    }

    // Authentication Methods
    handleAuthTabChange(e) {
        const targetTab = e.target.dataset.tab;
        
        // Update tab styling
        this.elements.authTabs.forEach(tab => tab.classList.remove('active'));
        e.target.classList.add('active');
        
        // Show/hide forms
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('registerForm').classList.add('hidden');
        document.getElementById('guestForm').classList.add('hidden');
        
        document.getElementById(`${targetTab}Form`).classList.remove('hidden');
        this.hideAuthErrors();
    }

    async handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            // Simulate Firebase authentication
            await this.simulateFirebaseAuth(email, password, 'login');
            this.showMainApp();
            this.showToast('Login successful!', 'success');
        } catch (error) {
            this.showAuthErrors(['Login failed: ' + error.message]);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const employeeId = document.getElementById('registerEmployeeId').value;
        const password = document.getElementById('registerPassword').value;
        
        try {
            // Simulate Firebase authentication
            await this.simulateFirebaseAuth(email, password, 'register', { name, employeeId });
            this.showMainApp();
            this.showToast('Registration successful!', 'success');
        } catch (error) {
            this.showAuthErrors(['Registration failed: ' + error.message]);
        }
    }

    async simulateFirebaseAuth(email, password, type, userData = {}) {
        // Simulate authentication delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (type === 'register') {
            this.currentUser = {
                uid: this.generateId(),
                email: email,
                displayName: userData.name,
                employeeId: userData.employeeId
            };
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        } else {
            // Try to load existing user from localStorage
            const savedUser = localStorage.getItem('currentUser');
            if (savedUser) {
                this.currentUser = JSON.parse(savedUser);
            } else {
                // Create a demo user for login simulation
                this.currentUser = {
                    uid: this.generateId(),
                    email: email,
                    displayName: email.split('@')[0],
                    employeeId: 'EMP' + Math.floor(Math.random() * 1000)
                };
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            }
        }
        
        this.syncStatus = 'cloud';
        this.isGuestMode = false;
    }

    setupGuestMode() {
        this.isGuestMode = true;
        this.currentUser = {
            uid: 'guest',
            displayName: 'Guest User',
            employeeId: 'LOCAL'
        };
        this.syncStatus = 'local';
        this.showMainApp();
        this.showToast('Guest mode activated', 'success');
    }

    logout() {
        if (confirm('Are you sure you want to logout? Unsaved changes will be lost.')) {
            this.currentUser = null;
            this.isGuestMode = false;
            this.workLogData = {};
            if (!this.isGuestMode) {
                localStorage.removeItem('currentUser');
            }
            this.showAuthScreen();
            this.showToast('Logged out successfully', 'success');
        }
    }

    showMainApp() {
        this.elements.authContainer.classList.add('hidden');
        this.elements.appContainer.classList.remove('hidden');
        this.updateUserProfile();
        this.updateSyncStatus();
        this._loadAllMonthlyData();
        this.populateProjectDropdown();
        this.populateYearSelector();
        this.updateMonthSelector();
        this.renderCalendar();
        this.selectDate(new Date());
        this.updateMonthlyStats();
    }

    showAuthScreen() {
        this.elements.authContainer.classList.remove('hidden');
        this.elements.appContainer.classList.add('hidden');
    }

    updateUserProfile() {
        if (this.currentUser) {
            this.elements.userProfile.querySelector('.user-name').textContent = this.currentUser.displayName;
            this.elements.userProfile.querySelector('.user-id').textContent = this.currentUser.employeeId;
        }
    }

    updateSyncStatus() {
        const indicator = this.elements.syncStatus.querySelector('.sync-indicator');
        const text = this.elements.syncStatus.querySelector('.sync-text');
        
        indicator.className = 'sync-indicator';
        
        if (this.syncStatus === 'cloud') {
            indicator.classList.add('syncing');
            text.textContent = 'Cloud Sync';
        } else if (this.syncStatus === 'local') {
            indicator.classList.add('offline');
            text.textContent = 'Local Storage';
        } else {
            text.textContent = 'Offline';
        }
    }

    showAuthErrors(errors) {
        this.elements.authErrors.innerHTML = errors.join('<br>');
        this.elements.authErrors.classList.add('show');
    }

    hideAuthErrors() {
        this.elements.authErrors.classList.remove('show');
    }

    // Data Management Methods
    _loadAllMonthlyData() {
        const storageKey = this.isGuestMode ? 'guestWorkLogData' : `workLogData_${this.currentUser.uid}`;
        const saved = localStorage.getItem(storageKey);
        
        if (saved) {
            try {
                this.workLogData = JSON.parse(saved);
            } catch (e) {
                this.workLogData = {};
            }
        } else {
            this.workLogData = {};
        }
    }

    _saveAllMonthlyData() {
        const storageKey = this.isGuestMode ? 'guestWorkLogData' : `workLogData_${this.currentUser.uid}`;
        localStorage.setItem(storageKey, JSON.stringify(this.workLogData));
        
        if (!this.isGuestMode) {
            this._syncCurrentMonthToCloud();
        }
    }

    async _syncCurrentMonthToCloud() {
        if (this.isGuestMode) return;
        
        // Simulate cloud sync
        this.syncStatus = 'syncing';
        this.updateSyncStatus();
        
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.syncStatus = 'cloud';
            this.updateSyncStatus();
        } catch (error) {
            this.syncStatus = 'error';
            this.updateSyncStatus();
            this.showToast('Sync failed', 'error');
        }
    }

    // Navigation Methods
    navigateToMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.updateMonthSelector();
        this.renderCalendar();
        this.updateMonthlyStats();
    }

    handleMonthSelectorChange() {
        const selectedMonth = parseInt(this.elements.monthSelector.value);
        this.currentDate.setMonth(selectedMonth);
        this.renderCalendar();
        this.updateMonthlyStats();
    }

    handleYearSelectorChange() {
        const selectedYear = parseInt(this.elements.yearSelector.value);
        this.currentDate.setFullYear(selectedYear);
        this.renderCalendar();
        this.updateMonthlyStats();
    }

    updateMonthSelector() {
        this.elements.monthSelector.value = this.currentDate.getMonth();
        this.elements.yearSelector.value = this.currentDate.getFullYear();
        
        this.elements.currentMonth.textContent = new Intl.DateTimeFormat('en-US', {
            month: 'long',
            year: 'numeric'
        }).format(this.currentDate);
    }

    populateYearSelector() {
        const currentYear = new Date().getFullYear();
        this.elements.yearSelector.innerHTML = '';
        
        for (let year = currentYear - 5; year <= currentYear + 5; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            if (year === currentYear) option.selected = true;
            this.elements.yearSelector.appendChild(option);
        }
    }

    handleDaySelection(date) {
        this.selectDate(date);
    }

    selectDate(date) {
        this.selectedDate = new Date(date);
        this.renderCalendar();
        this.updateSelectedDateDisplay();
        this.showEntryForm();
        this.renderDailyLogs();
        this.updateDailyStats();
    }

    // Calendar Rendering
    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Clear existing calendar days
        const existingDays = this.elements.calendarGrid.querySelectorAll('.calendar-day');
        existingDays.forEach(day => day.remove());
        
        // Get first day of month and number of days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        // Generate calendar days
        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const dayElement = this.createCalendarDay(date, month);
            this.elements.calendarGrid.appendChild(dayElement);
        }
    }

    createCalendarDay(date, currentMonth) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        const dateKey = this.formatDateKey(date);
        const isCurrentMonth = date.getMonth() === currentMonth;
        const isToday = this.isDateToday(date);
        const isSelected = this.selectedDate && this.formatDateKey(this.selectedDate) === dateKey;
        const entries = this.workLogData[dateKey] || [];
        const hasEntries = entries.length > 0;
        
        // Create day number element
        const dayNumber = document.createElement('div');
        dayNumber.className = 'calendar-day-number';
        dayNumber.textContent = date.getDate();
        dayElement.appendChild(dayNumber);
        
        // Add hours indicator if has entries
        if (hasEntries) {
            const totalHours = this.calculateDayTotalHours(entries);
            const hoursElement = document.createElement('div');
            hoursElement.className = 'calendar-day-hours';
            hoursElement.textContent = `${totalHours}h`;
            dayElement.appendChild(hoursElement);
        }
        
        // Apply styling classes
        if (!isCurrentMonth) {
            dayElement.classList.add('other-month');
        }
        
        if (isToday) {
            dayElement.classList.add('today');
        }
        
        if (isSelected) {
            dayElement.classList.add('selected');
        }
        
        if (hasEntries) {
            dayElement.classList.add('has-entries');
            // Add entry type indicators
            const entryTypes = this.getEntryTypesForDate(dateKey);
            entryTypes.forEach(type => {
                dayElement.classList.add(`has-${type}`);
            });
        }
        
        dayElement.addEventListener('click', () => this.selectDate(date));
        
        return dayElement;
    }

    // Entry Management Methods
    populateProjectDropdown() {
        this.elements.project.innerHTML = '<option value="">Select project...</option>';
        
        projectData.forEach(proj => {
            const option = document.createElement('option');
            option.value = `${proj.projectId}-${proj.subCode}`;
            option.textContent = `${proj.projectId} (${proj.subCode}) - ${proj.projectTitle}`;
            this.elements.project.appendChild(option);
        });
    }

    handleEntryTypeChange() {
        const type = this.elements.entryType.value;
        
        // Reset form fields
        this.resetFormFields();
        
        // Show/hide fields based on entry type
        this.elements.projectGroup.style.display = type === 'work' ? 'block' : 'none';
        this.elements.hoursGroup.style.display = ['work'].includes(type) ? 'block' : 'none';
        this.elements.halfDayPeriodGroup.style.display = type === 'halfLeave' ? 'block' : 'none';
        
        // Set default values and constraints
        if (type === 'halfLeave') {
            this.elements.hours.value = '4';
            this.elements.hours.readOnly = true;
        } else if (type === 'fullLeave' || type === 'holiday') {
            this.elements.hours.value = '8';
            this.elements.hours.readOnly = true;
            this.elements.hoursGroup.style.display = 'none';
        } else if (type === 'work') {
            this.elements.hours.readOnly = false;
            this.elements.hours.value = '';
            this.elements.hours.max = '8';
            this.elements.hours.min = '0.5';
        }
    }

    resetFormFields() {
        this.elements.project.value = '';
        this.elements.hours.value = '';
        this.elements.halfDayPeriod.value = '';
        this.elements.comments.value = '';
        this.hideFormErrors();
    }

    handleAddEntry() {
        const entryData = this.gatherFormData();
        
        if (!this.validateEntry(entryData)) {
            return;
        }
        
        const dateKey = this.formatDateKey(this.selectedDate);
        
        if (!this.workLogData[dateKey]) {
            this.workLogData[dateKey] = [];
        }
        
        if (this.editingEntry) {
            // Update existing entry
            this.updateEntry(dateKey, entryData);
        } else {
            // Add new entry
            this.addProjectEntry(dateKey, entryData);
        }
        
        this._saveAllMonthlyData();
        this.renderCalendar();
        this.renderDailyLogs();
        this.updateDailyStats();
        this.updateMonthlyStats();
        this.resetForm();
    }

    addProjectEntry(dateKey, entryData) {
        entryData.id = this.generateId();
        entryData.timestamp = new Date().toISOString();
        this.workLogData[dateKey].push(entryData);
        this.showToast('Entry added successfully', 'success');
    }

    updateEntry(dateKey, entryData) {
        const index = this.workLogData[dateKey].findIndex(entry => entry.id === this.editingEntry.id);
        if (index !== -1) {
            this.workLogData[dateKey][index] = { 
                ...entryData, 
                id: this.editingEntry.id,
                timestamp: this.editingEntry.timestamp,
                updatedAt: new Date().toISOString()
            };
        }
        this.showToast('Entry updated successfully', 'success');
        this.cancelEdit();
    }

    addSpecialEntry(type, period = null) {
        const dateKey = this.formatDateKey(this.selectedDate);
        
        if (!this.workLogData[dateKey]) {
            this.workLogData[dateKey] = [];
        }
        
        const entryData = {
            id: this.generateId(),
            type: type,
            hours: type === 'halfLeave' ? 4 : 8,
            halfDayPeriod: period,
            comments: '',
            timestamp: new Date().toISOString()
        };
        
        this.workLogData[dateKey].push(entryData);
        this._saveAllMonthlyData();
        this.renderCalendar();
        this.renderDailyLogs();
        this.updateDailyStats();
        this.updateMonthlyStats();
    }

    gatherFormData() {
        return {
            type: this.elements.entryType.value,
            project: this.elements.project.value,
            hours: parseFloat(this.elements.hours.value) || 0,
            halfDayPeriod: this.elements.halfDayPeriod.value,
            comments: this.elements.comments.value.trim()
        };
    }

    validateEntry(entryData) {
        const errors = [];
        
        if (!entryData.type) {
            errors.push('Entry type is required');
        }
        
        if (entryData.type === 'work') {
            if (!entryData.project) {
                errors.push('Project selection is required for work entries');
            }
            if (!entryData.hours || entryData.hours <= 0) {
                errors.push('Hours must be greater than 0 for work entries');
            }
            if (entryData.hours > 8) {
                errors.push('Work hours cannot exceed 8 hours per day');
            }
        }
        
        if (entryData.type === 'halfLeave' && !entryData.halfDayPeriod) {
            errors.push('Time period is required for half-day leave');
        }
        
        // Validate daily hour limits
        if (!this.validateDailyHours(entryData)) {
            errors.push('Total daily hours cannot exceed 8 hours');
        }
        
        // Check for conflicting entries
        if (!this.validateConflicts(entryData)) {
            errors.push('This entry conflicts with existing entries');
        }
        
        if (errors.length > 0) {
            this.showFormErrors(errors);
            return false;
        }
        
        return true;
    }

    validateDailyHours(newEntry) {
        const dateKey = this.formatDateKey(this.selectedDate);
        const existingEntries = this.workLogData[dateKey] || [];
        
        let totalHours = 0;
        
        // Calculate existing hours (excluding the entry being edited)
        existingEntries.forEach(entry => {
            if (!this.editingEntry || entry.id !== this.editingEntry.id) {
                totalHours += this.getEntryHours(entry);
            }
        });
        
        // Add new entry hours
        totalHours += this.getEntryHours(newEntry);
        
        return totalHours <= 8;
    }

    validateConflicts(newEntry) {
        const dateKey = this.formatDateKey(this.selectedDate);
        const existingEntries = this.workLogData[dateKey] || [];
        
        // Check for full day conflicts
        const hasFullDayEntry = existingEntries.some(entry => 
            (!this.editingEntry || entry.id !== this.editingEntry.id) &&
            (entry.type === 'fullLeave' || entry.type === 'holiday')
        );
        
        if (hasFullDayEntry && (newEntry.type !== 'fullLeave' && newEntry.type !== 'holiday')) {
            return false;
        }
        
        if ((newEntry.type === 'fullLeave' || newEntry.type === 'holiday')) {
            const otherEntries = existingEntries.filter(entry => 
                !this.editingEntry || entry.id !== this.editingEntry.id
            );
            if (otherEntries.length > 0) {
                return false;
            }
        }
        
        // Check for half-day period conflicts
        if (newEntry.type === 'halfLeave') {
            const conflictingHalfDay = existingEntries.some(entry =>
                (!this.editingEntry || entry.id !== this.editingEntry.id) &&
                entry.type === 'halfLeave' &&
                entry.halfDayPeriod === newEntry.halfDayPeriod
            );
            
            if (conflictingHalfDay) {
                return false;
            }
        }
        
        return true;
    }

    validateHours() {
        const value = parseFloat(this.elements.hours.value);
        const type = this.elements.entryType.value;
        
        if (type === 'work') {
            if (value > 8) {
                this.elements.hours.setCustomValidity('Hours cannot exceed 8');
            } else if (value <= 0) {
                this.elements.hours.setCustomValidity('Hours must be greater than 0');
            } else if (value < 0.5) {
                this.elements.hours.setCustomValidity('Minimum 0.5 hours required');
            } else {
                this.elements.hours.setCustomValidity('');
            }
        }
    }

    deleteEntry(entryId) {
        const modal = this.elements.confirmModal;
        modal.classList.remove('hidden');
        modal.dataset.entryId = entryId;
    }

    confirmDelete() {
        const entryId = this.elements.confirmModal.dataset.entryId;
        const dateKey = this.formatDateKey(this.selectedDate);
        
        if (this.workLogData[dateKey]) {
            this.workLogData[dateKey] = this.workLogData[dateKey].filter(entry => entry.id !== entryId);
            
            if (this.workLogData[dateKey].length === 0) {
                delete this.workLogData[dateKey];
            }
        }
        
        this._saveAllMonthlyData();
        this.renderCalendar();
        this.renderDailyLogs();
        this.updateDailyStats();
        this.updateMonthlyStats();
        this.cancelDelete();
        this.showToast('Entry deleted successfully', 'success');
    }

    cancelDelete() {
        this.elements.confirmModal.classList.add('hidden');
        this.elements.confirmModal.dataset.entryId = '';
    }

    editEntry(entryId) {
        const dateKey = this.formatDateKey(this.selectedDate);
        const entry = this.workLogData[dateKey].find(e => e.id === entryId);
        
        if (!entry) return;
        
        this.editingEntry = entry;
        
        // Populate form with entry data
        this.elements.entryType.value = entry.type;
        this.handleEntryTypeChange();
        
        this.elements.project.value = entry.project || '';
        this.elements.hours.value = entry.hours || '';
        this.elements.halfDayPeriod.value = entry.halfDayPeriod || '';
        this.elements.comments.value = entry.comments || '';
        
        // Update form UI
        this.elements.formTitle.textContent = 'Edit Entry';
        this.elements.addEntryBtn.textContent = 'Update Entry';
        this.elements.cancelEntryBtn.style.display = 'inline-flex';
        
        this.showToast('Edit mode activated', 'warning');
    }

    cancelEdit() {
        this.editingEntry = null;
        this.resetForm();
        this.elements.formTitle.textContent = 'Add New Entry';
        this.elements.addEntryBtn.textContent = 'Add Entry';
        this.elements.cancelEntryBtn.style.display = 'none';
        this.showToast('Edit cancelled', 'success');
    }

    resetForm() {
        this.elements.entryType.value = '';
        this.handleEntryTypeChange();
        this.hideFormErrors();
    }

    // UI Rendering Methods
    updateSelectedDateDisplay() {
        if (this.selectedDate) {
            const formatted = new Intl.DateTimeFormat('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }).format(this.selectedDate);
            this.elements.selectedDateDisplay.textContent = formatted;
        } else {
            this.elements.selectedDateDisplay.textContent = 'Please select a date';
        }
    }

    updateDailyStats() {
        if (!this.selectedDate) {
            this.elements.totalHours.textContent = '0';
            this.elements.validationWarning.textContent = '';
            return;
        }
        
        const dateKey = this.formatDateKey(this.selectedDate);
        const entries = this.workLogData[dateKey] || [];
        const totalHours = this.calculateDayTotalHours(entries);
        
        this.elements.totalHours.textContent = totalHours;
        
        // Show validation warning
        if (totalHours > 8) {
            this.elements.validationWarning.textContent = '⚠️ Exceeds 8-hour limit';
        } else {
            this.elements.validationWarning.textContent = '';
        }
    }

    showEntryForm() {
        this.elements.entryForm.style.display = 'block';
    }

    renderDailyLogs() {
        if (!this.selectedDate) {
            this.elements.entriesList.innerHTML = '<p class="no-entries">No entries for selected date</p>';
            return;
        }
        
        const dateKey = this.formatDateKey(this.selectedDate);
        const entries = this.workLogData[dateKey] || [];
        
        if (entries.length === 0) {
            this.elements.entriesList.innerHTML = '<p class="no-entries">No entries for selected date</p>';
            return;
        }
        
        this.elements.entriesList.innerHTML = entries.map(entry => this.createEntryHTML(entry)).join('');
    }

    createEntryHTML(entry) {
        const typeInfo = entryTypes[entry.type];
        
        return `
            <div class="entry-item" data-entry-id="${entry.id}">
                <div class="entry-header">
                    <div class="entry-type">
                        <span class="entry-type-indicator ${entry.type}"></span>
                        ${typeInfo.label}
                    </div>
                    <div class="entry-actions">
                        <button class="btn btn--sm btn--outline" onclick="tracker.editEntry('${entry.id}')">Edit</button>
                        <button class="btn btn--sm btn--outline" onclick="tracker.deleteEntry('${entry.id}')" style="color: var(--color-error);">Delete</button>
                    </div>
                </div>
                <div class="entry-details">
                    ${entry.project ? `<div class="entry-detail">
                        <span class="entry-detail-label">Project:</span>
                        <span class="entry-detail-value">${this.getProjectDisplayName(entry.project)}</span>
                    </div>` : ''}
                    <div class="entry-detail">
                        <span class="entry-detail-label">Hours:</span>
                        <span class="entry-detail-value">${this.getEntryHours(entry)}</span>
                    </div>
                    ${entry.type === 'halfLeave' ? `<div class="entry-detail">
                        <span class="entry-detail-label">Period:</span>
                        <span class="entry-detail-value">${halfDayPeriods[entry.halfDayPeriod]?.label || entry.halfDayPeriod}</span>
                    </div>` : ''}
                </div>
                ${entry.comments ? `<div class="entry-comments">${entry.comments}</div>` : ''}
            </div>
        `;
    }

    // Statistics Methods
    updateMonthlyStats() {
        const monthlyData = this.getMonthlyData();
        
        // Update summary statistics
        this.elements.totalWorkHours.textContent = monthlyData.totalWorkHours;
        this.elements.workDays.textContent = monthlyData.workDays;
        this.elements.leaveDays.textContent = monthlyData.leaveDays;
        this.elements.holidays.textContent = monthlyData.holidays;
        
        // Update project breakdown chart
        this.renderProjectChart(monthlyData.projectBreakdown);
    }

    getMonthlyData() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        let totalWorkHours = 0;
        let workDays = 0;
        let leaveDays = 0;
        let holidays = 0;
        const projectBreakdown = {};
        
        Object.keys(this.workLogData).forEach(dateKey => {
            const date = new Date(dateKey);
            if (date.getFullYear() === year && date.getMonth() === month) {
                const entries = this.workLogData[dateKey];
                let dayHasWork = false;
                let dayHasLeave = false;
                let dayHasHoliday = false;
                
                entries.forEach(entry => {
                    if (entry.type === 'work') {
                        dayHasWork = true;
                        totalWorkHours += entry.hours;
                        
                        // Track project breakdown
                        const projectKey = entry.project || 'Unknown';
                        projectBreakdown[projectKey] = (projectBreakdown[projectKey] || 0) + entry.hours;
                    } else if (entry.type === 'fullLeave' || entry.type === 'halfLeave') {
                        dayHasLeave = true;
                    } else if (entry.type === 'holiday') {
                        dayHasHoliday = true;
                    }
                });
                
                if (dayHasWork) workDays++;
                if (dayHasLeave) leaveDays++;
                if (dayHasHoliday) holidays++;
            }
        });
        
        return {
            totalWorkHours,
            workDays,
            leaveDays,
            holidays,
            projectBreakdown
        };
    }

    renderProjectChart(projectBreakdown) {
        if (this.chartInstance) {
            this.chartInstance.destroy();
        }
        
        if (Object.keys(projectBreakdown).length === 0) {
            this.elements.projectChart.style.display = 'none';
            return;
        }
        
        this.elements.projectChart.style.display = 'block';
        
        const ctx = this.elements.projectChart.getContext('2d');
        const colors = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B'];
        
        const labels = Object.keys(projectBreakdown).map(key => this.getProjectDisplayName(key) || 'Unknown');
        const data = Object.values(projectBreakdown);
        
        this.chartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, data.length),
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 10,
                            font: {
                                size: 11
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed + ' hours';
                            }
                        }
                    }
                }
            }
        });
    }

    showStatsModal() {
        const monthlyData = this.getMonthlyData();
        
        let content = `
            <div class="stats-summary">
                <h4>Monthly Summary</h4>
                <div class="stats-grid">
                    <div class="stat-card card">
                        <div class="card__body">
                            <h5>Total Work Hours</h5>
                            <div class="stat-value">${monthlyData.totalWorkHours}</div>
                        </div>
                    </div>
                    <div class="stat-card card">
                        <div class="card__body">
                            <h5>Work Days</h5>
                            <div class="stat-value">${monthlyData.workDays}</div>
                        </div>
                    </div>
                    <div class="stat-card card">
                        <div class="card__body">
                            <h5>Leave Days</h5>
                            <div class="stat-value">${monthlyData.leaveDays}</div>
                        </div>
                    </div>
                    <div class="stat-card card">
                        <div class="card__body">
                            <h5>Holidays</h5>
                            <div class="stat-value">${monthlyData.holidays}</div>
                        </div>
                    </div>
                </div>
        `;
        
        if (Object.keys(monthlyData.projectBreakdown).length > 0) {
            content += `
                <h4>Project Breakdown</h4>
                <div class="project-list">
            `;
            
            Object.entries(monthlyData.projectBreakdown).forEach(([project, hours]) => {
                content += `
                    <div class="project-item">
                        <span>${this.getProjectDisplayName(project) || 'Unknown'}</span>
                        <span>${hours} hours</span>
                    </div>
                `;
            });
            
            content += '</div>';
        }
        
        content += '</div>';
        
        this.elements.statsModalContent.innerHTML = content;
        this.elements.statsModal.classList.remove('hidden');
    }

    hideStatsModal() {
        this.elements.statsModal.classList.add('hidden');
    }

    // Export Methods
    exportMonthData() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(this.currentDate);
        
        // Collect all entries for the current month
        const monthEntries = [];
        
        Object.keys(this.workLogData).forEach(dateKey => {
            const date = new Date(dateKey);
            if (date.getFullYear() === year && date.getMonth() === month) {
                this.workLogData[dateKey].forEach(entry => {
                    monthEntries.push({
                        date: dateKey,
                        ...entry
                    });
                });
            }
        });
        
        if (monthEntries.length === 0) {
            this.showToast('No data to export for this month', 'warning');
            return;
        }
        
        // Create CSV content
        const csvContent = this.createCSVContent(monthEntries);
        
        // Download file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `work-log-${monthName}-${year}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        this.showToast('Data exported successfully', 'success');
    }

    createCSVContent(entries) {
        const headers = ['Date', 'Entry Type', 'Project', 'Hours', 'Half Day Period', 'Comments'];
        const csvLines = [headers.join(',')];
        
        entries.forEach(entry => {
            const row = [
                entry.date,
                entryTypes[entry.type].label,
                this.getProjectDisplayName(entry.project) || 'N/A',
                this.getEntryHours(entry),
                entry.halfDayPeriod || 'N/A',
                `"${entry.comments || 'N/A'}"`
            ];
            csvLines.push(row.join(','));
        });
        
        return csvLines.join('\n');
    }

    // Utility Methods
    calculateDayTotalHours(entries) {
        return entries.reduce((total, entry) => total + this.getEntryHours(entry), 0);
    }

    getEntryHours(entry) {
        if (entry.type === 'work') return entry.hours || 0;
        if (entry.type === 'halfLeave') return 4;
        if (entry.type === 'fullLeave' || entry.type === 'holiday') return 8;
        return 0;
    }

    getProjectDisplayName(projectValue) {
        if (!projectValue) return '';
        
        const project = projectData.find(p => `${p.projectId}-${p.subCode}` === projectValue);
        return project ? `${project.projectId} (${project.subCode})` : projectValue;
    }

    getEntryTypesForDate(dateKey) {
        const entries = this.workLogData[dateKey] || [];
        return [...new Set(entries.map(entry => entry.type))];
    }

    formatDateKey(date) {
        return date.toISOString().split('T')[0];
    }

    isDateToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    showToast(message, type = 'success') {
        this.elements.toastMessage.textContent = message;
        this.elements.toast.className = `toast ${type}`;
        this.elements.toast.classList.add('show');
        
        setTimeout(() => {
            this.elements.toast.classList.remove('show');
        }, 3000);
    }

    showFormErrors(errors) {
        this.elements.formErrors.innerHTML = errors.join('<br>');
        this.elements.formErrors.classList.add('show');
    }

    hideFormErrors() {
        this.elements.formErrors.classList.remove('show');
    }
}

// Initialize the application
let tracker;

document.addEventListener('DOMContentLoaded', function() {
    tracker = new MonthlyWorkLogTracker();
});

// Global functions for inline event handlers
window.tracker = tracker;
