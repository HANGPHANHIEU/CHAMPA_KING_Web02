//Giao diện Thùng rác
import { Storage } from './storage.js';

export function initTrashModal() {
    const modal = document.getElementById('trashModal');
    const badge = document.getElementById('trashBadge');

    const updateUI = () => {
        const user = Storage.getUser();
        const deleted = Storage.getDeleted();
        const myDeleted = user ? deleted.filter(j => j.phone === user.phone) : [];
        if (badge) {
            badge.textContent = myDeleted.length;
            myDeleted.length > 0 ? badge.classList.remove('hidden') : badge.classList.add('hidden');
        }
    };

    document.getElementById('btnOpenTrash')?.addEventListener('click', () => {
        modal?.classList.remove('hidden');
        modal?.classList.add('flex');
    });
    document.getElementById('btnCloseTrashModal')?.addEventListener('click', () => modal?.classList.add('hidden'));

    updateUI();
    return { updateUI };
}