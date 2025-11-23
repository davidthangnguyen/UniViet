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

    // Debug: Check if loaded in about:blank iframe (Google Docs)
    if (window.location.href === "about:blank") {
      console.log("[UniViet] Loaded in about:blank iframe!");
      console.log("[UniViet] Parent hostname:", window.parent?.location?.hostname);
    }

    // Debug & setup Google Docs specific handling
    if (window.location.hostname === "docs.google.com" ||
        (window.location.href === "about:blank" &&
         window.parent?.location?.hostname === "docs.google.com")) {
      console.log("[UniViet] Loaded on Google Docs:", window.location.href);
      setupGoogleDocsObserver();

      // Also check periodically
      const checkInterval = setInterval(() => {
        const editables = document.querySelectorAll('[contenteditable="true"]');
        if (editables.length > 0) {
          console.log("[UniViet] Found contentEditable elements:", editables.length);
          editables.forEach((el, i) => {
            console.log(`[UniViet] Element ${i}:`, {
              tagName: el.tagName,
              className: el.className,
              id: el.id,
              isContentEditable: el.isContentEditable
            });
          });
          clearInterval(checkInterval);
        }
      }, 500); // Check every 500ms

      // Stop after 10 seconds
      setTimeout(() => clearInterval(checkInterval), 10000);
    }
  }

  // Setup MutationObserver cho Google Docs
  function setupGoogleDocsObserver() {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if this node or its children are contentEditable
              if (node.isContentEditable) {
                console.log("[UniViet] New contentEditable detected:", {
                  tagName: node.tagName,
                  className: node.className,
                  id: node.id
                });
              }

              // Check children
              const editables = node.querySelectorAll && node.querySelectorAll('[contenteditable="true"]');
              if (editables && editables.length > 0) {
                console.log("[UniViet] Found", editables.length, "contentEditable children");
              }

              // Check for the about:blank iframe
              if (node.tagName === "IFRAME") {
                console.log("[UniViet] Found iframe:", {
                  className: node.className,
                  src: node.src,
                  id: node.id
                });
                if (node.className.includes("docs-texteventtarget-iframe") || node.src === "about:blank") {
                  console.log("[UniViet] Found Google Docs input iframe!");
                  tryInjectIntoIframe(node);
                }
              }
            }
          });
        }
      }
    });

    // Start observing the document
    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['contenteditable']
    });

    console.log("[UniViet] MutationObserver started for Google Docs");

    // Also check existing iframes
    setTimeout(() => {
      const iframes = document.querySelectorAll("iframe");
      console.log("[UniViet] Found", iframes.length, "iframes on page");
      iframes.forEach(iframe => {
        console.log("[UniViet] Iframe details:", {
          className: iframe.className,
          src: iframe.src,
          id: iframe.id
        });
        if (iframe.className.includes("docs-texteventtarget-iframe") || iframe.src === "about:blank") {
          console.log("[UniViet] Found Google Docs input iframe!");
          tryInjectIntoIframe(iframe);
        }
      });
    }, 1000);
  }

  // Try to inject event listeners into iframe
  function tryInjectIntoIframe(iframe) {
    try {
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) {
        console.log("[UniViet] Cannot access iframe document (sandbox/cross-origin)");
        return;
      }

      console.log("[UniViet] Successfully accessed iframe document!");
      console.log("[UniViet] iframe.contentWindow.location.href:", iframe.contentWindow?.location?.href);

      // Attach event listeners to iframe document
      iframeDoc.addEventListener("beforeinput", handleBeforeInput, true);
      iframeDoc.addEventListener("keypress", handleKeyPress, true);
      iframeDoc.addEventListener("keydown", handleKeyDown, true);

      console.log("[UniViet] Event listeners attached to iframe!");

      // Test: add a simple test listener
      iframeDoc.addEventListener("keydown", (e) => {
        console.log("[UniViet-TEST] iframe keydown received:", e.key);
      }, true);
    } catch (e) {
      console.log("[UniViet] Error accessing iframe:", e.message);
    }
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
    // Debug for ALL beforeinput events
    const isGDocsUrl = window.location.hostname === "docs.google.com" || window.location.href === "about:blank";
    if (isGDocsUrl) {
      console.log("[UniViet] beforeinput triggered:", {
        url: window.location.href,
        inputType: event.inputType,
        data: event.data,
        target: event.target,
        tagName: event.target.tagName,
        className: event.target.className,
        isContentEditable: event.target.isContentEditable
      });
    }

    const isGDocs = isGoogleDocsEditor(event.target);
    if (isGDocs) {
      console.log("[UniViet-GDocs] Detected as Google Docs element!");
    }

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
    if (isGDocs) {
      console.log("[UniViet-GDocs] textInfo:", textInfo);
    }
    if (!textInfo) return;

    // Lấy từ hiện tại
    const wordInfo = univiet.getCurrentWord(textInfo.value, textInfo.start);
    if (isGDocs) {
      console.log("[UniViet-GDocs] wordInfo:", wordInfo);
    }

    // Xử lý phím
    const result = univiet.processKey(wordInfo.word, key);
    if (isGDocs) {
      console.log("[UniViet-GDocs] processKey result:", result);
    }

    if (result && result.shouldReplace) {
      // Ngăn không cho trình duyệt xử lý input mặc định
      event.preventDefault();
      event.stopPropagation();

      if (isGDocs) {
        console.log("[UniViet-GDocs] Attempting to replace text...");
      }

      // Thay thế text
      univiet.replaceText(textInfo, result, wordInfo);

      if (isGDocs) {
        console.log("[UniViet-GDocs] Text replaced!");
      }
    }
  }

  // Xử lý keydown
  function handleKeyDown(event) {
    // Debug for Google Docs
    const isGDocsUrl = window.location.hostname === "docs.google.com" || window.location.href === "about:blank";
    if (isGDocsUrl && event.key && event.key.length === 1) {
      console.log("[UniViet] keydown triggered:", {
        url: window.location.href,
        key: event.key,
        target: event.target.tagName,
        className: event.target.className
      });
    }
    // Không làm gì, chỉ để bắt các phím đặc biệt nếu cần
  }

  // Xử lý keypress - Fallback cho trình duyệt cũ
  function handleKeyPress(event) {
    // Debug for Google Docs
    const isGDocsUrl = window.location.hostname === "docs.google.com" || window.location.href === "about:blank";
    if (isGDocsUrl) {
      console.log("[UniViet] keypress triggered:", {
        url: window.location.href,
        key: event.key,
        target: event.target.tagName,
        className: event.target.className
      });
    }

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
