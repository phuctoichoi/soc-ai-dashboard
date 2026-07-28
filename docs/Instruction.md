# HƯỚNG DẪN CÀI ĐẶT VÀ VẬN HÀNH DASHBOARD REACT SOC-AI

Tài liệu này hướng dẫn chi tiết cách tải, cấu hình các tham số kết nối CSDL/AI và khởi chạy Dashboard sau khi thực hiện `git clone` mã nguồn.

---

## 1. Yêu cầu hệ thống (Prerequisites)
Trước khi cài đặt, hãy đảm bảo máy tính chạy Dashboard của bạn đã được cài đặt sẵn:
- **Node.js**: Phiên bản 18.x trở lên (để hỗ trợ thư viện `fetch` toàn cục).
- **MongoDB**: Đã khởi chạy dịch vụ MongoDB cục bộ hoặc có kết nối mạng tới MongoDB (`127.0.0.1:27017`), có cơ sở dữ liệu tên `soc_ai` và collection tên `cases`.
- **Ollama**: Máy chủ AI cục bộ (`192.168.1.242:11434`) đã được tải mô hình `qwen2.5:3b` để hỗ trợ tính năng chat trợ lý.

---

## 2. Hướng dẫn Cài đặt nhanh (Installation)

Sau khi `git clone` mã nguồn dự án về máy, hãy mở terminal tại thư mục gốc của dự án (`d:\dashboard`) và chạy lệnh cài đặt tự động:
```powershell
npm run install-all
```
Lệnh này sẽ tự động di chuyển vào các thư mục và tải các thư viện cần thiết:
- Ở thư mục gốc: Cài đặt thư viện `concurrently` (để chạy song song 2 dịch vụ).
- Ở thư mục `be/` (Backend): Cài đặt `express`, `mongodb`, `dotenv`, và `cors`.
- Ở thư mục `fe/` (Frontend): Cài đặt `react`, `react-dom`, `vite` và các gói biên dịch TypeScript.

---

## 3. Cấu hình tham số (Configuration)

Bạn cần kiểm tra và chỉnh sửa các tệp tin cấu hình sau để khớp với môi trường hệ thống của bạn:

### A. Cấu hình các tham số Backend (`be/.env`)
Mở file **[be/.env](file:///d:/dashboard/be/.env)** và thay đổi các giá trị:
```env
PORT=5000
MONGODB_URI=mongodb://soc_ai_app:PASSWORD@127.0.0.1:27017/soc_ai?authSource=soc_ai&retryWrites=false
MONGODB_DATABASE=soc_ai
MONGODB_COLLECTION=cases
```
- **Lưu ý quan trọng**: Thay thế `PASSWORD` bằng mật khẩu thực tế của tài khoản ứng dụng `soc_ai_app` trong MongoDB của bạn.
- Nếu MongoDB của bạn chạy trên cổng khác hoặc host khác, hãy sửa lại phần `127.0.0.1:27017` trong chuỗi kết nối.

### B. Cấu hình IP máy chủ Ollama (`be/server.js`)
Nếu máy chủ chứa mô hình AI Ollama của bạn thay đổi địa chỉ IP hoặc cổng, hãy mở tệp **[be/server.js](file:///d:/dashboard/be/server.js)** và tìm đến dòng chứa hằng số `ollamaUrl` (khoảng dòng 175) để cập nhật:
```javascript
const ollamaUrl = 'http://192.168.1.242:11434/api/generate';
```
*Thay đổi `192.168.1.242:11434` thành địa chỉ máy chủ Ollama thực tế trong mạng của bạn.*

### C. Cấu hình Proxy và Cổng chạy của Frontend (`fe/vite.config.ts`)
Mở tệp **[fe/vite.config.ts](file:///d:/dashboard/fe/vite.config.ts)**:
```typescript
server: {
  port: 8501,
  host: '0.0.0.0', // Cho phép truy cập từ các máy khác trong mạng LAN
  proxy: {
    '/api': {
      target: 'http://localhost:5000', // Khớp với PORT của Express Backend ở trên
      changeOrigin: true,
      secure: false,
    }
  }
}
```
- **Cổng chạy (port)**: Được thiết lập mặc định là `8501` để thay thế trực tiếp cho cổng Streamlit cũ của bạn.
- **Proxy**: Mọi API request bắt đầu bằng `/api` trên trình duyệt sẽ được tự động chuyển hướng tới Backend Node.js chạy trên cổng `5000` (được cấu hình qua `target`). Nếu bạn thay đổi `PORT` trong tệp `be/.env`, hãy nhớ cập nhật giá trị `target` này tương ứng.

---

## 4. Cách khởi chạy hệ thống (How to Run)

Mở terminal tại thư mục gốc dự án (`d:\dashboard`) và chạy câu lệnh duy nhất:
```powershell
npm run dev
```

Hệ thống sẽ đồng thời khởi chạy:
1. **Frontend Dev Server**: Địa chỉ `http://localhost:8501` (hoặc `http://<IP_máy_dashboard>:8501` đối với máy trong mạng LAN).
2. **Backend Express API Server**: Địa chỉ `http://localhost:5000`.

---

## 5. Hướng dẫn Sử dụng Giao diện (User Guide)

- **Màn hình Điều tra (Investigation View)**:
  - Cột trái hiển thị danh sách các case lọc theo bộ lọc trạng thái (mặc định là hiển thị nhóm `Chờ HITL duyệt` để analyst tập trung xử lý các case mới).
  - Cột phải hiển thị chi tiết các chỉ báo (Indicators) và kết quả phân tích AI (Mức độ nghiêm trọng, Tóm tắt cảnh báo).
  - Sử dụng Form HITL ở cột phải để nhập tên Người kiểm duyệt, điền ý kiến hoặc sửa lại khuyến nghị xử lý của AI, sau đó bấm nút **Approve** hoặc **Reject**.
- **Màn hình Thống kê (Analytics View)**:
  - Nhấn nút **Thống kê (Statistics)** ở thanh Header phía trên để chuyển sang màn hình đồ thị trực quan.
  - Sidebar danh sách case sẽ tự động thu gọn lại để hiển thị toàn bộ sơ đồ phân bổ trạng thái case, số liệu phân bổ mức độ nghiêm trọng và biểu đồ đường thể hiện tần suất alert trong 8 giờ gần nhất.
- **Tương tác Chat với AI**:
  - Tại khung xem chi tiết case, kéo xuống phần **Security AI Assistant** để chat và hỏi AI trực tiếp các phân tích kỹ thuật về cảnh báo đó bằng Tiếng Việt.
- **Chuyển đổi ngôn ngữ**:
  - Bấm nút 🇻🇳 Tiếng Việt hoặc 🇬🇧 English ở góc trên bên phải để chuyển ngôn ngữ hiển thị tức thì.
