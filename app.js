// Firebase Configuration - Updated with your actual config
const firebaseConfig = {
    apiKey: "AIzaSyD0fCY4dwc0igmcTYJOU2rRGQ0ERSVz2l4",
    authDomain: "daily-work-log-tracker.firebaseapp.com", 
    projectId: "daily-work-log-tracker",
    storageBucket: "daily-work-log-tracker.firebasestorage.app",
    messagingSenderId: "891051391167",
    appId: "1:891051391167:web:1050e984fa86b4d070ee0a",
    measurementId: "G-3X0E8CJX59"
};

// Initialize Firebase (with error handling)
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

// Application state
let currentUser = null;
let isGuestMode = false;
let currentDate = new Date();
let selectedDate = null;
let editingEntry = null;
let workLogData = {};

// DOM elements cache - MATCHING YOUR ACTUAL HTML IDs
let elements = {};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    
    // Cache DOM elements with your actual IDs
    cacheElements();
    
    // Hide loading overlay immediately - using your actual ID
    hideLoadingOverlay();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize authentication flow
    initializeAuth();
});

function cacheElements() {
    // Using YOUR actual HTML element IDs
    elements = {
        // Loading overlay
        loadingOverlay: document.getElementById('loadingOverlay'),
        loadingText: document.getElementById('loadingText'),
        
        // Auth elements - using your actual IDs
        authContainer: document.getElementById('authContainer'),
        appContainer: document.getElementById('appContainer'),
        
        // Auth tabs
        loginTab: document.getElementById('loginTab'),
        registerTab: document.getElementById('registerTab'),
        guestTab: document.getElementById('guestTab'),
        
        // Auth forms
        loginForm: document.getElementById('loginForm'),
        registerForm: document.getElementById('registerForm'),
        guestMode: document.getElementById('guestMode'),
        
        // Login form inputs
        loginEmail: document.getElementById('loginEmail'),
        loginPassword: document.getElementById('loginPassword'),
        
        // Register form inputs
        registerEmail: document.getElementById('registerEmail'),
        registerPassword: document.getElementById('registerPassword'),
        confirmPassword: document.getElementById('confirmPassword'),
        registerEmployeeId: document.getElementById('registerEmployeeId'),
        
        // Guest mode
        guestEmployeeId: document.getElementById('guestEmployeeId'),
        continueAsGuest: document.getElementById('continueAsGuest'),
        
        // Main app elements
        userDisplayName: document.getElementById('userDisplayName'),
        userEmail: document.getElementById('userEmail'),
        userEmployeeId: document.getElementById('userEmployeeId'),
        logoutBtn: document.getElementById('logoutBtn'),
        
        // Calendar elements
        calendarDates: document.getElementById('calendarDates'),
        monthSelector: document.getElementById('monthSelector'),
        prevMonth: document.getElementById('prevMonth'),
        nextMonth: document.getElementById('nextMonth'),
        selectedDateDisplay: document.getElementById('selectedDateDisplay'),
        
        // Entry form elements
        entryForm: document.getElementById('entryForm'),
        workTab: document.getElementById('workTab'),
        holidayTab: document.getElementById('holidayTab'),
        leaveTab: document.getElementById('leaveTab'),
        projectForm: document.getElementById('projectForm'),
        specialEntryForm: document.getElementById('specialEntryForm'),
        
        // Project selection
        projectSelection: document.getElementById('projectSelection'),
        subCodeSelection: document.getElementById('subCodeSelection'),
        chargeCode: document.getElementById('chargeCode'),
        hoursSpent: document.getElementById('hoursSpent'),
        comments: document.getElementById('comments'),
        
        // Daily entries
        dailyEmptyState: document.getElementById('dailyEmptyState'),
        dailyProjectList: document.getElementById('dailyProjectList'),
        dailyTotalHours: document.getElementById('dailyTotalHours'),
        
        // Summary elements
        totalDaysWorked: document.getElementById('totalDaysWorked'),
        totalHoursMonth: document.getElementById('totalHoursMonth'),
        averageHours: document.getElementById('averageHours'),
        totalProjects: document.getElementById('totalProjects'),
        
        // Message container
        messageContainer: document.getElementById('messageContainer')
    };
}

function hideLoadingOverlay() {
    console.log('Hiding loading overlay...');
    if (elements.loadingOverlay) {
        elements.loadingOverlay.classList.add('hidden');
        console.log('Loading overlay hidden successfully');
    } else {
        console.warn('Loading overlay element not found');
    }
}

function showLoadingOverlay(message = 'Loading...') {
    console.log('Showing loading overlay...');
    if (elements.loadingOverlay) {
        elements.loadingOverlay.classList.remove('hidden');
        if (elements.loadingText) {
            elements.loadingText.textContent = message;
        }
    }
}

function initializeAuth() {
    console.log('Initializing auth, Firebase initialized:', firebaseInitialized);
    
    // Always show auth screen first
    showAuthScreen();
    
    if (firebaseInitialized) {
        // Set up Firebase auth state listener
        auth.onAuthStateChanged(user => {
            console.log('Auth state changed:', user ? 'User logged in' : 'No user');
            if (user) {
                currentUser = user;
                isGuestMode = false;
                showMainApp();
                loadUserData();
            } else if (!isGuestMode) {
                showAuthScreen();
            }
        });
    } else {
        console.log('Firebase not available, showing auth screen');
        showAuthScreen();
    }
}

function showAuthScreen() {
    console.log('Showing auth screen');
    if (elements.authContainer) {
        elements.authContainer.classList.remove('hidden');
    }
    if (elements.appContainer) {
        elements.appContainer.classList.add('hidden');
    }
    hideLoadingOverlay();
}

function showMainApp() {
    console.log('Showing main app');
    if (elements.authContainer) {
        elements.authContainer.classList.add('hidden');
    }
    if (elements.appContainer) {
        elements.appContainer.classList.remove('hidden');
    }
    hideLoadingOverlay();
    
    // Initialize main app functionality
    initializeCalendar();
    populateProjectDropdowns();
    updateSummary();
}

// Event listeners setup
function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Auth tab switching
    if (elements.loginTab) {
        elements.loginTab.addEventListener('click', () => showAuthTab('login'));
    }
    if (elements.registerTab) {
        elements.registerTab.addEventListener('click', () => showAuthTab('register'));
    }
    if (elements.guestTab) {
        elements.guestTab.addEventListener('click', () => showAuthTab('guest'));
    }
    
    // Auth form submissions
    if (elements.loginForm) {
        elements.loginForm.addEventListener('submit', handleLogin);
    }
    if (elements.registerForm) {
        elements.registerForm.addEventListener('submit', handleRegister);
    }
    if (elements.continueAsGuest) {
        elements.continueAsGuest.addEventListener('click', continueAsGuest);
    }
    
    // Main app navigation
    if (elements.prevMonth) {
        elements.prevMonth.addEventListener('click', () => navigateMonth(-1));
    }
    if (elements.nextMonth) {
        elements.nextMonth.addEventListener('click', () => navigateMonth(1));
    }
    if (elements.monthSelector) {
        elements.monthSelector.addEventListener('change', handleMonthChange);
    }
    
    // Entry form tabs
    if (elements.workTab) {
        elements.workTab.addEventListener('click', () => showEntryTab('work'));
    }
    if (elements.holidayTab) {
        elements.holidayTab.addEventListener('click', () => showEntryTab('holiday'));
    }
    if (elements.leaveTab) {
        elements.leaveTab.addEventListener('click', () => showEntryTab('leave'));
    }
    
    // Project form
    if (elements.projectForm) {
        elements.projectForm.addEventListener('submit', handleProjectSubmit);
    }
    if (elements.specialEntryForm) {
        elements.specialEntryForm.addEventListener('submit', handleSpecialEntrySubmit);
    }
    
    // Project selection
    if (elements.projectSelection) {
        elements.projectSelection.addEventListener('change', handleProjectChange);
    }
    
    // Logout
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', handleLogout);
    }
    
    console.log('Event listeners set up successfully');
}

function showAuthTab(tabName) {
    console.log('Showing auth tab:', tabName);
    
    // Reset tab classes
    if (elements.loginTab) elements.loginTab.classList.remove('active');
    if (elements.registerTab) elements.registerTab.classList.remove('active');
    if (elements.guestTab) elements.guestTab.classList.remove('active');
    
    // Hide all forms
    if (elements.loginForm) elements.loginForm.classList.add('hidden');
    if (elements.registerForm) elements.registerForm.classList.add('hidden');
    if (elements.guestMode) elements.guestMode.classList.add('hidden');
    
    // Show selected tab and form
    switch(tabName) {
        case 'login':
            if (elements.loginTab) elements.loginTab.classList.add('active');
            if (elements.loginForm) elements.loginForm.classList.remove('hidden');
            break;
        case 'register':
            if (elements.registerTab) elements.registerTab.classList.add('active');
            if (elements.registerForm) elements.registerForm.classList.remove('hidden');
            break;
        case 'guest':
            if (elements.guestTab) elements.guestTab.classList.add('active');
            if (elements.guestMode) elements.guestMode.classList.remove('hidden');
            break;
    }
}

// Authentication functions
async function handleLogin(e) {
    e.preventDefault();
    console.log('Handle login...');
    
    if (!firebaseInitialized) {
        showMessage('Firebase is not available. Please use Guest mode.', 'error');
        return;
    }
    
    const email = elements.loginEmail.value.trim();
    const password = elements.loginPassword.value;
    
    if (!email || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    showLoadingOverlay('Logging in...');
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
        showMessage('Login successful!', 'success');
    } catch (error) {
        showMessage(getAuthErrorMessage(error.code), 'error');
        hideLoadingOverlay();
    }
}

async function handleRegister(e) {
    e.preventDefault();
    console.log('Handle register...');
    
    if (!firebaseInitialized) {
        showMessage('Firebase is not available. Please use Guest mode.', 'error');
        return;
    }
    
    const email = elements.registerEmail.value.trim();
    const password = elements.registerPassword.value;
    const confirmPassword = elements.confirmPassword.value;
    const employeeId = elements.registerEmployeeId.value.trim();
    
    const errors = [];
    if (!email) errors.push('Email is required');
    if (!password) errors.push('Password is required');
    if (password.length < 6) errors.push('Password must be at least 6 characters');
    if (password !== confirmPassword) errors.push('Passwords do not match');
    if (!employeeId) errors.push('Employee ID is required');
    
    if (errors.length > 0) {
        showMessage(errors.join(', '), 'error');
        return;
    }
    
    showLoadingOverlay('Creating account...');
    
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        await userCredential.user.updateProfile({ 
            displayName: employeeId 
        });
        
        // Save user data to Firestore
        if (db) {
            await db.collection('users').doc(userCredential.user.uid).set({
                email: email,
                employeeId: employeeId,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                projects: projectData
            });
        }
        
        showMessage('Account created successfully!', 'success');
    } catch (error) {
        showMessage(getAuthErrorMessage(error.code), 'error');
        hideLoadingOverlay();
    }
}

function continueAsGuest() {
    console.log('Continue as guest...');
    isGuestMode = true;
    currentUser = { 
        uid: 'guest',
        displayName: elements.guestEmployeeId.value.trim() || 'Guest User',
        email: 'guest@local.com'
    };
    showMessage('Continuing in guest mode - data stored locally only', 'info');
    showMainApp();
}

async function handleLogout() {
    console.log('Handle logout...');
    
    if (currentUser && firebaseInitialized && !isGuestMode) {
        await auth.signOut();
    }
    
    currentUser = null;
    isGuestMode = false;
    workLogData = {};
    showMessage('Logged out successfully', 'success');
    showAuthScreen();
}

// Calendar functions
function initializeCalendar() {
    console.log('Initializing calendar...');
    populateMonthSelector();
    renderCalendar();
}

function populateMonthSelector() {
    if (!elements.monthSelector) return;
    
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    elements.monthSelector.innerHTML = '';
    
    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = `${currentYear}-${index}`;
        option.textContent = `${month} ${currentYear}`;
        option.selected = index === currentMonth;
        elements.monthSelector.appendChild(option);
    });
}

function renderCalendar() {
    console.log('Rendering calendar...');
    if (!elements.calendarDates) return;
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    elements.calendarDates.innerHTML = '';
    
    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const dayElement = createCalendarDay(date, month);
        elements.calendarDates.appendChild(dayElement);
    }
}

function createCalendarDay(date, currentMonth) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-date';
    dayElement.textContent = date.getDate();
    
    const isCurrentMonth = date.getMonth() === currentMonth;
    const isToday = isDateToday(date);
    const dateKey = formatDateKey(date);
    const hasEntries = workLogData[dateKey] && workLogData[dateKey].length > 0;
    
    if (!isCurrentMonth) {
        dayElement.classList.add('other-month');
    }
    
    if (isToday) {
        dayElement.classList.add('today');
    }
    
    if (hasEntries) {
        dayElement.classList.add('has-entries');
    }
    
    dayElement.addEventListener('click', () => selectDate(date));
    
    return dayElement;
}

function selectDate(date) {
    selectedDate = new Date(date);
    console.log('Selected date:', selectedDate);
    
    // Update selected date display
    if (elements.selectedDateDisplay) {
        const formatted = new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(selectedDate);
        elements.selectedDateDisplay.textContent = formatted;
    }
    
    // Show entry form
    if (elements.entryForm) {
        elements.entryForm.classList.remove('hidden');
    }
    
    // Render daily entries
    renderDailyEntries();
    
    // Re-render calendar to show selection
    renderCalendar();
}

function navigateMonth(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    populateMonthSelector();
    renderCalendar();
}

function handleMonthChange(e) {
    const [year, month] = e.target.value.split('-');
    currentDate.setFullYear(parseInt(year), parseInt(month));
    renderCalendar();
}

// Entry form functions
function showEntryTab(tabName) {
    console.log('Showing entry tab:', tabName);
    
    // Reset tab classes
    if (elements.workTab) elements.workTab.classList.remove('active');
    if (elements.holidayTab) elements.holidayTab.classList.remove('active');
    if (elements.leaveTab) elements.leaveTab.classList.remove('active');
    
    // Hide all forms
    if (elements.projectForm) elements.projectForm.classList.add('hidden');
    if (elements.specialEntryForm) elements.specialEntryForm.classList.add('hidden');
    
    // Show selected tab and form
    switch(tabName) {
        case 'work':
            if (elements.workTab) elements.workTab.classList.add('active');
            if (elements.projectForm) elements.projectForm.classList.remove('hidden');
            break;
        case 'holiday':
        case 'leave':
            if (elements.holidayTab && tabName === 'holiday') elements.holidayTab.classList.add('active');
            if (elements.leaveTab && tabName === 'leave') elements.leaveTab.classList.add('active');
            if (elements.specialEntryForm) elements.specialEntryForm.classList.remove('hidden');
            break;
    }
}

function populateProjectDropdowns() {
    console.log('Populating project dropdowns...');
    if (!elements.projectSelection) return;
    
    elements.projectSelection.innerHTML = '<option value="">Select a project...</option>';
    
    projectData.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = `${project.projectId} - ${project.projectTitle}`;
        elements.projectSelection.appendChild(option);
    });
}

function handleProjectChange(e) {
    const projectId = e.target.value;
    if (!projectId) return;
    
    const project = projectData.find(p => p.id === projectId);
    if (!project) return;
    
    // Populate sub codes
    if (elements.subCodeSelection) {
        elements.subCodeSelection.disabled = false;
        elements.subCodeSelection.innerHTML = `<option value="${project.subCode}">${project.subCode}</option>`;
    }
    
    // Generate charge code
    if (elements.chargeCode) {
        elements.chargeCode.value = `${project.projectId}-${project.subCode}`;
    }
}

async function handleProjectSubmit(e) {
    e.preventDefault();
    console.log('Handle project submit...');
    
    if (!selectedDate) {
        showMessage('Please select a date first', 'error');
        return;
    }
    
    const projectId = elements.projectSelection.value;
    const hours = parseFloat(elements.hoursSpent.value);
    const comments = elements.comments.value.trim();
    
    if (!projectId || !hours) {
        showMessage('Please fill in all required fields', 'error');
        return;
    }
    
    const dateKey = formatDateKey(selectedDate);
    const entry = {
        id: generateId(),
        type: 'work',
        projectId: projectId,
        hours: hours,
        comments: comments,
        timestamp: new Date().toISOString()
    };
    
    if (!workLogData[dateKey]) {
        workLogData[dateKey] = [];
    }
    
    workLogData[dateKey].push(entry);
    
    await saveData();
    showMessage('Entry added successfully!', 'success');
    renderDailyEntries();
    updateSummary();
    
    // Reset form
    elements.projectForm.reset();
    if (elements.chargeCode) elements.chargeCode.value = '';
}

async function handleSpecialEntrySubmit(e) {
    e.preventDefault();
    console.log('Handle special entry submit...');
    
    if (!selectedDate) {
        showMessage('Please select a date first', 'error');
        return;
    }
    
    const specialType = document.getElementById('specialType')?.value;
    const specialComments = document.getElementById('specialComments')?.value.trim();
    
    if (!specialType || !specialComments) {
        showMessage('Please fill in all required fields', 'error');
        return;
    }
    
    const dateKey = formatDateKey(selectedDate);
    const entry = {
        id: generateId(),
        type: specialType.toLowerCase(),
        comments: specialComments,
        hours: 8, // Full day
        timestamp: new Date().toISOString()
    };
    
    if (!workLogData[dateKey]) {
        workLogData[dateKey] = [];
    }
    
    workLogData[dateKey].push(entry);
    
    await saveData();
    showMessage('Entry added successfully!', 'success');
    renderDailyEntries();
    updateSummary();
    
    // Reset form
    elements.specialEntryForm.reset();
}

function renderDailyEntries() {
    console.log('Rendering daily entries...');
    if (!selectedDate) return;
    
    const dateKey = formatDateKey(selectedDate);
    const entries = workLogData[dateKey] || [];
    
    if (entries.length === 0) {
        if (elements.dailyEmptyState) elements.dailyEmptyState.classList.remove('hidden');
        if (elements.dailyProjectList) elements.dailyProjectList.classList.add('hidden');
        if (elements.dailyTotalHours) elements.dailyTotalHours.textContent = '0.00';
        return;
    }
    
    if (elements.dailyEmptyState) elements.dailyEmptyState.classList.add('hidden');
    if (elements.dailyProjectList) {
        elements.dailyProjectList.classList.remove('hidden');
        
        let totalHours = 0;
        elements.dailyProjectList.innerHTML = entries.map(entry => {
            totalHours += entry.hours;
            const project = projectData.find(p => p.id === entry.projectId);
            const projectName = project ? `${project.projectId} - ${project.projectTitle}` : 'Special Entry';
            
            return `
                <div class="project-entry">
                    <div class="project-info">
                        <div class="project-name">${projectName}</div>
                        <div class="project-details">${entry.hours} hrs${entry.comments ? ` - ${entry.comments}` : ''}</div>
                    </div>
                    <button class="btn-remove" onclick="removeEntry('${entry.id}')" title="Remove entry">×</button>
                </div>
            `;
        }).join('');
        
        if (elements.dailyTotalHours) {
            elements.dailyTotalHours.textContent = totalHours.toFixed(2);
        }
    }
}

async function removeEntry(entryId) {
    if (!confirm('Are you sure you want to remove this entry?')) return;
    
    const dateKey = formatDateKey(selectedDate);
    if (workLogData[dateKey]) {
        workLogData[dateKey] = workLogData[dateKey].filter(entry => entry.id !== entryId);
        if (workLogData[dateKey].length === 0) {
            delete workLogData[dateKey];
        }
    }
    
    await saveData();
    showMessage('Entry removed successfully!', 'success');
    renderDailyEntries();
    updateSummary();
}

// Data management
async function saveData() {
    if (isGuestMode) {
        localStorage.setItem('workLogData', JSON.stringify(workLogData));
        localStorage.setItem('projectData', JSON.stringify(projectData));
        console.log('Data saved locally');
    } else if (currentUser && firebaseInitialized) {
        try {
            await db.collection('workLogs').doc(currentUser.uid).set({
                data: workLogData,
                projects: projectData,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('Data saved to cloud');
        } catch (error) {
            console.error('Error saving to cloud:', error);
            // Fallback to local storage
            localStorage.setItem('workLogData', JSON.stringify(workLogData));
            localStorage.setItem('projectData', JSON.stringify(projectData));
        }
    }
}

async function loadUserData() {
    if (isGuestMode) {
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
    } else if (currentUser && firebaseInitialized) {
        try {
            const doc = await db.collection('workLogs').doc(currentUser.uid).get();
            if (doc.exists()) {
                const data = doc.data();
                workLogData = data.data || {};
                projectData = data.projects || projectData;
            }
        } catch (error) {
            console.error('Error loading from cloud:', error);
        }
    }
}

function updateSummary() {
    console.log('Updating summary...');
    
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    let totalDays = 0;
    let totalHours = 0;
    let totalEntries = 0;
    
    Object.keys(workLogData).forEach(dateKey => {
        const date = new Date(dateKey);
        if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
            const dayEntries = workLogData[dateKey];
            if (dayEntries.length > 0) {
                totalDays++;
                dayEntries.forEach(entry => {
                    totalHours += entry.hours;
                    totalEntries++;
                });
            }
        }
    });
    
    if (elements.totalDaysWorked) elements.totalDaysWorked.textContent = totalDays;
    if (elements.totalHoursMonth) elements.totalHoursMonth.textContent = totalHours.toFixed(2);
    if (elements.averageHours) {
        const avg = totalDays > 0 ? totalHours / totalDays : 0;
        elements.averageHours.textContent = avg.toFixed(2);
    }
    if (elements.totalProjects) elements.totalProjects.textContent = totalEntries;
}

// Utility functions
function showMessage(message, type = 'info') {
    console.log(`${type.toUpperCase()}: ${message}`);
    
    if (elements.messageContainer) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;
        
        elements.messageContainer.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
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
    const messages = {
        'auth/user-not-found': 'No account found with this email address',
        'auth/wrong-password': 'Invalid password',
        'auth/email-already-in-use': 'An account with this email already exists',
        'auth/weak-password': 'Password should be at least 6 characters',
        'auth/invalid-email': 'Invalid email address',
        'auth/network-request-failed': 'Network error. Please check your connection',
        'auth/too-many-requests': 'Too many failed attempts. Please try again later.'
    };
    
    return messages[errorCode] || 'An error occurred. Please try again.';
}

// Global functions for onclick handlers
window.removeEntry = removeEntry;

console.log('App.js loaded successfully')
