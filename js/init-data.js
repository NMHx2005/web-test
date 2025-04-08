// Khởi tạo dữ liệu mẫu cho projects
const initialProjects = [
    {
        id: 1,
        projectName: "Xây dựng website thương mại điện tử",
        description: "Dự án xây dựng website bán hàng trực tuyến với đầy đủ chức năng",
        members: [
            { userId: 1, name: "An Nguyễn", role: "Project owner" },
            { userId: 2, name: "Bách Nguyễn", role: "Frontend developer" }
        ]
    },
    {
        id: 2,
        projectName: "Phát triển ứng dụng di động",
        description: "Ứng dụng mobile cho hệ thống quản lý nhân sự",
        members: [
            { userId: 1, name: "An Nguyễn", role: "Project owner" },
            { userId: 2, name: "Bách Nguyễn", role: "Mobile developer" }
        ]
    },
    {
        id: 3,
        projectName: "Hệ thống quản lý kho",
        description: "Phần mềm quản lý kho hàng và theo dõi tồn kho",
        members: [
            { userId: 1, name: "An Nguyễn", role: "Project owner" },
            { userId: 2, name: "Bách Nguyễn", role: "Backend developer" }
        ]
    },
    {
        id: 4,
        projectName: "Nền tảng học trực tuyến",
        description: "Website đào tạo trực tuyến với tính năng tương tác cao",
        members: [
            { userId: 1, name: "An Nguyễn", role: "Project owner" },
            { userId: 2, name: "Bách Nguyễn", role: "Full-stack developer" }
        ]
    },
    {
        id: 5,
        projectName: "Ứng dụng thanh toán điện tử",
        description: "Hệ thống thanh toán trực tuyến an toàn và tiện lợi",
        members: [
            { userId: 1, name: "An Nguyễn", role: "Project owner" },
            { userId: 2, name: "Bách Nguyễn", role: "Security expert" }
        ]
    }
];

// Khởi tạo dữ liệu mẫu cho tasks theo projectId
const initialTasks = {
    "1": [
        {
            id: 1,
            name: "Soạn thảo đề cương dự án",
            assignee: "An Nguyễn",
            assignDate: "2024-03-24",
            dueDate: "2024-03-26",
            priority: "Cao",
            progress: "Đúng tiến độ",
            status: "To do"
        },
        {
            id: 2,
            name: "Thiết kế giao diện người dùng",
            assignee: "Bách Nguyễn",
            assignDate: "2024-03-24",
            dueDate: "2024-03-27",
            priority: "Trung Bình",
            progress: "Có rủi ro",
            status: "To do"
        }
    ],
    "2": [
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
    ],
    "3": [
        {
            id: 4,
            name: "Tối ưu hóa database",
            assignee: "An Nguyễn",
            assignDate: "2024-03-24",
            dueDate: "2024-03-28",
            priority: "Trung Bình",
            progress: "Có rủi ro",
            status: "In Progress"
        }
    ],
    "4": [
        {
            id: 5,
            name: "Chờ duyệt thiết kế",
            assignee: "Bách Nguyễn",
            assignDate: "2024-03-22",
            dueDate: "2024-03-25",
            priority: "Thấp",
            progress: "Trì hoãn",
            status: "Pending"
        }
    ],
    "5": [
        {
            id: 6,
            name: "Hoàn thành khảo sát yêu cầu",
            assignee: "An Nguyễn",
            assignDate: "2024-03-20",
            dueDate: "2024-03-23",
            priority: "Cao",
            progress: "Đúng tiến độ",
            status: "Done"
        }
    ]
};

// Lưu dữ liệu vào localStorage nếu chưa có
if (!localStorage.getItem('projects')) {
    localStorage.setItem('projects', JSON.stringify(initialProjects));
}

if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialTasks));
}