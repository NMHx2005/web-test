document.addEventListener('DOMContentLoaded', function() {
    // Lấy project ID từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = parseInt(urlParams.get('id'));

    // Load dữ liệu từ localStorage
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Tìm project theo ID
    const currentProject = projects.find(p => p.id === projectId);
    if (!currentProject) {
        window.location.href = 'project-manager.html';
        return;
    }

    // Hiển thị thông tin dự án
    function renderProjectInfo() {
        document.querySelector('.project-name').textContent = currentProject.projectName;
        document.querySelector('.project-description').textContent = currentProject.description || '';
    }

    // Hiển thị danh sách thành viên
    function renderMembers() {
        const memberList = document.querySelector('.member-list');
        if (memberList && currentProject.members) {
            memberList.innerHTML = currentProject.members.map(member => `
                <div class="member-item">
                    <div class="member-info">
                        <span class="member-name">${member.name}</span>
                        <span class="member-role">${member.role}</span>
                    </div>
                    <div class="member-actions">
                        <button class="btn-edit-member" data-id="${member.userId}">Sửa</button>
                        <button class="btn-delete-member" data-id="${member.userId}">Xóa</button>
                    </div>
                </div>
            `).join('');
        }
    }

    // Hiển thị danh sách nhiệm vụ của dự án
    function renderTasks() {
        const projectTasks = JSON.parse(localStorage.getItem(`tasks_${currentProject.projectName}`)) || [];
        const taskTable = document.querySelector('.task-list tbody');
        
        if (taskTable) {
            // Xóa nội dung hiện tại của bảng
            taskTable.innerHTML = '';

            // Nhóm nhiệm vụ theo trạng thái
            const statusGroups = {
                'To do': [],
                'In progress': [],
                'Pending': [],
                'Done': []
            };

            // Phân loại nhiệm vụ vào các nhóm
            projectTasks.forEach(task => {
                if (statusGroups[task.status]) {
                    statusGroups[task.status].push(task);
                }
            });

            // Render từng nhóm
            Object.entries(statusGroups).forEach(([status, tasks]) => {
                // Thêm header cho nhóm
                const groupHeader = document.createElement('tr');
                groupHeader.className = 'group-header collapsible';
                groupHeader.setAttribute('data-group', status.toLowerCase().replace(' ', '-'));
                groupHeader.innerHTML = `
                    <td colspan="7">
                        <span class="group-title">${status} (${tasks.length})</span>
                    </td>
                `;
                taskTable.appendChild(groupHeader);

                // Thêm các nhiệm vụ trong nhóm
                tasks.forEach(task => {
                    const taskRow = document.createElement('tr');
                    taskRow.className = `task-row ${status.toLowerCase().replace(' ', '-')}`;
                    taskRow.innerHTML = `
                        <td>${task.taskName}</td>
                        <td>${getAssigneeName(task.assigneeId)}</td>
                        <td><span class="priority-tag ${task.priority.toLowerCase()}">${task.priority}</span></td>
                        <td>${formatDate(task.startDate)}</td>
                        <td>${formatDate(task.dueDate)}</td>
                        <td><span class="status-tag ${task.progress.toLowerCase().replace(' ', '-')}">${task.progress}</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn-edit" data-id="${task.id}">Sửa</button>
                                <button class="btn-delete" data-id="${task.id}">Xóa</button>
                            </div>
                        </td>
                    `;
                    taskTable.appendChild(taskRow);
                });
            });

            // Thêm sự kiện cho các nút collapse/expand
            document.querySelectorAll('.group-header').forEach(header => {
                header.addEventListener('click', function() {
                    const group = this.getAttribute('data-group');
                    const rows = document.querySelectorAll(`.task-row.${group}`);
                    this.classList.toggle('collapsed');
                    rows.forEach(row => {
                        row.style.display = this.classList.contains('collapsed') ? 'none' : '';
                    });
                });
            });
        } else {
            console.error('Không tìm thấy bảng nhiệm vụ');
        }
    }

    // Helper function để lấy tên người phụ trách
    function getAssigneeName(assigneeId) {
        const member = currentProject.members.find(m => m.userId === assigneeId);
        return member ? member.name : 'Unknown';
    }

    // Format date helper
    function formatDate(dateString) {
        const date = new Date(dateString);
        return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }

    // Xử lý thêm thành viên mới
    const addMemberForm = document.querySelector('#addMemberForm');
    if (addMemberForm) {
        addMemberForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const memberName = this.querySelector('[name="member-name"]').value.trim();
            const memberRole = this.querySelector('[name="member-role"]').value.trim();
            
            // Kiểm tra trùng tên
            const isExist = currentProject.members.some(m => 
                m.name.toLowerCase() === memberName.toLowerCase()
            );
            
            if (isExist) {
                showNotification('Tên thành viên đã tồn tại!', 'error');
                return;
            }
            
            // Thêm thành viên mới
            const newMember = {
                userId: currentProject.members.length > 0 
                    ? Math.max(...currentProject.members.map(m => m.userId)) + 1 
                    : 1,
                name: memberName,
                role: memberRole
            };
            
            currentProject.members.push(newMember);
            
            // Cập nhật localStorage
            localStorage.setItem('projects', JSON.stringify(projects));
            
            // Đóng modal và hiển thị thông báo
            hideModal('memberModal');
            showNotification('Thêm thành viên thành công!', 'success');
            renderMembers();
        });
    }

    // Xử lý modal thêm nhiệm vụ
    const addTaskBtn = document.querySelector('.add-task-btn');
    const taskModal = document.getElementById('taskModal');
    const closeTaskModal = taskModal.querySelector('.close');
    const cancelTaskBtn = taskModal.querySelector('.cancel');
    const addTaskForm = document.getElementById('addTaskForm');

    

    // Kiểm tra xem các phần tử có tồn tại không
    if (!addTaskBtn || !taskModal || !closeTaskModal || !cancelTaskBtn || !addTaskForm) {
        console.error('Không tìm thấy các phần tử cần thiết cho modal thêm nhiệm vụ');
        return;
    }

    // Xử lý hiển thị modal
    addTaskBtn.addEventListener('click', function() {
        console.log('Button clicked');
        taskModal.style.display = 'block';
    });

    // Xử lý đóng modal
    function closeTaskModalFunc() {
        taskModal.style.display = 'none';
        addTaskForm.reset();
    }

    closeTaskModal.addEventListener('click', closeTaskModalFunc);
    cancelTaskBtn.addEventListener('click', closeTaskModalFunc);

    // Đóng modal khi click ra ngoài
    window.addEventListener('click', function(event) {
        if (event.target === taskModal) {
            closeTaskModalFunc();
        }
    });

    // Xử lý submit form
    addTaskForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const taskName = this.querySelector('[name="task-name"]').value.trim();
        const assigneeId = parseInt(this.querySelector('[name="assignee"]').value);
        const status = this.querySelector('[name="status"]').value;
        const startDate = this.querySelector('[name="start-date"]').value;
        const dueDate = this.querySelector('[name="due-date"]').value;
        const priority = this.querySelector('[name="priority"]').value;
        const progress = this.querySelector('[name="progress"]').value;
        
        // Lấy danh sách nhiệm vụ từ localStorage
        let projectTasks = JSON.parse(localStorage.getItem(`tasks_${currentProject.projectName}`)) || [];
        console.log('Current tasks:', projectTasks);
        
        // Kiểm tra trùng tên nhiệm vụ trong dự án
        const isExist = projectTasks.some(t => 
            t.taskName.toLowerCase() === taskName.toLowerCase()
        );
        
        if (isExist) {
            showNotification('Tên nhiệm vụ đã tồn tại trong dự án!', 'error');
            return;
        }
        
        // Thêm nhiệm vụ mới
        const newTask = {
            id: projectTasks.length > 0 ? Math.max(...projectTasks.map(t => t.id)) + 1 : 1,
            taskName,
            projectId: currentProject.id,
            projectName: currentProject.projectName,
            assigneeId,
            status,
            priority,
            progress,
            startDate,
            dueDate,
            createdAt: new Date().toISOString()
        };
        console.log('New task:', newTask);
        
        projectTasks.push(newTask);
        
        // Lưu vào localStorage theo tên dự án
        localStorage.setItem(`tasks_${currentProject.projectName}`, JSON.stringify(projectTasks));
        console.log('Updated tasks:', JSON.parse(localStorage.getItem(`tasks_${currentProject.projectName}`)));
        
        // Cập nhật danh sách nhiệm vụ tổng thể
        let allTasks = JSON.parse(localStorage.getItem('all_tasks')) || [];
        allTasks.push(newTask);
        localStorage.setItem('all_tasks', JSON.stringify(allTasks));
        
        // Đóng modal và hiển thị thông báo
        closeTaskModalFunc();
        showNotification('Thêm nhiệm vụ thành công!', 'success');
        renderTasks();
    });

    // Xử lý xóa thành viên
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-delete-member')) {
            const userId = parseInt(e.target.getAttribute('data-id'));
            if (confirm('Bạn có chắc chắn muốn xóa thành viên này?')) {
                const index = currentProject.members.findIndex(m => m.userId === userId);
                if (index !== -1) {
                    currentProject.members.splice(index, 1);
                    localStorage.setItem('projects', JSON.stringify(projects));
                    showNotification('Xóa thành viên thành công!', 'success');
                    renderMembers();
                }
            }
        }
    });

    // Xử lý xóa nhiệm vụ
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-delete')) {
            const taskId = parseInt(e.target.getAttribute('data-id'));
            if (confirm('Bạn có chắc chắn muốn xóa nhiệm vụ này?')) {
                let projectTasks = JSON.parse(localStorage.getItem(`tasks_${currentProject.projectName}`)) || [];
                const index = projectTasks.findIndex(t => t.id === taskId);
                
                if (index !== -1) {
                    // Xóa khỏi danh sách nhiệm vụ của dự án
                    projectTasks.splice(index, 1);
                    localStorage.setItem(`tasks_${currentProject.projectName}`, JSON.stringify(projectTasks));
                    
                    // Xóa khỏi danh sách nhiệm vụ tổng thể
                    let allTasks = JSON.parse(localStorage.getItem('all_tasks')) || [];
                    allTasks = allTasks.filter(t => t.id !== taskId);
                    localStorage.setItem('all_tasks', JSON.stringify(allTasks));
                    
                    showNotification('Xóa nhiệm vụ thành công!', 'success');
                    renderTasks();
                }
            }
        }
    });

    // Xử lý cập nhật trạng thái nhiệm vụ
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('status-toggle')) {
            const taskId = parseInt(e.target.getAttribute('data-task-id'));
            const task = tasks.find(t => t.id === taskId);
            
            if (task) {
                const statusFlow = {
                    'To do': 'In progress',
                    'In progress': 'Pending',
                    'Pending': 'Done',
                    'Done': 'To do'
                };
                
                task.status = statusFlow[task.status];
                localStorage.setItem('tasks', JSON.stringify(tasks));
                showNotification(`Đã cập nhật trạng thái thành ${task.status}`, 'success');
                renderTasks();
            }
        }
    });

    // Khởi tạo hiển thị
    renderProjectInfo();
    renderMembers();
    renderTasks();

    // Helper function để hiển thị thông báo
    function showNotification(message, type = 'success') {
        const notification = document.querySelector('.notification');
        if (notification) {
            notification.textContent = message;
            notification.className = `notification ${type}`;
            notification.style.display = 'block';
            
            setTimeout(() => {
                notification.style.display = 'none';
            }, 3000);
        }
    }

    // Helper function để ẩn modal
    function hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }
}); 