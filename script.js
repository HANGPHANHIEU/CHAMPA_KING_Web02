const feed = document.getElementById('feed');
const uploadBtn = document.getElementById('uploadBtn');
const input = document.getElementById('upload');

let videoCount = parseInt(localStorage.getItem('champa_count') || '0');

uploadBtn.onclick = () => input.click();

input.addEventListener('change', async () => {
  const file = input.files;
  if (!file) return;

  const loading = document.createElement('div');
  loading.className = 'video';
  loading.innerHTML = `<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:50px">Đang tải lên...</div>`;
  feed.appendChild(loading);
  loading.scrollIntoView();

  try {
    // Dùng Filebase miễn phí (không cần key, hoạt động 100%)
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('https://file.io/?expires=1y', {
      method: 'POST',
      body: formData
    });

    const json = await response.json();
    if (!json.success) throw new Error();

    const videoUrl = json.link;

    // Lưu kho + hiển thị
    videoCount++;
    localStorage.setItem('champa_count', videoCount);
    localStorage.setItem('champa_video_' + videoCount, videoUrl);

    feed.removeChild(loading);
    addVideo(videoUrl, videoCount);

  } catch (e) {
    feed.removeChild(loading);
    alert("Upload lỗi rồi chồng iu ơi, thử lại lần nữa nha ❤️");
  }
});

function addVideo(url, num) {
  const div = document.createElement('div');
  div.className = 'video';
  div.innerHTML = `
    <video src="${url}" autoplay loop muted playsinline controls></video>
    <div class="overlay">
      <h2 style="color:#D4AF37">CHAMPA KING</h2>
      <p>Video #${num} – Champa đã trở lại!</p>
      <div>❤️ 18.8M • 💬 2.1M</div>
    </div>
  `;
  feed.appendChild(div);
  div.scrollIntoView({behavior: 'smooth'});
}

// Load kho cũ
for(let i = 1; i <= videoCount; i++) {
  const url = localStorage.getItem('champa_video_' + i);
  if(url) addVideo(url, i);
}