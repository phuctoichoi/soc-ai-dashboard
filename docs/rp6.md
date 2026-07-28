# **Báo cáo số 6: XÁC THỰC TÀI LIỆU**

## **6.1. Quy trình đánh giá rủi ro lặp lại**

Sau khi triển khai các biện pháp kiểm soát an ninh được đề xuất và hoàn thành việc tích hợp, kiểm thử hệ thống, nhóm dự án tiến hành đánh giá rủi ro lặp lại nhằm xác minh xem kết quả đánh giá rủi ro ban đầu còn phù hợp hay không. Quá trình xác thực này nhằm xác định liệu có xuất hiện tài sản thông tin quan trọng mới, có thay đổi đáng kể nào trong môi trường CNTT hay không, đồng thời đánh giá xem có phát sinh thêm các rủi ro an ninh mạng trong quá trình triển khai hệ thống hay không. Thông qua việc đánh giá lại này, nhóm dự án xác nhận rằng kiến trúc bảo mật đã triển khai vẫn cung cấp mức bảo vệ đầy đủ và các rủi ro đã xác định trước đây vẫn được xử lý thích hợp bằng các biện pháp kiểm soát đã lựa chọn.

### **6.1.1. Kiểm tra và bổ sung nếu xuất hiện tài sản quan trọng mới**

Trong quá trình đánh giá rủi ro lặp lại, nhóm dự án đã rà soát danh mục các tài sản quan trọng để xác định xem có tài sản nào mới xuất hiện trong giai đoạn triển khai và kiểm thử hay không. Kết quả xác nhận không có tài sản quan trọng mới được phát hiện. Hệ thống triển khai vẫn phù hợp với phạm vi và kiến trúc ban đầu của dự án; tất cả các thành phần đã triển khai đều đã được xác định trong lần đánh giá rủi ro đầu tiên. Vì vậy, danh mục tài sản hiện tại vẫn còn hiệu lực và không cần cập nhật.

### **6.1.2. Kiểm tra sự thay đổi của môi trường CNTT**

Nhóm dự án cũng đã xem xét môi trường CNTT nhằm xác định liệu có thay đổi đáng kể nào xảy ra trong quá trình triển khai và kiểm thử hay không. Kết quả cho thấy kiến trúc triển khai, môi trường vận hành và hạ tầng hỗ trợ vẫn nhất quán với thiết kế hệ thống ban đầu. Do không có thay đổi đáng kể nào của môi trường, môi trường vận hành hiện tại vẫn được xem là hợp lệ cho việc xác thực đánh giá rủi ro của dự án.

### **6.1.3. Đánh giá rủi ro mới**

Dựa trên kết quả xác thực, không phát hiện thêm rủi ro an ninh mạng nào trong quá trình triển khai và kiểm thử Hệ thống giám sát an ninh mạng AI tạo sinh có HITL được đề xuất. Các kịch bản đe dọa đã xác định trước đây vẫn còn phù hợp và không xuất hiện điều kiện mới nào đòi hỏi phải thực hiện đánh giá rủi ro bổ sung. Do đó, Sổ đăng ký rủi ro (Risk Register) hiện tại vẫn phản ánh chính xác trạng thái an ninh của hệ thống và tiếp tục có giá trị cho các hoạt động quản lý rủi ro.

## **6.2. Phân tích rủi ro**

### **6.2.1. Phân tích định tính**

Do không phát hiện thêm rủi ro an ninh mạng nào trong quá trình xác thực, kết quả đánh giá rủi ro định tính đã thiết lập trước đây vẫn áp dụng cho hệ thống đã triển khai. Vì vậy, phân tích định tính hiện tại vẫn là cơ sở phù hợp để đánh giá trạng thái an ninh của nền tảng giám sát được đề xuất.

Bảng x – Kết quả đánh giá rủi ro định tính đã được xác thực

| Mã | Mối đe dọa | Lỗ hổng | Khả năng | Mức rủi ro |
| :---- | :---- | :---- | :---- | :---- |
| R1 | Truy cập trái phép | Xác thực yếu (V1) | Cao | Nghiêm trọng |
| R2 | Nhiễm mã độc | Cấu hình sai (V5) | Cao | Nghiêm trọng |
| R3 | Giả mạo nhật ký | Thiếu mã hóa/bảo vệ toàn vẹn (V2) | Cao | Nghiêm trọng |
| R4 | Từ chối dịch vụ | Điểm lỗi đơn lẻ (V3) | Trung bình | Nghiêm trọng |
| R5 | Dịch vụ ngừng hoạt động | Thiếu giám sát nội bộ (V8) | Trung bình | Cao |
| R6 | Hỏng CSDL | Cơ chế sao lưu chưa đầy đủ (V4) | Trung bình | Nghiêm trọng |
| R7 | Lỗi con người | Sai sót vận hành (V9) | Cao | Cao |
| R8 | AI ảo giác | Đầu ra AI không chắc chắn (V6) | Trung bình | Cao |
| R9 | Prompt Injection | Cơ chế xác thực chưa đầy đủ (V10) | Trung bình | Cao |
| R10 | Lạm dụng đặc quyền/Thỏa hiệp kiến trúc | Phân quyền quá mức (V7) | Trung bình | Cao |

Nguồn: Được tái sử dụng từ kết quả đánh giá rủi ro định tính trong Báo cáo số 3\.

Kết quả xác thực cho thấy các rủi ro đã xác định vẫn phản ánh chính xác trạng thái an ninh hiện tại của nền tảng giám sát được đề xuất. Do không xuất hiện tài sản quan trọng mới, thay đổi đáng kể của môi trường hoặc các kịch bản đe dọa bổ sung, các mức khả năng xảy ra, tác động và mức độ rủi ro đã xác định trước đây vẫn phù hợp.

### **6.2.2. Xác minh hiệu quả giảm thiểu rủi ro (khi không xuất hiện rủi ro lớn mới)**

Do không phát hiện rủi ro lớn mới trong quá trình đánh giá rủi ro lặp lại, các biện pháp giảm thiểu đã triển khai được xem xét để xác minh rằng các khoảng trống an ninh đã được xử lý hiệu quả. Kết quả xác nhận các biện pháp kiểm soát hiện có vẫn phù hợp để giảm thiểu các rủi ro an ninh mạng đã xác định.

| STT | Hoạt động xác minh bảo mật | Ngay sau triển khai | Sau 1 tháng | Sau 3 tháng |
| :---- | :---- | :---- | :---- | :---- |
| 1 | Kiểm tra khả năng phát hiện của Wazuh SIEM bằng các kịch bản tấn công mô phỏng. | Hiệu quả | Hiệu quả | Hiệu quả |
| 2 | Xác minh việc truyền dữ liệu giữa Wazuh, Apache Kafka và AI Agent. | Hiệu quả | Hiệu quả | Hiệu quả |
| 3 | Đánh giá độ chính xác của khuyến nghị do AI tạo ra bằng cơ chế HITL. | Hiệu quả một phần | Hiệu quả | Hiệu quả |
| 4 | Thực hiện Security Configuration Assessment (SCA) để đánh giá cấu hình bảo mật. | Hiệu quả | Hiệu quả | Hiệu quả |
| 5 | Xác minh chức năng Wazuh Active Response khi xảy ra sự kiện bất thường. | Hiệu quả | Hiệu quả | Hiệu quả |
| 6 | Kiểm tra khả năng khôi phục dữ liệu bằng bản sao lưu và snapshot máy ảo. | Hiệu quả | Hiệu quả | Hiệu quả |
| 7 | Đánh giá khả năng phát hiện của Suricata IDS/IPS trước các cuộc tấn công mạng. | Hiệu quả một phần | Hiệu quả | Hiệu quả |
| 8 | Rà soát các quy tắc tường lửa pfSense và chính sách kiểm soát truy cập. | Hiệu quả | Hiệu quả | Hiệu quả |

*Bảng x – Xác nhận các biện pháp giảm thiểu rủi ro đã thực hiện*

