// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyD0fCY4dwc0igmcTYJOU2rRGQ0ERSVz2l4",
    authDomain: "daily-work-log-tracker.firebaseapp.com",
    projectId: "daily-work-log-tracker",
    storageBucket: "daily-work-log-tracker.firebasestorage.app",
    messagingSenderId: "891051391167",
    appId: "1:891051391167:web:1050e984fa86b4d070ee0a",
    measurementId: "G-3X0E8CJX59"
};

// Initialize Firebase
let auth, db;
let firebaseInitialized = false;

try {
    firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    firebaseInitialized = true;
    console.log('Firebase initialized successfully');
} catch (error) {
    console.warn('Firebase initialization failed:', error);
    firebaseInitialized = false;
}

// Application data
let projectData = [
    { id: "1", projectId: "IN-1100-NA", subCode: "0010", projectTitle: "General Overhead", category: "Overhead", isActive: true, usageCount: 0 },
    { id: "2", projectId: "WV-1112-4152", subCode: "0210", projectTitle: "AS_Strategy", category: "Strategy", isActive: true, usageCount: 0 },
    { id: "3", projectId: "WV-1112-4152", subCode: "1010", projectTitle: "AS_Strategy", category: "Strategy", isActive: true, usageCount: 0 },
    { id: "4", projectId: "WV-1112-4152", subCode: "1020", projectTitle: "AS_Strategy", category: "Strategy", isActive: true, usageCount: 0 },
    { id: "5", projectId: "RW-1173-9573P00303", subCode: "0010", projectTitle: "RW Tracking", category: "Tracking", isActive: true, usageCount: 0 },
    { id: "6", projectId: "WV-1137-D75B1-C4285-08-03", subCode: "1250", projectTitle: "MERCIA_INSIGNIA_ElectronicController_Mil", category: "Controller", isActive: true, usageCount: 0 },
    { id: "7", projectId: "WV-1116-4306", subCode: "0020", projectTitle: "SensorLess_Controller_Demo", category: "Controller", isActive: true, usageCount: 0 }
];

const entryTypes = {
    work: { label: "Work Entry", color: "#3b82f6", maxHours: 8 },
    fullLeave: { label: "Full Day Leave", color: "#ef4444", maxHours: 8 },
    halfLeave: { label: "Half Day Leave", color: "#f97316", maxHours: 4 },
    holiday: { label: "Holiday", color: "#22c55e", maxHours: 8 }
};

// Application state
let currentUser = null;
let isGuestMode = false;
let currentDate = new Date();
let selectedDate = null;
let editingEntry = null;
let workLogData = {};
let activeTab = 'login';

// DOM elements cache
let elements = {};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    
    // Cache DOM elements
    cacheElements();
    
    // Ensure loading indicator is hidden immediately
    hideLoadingIndicator();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize authentication flow
    setTimeout(() => {
        initializeAuth();
    }, 100);
});

function cacheElements() {
    elements = {
        // Auth elements
        authScreen: document.getElementById('authScreen'),
        mainApp: document.getElementById('mainApp'),
        loginTab: document.getElementById('loginTab'),
        registerTab: document.getElementById('registerTab'),
        guestTab: document.getElementById('guestTab'),
        loginForm: document.getElementById('loginForm'),
        registerForm: document.getElementById('registerForm'),
        guestForm: document.getElementById('guestForm'),
        loginEmail: document.getElementById('loginEmail'),
        loginPassword: document.getElementById('loginPassword'),
        loginBtn: document.getElementById('loginBtn'),
        registerName: document.getElementById('registerName'),
        registerEmail: document.getElementById('registerEmail'),
        registerPassword: document.getElementById('registerPassword'),
        confirmPassword: document.getElementById('confirmPassword'),
        registerBtn: document.getElementById('registerBtn'),
        continueGuestBtn: document.getElementById('continueGuestBtn'),
        loginErrors: document.getElementById('loginErrors'),
        registerErrors: document.getElementById('registerErrors'),
        
        // Main app elements
        userWelcome: document.getElementById('userWelcome'),
        userMode: document.getElementById('userMode'),
        logoutBtn: document.getElementById('logoutBtn'),
        loadingIndicator: document.getElementById('loadingIndicator'),
        
        // Calendar and entries
        calendarGrid: document.getElementById('calendarGrid'),
        currentMonth: document.getElementById('currentMonth'),
        prevMonthBtn: document.getElementById('prevMonthBtn'),
        nextMonthBtn: document.getElementById('nextMonthBtn'),
        selectedDateDisplay: document.getElementById('selectedDateDisplay'),
        totalHours: document.getElementById('totalHours'),
        validationWarning: document.getElementById('validationWarning'),
        entryForm: document.getElementById('entryForm'),
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
        entriesCount: document.getElementById('entriesCount'),
        exportBtn: document.getElementById('exportBtn'),
        
        // Project management
        manageProjectsBtn: document.getElementById('manageProjectsBtn'),
        projectModal: document.getElementById('projectModal'),
        closeProjectModalBtn: document.getElementById('closeProjectModalBtn'),
        newProjectId: document.getElementById('newProjectId'),
        newSubCode: document.getElementById('newSubCode'),
        newProjectTitle: document.getElementById('newProjectTitle'),
        newProjectCategory: document.getElementById('newProjectCategory'),
        addProjectBtn: document.getElementById('addProjectBtn'),
        projectsList: document.getElementById('projectsList'),
        
        // Other modals and notifications
        toast: document.getElementById('toast'),
        toastMessage: document.getElementById('toastMessage'),
        confirmModal: document.getElementById('confirmModal'),
        confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
        cancelDeleteBtn: document.getElementById('cancelDeleteBtn')
    };
}

function hideLoadingIndicator() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.classList.add('hidden');
    }
}

function showLoadingIndicator() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        loadingIndicator.classList.remove('hidden');
    }
}

function initializeAuth() {
    console.log('Initializing auth, Firebase initialized:', firebaseInitialized);
    
    hideLoadingIndicator();
    
    if (firebaseInitialized) {
        auth.onAuthStateChanged(user => {
            console.log('Auth state changed:', user ? 'User logged in' : 'No user');
            hideLoadingIndicator();
            
            if (user) {
                currentUser = user;
                isGuestMode = false;
                showMainApp();
                //loadUserData();
                try {
                    await loadUserDataFromCloud(); // ✅ FIXED: await in async function
                } catch (error) {
                    console.error('Error loading user data:', error);
                    showToast('⚠️ Error loading cloud data, using local data');
                    loadLocalData();
                }
            } else if (!isGuestMode) {
                showAuthScreen();
            }
        });
    } else {
        console.log('Firebase not available, showing auth screen');
        hideLoadingIndicator();
        showAuthScreen();
    }
}

// Event listeners setup
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Auth tab listeners
    if (elements.loginTab) {
        elements.loginTab.addEventListener('click', () => showAuthTab('login'));
    }
    if (elements.registerTab) {
        elements.registerTab.addEventListener('click', () => showAuthTab('register'));
    }
    if (elements.guestTab) {
        elements.guestTab.addEventListener('click', () => showAuthTab('guest'));
    }
    
    // Auth form listeners
    if (elements.loginBtn) {
        elements.loginBtn.addEventListener('click', handleLogin);
    }
    if (elements.registerBtn) {
        elements.registerBtn.addEventListener('click', handleRegister);
    }
    if (elements.continueGuestBtn) {
        elements.continueGuestBtn.addEventListener('click', continueAsGuest);
    }
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Main app event listeners
    if (elements.prevMonthBtn) {
        elements.prevMonthBtn.addEventListener('click', () => navigateMonth(-1));
    }
    if (elements.nextMonthBtn) {
        elements.nextMonthBtn.addEventListener('click', () => navigateMonth(1));
    }
    if (elements.entryType) {
        elements.entryType.addEventListener('change', handleEntryTypeChange);
    }
    if (elements.addEntryBtn) {
        elements.addEntryBtn.addEventListener('click', handleAddEntry);
    }
    if (elements.cancelEntryBtn) {
        elements.cancelEntryBtn.addEventListener('click', cancelEdit);
    }
    if (elements.exportBtn) {
        elements.exportBtn.addEventListener('click', exportMonthData);
    }
    if (elements.confirmDeleteBtn) {
        elements.confirmDeleteBtn.addEventListener('click', confirmDelete);
    }
    if (elements.cancelDeleteBtn) {
        elements.cancelDeleteBtn.addEventListener('click', cancelDelete);
    }
    
    // Project management
    if (elements.manageProjectsBtn) {
        elements.manageProjectsBtn.addEventListener('click', showProjectModal);
    }
    if (elements.closeProjectModalBtn) {
        elements.closeProjectModalBtn.addEventListener('click', hideProjectModal);
    }
    if (elements.addProjectBtn) {
        elements.addProjectBtn.addEventListener('click', handleAddProject);
    }
    
    // Form validation
    if (elements.hours) {
        elements.hours.addEventListener('input', validateHours);
    }
    
    // Enter key handling
    if (elements.loginPassword) {
        elements.loginPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleLogin();
        });
    }
    if (elements.confirmPassword) {
        elements.confirmPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleRegister();
        });
    }
    
    // Modal overlay clicks
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            hideProjectModal();
            cancelDelete();
        }
    });
    
    console.log('Event listeners set up successfully');
}

// Authentication tab management
function showAuthTab(tabName) {
    activeTab = tabName;
    
    // Update tab states
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Hide all forms
    if (elements.loginForm) elements.loginForm.classList.add('hidden');
    if (elements.registerForm) elements.registerForm.classList.add('hidden');
    if (elements.guestForm) elements.guestForm.classList.add('hidden');
    
    // Show active tab and form
    if (tabName === 'login') {
        elements.loginTab.classList.add('active');
        elements.loginForm.classList.remove('hidden');
    } else if (tabName === 'register') {
        elements.registerTab.classList.add('active');
        elements.registerForm.classList.remove('hidden');
    } else if (tabName === 'guest') {
        elements.guestTab.classList.add('active');
        elements.guestForm.classList.remove('hidden');
    }
    
    // Clear errors
    hideAuthErrors('loginErrors');
    hideAuthErrors('registerErrors');
}

// Authentication functions
async function handleLogin() {
    console.log('Handle login clicked');
    
    if (!firebaseInitialized) {
        showAuthErrors('loginErrors', ['Firebase is not available. Please use Guest mode.']);
        return;
    }

    const email = elements.loginEmail.value.trim();
    const password = elements.loginPassword.value;
    
    if (!email || !password) {
        showAuthErrors('loginErrors', ['Please fill in all fields']);
        return;
    }
    
    showLoadingIndicator();
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
        hideAuthErrors('loginErrors');
        showToast('Login successful');
    } catch (error) {
        showAuthErrors('loginErrors', [getAuthErrorMessage(error.code)]);
    } finally {
        hideLoadingIndicator();
    }
}

async function handleRegister() {
    console.log('Handle register clicked');
    
    if (!firebaseInitialized) {
        showAuthErrors('registerErrors', ['Firebase is not available. Please use Guest mode.']);
        return;
    }

    const name = elements.registerName.value.trim();
    const email = elements.registerEmail.value.trim();
    const password = elements.registerPassword.value;
    const confirmPassword = elements.confirmPassword.value;
    
    const errors = [];
    
    if (!name) errors.push('Full name is required');
    if (!email) errors.push('Email is required');
    if (!password) errors.push('Password is required');
    if (password.length < 6) errors.push('Password must be at least 6 characters');
    if (password !== confirmPassword) errors.push('Passwords do not match');
    
    if (errors.length > 0) {
        showAuthErrors('registerErrors', errors);
        return;
    }
    
    showLoadingIndicator();
    
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await userCredential.user.updateProfile({ displayName: name });
        
        // Initialize user data in Firestore
        await db.collection('users').doc(userCredential.user.uid).set({
            name: name,
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            projects: projectData
        });
        
        hideAuthErrors('registerErrors');
        showToast('Account created successfully');
    } catch (error) {
        showAuthErrors('registerErrors', [getAuthErrorMessage(error.code)]);
    } finally {
        hideLoadingIndicator();
    }
}

function continueAsGuest() {
    console.log('Continue as guest clicked');
    hideLoadingIndicator();
    
    isGuestMode = true;
    currentUser = null;
    showMainApp();
    loadLocalData();
    showToast('Continuing in guest mode - data will be stored locally only');
}

async function handleLogout() {
    console.log('Handle logout clicked');
    
    if (currentUser && firebaseInitialized) {
        await auth.signOut();
    }
    
    currentUser = null;
    isGuestMode = false;
    workLogData = {};
    showAuthScreen();
    showToast('Logged out successfully');
}

function showAuthScreen() {
    console.log('Showing auth screen');
    hideLoadingIndicator();
    
    elements.authScreen.classList.remove('hidden');
    elements.mainApp.classList.add('hidden');
    
    // Show default tab
    showAuthTab('login');
}

function showMainApp() {
    console.log('Showing main app');
    hideLoadingIndicator();
    
    elements.authScreen.classList.add('hidden');
    elements.mainApp.classList.remove('hidden');
    
    // Update user info
    if (currentUser) {
        elements.userWelcome.textContent = `Welcome back, ${currentUser.displayName || currentUser.email}!`;
        elements.userMode.textContent = 'Cloud Sync Enabled';
        elements.userMode.className = 'status status--success';
    } else {
        elements.userWelcome.textContent = 'Welcome, Guest!';
        elements.userMode.textContent = 'Local Storage Only';
        elements.userMode.className = 'status status--warning';
    }
    
    // Initialize main app
    populateProjectDropdown();
    renderCalendar();
    
    // Set current date as default selected date
    const today = new Date();
    selectDate(today);
}

// Data management functions
async function loadUserData() {
    if (!currentUser || !firebaseInitialized) return;
    
    showLoadingIndicator();
    
    try {
        // Load user projects
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            if (userData.projects) {
                projectData = userData.projects;
            }
        }
        
        // Load work log data
        const workLogSnapshot = await db.collection('workLogs')
            .where('userId', '==', currentUser.uid)
            .get();
        
        workLogData = {};
        workLogSnapshot.forEach(doc => {
            const data = doc.data();
            workLogData[data.date] = data.entries;
        });
        
        populateProjectDropdown();
        renderCalendar();
        
    } catch (error) {
        console.error('Error loading user data:', error);
        showToast('Error loading data. Using local storage.');
        loadLocalData();
    } finally {
        hideLoadingIndicator();
    }
}

function loadLocalData() {
    const savedData = localStorage.getItem('workLogData');
    const savedProjects = localStorage.getItem('projectData');
    
    if (savedData) {
        try {
            workLogData = JSON.parse(savedData);
        } catch (e) {
            workLogData = {};
        }
    }
    
    if (savedProjects) {
        try {
            projectData = JSON.parse(savedProjects);
        } catch (e) {
            // Keep default projects
        }
    }
}

async function saveData() {
    // Always save locally first (data safety)
    saveLocalData();
    
    if (currentUser && !isGuestMode && firebaseInitialized) {
        try {
            // Save to single Firestore document
            await db.collection('workLogs').doc(currentUser.uid).set({
                entries: workLogData,
                projects: projectData,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });
            showMessage('✅ Saved to cloud', 'success');
        } catch (error) {
            console.error('Cloud save failed:', error);
            showMessage('⚠️ Saved locally (Cloud sync failed)', 'warning');
        }
    } else {
        showMessage('💾 Saved locally', 'info');
    }
}

async function loadUserDataFromCloud() {
    // Loads ALL user data from single Firestore document
    const doc = await db.collection('workLogs').doc(currentUser.uid).get();
    if (doc.exists()) {
        const cloudData = doc.data();
        workLogData = cloudData.entries; // Load all entries
        projectData = cloudData.projects; // Load projects
        // Update UI immediately
        populateProjectDropdown();
        renderCalendar();
        showToast('✅ Data synced from cloud');
    }
}



function saveLocalData() {
    localStorage.setItem('workLogData', JSON.stringify(workLogData));
    localStorage.setItem('projectData', JSON.stringify(projectData));
}

// Calendar functions
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    elements.currentMonth.textContent = new Intl.DateTimeFormat('en-US', {
        month: 'long',
        year: 'numeric'
    }).format(currentDate);
    
    // Clear existing calendar days
    const existingDays = elements.calendarGrid.querySelectorAll('.calendar-day');
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
        
        const dayElement = createCalendarDay(date, month);
        elements.calendarGrid.appendChild(dayElement);
    }
}

function createCalendarDay(date, currentMonth) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    dayElement.textContent = date.getDate();
    dayElement.setAttribute('tabindex', '0');
    
    const dateKey = formatDateKey(date);
    const isCurrentMonth = date.getMonth() === currentMonth;
    const isToday = isDateToday(date);
    const isSelected = selectedDate && formatDateKey(selectedDate) === dateKey;
    const hasEntries = workLogData[dateKey] && workLogData[dateKey].length > 0;
    
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
        const entryTypes = getEntryTypesForDate(dateKey);
        entryTypes.forEach(type => {
            dayElement.classList.add(`has-${type}`);
        });
    }
    
    dayElement.addEventListener('click', () => selectDate(date));
    dayElement.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectDate(date);
        }
    });
    
    return dayElement;
}

function navigateMonth(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    renderCalendar();
}

function selectDate(date) {
    selectedDate = new Date(date);
    renderCalendar();
    updateSelectedDateDisplay();
    showEntryForm();
    renderDailyEntries();
    updateDailyStats();
}

// Project management functions
function populateProjectDropdown() {
    elements.project.innerHTML = '<option value="">Select project...</option>';
    
    projectData.forEach(proj => {
        const option = document.createElement('option');
        option.value = `${proj.projectId}-${proj.subCode}`;
        option.textContent = `${proj.projectId} (${proj.subCode}) - ${proj.projectTitle}`;
        elements.project.appendChild(option);
    });
}

function showProjectModal() {
    elements.projectModal.classList.remove('hidden');
    renderProjectsList();
}

function hideProjectModal() {
    elements.projectModal.classList.add('hidden');
    clearProjectForm();
}

function renderProjectsList() {
    elements.projectsList.innerHTML = '';
    
    if (projectData.length === 0) {
        elements.projectsList.innerHTML = '<p class="no-entries">No projects available</p>';
        return;
    }
    
    projectData.forEach(project => {
        const projectItem = document.createElement('div');
        projectItem.className = 'project-item';
        projectItem.innerHTML = `
            <div class="project-info">
                <h5>${project.projectId} (${project.subCode})</h5>
                <p>${project.projectTitle} - ${project.category}</p>
            </div>
            <div class="project-actions">
                <button class="btn btn--sm btn--outline" onclick="editProject('${project.id}')">Edit</button>
                <button class="btn btn--sm btn--outline" onclick="deleteProject('${project.id}')" style="color: var(--color-error);">Delete</button>
            </div>
        `;
        elements.projectsList.appendChild(projectItem);
    });
}

async function handleAddProject() {
    const projectId = elements.newProjectId.value.trim();
    const subCode = elements.newSubCode.value.trim();
    const projectTitle = elements.newProjectTitle.value.trim();
    const category = elements.newProjectCategory.value;
    
    const errors = [];
    
    if (!projectId) errors.push('Project ID is required');
    if (!subCode) errors.push('Sub code is required');
    if (!projectTitle) errors.push('Project title is required');
    if (!category) errors.push('Category is required');
    
    // Check for duplicates
    const duplicate = projectData.find(p => 
        p.projectId === projectId && p.subCode === subCode
    );
    
    if (duplicate) {
        errors.push('Project with this ID and sub code already exists');
    }
    
    if (errors.length > 0) {
        showToast(errors.join(', '));
        return;
    }
    
    const newProject = {
        id: generateId(),
        projectId,
        subCode,
        projectTitle,
        category,
        isActive: true,
        usageCount: 0
    };
    
    projectData.push(newProject);
    await saveData();
    populateProjectDropdown();
    renderProjectsList();
    clearProjectForm();
    showToast('Project added successfully');
}

async function deleteProject(projectId) {
    const index = projectData.findIndex(p => p.id === projectId);
    if (index === -1) return;
    
    // Check if project is used in any entries
    let isUsed = false;
    Object.values(workLogData).forEach(entries => {
        entries.forEach(entry => {
            if (entry.project && entry.project.includes(projectData[index].projectId)) {
                isUsed = true;
            }
        });
    });
    
    if (isUsed) {
        showToast('Cannot delete project that is used in entries');
        return;
    }
    
    if (confirm('Are you sure you want to delete this project?')) {
        projectData.splice(index, 1);
        await saveData();
        populateProjectDropdown();
        renderProjectsList();
        showToast('Project deleted successfully');
    }
}

function clearProjectForm() {
    elements.newProjectId.value = '';
    elements.newSubCode.value = '';
    elements.newProjectTitle.value = '';
    elements.newProjectCategory.value = '';
}

// Entry form functions
function handleEntryTypeChange() {
    const type = elements.entryType.value;
    
    // Reset form
    resetFormFields();
    
    // Show/hide fields based on entry type
    elements.projectGroup.style.display = type === 'work' ? 'block' : 'none';
    elements.hoursGroup.style.display = ['work'].includes(type) ? 'block' : 'none';
    elements.halfDayPeriodGroup.style.display = type === 'halfLeave' ? 'block' : 'none';
    
    // Set default values
    if (type === 'halfLeave') {
        elements.hours.value = '4';
        elements.hours.readOnly = true;
    } else if (type === 'fullLeave' || type === 'holiday') {
        elements.hours.value = '8';
        elements.hours.readOnly = true;
        elements.hoursGroup.style.display = 'none';
    } else {
        elements.hours.readOnly = false;
        elements.hours.value = '';
    }
}

function resetFormFields() {
    elements.project.value = '';
    elements.hours.value = '';
    elements.halfDayPeriod.value = '';
    elements.comments.value = '';
    hideFormErrors();
}

async function handleAddEntry() {
    const entryData = gatherFormData();
    
    if (!validateEntry(entryData)) {
        return;
    }
    
    const dateKey = formatDateKey(selectedDate);
    
    if (!workLogData[dateKey]) {
        workLogData[dateKey] = [];
    }
    
    if (editingEntry) {
        // Update existing entry
        const index = workLogData[dateKey].findIndex(entry => entry.id === editingEntry.id);
        if (index !== -1) {
            workLogData[dateKey][index] = { ...entryData, id: editingEntry.id };
        }
        showToast('Entry updated successfully');
        cancelEdit();
    } else {
        // Add new entry
        entryData.id = generateId();
        workLogData[dateKey].push(entryData);
        showToast('Entry added successfully');
    }
    
    await saveData();
    renderCalendar();
    renderDailyEntries();
    updateDailyStats();
    resetForm();
}

function gatherFormData() {
    return {
        type: elements.entryType.value,
        project: elements.project.value,
        hours: parseFloat(elements.hours.value) || 0,
        halfDayPeriod: elements.halfDayPeriod.value,
        comments: elements.comments.value.trim(),
        timestamp: new Date().toISOString()
    };
}

function validateEntry(entryData) {
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
    }
    
    if (entryData.type === 'halfLeave' && !entryData.halfDayPeriod) {
        errors.push('Time period is required for half-day leave');
    }
    
    // Validate daily hour limits
    if (!validateDailyHours(entryData)) {
        errors.push('Total daily hours cannot exceed 8 hours');
    }
    
    // Check for conflicting entries
    if (!validateConflicts(entryData)) {
        errors.push('This entry conflicts with existing entries');
    }
    
    if (errors.length > 0) {
        showFormErrors(errors);
        return false;
    }
    
    return true;
}

function validateDailyHours(newEntry) {
    const dateKey = formatDateKey(selectedDate);
    const existingEntries = workLogData[dateKey] || [];
    
    let totalHours = 0;
    
    // Calculate existing hours (excluding the entry being edited)
    existingEntries.forEach(entry => {
        if (!editingEntry || entry.id !== editingEntry.id) {
            if (entry.type === 'work') {
                totalHours += entry.hours;
            } else if (entry.type === 'halfLeave') {
                totalHours += 4;
            } else if (entry.type === 'fullLeave' || entry.type === 'holiday') {
                totalHours += 8;
            }
        }
    });
    
    // Add new entry hours
    if (newEntry.type === 'work') {
        totalHours += newEntry.hours;
    } else if (newEntry.type === 'halfLeave') {
        totalHours += 4;
    } else if (newEntry.type === 'fullLeave' || newEntry.type === 'holiday') {
        totalHours += 8;
    }
    
    return totalHours <= 8;
}

function validateConflicts(newEntry) {
    const dateKey = formatDateKey(selectedDate);
    const existingEntries = workLogData[dateKey] || [];
    
    // Check for full day conflicts
    const hasFullDayEntry = existingEntries.some(entry => 
        (!editingEntry || entry.id !== editingEntry.id) &&
        (entry.type === 'fullLeave' || entry.type === 'holiday')
    );
    
    if (hasFullDayEntry && (newEntry.type !== 'fullLeave' && newEntry.type !== 'holiday')) {
        return false;
    }
    
    if ((newEntry.type === 'fullLeave' || newEntry.type === 'holiday') && existingEntries.length > 0) {
        const otherEntries = existingEntries.filter(entry => 
            !editingEntry || entry.id !== editingEntry.id
        );
        if (otherEntries.length > 0) {
            return false;
        }
    }
    
    // Check for half-day period conflicts
    if (newEntry.type === 'halfLeave') {
        const conflictingHalfDay = existingEntries.some(entry =>
            (!editingEntry || entry.id !== editingEntry.id) &&
            entry.type === 'halfLeave' &&
            entry.halfDayPeriod === newEntry.halfDayPeriod
        );
        
        if (conflictingHalfDay) {
            return false;
        }
    }
    
    return true;
}

function validateHours() {
    const value = parseFloat(elements.hours.value);
    const type = elements.entryType.value;
    
    if (type === 'work') {
        if (value > 8) {
            elements.hours.setCustomValidity('Hours cannot exceed 8');
        } else if (value <= 0) {
            elements.hours.setCustomValidity('Hours must be greater than 0');
        } else {
            elements.hours.setCustomValidity('');
        }
    }
}

// Entry display functions
function renderDailyEntries() {
    if (!selectedDate) {
        elements.entriesList.innerHTML = `
            <div class="no-entries">
                <span class="no-entries-icon">📝</span>
                <p>No entries for selected date</p>
                <span class="no-entries-hint">Select a date above to add your first entry</span>
            </div>
        `;
        updateEntriesCount(0);
        return;
    }
    
    const dateKey = formatDateKey(selectedDate);
    const entries = workLogData[dateKey] || [];
    
    if (entries.length === 0) {
        elements.entriesList.innerHTML = `
            <div class="no-entries">
                <span class="no-entries-icon">📝</span>
                <p>No entries for selected date</p>
                <span class="no-entries-hint">Add your first entry using the form above</span>
            </div>
        `;
        updateEntriesCount(0);
        return;
    }
    
    elements.entriesList.innerHTML = entries.map(entry => createEntryHTML(entry)).join('');
    updateEntriesCount(entries.length);
}

function createEntryHTML(entry) {
    const typeInfo = entryTypes[entry.type];
    
    return `
        <div class="entry-item" data-entry-id="${entry.id}">
            <div class="entry-header">
                <div class="entry-type">
                    <span class="entry-type-indicator ${entry.type}"></span>
                    ${typeInfo.label}
                </div>
                <div class="entry-actions">
                    <button class="btn btn--sm btn--outline" onclick="editEntry('${entry.id}')">Edit</button>
                    <button class="btn btn--sm btn--outline" onclick="deleteEntry('${entry.id}')" style="color: var(--color-error);">Delete</button>
                </div>
            </div>
            <div class="entry-details">
                ${entry.project ? `<div class="entry-detail">
                    <span class="entry-detail-label">Project</span>
                    <span class="entry-detail-value">${getProjectDisplayName(entry.project)}</span>
                </div>` : ''}
                ${getEntryHours(entry) > 0 ? `<div class="entry-detail">
                    <span class="entry-detail-label">Hours</span>
                    <span class="entry-detail-value">${getEntryHours(entry)}</span>
                </div>` : ''}
                ${entry.type === 'halfLeave' ? `<div class="entry-detail">
                    <span class="entry-detail-label">Period</span>
                    <span class="entry-detail-value">${entry.halfDayPeriod === 'morning' ? 'Morning (8:00 AM - 12:00 PM)' : 'Afternoon (1:00 PM - 5:00 PM)'}</span>
                </div>` : ''}
            </div>
            ${entry.comments ? `<div class="entry-comments">${entry.comments}</div>` : ''}
        </div>
    `;
}

function updateEntriesCount(count) {
    elements.entriesCount.textContent = `${count} ${count === 1 ? 'entry' : 'entries'}`;
}

function editEntry(entryId) {
    const dateKey = formatDateKey(selectedDate);
    const entry = workLogData[dateKey].find(e => e.id === entryId);
    
    if (!entry) return;
    
    editingEntry = entry;
    
    // Populate form with entry data
    elements.entryType.value = entry.type;
    handleEntryTypeChange();
    
    elements.project.value = entry.project || '';
    elements.hours.value = entry.hours || '';
    elements.halfDayPeriod.value = entry.halfDayPeriod || '';
    elements.comments.value = entry.comments || '';
    
    // Update form UI
    elements.addEntryBtn.innerHTML = '<span class="btn-text">Update Entry</span>';
    elements.cancelEntryBtn.style.display = 'inline-flex';
    
    showToast('Edit mode activated');
}

async function deleteEntry(entryId) {
    const modal = elements.confirmModal;
    modal.classList.remove('hidden');
    modal.dataset.entryId = entryId;
}

async function confirmDelete() {
    const entryId = elements.confirmModal.dataset.entryId;
    const dateKey = formatDateKey(selectedDate);
    
    if (workLogData[dateKey]) {
        workLogData[dateKey] = workLogData[dateKey].filter(entry => entry.id !== entryId);
        
        if (workLogData[dateKey].length === 0) {
            delete workLogData[dateKey];
        }
    }
    
    await saveData();
    renderCalendar();
    renderDailyEntries();
    updateDailyStats();
    cancelDelete();
    showToast('Entry deleted successfully');
}

function cancelDelete() {
    elements.confirmModal.classList.add('hidden');
    elements.confirmModal.dataset.entryId = '';
}

function cancelEdit() {
    editingEntry = null;
    resetForm();
    elements.addEntryBtn.innerHTML = '<span class="btn-text">Add Entry</span>';
    elements.cancelEntryBtn.style.display = 'none';
    showToast('Edit cancelled');
}

function resetForm() {
    elements.entryType.value = '';
    handleEntryTypeChange();
    hideFormErrors();
}

// Utility functions
function updateSelectedDateDisplay() {
    if (selectedDate) {
        const formatted = new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(selectedDate);
        elements.selectedDateDisplay.textContent = formatted;
    } else {
        elements.selectedDateDisplay.textContent = 'Please select a date';
    }
}

function updateDailyStats() {
    if (!selectedDate) {
        elements.totalHours.textContent = '0';
        elements.validationWarning.textContent = '';
        elements.validationWarning.style.display = 'none';
        return;
    }
    
    const dateKey = formatDateKey(selectedDate);
    const entries = workLogData[dateKey] || [];
    
    let totalHours = 0;
    entries.forEach(entry => {
        totalHours += getEntryHours(entry);
    });
    
    elements.totalHours.textContent = totalHours;
    
    // Show validation warning
    if (totalHours > 8) {
        elements.validationWarning.textContent = '⚠️ Exceeds 8-hour daily limit';
        elements.validationWarning.style.display = 'block';
    } else {
        elements.validationWarning.textContent = '';
        elements.validationWarning.style.display = 'none';
    }
}

function showEntryForm() {
    elements.entryForm.style.display = 'block';
}

function showFormErrors(errors) {
    elements.formErrors.innerHTML = errors.join('<br>');
    elements.formErrors.classList.add('show');
}

function hideFormErrors() {
    elements.formErrors.classList.remove('show');
}

function showAuthErrors(elementId, errors) {
    const errorElement = elements[elementId];
    if (errorElement) {
        errorElement.innerHTML = errors.join('<br>');
        errorElement.classList.add('show');
    }
}

function hideAuthErrors(elementId) {
    const errorElement = elements[elementId];
    if (errorElement) {
        errorElement.classList.remove('show');
    }
}

function showToast(message) {
    elements.toastMessage.textContent = message;
    elements.toast.classList.remove('hidden');
    elements.toast.classList.add('show');
    
    setTimeout(() => {
        elements.toast.classList.remove('show');
        setTimeout(() => {
            elements.toast.classList.add('hidden');
        }, 300);
    }, 3000);
}

function exportMonthData() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(currentDate);
    
    // Collect all entries for the current month
    const monthEntries = [];
    
    Object.keys(workLogData).forEach(dateKey => {
        const date = new Date(dateKey);
        if (date.getFullYear() === year && date.getMonth() === month) {
            workLogData[dateKey].forEach(entry => {
                monthEntries.push({
                    date: dateKey,
                    ...entry
                });
            });
        }
    });
    
    if (monthEntries.length === 0) {
        showToast('No data to export for this month');
        return;
    }
    
    // Create CSV content
    const csvContent = createCSVContent(monthEntries);
    
    // Download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `work-log-${monthName}-${year}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showToast('Data exported successfully');
}

function createCSVContent(entries) {
    const headers = ['Date', 'Entry Type', 'Project', 'Hours', 'Half Day Period', 'Comments'];
    const csvLines = [headers.join(',')];
    
    entries.forEach(entry => {
        const row = [
            entry.date,
            entryTypes[entry.type].label,
            getProjectDisplayName(entry.project) || 'N/A',
            getEntryHours(entry),
            entry.halfDayPeriod || 'N/A',
            `"${entry.comments || 'N/A'}"`
        ];
        csvLines.push(row.join(','));
    });
    
    return csvLines.join('\n');
}

function getEntryHours(entry) {
    if (entry.type === 'work') return entry.hours || 0;
    if (entry.type === 'halfLeave') return 4;
    if (entry.type === 'fullLeave' || entry.type === 'holiday') return 8;
    return 0;
}

function getProjectDisplayName(projectValue) {
    if (!projectValue) return '';
    
    const project = projectData.find(p => `${p.projectId}-${p.subCode}` === projectValue);
    return project ? `${project.projectId} (${project.subCode}) - ${project.projectTitle}` : projectValue;
}

function getEntryTypesForDate(dateKey) {
    const entries = workLogData[dateKey] || [];
    return [...new Set(entries.map(entry => entry.type))];
}

function formatDateKey(date) {
    return date.toISOString().split('T')[0];
}

function isDateToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getAuthErrorMessage(errorCode) {
    switch (errorCode) {
        case 'auth/user-not-found':
            return 'No account found with this email address';
        case 'auth/wrong-password':
            return 'Invalid password';
        case 'auth/email-already-in-use':
            return 'An account with this email already exists';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters';
        case 'auth/invalid-email':
            return 'Invalid email address';
        case 'auth/network-request-failed':
            return 'Network error. Please check your connection';
        default:
            return 'An error occurred. Please try again';
    }
}

// Global functions for inline event handlers
window.editEntry = editEntry;
window.deleteEntry = deleteEntry;
window.editProject = (projectId) => {
    showToast('Edit project functionality coming soon');
};
window.deleteProject = deleteProject;
