// Constants
const ITEMS_PER_PAGE = 5;

// DOM Elements
let currentPage = 1;
let searchQuery = '';
let currentUser = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOMContentLoaded triggered");

    // Lấy thông tin người dùng hiện tại từ localStorage
    currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || !currentUser.name) {
        showNotification('Vui lòng đăng nhập để xem nhiệm vụ!', 'error');
        setTimeout(() => window.location.href = '../index.html', 2000);
        return;
    }

    console.log("Current User:", currentUser.name);

    // Load dữ liệu từ localStorage
    let allTasks = JSON.parse(localStorage.getItem('tasks')) || {};
    console.log("Initial allTasks:", allTasks);

    // Hàm lấy danh sách nhiệm vụ cá nhân từ tất cả dự án
    function getPersonalTasks() {
        const personalTasks = [];
        for (const projectId in allTasks) {
            const projectTasks = allTasks[projectId].filter(task => task.assignee === currentUser.name);
            projectTasks.forEach(task => {
                personalTasks.push({ ...task, projectId: parseInt(projectId) });
            });
        }
        console.log("Personal Tasks:", personalTasks);
        return personalTasks;
    }

    let tasks = getPersonalTasks();

    // Hàm hiển thị thông báo
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed; top: 70px; right: 20px; padding: 15px 25px;
            border-radius: 4px; color: white; z-index: 1000;
            background-color: ${type === 'success' ? '#198754' : '#DC3545'};
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    // Hàm format ngày tháng
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN');
    }

    // Hàm render nhiệm vụ theo nhóm
    function renderTasks(taskList = tasks) {
        console.log("Rendering tasks with:", taskList);
        const statusGroups = ['To do', 'In Progress', 'Pending', 'Done'];
        const tbody = document.querySelector('.task-table tbody');
        if (!tbody) {
            console.error('Không tìm thấy tbody trong .task-table');
            return;
        }

        tbody.innerHTML = '';
        statusGroups.forEach(status => {
            const groupTasks = taskList.filter(task => task.status === status);
            tbody.innerHTML += `
                <tr class="group-header collapsible ${status !== 'To do' ? 'collapsed' : ''}" data-group="${status.toLowerCase().replace(' ', '-')}">
                    <td colspan="6"><span class="group-title">${status}</span></td>
                </tr>
                ${groupTasks.map(task => `
                    <tr class="task-row ${status.toLowerCase().replace(' ', '-')} visible" data-task-id="${task.id}" data-project-id="${task.projectId}">
                        <td>${task.name}</td>
                        <td><span class="priority-tag ${task.priority.toLowerCase().replace(' ', '-')}">${task.priority}</span></td>
                        <td>
                            <span class="process-status" data-task-id="${task.id}">
                                ${task.status}
                                <img src="../assets/images/process.svg" class="status-toggle" />
                            </span>
                        </td>
                        <td>${formatDate(task.startDate)}</td>
                        <td>${formatDate(task.dueDate)}</td>
                        <td><span class="status-tag ${task.progress.toLowerCase().replace(' ', '-')}">${task.progress}</span></td>
                    </tr>
                `).join('')}
            `;
        });

        setupCollapse();
        attachTaskActions();
    }

    // Hàm xử lý chuyển đổi trạng thái
    function handleStatusToggle(event) {
        const statusElement = event.target.closest('.process-status');
        const taskId = parseInt(statusElement.getAttribute('data-task-id'));
        const taskRow = event.target.closest('.task-row');
        const projectId = parseInt(taskRow.getAttribute('data-project-id'));
        const task = allTasks[projectId].find(t => t.id === taskId);

        if (task) {
            const statusFlow = {
                'To do': 'In Progress',
                'In Progress': 'Pending',
                'Pending': 'Done',
                'Done': 'To do'
            };
            task.status = statusFlow[task.status];
            localStorage.setItem('tasks', JSON.stringify(allTasks));
            showNotification(`Đã cập nhật trạng thái thành ${task.status}`, 'success');
            tasks = getPersonalTasks();
            renderTasks();
        }
    }

    // Hàm tìm kiếm nhiệm vụ (cải tiến)
    function searchTasks(searchTerm) {
        let filteredTasks;
        if (searchTerm === '') {
            filteredTasks = tasks; // Hiển thị tất cả nếu không nhập gì
        } else {
            filteredTasks = tasks.filter(task => 
                task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.priority.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
                task.progress.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        console.log("Filtered Tasks:", filteredTasks); // Debug kết quả tìm kiếm
        renderTasks(filteredTasks); // Vẽ lại bảng với dữ liệu đã lọc
    }

    // Xử lý tìm kiếm
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        // Tìm kiếm khi nhấn Enter
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const searchTerm = searchInput.value.trim();
                searchTasks(searchTerm); // Gọi hàm tìm kiếm và vẽ lại bảng
            }
        });
    }

    // Hàm sửa nhiệm vụ
    function editTask(taskId, projectId) {
        const task = allTasks[projectId].find(t => t.id === taskId);
        if (!task) return;

        const modal = document.createElement('div');
        modal.className = 'modal__task';
        modal.innerHTML = `
            <div class="modal__task-header">
                <h2>Sửa nhiệm vụ</h2>
                <span class="close">×</span>
            </div>
            <form id="editTaskForm">
                <div class="modal__task-body">
                    <label for="task-name">Tên nhiệm vụ</label>
                    <input type="text" id="task-name" name="task-name" value="${task.name}">
                    <label for="priority">Độ ưu tiên</label>
                    <select id="priority" name="priority">
                        <option value="Cao" ${task.priority === 'Cao' ? 'selected' : ''}>Cao</option>
                        <option value="Trung Bình" ${task.priority === 'Trung Bình' ? 'selected' : ''}>Trung Bình</option>
                        <option value="Thấp" ${task.priority === 'Thấp' ? 'selected' : ''}>Thấp</option>
                    </select>
                    <label for="start-date">Ngày bắt đầu</label>
                    <input type="date" id="start-date" name="start-date" value="${task.startDate}">
                    <label for="due-date">Hạn chót</label>
                    <input type="date" id="due-date" name="due-date" value="${task.dueDate}">
                    <label for="progress">Tiến độ</label>
                    <select id="progress" name="progress">
                        <option value="Đúng tiến độ" ${task.progress === 'Đúng tiến độ' ? 'selected' : ''}>Đúng tiến độ</option>
                        <option value="Có rủi ro" ${task.progress === 'Có rủi ro' ? 'selected' : ''}>Có rủi ro</option>
                        <option value="Trì hoãn" ${task.progress === 'Trì hoãn' ? 'selected' : ''}>Trì hoãn</option>
                    </select>
                </div>
                <div class="modal__task-footer">
                    <button type="button" class="cancel">Hủy</button>
                    <button type="submit" class="save">Lưu</button>
                </div>
            </form>
        `;
        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('.close');
        const cancelBtn = modal.querySelector('.cancel');
        const form = modal.querySelector('#editTaskForm');

        closeBtn.addEventListener('click', () => modal.remove());
        cancelBtn.addEventListener('click', () => modal.remove());

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            task.name = form.querySelector('#task-name').value.trim();
            task.priority = form.querySelector('#priority').value;
            task.startDate = form.querySelector('#start-date').value;
            task.dueDate = form.querySelector('#due-date').value;
            task.progress = form.querySelector('#progress').value;

            localStorage.setItem('tasks', JSON.stringify(allTasks));
            showNotification('Cập nhật nhiệm vụ thành công!', 'success');
            tasks = getPersonalTasks();
            renderTasks();
            modal.remove();
        });

        modal.style.display = 'block';
    }

    // Hàm xóa nhiệm vụ
    function deleteTask(taskId, projectId) {
        if (confirm('Bạn có chắc chắn muốn xóa nhiệm vụ này?')) {
            allTasks[projectId] = allTasks[projectId].filter(t => t.id !== taskId);
            localStorage.setItem('tasks', JSON.stringify(allTasks));
            showNotification('Xóa nhiệm vụ thành công!', 'success');
            tasks = getPersonalTasks();
            renderTasks();
        }
    }

    // Gán sự kiện sửa và xóa sau khi render
    function attachTaskActions() {
        document.querySelectorAll('.task-row').forEach(row => {
            const taskId = parseInt(row.getAttribute('data-task-id'));
            const projectId = parseInt(row.getAttribute('data-project-id'));
            row.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                const menu = document.createElement('div');
                menu.className = 'context-menu';
                menu.innerHTML = `
                    <button class="edit-task">Sửa</button>
                    <button class="delete-task">Xóa</button>
                `;
                menu.style.cssText = `
                    position: absolute; top: ${e.pageY}px; left: ${e.pageX}px;
                    background: white; border: 1px solid #ccc; padding: 5px;
                `;
                document.body.appendChild(menu);

                menu.querySelector('.edit-task').addEventListener('click', () => {
                    editTask(taskId, projectId);
                    menu.remove();
                });
                menu.querySelector('.delete-task').addEventListener('click', () => {
                    deleteTask(taskId, projectId);
                    menu.remove();
                });

                document.addEventListener('click', () => menu.remove(), { once: true });
            });
        });
    }

    // Xử lý collapse/expand cho các nhóm
    function setupCollapse() {
        document.querySelectorAll('.group-header.collapsible').forEach(header => {
            header.removeEventListener('click', toggleCollapse);
            header.addEventListener('click', toggleCollapse);
        });
    }

    function toggleCollapse() {
        const group = this.getAttribute('data-group');
        const tasks = document.querySelectorAll(`.task-row.${group}`);
        this.classList.toggle('collapsed');
        tasks.forEach(task => task.classList.toggle('visible'));
    }

    // Xử lý đăng xuất
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            showNotification('Đăng xuất thành công!', 'success');
            setTimeout(() => window.location.href = '../index.html', 1000);
        });
    }

    // Khởi tạo hiển thị ban đầu
    renderTasks();
});

// Setup event listeners
function setupEventListeners() {
    // Search input
    document.querySelector('.search-box input').addEventListener('input', function(e) {
        searchQuery = e.target.value.toLowerCase();
        currentPage = 1;
        renderTasks();
    });
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentPage = 1;
            renderTasks();
        });
    });
    
    // Sort buttons
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderTasks();
        });
    });
}

// Load personal tasks
function loadPersonalTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '{}');
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    
    // Get all tasks assigned to current user
    let personalTasks = [];
    Object.entries(tasks).forEach(([projectId, projectTasks]) => {
        const project = projects.find(p => p.id === parseInt(projectId));
        if (project) {
            projectTasks.forEach(task => {
                if (task.assignee === currentUser.name) {
                    personalTasks.push({
                        ...task,
                        projectName: project.projectName
                    });
                }
            });
        }
    });
    
    renderTasks(personalTasks);
}

// Render tasks with filtering, sorting and pagination
function renderTasks(tasks) {
    // Filter tasks
    let filteredTasks = tasks.filter(task => 
        task.name.toLowerCase().includes(searchQuery) ||
        task.projectName.toLowerCase().includes(searchQuery)
    );
    
    // Get active filter
    const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
    if (activeFilter !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.status === activeFilter);
    }
    
    // Get active sort
    const activeSort = document.querySelector('.sort-btn.active').dataset.sort;
    filteredTasks.sort((a, b) => {
        if (activeSort === 'dueDate') {
            return new Date(a.dueDate) - new Date(b.dueDate);
        } else if (activeSort === 'priority') {
            const priorityOrder = { 'Cao': 0, 'Trung Bình': 1, 'Thấp': 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return 0;
    });
    
    // Pagination
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const paginatedTasks = filteredTasks.slice(startIndex, endIndex);
    
    // Render tasks
    const tbody = document.querySelector('.task-table tbody');
    tbody.innerHTML = '';
    
    paginatedTasks.forEach(task => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${task.name}</td>
            <td>${task.projectName}</td>
            <td>${formatDate(task.assignDate)}</td>
            <td>${formatDate(task.dueDate)}</td>
            <td>${task.priority}</td>
            <td>${task.progress}</td>
            <td>${task.status}</td>
            <td class="action-buttons">
                <button class="btn-view" onclick="viewTaskDetail(${task.id})">Xem</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    
    // Render pagination
    renderPagination(filteredTasks.length);
}

// Render pagination
function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const pagination = document.querySelector('.pagination');
    pagination.innerHTML = '';
    
    // Previous button
    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.textContent = '<';
        prevButton.addEventListener('click', () => {
            currentPage--;
            renderTasks();
        });
        pagination.appendChild(prevButton);
    }
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        if (i === currentPage) {
            button.classList.add('active');
        }
        button.addEventListener('click', () => {
            currentPage = i;
            renderTasks();
        });
        pagination.appendChild(button);
    }
    
    // Next button
    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.textContent = '>';
        nextButton.addEventListener('click', () => {
            currentPage++;
            renderTasks();
        });
        pagination.appendChild(nextButton);
    }
}

// View task detail
function viewTaskDetail(taskId) {
    // Find project containing this task
    const tasks = JSON.parse(localStorage.getItem('tasks') || '{}');
    const projects = JSON.parse(localStorage.getItem('projects') || '[]');
    
    let projectId = null;
    Object.entries(tasks).forEach(([pid, projectTasks]) => {
        if (projectTasks.some(t => t.id === taskId)) {
            projectId = parseInt(pid);
        }
    });
    
    if (projectId) {
        window.location.href = `project-detail.html?id=${projectId}`;
    }
}