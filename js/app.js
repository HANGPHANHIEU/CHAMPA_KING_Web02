import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- CẤU HÌNH SUPABASE ---
const SUPABASE_URL = 'https://rznzypehvmwysxmjxxxp.supabase.co'; // Thay bằng URL dự án Supabase của bạn
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6bnp5cGVodm13eXN4bWp4eHhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzNTkxNTYsImV4cCI6MjEwODkzNTE1Nn0.B-5onxhT0EoqgtJ0ZP-ZbGSz4Gmo7xuRPEcsAYz65wA'; // Thay bằng ANON KEY của bạn

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
    console.log("--- HỆ THỐNG 'VIỆC GẤP' ĐÃ KHỞI ĐỘNG (SUPABASE & REALTIME) ---");

    // 1. Dọn dẹp tất cả modal bị kẹt khi mới tải trang
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

    // Kiểm tra trạng thái đăng nhập từ LocalStorage & cập nhật icon đăng xuất
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

    // --- HÀM RENDER DANH SÁCH TỔ CHỨC ĐÃ ĐƯỢC DUYỆT (TAB TỔ CHỨC) ---
    const renderApprovedOrgs = async () => {
        const orgListContainer = document.getElementById('orgList');
        if (!orgListContainer) return;

        const { data: approvedOrgs, error } = await supabase
            .from('organizations')
            .select('*')
            .eq('status', 'approved')
            .order('created_at', { ascending: false });

        if (error || !approvedOrgs || approvedOrgs.length === 0) {
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

    // --- HÀM RENDER DANH SÁCH CÁ NHÂN ĐÃ ĐƯỢC DUYỆT (ĐÃ BỔ SUNG HOÀN CHỈNH) ---
    const renderApprovedWorkers = async () => {
        const workerListContainer = document.getElementById('workerList');
        if (!workerListContainer) return;

        const { data: approvedWorkers, error } = await supabase
            .from('workers')
            .select('*')
            .eq('status', 'approved')
            .order('created_at', { ascending: false });

        if (error || !approvedWorkers || approvedWorkers.length === 0) {
            workerListContainer.innerHTML = `
                <div class="text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    Chưa có hồ sơ cá nhân nào được phê duyệt.
                </div>
            `;
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

    // --- HÀM RENDER DANH SÁCH VIỆC LÀM ĐÃ NHẬN (TAB 2) ---
    const renderAcceptedJobs = async () => {
        const acceptedContainer = document.getElementById('acceptedJobList');
        if (!acceptedContainer) return;

        const currentUserPhone = localStorage.getItem('viecgap_user_phone');
        const { data: jobs, error } = await supabase.from('jobs').select('*');

        if (error || !jobs) return;
        
        const myAcceptedJobs = jobs.filter(job => job.status === 'accepted' && job.accepted_by === currentUserPhone);

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
            if (deletedJobs.length > 0) {
                trashBadge.classList.remove('hidden');
            } else {
                trashBadge.classList.add('hidden');
            }
        }

        if (!trashContainer) return;

        if (deletedJobs.length === 0) {
            trashContainer.innerHTML = `
                <div class="text-center py-8 text-slate-400 text-sm bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <i class="fa-solid fa-trash-can text-2xl text-slate-300 mb-2 block"></i>
                    Thùng rác trống. Chưa có bài đăng nào bị xóa.
                </div>
            `;
            return;
        }

        trashContainer.innerHTML = deletedJobs.map(job => `
            <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs mb-2">
                <div>
                    <h4 class="font-bold text-slate-800 text-sm">${job.title}</h4>
                    <p class="text-slate-500 mt-0.5">Khu vực: ${job.location} | Lương: ${job.salary} | Ngày xóa: ${job.deletedAt || 'Vừa xong'}</p>
                </div>
                <div class="flex items-center gap-2 self-end sm:self-center">
                    <button onclick="window.handleRestoreJob('${job.id}')" class="bg-teal-100 hover:bg-teal-200 text-teal-700 font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer">
                        <i class="fa-solid fa-rotate-left"></i> Khôi phục
                    </button>
                    <button onclick="window.handlePermanentDeleteJob('${job.id}')" class="bg-red-100 hover:bg-red-200 text-red-700 font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer">
                        <i class="fa-solid fa-xmark"></i> Xóa hẳn
                    </button>
                </div>
            </div>
        `).join('');
    };

    // --- HÀM RENDER DANH SÁCH VIỆC LÀM RA GIAO DIỆN CHÍNH ---
    window.renderJobs = async () => {
        const jobListContainer = document.getElementById('jobList');
        const jobCountElement = document.getElementById('jobCount');
        if (!jobListContainer) return;

        const { data: jobs, error } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
        const currentUserPhone = localStorage.getItem('viecgap_user_phone');
        
        if (error || !jobs) return;

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
            const dateStr = job.created_at ? new Date(job.created_at).toLocaleDateString('vi-VN') : 'Gần đây';

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
                            <span><i class="fa-regular fa-clock text-slate-400 mr-1"></i>${dateStr}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <button onclick="window.handleTakeJob('${job.id}')" class="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer text-xs flex items-center gap-1">
                                Nhận việc &rarr;
                            </button>
                            ${isOwner ? `
                                <button onclick="window.handleDeleteJob('${job.id}')" class="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer text-xs flex items-center gap-1" title="Xóa bài">
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

    // --- LOGIC NHẬN VIỆC ---
    window.handleTakeJob = async (jobId) => {
        if (!checkLoginStatus()) {
            alert("Vui lòng đăng nhập tài khoản trước khi nhận việc!");
            openAuthModal();
            return;
        }

        const currentUserPhone = localStorage.getItem('viecgap_user_phone');
        const { data: jobs } = await supabase.from('jobs').select('*').eq('id', jobId);
        if (!jobs || jobs.length === 0) {
            alert("Công việc không tồn tại hoặc đã bị xóa!");
            return;
        }

        const job = jobs[0];
        if (job.phone === currentUserPhone) {
            alert("Bạn không thể tự nhận công việc do chính mình đăng!");
            return;
        }

        if (confirm(`Bạn có chắc chắn muốn nhận công việc: "${job.title}"?`)) {
            const { error } = await supabase.from('jobs').update({ status: 'accepted', accepted_by: currentUserPhone }).eq('id', jobId);
            if (error) {
                alert("Lỗi khi nhận việc: " + error.message);
            } else {
                alert("Nhận việc thành công! Bạn có thể xem lại ở tab 'Đã nhận'.");
                window.renderJobs();
            }
        }
    };

    // --- LOGIC HỦY NHẬN VIỆC ---
    window.handleRemoveAcceptedJob = async (jobId) => {
        if (confirm("Bạn có chắc chắn muốn hủy nhận công việc này không? Công việc sẽ quay lại danh sách tìm việc.")) {
            const { error } = await supabase.from('jobs').update({ status: 'active', accepted_by: null }).eq('id', jobId);
            if (!error) {
                alert("Đã hủy nhận công việc thành công!");
                window.renderJobs();
            }
        }
    };

    // --- LOGIC XÓA BÀI ĐĂNG ---
    window.handleDeleteJob = async (jobId) => {
        if (confirm("Bạn có chắc chắn muốn xóa bài đăng này không?")) {
            const { error } = await supabase.from('jobs').delete().eq('id', jobId);
            if (!error) {
                alert("Đã xóa công việc thành công!");
                window.renderJobs();
            }
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

    orgForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newOrg = {
            name: document.getElementById('orgNameInput')?.value,
            phone: document.getElementById('orgPhoneInput')?.value,
            province: document.getElementById('orgProvinceInput')?.value,
            district: document.getElementById('orgDistrictInput')?.value,
            ward: document.getElementById('orgWardInput')?.value,
            address: document.getElementById('orgAddressInput')?.value,
            strength: document.getElementById('orgStrengthInput')?.value,
            status: 'pending'
        };

        const { error } = await supabase.from('organizations').insert([newOrg]);
        if (error) {
            alert("Lỗi ghi danh: " + error.message);
        } else {
            alert("Ghi danh Tổ chức thành công! Hồ sơ đang chờ Admin phê duyệt.");
            closeOrgModal();
        }
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
        if (error) {
            alert("Lỗi đăng ký: " + error.message);
        } else {
            alert("Đăng ký hồ sơ cá nhân thành công! Hồ sơ đang chờ Admin phê duyệt.");
            closeWorkerModal();
        }
    });

    // --- ĐĂNG NHẬP ---
    authForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const phone = document.getElementById('loginPhone')?.value;
        if (phone) {
            localStorage.setItem('viecgap_logged_in', 'true');
            localStorage.setItem('viecgap_user_phone', phone);
            if (loginBtnText) {
                loginBtnText.innerHTML = `<i class="fa-solid fa-right-from-bracket mr-1.5"></i> Đăng xuất`;
            }
            alert('Đăng nhập thành công!');
            closeAuthModal();
            window.renderJobs();
        }
    });

    document.getElementById('btnLoginAccount')?.addEventListener('click', openAuthModal);
    document.getElementById('btnCloseAuthModal')?.addEventListener('click', closeAuthModal);
    document.getElementById('btnCancelAuthModal')?.addEventListener('click', closeAuthModal);

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

    postJobForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const currentUserPhone = localStorage.getItem('viecgap_user_phone') || '';

        const newJob = {
            title: document.getElementById('jobTitleInput')?.value || 'Công việc mới',
            location: document.getElementById('jobLocationInput')?.value || 'Châu Thành',
            category: document.getElementById('jobCategoryInput')?.value || 'delivery',
            salary: document.getElementById('jobSalaryInput')?.value || 'Thỏa thuận',
            urgent: document.getElementById('jobUrgentInput')?.checked || false,
            phone: currentUserPhone,
            status: 'active'
        };

        const { error } = await supabase.from('jobs').insert([newJob]);
        if (error) {
            alert("Lỗi đăng việc: " + error.message);
        } else {
            closePostJobModal();
            window.renderJobs();
        }
    });

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
            } else if (tabId === 'tabWorker') {
                renderApprovedWorkers();
            }
        });
    });

    // --- LẮNG NGHE SUPABASE REALTIME (ĐỒNG BỘ ĐA THIẾT BỊ) ---
    supabase
        .channel('public:viecgap_live_sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'organizations' }, () => {
            renderApprovedOrgs();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'workers' }, () => {
            renderApprovedWorkers();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => {
            window.renderJobs();
        })
        .subscribe();
});