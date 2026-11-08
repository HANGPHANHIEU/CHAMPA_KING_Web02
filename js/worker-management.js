import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { handleCompleteJobWithCommission } from './commission.js';

// --- CẤU HÌNH SUPABASE ---
const SUPABASE_URL = 'https://rznzypehvmwysxmjxxxp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6bnp5cGVodm13eXN4bWp4eHhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzNTkxNTYsImV4cCI6MjEwODkzNTE1Nn0.B-5onxhT0EoqgtJ0ZP-ZbGSz4Gmo7xuRPEcsAYz65wA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
    console.log("--- BẢNG QUẢN LÝ ADMIN ĐÃ KHỞI ĐỘNG CHÍNH XÁC ---");

    const acceptedJobListManagement = document.getElementById('acceptedJobListManagement');
    const activeJobCountBadge = document.getElementById('activeJobCountBadge');
    
    const adminLoginSection = document.getElementById('adminLoginSection');
    const adminPanel = document.getElementById('adminPanel');
    const adminPasswordInput = document.getElementById('adminPasswordInput');
    const btnAdminLogout = document.getElementById('btnAdminLogout');
    
    const pendingWorkerList = document.getElementById('pendingWorkerList');
    const pendingOrgList = document.getElementById('pendingOrgList');
    const pendingTotalBadge = document.getElementById('pendingTotalBadge');

    // --- 1. TẢI VIỆC Đang THỰC HIỆN & RENDER NÚT HOÀN TẤT ---
    window.loadManagementData = async () => {
        const { data: jobs, error } = await supabase
            .from('jobs')
            .select('*')
            .eq('status', 'accepted')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Lỗi tải việc đang thực hiện:", error.message);
            return;
        }

        const activeJobs = jobs || [];
        if (activeJobCountBadge) {
            activeJobCountBadge.textContent = `Đang thực hiện: ${activeJobs.length}`;
        }

        if (activeJobs.length === 0) {
            acceptedJobListManagement.innerHTML = `
                <div class="text-center py-8 text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    Hiện chưa có công việc nào đang có thợ nhận thực hiện.
                </div>
            `;
            return;
        }

        acceptedJobListManagement.innerHTML = activeJobs.map(job => `
            <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                <div>
                    <div class="flex items-center gap-2">
                        <span class="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">${job.category || 'Service'}</span>
                        <span class="text-slate-400 text-[10px]">Lương: <strong class="text-teal-700">${job.salary}</strong></span>
                    </div>
                    <h4 class="font-bold text-slate-900 text-sm mt-1">${job.title}</h4>
                    <p class="text-slate-500 mt-0.5">📍 Khu vực: ${job.location || 'Châu Thành'}</p>
                </div>

                <div class="flex flex-col sm:flex-row items-end sm:items-center gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div class="bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs">
                        <span class="text-teal-800 font-semibold"><i class="fa-solid fa-user-check mr-1"></i> Thợ nhận:</span>
                        <a href="tel:${job.accepted_by}" class="font-bold text-teal-700 hover:underline">📞 ${job.accepted_by}</a>
                    </div>

                    <button onclick="window.completeJobFromManagement('${job.id}', '${job.salary}')" class="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl font-bold transition text-xs flex items-center gap-1.5 shadow cursor-pointer">
                        <i class="fa-solid fa-circle-check"></i> Hoàn tất (Thu 1% Phí)
                    </button>
                </div>
            </div>
        `).join('');
    };

    window.completeJobFromManagement = (jobId, salaryStr) => {
        handleCompleteJobWithCommission(jobId, salaryStr, () => {
            window.loadManagementData();
        });
    };

    // --- 2. XÁC THỰC ADMIN & HÀM MỞ KHÓA GẮN TRỰC TIẾP ---
    const checkAdminSession = () => {
        const isAdmin = sessionStorage.getItem('viecgap_admin_logged') === 'true';
        if (isAdmin) {
            adminLoginSection?.classList.add('hidden');
            adminPanel?.classList.remove('hidden');
            loadAllPendingProfiles();
        } else {
            adminLoginSection?.classList.remove('hidden');
            adminPanel?.classList.add('hidden');
        }
    };

    // Khai báo hàm window.tryUnlockAdmin để nút HTML gọi trực tiếp
    window.tryUnlockAdmin = () => {
        const pass = adminPasswordInput?.value?.trim();
        if (pass === 'admin123' || pass === '123456') {
            sessionStorage.setItem('viecgap_admin_logged', 'true');
            alert('🔓 Đăng nhập quyền Admin thành công!');
            checkAdminSession();
        } else {
            alert('❌ Mật khẩu Admin không chính xác! (Mật khẩu mặc định: admin123)');
        }
    };

    btnAdminLogout?.addEventListener('click', () => {
        sessionStorage.removeItem('viecgap_admin_logged');
        if (adminPasswordInput) adminPasswordInput.value = '';
        checkAdminSession();
    });

    // Hàm tải toàn bộ hồ sơ chờ duyệt (Thợ + Tổ chức)
    const loadAllPendingProfiles = async () => {
        const { data: workers } = await supabase.from('workers').select('*').eq('status', 'pending');
        const { data: orgs } = await supabase.from('organizations').select('*').eq('status', 'pending');

        const pendingWorkers = workers || [];
        const pendingOrgs = orgs || [];

        if (pendingTotalBadge) {
            pendingTotalBadge.textContent = `Chờ duyệt: ${pendingWorkers.length + pendingOrgs.length}`;
        }

        // Render Thợ chờ duyệt
        if (pendingWorkers.length === 0) {
            pendingWorkerList.innerHTML = `<div class="text-center py-3 text-slate-400 text-xs bg-slate-50 rounded-xl">Không có hồ sơ thợ nào chờ duyệt.</div>`;
        } else {
            pendingWorkerList.innerHTML = pendingWorkers.map(w => `
                <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 flex justify-between items-center text-xs">
                    <div>
                        <strong class="text-slate-900">${w.name}</strong> - 📞 <a href="tel:${w.phone}" class="font-bold text-teal-700">${w.phone}</a><br>
                        <span class="text-slate-500">📍 ${w.location || 'Châu Thành'} | 🛠️ ${w.skill || 'Tự do'}</span>
                    </div>
                    <button onclick="window.approveWorker('${w.id}')" class="bg-teal-600 hover:bg-teal-700 text-white font-bold px-3 py-1.5 rounded-lg shadow cursor-pointer">
                        Duyệt cá nhân
                    </button>
                </div>
            `).join('');
        }

        // Render Tổ chức chờ duyệt
        if (pendingOrgs.length === 0) {
            pendingOrgList.innerHTML = `<div class="text-center py-3 text-slate-400 text-xs bg-slate-50 rounded-xl">Không có hồ sơ tổ chức nào chờ duyệt.</div>`;
        } else {
            pendingOrgList.innerHTML = pendingOrgs.map(o => `
                <div class="bg-amber-50/60 border border-amber-200 rounded-xl p-3 flex justify-between items-center text-xs">
                    <div>
                        <strong class="text-slate-900">${o.name}</strong> - 📞 <a href="tel:${o.phone}" class="font-bold text-teal-700">${o.phone}</a><br>
                        <span class="text-slate-600">📍 ${o.province || ''} ${o.district || ''} | ⭐ Thế mạnh: ${o.strength || 'N/A'}</span>
                    </div>
                    <button onclick="window.approveOrg('${o.id}')" class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg shadow cursor-pointer">
                        Duyệt tổ chức
                    </button>
                </div>
            `).join('');
        }
    };

    // Hàm phê duyệt Cá nhân
    window.approveWorker = async (workerId) => {
        const { error } = await supabase.from('workers').update({ status: 'approved' }).eq('id', workerId);
        if (!error) {
            alert('✅ Đã phê duyệt hồ sơ thợ thành công!');
            loadAllPendingProfiles();
        } else {
            alert('❌ Lỗi phê duyệt: ' + error.message);
        }
    };

    // Hàm phê duyệt Tổ chức
    window.approveOrg = async (orgId) => {
        const { error } = await supabase.from('organizations').update({ status: 'approved' }).eq('id', orgId);
        if (!error) {
            alert('✅ Đã phê duyệt hồ sơ tổ chức thành công!');
            loadAllPendingProfiles();
        } else {
            alert('❌ Lỗi phê duyệt: ' + error.message);
        }
    };

    // Khởi chạy
    window.loadManagementData();
    checkAdminSession();

    // Realtime Sync
    supabase.channel('public:admin_management_sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => window.loadManagementData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'workers' }, () => loadAllPendingProfiles())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'organizations' }, () => loadAllPendingProfiles())
        .subscribe();
});