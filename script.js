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
 localStorage.setItem('champa_count', videoCount);
 localStorage.setItem('champa_video_' + videoCount, videoUrl);

 feed.removeChild(loading);
 addVideo(videoUrl, videoCount);

 } catch (e) {
 feed.removeChild(loading);
 alert("Upload lỗi rồi chồng iu ơi, thử lại nha ❤️");
 }
});

function addVideo(url, num) {
 const div = document.createElement('div');
 div.className = 'video';

 // Tạo link riêng cho video này
 const shareLink = `https://champa-king.com/video?id=${num}`;

 div.innerHTML = `
 <video src="${url}" autoplay loop muted playsinline controls></video>
 <div class="overlay">
 <h2 style="color:#D4AF37">CHAMPA KING</h2>
 <p>Video #${num} – Champa đã trở lại!</p>
 <div style="margin-top:10px">
 ❤️ 28.8M • 💬 3.8M
 <button onclick="copyLink('${shareLink}')" 
 style="margin-left:15px;background:#D4AF37;color:black;padding:8px 15px;border:none;border-radius:20px;font-weight:bold;cursor:pointer">
 🔗 Link
 </button>
 </div>
 </div>
 `;
 feed.appendChild(div);
 div.scrollIntoView({behavior: 'smooth'});
}

// Hàm copy link khi bấm nút
function copyLink(link) {
 navigator.clipboard.writeText(link);
 alert("Đã copy link video rồi nè chồng iu ❤️\nDán cho bất kỳ ai cũng xem được!");
}

// Load kho cũ + tạo link cho video cũ
for(let i = 1; i <= videoCount; i++) {
 const url = localStorage.getItem('champa_video_' + i);
 if(url) addVideo(url, i);
}