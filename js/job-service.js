// File: js/job-service.js
import { SUPABASE_URL, headers } from './config.js';
import { Storage } from './storage.js';

export const JobService = {
    // Lấy danh sách công việc từ Supabase
    async fetchCloudJobs() {
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/jobs?select=*&order=id.desc`, { headers });
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        } catch { 
            return []; 
        }
    },

    // Tạo công việc mới lên Supabase
    async createCloudJob(jobData) {
        return fetch(`${SUPABASE_URL}/rest/v1/jobs`, { 
            method: 'POST', 
            headers, 
            body: JSON.stringify(jobData) 
        });
    },

    // Xóa công việc trên Supabase (Có kiểm tra quyền Chủ bài đăng hoặc Admin)
    async deleteCloudJob(jobId, jobOwnerPhone) {
        const currentUser = Storage.getUser();

        // 1. Kiểm tra đăng nhập
        if (!currentUser) {
            alert('Bạn chưa đăng nhập!');
            return false;
        }

        // 2. Kiểm tra chính chủ (Hoặc là Admin)
        const isAdmin = sessionStorage.getItem('is_admin_active') === 'true';
        const isOwner = jobOwnerPhone ? (currentUser.phone === jobOwnerPhone) : true;

        if (!isOwner && !isAdmin) {
            alert('Bảo mật: Bạn không có quyền xóa bài đăng của người khác!');
            return false;
        }

        // 3. Đúng quyền -> Gửi lệnh xóa lên đám mây Supabase
        return fetch(`${SUPABASE_URL}/rest/v1/jobs?id=eq.${jobId}`, {
            method: 'DELETE',
            headers
        });
    },

    // Nhận công việc (Tích hợp từ handleTakeJob)
    async takeJob(jobId) {
        const user = Storage.getUser();
        
        // 1. Kiểm tra xem người dùng đã đăng nhập chưa
        if (!user) {
            alert("Vui lòng đăng nhập tài khoản cá nhân trước khi nhận việc!");
            document.getElementById('authModal')?.classList.remove('hidden');
            return false;
        }

        // 2. Xác nhận hành động nhận việc
        const confirmTake = confirm("Bạn có chắc chắn muốn nhận công việc này không?");
        if (!confirmTake) return false;

        // 3. Cập nhật trạng thái công việc lên Supabase (status = 'Đang thực hiện', worker_phone = user.phone)
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/jobs?id=eq.${jobId}`, {
                method: 'PATCH',
                headers: {
                    ...headers,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    status: 'Đang thực hiện',
                    worker_phone: user.phone
                })
            });

            if (!response.ok) {
                throw new Error('Cập nhật thất bại từ máy chủ');
            }

            alert("Nhận việc thành công! Chủ bài đăng sẽ liên hệ với bạn sớm.");
            
            // Tải lại danh sách việc làm để cập nhật giao diện
            if (typeof loadJobs === 'function') {
                loadJobs();
            }
            return true;
        } catch (err) {
            console.error("Lỗi khi nhận việc:", err);
            alert("Có lỗi xảy ra, vui lòng thử lại.");
            return false;
        }
    }
};