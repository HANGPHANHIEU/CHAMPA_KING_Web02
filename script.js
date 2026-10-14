// Xử lý sự kiện tương tác giao diện
document.addEventListener('DOMContentLoaded', () => {
    const categoryBtns = document.querySelectorAll('.category-btn');
    const searchInput = document.getElementById('searchInput');
    const locationSelect = document.getElementById('locationSelect');
    const urgentCheck = document.getElementById('urgentCheck');
    const btnPostJob = document.getElementById('btnPostJob');

    // Chuyển đổi trạng thái nút danh mục khi bấm
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            categoryBtns.forEach(b => {
                b.classList.remove('bg-slate-900', 'text-white', 'shadow-sm');
                b.classList.add('bg-slate-100', 'text-slate-600', 'hover:bg-slate-200');
            });
            const clickedBtn = e.currentTarget;
            clickedBtn.classList.remove('bg-slate-100', 'text-slate-600', 'hover:bg-slate-200');
            clickedBtn.classList.add('bg-slate-900', 'text-white', 'shadow-sm');
        });
    });

    // Mô phỏng tính năng Đăng việc gấp
    btnPostJob.addEventListener('click', () => {
        alert('Chức năng đăng việc gấp đang được mở trên hệ thống mẫu.');
    });

    // Lắng nghe thay đổi tìm kiếm
    searchInput.addEventListener('input', (e) => {
        console.log('Đang tìm kiếm:', e.target.value);
    });

    locationSelect.addEventListener('change', (e) => {
        console.log('Đã chọn khu vực:', e.target.value);
    });

    urgentCheck.addEventListener('change', (e) => {
        console.log('Lọc chỉ việc gấp:', e.target.checked);
    });
});