// Constants
const PROJECT_NAME_MIN_LENGTH = 3;
const PROJECT_NAME_MAX_LENGTH = 50;
const PROJECT_DESCRIPTION_MIN_LENGTH = 10;
const PROJECT_DESCRIPTION_MAX_LENGTH = 500;
const ITEMS_PER_PAGE = 5;

// DOM Elements
const projectListBody = document.getElementById('project-list-body');
const pagination = document.getElementById('pagination');
const searchInput = document.getElementById('search-input');
const addProjectBtn = document.querySelector('.add-project-btn');
const projectModal = document.getElementById('project-modal');
const deleteModal = document.getElementById('delete-modal');
const projectForm = document.getElementById('project-form');
const projectNameInput = document.getElementById('project-name');
const projectDescriptionInput = document.getElementById('project-description');
const projectNameError = document.getElementById('project-name-error');
const projectDescriptionError = document.getElementById('project-description-error');

// Variables
let currentPage = 1;
let searchQuery = '';
let currentProjectId = null;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Add current user to users list if not exists
    addUserToUsersList(currentUser);

    // Initialize projects
    initProjects();
    setupEventListeners();
});

// Add user to users list in localStorage
function addUserToUsersList(user) {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userExists = users.some(u => u.id === user.id);
    
    if (!userExists) {
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
    }
}

function setupEventListeners() {
    // Add project button
    addProjectBtn.addEventListener('click', () => {
        currentProjectId = null;
        projectForm.reset();
        showModal(projectModal);
    });

    // Search input
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        currentPage = 1;
        renderProjects();
    });

    // Project form submit
    projectForm.addEventListener('submit', handleProjectSubmit);

    // Close buttons
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', () => {
            hideModal(projectModal);
            hideModal(deleteModal);
        });
    });

    // Cancel buttons
    document.querySelectorAll('.cancel, .cancel-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            hideModal(projectModal);
            hideModal(deleteModal);
        });
    });

    // Delete button
    document.querySelector('.delete-btn').addEventListener('click', handleDeleteProject);
}

// Project Management Functions
function initProjects() {
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    if (projects.length === 0) {
        // Initialize with sample data if no projects exist
        localStorage.setItem('projects', JSON.stringify(sampleProjects));
    }
    renderProjects();
}

function renderProjects() {
    const projects = getFilteredProjects();
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedProjects = projects.slice(startIndex, endIndex);

    projectListBody.innerHTML = '';
    paginatedProjects.forEach(project => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${project.id}</td>
            <td>${project.projectName}</td>
            <td class="action-buttons">
                <button class="btn-edit" onclick="handleEditProject(${project.id})">Sửa</button>
                <button class="btn-delete" onclick="handleDeleteClick(${project.id})">Xóa</button>
                <button class="btn-detail" onclick="viewProjectDetail(${project.id})">Chi tiết</button>
            </td>
        `;
        projectListBody.appendChild(tr);
    });

    renderPagination(projects.length);
}

function getFilteredProjects() {
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    return projects.filter(project => {
        // Check if current user is a member of the project and has Project owner role
        const isOwner = project.members.some(member => 
            member.userId === currentUser.id && member.role === 'Project owner'
        );
        
        const matchesSearch = project.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            project.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        return isOwner && matchesSearch;
    });
}

function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    pagination.innerHTML = '';

    // Previous button
    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.innerHTML = '<';
        prevButton.addEventListener('click', () => {
            currentPage--;
            renderProjects();
        });
        pagination.appendChild(prevButton);
    }

    // Page buttons
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        if (i === currentPage) {
            pageButton.classList.add('active');
        }
        pageButton.addEventListener('click', () => {
            currentPage = i;
            renderProjects();
        });
        pagination.appendChild(pageButton);
    }

    // Next button
    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.innerHTML = '>';
        nextButton.addEventListener('click', () => {
            currentPage++;
            renderProjects();
        });
        pagination.appendChild(nextButton);
    }
}

// Modal Functions
function showModal(modal) {
    modal.style.display = 'block';
    document.querySelector('.overlay').style.display = 'block';
}

function hideModal(modal) {
    modal.style.display = 'none';
    document.querySelector('.overlay').style.display = 'none';
}

// Project CRUD Functions
function handleProjectSubmit(e) {
    e.preventDefault();
    
    // Reset error messages
    projectNameError.textContent = '';
    projectDescriptionError.textContent = '';
    
    const projectName = projectNameInput.value.trim();
    const projectDescription = projectDescriptionInput.value.trim();
    
    // Validate project name
    if (projectName.length < PROJECT_NAME_MIN_LENGTH) {
        projectNameError.textContent = `Tên dự án phải có ít nhất ${PROJECT_NAME_MIN_LENGTH} ký tự`;
        return;
    }
    if (projectName.length > PROJECT_NAME_MAX_LENGTH) {
        projectNameError.textContent = `Tên dự án không được vượt quá ${PROJECT_NAME_MAX_LENGTH} ký tự`;
        return;
    }
    
    // Validate project description
    if (projectDescription.length < PROJECT_DESCRIPTION_MIN_LENGTH) {
        projectDescriptionError.textContent = `Mô tả dự án phải có ít nhất ${PROJECT_DESCRIPTION_MIN_LENGTH} ký tự`;
        return;
    }
    if (projectDescription.length > PROJECT_DESCRIPTION_MAX_LENGTH) {
        projectDescriptionError.textContent = `Mô tả dự án không được vượt quá ${PROJECT_DESCRIPTION_MAX_LENGTH} ký tự`;
        return;
    }
    
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (currentProjectId === null) {
        // Add new project
        const newProject = {
            id: projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1,
            projectName,
            description: projectDescription,
            members: [
                {
                    userId: currentUser.id,
                    name: currentUser.name,
                    role: 'Project owner'
                },
                {
                    userId: 2, // An Nguyễn
                    name: "An Nguyễn",
                    role: "Developer"
                },
                {
                    userId: 3, // Bách Nguyễn
                    name: "Bách Nguyễn",
                    role: "Developer"
                }
            ],
            tasks: []
        };
        projects.push(newProject);
    } else {
        // Update existing project
        const projectIndex = projects.findIndex(p => p.id === currentProjectId);
        if (projectIndex !== -1) {
            projects[projectIndex].projectName = projectName;
            projects[projectIndex].description = projectDescription;
        }
    }
    
    localStorage.setItem('projects', JSON.stringify(projects));
    hideModal(projectModal);
    renderProjects();
}

function handleEditProject(projectId) {
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const project = projects.find(p => p.id === projectId);
    
    if (project) {
        currentProjectId = projectId;
        projectNameInput.value = project.projectName;
        projectDescriptionInput.value = project.description;
        showModal(projectModal);
    }
}

function handleDeleteClick(projectId) {
    currentProjectId = projectId;
    showModal(deleteModal);
}

function handleDeleteProject() {
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const projectIndex = projects.findIndex(p => p.id === currentProjectId);
    
    if (projectIndex !== -1) {
        projects.splice(projectIndex, 1);
        localStorage.setItem('projects', JSON.stringify(projects));
        hideModal(deleteModal);
        renderProjects();
    }
}

function viewProjectDetail(projectId) {
    window.location.href = `project-detail.html?id=${projectId}`;
}

// Logout function
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
} 