import { OrgService } from './org-service.js';
import { showToast } from './toast.js';

export function initOrgModal() {
    // Tạo khung modal ghi danh tổ chức nếu chưa có trên trang
    if (!document.getElementById('orgModal')) {
        const div = document.createElement('div');
        div.id = 'orgModalContainer';
        div.innerHTML = `
            <div id="orgModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm hidden items-center justify-center z-50 p-4">
                <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 p-6 space-y-4 relative">
                    <button id="btnCloseOrgModal" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
                    
                    <div class="text-center space-y-1">
                        <div class="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center text-xl mx-auto mb-1">
                            <i class="fa-solid fa-handshake"></i>
                        </div>
                        <h2 class="text-lg font-bold text-slate-900">Ghi danh Tổ chức / Đối tác</h2>
                        <p class="text-xs text-slate-500">Đăng ký thông tin để đồng hành cùng hệ thống việc làm</p>
                    </div>

                    <form id="orgForm" class="space-y-3">
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1">Tên tổ chức / Doanh nghiệp <span class="text-red-500">*</span></label>
                            <input type="text" id="orgNameInput" required placeholder="VD: Công ty TNHH ABC / Nhóm thiện nguyện..." class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600">
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            <div>
                                <label class="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại <span class="text-red-500">*</span></label>
                                <input type="tel" id="orgPhoneInput" required placeholder="0901234567" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600">
                            </div>
                            <div>
                                <label class="block text-xs font-semibold text-slate-700 mb-1">Khu vực / Tỉnh thành</label>
                                <input type="text" id="orgProvinceInput" placeholder="VD: An Giang" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600">
                            </div>
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1">Địa chỉ chi tiết</label>
                            <input type="text" id="orgAddressInput" placeholder="Số nhà, tên đường, phường/xã..." class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-slate-700 mb-1">Lĩnh vực / Thế mạnh hoạt động</label>
                            <input type="text" id="orgStrengthInput" placeholder="VD: Giới thiệu việc làm, tuyển dụng thời vụ..." class="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-600">
                        </div>
                        <button type="submit" class="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition text-sm shadow-sm cursor-pointer">Gửi đăng ký xét duyệt</button>
                    </form>
                </div>
            </div>`;
        document.body.appendChild(div);
    }

    const modal = document.getElementById('orgModal');
    const orgForm = document.getElementById('orgForm');

    // Đóng modal
    document.getElementById('btnCloseOrgModal')?.addEventListener('click', () => modal?.classList.add('hidden'));

    // Mở modal khi bấm nút ghi danh tổ chức trên header/menu (Giả sử nút có id là btnOpenOrgModal)
    document.getElementById('btnOpenOrgModal')?.addEventListener('click', () => {
        modal?.classList.remove('hidden');
        modal?.classList.add('flex');
    });

    // Xử lý submit form ghi danh
    orgForm?.addEventListener('submit', async (e) => {
        e.preventDefault();

        const orgData = {
            name: document.getElementById('orgNameInput').value.trim(),
            phone: document.getElementById('orgPhoneInput').value.trim(),
            province: document.getElementById('orgProvinceInput').value.trim(),
            address: document.getElementById('orgAddressInput').value.trim(),
            strength: document.getElementById('orgStrengthInput').value.trim(),
            status: 'pending'
        };

        try {
            const result = await OrgService.registerOrg(orgData);
            if (result) {
                showToast('Gửi đăng ký tổ chức thành công! Đang chờ admin phê duyệt.');
                orgForm.reset();
                modal?.classList.add('hidden');
                modal?.classList.remove('flex');
            } else {
                alert('Có lỗi xảy ra khi gửi đăng ký lên hệ thống. Vui lòng thử lại!');
            }
        } catch (error) {
            console.error("Lỗi gửi form:", error);
            alert('Không thể kết nối đến máy chủ Supabase.');
        }
    });
}