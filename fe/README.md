# SOC-AI Dashboard Frontend Documentation

Đây là tài liệu hướng dẫn về cấu trúc và các công nghệ giao diện được sử dụng ở tầng Frontend (React + Vite + TypeScript).

## Cấu trúc Tệp tin chính
- `src/main.tsx`: File cấu trúc gốc để khởi chạy React.
- `src/App.tsx`: Trình điều phối trạng thái (state) chính của toàn bộ trang web. Quản lý việc gọi API đồng bộ, các thông báo lỗi/thành công, và các chế độ xem.
- `src/context/LanguageContext.tsx`: Cung cấp React Context dịch đa ngôn ngữ Việt - Anh tức thì.
- `src/components/Header.tsx`: Thanh điều hướng phía trên chứa thống kê các case, nút chuyển ngôn ngữ, và nút chuyển chế độ xem (Điều tra / Thống kê).
- `src/components/CaseList.tsx`: Thanh bên trái hiển thị danh sách case, tìm kiếm thời gian thực và bộ lọc trạng thái.
- `src/components/CaseDetail.tsx`: Màn hình điều tra chi tiết từng case, form duyệt HITL, lịch sử audit trail, và khung chat tương tác với AI.
- `src/components/AnalyticsView.tsx`: Màn hình đồ thị thống kê sử dụng vector SVG động.
- `src/index.css`: Toàn bộ định nghĩa màu sắc và layout theo phong cách màu sáng (Light Theme).

## Các kỹ thuật nổi bật đã triển khai

### 1. Đa ngôn ngữ (Bilingual Context)
Hệ thống sử dụng React Context `LanguageContext` để quản lý ngôn ngữ toàn cục. Tất cả các nhãn (label), tooltip, thông báo và mô tả đều được dịch tự động thông qua hàm `t('key')` khi người dùng nhấn nút chuyển đổi ngôn ngữ ở Header.

### 2. Giao diện Trắng sáng (Light Theme)
Thiết kế dựa trên các nguyên tắc của tài liệu `Frontend Design`:
- Tránh màu tối mặc định của SOC, sử dụng các tông màu xám nhạt (`#f3f4f6`), trắng tinh (`#ffffff`) để tăng sự tập trung và giảm mỏi mắt cho Analyst.
- Các viền được bo tròn mềm mại (`border-radius: 12px` hoặc `10px`).
- Độ tương phản của văn bản chính (`#111827`) cao giúp dễ đọc log kỹ thuật.

### 3. Đồ thị SVG Động (Analytics SVG Charts)
Để tối ưu hóa dung lượng dự án và tránh xung đột thư viện ngoài, toàn bộ biểu đồ trên màn hình Thống kê đều được tự vẽ bằng mã SVG nguyên bản trong React:
- **Biểu đồ Cột (Severity distribution)**: Vẽ bằng `<rect>` và tự tính toán tỷ lệ chiều cao cột dựa trên số liệu thực tế.
- **Biểu đồ Đường (Alerts trend)**: Sử dụng thẻ `<path>` vẽ đường nối mượt mà kèm vùng đổ bóng phủ nhạt (`rgba(37, 99, 235, 0.05)`) thể hiện xu hướng alert trong 8 giờ qua.

### 4. Tương tác Hỏi AI (Interactive Chat Assistant)
Bên trong mỗi Case detail, Analyst có một khung chat chuyên dụng để đặt câu hỏi cho AI về sự cố hiện tại. Khung chat hoạt động bất đồng bộ bằng cách gọi API của Backend và hiển thị câu trả lời trực tiếp lên giao diện, giúp quá trình phản ứng sự cố nhanh và chính xác hơn.

### 5. Live Polling (Tự động cập nhật số liệu)
Sử dụng `setInterval` trong React `useEffect` để tự động fetch danh sách case mới từ backend mỗi 5 giây mà không làm gián đoạn trải nghiệm người dùng, giúp dashboard hoạt động như một hệ thống real-time.
