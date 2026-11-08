import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- CẤU HÌNH SUPABASE ---
const SUPABASE_URL = 'https://rznzypehvmwysxmjxxxp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6bnp5cGVodm13eXN4bWp4eHhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzNTkxNTYsImV4cCI6MjEwODkzNTE1Nn0.B-5onxhT0EoqgtJ0ZP-ZbGSz4Gmo7xuRPEcsAYz65wA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Tách con số từ chuỗi lương và tính 1%
 */
function parseSalaryAndCommission(salaryStr) {
    if (!salaryStr) return { numericSalary: 0, commission: 0 };

    let numericSalary = parseInt(salaryStr.replace(/\D/g, '')) || 0;
    if (salaryStr.toLowerCase().includes('k') && numericSalary < 1000) {
        numericSalary *= 1000;
    }

    const commission = Math.round(numericSalary * 0.01);
    return { numericSalary, commission };
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log("--- BẢNG HOA HỒNG 1% ĐÃ KHỞI ĐỘNG ---");

    const commissionListContainer = document.getElementById('commissionList');
    const totalCommissionEl = document.getElementById('totalCommission');
    const totalCompletedJobsEl = document.getElementById('totalCompletedJobs');

    // Tải toàn bộ danh sách công việc đã hoàn tất (status = 'completed')
    const loadCommissionData = async () => {
        const { data: jobs, error } = await supabase
            .from('jobs')
            .select('*')
            .eq('status', 'completed')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Lỗi tải dữ liệu hoa hồng:", error.message);
            return;
        }

        let totalCommissionSum = 0;
        const completedJobs = jobs || [];

        if (totalCompletedJobsEl) {
            totalCompletedJobsEl.textContent = completedJobs.length;
        }

        if (completedJobs.length === 0) {
            commissionListContainer.innerHTML = `
                <div class="text-center py-8 text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    Chưa có công việc nào ở trạng thái Hoàn tất.
                </div>
            `;
            if (totalCommissionEl) totalCommissionEl.textContent = '0đ';
            return;
        }

        commissionListContainer.innerHTML = completedJobs.map(job => {
            const { numericSalary, commission } = parseSalaryAndCommission(job.salary || '0');
            totalCommissionSum += commission;

            const dateStr = job.created_at ? new Date(job.created_at).toLocaleDateString('vi-VN') : 'Gần đây';

            return `
                <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded">${job.category || 'Khác'}</span>
                            <span class="text-slate-400 text-[10px]"><i class="fa-regular fa-clock mr-1"></i>${dateStr}</span>
                        </div>
                        <h4 class="font-bold text-slate-900 text-sm mt-1">${job.title}</h4>
                        <p class="text-slate-500 mt-0.5">
                            📍 Khu vực: ${job.location || 'Châu Thành'} &bull; 
                            📞 Người nhận: <a href="tel:${job.accepted_by}" class="font-bold text-teal-700">${job.accepted_by || 'Chưa cập nhật'}</a>
                        </p>
                    </div>

                    <div class="bg-white border border-slate-200 rounded-xl p-3 flex flex-col items-start sm:items-end w-full sm:w-auto shadow-sm">
                        <span class="text-slate-600 font-semibold">Lương: <strong class="text-slate-900">${numericSalary > 0 ? numericSalary.toLocaleString('vi-VN') + 'đ' : job.salary}</strong></span>
                        <span class="text-emerald-600 font-bold text-sm mt-0.5">
                            <i class="fa-solid fa-coins mr-1"></i>Phí 1%: ${commission > 0 ? commission.toLocaleString('vi-VN') + 'đ' : 'Chưa tính'}
                        </span>
                    </div>
                </div>
            `;
        }).join('');

        if (totalCommissionEl) {
            totalCommissionEl.textContent = totalCommissionSum.toLocaleString('vi-VN') + 'đ';
        }
    };

    // Tải dữ liệu ban đầu
    loadCommissionData();

    // Lắng nghe Realtime để cập nhật khi có bài hoàn tất mới
    supabase.channel('public:commission_live_sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => {
            loadCommissionData();
        })
        .subscribe();
});