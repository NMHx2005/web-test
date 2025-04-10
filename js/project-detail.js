// Constants
const EMAIL_MIN_LENGTH = 5;
const EMAIL_MAX_LENGTH = 50;
const ROLE_MIN_LENGTH = 3;
const ROLE_MAX_LENGTH = 30;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// DOM Elements
const projectTitle = document.querySelector('.project-title');
const projectDescription = document.querySelector('.project-description');
const memberList = document.querySelector('.member-list');
const taskTableBody = document.querySelector('.task-table tbody');
const addMemberBtn = document.querySelector('.add-member-btn');
const addTaskBtn = document.querySelector('.add-task-btn');
const memberModal = document.querySelector('.modal__member');
const memberListModal = document.querySelector('.modal__member_list');
const taskModal = document.getElementById('taskModal');
const memberForm = document.querySelector('.modal__member form');
const addTaskForm = document.getElementById('addTaskForm');
const sortSelect = document.querySelector('.sort-btn');
const taskSearch = document.querySelector('.search-box input');
const assigneeSelect = document.getElementById('assignee');
const overlay = document.querySelector('#overlay');

// Variables
let currentProject = null;
let currentTasks = [];
let sortBy = '';
let searchQuery = '';

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Load project data
    loadProject();
    setupEventListeners();
    
    // Initialize data if needed
    initializeData();
});

function initializeData() {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = parseInt(urlParams.get('id'));
    
    // Initialize tasks if not exists
    if (!currentProject.tasks) {
        currentProject.tasks = [
            { id: 1, name: "Soạn thảo đề cương dự án", assignee: "An Nguyễn", priority: "Cao", assignDate: "2024-02-24", dueDate: "2024-02-27", progress: "Đúng tiến độ", status: "To do" },
            { id: 2, name: "Lên lịch họp kickoff", assignee: "An Nguyễn", priority: "Trung Bình", assignDate: "2024-02-24", dueDate: "2024-02-27", progress: "Có rủi ro", status: "In Progress" },
            { id: 3, name: "Chờ duyệt thiết kế", assignee: "An Nguyễn", priority: "Trung Bình", assignDate: "2024-02-24", dueDate: "2024-02-27", progress: "Có rủi ro", status: "Pending" },
            { id: 4, name: "Hoàn thành khảo sát", assignee: "An Nguyễn", priority: "Thấp", assignDate: "2024-02-24", dueDate: "2024-02-27", progress: "Đúng tiến độ", status: "Done" }
        ];
        
        // Update project in localStorage
        const projects = JSON.parse(localStorage.getItem('projects') || '[]');
        const projectIndex = projects.findIndex(p => p.id === currentProject.id);
        
        if (projectIndex !== -1) {
            projects[projectIndex] = currentProject;
            localStorage.setItem('projects', JSON.stringify(projects));
        }
    }
    
    // Initialize members if not exists
    if (!currentProject.members) {
        currentProject.members = [
            { userId: 1, name: "An Nguyễn", role: "Project owner" },
            { userId: 2, name: "Bách Nguyễn", role: "Frontend developer" }
        ];
        
        // Update project in localStorage
        const projects = JSON.parse(localStorage.getItem('projects') || '[]');
        const projectIndex = projects.findIndex(p => p.id === currentProject.id);
        
        if (projectIndex !== -1) {
            projects[projectIndex] = currentProject;
            localStorage.setItem('projects', JSON.stringify(projects));
        }
    }
}

function setupEventListeners() {
    // Add member button
    addMemberBtn.addEventListener('click', showMemberModal);

    // Add task button
    addTaskBtn.addEventListener('click', () => {
        populateAssigneeSelect();
        showTaskModal();
    });

    // Member form submit
    memberForm.addEventListener('submit', handleMemberSubmit);

    // Task form submit
    addTaskForm.addEventListener('submit', handleTaskSubmit);

    // Sort select
    sortSelect.addEventListener('change', (e) => {
        sortBy = e.target.value;
        renderTasks();
    });

    // Search input
    taskSearch.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderTasks();
    });

    // Close buttons
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', () => {
            hideMemberModal();
            hideMemberListModal();
            hideTaskModal();
        });
    });

    // Cancel buttons
    document.querySelectorAll('.cancel').forEach(btn => {
        btn.addEventListener('click', () => {
            hideMemberModal();
            hideMemberListModal();
            hideTaskModal();
        });
    });
}

// Project Management Functions
function loadProject() {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = parseInt(urlParams.get('id'));

    if (!projectId) {
        console.error('Project ID not found in URL');
        return;
    }
    
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    currentProject = projects.find(p => p.id === projectId);
    
    if (!currentProject) {
        console.error('Project not found');
        return;
    }

    // Update project title and description
    projectTitle.textContent = currentProject.projectName;
    projectDescription.textContent = currentProject.description;
    
    // Load members and tasks
    renderMembers();
    loadTasks();
}

function loadTasks() {
    if (!currentProject || !currentProject.tasks) {
        currentTasks = [];
    } else {
        currentTasks = [...currentProject.tasks];
    }
    
    renderTasks();
}

// Member Management Functions
    function renderMembers() {
    if (!currentProject || !currentProject.members) {
        return;
    }
    
        const memberList = document.querySelector('.member-list');
    if (memberList) {
        memberList.innerHTML = currentProject.members.map((member, idx) => `
                <div class="member-item">
                <div class="member-avatar ${idx % 2 === 0 ? 'blue' : 'purple'}">${member.name.split(' ').map(word => word[0]).join('').toUpperCase()}</div>
                    <div class="member-info">
                        <span class="member-name">${member.name}</span>
                        <span class="member-role">${member.role}</span>
                    </div>
                    </div>
        `).join('') + `
            <div class="list__member">
                <img alt="" src="../assets/images/icon_ba_cham.png" />
                </div>
        `;
        const listMemberBtn = document.querySelector('.list__member');
        if (listMemberBtn) {
            listMemberBtn.removeEventListener('click', showMemberListModal);
            listMemberBtn.addEventListener('click', showMemberListModal);
        }
    }
}

function showMemberModal() {
    if (memberModal) {
        memberModal.style.display = 'block';
        overlay.classList.add('active');
        memberModal.querySelector('.modal__member-header h2').textContent = 'Thêm thành viên';
    }
}

function hideMemberModal() {
    if (memberModal) {
        memberModal.style.display = 'none';
        overlay.classList.remove('active');
        memberForm.reset();
        memberForm.removeAttribute('data-edit-index');
    }
}

function showMemberListModal() {
    const memberListModalBody = document.querySelector('.modal__member_list-body');
    
    if (!currentProject || !currentProject.members) {
        return;
    }
    
    memberListModalBody.innerHTML = currentProject.members.length === 0
        ? '<p class="no-members">Chưa có thành viên nào trong dự án</p>'
        : `
            <table class="member-table">
                <thead>
                    <tr>
                        <th>Tên thành viên</th>
                        <th>Vai trò</th>
                        <th style="text-align: center;">Hành Động</th>
                    </tr>
                </thead>
                <tbody>
                    ${currentProject.members.map((member, index) => `
                        <tr>
                            <td>${member.name}</td>
                            <td>${member.role}</td>
                            <td class="action-buttons">
                                <button class="btn-edit" data-index="${index}">Sửa</button>
                                <button class="btn-delete" data-index="${index}">Xóa</button>
                    </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    
    // Add event listeners for buttons
    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', () => {
            const index = parseInt(button.getAttribute('data-index'));
            editMember(index);
                });
            });

    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', () => {
            const index = parseInt(button.getAttribute('data-index'));
            deleteMember(index);
                    });
                });
    
    if (memberListModal) {
        memberListModal.style.display = 'block';
        overlay.classList.add('active');
    }
}

function hideMemberListModal() {
    if (memberListModal) {
        memberListModal.style.display = 'none';
        overlay.classList.remove('active');
    }
}

function editMember(index) {
    const member = currentProject.members[index];
    
    // Populate form with member data
    document.getElementById('member-name').value = member.name;
    document.getElementById('member-role').value = member.role;
    
    // Set edit index
    memberForm.setAttribute('data-edit-index', index);
    
    // Update modal title
    memberModal.querySelector('.modal__member-header h2').textContent = 'Sửa thành viên';
    
    // Hide member list modal and show member modal
    hideMemberListModal();
    showMemberModal();
}

function deleteMember(index) {
    if (confirm('Bạn có chắc chắn muốn xóa thành viên này?')) {
        // Remove member from project
        currentProject.members.splice(index, 1);
        
        // Update project in localStorage
        const projects = JSON.parse(localStorage.getItem('projects') || '[]');
        const projectIndex = projects.findIndex(p => p.id === currentProject.id);
        
        if (projectIndex !== -1) {
            projects[projectIndex] = currentProject;
            localStorage.setItem('projects', JSON.stringify(projects));
        }
        
        // Show notification
        showNotification('Xóa thành viên thành công!', 'success');
        
        // Hide member list modal
        hideMemberListModal();
        
        // Reload members
        renderMembers();
        
        // Update assignee select
        populateAssigneeSelect();
    }
}

function handleMemberSubmit(e) {
    e.preventDefault();
    
    const memberName = document.getElementById('member-name').value.trim();
    const memberRole = document.getElementById('member-role').value.trim();
    
    // Validate member name
    if (!memberName) {
        showNotification('Tên thành viên không được để trống!', 'error');
        document.getElementById('member-name').classList.add('error');
        return;
    }
    
    // Validate member role
    if (!memberRole) {
        showNotification('Vai trò không được để trống!', 'error');
        document.getElementById('member-role').classList.add('error');
        return;
    }
    
    if (memberRole.length < ROLE_MIN_LENGTH) {
        showNotification(`Vai trò phải có ít nhất ${ROLE_MIN_LENGTH} ký tự!`, 'error');
        document.getElementById('member-role').classList.add('error');
        return;
    }
    
    if (memberRole.length > ROLE_MAX_LENGTH) {
        showNotification(`Vai trò không được vượt quá ${ROLE_MAX_LENGTH} ký tự!`, 'error');
        document.getElementById('member-role').classList.add('error');
        return;
    }
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Find user by name
    const user = users.find(u => u.name === memberName);
    
    if (!user) {
        showNotification('Người dùng không tồn tại!', 'error');
        document.getElementById('member-name').classList.add('error');
        return;
    }
    
    // Check if member already exists
    const memberExists = currentProject.members.some(m => m.userId === user.id);
    
    if (memberExists) {
        showNotification('Thành viên đã tồn tại trong dự án!', 'error');
        document.getElementById('member-name').classList.add('error');
                return;
            }
            
    // Check if editing or adding
    const editIndex = memberForm.getAttribute('data-edit-index');
    
    if (editIndex !== null) {
        // Update existing member
        const index = parseInt(editIndex);
        currentProject.members[index].role = memberRole;
        showNotification('Cập nhật thành viên thành công!', 'success');
    } else {
        // Add new member
            const newMember = {
            userId: user.id,
            name: user.name,
                role: memberRole
            };
            
            currentProject.members.push(newMember);
        showNotification('Thêm thành viên thành công!', 'success');
    }
    
    // Update project in localStorage
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const projectIndex = projects.findIndex(p => p.id === currentProject.id);
    
    if (projectIndex !== -1) {
        projects[projectIndex] = currentProject;
            localStorage.setItem('projects', JSON.stringify(projects));
    }
    
    // Reset form and hide modal
    memberForm.reset();
    hideMemberModal();
            
    // Reload members
            renderMembers();
    
    // Update assignee select
    populateAssigneeSelect();
}

// Task Management Functions
function renderTasks() {
    taskTableBody.innerHTML = '';
    
    // Filter tasks by search query
    let filteredTasks = currentTasks;
    if (searchQuery) {
        filteredTasks = currentTasks.filter(task => 
            task.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }
    
    // Sort tasks
    if (sortBy) {
        filteredTasks.sort((a, b) => {
            if (sortBy === 'start-date') {
                return new Date(a.assignDate) - new Date(b.assignDate);
            } else if (sortBy === 'progress') {
                const progressOrder = { 'Đúng tiến độ': 0, 'Có rủi ro': 1, 'Trì hoãn': 2 };
                return progressOrder[a.progress] - progressOrder[b.progress];
            }
            return 0;
        });
    }
    
    // Group tasks by status
    const groups = ["To do", "In Progress", "Pending", "Done"];
    
    groups.forEach(group => {
        const groupTasks = filteredTasks.filter(task => task.status === group);
        
        // Add group header
        taskTableBody.innerHTML += `
            <tr class="group-header collapsible ${group !== 'To do' ? 'collapsed' : ''}" data-group="${group.toLowerCase().replace(" ", "-")}">
                <td colspan="7"><span class="group-title">${group}</span></td>
            </tr>
        `;
        
        // Add tasks in this group
        groupTasks.forEach(task => {
            const tr = document.createElement('tr');
            tr.className = `task-row ${group.toLowerCase().replace(" ", "-")} ${group === 'To do' ? 'visible' : ''}`;
            tr.innerHTML = `
                <td>${task.name}</td>
                <td>${task.assignee}</td>
                <td><span class="priority-tag ${task.priority.toLowerCase().replace(" ", "-")}">${task.priority}</span></td>
                <td>${formatDate(task.assignDate)}</td>
                <td>${formatDate(task.dueDate)}</td>
                <td><span class="status-tag ${task.progress.toLowerCase().replace(" ", "-")}">${task.progress}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-edit" data-id="${task.id}">Sửa</button>
                        <button class="btn-delete" data-id="${task.id}">Xóa</button>
                    </div>
                </td>
            `;
            taskTableBody.appendChild(tr);
        });
    });
    
    // Add event listeners for buttons
    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', () => handleEditTask(parseInt(button.getAttribute('data-id'))));
    });
    
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', () => handleDeleteTask(parseInt(button.getAttribute('data-id'))));
    });
    
    // Add event listeners for collapsible groups
    document.querySelectorAll(".group-header.collapsible").forEach(header => {
        header.addEventListener("click", function () {
            const group = this.getAttribute("data-group");
            const tasks = document.querySelectorAll(`.task-row.${group}`);
            this.classList.toggle("collapsed");
            tasks.forEach(task => task.classList.toggle("visible"));
        });
    });
}

function showTaskModal() {
    if (taskModal) {
        taskModal.style.display = 'block';
        overlay.classList.add('active');
        taskModal.querySelector('.modal__task-header h2').textContent = 'Thêm nhiệm vụ';
    }
}

function hideTaskModal() {
    if (taskModal) {
        taskModal.style.display = 'none';
        overlay.classList.remove('active');
        addTaskForm.reset();
        addTaskForm.removeAttribute('data-edit-id');
    }
}

function handleTaskSubmit(e) {
    e.preventDefault();
    
    const taskName = document.getElementById('task-name').value.trim();
    const assignee = document.getElementById('assignee').value;
    const status = document.getElementById('status').value;
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    const priority = document.getElementById('priority').value;
    const progress = document.getElementById('progress').value;
    
    // Validate task name
    if (!taskName) {
        showNotification('Tên nhiệm vụ không được để trống!', 'error');
        document.getElementById('task-name').classList.add('error');
        return;
    }
    
    // Validate dates
    if (!startDate) {
        showNotification('Ngày bắt đầu không được để trống!', 'error');
        document.getElementById('start-date').classList.add('error');
        return;
    }
    
    if (!endDate) {
        showNotification('Hạn cuối không được để trống!', 'error');
        document.getElementById('end-date').classList.add('error');
        return;
    }
    
    if (new Date(endDate) < new Date(startDate)) {
        showNotification('Hạn cuối không được sớm hơn ngày bắt đầu!', 'error');
        document.getElementById('end-date').classList.add('error');
        return;
    }
    
    // Check if editing or adding
    const editId = addTaskForm.getAttribute('data-edit-id');
    
    if (editId !== null) {
        // Update existing task
        const taskId = parseInt(editId);
        const task = currentTasks.find(t => t.id === taskId);
        
        if (task) {
            task.name = taskName;
            task.assignee = assignee;
            task.status = status;
            task.assignDate = startDate;
            task.dueDate = endDate;
            task.priority = priority;
            task.progress = progress;
            showNotification('Cập nhật nhiệm vụ thành công!', 'success');
        }
    } else {
        // Create new task
        const newTask = {
            id: currentTasks.length > 0 ? Math.max(...currentTasks.map(t => t.id)) + 1 : 1,
            name: taskName,
            assignee: assignee,
            assignDate: startDate,
            dueDate: endDate,
            priority: priority,
            progress: progress,
            status: status
        };
        
        // Add task to project
        currentTasks.push(newTask);
        currentProject.tasks = currentTasks;
        showNotification('Thêm nhiệm vụ thành công!', 'success');
    }
    
    // Update project in localStorage
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    const projectIndex = projects.findIndex(p => p.id === currentProject.id);
    
    if (projectIndex !== -1) {
        projects[projectIndex] = currentProject;
                    localStorage.setItem('projects', JSON.stringify(projects));
    }
    
    // Reset form and hide modal
    addTaskForm.reset();
    hideTaskModal();
    
    // Reload tasks
    renderTasks();
}

function handleEditTask(taskId) {
    const task = currentTasks.find(t => t.id === taskId);
    
    if (task) {
        // Populate form with task data
        document.getElementById('task-name').value = task.name;
        document.getElementById('assignee').value = task.assignee;
        document.getElementById('status').value = task.status;
        document.getElementById('start-date').value = task.assignDate;
        document.getElementById('end-date').value = task.dueDate;
        document.getElementById('priority').value = task.priority;
        document.getElementById('progress').value = task.progress;
        
        // Set edit id
        addTaskForm.setAttribute('data-edit-id', taskId);
        
        // Update modal title
        taskModal.querySelector('.modal__task-header h2').textContent = 'Sửa nhiệm vụ';
        
        // Show modal
        showTaskModal();
    }
}

function handleDeleteTask(taskId) {
    if (confirm('Bạn có chắc chắn muốn xóa nhiệm vụ này?')) {
        // Remove task from project
        currentTasks = currentTasks.filter(t => t.id !== taskId);
        currentProject.tasks = currentTasks;
        
        // Update project in localStorage
        const projects = JSON.parse(localStorage.getItem('projects') || '[]');
        const projectIndex = projects.findIndex(p => p.id === currentProject.id);
        
        if (projectIndex !== -1) {
            projects[projectIndex] = currentProject;
            localStorage.setItem('projects', JSON.stringify(projects));
        }
        
        // Show notification
        showNotification('Xóa nhiệm vụ thành công!', 'success');
        
        // Reload tasks
                renderTasks();
            }
        }

function populateAssigneeSelect() {
    assigneeSelect.innerHTML = '';
    
    if (!currentProject || !currentProject.members) {
        return;
    }
    
    currentProject.members.forEach(member => {
        const option = document.createElement('option');
        option.value = member.name;
        option.textContent = member.name;
        assigneeSelect.appendChild(option);
    });
}

// Notification Function
    function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
            notification.textContent = message;
    notification.style.cssText = `
        position: fixed; top: 70px; right: 20px; padding: 15px 25px;
        border-radius: 4px; color: white; z-index: 1000; display: block;
        background-color: ${type === 'success' ? '#198754' : '#DC3545'};
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
} 