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
    if (element.isContentEditable) {
      // Đặc biệt: Google Docs sử dụng class .kix-* cho canvas editor
      // Cần xử lý khác cho Google Docs
      const className = element.className || "";
      const isGoogleDocs = className.includes("kix-") ||
                          element.closest && element.closest(".kix-appview-editor");

      if (isGoogleDocs) {
        // Google Docs detected - cần xử lý đặc biệt
        return true;
      }

      return true;
    }

    return false;
  }

  // Kiểm tra xem có phải Google Docs không
  function isGoogleDocsEditor(element) {
    if (!element) return false;

    const className = element.className || "";

    // Check các class đặc trưng của Google Docs
    if (className.includes("kix-")) return true;
    if (element.closest && element.closest(".kix-appview-editor")) return true;
    if (element.closest && element.closest(".kix-lineview")) return true;

    // Check URL
    if (window.location.hostname === "docs.google.com" &&
        window.location.pathname.includes("/document/")) {
      return element.isContentEditable;
    }

    return false;
  }

  // Xử lý beforeinput - Event hiện đại (Google Docs, modern apps)
  function handleBeforeInput(event) {
    // Kiểm tra enabled
    if (!isEnabled || !univiet) return;

    // Chỉ xử lý insertText events
    if (event.inputType !== "insertText") return;

    // Kiểm tra Ctrl/Alt
    if (event.ctrlKey || event.metaKey) return;
    if (event.altKey) return;

    // Lấy element
    const element = event.target;
    if (!shouldProcess(element)) return;

    // Lấy ký tự sắp được insert
    const key = event.data;
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

    if (result && result.shouldReplace) {
      // Ngăn không cho trình duyệt xử lý input mặc định
      event.preventDefault();
      event.stopPropagation();

      // Thay thế text
      univiet.replaceText(textInfo, result, wordInfo);
    }
  }

  // Xử lý keydown
  function handleKeyDown(event) {
    // Không làm gì, chỉ để bắt các phím đặc biệt nếu cần
  }

  // Xử lý keypress - Fallback cho trình duyệt cũ
  function handleKeyPress(event) {
    // Kiểm tra enabled
    if (!isEnabled || !univiet) return;

    // Kiểm tra Ctrl/Alt (trừ một số phím đặc biệt)
    if (event.ctrlKey || event.metaKey) return;
    if (event.altKey) return;

    // Lấy element
    const element = event.target;
    if (!shouldProcess(element)) return;

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

    if (result && result.shouldReplace) {
      // Ngăn không cho trình duyệt xử lý phím
      event.preventDefault();
      event.stopPropagation();

      // Thay thế text
      univiet.replaceText(textInfo, result, wordInfo);
    }
  }

  // Khởi động
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
