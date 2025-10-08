// Enhanced Work Log Tracker with Dynamic Project Management
class WorkLogTracker {
    constructor() {
        // Initialize project data with enhanced structure
        this.projectData = [];
        this.entryTypes = {
            work: { label: "Work Entry", color: "#3b82f6", maxHours: 8 },
            fullLeave: { label: "Full Day Leave", color: "#ef4444", maxHours: 8 },
            halfLeave: { label: "Half Day Leave", color: "#f97316", maxHours: 4 },
            holiday: { label: "Holiday", color: "#22c55e", maxHours: 8 }
        };
        
        this.projectCategories = ["Development", "Strategy", "Tracking", "Research", "Overhead", "Controller", "Other"];
        
        // Application state
        this.currentDate = new Date();
        this.selectedDate = null;
        this.editingEntry = null;
        this.editingProject = null;
        this.workLogData = {};
        this.filteredProjects = [];
        this.currentSortField = null;
        this.currentSortDirection = 'asc';
        
        // Initialize DOM elements
        this.initializeElements();
        
        // Load and migrate data
        this.loadData();
        this.migrateStaticProjectData();
        
        // Setup application
        this.setupEventListeners();
        this.renderCalendar();
        this.selectDate(new Date());
        this.updateProjectStats();
    }
    
    initializeElements() {
        this.elements = {
            // Calendar elements
            calendarGrid: document.getElementById('calendarGrid'),
            currentMonth: document.getElementById('currentMonth'),
            prevMonthBtn: document.getElementById('prevMonthBtn'),
            nextMonthBtn: document.getElementById('nextMonthBtn'),
            
            // Entry form elements
            selectedDateDisplay: document.getElementById('selectedDateDisplay'),
            totalHours: document.getElementById('totalHours'),
            validationWarning: document.getElementById('validationWarning'),
            entryForm: document.getElementById('entryForm'),
            entryType: document.getElementById('entryType'),
            projectGroup: document.getElementById('projectGroup'),
            project: document.getElementById('project'),
            projectSearch: document.getElementById('projectSearch'),
            projectSuggestions: document.getElementById('projectSuggestions'),
            hoursGroup: document.getElementById('hoursGroup'),
            hours: document.getElementById('hours'),
            halfDayPeriodGroup: document.getElementById('halfDayPeriodGroup'),
            halfDayPeriod: document.getElementById('halfDayPeriod'),
            comments: document.getElementById('comments'),
            addEntryBtn: document.getElementById('addEntryBtn'),
            cancelEntryBtn: document.getElementById('cancelEntryBtn'),
            formErrors: document.getElementById('formErrors'),
            entriesList: document.getElementById('entriesList'),
            
            // Header actions
            manageProjectsBtn: document.getElementById('manageProjectsBtn'),
            exportBtn: document.getElementById('exportBtn'),
            
            // Project Management Modal
            projectManagementModal: document.getElementById('projectManagementModal'),
            closeProjectModalBtn: document.getElementById('closeProjectModalBtn'),
            addNewProjectBtn: document.getElementById('addNewProjectBtn'),
            importProjectsBtn: document.getElementById('importProjectsBtn'),
            exportProjectsBtn: document.getElementById('exportProjectsBtn'),
            projectSearchModal: document.getElementById('projectSearchModal'),
            totalProjectsCount: document.getElementById('totalProjectsCount'),
            activeProjectsCount: document.getElementById('activeProjectsCount'),
            archivedProjectsCount: document.getElementById('archivedProjectsCount'),
            projectTable: document.getElementById('projectTable'),
            projectTableBody: document.getElementById('projectTableBody'),
            
            // Add/Edit Project Modal
            addEditProjectModal: document.getElementById('addEditProjectModal'),
            addEditProjectTitle: document.getElementById('addEditProjectTitle'),
            projectIdInput: document.getElementById('projectIdInput'),
            subCodeInput: document.getElementById('subCodeInput'),
            projectTitleInput: document.getElementById('projectTitleInput'),
            projectCategoryInput: document.getElementById('projectCategoryInput'),
            projectDescriptionInput: document.getElementById('projectDescriptionInput'),
            saveProjectBtn: document.getElementById('saveProjectBtn'),
            cancelProjectBtn: document.getElementById('cancelProjectBtn'),
            projectFormErrors: document.getElementById('projectFormErrors'),
            
            // Import/Export Modal
            importExportModal: document.getElementById('importExportModal'),
            importExportTitle: document.getElementById('importExportTitle'),
            importSection: document.getElementById('importSection'),
            exportSection: document.getElementById('exportSection'),
            importFileInput: document.getElementById('importFileInput'),
            importPreview: document.getElementById('importPreview'),
            importPreviewContent: document.getElementById('importPreviewContent'),
            exportJSONBtn: document.getElementById('exportJSONBtn'),
            exportCSVBtn: document.getElementById('exportCSVBtn'),
            executeImportBtn: document.getElementById('executeImportBtn'),
            closeImportExportBtn: document.getElementById('closeImportExportBtn'),
            importExportErrors: document.getElementById('importExportErrors'),
            
            // Common elements
            toast: document.getElementById('toast'),
            toastMessage: document.getElementById('toastMessage'),
            confirmModal: document.getElementById('confirmModal'),
            confirmModalTitle: document.getElementById('confirmModalTitle'),
            confirmModalMessage: document.getElementById('confirmModalMessage'),
            confirmActionBtn: document.getElementById('confirmActionBtn'),
            cancelActionBtn: document.getElementById('cancelActionBtn')
        };
    }
    
    setupEventListeners() {
        // Calendar navigation
        this.elements.prevMonthBtn.addEventListener('click', () => this.navigateMonth(-1));
        this.elements.nextMonthBtn.addEventListener('click', () => this.navigateMonth(1));
        
        // Entry form
        this.elements.entryType.addEventListener('change', () => this.handleEntryTypeChange());
        this.elements.addEntryBtn.addEventListener('click', () => this.handleAddEntry());
        this.elements.cancelEntryBtn.addEventListener('click', () => this.cancelEdit());
        this.elements.hours.addEventListener('input', () => this.validateHours());
        
        // Enhanced project search
        this.elements.projectSearch.addEventListener('input', (e) => this.handleProjectSearch(e.target.value));
        this.elements.projectSearch.addEventListener('keydown', (e) => this.handleProjectSearchKeydown(e));
        this.elements.projectSearch.addEventListener('blur', () => {
            setTimeout(() => this.hideProjectSuggestions(), 150);
        });
        
        // Header actions
        this.elements.manageProjectsBtn.addEventListener('click', () => this.openProjectManagementModal());
        this.elements.exportBtn.addEventListener('click', () => this.exportMonthData());
        
        // Project Management Modal
        this.elements.closeProjectModalBtn.addEventListener('click', () => this.closeProjectManagementModal());
        this.elements.addNewProjectBtn.addEventListener('click', () => this.openAddProjectModal());
        this.elements.importProjectsBtn.addEventListener('click', () => this.openImportModal());
        this.elements.exportProjectsBtn.addEventListener('click', () => this.openExportModal());
        this.elements.projectSearchModal.addEventListener('input', (e) => this.filterProjects(e.target.value));
        
        // Add/Edit Project Modal
        this.elements.saveProjectBtn.addEventListener('click', () => this.saveProject());
        this.elements.cancelProjectBtn.addEventListener('click', () => this.closeAddEditProjectModal());
        
        // Import/Export Modal
        this.elements.importFileInput.addEventListener('change', (e) => this.handleFileImport(e));
        this.elements.exportJSONBtn.addEventListener('click', () => this.exportProjectsJSON());
        this.elements.exportCSVBtn.addEventListener('click', () => this.exportProjectsCSV());
        this.elements.executeImportBtn.addEventListener('click', () => this.executeImport());
        this.elements.closeImportExportBtn.addEventListener('click', () => this.closeImportExportModal());
        
        // Confirmation modal
        this.elements.cancelActionBtn.addEventListener('click', () => this.closeConfirmModal());
    }
    
    // Data Management
    loadData() {
        // Load work log data
        const savedWorkLog = localStorage.getItem('workLogData');
        if (savedWorkLog) {
            try {
                this.workLogData = JSON.parse(savedWorkLog);
            } catch (e) {
                this.workLogData = {};
            }
        }
        
        // Load project data
        const savedProjects = localStorage.getItem('projectData');
        if (savedProjects) {
            try {
                this.projectData = JSON.parse(savedProjects);
            } catch (e) {
                this.projectData = [];
            }
        }
    }
    
    saveData() {
        localStorage.setItem('workLogData', JSON.stringify(this.workLogData));
        localStorage.setItem('projectData', JSON.stringify(this.projectData));
    }
    
    migrateStaticProjectData() {
        // Initial project data from the original app
        const initialProjects = [
            { projectId: "IN-1100-NA", subCode: "0010", projectTitle: "General Overhead" },
            { projectId: "WV-1112-4152", subCode: "0210", projectTitle: "AS_Strategy" },
            { projectId: "WV-1112-4152", subCode: "1010", projectTitle: "AS_Strategy" },
            { projectId: "WV-1112-4152", subCode: "1020", projectTitle: "AS_Strategy" },
            { projectId: "RW-1173-9573P00303", subCode: "0010", projectTitle: "RW Tracking" },
            { projectId: "WV-1137-D75B1-C4285-08-03", subCode: "1250", projectTitle: "MERCIA_INSIGNIA_ElectronicController_Mil" },
            { projectId: "WV-1116-4306", subCode: "0020", projectTitle: "SensorLess_Controller_Demo" }
        ];
        
        // If no projects exist, migrate from initial data
        if (this.projectData.length === 0) {
            this.projectData = initialProjects.map(proj => ({
                id: this.generateId(),
                projectId: proj.projectId,
                subCode: proj.subCode,
                projectTitle: proj.projectTitle,
                description: "",
                category: this.inferCategory(proj.projectTitle),
                isActive: true,
                createdDate: new Date().toISOString().split('T')[0],
                lastUsed: null,
                usageCount: 0
            }));
            this.saveData();
        }
        
        this.populateProjectDropdown();
    }
    
    inferCategory(title) {
        const titleLower = title.toLowerCase();
        if (titleLower.includes('strategy')) return 'Strategy';
        if (titleLower.includes('tracking')) return 'Tracking';
        if (titleLower.includes('controller')) return 'Controller';
        if (titleLower.includes('overhead')) return 'Overhead';
        return 'Development';
    }
    
    // Project Management Methods
    addProject(projectData) {
        const newProject = {
            id: this.generateId(),
            projectId: projectData.projectId,
            subCode: projectData.subCode,
            projectTitle: projectData.projectTitle,
            description: projectData.description || "",
            category: projectData.category || "Other",
            isActive: true,
            createdDate: new Date().toISOString().split('T')[0],
            lastUsed: null,
            usageCount: 0
        };
        
        this.projectData.push(newProject);
        this.saveData();
        this.populateProjectDropdown();
        this.updateProjectStats();
        return newProject;
    }
    
    updateProject(id, projectData) {
        const index = this.projectData.findIndex(p => p.id === id);
        if (index !== -1) {
            this.projectData[index] = {
                ...this.projectData[index],
                ...projectData
            };
            this.saveData();
            this.populateProjectDropdown();
            this.updateProjectStats();
            return this.projectData[index];
        }
        return null;
    }
    
    deleteProject(id) {
        // Check if project is used in existing logs
        const isUsed = this.isProjectUsed(id);
        if (isUsed) {
            this.showConfirmDialog(
                'Project In Use',
                'This project is used in existing work logs. Archive instead of delete?',
                () => {
                    this.archiveProject(id);
                    this.closeConfirmModal();
                }
            );
            return false;
        }
        
        this.projectData = this.projectData.filter(p => p.id !== id);
        this.saveData();
        this.populateProjectDropdown();
        this.updateProjectStats();
        return true;
    }
    
    archiveProject(id) {
        const project = this.projectData.find(p => p.id === id);
        if (project) {
            project.isActive = false;
            this.saveData();
            this.populateProjectDropdown();
            this.updateProjectStats();
            this.renderProjectTable();
            this.showToast('Project archived successfully');
        }
    }
    
    restoreProject(id) {
        const project = this.projectData.find(p => p.id === id);
        if (project) {
            project.isActive = true;
            this.saveData();
            this.populateProjectDropdown();
            this.updateProjectStats();
            this.renderProjectTable();
            this.showToast('Project restored successfully');
        }
    }
    
    isProjectUsed(projectId) {
        const project = this.projectData.find(p => p.id === projectId);
        if (!project) return false;
        
        const projectKey = `${project.projectId}-${project.subCode}`;
        
        for (let dateKey in this.workLogData) {
            const entries = this.workLogData[dateKey];
            if (entries.some(entry => entry.project === projectKey)) {
                return true;
            }
        }
        return false;
    }
    
    getProjectById(id) {
        return this.projectData.find(p => p.id === id);
    }
    
    searchProjects(searchTerm) {
        if (!searchTerm) return this.projectData.filter(p => p.isActive);
        
        const term = searchTerm.toLowerCase();
        return this.projectData.filter(p => 
            p.isActive && (
                p.projectId.toLowerCase().includes(term) ||
                p.subCode.toLowerCase().includes(term) ||
                p.projectTitle.toLowerCase().includes(term) ||
                p.category.toLowerCase().includes(term)
            )
        );
    }
    
    getProjectUsageStats() {
        const stats = {};
        
        for (let dateKey in this.workLogData) {
            const entries = this.workLogData[dateKey];
            entries.forEach(entry => {
                if (entry.project) {
                    if (!stats[entry.project]) {
                        stats[entry.project] = { count: 0, totalHours: 0 };
                    }
                    stats[entry.project].count++;
                    stats[entry.project].totalHours += entry.hours || 0;
                }
            });
        }
        
        return stats;
    }
    
    updateProjectUsage(projectKey) {
        const [projectId, subCode] = projectKey.split('-', 2);
        const project = this.projectData.find(p => 
            p.projectId === projectId && p.subCode === subCode.split('-').pop()
        );
        
        if (project) {
            project.usageCount++;
            project.lastUsed = new Date().toISOString().split('T')[0];
            this.saveData();
        }
    }
    
    // UI Methods for Project Management
    openProjectManagementModal() {
        this.elements.projectManagementModal.classList.remove('hidden');
        this.renderProjectTable();
        this.updateProjectStats();
    }
    
    closeProjectManagementModal() {
        this.elements.projectManagementModal.classList.add('hidden');
    }
    
    openAddProjectModal() {
        this.editingProject = null;
        this.elements.addEditProjectTitle.textContent = 'Add New Project';
        this.resetProjectForm();
        this.elements.addEditProjectModal.classList.remove('hidden');
    }
    
    openEditProjectModal(projectId) {
        const project = this.getProjectById(projectId);
        if (!project) return;
        
        this.editingProject = project;
        this.elements.addEditProjectTitle.textContent = 'Edit Project';
        
        // Populate form
        this.elements.projectIdInput.value = project.projectId;
        this.elements.subCodeInput.value = project.subCode;
        this.elements.projectTitleInput.value = project.projectTitle;
        this.elements.projectCategoryInput.value = project.category;
        this.elements.projectDescriptionInput.value = project.description || '';
        
        this.elements.addEditProjectModal.classList.remove('hidden');
    }
    
    closeAddEditProjectModal() {
        this.elements.addEditProjectModal.classList.add('hidden');
        this.resetProjectForm();
    }
    
    resetProjectForm() {
        this.elements.projectIdInput.value = '';
        this.elements.subCodeInput.value = '';
        this.elements.projectTitleInput.value = '';
        this.elements.projectCategoryInput.value = '';
        this.elements.projectDescriptionInput.value = '';
        this.hideProjectFormErrors();
    }
    
    saveProject() {
        const projectData = {
            projectId: this.elements.projectIdInput.value.trim(),
            subCode: this.elements.subCodeInput.value.trim(),
            projectTitle: this.elements.projectTitleInput.value.trim(),
            category: this.elements.projectCategoryInput.value,
            description: this.elements.projectDescriptionInput.value.trim()
        };
        
        if (!this.validateProjectData(projectData)) {
            return;
        }
        
        try {
            if (this.editingProject) {
                this.updateProject(this.editingProject.id, projectData);
                this.showToast('Project updated successfully');
            } else {
                this.addProject(projectData);
                this.showToast('Project added successfully');
            }
            
            this.closeAddEditProjectModal();
            this.renderProjectTable();
        } catch (error) {
            this.showProjectFormErrors(['Failed to save project: ' + error.message]);
        }
    }
    
    validateProjectData(projectData) {
        const errors = [];
        
        if (!projectData.projectId) {
            errors.push('Project ID is required');
        }
        
        if (!projectData.subCode) {
            errors.push('Sub Code is required');
        }
        
        if (!projectData.projectTitle) {
            errors.push('Project Title is required');
        }
        
        // Check for duplicate project ID + sub code combination
        const duplicate = this.projectData.find(p => 
            p.projectId === projectData.projectId && 
            p.subCode === projectData.subCode &&
            (!this.editingProject || p.id !== this.editingProject.id)
        );
        
        if (duplicate) {
            errors.push('A project with this Project ID and Sub Code combination already exists');
        }
        
        if (errors.length > 0) {
            this.showProjectFormErrors(errors);
            return false;
        }
        
        return true;
    }
    
    showProjectFormErrors(errors) {
        this.elements.projectFormErrors.innerHTML = errors.join('<br>');
        this.elements.projectFormErrors.classList.add('show');
    }
    
    hideProjectFormErrors() {
        this.elements.projectFormErrors.classList.remove('show');
    }
    
    renderProjectTable() {
        const searchTerm = this.elements.projectSearchModal.value.toLowerCase();
        let projects = this.projectData;
        
        if (searchTerm) {
            projects = projects.filter(p => 
                p.projectId.toLowerCase().includes(searchTerm) ||
                p.subCode.toLowerCase().includes(searchTerm) ||
                p.projectTitle.toLowerCase().includes(searchTerm) ||
                p.category.toLowerCase().includes(searchTerm)
            );
        }
        
        // Sort projects
        if (this.currentSortField) {
            projects.sort((a, b) => {
                let aVal = a[this.currentSortField] || '';
                let bVal = b[this.currentSortField] || '';
                
                if (this.currentSortField === 'usageCount') {
                    aVal = parseInt(aVal) || 0;
                    bVal = parseInt(bVal) || 0;
                }
                
                const result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
                return this.currentSortDirection === 'desc' ? -result : result;
            });
        }
        
        this.elements.projectTableBody.innerHTML = projects.map(project => `
            <tr>
                <td>${project.projectId}</td>
                <td>${project.subCode}</td>
                <td>${project.projectTitle}</td>
                <td>${project.category}</td>
                <td>${project.usageCount}</td>
                <td>
                    <span class="status-${project.isActive ? 'active' : 'archived'}">
                        ${project.isActive ? 'Active' : 'Archived'}
                    </span>
                </td>
                <td>
                    <div class="project-actions">
                        <button class="btn btn--sm btn--outline" onclick="workLogTracker.openEditProjectModal('${project.id}')">Edit</button>
                        ${project.isActive ? 
                            `<button class="btn btn--sm btn--outline" onclick="workLogTracker.archiveProject('${project.id}')">Archive</button>` :
                            `<button class="btn btn--sm btn--outline" onclick="workLogTracker.restoreProject('${project.id}')">Restore</button>`
                        }
                        <button class="btn btn--sm btn--outline" style="color: var(--color-error);" onclick="workLogTracker.confirmDeleteProject('${project.id}')">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
    
    confirmDeleteProject(projectId) {
        const project = this.getProjectById(projectId);
        if (!project) return;
        
        this.showConfirmDialog(
            'Delete Project',
            `Are you sure you want to delete "${project.projectTitle}"? This action cannot be undone.`,
            () => {
                if (this.deleteProject(projectId)) {
                    this.showToast('Project deleted successfully');
                    this.renderProjectTable();
                }
                this.closeConfirmModal();
            }
        );
    }
    
    filterProjects(searchTerm) {
        this.renderProjectTable();
    }
    
    sortProjects(field) {
        if (this.currentSortField === field) {
            this.currentSortDirection = this.currentSortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSortField = field;
            this.currentSortDirection = 'asc';
        }
        
        this.renderProjectTable();
    }
    
    updateProjectStats() {
        const totalProjects = this.projectData.length;
        const activeProjects = this.projectData.filter(p => p.isActive).length;
        const archivedProjects = totalProjects - activeProjects;
        
        this.elements.totalProjectsCount.textContent = totalProjects;
        this.elements.activeProjectsCount.textContent = activeProjects;
        this.elements.archivedProjectsCount.textContent = archivedProjects;
    }
    
    // Enhanced Project Selection
    handleProjectSearch(searchTerm) {
        if (searchTerm.length < 1) {
            this.hideProjectSuggestions();
            return;
        }
        
        const matches = this.searchProjects(searchTerm);
        this.showProjectSuggestions(matches, searchTerm);
    }
    
    showProjectSuggestions(projects, searchTerm) {
        if (projects.length === 0) {
            this.hideProjectSuggestions();
            return;
        }
        
        this.elements.projectSuggestions.innerHTML = projects.slice(0, 10).map((project, index) => {
            const displayText = `${project.projectId} (${project.subCode}) - ${project.projectTitle}`;
            const highlightedText = this.highlightSearchTerm(displayText, searchTerm);
            
            return `<div class="project-suggestion" data-index="${index}" data-value="${project.projectId}-${project.subCode}">${highlightedText}</div>`;
        }).join('');
        
        this.elements.projectSuggestions.style.display = 'block';
        
        // Add click listeners
        this.elements.projectSuggestions.querySelectorAll('.project-suggestion').forEach(suggestion => {
            suggestion.addEventListener('click', () => {
                this.selectProjectSuggestion(suggestion.dataset.value);
            });
        });
    }
    
    hideProjectSuggestions() {
        this.elements.projectSuggestions.style.display = 'none';
    }
    
    highlightSearchTerm(text, term) {
        const regex = new RegExp(`(${term})`, 'gi');
        return text.replace(regex, '<span class="project-search-highlight">$1</span>');
    }
    
    selectProjectSuggestion(value) {
        const project = this.projectData.find(p => `${p.projectId}-${p.subCode}` === value);
        if (project) {
            this.elements.projectSearch.value = `${project.projectId} (${project.subCode}) - ${project.projectTitle}`;
            this.elements.project.value = value;
        }
        this.hideProjectSuggestions();
    }
    
    handleProjectSearchKeydown(e) {
        const suggestions = this.elements.projectSuggestions.querySelectorAll('.project-suggestion');
        const highlighted = this.elements.projectSuggestions.querySelector('.highlighted');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            const next = highlighted ? highlighted.nextElementSibling : suggestions[0];
            if (next) {
                if (highlighted) highlighted.classList.remove('highlighted');
                next.classList.add('highlighted');
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prev = highlighted ? highlighted.previousElementSibling : suggestions[suggestions.length - 1];
            if (prev) {
                if (highlighted) highlighted.classList.remove('highlighted');
                prev.classList.add('highlighted');
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (highlighted) {
                this.selectProjectSuggestion(highlighted.dataset.value);
            }
        } else if (e.key === 'Escape') {
            this.hideProjectSuggestions();
        }
    }
    
    // Import/Export functionality
    openImportModal() {
        this.elements.importExportTitle.textContent = 'Import Projects';
        this.elements.importSection.style.display = 'block';
        this.elements.exportSection.style.display = 'none';
        this.elements.executeImportBtn.style.display = 'none';
        this.elements.importPreview.style.display = 'none';
        this.elements.importExportModal.classList.remove('hidden');
    }
    
    openExportModal() {
        this.elements.importExportTitle.textContent = 'Export Projects';
        this.elements.importSection.style.display = 'none';
        this.elements.exportSection.style.display = 'block';
        this.elements.executeImportBtn.style.display = 'none';
        this.elements.importExportModal.classList.remove('hidden');
    }
    
    closeImportExportModal() {
        this.elements.importExportModal.classList.add('hidden');
        this.elements.importFileInput.value = '';
        this.elements.importPreview.style.display = 'none';
        this.hideImportExportErrors();
    }
    
    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                let data;
                if (file.name.endsWith('.json')) {
                    data = JSON.parse(e.target.result);
                } else if (file.name.endsWith('.csv')) {
                    data = this.parseCSV(e.target.result);
                } else {
                    throw new Error('Unsupported file format');
                }
                
                this.previewImportData(data);
            } catch (error) {
                this.showImportExportErrors(['Invalid file format: ' + error.message]);
            }
        };
        reader.readAsText(file);
    }
    
    parseCSV(csvText) {
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const projects = [];
        
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim()) {
                const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
                const project = {};
                headers.forEach((header, index) => {
                    project[header] = values[index] || '';
                });
                projects.push(project);
            }
        }
        
        return projects;
    }
    
    previewImportData(data) {
        if (!Array.isArray(data)) {
            this.showImportExportErrors(['Import data must be an array of projects']);
            return;
        }
        
        this.importData = data;
        this.elements.importPreviewContent.innerHTML = `
            <p>Found ${data.length} projects to import:</p>
            <ul>
                ${data.slice(0, 5).map(p => 
                    `<li>${p.projectId || 'No ID'} - ${p.projectTitle || 'No Title'}</li>`
                ).join('')}
                ${data.length > 5 ? `<li>... and ${data.length - 5} more</li>` : ''}
            </ul>
        `;
        
        this.elements.importPreview.style.display = 'block';
        this.elements.executeImportBtn.style.display = 'inline-flex';
    }
    
    executeImport() {
        if (!this.importData) return;
        
        let imported = 0;
        let skipped = 0;
        
        this.importData.forEach(projectData => {
            try {
                // Validate required fields
                if (!projectData.projectId || !projectData.subCode || !projectData.projectTitle) {
                    skipped++;
                    return;
                }
                
                // Check for duplicates
                const exists = this.projectData.some(p => 
                    p.projectId === projectData.projectId && p.subCode === projectData.subCode
                );
                
                if (exists) {
                    skipped++;
                    return;
                }
                
                this.addProject({
                    projectId: projectData.projectId,
                    subCode: projectData.subCode,
                    projectTitle: projectData.projectTitle,
                    category: projectData.category || 'Other',
                    description: projectData.description || ''
                });
                
                imported++;
            } catch (error) {
                skipped++;
            }
        });
        
        this.showToast(`Import completed: ${imported} imported, ${skipped} skipped`);
        this.closeImportExportModal();
        this.renderProjectTable();
    }
    
    exportProjectsJSON() {
        const data = JSON.stringify(this.projectData, null, 2);
        this.downloadFile(data, 'projects.json', 'application/json');
    }
    
    exportProjectsCSV() {
        const headers = ['projectId', 'subCode', 'projectTitle', 'category', 'description', 'isActive', 'usageCount'];
        const csvContent = [
            headers.join(','),
            ...this.projectData.map(project => 
                headers.map(header => 
                    `"${(project[header] || '').toString().replace(/"/g, '""')}"`
                ).join(',')
            )
        ].join('\n');
        
        this.downloadFile(csvContent, 'projects.csv', 'text/csv');
    }
    
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
        this.showToast(`${filename} downloaded successfully`);
    }
    
    showImportExportErrors(errors) {
        this.elements.importExportErrors.innerHTML = errors.join('<br>');
        this.elements.importExportErrors.classList.add('show');
    }
    
    hideImportExportErrors() {
        this.elements.importExportErrors.classList.remove('show');
    }
    
    // Enhanced Entry Form Methods
    populateProjectDropdown() {
        const activeProjects = this.projectData.filter(p => p.isActive);
        
        // Sort by usage count and last used
        activeProjects.sort((a, b) => {
            if (b.usageCount !== a.usageCount) {
                return b.usageCount - a.usageCount;
            }
            if (a.lastUsed && b.lastUsed) {
                return new Date(b.lastUsed) - new Date(a.lastUsed);
            }
            return a.projectTitle.localeCompare(b.projectTitle);
        });
        
        this.elements.project.innerHTML = '<option value="">Select project...</option>';
        
        activeProjects.forEach(proj => {
            const option = document.createElement('option');
            option.value = `${proj.projectId}-${proj.subCode}`;
            option.textContent = `${proj.projectId} (${proj.subCode}) - ${proj.projectTitle}`;
            this.elements.project.appendChild(option);
        });
    }
    
    handleEntryTypeChange() {
        const type = this.elements.entryType.value;
        
        // Reset form
        this.resetFormFields();
        
        // Show/hide fields based on entry type
        this.elements.projectGroup.style.display = type === 'work' ? 'block' : 'none';
        this.elements.hoursGroup.style.display = ['work'].includes(type) ? 'block' : 'none';
        this.elements.halfDayPeriodGroup.style.display = type === 'halfLeave' ? 'block' : 'none';
        
        // Set default values
        if (type === 'halfLeave') {
            this.elements.hours.value = '4';
            this.elements.hours.readOnly = true;
        } else if (type === 'fullLeave' || type === 'holiday') {
            this.elements.hours.value = '8';
            this.elements.hours.readOnly = true;
            this.elements.hoursGroup.style.display = 'none';
        } else {
            this.elements.hours.readOnly = false;
            this.elements.hours.value = '';
        }
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
            const index = this.workLogData[dateKey].findIndex(entry => entry.id === this.editingEntry.id);
            if (index !== -1) {
                this.workLogData[dateKey][index] = { ...entryData, id: this.editingEntry.id };
            }
            this.showToast('Entry updated successfully');
            this.cancelEdit();
        } else {
            // Add new entry
            entryData.id = this.generateId();
            this.workLogData[dateKey].push(entryData);
            this.showToast('Entry added successfully');
        }
        
        // Update project usage
        if (entryData.project) {
            this.updateProjectUsage(entryData.project);
        }
        
        this.saveData();
        this.renderCalendar();
        this.renderDailyEntries();
        this.updateDailyStats();
        this.resetForm();
    }
    
    gatherFormData() {
        return {
            type: this.elements.entryType.value,
            project: this.elements.project.value || this.elements.projectSearch.value,
            hours: parseFloat(this.elements.hours.value) || 0,
            halfDayPeriod: this.elements.halfDayPeriod.value,
            comments: this.elements.comments.value.trim(),
            timestamp: new Date().toISOString()
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
        
        if ((newEntry.type === 'fullLeave' || newEntry.type === 'holiday') && existingEntries.length > 0) {
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
            } else {
                this.elements.hours.setCustomValidity('');
            }
        }
    }
    
    resetFormFields() {
        this.elements.project.value = '';
        this.elements.projectSearch.value = '';
        this.elements.hours.value = '';
        this.elements.halfDayPeriod.value = '';
        this.elements.comments.value = '';
        this.hideFormErrors();
        this.hideProjectSuggestions();
    }
    
    resetForm() {
        this.elements.entryType.value = '';
        this.handleEntryTypeChange();
        this.hideFormErrors();
    }
    
    // Calendar Methods (updated to work with new structure)
    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        this.elements.currentMonth.textContent = new Intl.DateTimeFormat('en-US', {
            month: 'long',
            year: 'numeric'
        }).format(this.currentDate);
        
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
        dayElement.textContent = date.getDate();
        
        const dateKey = this.formatDateKey(date);
        const isCurrentMonth = date.getMonth() === currentMonth;
        const isToday = this.isDateToday(date);
        const isSelected = this.selectedDate && this.formatDateKey(this.selectedDate) === dateKey;
        const hasEntries = this.workLogData[dateKey] && this.workLogData[dateKey].length > 0;
        
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
    
    navigateMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.renderCalendar();
    }
    
    selectDate(date) {
        this.selectedDate = new Date(date);
        this.renderCalendar();
        this.updateSelectedDateDisplay();
        this.showEntryForm();
        this.renderDailyEntries();
        this.updateDailyStats();
    }
    
    // Daily Entries Display
    renderDailyEntries() {
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
        const typeInfo = this.entryTypes[entry.type];
        
        return `
            <div class="entry-item" data-entry-id="${entry.id}">
                <div class="entry-header">
                    <div class="entry-type">
                        <span class="entry-type-indicator ${entry.type}"></span>
                        ${typeInfo.label}
                    </div>
                    <div class="entry-actions">
                        <button class="btn btn--sm btn--outline" onclick="workLogTracker.editEntry('${entry.id}')">Edit</button>
                        <button class="btn btn--sm btn--outline" onclick="workLogTracker.deleteEntry('${entry.id}')" style="color: var(--color-error);">Delete</button>
                    </div>
                </div>
                <div class="entry-details">
                    ${entry.project ? `<div class="entry-detail">
                        <span class="entry-detail-label">Project:</span>
                        <span>${this.getProjectDisplayName(entry.project)}</span>
                    </div>` : ''}
                    ${entry.type === 'work' ? `<div class="entry-detail">
                        <span class="entry-detail-label">Hours:</span>
                        <span>${entry.hours}</span>
                    </div>` : ''}
                    ${entry.type === 'halfLeave' ? `<div class="entry-detail">
                        <span class="entry-detail-label">Period:</span>
                        <span>${entry.halfDayPeriod === 'morning' ? 'Morning (8:00 AM - 12:00 PM)' : 'Afternoon (1:00 PM - 5:00 PM)'}</span>
                    </div>` : ''}
                    ${entry.type === 'halfLeave' ? `<div class="entry-detail">
                        <span class="entry-detail-label">Hours:</span>
                        <span>4</span>
                    </div>` : ''}
                    ${(entry.type === 'fullLeave' || entry.type === 'holiday') ? `<div class="entry-detail">
                        <span class="entry-detail-label">Hours:</span>
                        <span>8</span>
                    </div>` : ''}
                </div>
                ${entry.comments ? `<div class="entry-comments">${entry.comments}</div>` : ''}
            </div>
        `;
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
        this.elements.projectSearch.value = this.getProjectDisplayName(entry.project) || '';
        this.elements.hours.value = entry.hours || '';
        this.elements.halfDayPeriod.value = entry.halfDayPeriod || '';
        this.elements.comments.value = entry.comments || '';
        
        // Update form UI
        this.elements.addEntryBtn.textContent = 'Update Entry';
        this.elements.cancelEntryBtn.style.display = 'inline-flex';
        
        this.showToast('Edit mode activated');
    }
    
    deleteEntry(entryId) {
        this.showConfirmDialog(
            'Delete Entry',
            'Are you sure you want to delete this entry?',
            () => {
                this.confirmDeleteEntry(entryId);
                this.closeConfirmModal();
            }
        );
    }
    
    confirmDeleteEntry(entryId) {
        const dateKey = this.formatDateKey(this.selectedDate);
        
        if (this.workLogData[dateKey]) {
            this.workLogData[dateKey] = this.workLogData[dateKey].filter(entry => entry.id !== entryId);
            
            if (this.workLogData[dateKey].length === 0) {
                delete this.workLogData[dateKey];
            }
        }
        
        this.saveData();
        this.renderCalendar();
        this.renderDailyEntries();
        this.updateDailyStats();
        this.showToast('Entry deleted successfully');
    }
    
    cancelEdit() {
        this.editingEntry = null;
        this.resetForm();
        this.elements.addEntryBtn.textContent = 'Add Entry';
        this.elements.cancelEntryBtn.style.display = 'none';
        this.showToast('Edit cancelled');
    }
    
    // Export functionality
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
            this.showToast('No data to export for this month');
            return;
        }
        
        // Create CSV content
        const csvContent = this.createCSVContent(monthEntries);
        
        // Download file
        this.downloadFile(csvContent, `work-log-${monthName}-${year}.csv`, 'text/csv');
    }
    
    createCSVContent(entries) {
        const headers = ['Date', 'Entry Type', 'Project', 'Hours', 'Half Day Period', 'Comments'];
        const csvLines = [headers.join(',')];
        
        entries.forEach(entry => {
            const row = [
                entry.date,
                this.entryTypes[entry.type].label,
                this.getProjectDisplayName(entry.project) || 'N/A',
                this.getEntryHours(entry),
                entry.halfDayPeriod || 'N/A',
                `"${entry.comments || 'N/A'}"`
            ];
            csvLines.push(row.join(','));
        });
        
        return csvLines.join('\n');
    }
    
    // Utility methods
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
        
        let totalHours = 0;
        entries.forEach(entry => {
            totalHours += this.getEntryHours(entry);
        });
        
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
    
    showFormErrors(errors) {
        this.elements.formErrors.innerHTML = errors.join('<br>');
        this.elements.formErrors.classList.add('show');
    }
    
    hideFormErrors() {
        this.elements.formErrors.classList.remove('show');
    }
    
    showToast(message) {
        this.elements.toastMessage.textContent = message;
        this.elements.toast.classList.add('show');
        
        setTimeout(() => {
            this.elements.toast.classList.remove('show');
        }, 3000);
    }
    
    showConfirmDialog(title, message, onConfirm) {
        this.elements.confirmModalTitle.textContent = title;
        this.elements.confirmModalMessage.textContent = message;
        
        // Remove existing listeners
        const newConfirmBtn = this.elements.confirmActionBtn.cloneNode(true);
        this.elements.confirmActionBtn.parentNode.replaceChild(newConfirmBtn, this.elements.confirmActionBtn);
        this.elements.confirmActionBtn = newConfirmBtn;
        
        this.elements.confirmActionBtn.addEventListener('click', onConfirm);
        this.elements.confirmModal.classList.remove('hidden');
    }
    
    closeConfirmModal() {
        this.elements.confirmModal.classList.add('hidden');
    }
    
    getProjectDisplayName(projectValue) {
        if (!projectValue) return '';
        
        const project = this.projectData.find(p => `${p.projectId}-${p.subCode}` === projectValue);
        return project ? `${project.projectId} (${project.subCode}) - ${project.projectTitle}` : projectValue;
    }
    
    getEntryTypesForDate(dateKey) {
        const entries = this.workLogData[dateKey] || [];
        return [...new Set(entries.map(entry => entry.type))];
    }
    
    getEntryHours(entry) {
        if (entry.type === 'work') return entry.hours;
        if (entry.type === 'halfLeave') return 4;
        if (entry.type === 'fullLeave' || entry.type === 'holiday') return 8;
        return 0;
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
}

// Initialize the application
let workLogTracker;

document.addEventListener('DOMContentLoaded', function() {
    workLogTracker = new WorkLogTracker();
});

// Global functions for inline event handlers (maintaining compatibility)
window.workLogTracker = {
    editEntry: (id) => workLogTracker.editEntry(id),
    deleteEntry: (id) => workLogTracker.deleteEntry(id),
    openEditProjectModal: (id) => workLogTracker.openEditProjectModal(id),
    archiveProject: (id) => workLogTracker.archiveProject(id),
    restoreProject: (id) => workLogTracker.restoreProject(id),
    confirmDeleteProject: (id) => workLogTracker.confirmDeleteProject(id)
};
