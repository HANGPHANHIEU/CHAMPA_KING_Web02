// Xử lý sự kiện tương tác giao diện
document.addEventListener('DOMContentLoaded', () => {
    const categoryBtns = document.querySelectorAll('.category-btn');
    const searchInput = document.getElementById('searchInput');
    const locationSelect = document.getElementById('locationSelect');
    const urgentCheck = document.getElementById('urgentCheck');
    const btnPostJob = document.getElementById('btnPostJob');
    const jobListContainer = document.getElementById('jobList'); // Container chứa danh sách việc làm

    // Khởi tạo danh sách công việc (Lấy từ localStorage nếu có, nếu không thì dùng danh sách mẫu)
    let jobsList = JSON.parse(localStorage.getItem('my_jobs_list')) || [
        { id: 1, title: 'Nhân viên Phục vụ Bán thời gian', location: 'TP.HCM', salary: '25k - 30k/giờ', isUrgent: true },
        { id: 2, title: 'Nhân viên Thiết kế đồ họa', location: 'Hà Nội', salary: '12 - 15 triệu', isUrgent: false },
        { id: 3, title: 'Lập trình viên Front-end ReactJS', location: 'Đà Nẵng', salary: '18 - 25 triệu', isUrgent: true }
    ];

    // --- HÀM RENDER DANH SÁCH (CÓ TÍCH HỢP BỘ LỌC TÌM KIẾM) ---
    function renderJobs() {
        if (!jobListContainer) return;

        // 1. Lấy giá trị từ các bộ lọc hiện tại trên giao diện
        const keyword = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const selectedLocation = locationSelect ? locationSelect.value : '';
        const isUrgentOnly = urgentCheck ? urgentCheck.checked : false;

        // 2. Lọc danh sách theo các điều kiện
        const filteredJobs = jobsList.filter(job => {
            // Điều kiện tìm kiếm theo tên công việc
            const matchesKeyword = job.title.toLowerCase().includes(keyword);

            // Điều kiện lọc theo khu vực (Nếu chọn "Tất cả khu vực" hoặc bỏ trống thì bỏ qua điều kiện này)
            const matchesLocation = !selectedLocation || selectedLocation === 'Tất cả' || job.location === selectedLocation;

            // Điều kiện lọc chỉ việc gấp
            const matchesUrgent = !isUrgentOnly || job.isUrgent === true;

            return matchesKeyword && matchesLocation && matchesUrgent;
        });

        // 3. Hiển thị kết quả ra HTML
        jobListContainer.innerHTML = '';

        if (filteredJobs.length === 0) {
            jobListContainer.innerHTML = '<p class="text-center text-slate-400 py-8">Không tìm thấy công việc phù hợp.</p>';
            return;
        }

        filteredJobs.forEach(job => {
            const jobCard = document.createElement('div');
            jobCard.className = 'p-4 bg-white rounded-lg shadow border border-slate-200 flex justify-between items-center transition hover:shadow-md';
            jobCard.innerHTML = `
                <div>
                    <div class="flex items-center gap-2">
                        <h3 class="font-bold text-slate-800 text-lg">${job.title}</h3>
                        ${job.isUrgent ? '<span class="px-2 py-0.5 text-xs bg-red-100 text-red-600 font-semibold rounded">GẤP</span>' : ''}
                    </div>
                    <p class="text-sm text-slate-500 mt-1">📍 ${job.location} | 💰 ${job.salary}</p>
                </div>
                <button class="px-3 py-1.5 bg-slate-900 text-white text-sm font-medium rounded hover:bg-slate-800">
                    Ứng tuyển
                </button>
            `;
            jobListContainer.appendChild(jobCard);
        });
    }

    // 1. Chuyển đổi trạng thái nút danh mục khi bấm
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

    // 2. Tính năng Thêm việc mới (Dùng prompt cũ + Lưu localStorage + Tự xuất hiện)
    btnPostJob.addEventListener('click', () => {
        const title = prompt('Nhập tên công việc:');
        if (!title) return; // Hủy nếu không nhập tên

        const location = prompt('Nhập khu vực (Ví dụ: TP.HCM, Hà Nội):', 'TP.HCM');
        const salary = prompt('Nhập mức lương (Ví dụ: 10 - 15 triệu):', 'Thỏa thuận');
        const isUrgent = confirm('Đây có phải là công việc gấp không?');

        // Tạo dữ liệu công việc mới
        const newJob = {
            id: Date.now(),
            title: title,
            location: location || 'Toàn quốc',
            salary: salary || 'Thỏa thuận',
            isUrgent: isUrgent
        };

        // Thêm vào đầu mảng dữ liệu
        jobsList.unshift(newJob);

        // Lưu vào localStorage
        localStorage.setItem('my_jobs_list', JSON.stringify(jobsList));

        // Cập nhật lại giao diện (tự động đưa việc mới lên danh sách hiển thị)
        renderJobs();
        
        alert('Thêm công việc thành công!');
    });

    // 3. Lắng nghe thay đổi tìm kiếm & bộ lọc để hiển thị đúng việc khách cần tìm
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            renderJobs(); // Gọi lại hàm lọc khi gõ tìm kiếm
        });
    }

    if (locationSelect) {
        locationSelect.addEventListener('change', () => {
            renderJobs(); // Gọi lại hàm lọc khi chọn khu vực
        });
    }

    if (urgentCheck) {
        urgentCheck.addEventListener('change', () => {
            renderJobs(); // Gọi lại hàm lọc khi check/uncheck việc gấp
        });
    }

    // Chạy render lần đầu khi tải trang
    renderJobs();
});