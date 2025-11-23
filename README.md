# UniViet - Bộ Gõ Tiếng Việt TELEX cho Chrome

**UniViet** là một tiện ích mở rộng Chrome giúp người dùng gõ tiếng Việt theo kiểu TELEX một cách chính xác, nhanh chóng và tiện lợi. Ứng dụng hỗ trợ đầy đủ các quy tắc gõ tiếng Việt chuẩn, bao gồm cả các quy tắc đặc biệt cho phím `W`, vị trí đặt dấu, và các tính năng nâng cao như undo dấu.

## ✨ Tính Năng Nổi Bật

- **Gõ TELEX đầy đủ**: Hỗ trợ tất cả các quy tắc TELEX cơ bản và nâng cao.
- **Quy tắc `W` đặc biệt**: Xử lý chính xác các trường hợp như `aw → ă`, `ow → ơ`, `uow → ươ`, `ww → wư`, v.v.
- **Đặt dấu đúng chuẩn tiếng Việt**: Tuân thủ quy tắc ngữ pháp về vị trí đặt dấu thanh (sắc, huyền, hỏi, ngã, nặng).
- **UNDO dấu thông minh**: `z` xóa dấu thanh nhưng **giữ nguyên** dấu mũ và dấu móc (`ă`, `â`, `ê`, `ô`, `ơ`, `ư`).
- **UNDO dấu cho vần `oa`/`uy`**: Khi thêm phụ âm, dấu sẽ được chuyển đúng vị trí (ví dụ: `họa + t → hoạt`).
- **Hỗ trợ nhiều loại ô nhập liệu**: `input`, `textarea`, và các ô `contentEditable` như Google Docs, CKEditor.
- **Tắt/Mở nhanh**: Dễ dàng bật/tắt tính năng gõ tiếng Việt qua biểu tượng trên thanh công cụ.
- **Phím tắt**: `Alt+Z` (Windows) / `Option+Z` (Mac) để bật/tắt nhanh.

## 📋 Quy Tắc Gõ TELEX

| Ký Tự Gõ | Kết Quả | Ví Dụ |
|----------|---------|-------|
| `a` + `a` | `â` | `maa` → `mâ` |
| `e` + `e` | `ê` | `dee` → `đê` |
| `o` + `o` | `ô` | `too` → `tô` |
| `d` + `d` | `đ` | `dđ` → `đ` |
| `s` | Sắc | `ma s` → `má` |
| `f` | Huyền | `ma f` → `mà` |
| `r` | Hỏi | `ma r` → `mả` |
| `x` | Ngã | `ma x` → `mã` |
| `j` | Nặng | `ma j` → `mạ` |
| `z` | Xóa dấu (giữ mũ/sừng) | `má` + `z` → `ma` |
| `w` | `ư` hoặc chuyển đổi | `aw` → `ă`, `ow` → `ơ`, `uow` → `ươ`, v.v. |

### Quy Tắc Phím `W` Đặc Biệt

- `w` đầu tiên → `ư`
- `aw` → `ă`
- `ow` → `ơ`
- `uow` hoặc `uôw` → `ươ`
- `ew` → không xử lý (giữ nguyên `ew`)
- `ww` → `w` + `ư`
- `ưw` → `w` (thoát)

## 🛠️ Cài Đặt

1. Tải mã nguồn về hoặc clone repository:
   ```bash
   git clone https://github.com/davidthangnguyen/univiet.git
   ```
2. Mở trình duyệt Chrome.
3. Truy cập `chrome://extensions/`.
4. Bật **Chế độ dành cho nhà phát triển** (Developer mode).
5. Click **Tải tiện ích đã giải nén** (Load unpacked) và chọn thư mục chứa mã nguồn.

## 🎯 Cách Dùng

1. Biểu tượng UniViet sẽ xuất hiện trên thanh công cụ Chrome.
2. Click vào biểu tượng để bật/tắt gõ tiếng Việt.
3. Trạng thái (bật/tắt) được hiển thị qua badge icon.
4. Gõ trực tiếp trong bất kỳ ô nhập liệu nào trên web (input, textarea, contentEditable).
5. Sử dụng phím tắt `Alt+Z` (Windows) hoặc `Option+Z` (Mac) để bật/tắt nhanh.

## 🐛 Đã Biết (Known Issues)

- Một số trang web có xử lý sự kiện phím phức tạp có thể xung đột với UniViet.
- Một số ứng dụng web (ví dụ: trình soạn thảo nâng cao) có thể cần thời gian để tương thích hoàn toàn.

## 🤝 Đóng Góp

Chúng tôi rất hoan nghênh sự đóng góp từ cộng đồng! Nếu bạn phát hiện lỗi hoặc muốn cải tiến tính năng, vui lòng:

1. Fork repository này.
2. Tạo một branch mới (`git checkout -b feature/amazing-feature`).
3. Commit thay đổi của bạn (`git commit -m 'Add some amazing feature'`).
4. Push lên branch (`git push origin feature/amazing-feature`).
5. Tạo một Pull Request.

## 📄 Giấy Phép

Dự án này được phân phối dưới giấy phép [MIT](LICENSE).

## 📞 Liên Hệ

Nếu bạn có câu hỏi hoặc góp ý, vui lòng tạo [Issue](https://github.com/davidthangnguyen/univiet/issues) trên GitHub.


⭐ Nếu bạn thấy tiện ích hữu ích, đừng quên để lại một ngôi sao nhé!

### Ghi chú:

- Thay `your-username` bằng tên người dùng GitHub thực tế của bạn.
- Nếu bạn có file `LICENSE`, hãy đảm bảo nội dung license phù hợp (ví dụ: MIT, GPL, v.v.).
- Bạn có thể thêm hình ảnh minh họa (ví dụ: ảnh chụp giao diện tiện ích, biểu tượng, v.v.) vào thư mục `assets` và nhúng vào README nếu muốn.
- Cập nhật đường dẫn đúng với cấu trúc thư mục thực tế của bạn.
