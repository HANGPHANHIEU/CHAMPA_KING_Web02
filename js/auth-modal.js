import { Storage } from './storage.js';
import { AuthService } from './auth-service.js';
import { showToast } from './toast.js';

export function initAuthModal(onAuthChange) {
    if (!document.getElementById('authModal')) {
        const div = document.createElement('div');
        div.id = 'authModalContainer';
        div.innerHTML = `
            <div id="authModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center z-50 p-4">
                <div class="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-slate-100 p-6 space-y-4 relative">
                    <button id="btnCloseAuthModal" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
                    
                    <div class="text-center space-y-1">
                        <div class="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center text-xl mx-auto mb-1">
                            <i class="fa-solid fa-user-gear"></i>
                        </div>
                        <h2 id="authTitle" class="text-lg font-bold text-slate-900">Đăng nhập tài khoản</h2>
                        <p id="authSubtitle" class="text-xs text-slate-500">Đăng nhập để nhận việc, đăng việc & quản lý bài</p>
                    </div>

                    <!-- FORM 1: ĐĂNG NHẬP -->
                    <form id="loginForm" class="space-y-3">
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại</label>
                            <input type="tel" id="loginPhoneInput" required placeholder="0901234567" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600">
                        </div>
                        <div>
                            <div class="flex justify-between items-center mb-1">
                                <label class="block text-xs font-semibold text-slate-700">Mật khẩu</label>
                                <a href="#" id="switchToForgot" class="text-[11px] text-teal-600 hover:underline">Quên mật khẩu?</a>
                            </div>
                            <div class="relative">
                                <input type="password" id="loginPasswordInput" required placeholder="••••••••" class="w-full px-3 py-2 pr-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600">
                                <button type="button" class="toggle-password-btn absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer" data-target="loginPasswordInput">
                                    <i class="fa-solid fa-eye text-sm"></i>
                                </button>
                            </div>
                        </div>
                        <button type="submit" class="w-full py-2.5 bg-[#0d9488] hover:bg-teal-700 text-white font-medium rounded-xl transition text-sm shadow-sm cursor-pointer">Đăng nhập</button>
                        <p class="text-xs text-center text-slate-500 pt-1">
                            Chưa có tài khoản? <a href="#" id="switchToRegister" class="text-teal-600 font-bold hover:underline">Đăng ký ngay</a>
                        </p>
                    </form>

                    <!-- FORM 2: ĐĂNG KÝ -->
                    <form id="registerForm" class="space-y-3 hidden">
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1">Họ và tên</label>
                            <input type="text" id="regNameInput" required placeholder="Nguyễn Văn A" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại</label>
                            <input type="tel" id="regPhoneInput" required placeholder="0901234567" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1">Mật khẩu mới</label>
                            <div class="relative">
                                <input type="password" id="regPasswordInput" required placeholder="••••••••" class="w-full px-3 py-2 pr-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600">
                                <button type="button" class="toggle-password-btn absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer" data-target="regPasswordInput">
                                    <i class="fa-solid fa-eye text-sm"></i>
                                </button>
                            </div>
                        </div>
                        <button type="submit" class="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition text-sm shadow-sm cursor-pointer">Tạo tài khoản mới</button>
                        <p class="text-xs text-center text-slate-500 pt-1">
                            Đã có tài khoản? <a href="#" id="switchToLoginFromReg" class="text-teal-600 font-bold hover:underline">Đăng nhập</a>
                        </p>
                    </form>

                    <!-- FORM 3: ĐỔI / QUÊN MẬT KHẨU -->
                    <form id="forgotForm" class="space-y-3 hidden">
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại tài khoản</label>
                            <input type="tel" id="forgotPhoneInput" required placeholder="0901234567" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1">Mật khẩu mới</label>
                            <div class="relative">
                                <input type="password" id="forgotNewPasswordInput" required placeholder="Nhập mật khẩu mới" class="w-full px-3 py-2 pr-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600">
                                <button type="button" class="toggle-password-btn absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer" data-target="forgotNewPasswordInput">
                                    <i class="fa-solid fa-eye text-sm"></i>
                                </button>
                            </div>
                        </div>
                        <button type="submit" class="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition text-sm shadow-sm cursor-pointer">Đặt lại mật khẩu</button>
                        <p class="text-xs text-center text-slate-500 pt-1">
                            Quay lại <a href="#" id="switchToLoginFromForgot" class="text-teal-600 font-bold hover:underline">Đăng nhập</a>
                        </p>
                    </form>
                </div>
            </div>`;
        document.body.appendChild(div);
    }

    const modal = document.getElementById('authModal');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const forgotForm = document.getElementById('forgotForm');
    const authTitle = document.getElementById('authTitle');
    const authSubtitle = document.getElementById('authSubtitle');

    // XỬ LÝ SỰ KIỆN NÚT MẮT THẦN (TOGGLE SHOW/HIDE PASSWORD)
    document.querySelectorAll('.toggle-password-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const icon = btn.querySelector('i');

            if (input && icon) {
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                    btn.classList.add('text-teal-600');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                    btn.classList.remove('text-teal-600');
                }
            }
        });
    });

    const showView = (view) => {
        loginForm?.classList.add('hidden');
        registerForm?.classList.add('hidden');
        forgotForm?.classList.add('hidden');

        if (view === 'login') {
            loginForm?.classList.remove('hidden');
            if (authTitle) authTitle.textContent = 'Đăng nhập tài khoản';
            if (authSubtitle) authSubtitle.textContent = 'Đăng nhập để nhận việc, đăng việc & quản lý bài';
        } else if (view === 'register') {
            registerForm?.classList.remove('hidden');
            if (authTitle) authTitle.textContent = 'Đăng ký tài khoản';
            if (authSubtitle) authSubtitle.textContent = 'Tạo tài khoản thành viên mới trong vài giây';
        } else if (view === 'forgot') {
            forgotForm?.classList.remove('hidden');
            if (authTitle) authTitle.textContent = 'Đặt lại mật khẩu';
            if (authSubtitle) authSubtitle.textContent = 'Nhập số điện thoại để cập nhật mật khẩu mới';
        }
    };

    document.getElementById('btnCloseAuthModal')?.addEventListener('click', () => modal?.classList.add('hidden'));

    // Chuyển view
    document.getElementById('switchToRegister')?.addEventListener('click', (e) => { e.preventDefault(); showView('register'); });
    document.getElementById('switchToForgot')?.addEventListener('click', (e) => { e.preventDefault(); showView('forgot'); });
    document.getElementById('switchToLoginFromReg')?.addEventListener('click', (e) => { e.preventDefault(); showView('login'); });
    document.getElementById('switchToLoginFromForgot')?.addEventListener('click', (e) => { e.preventDefault(); showView('login'); });

    // Xử lý Đăng nhập
    loginForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const phone = document.getElementById('loginPhoneInput').value.trim();
        const pass = document.getElementById('loginPasswordInput').value.trim();
        const user = AuthService.login(phone, pass);

        if (user) {
            Storage.setUser(user);
            modal?.classList.add('hidden');
            showToast(`Xin chào ${user.name}! Đăng nhập thành công.`);
            onAuthChange();
        } else {
            alert('Số điện thoại hoặc mật khẩu không đúng!');
        }
    });

    // Xử lý Đăng ký
    registerForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('regNameInput').value.trim();
        const phone = document.getElementById('regPhoneInput').value.trim();
        const pass = document.getElementById('regPasswordInput').value.trim();

        const res = AuthService.register(name, phone, pass);
        if (res.success) {
            Storage.setUser(res.user);
            modal?.classList.add('hidden');
            registerForm.reset();
            showToast('Tạo tài khoản thành công!');
            onAuthChange();
        } else {
            alert(res.message);
        }
    });

    // Xử lý Đổi / Quên Mật khẩu
    forgotForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const phone = document.getElementById('forgotPhoneInput').value.trim();
        const newPass = document.getElementById('forgotNewPasswordInput').value.trim();

        const res = AuthService.resetPassword(phone, newPass);
        if (res.success) {
            showToast(res.message);
            forgotForm.reset();
            showView('login');
            onAuthChange();
        } else {
            alert(res.message);
        }
    });

    // Nút tài khoản ở Header
    document.getElementById('btnLoginAccount')?.addEventListener('click', () => {
        const currentUser = Storage.getUser();
        if (currentUser) {
            if (confirm(`Tài khoản: ${currentUser.name} (${currentUser.phone})\n\nBạn có muốn đăng xuất không?`)) {
                Storage.setUser(null);
                showToast('Đã đăng xuất tài khoản.');
                onAuthChange();
            }
        } else {
            showView('login');
            modal?.classList.remove('hidden');
            modal?.classList.add('flex');
        }
    });
}