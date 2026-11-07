import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- CẤU HÌNH SUPABASE ---
const SUPABASE_URL = 'https://rznzypehvmwysxmjxxxp.supabase.co'; 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6bnp5cGVodm13eXN4bWp4eHhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzNTkxNTYsImV4cCI6MjEwODkzNTE1Nn0.B-5onxhT0EoqgtJ0ZP-ZbGSz4Gmo7xuRPEcsAYz65wA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
    console.log("--- HỆ THỐNG 'VIỆC GẤP' ĐÃ KHỞI ĐỘNG (BẢO MẬT CHÍNH CHỦ & CHECKBOX KHU VỰC) ---");

    // 1. Dọn dẹp modal bị kẹt khi mới tải trang
    document.querySelectorAll('[id*="Modal"], [id*="modal"]').forEach(modal => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    });

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
            loginBtnText.innerHTML = `<i class="fa-solid fa-right-from-bracket mr-1.5"></i> Đăng xuất`;
        }
        return isLoggedIn;
    };
    checkLoginStatus();

    const openAuthModal = () => {
        const isLoggedIn = localStorage.getItem('viecgap_logged_in') === 'true';
        if (isLoggedIn) {
            if (confirm("Bạn có chắc chắn muốn đăng xuất tài khoản không?")) {
                localStorage.removeItem('viecgap_logged_in');
                localStorage.removeItem('viecgap_user_phone');
                if (loginBtnText) {
                    loginBtnText.innerHTML = `<i class="fa-solid fa-user mr-1.5"></i> Đăng nhập`;
                }
                alert("Đã đăng xuất thành công!");
                window.renderJobs();
            }
            return;
        }

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

    // --- XỬ LÝ DROPDOWN CHECKBOX KHU VỰC ---
    const locationDropdownBtn = document.getElementById('locationDropdownBtn');
    const locationCheckboxPanel = document.getElementById('locationCheckboxPanel');
    const closeLocationPanel = document.getElementById('closeLocationPanel');
    const selectedLocationText = document.getElementById('selectedLocationText');
    const selectAllLocations = document.getElementById('selectAllLocations');
    const locCheckboxes = document.querySelectorAll('.loc-checkbox');

    locationDropdownBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        locationCheckboxPanel?.classList.toggle('hidden');
    });

    closeLocationPanel?.addEventListener('click', () => {
        locationCheckboxPanel?.classList.add('hidden');
    });

    document.addEventListener('click', (e) => {
        if (!locationDropdownBtn?.contains(e.target) && !locationCheckboxPanel?.contains(e.target)) {
            locationCheckboxPanel?.classList.add('hidden');
        }
    });

    const updateSelectedLocationsText = () => {
        const checkedBoxes = document.querySelectorAll('.loc-checkbox:checked');
        if (checkedBoxes.length === 0) {
            selectedLocationText.textContent = "🌐 Vui lòng chọn ít nhất 1 khu vực";
        } else if (checkedBoxes.length === locCheckboxes.length) {
            selectedLocationText.textContent = "🌐 Toàn quốc (Tất cả khu vực)";
        } else {
            const names = Array.from(checkedBoxes).map(cb => cb.value);
            selectedLocationText.textContent = names.join(', ');
        }
    };

    locCheckboxes.forEach(cb => {
        cb.addEventListener('change', updateSelectedLocationsText);
    });

    selectAllLocations?.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        locCheckboxes.forEach(cb => {
            cb.checked = isChecked;
        });
        updateSelectedLocationsText();
    });

    // --- HÀM RENDER TỔ CHỨC ĐÃ DUYỆT ---
    const renderApprovedOrgs = async () => {
        const orgListContainer = document.getElementById('orgList');
        if (!orgListContainer) return;

        const { data: approvedOrgs, error } = await supabase
            .from('organizations')
            .select('*')
            .eq('status', 'approved')
            .order('created_at', { ascending: false });

        if (error || !approvedOrgs || approvedOrgs.length === 0) {
            orgListContainer.innerHTML = `<div class="text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200 col-span-2">Chưa có tổ chức nào được phê duyệt.</div>`;
            return;
        }

        orgListContainer.innerHTML = approvedOrgs.map(org => `
            <div class="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between gap-2">
                <div class="flex justify-between items-start">
                    <div>
                        <span class="bg-teal-50 text-teal-700 text-[11px] font-semibold px-2 py-0.5 rounded-md uppercase">${org.province || org.district || 'An Giang'}</span>
                        <h3 class="font-bold text-slate-900 text-base mt-1">${org.name}</h3>
                    </div>
                    <span class="text-xs bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-xl font-semibold flex items-center gap-1 shadow-sm">
                        <i class="fa-solid fa-circle-check text-emerald-500"></i> Đã xác minh
                    </span>
                </div>
                <p class="text-xs text-slate-600"><i class="fa-solid fa-star text-amber-500 mr-1"></i>Thế mạnh: ${org.strength || 'Chưa cập nhật'}</p>
                <div class="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-50">
                    <span><i class="fa-solid fa-location-dot text-slate-400 mr-1"></i>${org.address || ''} ${org.district || ''}</span>
                    <a href="tel:${org.phone}" class="text-teal-600 font-bold hover:underline"><i class="fa-solid fa-phone mr-1"></i>${org.phone}</a>
                </div>
            </div>
        `).join('');
    };

    // --- HÀM RENDER THỢ ĐÃ DUYỆT ---
    const renderApprovedWorkers = async () => {
        const workerListContainer = document.getElementById('workerList');
        if (!workerListContainer) return;

        const { data: approvedWorkers, error } = await supabase
            .from('workers')
            .select('*')
            .eq('status', 'approved')
            .order('created_at', { ascending: false });

        if (error || !approvedWorkers || approvedWorkers.length === 0) {
            workerListContainer.innerHTML = `<div class="text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200 col-span-2">Chưa có hồ sơ cá nhân nào được phê duyệt.</div>`;
            return;
        }

        workerListContainer.innerHTML = approvedWorkers.map(worker => `
            <div class="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col justify-between gap-2">
                <div class="flex justify-between items-start">
                    <div>
                        <span class="bg-teal-50 text-teal-700 text-[11px] font-semibold px-2 py-0.5 rounded-md uppercase">${worker.location || 'Châu Thành'}</span>
                        <h3 class="font-bold text-slate-900 text-base mt-1">${worker.name}</h3>
                    </div>
                    <span class="text-xs bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-xl font-semibold flex items-center gap-1 shadow-sm">
                        <i class="fa-solid fa-circle-check text-emerald-500"></i> Đã xác minh
                    </span>
                </div>
                <p class="text-xs text-slate-600"><i class="fa-solid fa-briefcase text-teal-600 mr-1"></i>Kỹ năng/Nghề nghiệp: ${worker.skill || 'Chưa cập nhật'}</p>
                <div class="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-50">
                    <span><i class="fa-solid fa-location-dot text-slate-400 mr-1"></i>${worker.location || ''}</span>
                    <a href="tel:${worker.phone}" class="text-teal-600 font-bold hover:underline"><i class="fa-solid fa-phone mr-1"></i>${worker.phone}</a>
                </div>
            </div>
        `).join('');
    };

    // --- HÀM RENDER VIỆC ĐÃ NHẬN ---
    const renderAcceptedJobs = async () => {
        const acceptedContainer = document.getElementById('acceptedJobList');
        if (!acceptedContainer) return;

        const currentUserPhone = localStorage.getItem('viecgap_user_phone');
        const { data: jobs, error } = await supabase.from('jobs').select('*');

        if (error || !jobs) return;
        
        const myAcceptedJobs = jobs.filter(job => job.status === 'accepted' && job.accepted_by === currentUserPhone);

        if (myAcceptedJobs.length === 0) {
            acceptedContainer.innerHTML = `<div class="text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200">Bạn chưa nhận công việc nào.</div>`;
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
                    <div class="flex items-center gap-2">
                        <span class="text-emerald-600 font-semibold"><i class="fa-solid fa-check-circle mr-1"></i>Đã nhận việc</span>
                        <button onclick="window.handleRemoveAcceptedJob('${job.id}')" class="bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5">
                            <i class="fa-solid fa-trash-can"></i> Hủy nhận
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    };

    // --- HÀM RENDER THÙNG RÁC ---
    const renderTrashList = () => {
        const trashContainer = document.getElementById('trashList');
        const trashBadge = document.getElementById('trashBadge');
        const deletedJobs = JSON.parse(localStorage.getItem('viecgap_deleted_jobs') || '[]');

        if (trashBadge) {
            trashBadge.innerText = deletedJobs.length;
            if (deletedJobs.length > 0) trashBadge.classList.remove('hidden');
            else trashBadge.classList.add('hidden');
        }

        if (!trashContainer) return;

        if (deletedJobs.length === 0) {
            trashContainer.innerHTML = `<div class="text-center py-4 text-slate-400 text-xs">Thùng rác trống.</div>`;
            return;
        }

        trashContainer.innerHTML = deletedJobs.map(job => `
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 flex justify-between items-center text-xs mb-2">
                <div>
                    <h4 class="font-bold text-slate-800 text-sm">${job.title}</h4>
                    <p class="text-slate-500">${job.location} | Lương: ${job.salary}</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="window.handleRestoreJob('${job.id}')" class="bg-teal-100 text-teal-700 font-semibold px-2.5 py-1 rounded-lg">Khôi phục</button>
                    <button onclick="window.handlePermanentDeleteJob('${job.id}')" class="bg-red-100 text-red-700 font-semibold px-2.5 py-1 rounded-lg">Xóa hẳn</button>
                </div>
            </div>
        `).join('');
    };

    // --- RENDER BẢNG TIN CHÍNH (CÓ BẢO MẬT CHÍNH CHỦ) ---
    window.renderJobs = async () => {
        const jobListContainer = document.getElementById('jobList');
        const jobCountElement = document.getElementById('jobCount');
        if (!jobListContainer) return;

        const { data: jobs, error } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
        const currentUserPhone = localStorage.getItem('viecgap_user_phone');
        
        if (error || !jobs) return;

        if (jobCountElement) jobCountElement.innerText = jobs.length;

        if (jobs.length === 0) {
            jobListContainer.innerHTML = `<div class="text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200">Chưa có công việc nào. Hãy đăng việc ngay!</div>`;
            return;
        }

        jobListContainer.innerHTML = jobs.map(job => {
            const isOwner = currentUserPhone && job.phone === currentUserPhone;
            const dateStr = job.created_at ? new Date(job.created_at).toLocaleDateString('vi-VN') : 'Gần đây';

            let actionButtonHTML = '';
            let acceptedStatusHTML = '';

            if (job.status === 'accepted') {
                if (isOwner) {
                    // CHÍNH CHỦ THẤY: Hiện số điện thoại thợ nhận việc
                    acceptedStatusHTML = `
                        <div class="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex items-center justify-between">
                            <span class="text-emerald-800 font-medium"><i class="fa-solid fa-user-check mr-1"></i> Thợ nhận việc:</span>
                            <a href="tel:${job.accepted_by}" class="font-bold text-teal-700 hover:underline">📞 ${job.accepted_by}</a>
                        </div>
                    `;
                } else {
                    // USER KHÁC: Ẩn thông tin bảo mật
                    acceptedStatusHTML = `
                        <div class="mt-2 p-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-center justify-between">
                            <span><i class="fa-solid fa-lock mr-1 text-amber-500"></i> Công việc này đã có người nhận</span>
                            <span class="text-[10px] italic text-slate-400">(Thông tin bảo mật)</span>
                        </div>
                    `;
                }
            } else {
                actionButtonHTML = `
                    <button onclick="window.handleTakeJob('${job.id}')" class="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer text-xs flex items-center gap-1">
                        Nhận việc &rarr;
                    </button>
                `;
            }

            return `
                <div class="bg-white border border-slate-100 hover:border-teal-200 rounded-2xl p-4 shadow-sm transition flex flex-col justify-between gap-3">
                    <div class="flex justify-between items-start">
                        <div>
                            <div class="flex items-center gap-2 mb-1">
                                <span class="bg-teal-50 text-teal-700 text-[11px] font-semibold px-2 py-0.5 rounded-md uppercase">${job.category || 'Khác'}</span>
                                ${job.urgent ? '<span class="bg-amber-100 text-amber-700 text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"><i class="fa-solid fa-bolt text-[10px]"></i> Gấp</span>' : ''}
                            </div>
                            <h3 class="font-bold text-slate-900 text-base">${job.title}</h3>
                        </div>
                        <span class="text-teal-600 font-bold text-sm bg-teal-50 px-2.5 py-1 rounded-xl">${job.salary}</span>
                    </div>

                    ${acceptedStatusHTML}

                    <div class="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-50">
                        <div class="flex items-center gap-3">
                            <span><i class="fa-solid fa-location-dot text-slate-400 mr-1"></i>${job.location}</span>
                            <span><i class="fa-regular fa-clock text-slate-400 mr-1"></i>${dateStr}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            ${actionButtonHTML}
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
        renderApprovedWorkers();
        renderTrashList();
    };

    // --- CÁC HÀM XỬ LÝ SỰ KIỆN ---
    window.handleTakeJob = async (jobId) => {
        if (!checkLoginStatus()) {
            alert("Vui lòng đăng nhập trước khi nhận việc!");
            openAuthModal();
            return;
        }
        const currentUserPhone = localStorage.getItem('viecgap_user_phone');
        const { data: jobs } = await supabase.from('jobs').select('*').eq('id', jobId);
        if (!jobs || jobs.length === 0) return;

        const job = jobs[0];
        if (job.phone === currentUserPhone) {
            alert("Bạn không thể tự nhận công việc do chính mình đăng!");
            return;
        }

        if (confirm(`Xác nhận nhận việc: "${job.title}"?`)) {
            const { error } = await supabase.from('jobs').update({ status: 'accepted', accepted_by: currentUserPhone }).eq('id', jobId);
            if (!error) {
                alert("Nhận việc thành công!");
                window.renderJobs();
            }
        }
    };

    window.handleRemoveAcceptedJob = async (jobId) => {
        if (confirm("Hủy nhận công việc này?")) {
            const { error } = await supabase.from('jobs').update({ status: 'active', accepted_by: null }).eq('id', jobId);
            if (!error) {
                alert("Đã hủy nhận việc!");
                window.renderJobs();
            }
        }
    };

    window.handleDeleteJob = async (jobId) => {
        if (confirm("Xóa bài đăng này?")) {
            const { data: jobs } = await supabase.from('jobs').select('*').eq('id', jobId);
            if (jobs && jobs.length > 0) {
                const deletedJobs = JSON.parse(localStorage.getItem('viecgap_deleted_jobs') || '[]');
                deletedJobs.push({ ...jobs[0], deletedAt: new Date().toLocaleString('vi-VN') });
                localStorage.setItem('viecgap_deleted_jobs', JSON.stringify(deletedJobs));
            }
            const { error } = await supabase.from('jobs').delete().eq('id', jobId);
            if (!error) {
                alert("Đã xóa công việc!");
                window.renderJobs();
            }
        }
    };

    window.handleRestoreJob = async (jobId) => {
        let deletedJobs = JSON.parse(localStorage.getItem('viecgap_deleted_jobs') || '[]');
        const jobToRestore = deletedJobs.find(j => j.id === jobId);
        if (jobToRestore) {
            delete jobToRestore.deletedAt;
            await supabase.from('jobs').insert([jobToRestore]);
            deletedJobs = deletedJobs.filter(j => j.id !== jobId);
            localStorage.setItem('viecgap_deleted_jobs', JSON.stringify(deletedJobs));
            alert("Đã khôi phục bài đăng!");
            window.renderJobs();
        }
    };

    window.handlePermanentDeleteJob = (jobId) => {
        if (confirm("Xóa vĩnh viễn khỏi thùng rác?")) {
            let deletedJobs = JSON.parse(localStorage.getItem('viecgap_deleted_jobs') || '[]');
            deletedJobs = deletedJobs.filter(j => j.id !== jobId);
            localStorage.setItem('viecgap_deleted_jobs', JSON.stringify(deletedJobs));
            renderTrashList();
        }
    };

    // Đăng nhập form
    authForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const phone = document.getElementById('loginPhone')?.value;
        if (phone) {
            localStorage.setItem('viecgap_logged_in', 'true');
            localStorage.setItem('viecgap_user_phone', phone);
            alert('Đăng nhập thành công!');
            closeAuthModal();
            window.renderJobs();
        }
    });

    document.getElementById('btnLoginAccount')?.addEventListener('click', openAuthModal);
    document.getElementById('btnCloseAuthModal')?.addEventListener('click', closeAuthModal);
    document.getElementById('btnCancelAuthModal')?.addEventListener('click', closeAuthModal);

    // Đăng việc modal
    const postJobModal = document.getElementById('postJobModal');
    const postJobForm = document.getElementById('postJobForm');

    const openPostJob = () => {
        if (!checkLoginStatus()) {
            alert('Vui lòng đăng nhập trước khi đăng công việc!');
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

    postJobForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentUserPhone = localStorage.getItem('viecgap_user_phone') || '';
        const locationVal = selectedLocationText?.textContent || 'Toàn quốc';

        const newJob = {
            title: document.getElementById('jobTitleInput')?.value || 'Công việc mới',
            location: locationVal,
            category: document.getElementById('jobCategoryInput')?.value || 'Khác',
            salary: document.getElementById('jobSalaryInput')?.value || 'Thỏa thuận',
            urgent: document.getElementById('jobUrgentInput')?.checked || false,
            phone: currentUserPhone,
            status: 'active'
        };

        const { error } = await supabase.from('jobs').insert([newJob]);
        if (error) {
            alert("Lỗi đăng việc: " + error.message);
        } else {
            alert("Đăng việc thành công!");
            closePostJobModal();
            window.renderJobs();
        }
    });

    // Tổ chức & Thợ modal
    const orgModal = document.getElementById('orgModal');
    const orgForm = document.getElementById('orgForm');
    document.getElementById('btnJoinOrg')?.addEventListener('click', () => { orgModal?.classList.remove('hidden'); orgModal?.classList.add('flex'); });
    document.getElementById('btnCloseOrgModal')?.addEventListener('click', () => orgModal?.classList.add('hidden'));
    document.getElementById('btnCancelOrgModal')?.addEventListener('click', () => orgModal?.classList.add('hidden'));

    orgForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newOrg = {
            name: document.getElementById('orgNameInput')?.value,
            phone: document.getElementById('orgPhoneInput')?.value,
            province: document.getElementById('orgProvinceInput')?.value,
            district: document.getElementById('orgDistrictInput')?.value,
            address: document.getElementById('orgAddressInput')?.value,
            strength: document.getElementById('orgStrengthInput')?.value,
            status: 'pending'
        };
        const { error } = await supabase.from('organizations').insert([newOrg]);
        if (!error) {
            alert("Đã gửi hồ sơ tổ chức chờ Admin duyệt!");
            orgModal?.classList.add('hidden');
            orgForm.reset();
        }
    });

    const workerModal = document.getElementById('workerModal');
    const workerForm = document.getElementById('workerForm');
    document.getElementById('btnRegisterWorker')?.addEventListener('click', () => { workerModal?.classList.remove('hidden'); workerModal?.classList.add('flex'); });
    document.getElementById('btnCloseWorkerModal')?.addEventListener('click', () => workerModal?.classList.add('hidden'));
    document.getElementById('btnCancelWorkerModal')?.addEventListener('click', () => workerModal?.classList.add('hidden'));

    workerForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newWorker = {
            name: document.getElementById('workerNameInput')?.value,
            phone: document.getElementById('workerPhoneInput')?.value,
            location: document.getElementById('workerLocationInput')?.value,
            skill: document.getElementById('workerSkillInput')?.value,
            status: 'pending'
        };
        const { error } = await supabase.from('workers').insert([newWorker]);
        if (!error) {
            alert("Đã gửi hồ sơ thợ chờ Admin duyệt!");
            workerModal?.classList.add('hidden');
            workerForm.reset();
        }
    });

    // Chuyển tab
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            if (!tabId) return;
            document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
            document.getElementById(tabId)?.classList.remove('hidden');

            document.querySelectorAll('.nav-btn').forEach(b => {
                b.classList.remove('bg-teal-600', 'text-white', 'shadow-sm');
                b.classList.add('bg-white', 'text-slate-700', 'border', 'border-slate-200');
            });
            btn.classList.add('bg-teal-600', 'text-white', 'shadow-sm');
            btn.classList.remove('bg-white', 'text-slate-700', 'border', 'border-slate-200');

            if (tabId === 'tabAcceptedJob') renderAcceptedJobs();
            else if (tabId === 'tabOrganization') renderApprovedOrgs();
            else if (tabId === 'tabWorker') renderApprovedWorkers();
        });
    });

    // Khởi chạy
    window.renderJobs();

    // Realtime sync
    supabase.channel('public:app_live_sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => window.renderJobs())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'organizations' }, () => renderApprovedOrgs())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'workers' }, () => renderApprovedWorkers())
        .subscribe();
});