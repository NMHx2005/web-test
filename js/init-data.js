// Khởi tạo dữ liệu mẫu cho projects
const sampleProjects = [
    {
        id: 1,
        projectName: "Xây dựng website thương mại điện tử",
        description: "Dự án xây dựng website bán hàng trực tuyến với đầy đủ chức năng",
        members: [
            { userId: 1, name: "Admin", role: "Project owner" },
            { userId: 2, name: "An Nguyễn", role: "Developer" },
            { userId: 3, name: "Bách Nguyễn", role: "Developer" }
        ],
        tasks: [
            {
                id: 1,
                name: "Soạn thảo đề cương dự án",
                assignee: "Admin",
                assignDate: "2024-03-24",
                dueDate: "2024-03-26",
                priority: "Cao",
                progress: "Đúng tiến độ",
                status: "To do"
            },
            {
                id: 2,
                name: "Thiết kế giao diện người dùng",
                assignee: "An Nguyễn",
                assignDate: "2024-03-24",
                dueDate: "2024-03-27",
                priority: "Trung Bình",
                progress: "Có rủi ro",
                status: "To do"
            }
        ]
    },
    {
        id: 2,
        projectName: "Phát triển ứng dụng di động",
        description: "Ứng dụng mobile cho hệ thống quản lý nhân sự",
        members: [
            { userId: 1, name: "Admin", role: "Project owner" },
            { userId: 2, name: "An Nguyễn", role: "Developer" },
            { userId: 3, name: "Bách Nguyễn", role: "Developer" }
        ],
        tasks: [
            {
                id: 3,
                name: "Phát triển tính năng đăng nhập",
                assignee: "Bách Nguyễn",
                assignDate: "2024-03-23",
                dueDate: "2024-03-25",
                priority: "Cao",
                progress: "Đúng tiến độ",
                status: "In Progress"
            }
        ]
    },
    {
        id: 3,
        projectName: "Hệ thống quản lý kho",
        description: "Phần mềm quản lý kho hàng và theo dõi tồn kho",
        members: [
            { userId: 1, name: "Admin", role: "Project owner" },
            { userId: 2, name: "An Nguyễn", role: "Developer" },
            { userId: 3, name: "Bách Nguyễn", role: "Developer" }
        ],
        tasks: [
            {
                id: 4,
                name: "Tối ưu hóa database",
                assignee: "Admin",
                assignDate: "2024-03-24",
                dueDate: "2024-03-28",
                priority: "Trung Bình",
                progress: "Có rủi ro",
                status: "In Progress"
            }
        ]
    }
];

// Khởi tạo dữ liệu mẫu cho users nếu chưa có
function initializeUsers() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Thêm An Nguyễn nếu chưa tồn tại
    if (!users.some(u => u.id === 2)) {
        users.push({
            id: 2,
            email: 'an@gmail.com',
            password: '12345678',
            name: 'An Nguyễn',
            role: 'user'
        });
    }
    
    // Thêm Bách Nguyễn nếu chưa tồn tại
    if (!users.some(u => u.id === 3)) {
        users.push({
            id: 3,
            email: 'bach@gmail.com',
            password: '12345678',
            name: 'Bách Nguyễn',
            role: 'user'
        });
    }
    
    localStorage.setItem('users', JSON.stringify(users));
}

// Khởi tạo dữ liệu khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    initializeUsers();
    
    // Khởi tạo projects nếu chưa có
    if (!localStorage.getItem('projects')) {
        localStorage.setItem('projects', JSON.stringify(sampleProjects));
    }
});