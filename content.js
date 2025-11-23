/**
 * UniViet Content Script
 * Xử lý sự kiện bàn phím trên trang web
 */

(function () {
  "use strict";

  let univiet = null;
  let isEnabled = true;

  // Debug flag
  const DEBUG = true;

  // Khởi tạo
  function init() {
    univiet = new UniVietCore();
    loadSettings();
    attachEventListeners();
    if (DEBUG) console.log("[UniViet] Initialized on:", window.location.href);
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
    // beforeinput - Event hiện đại cho text input (hỗ trợ Google Docs)
    document.addEventListener("beforeinput", handleBeforeInput, true);

    // Keypress - Fallback cho các trình duyệt cũ
    document.addEventListener("keypress", handleKeyPress, true);

    // Keydown để bắt các phím đặc biệt
    document.addEventListener("keydown", handleKeyDown, true);

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

  // Xử lý beforeinput - Event hiện đại (Google Docs, modern apps)
  function handleBeforeInput(event) {
    if (DEBUG) console.log("[UniViet] beforeinput triggered:", {
      inputType: event.inputType,
      data: event.data,
      target: event.target,
      tagName: event.target.tagName,
      isContentEditable: event.target.isContentEditable
    });

    // Kiểm tra enabled
    if (!isEnabled || !univiet) {
      if (DEBUG) console.log("[UniViet] Skipped: not enabled or not initialized");
      return;
    }

    // Chỉ xử lý insertText events
    if (event.inputType !== "insertText") {
      if (DEBUG) console.log("[UniViet] Skipped: inputType not insertText");
      return;
    }

    // Kiểm tra Ctrl/Alt
    if (event.ctrlKey || event.metaKey) {
      if (DEBUG) console.log("[UniViet] Skipped: Ctrl/Meta key");
      return;
    }
    if (event.altKey) {
      if (DEBUG) console.log("[UniViet] Skipped: Alt key");
      return;
    }

    // Lấy element
    const element = event.target;
    const shouldProc = shouldProcess(element);
    if (DEBUG) console.log("[UniViet] shouldProcess:", shouldProc, {
      tagName: element.tagName,
      type: element.type,
      isContentEditable: element.isContentEditable,
      readOnly: element.readOnly,
      disabled: element.disabled
    });
    if (!shouldProc) return;

    // Lấy ký tự sắp được insert
    const key = event.data;
    if (!key || key.length !== 1) {
      if (DEBUG) console.log("[UniViet] Skipped: invalid key data");
      return;
    }

    // Kiểm tra có phải chữ cái không
    if (!/[a-zA-Z]/.test(key)) {
      if (DEBUG) console.log("[UniViet] Skipped: not a letter");
      return;
    }

    // Lấy thông tin text hiện tại
    const textInfo = univiet.getTextInfo(element);
    if (DEBUG) console.log("[UniViet] textInfo:", textInfo);
    if (!textInfo) return;

    // Lấy từ hiện tại
    const wordInfo = univiet.getCurrentWord(textInfo.value, textInfo.start);
    if (DEBUG) console.log("[UniViet] wordInfo:", wordInfo);

    // Xử lý phím
    const result = univiet.processKey(wordInfo.word, key);
    if (DEBUG) console.log("[UniViet] processKey result:", result);

    if (result && result.shouldReplace) {
      // Ngăn không cho trình duyệt xử lý input mặc định
      event.preventDefault();
      event.stopPropagation();

      // Thay thế text
      univiet.replaceText(textInfo, result, wordInfo);
      if (DEBUG) console.log("[UniViet] Text replaced successfully");
    }
  }

  // Xử lý keydown
  function handleKeyDown(event) {
    // Không làm gì, chỉ để bắt các phím đặc biệt nếu cần
  }

  // Xử lý keypress - Fallback cho trình duyệt cũ
  function handleKeyPress(event) {
    if (DEBUG) console.log("[UniViet] keypress triggered:", {
      key: event.key,
      target: event.target,
      tagName: event.target.tagName
    });

    // Kiểm tra enabled
    if (!isEnabled || !univiet) {
      if (DEBUG) console.log("[UniViet] keypress: not enabled");
      return;
    }

    // Kiểm tra Ctrl/Alt (trừ một số phím đặc biệt)
    if (event.ctrlKey || event.metaKey) return;
    if (event.altKey) return;

    // Lấy element
    const element = event.target;
    if (!shouldProcess(element)) {
      if (DEBUG) console.log("[UniViet] keypress: shouldProcess false");
      return;
    }

    // Lấy key
    const key = event.key;
    if (!key || key.length !== 1) return;

    // Kiểm tra có phải chữ cái không
    if (!/[a-zA-Z]/.test(key)) return;

    // Lấy thông tin text hiện tại
    const textInfo = univiet.getTextInfo(element);
    if (!textInfo) return;

    // Lấy từ hiện tại
    const wordInfo = univiet.getCurrentWord(textInfo.value, textInfo.start);

    // Xử lý phím
    const result = univiet.processKey(wordInfo.word, key);
    if (DEBUG) console.log("[UniViet] keypress processKey result:", result);

    if (result && result.shouldReplace) {
      // Ngăn không cho trình duyệt xử lý phím
      event.preventDefault();
      event.stopPropagation();

      // Thay thế text
      univiet.replaceText(textInfo, result, wordInfo);
      if (DEBUG) console.log("[UniViet] keypress: text replaced");
    }
  }

  // Khởi động
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
