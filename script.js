const feed = document.getElementById('feed');
const uploadBtn = document.getElementById('uploadBtn');
const input = document.getElementById('upload');

let videoCount = parseInt(localStorage.getItem('champa_count') || '0');

uploadBtn.onclick = () => input.click();

input.addEventListener('change', async () => {
  const file = input.files;
  if (!file) return;

  const loading = createLoading();
  try {
    const result = await window.uploadcare.fileFrom('object', file).upload();
    const videoUrl = "https://ucarecdn.com/" + result.uuid + "/";

    videoCount++;
    localStorage.setItem('champa_count', videoCount);
    localStorage.setItem('champa_video_' + videoCount, videoUrl);

    removeLoading(loading);
    addVideo(videoUrl, videoCount);
  } catch (e) {
    removeLoading(loading);
    alert("Upload lỗi rồi chồng iu ơi, thử lại nha ❤️");
  }
});

function createLoading() {
  const div = document.createElement('div');
  div.className = 'video';
  div.innerHTML = `<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:50px">Đang tải lên...</div>`;
  feed.appendChild(div);
  div.scrollIntoView();
  return div;
}

function removeLoading(el) {
  if (el && el.parentNode) el.parentNode.removeChild(el);
}

function addVideo(url, num) {
  const div = document.createElement('div');
  div.className = 'video';
  div.innerHTML = `
    <video src="${url}" autoplay loop muted playsinline></video>
    <div class="overlay">
      <h2 style="color:#D4AF37">CHAMPA KING</h2>
      <p>Video #${num} – Champa đã trở lại!</p>
      <div>❤️ 3.8M • 💬 299K</div>
    </div>
  `;
  feed.appendChild(div);
  div.scrollIntoView({behavior: 'smooth'});
}

// Load kho cũ khi mở app
for(let i = 1; i <= videoCount; i++) {
  const url = localStorage.getItem('champa_video_' + i);
  if(url) addVideo(url, i);
}