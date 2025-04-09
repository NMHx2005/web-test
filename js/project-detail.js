// Constants
const EMAIL_MIN_LENGTH = 5;
const EMAIL_MAX_LENGTH = 100;
const ROLE_MIN_LENGTH = 2;
const ROLE_MAX_LENGTH = 50;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// DOM Elements
let currentProject = null;
let currentTasks = [];
let sortBy = 'dueDate'; // Default sort by due date
let searchQuery = '';

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = parseInt(urlParams.get('id'));
    
    if (projectId) {
        loadProject(projectId);
        setupEventListeners();
    } else {
        window.location.href = 'project-manager.html';
    }
});

// Load project data
function loadProject(projectId) {
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    currentProject = projects.find(p => p.id === projectId);
    
    if (currentProject) {
        document.querySelector('.project-name').textContent = currentProject.projectName;
        document.querySelector('.project-description').textContent = currentProject.description;
        loadTasks();
        renderMembers();
    } else {
        window.location.href = 'project-manager.html';
    }
}

// Load tasks for current project
function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '{}');
    currentTasks = tasks[currentProject.id] || [];
    renderTasks();
}

// Setup event listeners
function setupEventListeners() {
    // Add task button
    document.querySelector('.add-task-btn').addEventListener('click', showAddTaskModal);
    
    // Add member button
    document.querySelector('.add-member-btn').addEventListener('click', showAddMemberModal);
    
    // Search input
    document.querySelector('.search-box input').addEventListener('input', function(e) {
        searchQuery = e.target.value.toLowerCase();
        renderTasks();
    });
    
    // Sort buttons
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            sortBy = this.dataset.sort;
            document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderTasks();
        });
    });
    
    // Modal close buttons
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', hideModals);
    });
    
    // Form submissions
    document.querySelector('.task-form').addEventListener('submit', handleTaskSubmit);
    document.querySelector('.member-form').addEventListener('submit', handleMemberSubmit);
}

// Render tasks with sorting and search
function renderTasks() {
    let filteredTasks = currentTasks.filter(task => 
        task.name.toLowerCase().includes(searchQuery)
    );
    
    // Sort tasks
    filteredTasks.sort((a, b) => {
        if (sortBy === 'dueDate') {
            return new Date(a.dueDate) - new Date(b.dueDate);
        } else if (sortBy === 'priority') {
            const priorityOrder = { 'Cao': 0, 'Trung Bình': 1, 'Thấp': 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return 0;
    });
    
    const tbody = document.querySelector('.task-table tbody');
    tbody.innerHTML = '';
    
    filteredTasks.forEach(task => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${task.name}</td>
            <td>${task.assignee}</td>
            <td>${formatDate(task.assignDate)}</td>
            <td>${formatDate(task.dueDate)}</td>
            <td>${task.priority}</td>
            <td>${task.progress}</td>
            <td>${task.status}</td>
            <td class="action-buttons">
                <button class="btn-edit" onclick="editTask(${task.id})">Sửa</button>
                <button class="btn-delete" onclick="deleteTask(${task.id})">Xóa</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Render project members
function renderMembers() {
    const tbody = document.querySelector('.member-table tbody');
    tbody.innerHTML = '';
    
    currentProject.members.forEach(member => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${member.name}</td>
            <td>${member.role}</td>
            <td class="action-buttons">
                <button class="btn-delete" onclick="removeMember(${member.userId})">Xóa</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Show add task modal
function showAddTaskModal() {
    document.querySelector('.task-modal').style.display = 'block';
    document.querySelector('.overlay').style.display = 'block';
    document.querySelector('.task-form').reset();
}

// Show add member modal
function showAddMemberModal() {
    document.querySelector('.member-modal').style.display = 'block';
    document.querySelector('.overlay').style.display = 'block';
    document.querySelector('.member-form').reset();
}

// Handle task form submission
function handleTaskSubmit(e) {
    e.preventDefault();
    
    const taskData = {
        id: currentTasks.length > 0 ? Math.max(...currentTasks.map(t => t.id)) + 1 : 1,
        name: document.getElementById('task-name').value.trim(),
        assignee: document.getElementById('task-assignee').value.trim(),
        assignDate: document.getElementById('task-assign-date').value,
        dueDate: document.getElementById('task-due-date').value,
        priority: document.getElementById('task-priority').value,
        progress: document.getElementById('task-progress').value,
        status: document.getElementById('task-status').value
    };
    
    currentTasks.push(taskData);
    
    const tasks = JSON.parse(localStorage.getItem('tasks') || '{}');
    tasks[currentProject.id] = currentTasks;
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    hideModals();
    renderTasks();
}

// Handle member form submission
function handleMemberSubmit(e) {
    e.preventDefault();
    
    const email = document.getElementById('member-email').value.trim();
    const role = document.getElementById('member-role').value.trim();
    
    // Validation
    if (!validateMemberInput(email, role)) {
        return;
    }
    
    // Check if email exists in users
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email);
    
    if (!user) {
        showError(document.getElementById('member-email').nextElementSibling, 'Email không tồn tại trong hệ thống');
        return;
    }
    
    // Check if member already exists
    if (currentProject.members.some(m => m.userId === user.id)) {
        showError(document.getElementById('member-email').nextElementSibling, 'Thành viên đã tồn tại trong dự án');
        return;
    }
    
    // Add new member
    const newMember = {
        userId: user.id,
        name: user.name,
        role: role
    };
    
    currentProject.members.push(newMember);
    
    // Update project in localStorage
    const projects = JSON.parse(localStorage.getItem('projects'));
    const projectIndex = projects.findIndex(p => p.id === currentProject.id);
    if (projectIndex !== -1) {
        projects[projectIndex] = currentProject;
        localStorage.setItem('projects', JSON.stringify(projects));
    }
    
    hideModals();
    renderMembers();
}

// Validate member input
function validateMemberInput(email, role) {
    const emailError = document.getElementById('member-email').nextElementSibling;
    const roleError = document.getElementById('member-role').nextElementSibling;
    
    let isValid = true;
    
    if (!email) {
        showError(emailError, 'Email không được để trống');
        isValid = false;
    } else if (!EMAIL_REGEX.test(email)) {
        showError(emailError, 'Email không đúng định dạng');
        isValid = false;
    } else if (email.length < EMAIL_MIN_LENGTH || email.length > EMAIL_MAX_LENGTH) {
        showError(emailError, `Email phải có độ dài từ ${EMAIL_MIN_LENGTH} đến ${EMAIL_MAX_LENGTH} ký tự`);
        isValid = false;
    } else {
        hideError(emailError);
    }
    
    if (!role) {
        showError(roleError, 'Vai trò không được để trống');
        isValid = false;
    } else if (role.length < ROLE_MIN_LENGTH || role.length > ROLE_MAX_LENGTH) {
        showError(roleError, `Vai trò phải có độ dài từ ${ROLE_MIN_LENGTH} đến ${ROLE_MAX_LENGTH} ký tự`);
        isValid = false;
    } else {
        hideError(roleError);
    }
    
    return isValid;
}

// Show error message
function showError(element, message) {
    if (element && element.classList.contains('error-message')) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

// Hide error message
function hideError(element) {
    if (element && element.classList.contains('error-message')) {
        element.style.display = 'none';
    }
}

// Hide all modals
function hideModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
    document.querySelector('.overlay').style.display = 'none';
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

// Edit task
function editTask(taskId) {
    const task = currentTasks.find(t => t.id === taskId);
    if (task) {
        document.querySelector('.task-modal').style.display = 'block';
        document.querySelector('.overlay').style.display = 'block';
        
        document.getElementById('task-name').value = task.name;
        document.getElementById('task-assignee').value = task.assignee;
        document.getElementById('task-assign-date').value = task.assignDate;
        document.getElementById('task-due-date').value = task.dueDate;
        document.getElementById('task-priority').value = task.priority;
        document.getElementById('task-progress').value = task.progress;
        document.getElementById('task-status').value = task.status;
        
        document.querySelector('.task-form').dataset.taskId = taskId;
    }
}

// Delete task
function deleteTask(taskId) {
    if (confirm('Bạn có chắc chắn muốn xóa nhiệm vụ này?')) {
        currentTasks = currentTasks.filter(t => t.id !== taskId);
        
        const tasks = JSON.parse(localStorage.getItem('tasks') || '{}');
        tasks[currentProject.id] = currentTasks;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        
        renderTasks();
    }
}

// Remove member
function removeMember(userId) {
    if (confirm('Bạn có chắc chắn muốn xóa thành viên này?')) {
        currentProject.members = currentProject.members.filter(m => m.userId !== userId);
        
        const projects = JSON.parse(localStorage.getItem('projects'));
        const projectIndex = projects.findIndex(p => p.id === currentProject.id);
        if (projectIndex !== -1) {
            projects[projectIndex] = currentProject;
            localStorage.setItem('projects', JSON.stringify(projects));
        }
        
        renderMembers();
    }
} 