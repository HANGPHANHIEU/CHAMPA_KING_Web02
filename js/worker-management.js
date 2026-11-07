import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- CẤU HÌNH SUPABASE ---
const SUPABASE_URL = 'https://rznzypehvmwysxmjxxxp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6bnp5cGVodm13eXN4bWp4eHhwIiwicm9sZSI6InJ6bnp5cGVodm13eXN4bWp4eHhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzNTkxNTYsImV4cCI6MjEwODkzNTE1Nn0.B-5onxhT0EoqgtJ0ZP-ZbGSz4Gmo7xuRPEcsAYz65wA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
    console.log("--- TRANG QUẢN LÝ NHÂN SỰ & ĐÁNH GIÁ ĐÃ KHỞI ĐỘNG ---");

    const acceptedContainer = document.getElementById('acceptedJobsListContainer');
    const totalAcceptedCountEl = document.getElementById('totalAcceptedJobsCount');
    
    const evalContainer = document.getElementById('workerEvaluationList');
    const totalApprovedWorkersCountEl = document.getElementById('totalApprovedWorkersCount');
    
    const evalModal = document.getElementById('evalModal');
    const evalForm = document.getElementById('evalForm');

    // --- 1. TẢI DANH SÁCH VIỆC ĐÃ CÓ NGƯỜI NHẬN ---
    window.loadAcceptedJobsData = async () => {
        if (!acceptedContainer) return;

        const { data: jobs, error } = await supabase
            .from('jobs')
            .select('*')
            .eq('status', 'accepted')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Lỗi tải việc đã nhận:", error.message);
            acceptedContainer.innerHTML = `<p class="text-center py-4 text-red-500 text-xs">Lỗi khi tải dữ liệu việc làm.</p>`;
            return;
        }

        if (totalAcceptedCountEl) {
            totalAcceptedCountEl.textContent = jobs ? jobs.length : 0;
        }

        if (!jobs || jobs.length === 0) {
            acceptedContainer.innerHTML = `
                <div class="text-center py-6 text-slate-400 text-xs">
                    Chưa có công việc nào có người nhận thực hiện.
                </div>
            `;
            return;
        }

        acceptedContainer.innerHTML = jobs.map(job => `
            <div class="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                <div>
                    <span class="bg-teal-50 text-teal-700 font-semibold px-2 py-0.5 rounded uppercase text-[10px]">${job.category || 'Khác'}</span>
                    <h4 class="font-bold text-slate-900 text-sm mt-1">${job.title}</h4>
                    <p class="text-slate-500 mt-0.5">
                        <i class="fa-solid fa-location-dot text-slate-400 mr-1"></i> ${job.location} &bull; 
                        <span class="text-teal-600 font-semibold ml-1">Lương: ${job.salary}</span>
                    </p>
                </div>
                <div class="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex flex-col items-start sm:items-end gap-1 w-full sm:w-auto">
                    <div class="flex items-center gap-1.5 text-slate-700 font-semibold">
                        <i class="fa-solid fa-user-check text-emerald-600"></i> Người nhận: 
                        <a href="tel:${job.accepted_by}" class="text-teal-600 hover:underline font-bold">${job.accepted_by || 'Không rõ SĐT'}</a>
                    </div>
                </div>
            </div>
        `).join('');
    };

    // --- 2. TẢI DANH SÁCH HỒ SƠ THỢ ĐỂ ĐÁNH GIÁ, XEM SỞ TRƯỜNG, CÔNG CỤ ---
    window.loadWorkersForEvaluation = async () => {
        if (!evalContainer) return;

        const { data: workers, error } = await supabase
            .from('workers')
            .select('*')
            .eq('status', 'approved')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Lỗi tải thợ:", error.message);
            evalContainer.innerHTML = `<p class="text-center py-6 text-red-500 text-xs col-span-2">Lỗi khi tải hồ sơ thợ.</p>`;
            return;
        }

        if (totalApprovedWorkersCountEl) {
            totalApprovedWorkersCountEl.textContent = workers ? workers.length : 0;
        }

        if (!workers || workers.length === 0) {
            evalContainer.innerHTML = `
                <div class="text-center py-10 text-slate-400 text-xs bg-white rounded-2xl border border-dashed border-slate-200 col-span-2">
                    Chưa có hồ sơ nhân sự nào được phê duyệt.
                </div>
            `;
            return;
        }

        evalContainer.innerHTML = workers.map(w => `
            <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between gap-3">
                <div>
                    <div class="flex justify-between items-start">
                        <div>
                            <span class="bg-teal-50 text-teal-700 text-[10px] font-semibold px-2 py-0.5 rounded uppercase">${w.location || 'Châu Thành'}</span>
                            <h3 class="font-bold text-slate-900 text-base mt-1">${w.name}</h3>
                        </div>
                        <a href="tel:${w.phone}" class="text-xs bg-teal-600 hover:bg-teal-700 text-white font-semibold px-3 py-1.5 rounded-xl transition flex items-center gap-1">
                            <i class="fa-solid fa-phone"></i> ${w.phone}
                        </a>
                    </div>

                    <div class="mt-3 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-2">
                        <p><strong><i class="fa-solid fa-briefcase text-teal-600 mr-1"></i> Kỹ năng đăng ký:</strong> ${w.skill || 'Chưa cập nhật'}</p>
                        <p><strong><i class="fa-solid fa-bolt text-amber-500 mr-1"></i> Sở trường:</strong> <span class="text-slate-800">${w.strength || 'Chưa cập nhật'}</span></p>
                        <p><strong><i class="fa-solid fa-tools text-slate-500 mr-1"></i> Công cụ & Phụ kiện:</strong> <span class="text-slate-800">${w.tools || 'Chưa cập nhật'}</span></p>
                        <p><strong><i class="fa-solid fa-comment-dots text-indigo-500 mr-1"></i> Đánh giá năng lực:</strong> <span class="italic text-slate-700">${w.review || 'Chưa có đánh giá nào.'}</span></p>
                    </div>
                </div>

                <div class="flex justify-end pt-2 border-t border-slate-100">
                    <button onclick="window.openEvalModal('${w.id}', '${w.name}', '${w.strength || ''}', '${w.tools || ''}', '${w.review || ''}')" class="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-xl transition text-xs flex items-center gap-1.5 cursor-pointer">
                        <i class="fa-solid fa-pen-to-square text-teal-600"></i> Cập nhật đánh giá & công cụ
                    </button>
                </div>
            </div>
        `).join('');
    };

    // Mở Modal chỉnh sửa đánh giá
    window.openEvalModal = (id, name, strength, tools, review) => {
        document.getElementById('editWorkerId').value = id;
        document.getElementById('modalWorkerName').textContent = `Đánh giá nhân sự: ${name}`;
        document.getElementById('editWorkerStrength').value = strength;
        document.getElementById('editWorkerTools').value = tools;
        document.getElementById('editWorkerReview').value = review;
        evalModal.classList.remove('hidden');
        evalModal.classList.add('flex');
    };

    // Đóng Modal
    window.closeEvalModal = () => {
        evalModal.classList.add('hidden');
        evalModal.classList.remove('flex');
        evalForm.reset();
    };

    // Lưu dữ liệu đánh giá, công cụ, sở trường lên Supabase
    evalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('editWorkerId').value;
        const strength = document.getElementById('editWorkerStrength').value;
        const tools = document.getElementById('editWorkerTools').value;
        const review = document.getElementById('editWorkerReview').value;

        const { error } = await supabase
            .from('workers')
            .update({ strength, tools, review })
            .eq('id', id);

        if (error) {
            alert("Lỗi khi cập nhật: " + error.message);
        } else {
            alert("Đã cập nhật thông tin và đánh giá thành công!");
            window.closeEvalModal();
            window.loadWorkersForEvaluation();
        }
    });

    // --- KHỞI CHẠY ---
    window.loadAcceptedJobsData();
    window.loadWorkersForEvaluation();

    // --- LẮNG NGHE REALTIME ---
    supabase
        .channel('public:worker_management_sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => {
            window.loadAcceptedJobsData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'workers' }, () => {
            window.loadWorkersForEvaluation();
        })
        .subscribe();
});