document.addEventListener('DOMContentLoaded', () => {

    // --- ⚙️ CẤU HÌNH THÔNG SỐ KẾT NỐI SUPABASE CỦA BẠN ---
    const SUPABASE_URL = 'https://rznzypehvmwysxmjxxxp.supabase.co'; 
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6bnp5cGVodm13eXN4bWp4eHhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzNTkxNTYsImV4cCI6MjEwODkzNTE1Nn0.B-5onxhT0EoqgtJ0ZP-ZbGSz4Gmo7xuRPEcsAYz65wA';

    const headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    };

    // --- 1. QUẢN LÝ TÀI KHOẢN & PHIÊN ĐĂNG NHẬP (AUTH) ---
    window.getCurrentUser = function() {
        try {
            const user = localStorage.getItem('current_logged_user');
            return user ? JSON.parse(user) : null;
        } catch (e) {
            return null;
        }
    };

    window.setCurrentUser = function(user) {
        if (user) {
            localStorage.setItem('current_logged_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('current_logged_user');
        }
        updateAuthButtonUI();
        renderJobs();
        renderAcceptedJobs();
    };

    // Tự động tạo Modal Đăng nhập / Đăng ký / Quên mật khẩu
    if (!document.getElementById('authModal')) {
        const authContainer = document.createElement('div');
        authContainer.id = 'authModalContainer';
        authContainer.innerHTML = `
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

                    <!-- 1. Form Đăng Nhập -->
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
                            <input type="password" id="loginPasswordInput" required placeholder="••••••••" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600">
                        </div>
                        <button type="submit" class="w-full py-2.5 bg-[#0d9488] hover:bg-teal-700 text-white font-medium rounded-xl transition text-sm shadow-sm">
                            Đăng nhập
                        </button>
                        <p class="text-xs text-center text-slate-500 pt-1">
                            Chưa có tài khoản? <a href="#" id="switchToRegister" class="text-teal-600 font-bold hover:underline">Đăng ký ngay</a>
                        </p>
                    </form>

                    <!-- 2. Form Đăng Ký -->
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
                            <input type="password" id="regPasswordInput" required placeholder="••••••••" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600">
                        </div>
                        <button type="submit" class="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition text-sm shadow-sm">
                            Tạo tài khoản mới
                        </button>
                        <p class="text-xs text-center text-slate-500 pt-1">
                            Đã có tài khoản? <a href="#" id="switchToLoginFromReg" class="text-teal-600 font-bold hover:underline">Đăng nhập</a>
                        </p>
                    </form>

                    <!-- 3. Form Quên / Đổi Mật Khẩu -->
                    <form id="forgotForm" class="space-y-3 hidden">
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại đăng ký</label>
                            <input type="tel" id="forgotPhoneInput" required placeholder="0901234567" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1">Mật khẩu mới</label>
                            <input type="password" id="forgotNewPasswordInput" required placeholder="Nhập mật khẩu mới" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600">
                        </div>
                        <button type="submit" class="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition text-sm shadow-sm">
                            Đặt lại mật khẩu
                        </button>
                        <p class="text-xs text-center text-slate-500 pt-1">
                            Nhớ mật khẩu? <a href="#" id="switchToLoginFromForgot" class="text-teal-600 font-bold hover:underline">Quay lại Đăng nhập</a>
                        </p>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(authContainer);
    }

    function updateAuthButtonUI() {
        const btnLoginAccount = document.getElementById('btnLoginAccount');
        const loginBtnText = document.getElementById('loginBtnText');
        const currentUser = getCurrentUser();

        if (btnLoginAccount && loginBtnText) {
            if (currentUser) {
                loginBtnText.textContent = currentUser.name ? currentUser.name.split(' ').pop() : 'Tài khoản';
                btnLoginAccount.title = `Đang đăng nhập: ${currentUser.name}\nBấm để đăng xuất`;
                btnLoginAccount.className = "bg-teal-50 text-teal-700 border border-teal-200 font-medium px-3 py-2 rounded-xl text-xs flex items-center transition shadow-sm";
            } else {
                loginBtnText.textContent = "Đăng nhập";
                btnLoginAccount.title = "Đăng nhập tài khoản";
                btnLoginAccount.className = "bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-2 rounded-xl text-xs flex items-center transition shadow-sm";
            }
        }
    }

    const btnLoginAccount = document.getElementById('btnLoginAccount');
    const authModal = document.getElementById('authModal');
    const btnCloseAuthModal = document.getElementById('btnCloseAuthModal');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const forgotForm = document.getElementById('forgotForm');
    const authTitle = document.getElementById('authTitle');
    const authSubtitle = document.getElementById('authSubtitle');

    const switchToRegister = document.getElementById('switchToRegister');
    const switchToForgot = document.getElementById('switchToForgot');
    const switchToLoginFromReg = document.getElementById('switchToLoginFromReg');
    const switchToLoginFromForgot = document.getElementById('switchToLoginFromForgot');

    if (btnLoginAccount) {
        btnLoginAccount.addEventListener('click', (e) => {
            e.preventDefault();
            const currentUser = getCurrentUser();
            if (currentUser) {
                if (confirm(`Tài khoản: ${currentUser.name} (${currentUser.phone})\n\nBạn có muốn đăng xuất không?`)) {
                    setCurrentUser(null);
                    showToast('Đã đăng xuất tài khoản thành công.');
                }
            } else {
                showLoginForm();
                authModal?.classList.remove('hidden');
                authModal?.classList.add('flex');
            }
        });
    }

    btnCloseAuthModal?.addEventListener('click', () => {
        authModal?.classList.add('hidden');
        authModal?.classList.remove('flex');
    });

    // Hàm chuyển đổi giữa các Form
    function showLoginForm() {
        loginForm?.classList.remove('hidden');
        registerForm?.classList.add('hidden');
        forgotForm?.classList.add('hidden');
        if (authTitle) authTitle.textContent = 'Đăng nhập tài khoản';
        if (authSubtitle) authSubtitle.textContent = 'Đăng nhập để nhận việc, đăng việc & quản lý bài';
    }

    function showRegisterForm() {
        loginForm?.classList.add('hidden');
        registerForm?.classList.remove('hidden');
        forgotForm?.classList.add('hidden');
        if (authTitle) authTitle.textContent = 'Đăng ký tài khoản mới';
        if (authSubtitle) authSubtitle.textContent = 'Tạo tài khoản nhanh để sử dụng dịch vụ';
    }

    function showForgotForm() {
        loginForm?.classList.add('hidden');
        registerForm?.classList.add('hidden');
        forgotForm?.classList.remove('hidden');
        if (authTitle) authTitle.textContent = 'Khôi phục mật khẩu';
        if (authSubtitle) authSubtitle.textContent = 'Nhập SĐT để thiết lập mật khẩu mới';
    }

    switchToRegister?.addEventListener('click', (e) => { e.preventDefault(); showRegisterForm(); });
    switchToForgot?.addEventListener('click', (e) => { e.preventDefault(); showForgotForm(); });
    switchToLoginFromReg?.addEventListener('click', (e) => { e.preventDefault(); showLoginForm(); });
    switchToLoginFromForgot?.addEventListener('click', (e) => { e.preventDefault(); showLoginForm(); });

    // Xử lý Đăng Nhập
    loginForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const phone = document.getElementById('loginPhoneInput').value.trim();
        const pass = document.getElementById('loginPasswordInput').value.trim();

        const users = JSON.parse(localStorage.getItem('app_registered_users') || '[]');
        const found = users.find(u => u.phone === phone && u.password === pass);

        if (found) {
            setCurrentUser(found);
            authModal?.classList.add('hidden');
            authModal?.classList.remove('flex');
            loginForm.reset();
            showToast(`Xin chào ${found.name}! Đăng nhập thành công.`);
        } else {
            alert('Số điện thoại hoặc mật khẩu không chính xác!');
        }
    });

    // Xử lý Đăng Ký
    registerForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('regNameInput').value.trim();
        const phone = document.getElementById('regPhoneInput').value.trim();
        const password = document.getElementById('regPasswordInput').value.trim();

        const users = JSON.parse(localStorage.getItem('app_registered_users') || '[]');
        if (users.some(u => u.phone === phone)) {
            alert('Số điện thoại này đã được đăng ký thành viên!');
            return;
        }

        const newUser = { id: Date.now(), name, phone, password };
        users.push(newUser);
        localStorage.setItem('app_registered_users', JSON.stringify(users));

        setCurrentUser(newUser);
        authModal?.classList.add('hidden');
        authModal?.classList.remove('flex');
        registerForm.reset();
        showToast('Đăng ký tài khoản thành công!');
    });

    // Xử lý Quên / Đặt lại mật khẩu
    forgotForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const phone = document.getElementById('forgotPhoneInput').value.trim();
        const newPassword = document.getElementById('forgotNewPasswordInput').value.trim();

        const users = JSON.parse(localStorage.getItem('app_registered_users') || '[]');
        const userIndex = users.findIndex(u => u.phone === phone);

        if (userIndex !== -1) {
            // Cập nhật mật khẩu mới cho tài khoản
            users[userIndex].password = newPassword;
            localStorage.setItem('app_registered_users', JSON.stringify(users));

            alert(`Đặt lại mật khẩu thành công cho tài khoản ${users[userIndex].name}!\nVui lòng đăng nhập lại bằng mật khẩu mới.`);
            forgotForm.reset();
            showLoginForm();
        } else {
            alert('Số điện thoại này chưa được đăng ký thành viên trên hệ thống!');
        }
    });


    // --- 2. HỆ THỐNG ĐIỀU HƯỚNG TAB ---
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    function switchTab(targetTabId) {
        tabContents.forEach(tab => {
            if (tab.id === targetTabId) {
                tab.classList.remove('hidden');
            } else {
                tab.classList.add('hidden');
            }
        });

        navButtons.forEach(btn => {
            const btnTab = btn.getAttribute('data-tab');
            if (btnTab === targetTabId) {
                btn.classList.add('text-[#0d9488]');
                btn.classList.remove('text-slate-400');
            } else {
                btn.classList.remove('text-[#0d9488]');
                btn.classList.add('text-slate-400');
            }
        });

        if (targetTabId === 'tabAcceptedJob') renderAcceptedJobs();
        if (targetTabId === 'tabOrganization') renderOrganizations();
    }

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            if (tabId) switchTab(tabId);
        });
    });


    // --- 3. QUẢN LÝ HỒ SƠ CÁ NHÂN & TỔ CHỨC ---
    const workerModal = document.getElementById('workerModal');
    const btnRegisterWorker = document.getElementById('btnRegisterWorker');
    const btnCloseWorkerModal = document.getElementById('btnCloseWorkerModal');
    const btnCancelWorkerModal = document.getElementById('btnCancelWorkerModal');
    const workerForm = document.getElementById('workerForm');

    function getWorkers() {
        try {
            const saved = localStorage.getItem('workers_list');
            return saved ? JSON.parse(saved) : [
                { id: 1, name: 'Trần Văn Bình', phone: '0988123456', location: 'Châu Thành', skill: 'Giao hàng hỏa tốc, Tài xế công nghệ', status: 'approved' }
            ];
        } catch (e) { return []; }
    }

    function saveWorker(newWorker) {
        const workers = getWorkers();
        workers.unshift(newWorker);
        localStorage.setItem('workers_list', JSON.stringify(workers));
    }

    if (btnRegisterWorker) {
        btnRegisterWorker.addEventListener('click', () => {
            const currentUser = getCurrentUser();
            if (!currentUser) {
                showToast('Vui lòng đăng ký hoặc đăng nhập tài khoản trước!', 'error');
                showLoginForm();
                authModal?.classList.remove('hidden');
                authModal?.classList.add('flex');
                return;
            }

            const nameInput = document.getElementById('workerNameInput');
            const phoneInput = document.getElementById('workerPhoneInput');
            if (nameInput) nameInput.value = currentUser.name || '';
            if (phoneInput) phoneInput.value = currentUser.phone || '';

            workerModal?.classList.remove('hidden');
            workerModal?.classList.add('flex');
        });
    }

    function closeWorkerModal() {
        workerModal?.classList.add('hidden');
        workerModal?.classList.remove('flex');
    }

    btnCloseWorkerModal?.addEventListener('click', closeWorkerModal);
    btnCancelWorkerModal?.addEventListener('click', closeWorkerModal);

    workerForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const newWorker = {
            id: Date.now(),
            name: document.getElementById('workerNameInput').value.trim(),
            phone: document.getElementById('workerPhoneInput').value.trim(),
            location: document.getElementById('workerLocationInput').value,
            skill: document.getElementById('workerSkillInput').value.trim(),
            status: 'approved'
        };

        if (!newWorker.name || !newWorker.phone || !newWorker.skill) {
            showToast('Vui lòng điền đầy đủ thông tin!', 'error');
            return;
        }

        saveWorker(newWorker);
        closeWorkerModal();
        workerForm.reset();
        showToast('Đăng ký hồ sơ cá nhân thành công!');
        renderOrganizations();
    });

    // Tổ chức / Đối tác
    const orgModal = document.getElementById('orgModal');
    const btnJoinOrg = document.getElementById('btnJoinOrg');
    const btnCloseOrgModal = document.getElementById('btnCloseOrgModal');
    const btnCancelOrgModal = document.getElementById('btnCancelOrgModal');
    const orgForm = document.getElementById('orgForm');

    async function fetchOrgsFromCloud() {
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/organizations?select=*&order=id.desc`, { headers });
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        } catch (e) { return []; }
    }

    async function saveOrgToCloud(newOrg) {
        try {
            await fetch(`${SUPABASE_URL}/rest/v1/organizations`, {
                method: 'POST',
                headers,
                body: JSON.stringify(newOrg)
            });
        } catch (e) { alert('Lỗi lưu tổ chức lên đám mây.'); }
    }

    if (btnJoinOrg) {
        btnJoinOrg.addEventListener('click', () => {
            const currentUser = getCurrentUser();
            if (!currentUser) {
                showToast('Vui lòng đăng ký hoặc đăng nhập tài khoản trước!', 'error');
                showLoginForm();
                authModal?.classList.remove('hidden');
                authModal?.classList.add('flex');
                return;
            }

            const phoneInput = document.getElementById('orgPhoneInput');
            if (phoneInput) phoneInput.value = currentUser.phone || '';

            orgModal?.classList.remove('hidden');
            orgModal?.classList.add('flex');
        });
    }

    function closeOrgModal() {
        orgModal?.classList.add('hidden');
        orgModal?.classList.remove('flex');
    }

    btnCloseOrgModal?.addEventListener('click', closeOrgModal);
    btnCancelOrgModal?.addEventListener('click', closeOrgModal);

    orgForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newOrg = {
            name: document.getElementById('orgNameInput').value.trim(),
            phone: document.getElementById('orgPhoneInput').value.trim(),
            province: document.getElementById('orgProvinceInput').value,
            district: document.getElementById('orgDistrictInput').value.trim(),
            ward: document.getElementById('orgWardInput')?.value.trim() || '',
            address: document.getElementById('orgAddressInput').value.trim(),
            strength: document.getElementById('orgStrengthInput').value.trim(),
            status: 'approved'
        };

        if (!newOrg.name || !newOrg.phone || !newOrg.district || !newOrg.address || !newOrg.strength) {
            showToast('Vui lòng điền đầy đủ thông tin tổ chức!', 'error');
            return;
        }

        await saveOrgToCloud(newOrg);
        closeOrgModal();
        orgForm.reset();
        showToast('Ghi danh tổ chức thành công lên hệ thống chung!');
        renderOrganizations();
    });

    window.renderOrganizations = async function() {
        const orgListContainer = document.getElementById('orgList');
        if (!orgListContainer) return;

        const selectedDistrict = document.getElementById('filterOrgDistrict')?.value || '';
        const cloudOrgs = await fetchOrgsFromCloud();
        
        const orgs = Array.isArray(cloudOrgs) ? cloudOrgs.filter(o => {
            const matchStatus = o.status === 'approved';
            const matchDist = !selectedDistrict || (o.district && o.district.toLowerCase().includes(selectedDistrict.toLowerCase()));
            return matchStatus && matchDist;
        }) : [];

        const workers = getWorkers().filter(w => {
            const matchStatus = w.status === 'approved';
            const matchDist = !selectedDistrict || (w.location && w.location.toLowerCase().includes(selectedDistrict.toLowerCase()));
            return matchStatus && matchDist;
        });

        orgListContainer.innerHTML = '';

        if (orgs.length === 0 && workers.length === 0) {
            orgListContainer.innerHTML = `
                <div class="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p class="text-slate-400 text-sm">Chưa có tổ chức hoặc cá nhân nào tại khu vực này.</p>
                </div>`;
            return;
        }

        orgs.forEach(org => {
            const card = document.createElement('div');
            card.className = "p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-2";
            card.innerHTML = `
                <div class="flex justify-between items-start">
                    <div>
                        <span class="px-2 py-0.5 text-[10px] bg-blue-100 text-blue-700 font-bold rounded-md">
                            ${org.ward ? `${org.ward}, ` : ''}${org.district || ''} - ${org.province || 'An Giang'}
                        </span>
                        <h3 class="font-bold text-slate-800 text-base mt-1">${org.name}</h3>
                    </div>
                    <a href="tel:${org.phone}" class="px-3 py-1.5 bg-teal-600 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"><i class="fa-solid fa-phone"></i> Gọi ngay</a>
                </div>
                <p class="text-xs text-slate-500">📍 Địa chỉ: ${org.address}</p>
                <p class="text-xs text-slate-700 font-medium">⚡ Thế mạnh: ${org.strength}</p>
            `;
            orgListContainer.appendChild(card);
        });

        workers.forEach(w => {
            const card = document.createElement('div');
            card.className = "p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-2";
            card.innerHTML = `
                <div class="flex justify-between items-start">
                    <div>
                        <span class="px-2 py-0.5 text-[10px] bg-amber-100 text-amber-700 font-bold rounded-md">CÁ NHÂN ĐỐI TÁC</span>
                        <h3 class="font-bold text-slate-800 text-base mt-1">${w.name}</h3>
                    </div>
                    <a href="tel:${w.phone}" class="px-3 py-1.5 bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"><i class="fa-solid fa-phone"></i> Liên hệ</a>
                </div>
                <p class="text-xs text-slate-500">📍 Khu vực: ${w.location}</p>
                <p class="text-xs text-slate-700 font-medium">🛠️ Sở trường: ${w.skill}</p>
            `;
            orgListContainer.appendChild(card);
        });
    }

    const filterOrgDistrict = document.getElementById('filterOrgDistrict');
    if (filterOrgDistrict) {
        filterOrgDistrict.addEventListener('change', renderOrganizations);
    }


    // --- 4. QUẢN LÝ VIỆC LÀM & NHẬN VIỆC (CLOUD) ---
    async function fetchJobsFromCloud() {
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/jobs?select=*&order=id.desc`, { headers });
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        } catch (e) { return []; }
    }

    function getAcceptedJobs() {
        try {
            return JSON.parse(localStorage.getItem('accepted_jobs_list') || '[]');
        } catch (e) { return []; }
    }

    window.updateJobState = function(jobId, action, value = null) {
        const accepted = getAcceptedJobs();
        const target = accepted.find(j => j.id === jobId);
        if (target) {
            if (action === 'checkin') {
                target.checkedIn = true;
                showToast('Chấm công thành công!', 'success');
            } else if (action === 'rate') {
                target.rating = value;
                showToast(`Đã đánh giá ${value} sao!`, 'success');
            }
            localStorage.setItem('accepted_jobs_list', JSON.stringify(accepted));
            renderAcceptedJobs();
        }
    };

    window.renderAcceptedJobs = function() {
        const acceptedContainer = document.getElementById('acceptedJobList');
        if (!acceptedContainer) return;

        const currentUser = getCurrentUser();
        const acceptedList = getAcceptedJobs();

        const myAccepted = currentUser 
            ? acceptedList.filter(j => j.acceptedBy && j.acceptedBy.phone === currentUser.phone)
            : [];

        acceptedContainer.innerHTML = '';

        if (!currentUser) {
            acceptedContainer.innerHTML = `
                <div class="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
                    <p class="text-slate-500 text-sm font-medium">Bạn chưa đăng nhập!</p>
                    <button onclick="document.getElementById('btnLoginAccount').click()" class="px-4 py-2 bg-teal-600 text-white font-bold rounded-xl text-xs">Đăng nhập ngay</button>
                </div>`;
            return;
        }

        if (myAccepted.length === 0) {
            acceptedContainer.innerHTML = `
                <div class="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <i class="fa-solid fa-briefcase text-3xl text-slate-300 mb-2"></i>
                    <p class="text-slate-400 text-sm">Bạn chưa nhận công việc nào.</p>
                </div>`;
            return;
        }

        myAccepted.forEach(job => {
            const card = document.createElement('div');
            card.className = "p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-3";
            card.innerHTML = `
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-bold text-slate-800 text-base">${job.title}</h3>
                        <p class="text-xs text-slate-500 mt-0.5">📍 ${job.location} &bull; 💰 ${job.salary}</p>
                    </div>
                    <span class="px-2.5 py-1 text-[10px] bg-emerald-100 text-emerald-700 font-bold rounded-full">Đã nhận</span>
                </div>
                <div class="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl space-y-1">
                    <p><strong>Người đăng việc:</strong> ${job.created_by_name || 'Thành viên'} (${job.phone})</p>
                    <p><strong>Thời gian nhận:</strong> ${job.acceptedBy?.time || 'Vừa xong'}</p>
                </div>
                <div class="flex gap-2 pt-1">
                    <button onclick="window.updateJobState(${job.id}, 'checkin')" class="flex-1 py-2 ${job.checkedIn ? 'bg-slate-100 text-slate-400 cursor-default' : 'bg-teal-600 hover:bg-teal-700 text-white'} rounded-xl text-xs font-bold transition">
                        ${job.checkedIn ? '<i class="fa-solid fa-circle-check"></i> Đã chấm công' : 'Chấm công hoàn thành'}
                    </button>
                    <button onclick="let r=prompt('Đánh giá công việc (1-5 sao):', '5'); if(r) window.updateJobState(${job.id}, 'rate', r)" class="px-3 py-2 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-xl text-xs font-bold transition">
                        ⭐ ${job.rating ? job.rating + ' Sao' : 'Đánh giá'}
                    </button>
                </div>
            `;
            acceptedContainer.appendChild(card);
        });
    }

    function showToast(message, type = 'success') {
        const existing = document.getElementById('appToast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.id = 'appToast';
        toast.className = `fixed top-5 right-5 z-50 px-4 py-3 rounded-xl text-xs font-bold text-white shadow-xl flex items-center gap-2 ${type === 'success' ? 'bg-teal-600' : 'bg-red-600'}`;
        toast.innerHTML = `<i class="fa-solid fa-circle-check text-sm"></i> ${message}`;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // --- 5. GIAO DIỆN & RENDER CHÍNH ---
    const searchInput = document.getElementById('searchInput');
    const locationSelect = document.getElementById('locationSelect');
    const urgentCheck = document.getElementById('urgentCheck');
    const jobListContainer = document.getElementById('jobList');
    const jobCountSpan = document.getElementById('jobCount');
    const categoryBtns = document.querySelectorAll('.category-btn');
    let currentCategory = 'all';

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => {
                b.classList.remove('bg-slate-900', 'text-white');
                b.classList.add('bg-slate-100', 'text-slate-600');
            });
            btn.classList.remove('bg-slate-100', 'text-slate-600');
            btn.classList.add('bg-slate-900', 'text-white');
            currentCategory = btn.getAttribute('data-category');
            renderJobs();
        });
    });

    window.renderJobs = async function() {
        if (!jobListContainer) return;
        const jobsList = await fetchJobsFromCloud();
        const acceptedList = getAcceptedJobs();
        const currentUser = getCurrentUser();

        const keyword = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const selectedLocation = locationSelect ? locationSelect.value : '';
        const isUrgentOnly = urgentCheck ? urgentCheck.checked : false;

        const filtered = jobsList.filter(job => {
            const matchesKw = job.title?.toLowerCase().includes(keyword) || job.location?.toLowerCase().includes(keyword);
            const matchesLoc = !selectedLocation || job.location === selectedLocation;
            const matchesCat = currentCategory === 'all' || job.category === currentCategory;
            const matchesUrg = !isUrgentOnly || job.is_urgent === true;
            return matchesKw && matchesLoc && matchesCat && matchesUrg;
        });

        if (jobCountSpan) jobCountSpan.textContent = `${filtered.length} việc phù hợp trên hệ thống chung`;
        jobListContainer.innerHTML = '';

        if (filtered.length === 0) {
            jobListContainer.innerHTML = `<div class="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200"><p class="text-slate-400 text-sm">Không tìm thấy công việc phù hợp trên hệ thống.</p></div>`;
            return;
        }

        filtered.forEach(job => {
            const isAccepted = acceptedList.some(item => item.id === job.id);
            const isMyJob = currentUser && currentUser.phone === job.phone;

            const card = document.createElement('div');
            card.className = `p-4 bg-white rounded-2xl border ${isMyJob ? 'border-teal-300 bg-teal-50/20' : 'border-slate-100'} shadow-sm flex justify-between items-center`;
            card.innerHTML = `
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <h3 class="font-bold text-slate-800 text-sm md:text-base">${job.title}</h3>
                        ${job.is_urgent ? '<span class="px-2 py-0.5 text-[10px] bg-red-100 text-red-600 font-bold rounded-md">GẤP</span>' : ''}
                        ${isMyJob ? '<span class="px-2 py-0.5 text-[10px] bg-teal-100 text-teal-700 font-bold rounded-md">CỦA BẠN</span>' : ''}
                    </div>
                    <p class="text-xs text-slate-500 font-medium">📍 ${job.location} &bull; 💰 ${job.salary}</p>
                    <p class="text-xs text-teal-700 font-semibold">👤 Đăng bởi: ${job.created_by_name || 'Thành viên'} (${job.phone})</p>
                </div>
                <div class="flex items-center gap-2">
                    <button data-id="${job.id}" class="btn-accept px-3 py-1.5 text-xs font-semibold rounded-xl transition ${isAccepted ? 'bg-emerald-100 text-emerald-700 cursor-default' : 'bg-slate-900 hover:bg-slate-800 text-white'}">
                        ${isAccepted ? 'Đã nhận' : 'Nhận việc'}
                    </button>
                </div>
            `;
            jobListContainer.appendChild(card);
        });

        document.querySelectorAll('.btn-accept').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = Number(e.currentTarget.getAttribute('data-id'));
                const target = filtered.find(j => j.id === id);

                if (!currentUser) {
                    showToast('Vui lòng đăng nhập để nhận việc!', 'error');
                    showLoginForm();
                    authModal?.classList.remove('hidden');
                    authModal?.classList.add('flex');
                    return;
                }

                const accepted = getAcceptedJobs();
                if (target && !accepted.some(j => j.id === id)) {
                    accepted.unshift({ 
                        ...target, 
                        checkedIn: false, 
                        rating: null,
                        acceptedBy: { 
                            name: currentUser.name, 
                            phone: currentUser.phone, 
                            time: new Date().toLocaleString('vi-VN') 
                        }
                    });
                    localStorage.setItem('accepted_jobs_list', JSON.stringify(accepted));
                    showToast('Nhận việc thành công!');
                    renderJobs();
                    renderAcceptedJobs();
                }
            });
        });
    }

    searchInput?.addEventListener('input', renderJobs);
    locationSelect?.addEventListener('change', renderJobs);
    urgentCheck?.addEventListener('change', renderJobs);


    // --- 6. XỬ LÝ MODAL ĐĂNG VIỆC & KHỎI TẠO TỰ ĐỘNG ---
    if (!document.getElementById('postJobModal')) {
        const postJobModalContainer = document.createElement('div');
        postJobModalContainer.id = 'postJobModalContainer';
        postJobModalContainer.innerHTML = `
            <div id="postJobModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center z-50 p-4">
                <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-6 space-y-4 relative">
                    <button type="button" id="btnClosePostJobModal" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
                    
                    <div class="text-center space-y-1">
                        <h2 class="text-lg font-bold text-slate-900">Đăng việc mới</h2>
                        <p class="text-xs text-slate-500">Mỗi tài khoản được đăng tối đa 10 việc/ngày</p>
                    </div>

                    <form id="postJobForm" class="space-y-3">
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1">Tiêu đề công việc</label>
                            <input type="text" id="jobTitleInput" required placeholder="Ví dụ: Cần giao hàng hỏa tốc" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600">
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            <div>
                                <label class="block text-xs font-semibold text-slate-700 mb-1">Danh mục</label>
                                <select id="jobCategoryInput" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600">
                                    <option value="shipper">Giao hàng</option>
                                    <option value="driver">Tài xế</option>
                                    <option value="housework">Giúp việc</option>
                                    <option value="other">Khác</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-slate-700 mb-1">Khu vực</label>
                                <select id="jobLocationInput" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600">
                                    <option value="Châu Thành">Châu Thành</option>
                                    <option value="Long Xuyên">Long Xuyên</option>
                                    <option value="Châu Đốc">Châu Đốc</option>
                                    <option value="Chợ Mới">Chợ Mới</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1">Mức lương / Thù lao</label>
                            <input type="text" id="jobSalaryInput" required placeholder="Ví dụ: 200.000 VNĐ / ngày" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600">
                        </div>
                        <div class="flex items-center gap-2 pt-1">
                            <input type="checkbox" id="jobUrgentInput" class="w-4 h-4 text-teal-600 rounded">
                            <label for="jobUrgentInput" class="text-xs font-semibold text-red-600">Tuyển gấp (Đánh dấu nổi bật)</label>
                        </div>
                        <div class="flex gap-2 pt-2">
                            <button type="button" id="btnCancelPostJobModal" class="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-sm transition">Hủy</button>
                            <button type="submit" class="w-1/2 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl text-sm transition shadow-sm">Đăng ngay</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(postJobModalContainer);
    }

    const postJobModal = document.getElementById('postJobModal');
    const btnPostJob = document.getElementById('btnPostJob');
    const btnFloatingPostJob = document.getElementById('btnFloatingPostJob');
    const btnClosePostJobModal = document.getElementById('btnClosePostJobModal');
    const btnCancelPostJobModal = document.getElementById('btnCancelPostJobModal');
    const postJobForm = document.getElementById('postJobForm');

    function openPostJobModal() {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            showToast('Vui lòng đăng nhập để đăng bài!', 'error');
            showLoginForm();
            authModal?.classList.remove('hidden');
            authModal?.classList.add('flex');
            return;
        }
        postJobModal?.classList.remove('hidden');
        postJobModal?.classList.add('flex');
    }

    function closePostJobModal() {
        if (postJobModal) {
            postJobModal.classList.add('hidden');
            postJobModal.classList.remove('flex');
        }
    }

    btnPostJob?.addEventListener('click', openPostJobModal);
    btnFloatingPostJob?.addEventListener('click', openPostJobModal);
    btnClosePostJobModal?.addEventListener('click', closePostJobModal);
    btnCancelPostJobModal?.addEventListener('click', closePostJobModal);

    postJobModal?.addEventListener('click', (e) => {
        if (e.target === postJobModal) {
            closePostJobModal();
        }
    });

    postJobForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentUser = getCurrentUser();

        if (!currentUser) {
            showToast('Vui lòng đăng nhập để đăng việc!', 'error');
            showLoginForm();
            authModal?.classList.remove('hidden');
            authModal?.classList.add('flex');
            return;
        }

        try {
            const allJobs = await fetchJobsFromCloud();
            const todayStr = new Date().toISOString().split('T')[0];

            const jobsTodayCount = Array.isArray(allJobs) ? allJobs.filter(job => {
                const isOwner = job.phone === currentUser.phone;
                if (!isOwner) return false;
                if (job.created_at) {
                    return String(job.created_at).startsWith(todayStr);
                }
                return true;
            }).length : 0;

            if (jobsTodayCount >= 10) {
                showToast('Bạn đã đạt giới hạn 10 việc/ngày!', 'error');
                alert('Mỗi tài khoản chỉ được phép đăng tối đa 10 việc mỗi ngày. Vui lòng quay lại vào ngày mai!');
                return;
            }

            const newJob = {
                title: document.getElementById('jobTitleInput').value.trim(),
                category: document.getElementById('jobCategoryInput').value,
                location: document.getElementById('jobLocationInput').value,
                salary: document.getElementById('jobSalaryInput').value.trim(),
                is_urgent: document.getElementById('jobUrgentInput')?.checked || false,
                created_by_name: currentUser.name,
                phone: currentUser.phone
            };

            if (!newJob.title || !newJob.salary) {
                showToast('Vui lòng nhập tiêu đề và lương!', 'error');
                return;
            }

            const res = await fetch(`${SUPABASE_URL}/rest/v1/jobs`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(newJob)
            });

            if (!res.ok) {
                const errDetail = await res.text();
                console.error("Supabase Error:", errDetail);
                if (errDetail.includes("row-level security") || errDetail.includes("policy")) {
                    alert("Lỗi Supabase: Bạn cần vào Supabase > Table Editor > bảng 'jobs' > Tắt chế độ RLS (Disable RLS).");
                } else {
                    alert("Lỗi lưu vào Supabase: " + errDetail);
                }
                return;
            }

            closePostJobModal();
            postJobForm.reset();
            showToast(`Đăng việc thành công! (${jobsTodayCount + 1}/10 bài hôm nay)`);
            renderJobs();
        } catch (err) {
            console.error("Fetch Exception:", err);
            showToast('Không thể kết nối đến máy chủ!', 'error');
        }
    });

    // Khởi tạo trạng thái ban đầu khi trang web load
    updateAuthButtonUI();
    renderJobs();
});