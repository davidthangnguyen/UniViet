/**
 * UniViet Background Service Worker
 * Xử lý logic background, lưu settings, cập nhật badge
 */

// Khởi tạo khi cài đặt extension
chrome.runtime.onInstalled.addListener(() => {
  // Thiết lập giá trị mặc định
  chrome.storage.sync.set({
    enabled: true
  }, () => {
    console.log('UniViet installed successfully');
    updateBadge(true);
  });
});

// Khởi động khi browser khởi động
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.sync.get(['enabled'], (result) => {
    updateBadge(result.enabled !== false);
  });
});

// Lắng nghe command từ keyboard shortcut
chrome.commands.onCommand.addListener((command) => {
  if (command === 'toggle-univiet') {
    toggleUniViet();
  }
});

// Lắng nghe message từ content script và popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateBadge') {
    updateBadge(request.enabled);
    sendResponse({ success: true });
  } else if (request.action === 'toggleUniViet') {
    toggleUniViet().then((enabled) => {
      sendResponse({ enabled: enabled });
    });
    return true; // Async response
  } else if (request.action === 'getStatus') {
    chrome.storage.sync.get(['enabled'], (result) => {
      sendResponse({ enabled: result.enabled !== false });
    });
    return true; // Async response
  } else if (request.action === 'setEnabled') {
    setEnabled(request.enabled).then(() => {
      sendResponse({ success: true });
    });
    return true; // Async response
  }
});

// Toggle bật/tắt UniViet
async function toggleUniViet() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['enabled'], (result) => {
      const newState = !(result.enabled !== false);
      
      chrome.storage.sync.set({ enabled: newState }, () => {
        updateBadge(newState);
        
        // Gửi message đến tất cả content scripts
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach((tab) => {
            chrome.tabs.sendMessage(tab.id, {
              action: 'setEnabled',
              enabled: newState
            }).catch(() => {
              // Ignore errors (tab có thể không có content script)
            });
          });
        });
        
        resolve(newState);
      });
    });
  });
}

// Đặt trạng thái enabled
async function setEnabled(enabled) {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ enabled: enabled }, () => {
      updateBadge(enabled);
      
      // Gửi message đến tất cả content scripts
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          chrome.tabs.sendMessage(tab.id, {
            action: 'setEnabled',
            enabled: enabled
          }).catch(() => {
            // Ignore errors
          });
        });
      });
      
      resolve();
    });
  });
}

// Cập nhật badge icon
function updateBadge(enabled) {
  if (enabled) {
    chrome.action.setBadgeText({ text: 'ON' });
    chrome.action.setBadgeBackgroundColor({ color: '#4CAF50' }); // Green
  } else {
    chrome.action.setBadgeText({ text: 'OFF' });
    chrome.action.setBadgeBackgroundColor({ color: '#F44336' }); // Red
  }
}
