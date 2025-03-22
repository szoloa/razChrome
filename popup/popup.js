function showError(message) {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.className = 'error';
  statusDiv.style.display = 'block';
  setTimeout(() => window.close(), 1500);
}

chrome.storage.local.get(['txtFiles', 'activeFileIndex'], (data) => {
  const { txtFiles = [], activeFileIndex = 0 } = data;
  
  if (txtFiles.length === 0) {
    showError('请先在设置中上传TXT文件');
    return;
  }

  const activeFile = txtFiles[activeFileIndex];
  if (!activeFile?.content || activeFile.content.length === 0) {
    showError('当前文件没有有效链接');
    return;
  }

  const randomIndex = Math.floor(Math.random() * activeFile.content.length);
//   chrome.tabs.create({ url: activeFile.content[randomIndex].url });
//   window.close();
// });

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tabId = tabs[0].id;
  console.log("is it")
  chrome.tabs.update(tabId, { url: activeFile.content[randomIndex].url });
});
window.close();
});