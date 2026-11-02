import { Storage } from './storage.js';

export const AuthService = {
    // 1. Đăng nhập
    login(phone, password) {
        const users = Storage.getUsers();
        return users.find(u => u.phone === phone && u.password === password) || null;
    },

    // 2. Đăng ký
    register(name, phone, password) {
        const users = Storage.getUsers();
        if (users.some(u => u.phone === phone)) {
            return { success: false, message: 'Số điện thoại này đã được đăng ký!' };
        }
        const newUser = { id: Date.now(), name, phone, password };
        users.push(newUser);
        Storage.saveUsers(users);
        return { success: true, user: newUser };
    },

    // 3. Quên / Đổi mật khẩu
    resetPassword(phone, newPassword) {
        const users = Storage.getUsers();
        const idx = users.findIndex(u => u.phone === phone);
        if (idx !== -1) {
            users[idx].password = newPassword;
            Storage.saveUsers(users);
            
            // Cập nhật lại phiên nếu đang đăng nhập tài khoản này
            const currentUser = Storage.getUser();
            if (currentUser && currentUser.phone === phone) {
                currentUser.password = newPassword;
                Storage.setUser(currentUser);
            }
            return { success: true, message: 'Đổi mật khẩu thành công!' };
        }
        return { success: false, message: 'Số điện thoại chưa được đăng ký trên hệ thống!' };
    }
};