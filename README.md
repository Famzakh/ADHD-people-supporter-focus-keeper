## ⚙️ Hướng dẫn cài đặt (Browser Extension)

Dự án này có thể được tải trực tiếp vào Chrome, Edge hoặc các trình duyệt nhân Chromium khác thông qua chế độ dành cho nhà phát triển (Developer Mode).

### Bước 1: Tải mã nguồn
* Clone repository này về máy của bạn bằng lệnh `git clone`, hoặc tải file `.zip` từ GitHub và giải nén vào một thư mục riêng.

### Bước 2: Thêm tiện ích vào trình duyệt
1. Mở trình duyệt của bạn và truy cập vào trang quản lý tiện ích:
   * **Google Chrome:** Nhập `chrome://extensions/` vào thanh địa chỉ.
   * **Microsoft Edge:** Nhập `edge://extensions/` vào thanh địa chỉ.
2. Bật công tắc **Developer mode** (Chế độ dành cho nhà phát triển) thường nằm ở góc trên cùng bên phải màn hình.
3. Nhấn vào nút **Load unpacked** (Tải tiện ích đã giải nén) xuất hiện ở góc trái.
4. Điều hướng đến thư mục chứa mã nguồn dự án bạn vừa giải nén (lưu ý chọn thư mục gốc chứa file `manifest.json`) và nhấn **Select Folder**.

Lúc này, biểu tượng của tiện ích sẽ xuất hiện trên thanh công cụ của trình duyệt.

## 🚀 Cách chạy và kiểm tra (Testing)

Để xác minh đoạn script đang hoạt động chính xác theo logic kiểm tra URL:

1. Mở một tab mới và truy cập vào trang web mục tiêu đã được thiết lập (ví dụ: `https://gemini.google.com/app/xyz...`).
2. Nhấn `F12` hoặc tổ hợp phím `Ctrl + Shift + I` (`Cmd + Option + I` trên Mac) để mở công cụ **Developer Tools**.
3. Chuyển sang tab **Console**.
4. Tải lại trang (F5) và quan sát các log được in ra. Bạn sẽ thấy thông báo trạng thái:
   * `✅ Hợp lệ: Trùng khớp tiền tố đường dẫn.` (Nếu bạn đang ở đúng thư mục cho phép).
   * `❌ Cảnh báo: URL không khớp tiền tố hoặc sai tên miền!` (Nếu bạn cố tình đổi tên miền hoặc sai thư mục).
  
# 🚀 Dynamic URL Prefix Validator

Một tiện ích JavaScript gọn nhẹ và an toàn giúp kiểm tra, đối chiếu và kiểm soát quyền truy cập dựa trên tiền tố đường dẫn (URL prefix). 

Đoạn script này đặc biệt hữu ích cho các dự án (như Browser Extension, Userscript, hoặc Automation Tools) cần hoạt động trên những trang web tạo ra URL có chứa ID động thay đổi liên tục mỗi phiên làm việc (Ví dụ: `https://example.com/app/[id-ngẫu-nhiên]`).

## ✨ Tính năng nổi bật

*   **Xử lý URL thông minh:** Sử dụng Web API `URL` gốc của JavaScript để bóc tách chính xác các thành phần của liên kết thay vì xử lý chuỗi thủ công, giúp loại bỏ hoàn toàn các lỗi sai vặt.
*   **Tự động nhận diện tiền tố (Auto-trimming):** Tự động xác định và cắt bỏ các đoạn ID ngẫu nhiên, query string, hoặc parameter nằm ở cuối đường dẫn để lấy ra thư mục gốc.
*   **Kiểm tra chéo bảo mật (Origin Matching):** Đảm bảo hai URL được đưa vào so sánh phải có cùng tên miền gốc (origin) trước khi kiểm tra đường dẫn, ngăn chặn các rủi ro bảo mật từ các tên miền giả mạo.
*   **Dễ dàng tích hợp:** Không phụ thuộc vào thư viện bên thứ ba (Zero dependencies), chỉ cần copy-paste là chạy được ngay trong mọi môi trường JavaScript (Browser, Node.js).

## 🛠️ Cách thức hoạt động

Thuật toán giải quyết bài toán so sánh bằng cách:
1. Xác minh cả hai URL có chung `origin` (VD: `https://gemini.google.com`).
2. Trích xuất `pathname` và lùi về vị trí dấu `/` gần nhất để loại bỏ tham số động cuối cùng.
3. Đối chiếu hai tiền tố đường dẫn gốc đã được chuẩn hóa.

**Ví dụ:**
- Cấu hình gốc (Target): `https://gemini.google.com/app/483c4cc396ea737b`
- URL người dùng truy cập: `https://gemini.google.com/app/6b694f2d7a8fd517`
👉 **Kết quả:** `Hợp lệ` (Vì cùng chung tiền tố `https://gemini.google.com/app/`)

## 💻 Hướng dẫn sử dụng

Chỉ cần đưa hàm `isValidPrefix(targetUrl, currentUrl)` vào logic kiểm tra của bạn:

```javascript
const TARGET_URL = "[https://your-domain.com/app/static-id](https://your-domain.com/app/static-id)";
const currentUrl = window.location.href; 

if (isValidPrefix(TARGET_URL, currentUrl)) {
  console.log("Truy cập hợp lệ. Tiếp tục thực thi...");
  // Khởi chạy các chức năng của bạn tại đây
} else {
  console.warn("Truy cập bị từ chối do sai tiền tố hoặc tên miền.");
  // Dừng thực thi hoặc hiển thị cảnh báo
}
```
## 📁 Cấu trúc thư mục tham khảo
Để extension hoạt động chuẩn xác, hãy đảm bảo thư mục dự án của bạn có cấu trúc cơ bản như sau:
```text
├── manifest.json       # File cấu hình bắt buộc của trình duyệt
├── background.js       # (Tùy chọn) Script chạy ngầm
├── content_script.js   # File chứa đoạn code logic xử lý URL được cấp ở trên
└── README.md           # Tài liệu hướng dẫn này

