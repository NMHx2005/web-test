// Khởi tạo dữ liệu mẫu nếu chưa có
if (!localStorage.getItem('projects')) {
    const initialProjects = [
        { id: 1, name: "Xây dựng website thương mại điện tử", startDate: "2024-02-24", endDate: "2024-02-27", status: "in-progress", progress: 75 },
        { id: 2, name: "Phát triển ứng dụng di động", startDate: "2024-03-01", endDate: "2024-05-01", status: "pending", progress: 0 },
        { id: 3, name: "Quản lý dữ liệu khách hàng", startDate: "2024-04-01", endDate: "2024-06-01", status: "completed", progress: 100 },
        { id: 4, name: "Tối ưu hóa SEO", startDate: "2024-05-01", endDate: "2024-07-01", status: "in-progress", progress: 50 },
        { id: 5, name: "Xây dựng hệ thống CRM", startDate: "2024-06-01", endDate: "2024-08-01", status: "pending", progress: 0 },
        { id: 6, name: "Phát triển API", startDate: "2024-07-01", endDate: "2024-09-01", status: "pending", progress: 0 }
    ];
    localStorage.setItem('projects', JSON.stringify(initialProjects));
}

// Tạo notification
const notification = document.createElement('div');
notification.className = 'notification';
notification.style.cssText = `
    position: fixed;
    top: 70px;
    right: 20px;
    padding: 15px 25px;
    border-radius: 4px;
    color: white;
    z-index: 1000;
    display: none;
`;
document.body.appendChild(notification);

function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    notification.style.backgroundColor = type === 'success' ? '#198754' : '#DC3545';
    setTimeout(() => notification.style.display = 'none', 2000);
}

// Các biến phân trang
const PROJECTS_PER_PAGE = 5;
let currentPage = 1;

// Hàm render dự án với phân trang
function renderProjects(projectsToRender = null, page = currentPage) {
    const projectTableBody = document.querySelector('.project-table tbody');
    const projects = projectsToRender || JSON.parse(localStorage.getItem('projects')) || [];
    const totalProjects = projects.length;
    const totalPages = Math.ceil(totalProjects / PROJECTS_PER_PAGE);

    // Giới hạn trang hiện tại
    currentPage = Math.max(1, Math.min(page, totalPages));

    // Lấy danh sách dự án cho trang hiện tại
    const startIndex = (currentPage - 1) * PROJECTS_PER_PAGE;
    const endIndex = startIndex + PROJECTS_PER_PAGE;
    const paginatedProjects = projects.slice(startIndex, endIndex);

    // Render bảng
    projectTableBody.innerHTML = paginatedProjects.map(project => `
        <tr>
            <td>${project.id}</td>
            <td>${project.name}</td>
            <td class="action-buttons">
                <button class="btn-edit" data-id="${project.id}">Sửa</button>
                <button class="btn-delete" data-id="${project.id}">Xóa</button>
                <button class="btn-detail" data-id="${project.id}">Chi tiết</button>
            </td>
        </tr>
    `).join('');

    // Gán sự kiện cho các nút
    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', () => editProject(parseInt(button.getAttribute('data-id'))));
    });
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', () => showDeleteModal(parseInt(button.getAttribute('data-id'))));
    });
    document.querySelectorAll('.btn-detail').forEach(button => {
        button.addEventListener('click', () => window.location.href = `project-detail.html?id=${button.getAttribute('data-id')}`);
    });

    // Render phân trang
    renderPagination(totalPages);
}

// Hàm render phân trang
function renderPagination(totalPages) {
    const pagination = document.querySelector('.pagination');
    if (!pagination) return;

    let paginationHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `<button class="${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    paginationHTML += `<button class="next">></button>`;

    pagination.innerHTML = paginationHTML;

    // Gán sự kiện cho các nút phân trang
    document.querySelectorAll('.pagination button:not(.next)').forEach(button => {
        button.addEventListener('click', () => {
            currentPage = parseInt(button.getAttribute('data-page'));
            renderProjects();
        });
    });

    // Gán sự kiện cho nút "Tiếp theo"
    const nextBtn = document.querySelector('.pagination .next');
    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderProjects();
        }
    });
}

// Hàm tìm kiếm dự án
function searchProjects(searchTerm) {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    return projects.filter(project => project.name.toLowerCase().includes(searchTerm.toLowerCase()));
}

// Hàm xóa dự án
function deleteProject(projectId) {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const updatedProjects = projects.filter(p => p.id !== projectId);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    renderProjects(); // Render lại với trang hiện tại
    showNotification('Xóa dự án thành công!', 'success');
}

// Lấy overlay
const overlay = document.querySelector('#overlay');

// Hàm sửa dự án
function editProject(projectId) {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const project = projects.find(p => p.id === projectId);
    const modal = document.querySelector('.modal');
    const form = modal.querySelector('form');
    const title = modal.querySelector('.modal-header h2');
    const overlay = document.querySelector('#overlay'); // Lấy overlay

    if (project) {
        title.textContent = 'Sửa dự án';
        form.querySelector('[name="project-name"]').value = project.name;
        form.querySelector('[name="project-description"]').value = project.description || '';
        modal.style.display = 'block';
        overlay.classList.add('active'); // Hiển thị overlay khi mở modal

        // Xử lý sự kiện submit
        form.onsubmit = (e) => {
            e.preventDefault();
            const newName = form.querySelector('[name="project-name"]').value.trim();
            const newDescription = form.querySelector('[name="project-description"]').value.trim();

            if (projects.some(p => p.id !== projectId && p.name.toLowerCase() === newName.toLowerCase())) {
                showNotification('Tên dự án đã tồn tại!', 'error');
                return;
            }

            project.name = newName;
            project.description = newDescription;
            localStorage.setItem('projects', JSON.stringify(projects));
            modal.style.display = 'none';
            overlay.classList.remove('active'); // Ẩn overlay khi lưu
            renderProjects();
            showNotification('Sửa dự án thành công!', 'success');
            form.onsubmit = null; // Reset sự kiện
        };

        // Xử lý nút đóng và hủy để ẩn overlay
        const closeBtn = modal.querySelector('.close');
        const cancelBtn = modal.querySelector('.cancel');

        closeBtn.onclick = () => {
            modal.style.display = 'none';
            overlay.classList.remove('active'); // Ẩn overlay khi đóng
        };

        cancelBtn.onclick = () => {
            modal.style.display = 'none';
            overlay.classList.remove('active'); // Ẩn overlay khi hủy
        };
    }
}

// Modal thêm dự án
const createModal = document.querySelector('.modal');
const addProjectBtn = document.querySelector('.add-project-btn');
const closeCreateBtn = createModal.querySelector('.close');
const cancelCreateBtn = createModal.querySelector('.cancel');
const createForm = createModal.querySelector('form');

addProjectBtn.addEventListener('click', () => {
    createModal.querySelector('.modal-header h2').textContent = 'Thêm dự án';
    createForm.reset();
    createModal.style.display = 'block';
    overlay.classList.add('active'); // Hiển thị overlay
});

closeCreateBtn.addEventListener('click', () => {
    createModal.style.display = 'none';
    overlay.classList.remove('active'); // Ẩn overlay
});

cancelCreateBtn.addEventListener('click', () => {
    createModal.style.display = 'none';
    overlay.classList.remove('active'); // Ẩn overlay
});

createForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const projectName = createForm.querySelector('[name="project-name"]').value.trim();
    const projectDescription = createForm.querySelector('[name="project-description"]').value.trim();

    if (projects.some(p => p.name.toLowerCase() === projectName.toLowerCase())) {
        showNotification('Tên dự án đã tồn tại!', 'error');
        return;
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 2);
    const formatDate = date => date.toISOString().split('T')[0];

    const newProject = {
        id: projects.length ? Math.max(...projects.map(p => p.id)) + 1 : 1,
        name: projectName,
        description: projectDescription,
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        status: 'pending',
        progress: 0
    };

    projects.push(newProject);
    localStorage.setItem('projects', JSON.stringify(projects));
    createModal.style.display = 'none';
    overlay.classList.remove('active'); // Ẩn overlay
    renderProjects();
    showNotification('Thêm dự án thành công!', 'success');
});

// Modal xóa dự án
const deleteModal = document.querySelector('.model__delete');
const closeDeleteBtn = deleteModal.querySelector('.close');
const cancelDeleteBtn = deleteModal.querySelector('.cancel-btn');
const confirmDeleteBtn = deleteModal.querySelector('.delete-btn');
let currentProjectId = null;

function showDeleteModal(projectId) {
    currentProjectId = projectId;
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const project = projects.find(p => p.id === projectId);
    if (project) {
        deleteModal.querySelector('.model__delete-body').textContent = `Bạn chắc chắn muốn xóa dự án "${project.name}"?`;
        deleteModal.style.display = 'block';
        overlay.classList.add('active'); // Hiển thị overlay
    }
}

closeDeleteBtn.addEventListener('click', () => {
    deleteModal.style.display = 'none';
    overlay.classList.remove('active'); // Ẩn overlay
});

cancelDeleteBtn.addEventListener('click', () => {
    deleteModal.style.display = 'none';
    overlay.classList.remove('active'); // Ẩn overlay
});

confirmDeleteBtn.addEventListener('click', () => {
    if (currentProjectId) {
        deleteProject(currentProjectId);
        deleteModal.style.display = 'none';
        overlay.classList.remove('active'); // Ẩn overlay
    }
});

// Tìm kiếm (giữ nguyên)
const searchInput = document.querySelector('.search-box input');
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const searchTerm = searchInput.value.trim();
        currentPage = 1; // Reset về trang 1 khi tìm kiếm
        renderProjects(searchTerm ? searchProjects(searchTerm) : null);
    }
});
// Khởi tạo
document.addEventListener('DOMContentLoaded', () => renderProjects());