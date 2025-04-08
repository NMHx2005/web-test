// Khởi tạo tài khoản admin mặc định nếu chưa có
function initializeAuth() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.length === 0) {
        users.push({
            email: 'admin@gmail.com',
            password: '12345678',
            name: 'Admin',
            role: 'admin'
        });
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Kiểm tra trạng thái đăng nhập
function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = '../pages/login.html';
        return false;
    }
    return true;
}

// Xử lý đăng nhập
function login(email, password) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        return true;
    }
    return false;
}

// Xử lý đăng ký
function register(email, password, name) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Kiểm tra email đã tồn tại
    if (users.some(u => u.email === email)) {
        return false;
    }
    
    // Thêm user mới
    const newUser = {
        email,
        password,
        name,
        role: 'user'
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    return true;
}

// Xử lý đăng xuất
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = '../pages/login.html';
}

// Khởi tạo auth khi load trang
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
    
    // Chỉ check auth khi không phải ở trang login hoặc register
    const currentPage = window.location.pathname;
    if (!currentPage.includes('login.html') && !currentPage.includes('register.html')) {
        checkAuth();
    }
}); 