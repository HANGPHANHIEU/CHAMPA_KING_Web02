document.addEventListener('DOMContentLoaded', () => {
    console.log("--- HỆ THỐNG 'VIỆC GẤP' ĐÃ KHỞI ĐỘNG (FULL FEATURES) ---");

    // 1. Dọn dẹp tất cả modal bị kẹt khi mới tải trang
    document.querySelectorAll('[id*="Modal"], [id*="modal"]').forEach(modal => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    });

    // Các phần tử modal & giao diện chính
    const authModal = document.getElementById('authModal');
    const authForm = document.getElementById('authForm');
    const resetForm = document.getElementById('resetForm');
    const authModalTitle = document.getElementById('authModalTitle');
    const authFooter = document.getElementById('authFooter');
    const resetFooter = document.getElementById('resetFooter');
    const loginBtnText = document.getElementById('loginBtnText');

    // Kiểm tra trạng thái đăng nhập từ LocalStorage
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

    // --- HÀM RENDER DANH SÁCH TỔ CHỨC ĐÃ ĐƯỢC DUYỆT (TAB TỔ CHỨC) ---
    const renderApprovedOrgs = () => {
        const orgListContainer = document.getElementById('orgList');
        if (!orgListContainer) return;

        const orgs = JSON.parse(localStorage.getItem('viecgap_orgs') || '[]');
        const approvedOrgs = orgs.filter(o => o.status === 'approved');

        if (approvedOrgs.length === 0) {
            orgListContainer.innerHTML = `
                <div class="text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    Chưa có tổ chức/đối tác nào được phê duyệt.
                </div>
            `;
            return;
        }

        orgListContainer.innerHTML = approvedOrgs.map(org => `
            <div class="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between gap-2">
                <div class="flex justify-between items-start">
                    <div>
                        <span class="bg-teal-50 text-teal-700 text-[11px] font-semibold px-2 py-0.5 rounded-md uppercase">${org.province || 'An Giang'}</span>
                        <h3 class="font-bold text-slate-900 text-base mt-1">${org.name}</h3>
                    </div>
                    <span class="text-xs bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-xl font-semibold"><i class="fa-solid fa-circle-check mr-1"></i>Đã xác minh</span>
                </div>
                <p class="text-xs text-slate-600"><i class="fa-solid fa-star text-amber-500 mr-1"></i>Thế mạnh: ${org.strength}</p>
                <div class="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-50">
                    <span><i class="fa-solid fa-location-dot text-slate-400 mr-1"></i>${org.address}, ${org.district}</span>
                    <a href="tel:${org.phone}" class="text-teal-600 font-bold hover:underline"><i class="fa-solid fa-phone mr-1"></i>${org.phone}</a>
                </div>
            </div>
        `).join('');
    };

    // --- HÀM RENDER DANH SÁCH VIỆC LÀM ĐÃ NHẬN (TAB 2) ---
    const renderAcceptedJobs = () => {
        const acceptedContainer = document.getElementById('acceptedJobList');
        if (!acceptedContainer) return;

        const currentUserPhone = localStorage.getItem('viecgap_user_phone');
        const jobs = JSON.parse(localStorage.getItem('viecgap_jobs') || '[]');
        
        const myAcceptedJobs = jobs.filter(job => job.status === 'accepted' && job.acceptedBy === currentUserPhone);

        if (myAcceptedJobs.length === 0) {
            acceptedContainer.innerHTML = `
                <div class="text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    Bạn chưa nhận công việc nào.
                </div>
            `;
            return;
        }

        acceptedContainer.innerHTML = myAcceptedJobs.map(job => `
            <div class="bg-white border border-teal-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between gap-3">
                <div class="flex justify-between items-start">
                    <div>
                        <span class="bg-teal-50 text-teal-700 text-[11px] font-semibold px-2 py-0.5 rounded-md uppercase">${job.category || 'Khác'}</span>
                        <h3 class="font-bold text-slate-900 text-base mt-1">${job.title}</h3>
                    </div>
                    <span class="text-teal-600 font-bold text-sm bg-teal-50 px-2.5 py-1 rounded-xl">${job.salary}</span>
                </div>
                <div class="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-50">
                    <span><i class="fa-solid fa-location-dot mr-1"></i>${job.location}</span>
                    <span class="text-emerald-600 font-semibold"><i class="fa-solid fa-check-circle mr-1"></i>Đã nhận việc</span>
                </div>
            </div>
        `).join('');
    };

    // --- HÀM RENDER DANH SÁCH VIỆC LÀM RA GIAO DIỆN CHÍNH ---
    window.renderJobs = () => {
        const jobListContainer = document.getElementById('jobList');
        const jobCountElement = document.getElementById('jobCount');
        if (!jobListContainer) return;

        const jobs = JSON.parse(localStorage.getItem('viecgap_jobs') || '[]');
        const currentUserPhone = localStorage.getItem('viecgap_user_phone');
        
        const availableJobs = jobs.filter(j => j.status !== 'accepted');

        if (jobCountElement) {
            jobCountElement.innerText = `${availableJobs.length} việc phù hợp`;
        }

        if (availableJobs.length === 0) {
            jobListContainer.innerHTML = `
                <div class="text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    Chưa có công việc nào sẵn có. Hãy đăng nhập và "Đăng việc" ngay!
                </div>
            `;
            return;
        }

        jobListContainer.innerHTML = availableJobs.map(job => {
            const isOwner = currentUserPhone && job.phone === currentUserPhone;

            return `
                <div class="bg-white border border-slate-100 hover:border-teal-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between gap-3">
                    <div class="flex justify-between items-start">
                        <div>
                            <div class="flex items-center gap-2 mb-1">
                                <span class="bg-teal-50 text-teal-700 text-[11px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wide">${job.category || 'Khác'}</span>
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
                        <div class="flex items-center gap-2">
                            <button onclick="window.handleTakeJob('${job.id}')" class="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer text-xs flex items-center gap-1">
                                Nhận việc &rarr;
                            </button>
                            ${isOwner ? `
                                <button onclick="window.handleDeleteJob('${job.id}')" class="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer text-xs flex items-center gap-1">
                                    <i class="fa-solid fa-trash-can"></i> Xóa
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        renderAcceptedJobs();
        renderApprovedOrgs();
        renderTrashList();
    };

    // --- HÀM RENDER THÙNG RÁC ---
    const renderTrashList = () => {
        const trashContainer = document.getElementById('trashList');
        const trashBadge = document.getElementById('trashBadge');
        if (!trashContainer) return;

        const deletedJobs = JSON.parse(localStorage.getItem('viecgap_deleted_jobs') || '[]');

        if (trashBadge) {
            trashBadge.innerText = deletedJobs.length;
            if (deletedJobs.length > 0) {
                trashBadge.classList.remove('hidden');
            } else {
                trashBadge.classList.add('hidden');
            }
        }

        if (deletedJobs.length === 0) {
            trashContainer.innerHTML = `
                <div class="text-center py-8 text-slate-400 text-sm">
                    Thùng rác trống.
                </div>
            `;
            return;
        }

        trashContainer.innerHTML = deletedJobs.map(job => `
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 flex justify-between items-center text-xs">
                <div>
                    <h4 class="font-bold text-slate-800">${job.title}</h4>
                    <p class="text-slate-500">Khu vực: ${job.location} | Lương: ${job.salary}</p>
                </div>
                <button onclick="window.handleRestoreJob('${job.id}')" class="bg-teal-100 hover:bg-teal-200 text-teal-700 font-semibold px-2.5 py-1 rounded-lg transition">
                    Khôi phục
                </button>
            </div>
        `).join('');
    };

    // --- LOGIC NHẬN VIỆC ---
    window.handleTakeJob = (jobId) => {
        if (!checkLoginStatus()) {
            alert("Vui lòng đăng nhập tài khoản trước khi nhận việc!");
            openAuthModal();
            return;
        }

        const currentUserPhone = localStorage.getItem('viecgap_user_phone');
        let jobs = JSON.parse(localStorage.getItem('viecgap_jobs') || '[]');
        const jobIndex = jobs.findIndex(j => j.id === jobId);

        if (jobIndex === -1) {
            alert("Công việc không tồn tại hoặc đã bị xóa!");
            return;
        }

        if (jobs[jobIndex].phone === currentUserPhone) {
            alert("Bạn không thể tự nhận công việc do chính mình đăng!");
            return;
        }

        if (confirm(`Bạn có chắc chắn muốn nhận công việc: "${jobs[jobIndex].title}"?`)) {
            jobs[jobIndex].status = 'accepted';
            jobs[jobIndex].acceptedBy = currentUserPhone;

            localStorage.setItem('viecgap_jobs', JSON.stringify(jobs));
            alert("Nhận việc thành công! Bạn có thể xem lại ở tab 'Đã nhận'.");
            window.renderJobs();
        }
    };

    // --- LOGIC XÓA VIỆC (CHỈ CHÍNH CHỦ MỚI ĐƯỢC XÓA) ---
    window.handleDeleteJob = (jobId) => {
        const currentUserPhone = localStorage.getItem('viecgap_user_phone');
        let jobs = JSON.parse(localStorage.getItem('viecgap_jobs') || '[]');
        const job = jobs.find(j => j.id === jobId);

        if (!job) return;

        if (job.phone !== currentUserPhone) {
            alert("Bạn không có quyền xóa công việc của người khác!");
            return;
        }

        if (confirm("Bạn có chắc chắn muốn xóa bài đăng này không?")) {
            const updatedJobs = jobs.filter(j => j.id !== jobId);
            localStorage.setItem('viecgap_jobs', JSON.stringify(updatedJobs));

            let deletedJobs = JSON.parse(localStorage.getItem('viecgap_deleted_jobs') || '[]');
            deletedJobs.push(job);
            localStorage.setItem('viecgap_deleted_jobs', JSON.stringify(deletedJobs));

            alert("Đã xóa công việc thành công và chuyển vào thùng rác!");
            window.renderJobs();
        }
    };

    // --- LOGIC KHÔI PHỤC CÔNG VIỆC TỪ THÙNG RÁC ---
    window.handleRestoreJob = (jobId) => {
        let deletedJobs = JSON.parse(localStorage.getItem('viecgap_deleted_jobs') || '[]');
        const jobIndex = deletedJobs.findIndex(j => j.id === jobId);

        if (jobIndex !== -1) {
            const restoredJob = deletedJobs[jobIndex];
            deletedJobs.splice(jobIndex, 1);
            localStorage.setItem('viecgap_deleted_jobs', JSON.stringify(deletedJobs));

            let jobs = JSON.parse(localStorage.getItem('viecgap_jobs') || '[]');
            jobs.unshift(restoredJob);
            localStorage.setItem('viecgap_jobs', JSON.stringify(jobs));

            alert("Khôi phục công việc thành công!");
            window.renderJobs();
        }
    };

    // --- XÓA SẠCH THÙNG RÁC VĨNH VIỄN ---
    document.getElementById('btnEmptyTrash')?.addEventListener('click', () => {
        if (confirm("Bạn có chắc chắn muốn xóa vĩnh viễn toàn bộ bài trong thùng rác không?")) {
            localStorage.removeItem('viecgap_deleted_jobs');
            renderTrashList();
            alert("Đã dọn sạch thùng rác!");
        }
    });

    // --- PHÊ DUYỆT / TỪ CHỐI CHO ADMIN ---
    window.approveRegistration = (id, type) => {
        const key = type === 'worker' ? 'viecgap_workers' : 'viecgap_orgs';
        let list = JSON.parse(localStorage.getItem(key) || '[]');
        const index = list.findIndex(item => item.id === id);

        if (index !== -1) {
            list[index].status = 'approved';
            localStorage.setItem(key, JSON.stringify(list));
            alert(`Đã phê duyệt ${type === 'worker' ? 'cá nhân' : 'tổ chức'} thành công!`);
            window.renderJobs();
        }
    };

    window.rejectRegistration = (id, type) => {
        const key = type === 'worker' ? 'viecgap_workers' : 'viecgap_orgs';
        let list = JSON.parse(localStorage.getItem(key) || '[]');
        const updatedList = list.filter(item => item.id !== id);

        if (confirm(`Bạn có chắc chắn muốn từ chối đăng ký này?`)) {
            localStorage.setItem(key, JSON.stringify(updatedList));
            alert(`Đã từ chối đăng ký!`);
            window.renderJobs();
        }
    };

    // Render khởi tạo ban đầu
    window.renderJobs();

    // --- ĐĂNG KÝ TỔ CHỨC ---
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

    orgForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const newOrg = {
            id: 'org_' + Date.now(),
            name: document.getElementById('orgNameInput')?.value,
            phone: document.getElementById('orgPhoneInput')?.value,
            province: document.getElementById('orgProvinceInput')?.value,
            district: document.getElementById('orgDistrictInput')?.value,
            ward: document.getElementById('orgWardInput')?.value,
            address: document.getElementById('orgAddressInput')?.value,
            strength: document.getElementById('orgStrengthInput')?.value,
            status: 'pending',
            createdAt: new Date().toLocaleDateString('vi-VN')
        };

        let orgs = JSON.parse(localStorage.getItem('viecgap_orgs') || '[]');
        orgs.unshift(newOrg);
        localStorage.setItem('viecgap_orgs', JSON.stringify(orgs));

        alert("Ghi danh Tổ chức thành công! Hồ sơ của bạn đang chờ Admin phê duyệt.");
        closeOrgModal();
    });

    // --- ĐĂNG KÝ CÁ NHÂN ---
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

    workerForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const newWorker = {
            id: 'worker_' + Date.now(),
            name: document.getElementById('workerNameInput')?.value,
            phone: document.getElementById('workerPhoneInput')?.value,
            location: document.getElementById('workerLocationInput')?.value,
            skill: document.getElementById('workerSkillInput')?.value,
            status: 'pending',
            createdAt: new Date().toLocaleDateString('vi-VN')
        };

        let workers = JSON.parse(localStorage.getItem('viecgap_workers') || '[]');
        workers.unshift(newWorker);
        localStorage.setItem('viecgap_workers', JSON.stringify(workers));

        alert("Đăng ký hồ sơ cá nhân thành công! Hồ sơ của bạn đang chờ Admin phê duyệt.");
        closeWorkerModal();
    });

    // --- ĐĂNG NHẬP ---
    authForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const phone = document.getElementById('loginPhone')?.value;
        if (phone) {
            localStorage.setItem('viecgap_logged_in', 'true');
            localStorage.setItem('viecgap_user_phone', phone);
            if (loginBtnText) loginBtnText.innerText = "Đã đăng nhập";
            alert('Đăng nhập thành công!');
            closeAuthModal();
            window.renderJobs();
        }
    });

    document.getElementById('btnLoginAccount')?.addEventListener('click', openAuthModal);
    document.getElementById('btnCloseAuthModal')?.addEventListener('click', closeAuthModal);
    document.getElementById('btnCancelAuthModal')?.addEventListener('click', closeAuthModal);
    document.getElementById('btnCancelReset')?.addEventListener('click', closeAuthModal);

    // --- ĐĂNG VIỆC ---
    const postJobModal = document.getElementById('postJobModal');
    const postJobForm = document.getElementById('postJobForm');

    const openPostJob = () => {
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

    postJobForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const currentUserPhone = localStorage.getItem('viecgap_user_phone') || '';

        const newJob = {
            id: 'job_' + Date.now(),
            title: document.getElementById('jobTitleInput')?.value || 'Công việc mới',
            location: document.getElementById('jobLocationInput')?.value || 'Châu Thành',
            category: document.getElementById('jobCategoryInput')?.value || 'delivery',
            salary: document.getElementById('jobSalaryInput')?.value || 'Thỏa thuận',
            urgent: document.getElementById('jobUrgentInput')?.checked || false,
            phone: currentUserPhone,
            status: 'active',
            createdAt: new Date().toLocaleDateString('vi-VN')
        };

        let jobs = JSON.parse(localStorage.getItem('viecgap_jobs') || '[]');
        jobs.unshift(newJob);
        localStorage.setItem('viecgap_jobs', JSON.stringify(jobs));

        closePostJobModal();
        window.renderJobs();
    });

    // Modal Thùng rác
    const trashModal = document.getElementById('trashModal');
    document.getElementById('btnOpenTrash')?.addEventListener('click', () => {
        renderTrashList();
        trashModal?.classList.remove('hidden');
        trashModal?.classList.add('flex');
    });
    document.getElementById('btnCloseTrashModal')?.addEventListener('click', () => trashModal?.classList.add('hidden'));

    // Chuyển đổi Tab điều hướng dưới cùng
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

            if (tabId === 'tabAcceptedJob') {
                renderAcceptedJobs();
            } else if (tabId === 'tabOrganization') {
                renderApprovedOrgs();
            }
        });
    });
});