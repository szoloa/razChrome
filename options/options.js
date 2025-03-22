document.addEventListener('DOMContentLoaded', init);

/* 初始化函数 */
function init() {
  // 初始化存储默认值
  chrome.storage.local.get(['txtFiles', 'activeFileIndex'], (data) => {
    if (!data.txtFiles) chrome.storage.local.set({ txtFiles: [] });
    if (typeof data.activeFileIndex !== 'number') {
      chrome.storage.local.set({ activeFileIndex: 0 });
    }
  });

  // 文件上传事件
  const fileInput = document.getElementById('fileInput');
  fileInput.addEventListener('change', handleFileUpload);

  // 单个事件监听器（重要修复）
  const fileList = document.getElementById('fileList');
  fileList.addEventListener('change', (event) => {
    if (event.target.classList.contains('file-radio')) {
      const index = parseInt(event.target.dataset.index, 10);
      handleFileChange(index);
    }
  });

  refreshFileList();
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const content = parseTXT(e.target.result);
    if (content.length === 0) {
      showStatus('文件中未找到有效链接', 'error');
      return;
    }
    saveFile(file.name, content);
    showStatus(`文件 ${file.name} 上传成功`, 'success');
    refreshFileList();
  };
  reader.readAsText(file);
}

// 状态显示函数
function showStatus(message, type = 'success') {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  statusDiv.style.display = 'block';
  setTimeout(() => {
    statusDiv.style.display = 'none';
  }, 3000);
}

// 解析TXT文件内容
function parseTXT(text) {
  return text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => {
      const firstSpace = line.indexOf(' ');
      if (firstSpace === -1) return null;
      return {
        title: line.substring(0, firstSpace),
        url: line.substring(firstSpace + 1).trim()
      };
    })
    .filter(entry => entry && isValidUrl(entry.url));
}

// URL验证
function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

// 保存到存储
function saveFile(filename, content) {
  chrome.storage.local.get(['txtFiles'], ({ txtFiles = [] }) => {
    const existingIndex = txtFiles.findIndex(f => f.name === filename);
    const newFile = { name: filename, content };
    
    if (existingIndex >= 0) {
      txtFiles[existingIndex] = newFile;
    } else {
      txtFiles.push(newFile);
    }
    
    chrome.storage.local.set({ txtFiles });
  });
}


/* 文件切换处理 */
function handleFileChange(index) {
  chrome.storage.local.get('txtFiles', ({ txtFiles = [] }) => {
    // 空文件列表保护
    if (txtFiles.length === 0) {
      showStatus('错误：没有可用的文件', 'error');
      return;
    }
    
    // 安全索引计算
    const validIndex = Math.max(0, Math.min(index, txtFiles.length - 1));
    
    chrome.storage.local.set({ activeFileIndex: validIndex }, () => {
      showStatus(`已切换到：${txtFiles[validIndex].name}`, 'success');
      refreshFileList(); // 确保使用回调更新
    });
  });
}

/* 刷新文件列表 */
function refreshFileList() {
  chrome.storage.local.get(['txtFiles', 'activeFileIndex'], ({ txtFiles = [], activeFileIndex = 0 }) => {
    const container = document.getElementById('fileList');
    
    // 空状态处理
    if (!txtFiles || txtFiles.length === 0) {
      container.innerHTML = '<div class="empty-state">暂无上传文件</div>';
      return;
    }

    // 安全索引计算
    const validIndex = Math.max(0, Math.min(activeFileIndex, txtFiles.length - 1));
    
    // 生成安全的HTML
    container.innerHTML = txtFiles.map((file, index) => `
      <div class="file-item">
        <input
          type="radio"
          class="file-radio"
          id="file${index}"
          data-index="${index}"
          ${index === validIndex ? 'checked' : ''}
        >
        <label for="file${index}">
          ${file.name} (${file.content.length} 链接)
        </label>
      </div>
    `).join('');
  });
}

// 其他辅助函数保持不变...