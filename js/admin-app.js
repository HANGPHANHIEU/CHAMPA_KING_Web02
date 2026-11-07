import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- CẤU HÌNH SUPABASE ---
const SUPABASE_URL = 'https://rznzypehvmwysxmjxxxp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6bnp5cGVodm13eXN4bWp4eHhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzNTkxNTYsImV4cCI6MjEwODkzNTE1Nn0.B-5onxhT0EoqgtJ0ZP-ZbGSz4Gmo7xuRPEcsAYz65wA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- CẤU HÌNH MẬT KHẨU ADMIN ---
const ADMIN_PASSWORD = "123";

document.addEventListener('DOMContentLoaded', () => {
    // --- BẢO MẬT: XÁC THỰC MẬT KHẨU ADMIN ---
    let isAuthed = sessionStorage.getItem('admin_authenticated') === 'true';
    if (!isAuthed) {
        const inputPass = prompt("🔒 Vui lòng nhập mật khẩu Quản trị viên (Admin):");
        if (inputPass === ADMIN_PASSWORD) {
            sessionStorage.setItem('admin_authenticated', 'true');
            alert("Đăng nhập Admin thành công!");
        } else {
            alert("❌ Mật khẩu không chính xác! Đang quay lại trang chủ.");
            window.location.href = 'index.html';
            return;
        }
    }

    console.log("--- HỆ THỐNG ADMIN 'VIỆC GẤP' ĐÃ KHỞI ĐỘNG (ĐẦY ĐỦ TÍNH NĂNG DUYỆT & REALTIME) ---");

    // Dọn dẹp modal khi tải trang
    document.querySelectorAll('[id*="Modal"], [id*="modal"]').forEach(modal => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    });

    // --- 1. TẢI VÀ HIỂN THỊ DỮ LIỆU CHỜ DUYỆT ---
    window.loadPendingData = async () => {
        const { data: orgs, error: orgError } = await supabase
            .from('organizations')
            .select('*')
            .order('created_at', { ascending: false });

        const { data: workers, error: workerError } = await supabase
            .from('workers')
            .select('*')
            .order('created_at', { ascending: false });

        if (orgError) console.error("Lỗi tải tổ chức:", orgError.message);
        if (workerError) console.error("Lỗi tải cá nhân:", workerError.message);

        const pendingOrgs = (orgs || []).filter(o => o.status === 'pending' || !o.status);
        const pendingWorkers = (workers || []).filter(w => w.status === 'pending' || !w.status);

        // Cập nhật Badge số lượng chờ duyệt
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

    // --- 2. TẢI VÀ HIỂN THỊ DANH SÁCH ĐÃ PHÊ DUYỆT ---
    window.loadApprovedData = async () => {
        const { data: orgs, error: orgError } = await supabase
            .from('organizations')
            .select('*')
            .eq('status', 'approved')
            .order('created_at', { ascending: false });

        const { data: workers, error: workerError } = await supabase
            .from('workers')
            .select('*')
            .eq('status', 'approved')
            .order('created_at', { ascending: false });

        if (orgError) console.error("Lỗi tải tổ chức đã duyệt:", orgError.message);
        if (workerError) console.error("Lỗi tải cá nhân đã duyệt:", workerError.message);

        const countApprovedOrgs = document.getElementById('countApprovedOrgs');
        const countApprovedWorkers = document.getElementById('countApprovedWorkers');
        if (countApprovedOrgs) countApprovedOrgs.textContent = (orgs || []).length;
        if (countApprovedWorkers) countApprovedWorkers.textContent = (workers || []).length;

        // Render Tổ chức đã duyệt
        const orgContainer = document.getElementById('adminApprovedOrgList');
        if (orgContainer) {
            orgContainer.innerHTML = '';
            if (!orgs || orgs.length === 0) {
                orgContainer.innerHTML = `<p class="text-xs text-slate-400 text-center py-3">Chưa có tổ chức nào được duyệt.</p>`;
            } else {
                orgs.forEach(o => {
                    const item = document.createElement('div');
                    item.className = 'p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs mb-2';
                    item.innerHTML = `
                        <div>
                            <h4 class="font-bold text-slate-800 text-sm">${o.name}</h4>
                            <p class="text-slate-500 mt-0.5">📞 ${o.phone} &bull; 📍 ${o.district || o.province || ''}</p>
                        </div>
                        <span class="text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md">Đã duyệt</span>
                    `;
                    orgContainer.appendChild(item);
                });
            }
        }

        // Render Cá nhân đã duyệt
        const workerContainer = document.getElementById('adminApprovedWorkerList');
        if (workerContainer) {
            workerContainer.innerHTML = '';
            if (!workers || workers.length === 0) {
                workerContainer.innerHTML = `<p class="text-xs text-slate-400 text-center py-3">Chưa có cá nhân nào được duyệt.</p>`;
            } else {
                workers.forEach(w => {
                    const item = document.createElement('div');
                    item.className = 'p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs mb-2';
                    item.innerHTML = `
                        <div>
                            <h4 class="font-bold text-slate-800 text-sm">${w.name} - <span class="text-amber-600">${w.skill}</span></h4>
                            <p class="text-slate-500 mt-0.5">📞 ${w.phone} &bull; 📍 ${w.location}</p>
                        </div>
                        <span class="text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md">Đã duyệt</span>
                    `;
                    workerContainer.appendChild(item);
                });
            }
        }
    };

    // --- 3. CÁC HÀM XỬ LÝ PHÊ DUYỆT / TỪ CHỐI ---
    window.approveOrg = async (id) => {
        const { error } = await supabase.from('organizations').update({ status: 'approved' }).eq('id', id);
        if (error) {
            alert("Lỗi phê duyệt: " + error.message);
        } else {
            alert("Đã phê duyệt tổ chức thành công!");
            window.loadPendingData();
            window.loadApprovedData();
        }
    };

    window.rejectOrg = async (id) => {
        if (confirm("Bạn có chắc chắn muốn từ chối hồ sơ tổ chức này?")) {
            const { error } = await supabase.from('organizations').delete().eq('id', id);
            if (error) {
                const { error: updateErr } = await supabase.from('organizations').update({ status: 'rejected' }).eq('id', id);
                if (updateErr) {
                    alert("Lỗi từ chối: " + error.message);
                    return;
                }
            }
            alert("Đã từ chối hồ sơ tổ chức thành công!");
            window.loadPendingData();
            window.loadApprovedData();
        }
    };

    window.approveWorker = async (id) => {
        const { error } = await supabase.from('workers').update({ status: 'approved' }).eq('id', id);
        if (error) {
            alert("Lỗi phê duyệt: " + error.message);
        } else {
            alert("Đã phê duyệt hồ sơ cá nhân thành công!");
            window.loadPendingData();
            window.loadApprovedData();
        }
    };

    window.rejectWorker = async (id) => {
        if (confirm("Bạn có chắc chắn muốn từ chối hồ sơ cá nhân này?")) {
            const { error } = await supabase.from('workers').delete().eq('id', id);
            if (error) {
                const { error: updateErr } = await supabase.from('workers').update({ status: 'rejected' }).eq('id', id);
                if (updateErr) {
                    alert("Lỗi từ chối: " + error.message);
                    return;
                }
            }
            alert("Đã từ chối hồ sơ cá nhân thành công!");
            window.loadPendingData();
            window.loadApprovedData();
        }
    };

    // Tải dữ liệu lần đầu
    window.loadPendingData();
    window.loadApprovedData();

    // --- 4. LẮNG NGHE REALTIME SUPABASE ---
    supabase
        .channel('public:admin_complete_sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'organizations' }, () => {
            window.loadPendingData();
            window.loadApprovedData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'workers' }, () => {
            window.loadPendingData();
            window.loadApprovedData();
        })
        .subscribe();
});