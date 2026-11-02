//Giao diện Modal Đăng việc
import { Storage } from './storage.js';
import { JobService } from './job-service.js';
import { showToast } from './toast.js';

export function initPostJobModal(onJobPosted) {
    const modal = document.getElementById('postJobModal');
    const form = document.getElementById('postJobForm');

    const openModal = () => {
        if (!Storage.getUser()) {
            showToast('Vui lòng đăng nhập!', 'error');
            document.getElementById('authModal')?.classList.remove('hidden');
            return;
        }
        modal?.classList.remove('hidden');
        modal?.classList.add('flex');
    };

    document.getElementById('btnPostJob')?.addEventListener('click', openModal);
    document.getElementById('btnFloatingPostJob')?.addEventListener('click', openModal);
    document.getElementById('btnCloseModal')?.addEventListener('click', () => modal.classList.add('hidden'));
    document.getElementById('btnCancelModal')?.addEventListener('click', () => modal.classList.add('hidden'));

    form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = Storage.getUser();
        const res = await JobService.createCloudJob({
            title: document.getElementById('jobTitleInput').value.trim(),
            location: document.getElementById('jobLocationInput').value,
            category: document.getElementById('jobCategoryInput').value,
            salary: document.getElementById('jobSalaryInput').value.trim(),
            is_urgent: document.getElementById('jobUrgentInput').checked,
            created_by_name: user.name,
            phone: user.phone
        });

        if (res.ok) {
            showToast('Đăng việc thành công!');
            modal.classList.add('hidden');
            form.reset();
            onJobPosted();
        }
    });
}