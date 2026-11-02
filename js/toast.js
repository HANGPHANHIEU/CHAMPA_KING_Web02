//Hiển thị thông báo Toast( Thông báo xuất hiện rồi biến mất )
export function showToast(message, type = 'success') {
    const existing = document.getElementById('appToast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'appToast';
    toast.className = `fixed top-5 right-5 z-50 px-4 py-3 rounded-xl text-xs font-bold text-white shadow-xl flex items-center gap-2 ${type === 'success' ? 'bg-teal-600' : 'bg-red-600'}`;
    toast.innerHTML = `<i class="fa-solid fa-circle-check text-sm"></i> ${message}`;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}