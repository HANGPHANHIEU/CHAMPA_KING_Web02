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
        // Nếu không truyền jobOwnerPhone từ bên ngoài vào, có thể linh động bỏ qua hoặc xử lý tùy logic của bạn
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
    }
};