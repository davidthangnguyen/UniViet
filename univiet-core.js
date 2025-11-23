/**
 * UniViet Core Engine v1.0.0
 * Bộ gõ tiếng Việt TELEX với quy tắc W đặc biệt
 */

class UniVietCore {
  constructor() {
    this.enabled = true;

    // Bảng chữ cái tiếng Việt
    this.vowels = "aăâeêioôơuưy";
    this.vowelsUpper = "AĂÂEÊIOÔƠUƯY";

    // Nguyên âm đặc biệt (có dấu mũ/sừng)
    this.specialVowels = "ăâêôơư";
    this.specialVowelsUpper = "ĂÂÊÔƠƯ";

    // Bảng mã Unicode
    this.charMap = {
      // Nguyên âm không dấu
      a: 97,
      ă: 259,
      â: 226,
      e: 101,
      ê: 234,
      i: 105,
      o: 111,
      ô: 244,
      ơ: 417,
      u: 117,
      ư: 432,
      y: 121,
      d: 100,
      đ: 273,

      // Chữ hoa
      A: 65,
      Ă: 258,
      Â: 194,
      E: 69,
      Ê: 202,
      I: 73,
      O: 79,
      Ô: 212,
      Ơ: 416,
      U: 85,
      Ư: 431,
      Y: 89,
      D: 68,
      Đ: 272,
    };

    // Bảng dấu thanh (sắc, huyền, hỏi, ngã, nặng)
    this.toneMarks = {
      s: [225, 7855, 7845, 233, 7871, 237, 243, 7889, 7899, 250, 7913, 253], // Sắc
      f: [224, 7857, 7847, 232, 7873, 236, 242, 7891, 7901, 249, 7915, 7923], // Huyền
      r: [
        7843, 7859, 7849, 7867, 7875, 7881, 7887, 7893, 7903, 7911, 7917, 7927,
      ], // Hỏi
      x: [227, 7861, 7851, 7869, 7877, 297, 245, 7895, 7905, 361, 7919, 7929], // Ngã
      j: [
        7841, 7863, 7853, 7865, 7879, 7883, 7885, 7897, 7907, 7909, 7921, 7925,
      ], // Nặng
    };

    // Bảng dấu thanh cho chữ HOA
    this.toneMarksUpper = {
      s: [193, 7854, 7844, 201, 7870, 205, 211, 7888, 7898, 218, 7912, 221],
      f: [192, 7856, 7846, 200, 7872, 204, 210, 7890, 7900, 217, 7914, 7922],
      r: [
        7842, 7858, 7848, 7866, 7874, 7880, 7886, 7892, 7902, 7910, 7916, 7926,
      ],
      x: [195, 7860, 7850, 7868, 7876, 296, 213, 7894, 7904, 360, 7918, 7928],
      j: [
        7840, 7862, 7852, 7864, 7878, 7882, 7884, 7896, 7906, 7908, 7920, 7924,
      ],
    };

    // Thứ tự nguyên âm để ánh xạ dấu
    this.baseVowels = [
      "a",
      "ă",
      "â",
      "e",
      "ê",
      "i",
      "o",
      "ô",
      "ơ",
      "u",
      "ư",
      "y",
    ];
    this.baseVowelsUpper = [
      "A",
      "Ă",
      "Â",
      "E",
      "Ê",
      "I",
      "O",
      "Ô",
      "Ơ",
      "U",
      "Ư",
      "Y",
    ];
  }

  /**
   * Kiểm tra ký tự có phải nguyên âm không
   */
  isVowel(char) {
    return (
      this.vowels.includes(char.toLowerCase()) ||
      this.specialVowels.includes(char.toLowerCase())
    );
  }

  /**
   * Kiểm tra ký tự có phải nguyên âm đặc biệt (có dấu mũ/sừng)
   */
  isSpecialVowel(char) {
    const lower = char.toLowerCase();
    return (
      this.specialVowels.includes(lower) ||
      this.specialVowelsUpper.includes(char)
    );
  }

  /**
   * Kiểm tra ký tự có phải chữ cái không
   */
  isLetter(char) {
    return /[a-zA-ZàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđĐ]/i.test(
      char,
    );
  }

  /**
   * Chuyển đổi chữ thường sang chữ hoa tiếng Việt
   */
  toUpperCase(char) {
    const lower = "aăâeêioôơuưyđ";
    const upper = "AĂÂEÊIOÔƠUƯYĐ";
    const idx = lower.indexOf(char);
    return idx >= 0 ? upper[idx] : char.toUpperCase();
  }

  /**
   * Kiểm tra chữ cái có phải chữ hoa không
   */
  isUpperCase(char) {
    return char === this.toUpperCase(char) && char !== char.toLowerCase();
  }

  /**
   * Lấy text và vị trí con trỏ từ element
   */
  getTextInfo(element) {
    let value, start, end;

    if (element.isContentEditable) {
      const selection = window.getSelection();
      if (!selection.rangeCount) return null;

      const range = selection.getRangeAt(0);
      let textNode = range.startContainer;

      // Nếu startContainer là element node (chưa có text), tìm hoặc tạo text node
      if (textNode.nodeType !== Node.TEXT_NODE) {
        // Tìm text node con đầu tiên
        let foundTextNode = null;

        // Nếu element có childNodes, tìm text node
        if (textNode.childNodes && textNode.childNodes.length > 0) {
          for (let i = 0; i < textNode.childNodes.length; i++) {
            if (textNode.childNodes[i].nodeType === Node.TEXT_NODE) {
              foundTextNode = textNode.childNodes[i];
              break;
            }
          }
        }

        // Nếu không tìm thấy text node, tạo mới
        if (!foundTextNode) {
          foundTextNode = document.createTextNode("");
          textNode.appendChild(foundTextNode);
        }

        textNode = foundTextNode;

        // Cập nhật range để trỏ vào text node mới
        try {
          range.setStart(textNode, 0);
          range.setEnd(textNode, 0);
        } catch (e) {
          // Nếu không set được range, return null
          return null;
        }
      }

      value = textNode.textContent || "";
      start = range.startOffset;
      end = range.endOffset;

      return { value, start, end, element, textNode };
    } else {
      value = element.value || "";
      start = element.selectionStart;
      end = element.selectionEnd;

      return { value, start, end, element };
    }
  }

  /**
   * Lấy từ hiện tại đang gõ
   */
  getCurrentWord(text, position) {
    let start = position - 1;
    let word = "";

    // Lùi về để lấy từ
    while (start >= 0 && this.isLetter(text[start])) {
      word = text[start] + word;
      start--;
    }

    return {
      word: word,
      startPos: start + 1,
      endPos: position,
    };
  }

  /**
   * Xóa dấu thanh khỏi ký tự (GIỮ NGUYÊN dấu mũ/sừng)
   */
  removeTone(char) {
    const charCode = char.charCodeAt(0);

    // Tìm trong bảng dấu
    for (const tone in this.toneMarks) {
      const idx = this.toneMarks[tone].indexOf(charCode);
      if (idx >= 0) {
        return this.baseVowels[idx];
      }
    }

    for (const tone in this.toneMarksUpper) {
      const idx = this.toneMarksUpper[tone].indexOf(charCode);
      if (idx >= 0) {
        return this.baseVowelsUpper[idx];
      }
    }

    return char;
  }

  /**
   * Lấy dấu thanh từ ký tự
   */
  getTone(char) {
    const charCode = char.charCodeAt(0);

    for (const tone in this.toneMarks) {
      if (this.toneMarks[tone].indexOf(charCode) >= 0) {
        return tone;
      }
    }

    for (const tone in this.toneMarksUpper) {
      if (this.toneMarksUpper[tone].indexOf(charCode) >= 0) {
        return tone;
      }
    }

    return "";
  }

  /**
   * Thêm dấu thanh vào ký tự
   */
  addTone(char, tone) {
    const baseChar = this.removeTone(char);
    const isUpper = this.isUpperCase(baseChar);

    const baseIdx = isUpper
      ? this.baseVowelsUpper.indexOf(baseChar)
      : this.baseVowels.indexOf(baseChar);

    if (baseIdx < 0) return char;

    const toneMap = isUpper ? this.toneMarksUpper[tone] : this.toneMarks[tone];
    if (!toneMap) return char;

    return String.fromCharCode(toneMap[baseIdx]);
  }

  /**
   * Kiểm tra và UNDO dấu cho vần oa/uy khi thêm phụ âm
   * VD: họa + t → hoạt (chuyển dấu từ o sang a)
   */
  checkAndUndoToneForOA_UY(word, key) {
    // Tìm vần oa hoặc uy có dấu ở o/u từ cuối lên
    for (let i = word.length - 2; i >= 0; i--) {
      const char1 = word[i]; // o hoặc u
      const char2 = word[i + 1]; // a hoặc y

      const char1Lower = this.removeTone(char1).toLowerCase();
      const char2Lower = char2.toLowerCase();

      // Check vần oa với dấu ở o
      if (char1Lower === "o" && char2Lower === "a") {
        const tone = this.getTone(char1);
        if (tone) {
          // UNDO: o có dấu → a có dấu
          const baseO = this.removeTone(char1);
          const newA = this.addTone(char2, tone);
          const remaining = word.substring(i + 2); // Phần sau "oa"

          return {
            text: baseO + newA + remaining + key,
            shouldReplace: true,
            deleteCount: word.length - i,
          };
        }
      }

      // Check vần uy với dấu ở u
      if (char1Lower === "u" && char2Lower === "y") {
        const tone = this.getTone(char1);
        if (tone) {
          const baseU = this.removeTone(char1);
          const newY = this.addTone(char2, tone);
          const remaining = word.substring(i + 2);

          return {
            text: baseU + newY + remaining + key,
            shouldReplace: true,
            deleteCount: word.length - i,
          };
        }
      }
    }

    return null;
  }

  /**
   * Merge cặp ký tự giống nhau gần nhất thành ký tự đích
   * Ví dụ: mergePairs("dieud", "d", "đ") → "điêu"
   *        mergePairs("goro", "o", "ô") → "gổ" (giữ dấu hỏi từ ỏ)
   *
   * @param {string} text - Chuỗi cần xử lý
   * @param {string} char - Ký tự cần tìm cặp (base character không dấu)
   * @param {string} target - Ký tự đích sau khi merge
   * @returns {string} - Chuỗi đã merge
   */
  mergePairs(text, char, target) {
    let result = text;
    let changed = true;

    // Lặp cho đến khi không còn cặp nào
    while (changed) {
      changed = false;

      // Tìm 2 ký tự "char" gần nhau nhất (từ cuối lên)
      // So sánh base character (bỏ dấu thanh) để match cả "o" và "õ", "ỏ", v.v.
      // Đặc biệt: "đ" cũng được coi là "d"
      let lastIndex = -1;
      let lastChar = '';
      let secondLastIndex = -1;
      let secondLastChar = '';

      for (let i = result.length - 1; i >= 0; i--) {
        const currentChar = result[i];
        const currentCharLower = currentChar.toLowerCase();

        // Base character: bỏ dấu thanh, và đặc biệt xử lý đ→d
        let baseChar = this.removeTone(currentCharLower);
        if (baseChar === 'đ') baseChar = 'd';
        if (baseChar === 'Đ') baseChar = 'D';

        const targetChar = char.toLowerCase();
        if (baseChar === targetChar) {
          if (lastIndex === -1) {
            lastIndex = i;
            lastChar = currentChar;
          } else {
            secondLastIndex = i;
            secondLastChar = currentChar;
            break;
          }
        }
      }

      // Nếu tìm thấy ít nhất 2 ký tự
      if (secondLastIndex >= 0 && lastIndex >= 0) {
        // Lấy dấu thanh từ ký tự đầu tiên (nếu có)
        const tone1 = this.getTone(secondLastChar);
        const tone2 = this.getTone(lastChar);
        const toneToKeep = tone1 || tone2; // Ưu tiên dấu từ ký tự đầu

        // Xác định target character (giữ case)
        let finalTarget = target;
        if (this.isUpperCase(secondLastChar)) {
          finalTarget = this.toUpperCase(target);
        }

        // Apply dấu thanh lên target (nếu có)
        if (toneToKeep) {
          finalTarget = this.addTone(finalTarget, toneToKeep);
        }

        // Merge: xóa cả 2 ký tự và thay bằng target (có dấu thanh)
        result = result.substring(0, secondLastIndex) +
                 finalTarget +
                 result.substring(secondLastIndex + 1, lastIndex) +
                 result.substring(lastIndex + 1);
        changed = true;
      }
    }

    return result;
  }

  /**
   * Áp dụng tất cả transformations TELEX lên toàn bộ từ
   * Xử lý các patterns cách xa nhau (vd: dieeudf → điều)
   *
   * @param {string} text - Chuỗi cần normalize
   * @returns {string} - Chuỗi đã được transform
   */
  applyAllTransformations(text) {
    if (!text || text.length === 0) return text;

    let result = text;
    let changed = true;
    let iterations = 0;
    const MAX_ITERATIONS = 10; // Tránh infinite loop

    // Lặp cho đến khi không còn thay đổi
    while (changed && iterations < MAX_ITERATIONS) {
      changed = false;
      iterations++;
      const oldResult = result;

      // 1. Xử lý các cặp ký tự giống nhau (cả liền nhau và cách xa)
      // dd → đ (scan từ cuối lên để merge cặp gần nhất trước)
      result = this.mergePairs(result, 'd', 'đ');
      result = this.mergePairs(result, 'D', 'Đ');

      // aa → â
      result = this.mergePairs(result, 'a', 'â');
      result = this.mergePairs(result, 'A', 'Â');

      // ee → ê
      result = this.mergePairs(result, 'e', 'ê');
      result = this.mergePairs(result, 'E', 'Ê');

      // oo → ô
      result = this.mergePairs(result, 'o', 'ô');
      result = this.mergePairs(result, 'O', 'Ô');

      // 2. Xử lý các quy tắc W phức tạp (chỉ cho patterns liền nhau)
      // 2.1. uow → ươ, uôw → ươ
      result = result.replace(/uow/g, 'ươ')
                     .replace(/uôw/g, 'ươ')
                     .replace(/UOW/g, 'ƯƠ')
                     .replace(/UÔW/g, 'ƯƠ')
                     .replace(/Uow/g, 'Ươ')
                     .replace(/Uôw/g, 'Ươ');

      // 2.2. aw → ă
      result = result.replace(/([^ơưw])aw/g, '$1ă')
                     .replace(/^aw/g, 'ă')
                     .replace(/([^ƠƯW])AW/g, '$1Ă')
                     .replace(/^AW/g, 'Ă')
                     .replace(/([^ƠƯW])Aw/g, '$1Ă')
                     .replace(/^Aw/g, 'Ă');

      // 2.3. ow → ơ
      result = result.replace(/([^ư])ow/g, '$1ơ')
                     .replace(/^ow/g, 'ơ')
                     .replace(/([^Ư])OW/g, '$1Ơ')
                     .replace(/^OW/g, 'Ơ')
                     .replace(/([^Ư])Ow/g, '$1Ơ')
                     .replace(/^Ow/g, 'Ơ');

      // 2.4. uw → ư (không phải sau q)
      result = result.replace(/([^q])uw/g, '$1ư')
                     .replace(/^uw/g, 'ư')
                     .replace(/([^Q])UW/g, '$1Ư')
                     .replace(/^UW/g, 'Ư')
                     .replace(/([^Q])Uw/g, '$1Ư')
                     .replace(/^Uw/g, 'Ư');

      // 2.5. ww → wư
      result = result.replace(/ww/g, 'wư').replace(/WW/g, 'WƯ').replace(/Ww/g, 'Wư');

      // 2.6. w đơn → ư
      result = result.replace(/([^ươw])w([^w])/g, '$1ư$2')
                     .replace(/^w([^w])/g, 'ư$1')
                     .replace(/([^ươw])w$/g, '$1ư')
                     .replace(/^w$/g, 'ư')
                     .replace(/([^ƯƠW])W([^W])/g, '$1Ư$2')
                     .replace(/^W([^W])/g, 'Ư$1')
                     .replace(/([^ƯƠW])W$/g, '$1Ư')
                     .replace(/^W$/g, 'Ư');

      // Kiểm tra xem có thay đổi không
      if (result !== oldResult) {
        changed = true;
      }
    }

    return result;
  }

  /**
   * Xử lý phím vừa nhấn với TELEX
   */
  processKey(word, key) {
    if (!word || word.length === 0) {
      // Xử lý w đầu tiên
      if (key === "w" || key === "W") {
        return {
          text: key === "w" ? "ư" : "Ư",
          shouldReplace: true,
          deleteCount: 0,
        };
      }
      return null;
    }

    const lastChar = word[word.length - 1];
    const lastCharLower = lastChar.toLowerCase();
    const prevChar = word.length >= 2 ? word[word.length - 2] : "";
    const prevCharLower = prevChar.toLowerCase();

    // ================================================================
    // 0. UNDO dấu cho oa/uy khi gõ phụ âm
    // ================================================================
    const isConsonant = /^[bcđfghjklmnpqrstvxz]$/i.test(key);
    const isSpecialKey = [
      "s",
      "f",
      "r",
      "x",
      "j",
      "z",
      "w",
      "d",
      "a",
      "e",
      "o",
    ].includes(key.toLowerCase());

    if (isConsonant && !isSpecialKey) {
      const undoResult = this.checkAndUndoToneForOA_UY(word, key);
      if (undoResult) {
        return undoResult;
      }
    }

    // ================================================================
    // 1. Xử lý Z - Xóa dấu thanh (GIỮ NGUYÊN mũ/sừng)
    // ================================================================
    if (key === "z" || key === "Z") {
      // Tìm ký tự có dấu thanh từ cuối lên (không xóa mũ/sừng)
      for (let i = word.length - 1; i >= 0; i--) {
        const char = word[i];
        const tone = this.getTone(char);

        if (tone) {
          // Có dấu thanh → xóa dấu (giữ lại mũ/sừng)
          const baseChar = this.removeTone(char);
          return {
            text: baseChar,
            shouldReplace: true,
            deleteCount: 0,
            replaceAt: word.length - i - 1,
          };
        }
      }

      // Không tìm thấy dấu thanh → return null → z được thêm bình thường
      return null;
    }

    // ================================================================
    // 2. Xử lý dd → đ, DD → Đ
    // ================================================================
    if (key.toLowerCase() === "d" && lastCharLower === "d") {
      return {
        text: this.isUpperCase(lastChar) ? "Đ" : "đ",
        shouldReplace: true,
        deleteCount: 1,
      };
    }

    // ================================================================
    // 3. Xử lý W - Thứ tự ưu tiên
    // ================================================================
    if (key === "w" || key === "W") {
      // 3.1. ưw → w (escape)
      if (lastCharLower === "ư") {
        return { text: "w", shouldReplace: true, deleteCount: 1 };
      }

      // 3.2. ơw → return null (không xử lý, để w tự nhiên)
      if (lastCharLower === "ơ") {
        return null;
      }

      // 3.3. ww → wư (thêm ư)
      if (lastCharLower === "w") {
        return {
          text: key === "w" ? "ư" : "Ư",
          shouldReplace: true,
          deleteCount: 0,
        };
      }

      // 3.4. uow → ươ, uôw → ươ
      if (lastCharLower === "o" && prevCharLower === "u") {
        // Xử lý case: UOW → ƯƠ, Uow → Ươ, uow → ươ
        let result;
        if (this.isUpperCase(prevChar) && this.isUpperCase(lastChar)) {
          result = "ƯƠ";
        } else if (this.isUpperCase(prevChar)) {
          result = "Ươ";
        } else {
          result = "ươ";
        }
        return { text: result, shouldReplace: true, deleteCount: 2 };
      }

      if (lastCharLower === "ô" && prevCharLower === "u") {
        // uôw → ươ
        let result;
        if (this.isUpperCase(prevChar) && this.isUpperCase(lastChar)) {
          result = "ƯƠ";
        } else if (this.isUpperCase(prevChar)) {
          result = "Ươ";
        } else {
          result = "ươ";
        }
        return { text: result, shouldReplace: true, deleteCount: 2 };
      }

      // 3.5. ow → ơ
      if (lastCharLower === "o") {
        const result = this.isUpperCase(lastChar) ? "Ơ" : "ơ";
        return { text: result, shouldReplace: true, deleteCount: 1 };
      }

      // 3.6. uw → ư (không phải qu)
      if (lastCharLower === "u") {
        if (prevCharLower !== "q") {
          const result = this.isUpperCase(lastChar) ? "Ư" : "ư";
          return { text: result, shouldReplace: true, deleteCount: 1 };
        }
      }

      // 3.7. aw → ă
      if (lastCharLower === "a") {
        const result = this.isUpperCase(lastChar) ? "Ă" : "ă";
        return { text: result, shouldReplace: true, deleteCount: 1 };
      }

      // 3.8. ew → return null (không xử lý)
      if (lastCharLower === "e") {
        return null;
      }

      // 3.9. Default: w → ư
      return {
        text: key === "w" ? "ư" : "Ư",
        shouldReplace: true,
        deleteCount: 0,
      };
    }

    // ================================================================
    // 4. Xử lý aa → â, AA → Â
    // ================================================================
    if (key.toLowerCase() === "a" && lastCharLower === "a") {
      return {
        text: this.isUpperCase(lastChar) ? "Â" : "â",
        shouldReplace: true,
        deleteCount: 1,
      };
    }

    // ================================================================
    // 5. Xử lý ee → ê, EE → Ê
    // ================================================================
    if (key.toLowerCase() === "e" && lastCharLower === "e") {
      return {
        text: this.isUpperCase(lastChar) ? "Ê" : "ê",
        shouldReplace: true,
        deleteCount: 1,
      };
    }

    // ================================================================
    // 6. Xử lý oo → ô, OO → Ô
    // ================================================================
    if (key.toLowerCase() === "o" && lastCharLower === "o") {
      return {
        text: this.isUpperCase(lastChar) ? "Ô" : "ô",
        shouldReplace: true,
        deleteCount: 1,
      };
    }

    // ================================================================
    // 7. Xử lý dấu thanh: s, f, r, x, j
    // ================================================================
    const toneKeys = ["s", "f", "r", "x", "j"];
    if (toneKeys.includes(key.toLowerCase())) {
      const tone = key.toLowerCase();

      // Kiểm tra phím dấu lặp lại → xóa dấu
      for (let i = word.length - 1; i >= 0; i--) {
        const existingTone = this.getTone(word[i]);

        if (existingTone === tone) {
          // Tìm thấy dấu TRÙNG → XÓA dấu + thêm ký tự
          const baseChar = this.removeTone(word[i]);
          const remaining = word.substring(i + 1); // Phần sau ký tự có dấu

          return {
            text: baseChar + remaining + key,
            shouldReplace: true,
            deleteCount: word.length - i,
          };
        }
      }

      // Không trùng → đặt dấu bình thường
      const tonePos = this.findTonePosition(word);
      if (tonePos >= 0) {
        const charAtPos = word[tonePos];
        const newChar = this.addTone(charAtPos, tone);

        if (newChar !== charAtPos) {
          return {
            text: newChar,
            shouldReplace: true,
            deleteCount: 0,
            replaceAt: word.length - tonePos - 1,
          };
        }
      }
    }

    // ================================================================
    // 8. Xử lý transformations cách xa (full-word processing)
    // ================================================================
    // Nếu không có xử lý đặc biệt nào ở trên, thử apply tất cả transformations
    // lên toàn bộ từ để xử lý các patterns cách xa (vd: dieeudf → điều)

    // Tạo từ mới bằng cách thêm key vào cuối
    const newWord = word + key;
    const normalized = this.applyAllTransformations(newWord);

    // Nếu có transformation xảy ra
    if (normalized !== newWord) {
      return {
        text: normalized,
        shouldReplace: true,
        deleteCount: word.length, // Replace toàn bộ word cũ
      };
    }

    return null;
  }

  /**
   * Tìm vị trí đặt dấu thanh trong từ theo quy tắc tiếng Việt ĐÚNG
   *
   * QUY TẮC:
   * 1. Ưu tiên cao nhất: Nếu có nguyên âm đặc biệt (ơ, ư, ô, ê, ă, â) → đặt dấu ở đó
   *    Thứ tự ưu tiên: ơ > ư > ô > ê > ă > â
   *
   * 2. Nếu KHÔNG có nguyên âm đặc biệt (chỉ có a, e, i, o, u, y):
   *    - 2 nguyên âm:
   *      + Không có phụ âm cuối → dấu ở nguyên âm đầu (òa, úy)
   *      + Có phụ âm cuối → dấu ở nguyên âm cuối (hoàn, quỳnh, hoạch, quýt)
   *    - 3 nguyên âm:
   *      + Dấu ở nguyên âm giữa (toái, khuỷu)
   */
  findTonePosition(word) {
    const wordLower = word.toLowerCase();
    const len = word.length;

    // Tìm tất cả nguyên âm từ cuối lên
    const vowelPositions = [];

    for (let i = len - 1; i >= 0; i--) {
      const char = this.removeTone(wordLower[i]);
      const prevChar = i > 0 ? wordLower[i - 1].toLowerCase() : "";

      if (this.baseVowels.includes(char)) {
        // Bỏ qua U sau Q
        if (char === "u" && prevChar === "q") {
          continue;
        }
        // Bỏ qua I sau G nếu đã có nguyên âm khác
        if (char === "i" && prevChar === "g" && vowelPositions.length > 0) {
          continue;
        }
        vowelPositions.push(i);
      }
    }

    const vowelCount = vowelPositions.length;

    if (vowelCount === 0) return -1;
    if (vowelCount === 1) return vowelPositions[0];

    // ============================================================
    // QUY TẮC 1: Ưu tiên nguyên âm đặc biệt (ơ, ư, ô, ê, ă, â)
    // ============================================================

    // Thứ tự ưu tiên: ơ > ư > ô > ê > ă > â
    const priorityOrder = ["ơ", "ư", "ô", "ê", "ă", "â"];

    for (const special of priorityOrder) {
      for (const pos of vowelPositions) {
        const char = this.removeTone(wordLower[pos]);
        if (char === special) {
          return pos; // Tìm thấy nguyên âm đặc biệt → đặt dấu ở đây
        }
      }
    }

    // ============================================================
    // QUY TẮC 2: Không có nguyên âm đặc biệt (chỉ a, e, i, o, u, y)
    // ============================================================

    // Đếm số phụ âm cuối (sau nguyên âm cuối cùng)
    let consonantCount = 0;
    const lastVowelPos = vowelPositions[0]; // Nguyên âm cuối cùng

    const singleConsonants = "bcdđghklmnpqrstvx";
    const doubleConsonants = [
      "ch",
      "gi",
      "kh",
      "ngh",
      "gh",
      "ng",
      "nh",
      "ph",
      "qu",
      "th",
      "tr",
    ];

    let pos = lastVowelPos + 1;
    while (pos < len) {
      let found = false;

      // Kiểm tra phụ âm kép
      for (const dc of doubleConsonants) {
        if (wordLower.substr(pos, dc.length) === dc) {
          consonantCount++;
          pos += dc.length;
          found = true;
          break;
        }
      }

      if (!found) {
        // Kiểm tra phụ âm đơn
        if (singleConsonants.includes(wordLower[pos])) {
          consonantCount++;
          pos++;
        } else {
          break;
        }
      }
    }

    const hasConsonantEnding = consonantCount >= 1;

    // Xử lý theo số nguyên âm
    if (vowelCount === 2) {
      const vowel1Pos = vowelPositions[1]; // Nguyên âm đầu
      const vowel2Pos = vowelPositions[0]; // Nguyên âm cuối

      if (hasConsonantEnding) {
        // Có phụ âm cuối → dấu ở nguyên âm CUỐI
        // VD: hoàn, quỳnh, hoạch, quýt
        return vowel2Pos;
      } else {
        // Không có phụ âm cuối → dấu ở nguyên âm ĐẦU
        // VD: òa, úy
        return vowel1Pos;
      }
    }

    if (vowelCount === 3) {
      // 3 nguyên âm → dấu ở nguyên âm GIỮA
      // VD: toái, khuỷu
      return vowelPositions[1];
    }

    // Trường hợp >= 4 nguyên âm (rất hiếm) → dấu ở nguyên âm giữa
    return vowelPositions[Math.floor(vowelCount / 2)];
  }

  /**
   * Thay thế text trong element
   */
  replaceText(textInfo, result, wordInfo) {
    if (!textInfo || !result) return;

    const { element, textNode } = textInfo;
    const { word, startPos, endPos } = wordInfo;

    if (element.isContentEditable && textNode) {
      // Xử lý contentEditable
      const selection = window.getSelection();
      const range = document.createRange();

      // Lưu vị trí cursor hiện tại (offset trong textNode)
      const originalCursorOffset = textInfo.start;
      const originalText = textNode.textContent;

      let newText;
      let newCursorOffset;

      if (result.replaceAt !== undefined) {
        // Thay thế ký tự tại vị trí cụ thể (đặt dấu thanh hoặc xóa dấu z)
        const replacePos = startPos + word.length - result.replaceAt - 1;
        newText =
          originalText.substring(0, replacePos) +
          result.text +
          originalText.substring(replacePos + 1);
        // GIỮ NGUYÊN vị trí cursor
        newCursorOffset = originalCursorOffset;
      } else if (result.deleteCount) {
        // Xóa N ký tự cuối từ và thêm text mới (dd→đ, aa→â, uow→ươ, UNDO oa/uy)
        const deleteStart = endPos - result.deleteCount;
        newText =
          originalText.substring(0, deleteStart) +
          result.text +
          originalText.substring(endPos);
        newCursorOffset = deleteStart + result.text.length;
      } else {
        // Không xóa gì, chỉ thêm text (w→ư, ww→wư)
        newText =
          originalText.substring(0, endPos) +
          result.text +
          originalText.substring(endPos);
        newCursorOffset = endPos + result.text.length;
      }

      // Thay đổi nội dung textNode
      textNode.textContent = newText;

      // Đặt lại con trỏ
      range.setStart(textNode, newCursorOffset);
      range.setEnd(textNode, newCursorOffset);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      // Xử lý input/textarea
      const value = element.value;
      const cursorPos = element.selectionStart;

      let newValue;
      let newCursorPos;

      if (result.replaceAt !== undefined) {
        // Thay thế ký tự tại vị trí cụ thể trong từ (đặt dấu thanh hoặc xóa dấu z)
        const replacePos = startPos + word.length - result.replaceAt - 1;
        newValue =
          value.substring(0, replacePos) +
          result.text +
          value.substring(replacePos + 1);
        // GIỮ NGUYÊN vị trí con trỏ hiện tại (không nhảy về vị trí đặt dấu)
        newCursorPos = cursorPos;
      } else if (result.deleteCount) {
        // Xóa N ký tự cuối từ và thêm text mới (dd→đ, aa→â, uow→ươ, UNDO oa/uy, ...)
        const deleteStart = endPos - result.deleteCount;
        newValue =
          value.substring(0, deleteStart) +
          result.text +
          value.substring(endPos);
        newCursorPos = deleteStart + result.text.length;
      } else {
        // Không xóa gì, chỉ thêm text (w→ư, ww→wư, hoặc các phím thường)
        newValue =
          value.substring(0, endPos) + result.text + value.substring(endPos);
        newCursorPos = endPos + result.text.length;
      }

      element.value = newValue;
      element.setSelectionRange(newCursorPos, newCursorPos);
    }
  }
}

// Export cho content script
if (typeof window !== "undefined") {
  window.UniVietCore = UniVietCore;
}
