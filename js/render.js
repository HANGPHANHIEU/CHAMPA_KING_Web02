import { Storage } from './storage.js';
import { JobService } from './job-service.js';
import { OrgService } from './org-service.js';
import { showToast } from './toast.js';

/**
 * 1. Hàm vẽ danh sách công việc (Jobs) - Tích hợp đầy đủ Nhận việc, Xóa, Thùng rác & Cloud
 */
export async function renderJobs() {
    // Hỗ trợ cả 2 ID container thường dùng ('jobList' hoặc 'jobListContainer')
    const container = document.getElementById('jobList') || document.getElementById('jobListContainer');
    if (!container) return;

    const jobs = await JobService.fetchCloudJobs();
    const deleted = Storage.getDeleted ? Storage.getDeleted() : [];
    const user = Storage.getUser(); // Lấy thông tin người đang đăng nhập

    // Lọc bỏ những việc đã bị đưa vào thùng rác
    const filtered = jobs.filter(j => !deleted.some(d => String(d.id) === String(j.id)));
    
    container.innerHTML = filtered.length === 0 
        ? `<p class="text-center text-slate-400 py-8">Không có việc phù hợp.</p>` 
        : '';

    filtered.forEach(job => {
        // Kiểm tra xem user hiện tại có phải là người đăng bài này không
        const isOwner = user && user.phone === job.phone;

        const jobCard = document.createElement('div');
        jobCard.className = "bg-white p-4 rounded-2xl border flex justify-between items-center shadow-sm mb-3";
        
        jobCard.innerHTML = `
            <div>
                <h3 class="font-bold text-slate-800 text-sm">${job.title || job.name}</h3>
                <p class="text-xs text-slate-500 mt-1">
                    📍 ${job.location || 'Chưa cập nhật'} &bull; 💰 <span class="font-semibold text-green-600">${job.salary || 'Thoả thuận'}</span>
                </p>
                <p class="text-xs text-slate-400 mt-0.5">Đăng bởi: ${job.poster || job.phone}</p>
            </div>
            <div class="flex gap-2 items-center">
                <!-- Nút Nhận việc (Hiển thị cho mọi người, JobService sẽ xử lý chặn tự nhận việc) -->
                <button data-id="${job.id}" class="btn-take bg-black text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-slate-800 transition">
                    Nhận việc
                </button>

                <!-- Nút Xóa: CHỈ HIỂN THỊ KHI ĐÚNG LÀ CHÍNH CHỦ ĐĂNG -->
                ${isOwner ? `
                    <button data-id="${job.id}" class="btn-del px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded-xl hover:bg-red-100 transition">
                        <i class="fa-solid fa-trash-can"></i> Xóa
                    </button>
                ` : ''}
            </div>
        `;
        container.appendChild(jobCard);
    });

    // Gắn sự kiện tương tác cho các nút vừa tạo
    attachEventListeners(filtered);
}

/**
 * 2. Gắn sự kiện cho các nút Nhận việc & Xóa việc
 */
function attachEventListeners(filteredJobs) {
    // Sự kiện Nhận việc
    document.querySelectorAll('.btn-take').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const jobId = e.currentTarget.getAttribute('data-id');
            
            // Gọi hàm takeJob nếu đã định nghĩa ở Service hoặc viết trực tiếp logic nhận việc tại đây
            if (typeof JobService.takeJob === 'function') {
                await JobService.takeJob(jobId);
            } else {
                // Logic dự phòng nếu takeJob nằm ở file khác
                console.warn("Hàm takeJob chưa được định nghĩa trong JobService.");
            }
            
            // Reload lại danh sách sau khi thao tác
            renderJobs();
            if (typeof window.reloadJobs === 'function') {
                window.reloadJobs();
            }
        });
    });

    // Sự kiện Xóa việc (Chuyển vào thùng rác & xóa Cloud)
    document.querySelectorAll('.btn-del').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            const target = filteredJobs.find(j => String(j.id) === String(id));
            
            if (target && confirm('Bạn có chắc chắn muốn chuyển bài đăng này vào thùng rác không?')) {
                const delList = Storage.getDeleted ? Storage.getDeleted() : [];
                delList.unshift({ ...target, deletedAt: new Date().toLocaleString() });
                
                if (typeof Storage.saveDeleted === 'function') {
                    Storage.saveDeleted(delList);
                }

                // Xóa trên Cloud thông qua JobService
                await JobService.deleteCloudJob(id, target.phone);
                
                if (typeof showToast === 'function') {
                    showToast('Đã chuyển vào Thùng rác!');
                } else {
                    alert('Đã chuyển vào Thùng rác!');
                }

                // Cập nhật lại giao diện
                renderJobs();
                if (typeof window.reloadJobs === 'function') {
                    window.reloadJobs();
                }
            }
        });
    });
}

/**
 * 3. Hàm vẽ danh sách tổ chức/đơn vị (Organizations)
 */
export async function renderOrganizations() {
    const container = document.getElementById('orgList');
    if (!container) return;
    
    const orgs = OrgService && typeof OrgService.fetchCloudOrgs === 'function' 
        ? await OrgService.fetchCloudOrgs() 
        : [];

    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = "flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x";

    orgs.forEach(o => {
        const card = document.createElement('div');
        card.className = "min-w-[280px] p-4 bg-white rounded-2xl border snap-start shadow-sm";
        card.innerHTML = `
            <h3 class="font-bold text-slate-800">${o.name}</h3>
            <p class="text-xs text-slate-500 mt-1">📍 ${o.address || 'Đang cập nhật'}</p>
        `;
        wrapper.appendChild(card);
    });
    container.appendChild(wrapper);
}