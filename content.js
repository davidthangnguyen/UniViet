/**
 * UniViet Content Script
 * Xử lý sự kiện bàn phím trên trang web
 */

(function () {
  "use strict";

  let univiet = null;
  let isEnabled = true;

  // Khởi tạo
  function init() {
    univiet = new UniVietCore();
    loadSettings();
    attachEventListeners();
  }

  // Load settings từ storage
  function loadSettings() {
    chrome.storage.sync.get(["enabled"], (result) => {
      isEnabled = result.enabled !== false; // Mặc định là true
      univiet.enabled = isEnabled;
      updateBadge();
    });
  }

  // Cập nhật badge icon
  function updateBadge() {
    chrome.runtime.sendMessage({
      action: "updateBadge",
      enabled: isEnabled,
    });
  }

  // Attach event listeners
  function attachEventListeners() {
    // Keydown để bắt các phím đặc biệt
    document.addEventListener("keydown", handleKeyDown, true);

    // Keypress để xử lý chính
    document.addEventListener("keypress", handleKeyPress, true);

    // THÊM: Keyup để xử lý input events (cho các site dùng custom handlers)
    document.addEventListener("keyup", handleKeyUp, true);

    // Lắng nghe message từ background
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "toggleUniViet") {
        isEnabled = !isEnabled;
        univiet.enabled = isEnabled;
        updateBadge();
        sendResponse({ enabled: isEnabled });
      } else if (request.action === "setEnabled") {
        isEnabled = request.enabled;
        univiet.enabled = isEnabled;
        updateBadge();
        sendResponse({ enabled: isEnabled });
      }
      return true;
    });
  }

  // Kiểm tra element có được xử lý không
  function shouldProcess(element) {
    if (!element) return false;

    // Kiểm tra readonly/disabled
    if (element.readOnly || element.disabled) return false;

    // Kiểm tra type
    const tagName = element.tagName.toLowerCase();
    const inputTypes = ["text", "search", "tel", "url", "email", "textarea"];

    if (tagName === "input") {
      const type = (element.type || "text").toLowerCase();
      return inputTypes.includes(type);
    }

    if (tagName === "textarea") return true;

    // Kiểm tra contentEditable
    if (element.isContentEditable) return true;

    return false;
  }

  // Xử lý keydown
  function handleKeyDown(event) {
    // DEBUG: Log keydown events
    const element = event.target;
    if (shouldProcess(element)) {
      console.log('[UniViet] keydown:', event.key, 'target:', element.tagName, element.type);
    }
  }

  // Xử lý keypress
  function handleKeyPress(event) {
    // DEBUG: Log keypress events
    const element = event.target;
    console.log('[UniViet] keypress triggered:', event.key, 'enabled:', isEnabled);

    // Kiểm tra enabled
    if (!isEnabled || !univiet) {
      console.log('[UniViet] Skipped: enabled=', isEnabled, 'univiet=', !!univiet);
      return;
    }

    // Kiểm tra Ctrl/Alt (trừ một số phím đặc biệt)
    if (event.ctrlKey || event.metaKey) {
      console.log('[UniViet] Skipped: Ctrl/Meta key');
      return;
    }
    if (event.altKey) {
      console.log('[UniViet] Skipped: Alt key');
      return;
    }

    // Lấy element
    if (!shouldProcess(element)) {
      console.log('[UniViet] Skipped: shouldProcess=false', element);
      return;
    }

    // Lấy key
    const key = event.key;
    if (!key || key.length !== 1) {
      console.log('[UniViet] Skipped: invalid key length');
      return;
    }

    // Kiểm tra có phải chữ cái không
    if (!/[a-zA-Z]/.test(key)) {
      console.log('[UniViet] Skipped: not a letter');
      return;
    }

    console.log('[UniViet] Processing key:', key);

    // Lấy thông tin text hiện tại
    const textInfo = univiet.getTextInfo(element);
    if (!textInfo) {
      console.log('[UniViet] Skipped: no textInfo');
      return;
    }

    // Lấy từ hiện tại
    const wordInfo = univiet.getCurrentWord(textInfo.value, textInfo.start);
    console.log('[UniViet] Current word:', wordInfo.word);

    // Xử lý phím
    const result = univiet.processKey(wordInfo.word, key);
    console.log('[UniViet] Process result:', result);

    if (result && result.shouldReplace) {
      // Ngăn không cho trình duyệt xử lý phím
      event.preventDefault();
      event.stopPropagation();

      console.log('[UniViet] Replacing text with:', result.text);
      // Thay thế text
      univiet.replaceText(textInfo, result, wordInfo);
    }
  }

  // Xử lý keyup (fallback cho các site dùng custom event handlers)
  function handleKeyUp(event) {
    // Tạm thời không dùng, chỉ để debug
  }

  // Khởi động
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
