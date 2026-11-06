export const AuthService = {
    // Lấy danh sách users từ localStorage
    getUsers() {
        return JSON.parse(localStorage.getItem('users_list')) || [];
    },

    // Lưu danh sách users
    saveUsers(users) {
        localStorage.setItem('users_list', JSON.stringify(users));
    },

    // Đăng ký tài khoản mới
    register(name, phone, password) {
        const users = this.getUsers();
        const existingUser = users.find(u => u.phone === phone);
        
        if (existingUser) {
            return { success: false, message: 'Số điện thoại này đã được đăng ký!' };
        }

        const newUser = {
            id: Date.now(),
            name,
            phone,
            password, // Có thể mã hóa SHA-256 nếu cần bảo mật cao
            role: 'worker',
            status: 'active',
            created_at: new Date().toISOString()
        };

        users.push(newUser);
        this.saveUsers(users);
        return { success: true, user: newUser };
    },

    // Đăng nhập
    login(phone, password) {
        const users = this.getUsers();
        const user = users.find(u => u.phone === phone && u.password === password);
        return user || null;
    },

    // Đổi / Quên mật khẩu
    resetPassword(phone, newPassword) {
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.phone === phone);

        if (userIndex === -1) {
            return { success: false, message: 'Không tìm thấy số điện thoại này trong hệ thống!' };
        }

        users[userIndex].password = newPassword;
        this.saveUsers(users);
        return { success: true, message: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.' };
    }
};