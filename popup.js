/**
 * UniViet Popup Script
 * Xử lý logic cho popup UI
 */

(function () {
  "use strict";

  const toggleSwitch = document.getElementById("toggleSwitch");
  const statusText = document.getElementById("statusText");
  const demoInput = document.getElementById("demoInput");

  // Khởi tạo UniViet core cho demo input
  let univiet = null;

  // Load trạng thái hiện tại
  function loadStatus() {
    chrome.storage.sync.get(["enabled"], (result) => {
      const enabled = result.enabled !== false;
      updateUI(enabled);
    });
  }

  // Cập nhật UI
  function updateUI(enabled) {
    toggleSwitch.checked = enabled;
    statusText.textContent = enabled ? "Đang bật" : "Đang tắt";
    statusText.className =
      "status-value " + (enabled ? "status-on" : "status-off");
  }

  // Xử lý toggle switch
  toggleSwitch.addEventListener("change", () => {
    const enabled = toggleSwitch.checked;

    // Lưu vào storage
    chrome.storage.sync.set({ enabled: enabled }, () => {
      // Gửi message đến background
      chrome.runtime.sendMessage(
        {
          action: "setEnabled",
          enabled: enabled,
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error("Error:", chrome.runtime.lastError);
          } else {
            updateUI(enabled);
          }
        },
      );
    });
  });

  // Xử lý keypress cho demo input
  demoInput.addEventListener("keypress", (event) => {
    if (!univiet) return;

    // Kiểm tra Ctrl/Alt
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    // Lấy key
    const key = event.key;
    if (!key || key.length !== 1) return;

    // Kiểm tra có phải chữ cái không
    if (!/[a-zA-Z]/.test(key)) return;

    // Lấy thông tin text
    const textInfo = univiet.getTextInfo(demoInput);
    if (!textInfo) return;

    // Lấy từ hiện tại
    const wordInfo = univiet.getCurrentWord(textInfo.value, textInfo.start);

    // Xử lý phím
    const result = univiet.processKey(wordInfo.word, key);

    if (result && result.shouldReplace) {
      // Ngăn trình duyệt xử lý
      event.preventDefault();
      event.stopPropagation();

      // Thay thế text
      univiet.replaceText(textInfo, result, wordInfo);
    }
  });

  // Focus vào demo input
  demoInput.addEventListener("focus", () => {
    demoInput.select();
  });

  // Khởi tạo
  if (typeof UniVietCore !== "undefined") {
    univiet = new UniVietCore();
    univiet.enabled = true;
  } else {
    console.error("UniVietCore not loaded");
  }

  loadStatus();
})();
