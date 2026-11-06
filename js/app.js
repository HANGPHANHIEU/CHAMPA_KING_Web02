document.addEventListener('DOMContentLoaded', () => {
    console.log("--- HỆ THỐNG 'VIỆC GẤP' ĐÃ KHỞI ĐỘNG (SAFE MODE) ---");

    // 1. Dọn dẹp tất cả modal bị kẹt khi mới tải trang
    document.querySelectorAll('[id*="Modal"], [id*="modal"]').forEach(modal => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    });

    // --- HÀM RENDER DANH SÁCH VIỆC LÀM RA GIAO DIỆN ---
    const renderJobs = () => {
        const jobListContainer = document.getElementById('jobList');
        const jobCountElement = document.getElementById('jobCount');
        if (!jobListContainer) return;

        const jobs = JSON.parse(localStorage.getItem('viecgap_jobs') || '[]');
        
        if (jobCountElement) {
            jobCountElement.innerText = `${jobs.length} việc phù hợp`;
        }

        if (jobs.length === 0) {
            jobListContainer.innerHTML = `
                <div class="text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    Chưa có công việc nào được đăng. Hãy đăng nhập và "Đăng việc" ngay!
                </div>
            `;
            return;
        }

        jobListContainer.innerHTML = jobs.map(job => `
            <div class="bg-white border border-slate-100 hover:border-teal-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between gap-3">
                <div class="flex justify-between items-start">
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="bg-teal-50 text-teal-700 text-[11px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wide">${job.category}</span>
                            ${job.urgent ? '<span class="bg-amber-100 text-amber-700 text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"><i class="fa-solid fa-bolt text-[10px]"></i> Gấp</span>' : ''}
                        </div>
                        <h3 class="font-bold text-slate-900 text-base">${job.title}</h3>
                    </div>
                    <span class="text-teal-600 font-bold text-sm bg-teal-50 px-2.5 py-1 rounded-xl">${job.salary}</span>
                </div>
                <div class="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-50">
                    <div class="flex items-center gap-3">
                        <span><i class="fa-solid fa-location-dot text-slate-400 mr-1"></i>${job.location}</span>
                        <span><i class="fa-regular fa-clock text-slate-400 mr-1"></i>${job.createdAt}</span>
                    </div>
                    <button class="text-teal-600 hover:text-teal-700 font-semibold transition">Nhận việc &rarr;</button>
                </div>
            </div>
        `).join('');
    };

    renderJobs();

    // --- 3. XỬ LÝ MODAL ĐĂNG NHẬP & KIỂM TRA PHIÊN ĐĂNG NHẬP ---
    const authModal = document.getElementById('authModal');
    const authForm = document.getElementById('authForm');
    const resetForm = document.getElementById('resetForm');
    const authModalTitle = document.getElementById('authModalTitle');
    const authFooter = document.getElementById('authFooter');
    const resetFooter = document.getElementById('resetFooter');
    const loginBtnText = document.getElementById('loginBtnText');

    // Kiểm tra trạng thái đăng nhập hiện tại từ LocalStorage
    const checkLoginStatus = () => {
        const isLoggedIn = localStorage.getItem('viecgap_logged_in') === 'true';
        if (isLoggedIn && loginBtnText) {
            loginBtnText.innerText = "Đã đăng nhập";
        }
        return isLoggedIn;
    };
    checkLoginStatus();

    const openAuthModal = () => {
        if (authModal) {
            authModal.classList.remove('hidden');
            authModal.classList.add('flex');
            authForm?.classList.remove('hidden');
            resetForm?.classList.add('hidden');
            authFooter?.classList.remove('hidden');
            resetFooter?.classList.add('hidden');
            if (authModalTitle) authModalTitle.innerText = "Đăng nhập tài khoản";
        }
    };

    const closeAuthModal = () => {
        authModal?.classList.add('hidden');
        authModal?.classList.remove('flex');
        authForm?.reset();
        resetForm?.reset();
    };

    // Xử lý khi submit form đăng nhập thành công
    authForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const phone = document.getElementById('loginPhone')?.value;
        if (phone) {
            localStorage.setItem('viecgap_logged_in', 'true');
            localStorage.setItem('viecgap_user_phone', phone);
            if (loginBtnText) loginBtnText.innerText = "Đã đăng nhập";
            alert('Đăng nhập thành công!');
            closeAuthModal();
        }
    });

    document.getElementById('btnLoginAccount')?.addEventListener('click', openAuthModal);
    document.getElementById('btnCloseAuthModal')?.addEventListener('click', closeAuthModal);
    document.getElementById('btnCancelAuthModal')?.addEventListener('click', closeAuthModal);
    document.getElementById('btnCancelReset')?.addEventListener('click', closeAuthModal);

    // --- 2. XỬ LÝ MODAL ĐĂNG VIỆC (CÓ KIỂM TRA ĐĂNG NHẬP) ---
    const postJobModal = document.getElementById('postJobModal');
    const postJobForm = document.getElementById('postJobForm');

    const openPostJob = () => {
        // KIỂM TRA TRẠNG THÁI ĐĂNG NHẬP TRƯỚC KHI CHO ĐĂNG VIỆC
        if (!checkLoginStatus()) {
            alert('Vui lòng đăng nhập trước khi đăng công việc mới!');
            openAuthModal();
            return;
        }

        postJobModal?.classList.remove('hidden');
        postJobModal?.classList.add('flex');
    };

    const closePostJobModal = () => {
        postJobModal?.classList.add('hidden');
        postJobModal?.classList.remove('flex');
        postJobForm?.reset();
    };

    document.getElementById('btnPostJob')?.addEventListener('click', openPostJob);
    document.getElementById('btnFloatingPostJob')?.addEventListener('click', openPostJob);
    document.getElementById('btnCloseModal')?.addEventListener('click', closePostJobModal);
    document.getElementById('btnCancelModal')?.addEventListener('click', closePostJobModal);

    // Bắt sự kiện khi bấm nút "Đăng ngay" trong form
    postJobForm?.addEventListener('submit', (e) => {
        e.preventDefault();

        const newJob = {
            id: 'job_' + Date.now(),
            title: document.getElementById('jobTitleInput')?.value || 'Công việc mới',
            location: document.getElementById('jobLocationInput')?.value || 'Châu Thành',
            category: document.getElementById('jobCategoryInput')?.value || 'delivery',
            salary: document.getElementById('jobSalaryInput')?.value || 'Thỏa thuận',
            urgent: document.getElementById('jobUrgentInput')?.checked || false,
            createdAt: new Date().toLocaleDateString('vi-VN')
        };

        let jobs = JSON.parse(localStorage.getItem('viecgap_jobs') || '[]');
        jobs.unshift(newJob);
        localStorage.setItem('viecgap_jobs', JSON.stringify(jobs));

        closePostJobModal();
        renderJobs();
    });

    // Chuyển đổi qua lại giữa form Đăng nhập và Đổi mật khẩu
    document.getElementById('btnToggleReset')?.addEventListener('click', () => {
        authForm?.classList.add('hidden');
        authFooter?.classList.add('hidden');
        resetForm?.classList.remove('hidden');
        resetFooter?.classList.remove('hidden');
        if (authModalTitle) authModalTitle.innerText = "Đổi mật khẩu tài khoản";
    });

    document.getElementById('btnBackToLogin')?.addEventListener('click', () => {
        resetForm?.classList.add('hidden');
        resetFooter?.classList.add('hidden');
        authForm?.classList.remove('hidden');
        authFooter?.classList.remove('hidden');
        if (authModalTitle) authModalTitle.innerText = "Đăng nhập tài khoản";
    });

    // --- XỬ LÝ MODAL TỔ CHỨC ---
    const orgModal = document.getElementById('orgModal');
    const orgForm = document.getElementById('orgForm');

    const closeOrgModal = () => {
        orgModal?.classList.add('hidden');
        orgModal?.classList.remove('flex');
        orgForm?.reset();
    };

    document.getElementById('btnJoinOrg')?.addEventListener('click', () => {
        orgModal?.classList.remove('hidden');
        orgModal?.classList.add('flex');
    });
    document.getElementById('btnCloseOrgModal')?.addEventListener('click', closeOrgModal);
    document.getElementById('btnCancelOrgModal')?.addEventListener('click', closeOrgModal);

    // --- XỬ LÝ MODAL ĐĂNG KÝ CÁ NHÂN ---
    const workerModal = document.getElementById('workerModal');
    const workerForm = document.getElementById('workerForm');

    const closeWorkerModal = () => {
        workerModal?.classList.add('hidden');
        workerModal?.classList.remove('flex');
        workerForm?.reset();
    };

    document.getElementById('btnRegisterWorker')?.addEventListener('click', () => {
        workerModal?.classList.remove('hidden');
        workerModal?.classList.add('flex');
    });
    document.getElementById('btnCloseWorkerModal')?.addEventListener('click', closeWorkerModal);
    document.getElementById('btnCancelWorkerModal')?.addEventListener('click', closeWorkerModal);

    // --- 6. XỬ LÝ MODAL THÙNG RÁC ---
    const trashModal = document.getElementById('trashModal');
    document.getElementById('btnOpenTrash')?.addEventListener('click', () => {
        trashModal?.classList.remove('hidden');
        trashModal?.classList.add('flex');
    });
    document.getElementById('btnCloseTrashModal')?.addEventListener('click', () => trashModal?.classList.add('hidden'));

    // --- 7. XỬ LÝ CHUYỂN ĐỔI TAB DƯỚI THANH NAVIGATION ---
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            if (!tabId) return;
            
            document.querySelectorAll('.tab-content').forEach(t => {
                if (t.id === tabId) {
                    t.classList.remove('hidden');
                } else {
                    t.classList.add('hidden');
                }
            });
        });
    });
});