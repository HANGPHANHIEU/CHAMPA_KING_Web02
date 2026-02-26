const feed = document.getElementById('feed');
const uploadBtn = document.getElementById('uploadBtn');
const input = document.getElementById('upload');

let videoCount = parseInt(localStorage.getItem('champa_count') || '0');

uploadBtn.onclick = () => input.click();

input.addEventListener('change', async () => {
 const file = input.files0];
 if (!file) return;

 const loading = document.createElement('div');
 loading.className = 'video';
 loading.innerHTML = `<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:50px">Đang tải lên...</div>`;
 feed.appendChild(loading);
 loading.scrollIntoView();

 try {
 const formData = new FormData();
 formData.append('file', file);

 const response = await fetch('https://file.io/?expires=1y', {
 method: 'POST',
 body: formData
 });

 const json = await response.json();
 if (!json.success) throw new Error();

 const videoUrl = json.link;
 videoCount++;

 // Lưu kho
 localStorage.setItem('champa_count', videoCount);
 localStorage.setItem('champa_video_' + videoCount, videoUrl);

 feed.removeChild(loading);
 addVideoWithShopLink(videoUrl, videoCount);

 } catch (e) {
 feed.removeChild(loading);
 alert("Upload lỗi rồi chồng iu ơi, thử lại nha ❤️");
 }
});

function addVideoWithShopLink(url, num) {
 // Link sản phẩm bán hàng của chồng (chồng thay link Shopee/TikTok Shop ở đây nha)
 const shopLink = "https://shopee.vn/product/123456789/987654321"; // ← chồng sửa link này

 const div = document.createElement('div');
 div.className = 'video';
 div.innerHTML = `
 <video src="${url}" autoplay loop muted playsinline controls></video>
 <div class="overlay">
 <h2 style="color:#D4AF37">CHAMPA KING</h2>
 <p>Video #${num} – Champa sống lại rồi!</p>
 <div style="margin-top:15px;display:flex;gap:12px;flex-wrap:wrap">
 <span>❤️ 58.8M • 💬 8.8M</span>
 
 <!-- Nút MUA HÀNG -->
 <a href="${shopLink}" target="_blank"
 style="background:#FF4500;color:white;padding:12px 24px;border-radius:30px;
 text-decoration:none;font-weight:bold;font-size:16px;
 box-shadow:0 4px 15px rgba(255,69,0,0.6)">
 🛒 MUA NGAY
 </a>
 
 <!-- Nút chia sẻ link video -->
 <button onclick="copyLink('https://champa-king.com/video?id=${num}')" 
 style="background:#D4AF37;color:black;padding:12px 20px;border:none;border-radius:30px;
 font-weight:bold;cursor:pointer;font-size:16px">
 🔗 Link
 </button>
 </div>
 </div>
 `;
 feed.appendChild(div);
 div.scrollIntoView({behavior: 'smooth'});
}

function copyLink(link) {
 navigator.clipboard.writeText(link);
 alert("Đã copy link video rồi nè chồng iu! 🎉\nGửi cho khách là xem + mua hàng ngay!");
}

// Load kho cũ + thêm nút mua hàng cho video cũ
for(let i = 1; i <= videoCount; i++) {
 const url = localStorage.getItem('champa_video_' + i);
 if(url) addVideoWithShopLink(url, i);
}