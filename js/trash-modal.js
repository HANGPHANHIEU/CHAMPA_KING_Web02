//Giao diện Thùng rác
import { Storage } from './storage.js';

export function initTrashModal() {
    const modal = document.getElementById('trashModal');
    const badge = document.getElementById('trashBadge');

    const updateUI = () => {
        const user = Storage.getUser();
        const deleted = Storage.getDeleted();
        
        // Kiểm tra quyền: Người nào đăng lên (khớp số điện thoại phone) thì mới hiển thị trong thùng rác cá nhân của họ
        // Nếu user có quyền admin, bạn có thể bổ sung điều kiện cho phép admin xem tất cả nếu cần.
        const myDeleted = user ? deleted.filter(j => j.phone === user.phone) : [];
        
        if (badge) {
            badge.textContent = myDeleted.length;
            myDeleted.length > 0 ? badge.classList.remove('hidden') : badge.classList.add('hidden');
        }

        // --- BỔ SUNG: Render danh sách việc trong giao diện Thùng rác kèm kiểm tra quyền xóa vĩnh viễn/khôi phục ---
        const trashListContainer = document.getElementById('trashListContainer'); // Tên container chứa danh sách trong modal (nếu có)
        if (trashListContainer) {
            trashListContainer.innerHTML = '';
            
            if (myDeleted.length === 0) {
                trashListContainer.innerHTML = `<p class="text-gray-500 text-center py-4">Thùng rác trống</p>`;
            } else {
                myDeleted.forEach(job => {
                    const itemEl = document.createElement('div');
                    itemEl.className = 'flex justify-between items-center p-3 border-b border-gray-100';
                    itemEl.innerHTML = `
                        <div>
                            <h4 class="font-semibold text-gray-800">${job.title || job.name || 'Công việc'}</h4>
                            <p class="text-xs text-gray-500">Đăng bởi: ${job.poster || job.phone}</p>
                        </div>
                        <div class="flex gap-2">
                            <!-- Nút thao tác chỉ dành cho chính chủ -->
                            <button data-id="${job.id}" class="btn-restore text-sm bg-green-500 text-white px-2 py-1 rounded">Khôi phục</button>
                        </div>
                    `;
                    trashListContainer.appendChild(itemEl);
                });
            }
        }
    };

    document.getElementById('btnOpenTrash')?.addEventListener('click', () => {
        updateUI(); // Cập nhật lại giao diện mỗi khi mở modal
        modal?.classList.remove('hidden');
        modal?.classList.add('flex');
    });
    
    document.getElementById('btnCloseTrashModal')?.addEventListener('click', () => modal?.classList.add('hidden'));

    updateUI();
    return { updateUI };
}