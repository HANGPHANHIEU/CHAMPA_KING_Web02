import { Storage } from './storage.js';
import { JobService } from './job-service.js';
import { OrgService } from './org-service.js';
import { showToast } from './toast.js';

/**
 * Hàm vẽ danh sách công việc (Jobs)
 */
export async function renderJobs() {
    const container = document.getElementById('jobList');
    if (!container) return;

    const jobs = await JobService.fetchCloudJobs();
    const deleted = Storage.getDeleted();
    const user = Storage.getUser(); // Lấy thông tin người đang đăng nhập

    const filtered = jobs.filter(j => !deleted.some(d => String(d.id) === String(j.id)));
    container.innerHTML = filtered.length === 0 ? `<p class="text-center text-slate-400 py-8">Không có việc phù hợp.</p>` : '';

    filtered.forEach(job => {
        // Kiểm tra xem bài đăng này có phải của người đang đăng nhập hay không
        const isMyJob = user && user.phone === job.phone;

        const card = document.createElement('div');
        card.className = "p-4 bg-white rounded-2xl border flex justify-between items-center shadow-sm";
        card.innerHTML = `
            <div>
                <h3 class="font-bold text-slate-800 text-sm">${job.title}</h3>
                <p class="text-xs text-slate-500">📍 ${job.location} &bull; 💰 ${job.salary}</p>
            </div>
            <div class="flex gap-2">
                <!-- CHỈ HIỂN THỊ NÚT XÓA NẾU LÀ BÀI CỦA CHÍNH HỌ -->
                ${isMyJob ? `<button data-id="${job.id}" class="btn-del px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-xl"><i class="fa-solid fa-trash-can"></i> Xóa</button>` : ''}
                
                <button class="px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-xl">Nhận việc</button>
            </div>
        `;
        container.appendChild(card);
    });

    // Xử lý sự kiện xóa bài viết
    document.querySelectorAll('.btn-del').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            const target = filtered.find(j => String(j.id) === String(id));
            if (target && confirm('Chuyển vào thùng rác?')) {
                const delList = Storage.getDeleted();
                delList.unshift({ ...target, deletedAt: new Date().toLocaleString() });
                Storage.saveDeleted(delList);
                await JobService.deleteCloudJob(id);
                showToast('Đã chuyển vào Thùng rác!');
                renderJobs();
            }
        });
    });
}

/**
 * Hàm vẽ danh sách tổ chức/đơn vị (Organizations)
 */
export async function renderOrganizations() {
    const container = document.getElementById('orgList');
    if (!container) return;
    const orgs = await OrgService.fetchCloudOrgs();

    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = "flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x";

    orgs.forEach(o => {
        const card = document.createElement('div');
        card.className = "min-w-[280px] p-4 bg-white rounded-2xl border snap-start";
        card.innerHTML = `<h3 class="font-bold">${o.name}</h3><p class="text-xs text-slate-500">📍 ${o.address}</p>`;
        wrapper.appendChild(card);
    });
    container.appendChild(wrapper);
}