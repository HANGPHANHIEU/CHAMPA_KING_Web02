// --- QUẢN TRỊ ADMIN (JS/ADMIN-APP.JS) ---

const DEFAULT_ADMIN_HASH = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';

async function hashPassword(plainText) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plainText);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function getAdminPasswordHash() {
    return localStorage.getItem('admin_custom_password_hash') || DEFAULT_ADMIN_HASH;
}

function getAdminEmails() {
    const stored = localStorage.getItem('allowed_admin_emails');
    if (stored) {
        try { return JSON.parse(stored); } catch(e) { }
    }
    return ['hieu199771@gmail.com'];
}

function saveAdminEmails(list) {
    localStorage.setItem('allowed_admin_emails', JSON.stringify(list));
}

document.addEventListener('DOMContentLoaded', () => {
    const loginSection = document.getElementById('adminLoginSection');
    const mainContent = document.getElementById('adminMainContent');
    const loginForm = document.getElementById('adminLoginForm');
    const passwordInput = document.getElementById('adminPasswordInput');
    const loginErrorMsg = document.getElementById('loginErrorMsg');
    const googleErrorMsg = document.getElementById('googleErrorMsg');
    const btnLogout = document.getElementById('btnLogout');
    const adminSessionInfo = document.getElementById('adminSessionInfo');
    
    const tabGoogleBtn = document.getElementById('tabGoogleBtn');
    const tabPassBtn = document.getElementById('tabPassBtn');
    const googleAuthBox = document.getElementById('googleAuthBox');

    const btnOpenChangePassModal = document.getElementById('btnOpenChangePassModal');
    const changePassModal = document.getElementById('changePassModal');
    const btnCloseChangePass = document.getElementById('btnCloseChangePass');
    const changePassForm = document.getElementById('changePassForm');
    const newPasswordInput = document.getElementById('newPasswordInput');

    const btnOpenAdminManager = document.getElementById('btnOpenAdminManager');
    const adminManagerModal = document.getElementById('adminManagerModal');
    const btnCloseAdminManager = document.getElementById('btnCloseAdminManager');
    const addAdminForm = document.getElementById('addAdminForm');
    const newAdminEmailInput = document.getElementById('newAdminEmailInput');
    const adminEmailsListContainer = document.getElementById('adminEmailsListContainer');

    // Chuyển Tab đăng nhập (Google / Mật khẩu)
    tabGoogleBtn?.addEventListener('click', () => {
        tabGoogleBtn.className = 'py-2 rounded-lg bg-white text-slate-900 shadow-sm transition cursor-pointer';
        tabPassBtn.className = 'py-2 rounded-lg text-slate-500 hover:text-slate-900 transition cursor-pointer';
        googleAuthBox?.classList.remove('hidden');
        loginForm?.classList.add('hidden');
    });

    tabPassBtn?.addEventListener('click', () => {
        tabPassBtn.className = 'py-2 rounded-lg bg-white text-slate-900 shadow-sm transition cursor-pointer';
        tabGoogleBtn.className = 'py-2 rounded-lg text-slate-500 hover:text-slate-900 transition cursor-pointer';
        loginForm?.classList.remove('hidden');
        googleAuthBox?.classList.add('hidden');
    });

    if (sessionStorage.getItem('is_admin_active') === 'true') {
        openDashboard(sessionStorage.getItem('admin_auth_method') || 'Mật khẩu nội bộ');
    }

    loginForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const inputVal = passwordInput.value.trim();
        const inputHash = await hashPassword(inputVal);

        if (inputHash === getAdminPasswordHash()) {
            sessionStorage.setItem('is_admin_active', 'true');
            sessionStorage.setItem('admin_auth_method', 'Mật khẩu');
            openDashboard('Mật khẩu');
        } else {
            loginErrorMsg?.classList.remove('hidden');
        }
    });

    btnLogout?.addEventListener('click', () => {
        sessionStorage.clear();
        mainContent?.classList.add('hidden');
        loginSection?.classList.remove('hidden');
        btnLogout?.classList.add('hidden');
        btnOpenChangePassModal?.classList.add('hidden');
        btnOpenAdminManager?.classList.add('hidden');
        adminSessionInfo?.classList.add('hidden');
        if (passwordInput) passwordInput.value = '';
        loginErrorMsg?.classList.add('hidden');
        googleErrorMsg?.classList.add('hidden');
    });

    btnOpenChangePassModal?.addEventListener('click', () => {
        changePassModal?.classList.remove('hidden');
        changePassModal?.classList.add('flex');
    });

    btnCloseChangePass?.addEventListener('click', () => {
        changePassModal?.classList.add('hidden');
        changePassModal?.classList.remove('flex');
        if (newPasswordInput) newPasswordInput.value = '';
    });

    changePassForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPass = newPasswordInput.value.trim();
        if (newPass.length < 4) {
            alert('Mật khẩu tối thiểu phải có 4 ký tự!');
            return;
        }
        const newHash = await hashPassword(newPass);
        localStorage.setItem('admin_custom_password_hash', newHash);
        changePassModal?.classList.add('hidden');
        changePassModal?.classList.remove('flex');
        if (newPasswordInput) newPasswordInput.value = '';
        alert('Đổi mật khẩu admin thành công!');
    });

    btnOpenAdminManager?.addEventListener('click', () => {
        renderAdminEmailsList();
        adminManagerModal?.classList.remove('hidden');
        adminManagerModal?.classList.add('flex');
    });

    btnCloseAdminManager?.addEventListener('click', () => {
        adminManagerModal?.classList.add('hidden');
        adminManagerModal?.classList.remove('flex');
    });

    addAdminForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = newAdminEmailInput.value.trim().toLowerCase();
        let emails = getAdminEmails();
        if (emails.includes(email)) {
            alert('Email này đã tồn tại!');
            return;
        }
        emails.push(email);
        saveAdminEmails(emails);
        newAdminEmailInput.value = '';
        renderAdminEmailsList();
        alert('Thêm tài khoản admin thành công!');
    });

    window.removeAdminEmail = function(emailToRemove) {
        let emails = getAdminEmails();
        if (emails.length <= 1) {
            alert('Cần giữ lại ít nhất một tài khoản!');
            return;
        }
        if (confirm(`Bạn có chắc muốn xóa quyền admin của ${emailToRemove}?`)) {
            emails = emails.filter(e => e !== emailToRemove);
            saveAdminEmails(emails);
            renderAdminEmailsList();
        }
    };

    function renderAdminEmailsList() {
        const emails = getAdminEmails();
        if (!adminEmailsListContainer) return;
        adminEmailsListContainer.innerHTML = '';
        emails.forEach(email => {
            const row = document.createElement('div');
            row.className = 'flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-200 text-xs';
            row.innerHTML = `
                <span class="font-medium text-slate-700"><i class="fa-solid fa-envelope mr-1.5 text-teal-600"></i> ${email}</span>
                <button type="button" onclick="removeAdminEmail('${email}')" class="text-red-500 hover:text-red-700 font-semibold cursor-pointer"><i class="fa-solid fa-trash-can"></i> Xóa</button>
            `;
            adminEmailsListContainer.appendChild(row);
        });
    }

    function openDashboard(method) {
        loginSection?.classList.add('hidden');
        mainContent?.classList.remove('hidden');
        btnLogout?.classList.remove('hidden');
        btnOpenChangePassModal?.classList.remove('hidden');
        btnOpenAdminManager?.classList.remove('hidden');
        
        if (adminSessionInfo) {
            adminSessionInfo.textContent = `Phiên Admin (${method})`;
            adminSessionInfo.classList.remove('hidden');
        }
        loadPendingData();
    }

    window.handleGoogleLogin = function(response) {
        try {
            const base64Url = response.credential.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const userInfo = JSON.parse(jsonPayload);
            const userEmail = userInfo.email.toLowerCase().trim();
            const ALLOWED_ADMIN_EMAILS = getAdminEmails();

            if (ALLOWED_ADMIN_EMAILS.includes(userEmail)) {
                sessionStorage.setItem('is_admin_active', 'true');
                sessionStorage.setItem('admin_auth_method', 'Google (' + userEmail + ')');
                googleErrorMsg?.classList.add('hidden');
                openDashboard('Google');
            } else {
                if (googleErrorMsg) {
                    googleErrorMsg.textContent = `Email (${userEmail}) không có quyền Quản trị viên!`;
                    googleErrorMsg.classList.remove('hidden');
                }
            }
        } catch (err) {
            if (googleErrorMsg) {
                googleErrorMsg.textContent = 'Xác thực Google thất bại!';
                googleErrorMsg.classList.remove('hidden');
            }
        }
    };

    // --- HÀM TẢI VÀ HIỂN THỊ DỮ LIỆU CHỜ DUYỆT ---
    async function loadPendingData() {
        // Đọc dữ liệu từ cả 2 nguồn key để tránh bị lệch
        let workers = JSON.parse(localStorage.getItem('viecgap_workers') || localStorage.getItem('workers_list') || '[]');
        let orgs = JSON.parse(localStorage.getItem('viecgap_orgs') || localStorage.getItem('organizations_list') || '[]');

        // Lọc các hồ sơ ở trạng thái 'pending' hoặc chưa có status
        const pendingWorkers = workers.filter(w => w.status === 'pending' || !w.status);
        const pendingOrgs = orgs.filter(o => o.status === 'pending' || !o.status);

        // Cập nhật số lượng hiển thị trên Badge
        const statPendingWorkers = document.getElementById('statPendingWorkers');
        const statPendingOrgs = document.getElementById('statPendingOrgs');
        if (statPendingWorkers) statPendingWorkers.textContent = pendingWorkers.length;
        if (statPendingOrgs) statPendingOrgs.textContent = pendingOrgs.length;

        // Render danh sách Cá nhân chờ duyệt
        const workerContainer = document.getElementById('adminPendingWorkerList');
        if (workerContainer) {
            workerContainer.innerHTML = '';
            if (pendingWorkers.length === 0) {
                workerContainer.innerHTML = `<p class="text-xs text-slate-400 text-center py-3">Không có hồ sơ cá nhân nào đang chờ duyệt.</p>`;
            } else {
                pendingWorkers.forEach(w => {
                    const item = document.createElement('div');
                    item.className = 'p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs mb-2';
                    item.innerHTML = `
                        <div>
                            <h4 class="font-bold text-slate-800 text-sm">${w.name} - <span class="text-amber-600">${w.skill || w.category || 'Cá nhân'}</span></h4>
                            <p class="text-slate-600 mt-0.5">📞 ${w.phone} &bull; 📍 ${w.location || 'Chưa cập nhật'}</p>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="approveWorker('${w.id}')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition cursor-pointer">Đồng ý</button>
                            <button onclick="rejectWorker('${w.id}')" class="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition cursor-pointer">Từ chối</button>
                        </div>
                    `;
                    workerContainer.appendChild(item);
                });
            }
        }

        // Render danh sách Tổ chức chờ duyệt
        const orgContainer = document.getElementById('adminPendingOrgList');
        if (orgContainer) {
            orgContainer.innerHTML = '';
            if (pendingOrgs.length === 0) {
                orgContainer.innerHTML = `<p class="text-xs text-slate-400 text-center py-3">Không có tổ chức nào đang chờ duyệt.</p>`;
            } else {
                pendingOrgs.forEach(o => {
                    const item = document.createElement('div');
                    item.className = 'p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs mb-2';
                    item.innerHTML = `
                        <div>
                            <h4 class="font-bold text-slate-800 text-sm">${o.name}</h4>
                            <p class="text-slate-600 mt-0.5">📞 ${o.phone} &bull; 📍 ${o.district || o.province || o.address || ''}</p>
                            <p class="text-blue-700 font-medium mt-0.5">Thế mạnh: ${o.strength || 'Chưa cập nhật'}</p>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="approveOrg('${o.id}')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition cursor-pointer">Đồng ý</button>
                            <button onclick="rejectOrg('${o.id}')" class="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition cursor-pointer">Từ chối</button>
                        </div>
                    `;
                    orgContainer.appendChild(item);
                });
            }
        }
    }

    // --- CÁC HÀM XỬ LÝ PHÊ DUYỆT / TỪ CHỐI (GHI ĐỒNG BỘ CẢ 2 KEY) ---
    window.approveOrg = function(id) {
        let orgs = JSON.parse(localStorage.getItem('viecgap_orgs') || localStorage.getItem('organizations_list') || '[]');
        orgs = orgs.map(o => o.id == id ? { ...o, status: 'approved' } : o);
        
        localStorage.setItem('viecgap_orgs', JSON.stringify(orgs));
        localStorage.setItem('organizations_list', JSON.stringify(orgs));

        alert("Đã phê duyệt tổ chức thành công!");
        loadPendingData();
    };

    window.rejectOrg = function(id) {
        if (confirm("Bạn có chắc chắn muốn từ chối và xóa hồ sơ tổ chức này?")) {
            let orgs = JSON.parse(localStorage.getItem('viecgap_orgs') || localStorage.getItem('organizations_list') || '[]');
            orgs = orgs.filter(o => o.id != id);

            localStorage.setItem('viecgap_orgs', JSON.stringify(orgs));
            localStorage.setItem('organizations_list', JSON.stringify(orgs));

            loadPendingData();
        }
    };

    window.approveWorker = function(id) {
        let workers = JSON.parse(localStorage.getItem('viecgap_workers') || localStorage.getItem('workers_list') || '[]');
        workers = workers.map(w => w.id == id ? { ...w, status: 'approved' } : w);
        
        localStorage.setItem('viecgap_workers', JSON.stringify(workers));
        localStorage.setItem('workers_list', JSON.stringify(workers));

        alert("Đã phê duyệt hồ sơ cá nhân thành công!");
        loadPendingData();
    };

    window.rejectWorker = function(id) {
        if (confirm("Bạn có chắc chắn muốn từ chối và xóa hồ sơ cá nhân này?")) {
            let workers = JSON.parse(localStorage.getItem('viecgap_workers') || localStorage.getItem('workers_list') || '[]');
            workers = workers.filter(w => w.id != id);

            localStorage.setItem('viecgap_workers', JSON.stringify(workers));
            localStorage.setItem('workers_list', JSON.stringify(workers));

            loadPendingData();
        }
    };
});