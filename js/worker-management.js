import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- CẤU HÌNH SUPABASE ---
const SUPABASE_URL = 'https://rznzypehvmwysxmjxxxp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6bnp5cGVodm13eXN4bWp4eHhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzNTkxNTYsImV4cCI6MjEwODkzNTE1Nn0.B-5onxhT0EoqgtJ0ZP-ZbGSz4Gmo7xuRPEcsAYz65wA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ADMIN_PASSWORD = "123";

document.addEventListener('DOMContentLoaded', () => {
    console.log("--- TRANG QUẢN LÝ NHÂN SỰ & DANH SÁCH NHẬN VIỆC ĐÃ KHỞI ĐỘNG ---");

    const acceptedContainer = document.getElementById('acceptedJobsListContainer');
    const totalAcceptedCountEl = document.getElementById('totalAcceptedJobsCount');
    
    const evalContainer = document.getElementById('workerEvaluationList');
    const totalApprovedWorkersCountEl = document.getElementById('totalApprovedWorkersCount');
    const adminEvalSection = document.getElementById('adminEvalSection'); // Section đánh giá thợ của admin

    const currentUserPhone = localStorage.getItem('viecgap_user_phone') || '';
    let isAdmin = sessionStorage.getItem('admin_authenticated') === 'true';

    // --- 1. TẢI DANH SÁCH VIỆC ĐÃ CÓ NGƯỜI NHẬN ---
    // (Nếu là Admin: Xem tất cả | Nếu là Người đăng việc: Chỉ xem việc do mình đăng)
    window.loadAcceptedJobsData = async () => {
        if (!acceptedContainer) return;

        try {
            const { data: jobs, error } = await supabase
                .from('jobs')
                .select('*')
                .eq('status', 'accepted')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Lọc danh sách: Admin thấy hết, Người đăng việc chỉ thấy bài của mình
            let filteredJobs = jobs || [];
            if (!isAdmin) {
                filteredJobs = (jobs || []).filter(j => j.phone === currentUserPhone);
            }

            if (totalAcceptedCountEl) {
                totalAcceptedCountEl.textContent = filteredJobs.length;
            }

            if (filteredJobs.length === 0) {
                acceptedContainer.innerHTML = `
                    <div class="text-center py-8 text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        ${isAdmin ? 'Chưa có công việc nào có người nhận.' : 'Chưa có thợ nào nhận công việc do bạn đăng (hoặc bạn chưa đăng nhập).'}
                    </div>
                `;
                return;
            }

            acceptedContainer.innerHTML = filteredJobs.map(job => `
                <div class="p-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs mb-2">
                    <div>
                        <span class="bg-teal-50 text-teal-700 font-semibold px-2 py-0.5 rounded uppercase text-[10px]">${job.category || 'Khác'}</span>
                        <h4 class="font-bold text-slate-900 text-sm mt-1">${job.title || 'Công việc'}</h4>
                        <p class="text-slate-500 mt-0.5">
                            <i class="fa-solid fa-location-dot text-slate-400 mr-1"></i> ${job.location || 'Châu Thành'} &bull; 
                            <span class="text-teal-600 font-semibold ml-1">Lương: ${job.salary || 'Thỏa thuận'}</span>
                        </p>
                    </div>
                    <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex flex-col items-start sm:items-end gap-1 w-full sm:w-auto">
                        <div class="flex items-center gap-1.5 text-emerald-800 font-medium">
                            <i class="fa-solid fa-user-check text-emerald-600"></i> Thợ nhận việc: 
                            <a href="tel:${job.accepted_by}" class="text-teal-700 font-bold hover:underline">📞 ${job.accepted_by || 'Không rõ SĐT'}</a>
                        </div>
                    </div>
                </div>
            `).join('');
        } catch (err) {
            console.warn("Lỗi tải danh sách nhận việc:", err.message);
        }
    };

    // --- 2. TẢI DANH SÁCH ĐÁNH GIÁ THỢ (CHỈ DÀNH CHO ADMIN) ---
    window.loadWorkersForEvaluation = async () => {
        if (!evalContainer) return;

        // Nếu chưa đăng nhập Admin thì ẩn phần đánh giá hoặc yêu cầu xác nhận khi bấm vào
        if (!isAdmin) {
            evalContainer.innerHTML = `
                <div class="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 col-span-2">
                    <p class="text-xs text-slate-500 mb-2">🔒 Phần quản lý và đánh giá thợ dành riêng cho Quản trị viên (Admin).</p>
                    <button id="btnAdminUnlock" class="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-xl transition cursor-pointer">
                        Nhập mật khẩu Admin để mở khóa
                    </button>
                </div>
            `;
            
            document.getElementById('btnAdminUnlock')?.addEventListener('click', () => {
                const inputPass = prompt("🔑 Nhập mật khẩu Quản trị viên (Admin):");
                if (inputPass === ADMIN_PASSWORD) {
                    sessionStorage.setItem('admin_authenticated', 'true');
                    isAdmin = true;
                    alert("Đã mở khóa quyền Admin!");
                    window.loadAcceptedJobsData();
                    window.loadWorkersForEvaluation();
                } else {
                    alert("❌ Mật khẩu sai!");
                }
            });
            return;
        }

        try {
            const { data: workers, error } = await supabase.from('workers').select('*').order('created_at', { ascending: false });
            if (error) throw error;

            const approvedWorkers = (workers || []).filter(w => !w.status || w.status === 'approved');
            if (totalApprovedWorkersCountEl) totalApprovedWorkersCountEl.textContent = approvedWorkers.length;

            if (approvedWorkers.length === 0) {
                evalContainer.innerHTML = `<div class="text-center py-6 text-slate-400 text-xs col-span-2">Chưa có thợ nào trên hệ thống.</div>`;
                return;
            }

            evalContainer.innerHTML = approvedWorkers.map(w => `
                <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between gap-3">
                    <div>
                        <div class="flex justify-between items-start">
                            <div>
                                <span class="bg-teal-50 text-teal-700 text-[10px] font-semibold px-2 py-0.5 rounded uppercase">${w.location || 'Châu Thành'}</span>
                                <h3 class="font-bold text-slate-900 text-base mt-1">${w.name || 'Thợ tự do'}</h3>
                            </div>
                            <a href="tel:${w.phone}" class="text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold px-3 py-1.5 rounded-xl transition">
                                📞 ${w.phone || 'N/A'}
                            </a>
                        </div>
                        <div class="mt-3 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-2">
                            <p><strong>Sở trường:</strong> ${w.strength || 'Chưa cập nhật'}</p>
                            <p><strong>Công cụ:</strong> ${w.tools || 'Chưa cập nhật'}</p>
                            <p><strong>Đánh giá:</strong> <span class="italic text-slate-700">${w.review || 'Chưa có đánh giá.'}</span></p>
                        </div>
                    </div>
                </div>
            `).join('');
        } catch (err) {
            console.error("Lỗi tải thợ:", err.message);
        }
    };

    // --- CHẠY LẦN ĐẦU ---
    window.loadAcceptedJobsData();
    window.loadWorkersForEvaluation();

    // Realtime đồng bộ
    supabase.channel('public:worker_management_sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => window.loadAcceptedJobsData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'workers' }, () => window.loadWorkersForEvaluation())
        .subscribe();
});