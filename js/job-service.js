import { SUPABASE_URL, headers } from './config.js';
import { Storage } from './storage.js';

export const JobService = {
    // 1. Lấy danh sách công việc từ Supabase
    async fetchCloudJobs() {
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/jobs?select=*&order=id.desc`, { headers });
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        } catch { 
            return []; 
        }
    },

    // 2. Tạo công việc mới lên Supabase
    async createCloudJob(jobData) {
        return fetch(`${SUPABASE_URL}/rest/v1/jobs`, { 
            method: 'POST', 
            headers, 
            body: JSON.stringify(jobData) 
        });
    },

    // 3. Tính năng Nhận việc
    async takeJob(jobId) {
        const user = Storage.getUser();
        
        // Kiểm tra đăng nhập
        if (!user) {
            alert("Vui lòng đăng ký / đăng nhập cá nhân để nhận việc!");
            document.getElementById('authModal')?.classList.remove('hidden');
            return false;
        }

        const jobs = Storage.getJobs ? Storage.getJobs() : await this.fetchCloudJobs();
        const job = jobs.find(j => j.id === jobId);

        if (!job) {
            alert("Không tìm thấy thông tin công việc!");
            return false;
        }

        // Kiểm tra nếu chính chủ tự nhận việc của mình
        if (job.phone === user.phone) {
            alert("Bạn không thể tự nhận công việc do chính mình đăng!");
            return false;
        }

        if (confirm(`Bạn có chắc chắn muốn nhận công việc: "${job.title || job.name}" không?`)) {
            try {
                // Cập nhật trạng thái công việc lên Supabase (hoặc trạng thái cục bộ)
                const res = await fetch(`${SUPABASE_URL}/rest/v1/jobs?id=eq.${jobId}`, {
                    method: 'PATCH',
                    headers: {
                        ...headers,
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify({
                        status: 'processing',
                        workerPhone: user.phone
                    })
                });

                if (!res.ok) {
                    throw new Error("Không thể cập nhật trạng thái nhận việc trên hệ thống.");
                }

                alert("Nhận việc thành công! Chủ bài đăng sẽ liên hệ với bạn.");
                
                // Load lại giao diện nếu có
                if (typeof window.reloadJobs === 'function') {
                    window.reloadJobs();
                }
                return true;
            } catch (error) {
                console.error(error);
                alert("Đã xảy ra lỗi khi nhận việc. Vui lòng thử lại!");
                return false;
            }
        }
        return false;
    },

    // 4. Tính năng Xóa việc (Hỗ trợ cả kiểm tra quyền Local Storage & Supabase/Admin)
    async deleteJob(jobId, jobOwnerPhone) {
        const currentUser = Storage.getUser();

        // 1. Kiểm tra đăng nhập
        if (!currentUser) {
            alert("Vui lòng đăng nhập để thực hiện thao tác xóa!");
            return false;
        }

        // 2. Lấy danh sách việc làm để kiểm tra quyền nếu chưa truyền trực tiếp jobOwnerPhone
        const jobs = Storage.getJobs ? Storage.getJobs() : await this.fetchCloudJobs();
        const job = jobs.find(j => j.id === jobId);

        let ownerPhone = jobOwnerPhone;
        if (!ownerPhone && job) {
            ownerPhone = job.phone;
        }

        // Kiểm tra quyền: Chủ bài đăng hoặc Admin
        const isAdmin = sessionStorage.getItem('is_admin_active') === 'true';
        const isOwner = ownerPhone ? (currentUser.phone === ownerPhone) : true;

        if (!isOwner && !isAdmin) {
            alert("Bảo mật: Bạn không có quyền xóa bài đăng của người khác!");
            return false;
        }

        if (confirm("Bạn có chắc chắn muốn xóa bài đăng này không?")) {
            try {
                // Gửi lệnh xóa lên đám mây Supabase
                const res = await fetch(`${SUPABASE_URL}/rest/v1/jobs?id=eq.${jobId}`, {
                    method: 'DELETE',
                    headers
                });

                if (!res.ok) {
                    throw new Error("Không thể xóa công việc từ cơ sở dữ liệu.");
                }

                // Lưu vào danh sách đã xóa cục bộ (Trash) nếu có Storage hỗ trợ
                if (job) {
                    const deletedJobs = Storage.getDeleted ? Storage.getDeleted() : [];
                    deletedJobs.push(job);
                    // Storage.saveDeleted(deletedJobs); // Bật lại nếu Storage có hỗ trợ hàm này
                }

                alert("Đã xóa bài đăng thành công!");

                // Cập nhật lại giao diện
                if (typeof window.reloadJobs === 'function') {
                    window.reloadJobs();
                }
                return true;
            } catch (error) {
                console.error(error);
                alert("Đã xảy ra lỗi khi xóa công việc!");
                return false;
            }
        }
        return false;
    }
};