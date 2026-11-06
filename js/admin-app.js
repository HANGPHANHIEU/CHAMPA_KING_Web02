import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- CẤU HÌNH SUPABASE ---
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // Thay bằng URL dự án Supabase của bạn
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Thay bằng ANON KEY của bạn

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
    console.log("--- HỆ THỐNG ADMIN 'VIỆC GẤP' ĐÃ KHỞI ĐỘNG (SUPABASE & REALTIME) ---");

    // Dọn dẹp modal khi tải trang
    document.querySelectorAll('[id*="Modal"], [id*="modal"]').forEach(modal => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    });

    // --- HÀM TẢI VÀ HIỂN THỊ DỮ LIỆU CHỜ DUYỆT TỪ SUPABASE ---
    window.loadPendingData = async () => {
        // Lấy danh sách tổ chức chưa duyệt ('pending' hoặc chưa có status)
        const { data: orgs, error: orgError } = await supabase
            .from('organizations')
            .select('*')
            .order('created_at', { ascending: false });

        // Lấy danh sách cá nhân chưa duyệt
        const { data: workers, error: workerError } = await supabase
            .from('workers')
            .select('*')
            .order('created_at', { ascending: false });

        if (orgError) console.error("Lỗi tải tổ chức:", orgError.message);
        if (workerError) console.error("Lỗi tải cá nhân:", workerError.message);

        const pendingOrgs = (orgs || []).filter(o => o.status === 'pending' || !o.status);
        const pendingWorkers = (workers || []).filter(w => w.status === 'pending' || !w.status);

        // Cập nhật Badge số lượng
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
                            <h4 class="font-bold text-slate-800 text-sm">${w.name || 'Chưa có tên'} - <span class="text-amber-600">${w.skill || 'Cá nhân'}</span></h4>
                            <p class="text-slate-600 mt-0.5">📞 ${w.phone || 'N/A'} &bull; 📍 ${w.location || 'Chưa cập nhật'}</p>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="window.approveWorker('${w.id}')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition cursor-pointer">Đồng ý</button>
                            <button onclick="window.rejectWorker('${w.id}')" class="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition cursor-pointer">Từ chối</button>
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
                            <h4 class="font-bold text-slate-800 text-sm">${o.name || 'Chưa có tên tổ chức'}</h4>
                            <p class="text-slate-600 mt-0.5">📞 ${o.phone || 'N/A'} &bull; 📍 ${o.district || o.province || o.address || ''}</p>
                            <p class="text-blue-700 font-medium mt-0.5">Thế mạnh: ${o.strength || 'Chưa cập nhật'}</p>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="window.approveOrg('${o.id}')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition cursor-pointer">Đồng ý</button>
                            <button onclick="window.rejectOrg('${o.id}')" class="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition cursor-pointer">Từ chối</button>
                        </div>
                    `;
                    orgContainer.appendChild(item);
                });
            }
        }
    };

    // --- CÁC HÀM XỬ LÝ PHÊ DUYỆT / TỪ CHỐI TRÊN SUPABASE ---
    window.approveOrg = async (id) => {
        const { error } = await supabase.from('organizations').update({ status: 'approved' }).eq('id', id);
        if (error) {
            alert("Lỗi phê duyệt: " + error.message);
        } else {
            alert("Đã phê duyệt tổ chức thành công!");
            window.loadPendingData();
        }
    };

    window.rejectOrg = async (id) => {
        if (confirm("Bạn có chắc chắn muốn từ chối và xóa hồ sơ tổ chức này?")) {
            const { error } = await supabase.from('organizations').delete().eq('id', id);
            if (error) {
                alert("Lỗi khi xóa: " + error.message);
            } else {
                window.loadPendingData();
            }
        }
    };

    window.approveWorker = async (id) => {
        const { error } = await supabase.from('workers').update({ status: 'approved' }).eq('id', id);
        if (error) {
            alert("Lỗi phê duyệt: " + error.message);
        } else {
            alert("Đã phê duyệt hồ sơ cá nhân thành công!");
            window.loadPendingData();
        }
    };

    window.rejectWorker = async (id) => {
        if (confirm("Bạn có chắc chắn muốn từ chối và xóa hồ sơ cá nhân này?")) {
            const { error } = await supabase.from('workers').delete().eq('id', id);
            if (error) {
                alert("Lỗi khi xóa: " + error.message);
            } else {
                window.loadPendingData();
            }
        }
    };

    // Tải dữ liệu lần đầu khi vào trang admin
    window.loadPendingData();

    // --- LẮNG NGHE REALTIME SUPABASE CHO TRANG ADMIN ---
    supabase
        .channel('public:admin_live_sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'organizations' }, () => {
            console.log('Realtime Admin - Tổ chức có thay đổi mới');
            window.loadPendingData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'workers' }, () => {
            console.log('Realtime Admin - Cá nhân có thay đổi mới');
            window.loadPendingData();
        })
        .subscribe();
});