input.addEventListener('change', async () => {
  const file = input.files[0];
  if (!file) return;

  const loading = createLoading();

  try {
    const result = await uploadcare.fileFrom('object', file).upload();
    const videoUrl = result.cdnUrl;

    videoCount++;
    localStorage.setItem('champa_count', videoCount);
    localStorage.setItem('champa_video_' + videoCount, videoUrl);

    removeLoading(loading);
    addVideo(videoUrl, videoCount);
  } catch (e) {
    removeLoading(loading);
    console.error(e);
    alert("Upload lỗi rồi 😢 Kiểm tra Console nha");
  }
});