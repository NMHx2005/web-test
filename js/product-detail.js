document.addEventListener("DOMContentLoaded", function () {
    const overlay = document.querySelector('#overlay'); // Thêm overlay

    // Lấy project ID từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');

    // Debug để kiểm tra
    console.log("Project ID từ URL:", projectId);

    // Cập nhật tiêu đề và mô tả dự án
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    console.log("Danh sách projects từ localStorage:", projects);
    const project = projects.find(p => p.id === parseInt(projectId));
    console.log("Project tìm thấy:", project);

    const projectTitle = document.querySelector('.project-title');
    const projectDescription = document.querySelector('.project-description');
    if (projectTitle && projectDescription) {
        projectTitle.textContent = project ? project.projectName : 'Dự án không tồn tại';
        projectDescription.textContent = project ? project.description || 'Không có mô tả' : 'Không có mô tả';
    } else {
        console.error("Không tìm thấy phần tử .project-title hoặc .project-description trong DOM");
    }

    // Khởi tạo dữ liệu mẫu cho tasks nếu chưa có
    if (!localStorage.getItem('tasks')) {
        const initialTasks = {
            [projectId]: [
                { id: 1, name: "Soạn thảo đề cương dự án", assignee: "An Nguyễn", priority: "Cao", startDate: "2024-02-24", dueDate: "2024-02-27", progress: "Đúng tiến độ", status: "To do" },
                { id: 2, name: "Lên lịch họp kickoff", assignee: "An Nguyễn", priority: "Trung Bình", startDate: "2024-02-24", dueDate: "2024-02-27", progress: "Có rủi ro", status: "In Progress" },
                { id: 3, name: "Chờ duyệt thiết kế", assignee: "An Nguyễn", priority: "Trung Bình", startDate: "2024-02-24", dueDate: "2024-02-27", progress: "Có rủi ro", status: "Pending" },
                { id: 4, name: "Hoàn thành khảo sát", assignee: "An Nguyễn", priority: "Thấp", startDate: "2024-02-24", dueDate: "2024-02-27", progress: "Đúng tiến độ", status: "Done" }
            ]
        };
        localStorage.setItem('tasks', JSON.stringify(initialTasks));
    }

    // Khởi tạo dữ liệu members trong localStorage nếu chưa có
    if (!localStorage.getItem('members')) {
        const initialMembers = {
            [projectId]: [
                { name: "An Nguyễn", role: "Project owner" },
                { name: "Bách Nguyễn", role: "Frontend developer" }
            ]
        };
        localStorage.setItem('members', JSON.stringify(initialMembers));
    }

    // Hàm hiển thị thông báo
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

    // --- Render danh sách nhiệm vụ ---
    // function renderTasks() {
    //     const tasks = JSON.parse(localStorage.getItem('tasks')) || {};
    //     const projectTasks = tasks[projectId] || [];
    //     const tbody = document.querySelector('.task-table tbody');
    //     if (!tbody) {
    //         console.error("Không tìm thấy tbody trong .task-table");
    //         return;
    //     }

    //     tbody.innerHTML = '';
    //     const groups = ["to-do", "in-progress", "pending", "done"];
    //     groups.forEach(group => {
    //         const groupTasks = projectTasks.filter(task => task.status.toLowerCase().replace(" ", "-") === group);
    //         tbody.innerHTML += `
    //             <tr class="group-header collapsible ${group !== 'to-do' ? 'collapsed' : ''}" data-group="${group}">
    //                 <td colspan="7"><span class="group-title">${group.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}</span></td>
    //             </tr>
    //             ${groupTasks.map(task => `
    //                 <tr class="task-row ${group} ${group === 'to-do' ? 'visible' : ''}">
    //                     <td>${task.name}</td>
    //                     <td>${task.assignee}</td>
    //                     <td><span class="priority-tag ${task.priority.toLowerCase().replace(" ", "-")}">${task.priority}</span></td>
    //                     <td>${task.startDate.slice(5)}</td>
    //                     <td>${task.dueDate.slice(5)}</td>
    //                     <td><span class="status-tag ${task.progress.toLowerCase().replace(" ", "-")}">${task.progress}</span></td>
    //                     <td>
    //                         <div class="action-buttons">
    //                             <button class="btn-edit" data-id="${task.id}">Sửa</button>
    //                             <button class="btn-delete" data-id="${task.id}">Xóa</button>
    //                         </div>
    //                     </td>
    //                 </tr>
    //             `).join('')}
    //         `;
    //     });

    //     document.querySelectorAll('.btn-edit').forEach(button => {
    //         button.addEventListener('click', () => editTask(parseInt(button.getAttribute('data-id'))));
    //     });
    //     document.querySelectorAll('.btn-delete').forEach(button => {
    //         button.addEventListener('click', () => deleteTask(parseInt(button.getAttribute('data-id'))));
    //     });
    //     document.querySelectorAll(".group-header.collapsible").forEach(header => {
    //         header.addEventListener("click", function () {
    //             const group = this.getAttribute("data-group");
    //             const tasks = document.querySelectorAll(`.task-row.${group}`);
    //             this.classList.toggle("collapsed");
    //             tasks.forEach(task => task.classList.toggle("visible"));
    //         });
    //     });
    // }
    function renderTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || {};
        const projectTasks = tasks[projectId] || [];
        const tbody = document.querySelector('.task-table tbody');
        if (!tbody) {
            console.error("Không tìm thấy tbody trong .task-table");
            return;
        }

        tbody.innerHTML = '';
        const groups = ["to-do", "in-progress", "pending", "done"];
        groups.forEach(group => {
            const groupTasks = projectTasks.filter(task => task.status.toLowerCase().replace(" ", "-") === group);
            tbody.innerHTML += `
                <tr class="group-header collapsible ${group !== 'to-do' ? 'collapsed' : ''}" data-group="${group}">
                    <td colspan="7"><span class="group-title">${group.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase())}</span></td>
                </tr>
                ${groupTasks.map(task => `
                    <tr class="task-row ${group} ${group === 'to-do' ? 'visible' : ''}">
                        <td>${task.name}</td>
                        <td>${task.assignee}</td>
                        <td><span class="priority-tag ${task.priority.toLowerCase().replace(" ", "-")}">${task.priority}</span></td>
                        <td>${task.startDate.slice(5)}</td>
                        <td>${task.dueDate.slice(5)}</td>
                        <td><span class="status-tag ${task.progress.toLowerCase().replace(" ", "-")}">${task.progress}</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn-edit" data-id="${task.id}">Sửa</button>
                                <button class="btn-delete" data-id="${task.id}">Xóa</button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            `;
        });

        document.querySelectorAll('.btn-edit').forEach(button => {
            button.addEventListener('click', () => editTask(parseInt(button.getAttribute('data-id'))));
        });
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', () => deleteTask(parseInt(button.getAttribute('data-id'))));
        });
        document.querySelectorAll(".group-header.collapsible").forEach(header => {
            header.addEventListener("click", function () {
                const group = this.getAttribute("data-group");
                const tasks = document.querySelectorAll(`.task-row.${group}`);
                this.classList.toggle("collapsed");
                tasks.forEach(task => task.classList.toggle("visible"));
            });
        });
    }

    // --- Quản lý nhiệm vụ ---
    const taskModal = document.querySelector('.modal__task');
    const addTaskBtn = document.querySelector('.add-task-btn');
    const closeTaskBtn = taskModal?.querySelector('.close');
    const cancelTaskBtn = taskModal?.querySelector('.cancel');
    const taskForm = taskModal?.querySelector('#addTaskForm');

    function renderAssigneeOptions() {
        const members = JSON.parse(localStorage.getItem('members')) || {};
        const projectMembers = members[projectId] || [];
        const assigneeSelect = taskForm?.querySelector('#assignee');
        if (assigneeSelect) {
            assigneeSelect.innerHTML = projectMembers.map(member => `
                <option value="${member.name}">${member.name}</option>
            `).join('');
        }
    }

    function showTaskModal() {
        if (taskModal) {
            taskModal.style.display = 'block';
            overlay.classList.add('active'); // Hiển thị overlay
            taskForm?.reset();
            taskForm?.removeAttribute('data-edit-id');
            taskModal.querySelector('.modal__task-header h2').textContent = 'Thêm nhiệm vụ';
            renderAssigneeOptions();
        }
    }

    function hideTaskModal() {
        if (taskModal) {
            taskModal.style.display = 'none';
            overlay.classList.remove('active'); // Ẩn overlay
        }
    }

    if (addTaskBtn) addTaskBtn.addEventListener('click', showTaskModal);
    if (closeTaskBtn) closeTaskBtn.addEventListener('click', hideTaskModal);
    if (cancelTaskBtn) cancelTaskBtn.addEventListener('click', hideTaskModal);

    if (taskForm) {
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const tasks = JSON.parse(localStorage.getItem('tasks')) || {};
            if (!tasks[projectId]) tasks[projectId] = [];

            const taskName = taskForm.querySelector('#task-name')?.value.trim();
            const assignee = taskForm.querySelector('#assignee')?.value;
            const status = taskForm.querySelector('#status')?.value;
            const startDate = taskForm.querySelector('#start-date')?.value;
            const dueDate = taskForm.querySelector('#end-date')?.value;
            const priority = taskForm.querySelector('#priority')?.value;
            const progress = taskForm.querySelector('#progress')?.value;

            if (!taskName || !assignee || !status || !startDate || !dueDate || !priority || !progress) {
                showNotification('Vui lòng nhập đầy đủ thông tin!', 'error');
                return;
            }

            const editId = taskForm.getAttribute('data-edit-id');
            if (editId) {
                const task = tasks[projectId].find(t => t.id === parseInt(editId));
                if (task) {
                    task.name = taskName;
                    task.assignee = assignee;
                    task.status = status;
                    task.startDate = startDate;
                    task.dueDate = dueDate;
                    task.priority = priority;
                    task.progress = progress;
                    showNotification('Cập nhật nhiệm vụ thành công!', 'success');
                }
            } else {
                const newTask = {
                    id: tasks[projectId].length ? Math.max(...tasks[projectId].map(t => t.id)) + 1 : 1,
                    name: taskName,
                    assignee,
                    status,
                    startDate,
                    dueDate,
                    priority,
                    progress
                };
                tasks[projectId].push(newTask);
                showNotification('Thêm nhiệm vụ thành công!', 'success');
            }

            localStorage.setItem('tasks', JSON.stringify(tasks));
            hideTaskModal();
            renderTasks();
        });
    }

    function editTask(taskId) {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || {};
        const task = tasks[projectId]?.find(t => t.id === taskId);
        if (task && taskModal && taskForm) {
            taskModal.querySelector('.modal__task-header h2').textContent = 'Sửa nhiệm vụ';
            taskForm.querySelector('#task-name').value = task.name;
            taskForm.querySelector('#assignee').value = task.assignee;
            taskForm.querySelector('#status').value = task.status;
            taskForm.querySelector('#start-date').value = task.startDate;
            taskForm.querySelector('#end-date').value = task.dueDate;
            taskForm.querySelector('#priority').value = task.priority;
            taskForm.querySelector('#progress').value = task.progress;
            taskForm.setAttribute('data-edit-id', taskId);
            renderAssigneeOptions();
            taskModal.style.display = 'block';
            overlay.classList.add('active'); // Hiển thị overlay
        }
    }

    function deleteTask(taskId) {
        if (confirm('Bạn có chắc chắn muốn xóa nhiệm vụ này?')) {
            const tasks = JSON.parse(localStorage.getItem('tasks')) || {};
            if (tasks[projectId]) {
                tasks[projectId] = tasks[projectId].filter(t => t.id !== taskId);
                localStorage.setItem('tasks', JSON.stringify(tasks));
                renderTasks();
                showNotification('Xóa nhiệm vụ thành công!', 'success');
            }
        }
    }

    // --- Quản lý thành viên ---
    const memberModal = document.querySelector('.modal__member');
    const addMemberBtn = document.querySelector('.member-section .add-member-btn');
    const closeMemberButton = memberModal?.querySelector('.close');
    const cancelMemberButton = memberModal?.querySelector('.cancel');
    const memberForm = memberModal?.querySelector('form');

    const memberListModal = document.querySelector('.modal__member_list');
    const closeMemberListButton = memberListModal?.querySelector('.close');

    function renderMembers() {
        const members = JSON.parse(localStorage.getItem('members')) || {};
        const projectMembers = members[projectId] || [];
        const memberList = document.querySelector('.member-list');
        if (memberList) {
            memberList.innerHTML = projectMembers.map((member, idx) => `
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
            overlay.classList.add('active'); // Hiển thị overlay
            memberForm?.reset();
            memberModal.querySelector('.modal__member-header h2').textContent = 'Thêm thành viên';
        }
    }

    function hideMemberModal() {
        if (memberModal) {
            memberModal.style.display = 'none';
            overlay.classList.remove('active'); // Ẩn overlay
        }
    }

    function showMemberListModal() {
        const members = JSON.parse(localStorage.getItem('members')) || {};
        const projectMembers = members[projectId] || [];
        const memberListBody = memberListModal?.querySelector('.modal__member_list-body');
        if (memberListBody) {
            memberListBody.innerHTML = projectMembers.length === 0
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
                            ${projectMembers.map((member, index) => `
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

            memberListModal.style.display = 'block';
            overlay.classList.add('active'); // Hiển thị overlay

            memberListBody.querySelectorAll('.btn-edit').forEach(button => {
                button.addEventListener('click', () => editMember(parseInt(button.getAttribute('data-index'))));
            });
            memberListBody.querySelectorAll('.btn-delete').forEach(button => {
                button.addEventListener('click', () => deleteMember(parseInt(button.getAttribute('data-index'))));
            });
        }
    }

    function hideMemberListModal() {
        if (memberListModal) {
            memberListModal.style.display = 'none';
            overlay.classList.remove('active'); // Ẩn overlay
        }
    }

    function editMember(index) {
        const members = JSON.parse(localStorage.getItem('members')) || {};
        const projectMembers = members[projectId] || [];
        const member = projectMembers[index];
        if (member && memberModal && memberForm) {
            console.log("Đang sửa thành viên:", member);
            hideMemberListModal();
            const memberNameInput = memberForm.querySelector('[name="member-name"]');
            const memberRoleInput = memberForm.querySelector('[name="member-role"]');
            if (memberNameInput && memberRoleInput) {
                memberNameInput.value = member.name;
                memberRoleInput.value = member.role;
            } else {
                console.error("Không tìm thấy input member-name hoặc member-role trong form");
            }
            memberForm.setAttribute('data-edit-index', index);
            memberModal.querySelector('.modal__member-header h2').textContent = 'Sửa thành viên';
            memberModal.style.display = 'block';
            overlay.classList.add('active'); // Hiển thị overlay
        } else {
            console.error("Không tìm thấy member, memberModal hoặc memberForm");
        }
    }

    function deleteMember(index) {
        if (confirm('Bạn có chắc chắn muốn xóa thành viên này?')) {
            const members = JSON.parse(localStorage.getItem('members')) || {};
            if (members[projectId]) {
                members[projectId].splice(index, 1);
                localStorage.setItem('members', JSON.stringify(members));
                showNotification('Xóa thành viên thành công!', 'success');
                hideMemberListModal();
                renderMembers();
                renderAssigneeOptions();
            }
        }
    }

    if (addMemberBtn) addMemberBtn.addEventListener('click', showMemberModal);
    if (closeMemberButton) closeMemberButton.addEventListener('click', hideMemberModal);
    if (cancelMemberButton) cancelMemberButton.addEventListener('click', hideMemberModal);
    const listMemberBtn = document.querySelector('.list__member');
    if (listMemberBtn) listMemberBtn.addEventListener('click', showMemberListModal);
    if (closeMemberListButton) closeMemberListButton.addEventListener('click', hideMemberListModal);

    if (memberForm) {
        memberForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const members = JSON.parse(localStorage.getItem('members')) || {};
            if (!members[projectId]) members[projectId] = [];

            const memberNameInput = memberForm.querySelector('[name="member-name"]');
            const memberRoleInput = memberForm.querySelector('[name="member-role"]');
            const memberName = memberNameInput?.value.trim();
            const memberRole = memberRoleInput?.value.trim();

            if (!memberName || !memberRole) {
                showNotification('Vui lòng nhập đầy đủ thông tin!', 'error');
                if (!memberName) memberNameInput.classList.add('error');
                if (!memberRole) memberRoleInput.classList.add('error');
                return;
            }

            const editIndex = memberForm.getAttribute('data-edit-index');
            if (editIndex !== null) {
                const index = parseInt(editIndex);
                const isExist = members[projectId].some((m, i) => i !== index && m.name.toLowerCase() === memberName.toLowerCase());
                if (isExist) {
                    showNotification('Tên thành viên đã tồn tại!', 'error');
                    memberNameInput.classList.add('error');
                    return;
                }
                members[projectId][index] = { name: memberName, role: memberRole };
                showNotification('Cập nhật thành viên thành công!', 'success');
            } else {
                const isExist = members[projectId].some(m => m.name.toLowerCase() === memberName.toLowerCase());
                if (isExist) {
                    showNotification('Tên thành viên đã tồn tại!', 'error');
                    memberNameInput.classList.add('error');
                    return;
                }
                members[projectId].push({ name: memberName, role: memberRole });
                showNotification('Thêm thành viên thành công!', 'success');
            }

            localStorage.setItem('members', JSON.stringify(members));
            hideMemberModal();
            renderMembers();
            renderAssigneeOptions();
        });
    }

    const memberNameInput = memberForm?.querySelector('[name="member-name"]');
    const memberRoleInput = memberForm?.querySelector('[name="member-role"]');
    if (memberNameInput) memberNameInput.addEventListener('input', () => memberNameInput.classList.remove('error'));
    if (memberRoleInput) memberRoleInput.addEventListener('input', () => memberRoleInput.classList.remove('error'));

    // Khởi tạo
    renderTasks();
    renderMembers();
});