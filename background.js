chrome.commands.onCommand.addListener((command) => {
  console.log('this')
  if (command === 'open-random-link') {
    chrome.storage.local.get(['txtFiles', 'activeFileIndex'], (data) => {
      const { txtFiles = [], activeFileIndex = 0 } = data;
      const activeFile = txtFiles[activeFileIndex];

      if (activeFile?.content?.length > 0) {
        const randomIndex = Math.floor(Math.random() * activeFile.content.length);
        console.log(randomIndex)

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const tabId = tabs[0].id;
          chrome.tabs.update(tabId, { url: activeFile.content[randomIndex].url });
        });
      }
    });
  }
});