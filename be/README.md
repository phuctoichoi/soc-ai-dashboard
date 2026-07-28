# SOC-AI Dashboard Backend Documentation

Đây là tài liệu hướng dẫn về cấu trúc và logic xử lý của tầng Backend (được viết bằng Node.js & Express).

## Cấu trúc Tệp tin
- `server.js`: File khởi chạy chính của Server, quản lý kết nối CSDL và định nghĩa các API Endpoints.
- `package.json`: Khai báo các thư viện phụ thuộc (`express`, `mongodb`, `dotenv`, `cors`).
- `.env`: Lưu trữ thông tin kết nối MongoDB và Port chạy.

## Các chức năng đã xử lý (API Endpoints)

### 1. Kết nối MongoDB
Sử dụng driver chính thức `mongodb` của Node.js để kết nối tới database `soc_ai`.
- Chuỗi kết nối được đọc từ `MONGODB_URI` trong file `.env`.
- Cấu hình Timeout kết nối tối đa là 5 giây để tránh treo tiến trình khi xảy ra lỗi mạng.

### 2. API Lấy Danh sách Case (`GET /api/cases`)
- **Đường dẫn**: `/api/cases`
- **Tham số truy vấn (Query parameter)**: `status` (tùy chọn) để lọc các case theo trạng thái (Ví dụ: `GET /api/cases?status=Waiting_HITL`).
- **Logic**: Truy vấn toàn bộ case trong database khớp với bộ lọc, thực hiện sắp xếp giảm dần theo thời gian nhận (`received_at: -1`) để Analyst luôn nhìn thấy cảnh báo mới nhất ở trên đầu.

### 3. API Xem Chi tiết Case (`GET /api/cases/:case_id`)
- **Đường dẫn**: `/api/cases/:case_id`
- **Logic**: Tìm kiếm một case duy nhất khớp với `case_id` được yêu cầu và trả về toàn bộ document (bao gồm Wazuh alert gốc và audit trail).

### 4. API Duyệt HITL (`POST /api/cases/:case_id/review`)
- **Đường dẫn**: `/api/cases/:case_id/review`
- **Dữ liệu gửi lên (Body)**: `{ decision, reviewer, feedback, edited_recommendation }`
- **Logic xử lý tranh chấp (Optimistic Concurrency Control)**:
  - Để ngăn chặn việc hai Analyst cùng phê duyệt một case cùng lúc dẫn đến xung đột dữ liệu, API thực hiện câu lệnh tìm kiếm và cập nhật nguyên tử:
    ```javascript
    const filter = {
      case_id: caseId,
      status: 'Waiting_HITL' // Chỉ duyệt các case ở trạng thái Chờ duyệt
    };
    ```
  - Nếu case đã được duyệt bởi người khác, thuộc tính `status` trong DB đã đổi (thành `Approved` hoặc `Rejected`). Khi đó, điều kiện lọc trên sẽ không tìm thấy document nào và API trả về mã lỗi **`409 Conflict`** kèm thông báo lỗi cụ thể.
  - Khi cập nhật thành công, API sẽ ghi nhận kết quả duyệt vào đối tượng `hitl` và tự động đẩy (`$push`) sự kiện `HITL_DECISION` vào mảng lịch sử `audit_trail`.

### 5. API Hỏi Trợ lý AI (`POST /api/cases/:case_id/ask`)
- **Đường dẫn**: `/api/cases/:case_id/ask`
- **Dữ liệu gửi lên (Body)**: `{ question }`
- **Logic**: 
  - Lấy thông tin cảnh báo gốc (Raw alert JSON) của case trong DB.
  - Tự động làm giàu Prompt (Prompt Enrichment) bằng cách đính kèm JSON cảnh báo cùng câu hỏi của Analyst để tạo context hoàn chỉnh cho AI.
  - Gửi yêu cầu HTTP POST tới Ollama Server cục bộ ở địa chỉ `http://192.168.1.242:11434/api/generate` sử dụng model `qwen2.5:3b`.
  - Trả câu trả lời dạng text về cho Dashboard.
