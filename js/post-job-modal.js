// Giao diện Modal Đăng việc
import { Storage } from './storage.js';
import { JobService } from './job-service.js';
import { showToast } from './toast.js';

export function initPostJobModal(onJobPosted) {
    const modal = document.getElementById('postJobModal');
    const form = document.getElementById('postJobForm');

    const openModal = () => {
        // Kiểm tra đăng nhập khi người dùng bấm nút mở modal
        const user = Storage.getUser();
        if (!user) {
            showToast('Vui lòng đăng nhập để đăng việc!', 'error');
            document.getElementById('authModal')?.classList.remove('hidden');
            document.getElementById('authModal')?.classList.add('flex');
            return;
        }
        modal?.classList.remove('hidden');
        modal?.classList.add('flex');
    };

    document.getElementById('btnPostJob')?.addEventListener('click', openModal);
    document.getElementById('btnFloatingPostJob')?.addEventListener('click', openModal);
    document.getElementById('btnCloseModal')?.addEventListener('click', () => modal?.classList.add('hidden'));
    document.getElementById('btnCancelModal')?.addEventListener('click', () => modal?.classList.add('hidden'));

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Kiểm tra lại một lần nữa trước khi gửi form để đảm bảo tính bảo mật
        const user = Storage.getUser();
        if (!user) {
            showToast('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!', 'error');
            modal?.classList.add('hidden');
            document.getElementById('authModal')?.classList.remove('hidden');
            document.getElementById('authModal')?.classList.add('flex');
            return;
        }

        try {
            const res = await JobService.createCloudJob({
                title: document.getElementById('jobTitleInput').value.trim(),
                location: document.getElementById('jobLocationInput').value,
                category: document.getElementById('jobCategoryInput').value,
                salary: document.getElementById('jobSalaryInput').value.trim(),
                is_urgent: document.getElementById('jobUrgentInput').checked,
                user_id: user.id, // Đính kèm user_id để RLS Supabase xác thực quyền tạo việc
                created_by_name: user.name,
                phone: user.phone
            });

            if (res && res.ok) {
                showToast('Đăng việc thành công!');
                modal?.classList.add('hidden');
                form.reset();
                if (typeof onJobPosted === 'function') {
                    onJobPosted();
                }
            } else {
                showToast(res?.message || 'Có lỗi xảy ra, vui lòng thử lại!', 'error');
            }
        } catch (error) {
            console.error('Lỗi khi submit form đăng việc:', error);
            showToast('Không thể kết nối đến máy chủ.', 'error');
        }
    });
}