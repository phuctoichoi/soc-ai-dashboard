**DEVELOPMENT OF IMPLEMENTATION PLAN**

# **5.1. Risk Response Planning**

## **5.1.1. Major Risk Treatment:**

Sau quá trình nhận diện, đánh giá và phân loại rủi ro đối với hệ thống giám sát an ninh mạng tích hợp **Wazuh SIEM, Apache Kafka, AI Agent, Human-in-the-Loop (HITL) và cơ chế phản ứng sự cố tự động**, nhóm phân loại các rủi ro chính theo bốn chiến lược xử lý như sau:  
Table XX. Major Risk Treatment Strategies

| No. | Risk | Treatment Strategy | Description |
| :---: | ----- | ----- | ----- |
| 1 | AI đưa ra khuyến nghị sai (Hallucination) | Mitigating | Sử dụng RAG, Prompt Engineering và HITL |
| 2 | Mất dữ liệu log do Kafka Queue Failure | Mitigating | Kafka Replication và Monitoring |
| 3 | Endpoint bị compromise | Mitigating | Wazuh Active Response, Suricata |
| 4 | AI Service ngừng hoạt động | Accepting | Hệ thống vẫn hoạt động bằng Wazuh SIEM |
| 5 | DDoS vào Dashboard | Mitigating | pfSense Firewall Rules |
| 6 | Human Approval Delay | Accepting | Chấp nhận trong các cảnh báo mức thấp |
| 7 | Rò rỉ dữ liệu từ AI API | Avoiding | Sử dụng Local LLM thay vì Public API |
| 8 | Hỏng phần cứng máy chủ | Transferring | Sao lưu định kỳ và triển khai VM Snapshot |
| 9 | Lỗi cấu hình hệ thống | Mitigating | Configuration Hardening và Baseline |
| 10 | Mất điện hoặc lỗi Hypervisor | Transferring | Backup VM và Disaster Recovery Plan |

   
*Chú thích:*  
        	**Avoiding**: Tránh né, xác định các rủi ro và thực hiện các bước để loại bỏ hoặc tránh hoàn toàn. Bao gồm việc thay đổi kế hoạch, quy trình hoặc hoạt động để giảm thiểu mức độ tiếp xúc với các rủi ro tiềm tàng. Mặc dù tránh né có thể hiệu quả trong việc giảm thiểu các rủi ro cụ thể, nhưng đôi khi nó có thể phải trả giá cao hơn, liên quan đến những thay đổi đáng kể hoặc hạn chế cơ hội tăng trưởng hoặc đổi mới.  
        	**Accepting**: Chấp nhận rủi ro bao gồm việc thừa nhận và chấp nhận sự hiện diện của các rủi ro mà không thực hiện bất kỳ hành động cụ thể nào để giảm thiểu hoặc tránh chúng. Chiến lược này thường được sử dụng khi tác động tiềm tàng hoặc xác suất của rủi ro tương đối thấp hoặc khi chi phí liên quan đến việc giảm thiểu vượt quá lợi ích tiềm tàng.  
        	**Mitigating**: Giảm thiểu là một chiến lược quản lý rủi ro tập trung vào việc giảm thiểu tác động hoặc khả năng xảy ra của các rủi ro đã được xác định. Bao gồm việc thực hiện các biện pháp chủ động để ngăn ngừa rủi ro xảy ra hoặc giảm thiểu tác động tiềm tàng của chúng. Gồm các hành động như tiến hành đánh giá rủi ro, triển khai các biện pháp kiểm soát an ninh, đào tạo nhân viên, sao lưu dữ liệu thường xuyên và phát triển các kế hoạch ứng phó sự cố. Giảm thiểu rủi ro nhằm mục đích giảm thiểu các lỗ hổng và tăng cường khả năng phục hồi tổng thể của hệ thống và quy trình.  
**Transferring**: Chuyển giao rủi ro liên quan đến việc chuyển giao tác động tiềm tàng của rủi ro cho một thực thể khác, thông qua các thỏa thuận hợp đồng hoặc cơ chế bảo hiểm. Các tổ chức lựa chọn chiến lược này khi việc chuyển giao rủi ro cho bên thứ ba hiệu quả hơn hoặc tiết kiệm chi phí hơn so với việc quản lý rủi ro nội bộ.         	

Các chiến lược xử lý này đảm bảo rằng các rủi ro an ninh được quản lý một cách cân bằng và tiết kiệm chi phí trong khi vẫn duy trì tính khả dụng, tính toàn vẹn và độ tin cậy của hệ thống. Phương pháp được lựa chọn cũng hỗ trợ các mục tiêu của dự án về việc cải thiện khả năng phát hiện mối đe dọa, giảm thời gian phản hồi sự cố và đảm bảo rằng các quyết định được hỗ trợ bởi AI vẫn nằm dưới sự giám sát và kiểm soát của con người.

 

## **5.1.2. Risk Mitigation Treatment (consider prevention, detection, and response).**

Table XX. Risk Mitigation Treatment Classification

| No. | Risks | Treatment Type |
| :---: | ----- | :---: |
| 1 | AI đưa ra khuyến nghị sai (Hallucination) | Prevention |
| 2 | Mất dữ liệu log do Kafka Queue Failure | Detection |
| 3 | Endpoint bị compromise | Response |
| 4 | AI Service ngừng hoạt động | Detection |
| 5 | DDoS vào Dashboard | Prevention |
| 6 | Human Approval Delay | Detection |
| 7 | Rò rỉ dữ liệu từ AI API | Prevention |
| 8 | Hỏng phần cứng máy chủ | Response |
| 9 | Lỗi cấu hình hệ thống | Prevention |
| 10 | Mất điện hoặc lỗi Hypervisor | Response |

   
*Chú thích:*  
        	**Prevention:** gồm các biện pháp được triển khai nhằm ngăn chặn hoặc làm giảm khả năng xảy ra của rủi ro trước khi sự cố diễn ra. Mục tiêu của Prevention là giảm xác suất xảy ra các mối đe dọa bằng cách áp dụng các cơ chế bảo vệ như hardening hệ thống, kiểm soát truy cập, mã hóa dữ liệu, firewall, IDS/IPS, xác thực đa yếu tố (MFA), và các chính sách bảo mật khác.   
        	**Detection:** các biện pháp giúp nhận biết và cảnh báo khi một sự kiện bất thường hoặc sự cố bảo mật đang xảy ra hoặc đã xảy ra. Mục tiêu của Detection là phát hiện sớm các dấu hiệu tấn công, lỗi hệ thống hoặc hành vi bất thường để có thể xử lý kịp thời.  
        	**Response:**  bao gồm các biện pháp được thực hiện sau khi sự cố đã được phát hiện nhằm giảm thiểu tác động, ngăn chặn sự lan rộng và khôi phục hoạt động bình thường của hệ thống. Các hoạt động Response thường bao gồm cô lập thiết bị bị tấn công, khôi phục dữ liệu từ bản sao lưu, khôi phục dịch vụ hoặc thực hiện quy trình ứng cứu sự cố.  
 

## **5.1.3. Risk Mitigation Plan (RMiP)**

### **5.1.3.1. Cost and Time to Implement**

Table XX. Cost and Time Required for Risk Mitigation Implementation

| No. | Risk | Cost | Time |
| :---: | ----- | ----- | ----- |
| 1 | AI đưa ra khuyến nghị sai (Hallucination) | Sử dụng Local LLM (Qwen 2.5) kết hợp Prompt Engineering, RAG và HITL nên không phát sinh chi phí API, đồng thời tránh rò rỉ dữ liệu ra dịch vụ AI bên ngoài: 0 VND |   |
| 2 | Mất dữ liệu log do Kafka Queue Failure | Apache Kafka là phần mềm mã nguồn mở, chỉ cần cấu hình replication và monitoring trên hạ tầng hiện có: 0 VND |   |
| 3 | Endpoint bị compromise | Sử dụng Wazuh Agent, Sysmon, FIM và Active Response đều là các công cụ miễn phí được tích hợp trong hệ thống: 0 VND |   |
| 4 | AI Service ngừng hoạt động | Hệ thống vẫn hoạt động với Wazuh SIEM khi AI Agent không khả dụng, không cần triển khai thêm dịch vụ trả phí: 0 VND |   |
| 5 | DDoS vào Dashboard | Áp dụng firewall rules và rate limiting trên pfSense (Open Source), không phát sinh chi phí bản quyền: 0 VND |   |
| 6 | Human Approval Delay | Cấu hình quy trình Human-in-the-Loop và phân quyền người quản trị, không yêu cầu đầu tư phần mềm hoặc phần cứng mới: 0 VND |   |
| 7 | Rò rỉ dữ liệu từ AI API | Triển khai Local AI thay cho Cloud AI giúp loại bỏ hoàn toàn chi phí API và giảm nguy cơ rò rỉ dữ liệu: 0 VND |   |
| 8 | Hỏng phần cứng máy chủ | Tạo bản sao lưu VM và snapshot trên VMware trong môi trường Lab: 0 VND |   |
| 9 | Lỗi cấu hình hệ thống | Thực hiện hardening, Security Configuration Assessment (SCA) và xây dựng Baseline Configuration bằng các tính năng có sẵn của Wazuh: 0 VND |   |
| 10 | Mất điện hoặc lỗi Hypervisor | Sử dụng chức năng Snapshot và Backup của VMware trong môi trường lab, không cần đầu tư thêm thiết bị: 0 VND |   |

 

### **5.1.3.2. Operational Impact**

Table XX. Operational Impact of Risk Mitigation Measures

| No. | Risks | Treatment Type |
| :---: | ----- | :---: |
| 1 | AI đưa ra khuyến nghị sai (Hallucination) | High |
| 2 | Mất dữ liệu log do Kafka Queue Failure | High |
| 3 | Endpoint bị compromise | High |
| 4 | AI Service ngừng hoạt động | Medium |
| 5 | DDoS vào Dashboard | Medium |
| 6 | Human Approval Delay | Low |
| 7 | Rò rỉ dữ liệu từ AI API | High |
| 8 | Hỏng phần cứng máy chủ | High |
| 9 | Lỗi cấu hình hệ thống | High |
| 10 | Mất điện hoặc lỗi Hypervisor | High |

 

# **5.2. Priority Risk Mitigation List**

## **5.2.1. Threat/Vulnerability Matrix Method**

Ma trận 4x4 được sử dụng để hỗ trợ việc xếp hạng định tính và ưu tiên các mối đe dọa/lỗ hổng bảo mật được trình bày trong bảng dưới đây. Ma trận này thể hiện bốn mức độ thuộc mục Severity, bao gồm: Minor, Noticeable, Significant và Catastrophic; đồng thời hiển thị bốn mức độ thuộc mục Likelihood, bao gồm: Rare, Unlikely, Possible và Likely. Các giá trị trong ma trận được xác định bằng cách nhân điểm số của Likelihood với điểm số của Severity để phân loại các cấp độ từ Low, Medium, Serious đến High.  
   
Table XX. Threat/Vulnerability 4×4 Risk Matrix  
 

## **5.2.2. Prioritizing Countermeasures**

Table XX. Risk Prioritization Matrix Results

| No. | Risks | Severity | Likelihood | Score |
| :---: | ----- | :---: | :---: | :---: |
| 1 | AI đưa ra khuyến nghị sai (Hallucination) | Significant (3) | Possible (3) | Serious (9) |
| 2 | Mất dữ liệu log do Kafka Queue Failure | Significant (3) | Unlikely (2) | Serious (6) |
| 3 | Endpoint bị compromise | Catastrophic (4) | Likely (4) | High (16) |
| 4 | AI Service ngừng hoạt động | Noticeable (2) | Possible (3) | Serious (6) |
| 5 | DDoS vào Dashboard | Noticeable (2) | Possible (3) | Serious (6) |
| 6 | Human Approval Delay | Minor (1) | Possible (3) | Medium (3) |
| 7 | Rò rỉ dữ liệu từ AI API | Catastrophic (4) | Unlikely (2) | Serious (8) |
| 8 | Hỏng phần cứng máy chủ | Catastrophic (4) | Rare (1) | Medium (4) |
| 9 | Lỗi cấu hình hệ thống | Significant (3) | Likely (4) | High (12) |
| 10 | Mất điện hoặc lỗi Hypervisor | Catastrophic (4) | Rare (1) | Medium (4) |

## **5.2.3. Verify How They Can Be Mitigated**

Sau khi xác định các rủi ro ưu tiên và triển khai các biện pháp giảm thiểu tương ứng, cần tiến hành xác minh (Verification) để đảm bảo rằng các biện pháp bảo mật hoạt động đúng như mong đợi và có khả năng giảm thiểu rủi ro một cách hiệu quả. Quá trình xác minh được thực hiện thông qua việc kiểm tra định kỳ hệ thống, mô phỏng các tình huống tấn công và đánh giá khả năng phát hiện cũng như phản ứng của hệ thống trước các sự cố an ninh mạng.

Đối với hệ thống giám sát an ninh mạng được đề xuất, các hoạt động xác minh bao gồm:

●   	**Thường xuyên kiểm tra tình trạng hoạt động của hệ thống Wazuh SIEM, Apache Kafka và AI Agent** nhằm đảm bảo quá trình thu thập, truyền tải và phân tích log luôn diễn ra ổn định. Đồng thời theo dõi mức sử dụng CPU, RAM, dung lượng lưu trữ và trạng thái của các dịch vụ để phát hiện sớm các dấu hiệu bất thường có thể ảnh hưởng đến khả năng giám sát.  
●   	**Thực hiện cập nhật định kỳ hệ điều hành, Wazuh Manager, Wazuh Agent, Apache Kafka và các thành phần liên quan** nhằm khắc phục các lỗ hổng bảo mật đã được công bố, đồng thời áp dụng các bản vá (Security Patch) và cấu hình bảo mật (Hardening) để giảm thiểu nguy cơ bị khai thác.  
●   	**Triển khai cơ chế giám sát và phát hiện xâm nhập theo thời gian thực** bằng cách kết hợp Wazuh SIEM, Sysmon, File Integrity Monitoring (FIM) và Suricata IDS/IPS. Các thành phần này giúp phát hiện các hành vi bất thường như tạo tiến trình trái phép, thay đổi tệp tin quan trọng, thực thi PowerShell độc hại, quét mạng hoặc các dấu hiệu tấn công từ chối dịch vụ (DoS/DDoS).  
●   	**Thực hiện các kịch bản mô phỏng tấn công (Attack Simulation)** trong môi trường thử nghiệm nhằm đánh giá khả năng phát hiện và phản ứng của hệ thống. Các kịch bản bao gồm thực thi PowerShell bất thường, Account Enumeration, Process Creation, thay đổi tệp tin để kích hoạt File Integrity Monitoring (FIM), cũng như các hành vi mô phỏng leo thang đặc quyền (Privilege Escalation). Kết quả thu được sẽ được đối chiếu với các cảnh báo sinh ra từ Wazuh để đánh giá độ chính xác của hệ thống.  
●   	**Kiểm chứng hiệu quả của mô-đun AI và cơ chế Human-in-the-Loop (HITL)** bằng cách so sánh các đề xuất xử lý do AI tạo ra với quyết định cuối cùng của chuyên viên an ninh. Các phản hồi từ người dùng sẽ được lưu trữ và sử dụng để điều chỉnh Prompt, cập nhật cơ sở tri thức (Knowledge Base) và tối ưu hóa các quy tắc phát hiện, từ đó nâng cao độ chính xác của AI theo thời gian.  
●   	**Kiểm tra định kỳ khả năng sao lưu và khôi phục dữ liệu (Backup & Recovery)** bằng cách thử nghiệm khôi phục các máy ảo, cấu hình Wazuh, dữ liệu Kafka và cơ sở dữ liệu của hệ thống. Việc kiểm thử này nhằm đảm bảo hệ thống có thể nhanh chóng phục hồi khi xảy ra sự cố phần cứng, mất dữ liệu hoặc lỗi hạ tầng ảo hóa.

 

 

# **5.3. Perform CBA on the Identified List**

## **5.3.1. Calculate CBA**

**Cost-Benefit Analysis (CBA)** được sử dụng để đánh giá tính hiệu quả của các biện pháp giảm thiểu rủi ro bằng cách so sánh giữa chi phí triển khai (Cost) và lợi ích thu được (Benefit). Trong phạm vi đề tài, lợi ích được đánh giá dựa trên khả năng giảm thiểu rủi ro, nâng cao khả năng phát hiện và phản ứng với sự cố, cũng như đảm bảo tính sẵn sàng của hệ thống.

Công thức được sử dụng: **CBA \= Benefit − Cost**

Trong đó:

●   	**Cost**: Chi phí triển khai biện pháp giảm thiểu, bao gồm chi phí phần mềm, phần cứng và thời gian cấu hình.  
●   	**Benefit**: Giá trị thu được sau khi áp dụng biện pháp bảo mật, thể hiện qua việc giảm khả năng xảy ra sự cố, giảm thời gian phát hiện (MTTD), giảm thời gian xử lý (MTTR), hạn chế mất dữ liệu và nâng cao tính sẵn sàng của hệ thống.

Do hệ thống được xây dựng hoàn toàn trên nền tảng mã nguồn mở như **Wazuh SIEM, Apache Kafka, Ollama (Local LLM), Sysmon, Suricata và pfSense**, phần lớn các biện pháp bảo mật không phát sinh chi phí bản quyền. Chi phí chủ yếu đến từ việc cấu hình hệ thống, thời gian triển khai và lưu trữ dữ liệu sao lưu.

**Cost-Benefit Analysis:**  
Table XX. Cost-Benefit Analysis of Proposed Countermeasures

| No. | Countermeasure | Estimated Cost (VND) | Expected Benefit | CBA Result |
| :---: | ----- | ----- | ----- | ----- |
| 1 | Local AI | 0 | Không phát sinh chi phí API, bảo vệ dữ liệu nội bộ, giảm AI Hallucination | Positive |
| 2 | Apache Kafka | 0 | Đảm bảo truyền log ổn định, tránh mất dữ liệu và tăng khả năng mở rộng | Positive |
| 3 | Wazuh Active Response | 0 | Tự động phản ứng khi phát hiện tấn công, giảm MTTR | Positive |
| 4 | Sysmon \+ File Integrity Monitoring | 0 | Nâng cao khả năng phát hiện hành vi bất thường trên endpoint | Positive |
| 5 | Suricata IDS/IPS | 0 | Phát hiện và cảnh báo tấn công mạng theo thời gian thực | Positive |
| 6 | pfSense Firewall | 0 | Ngăn chặn truy cập trái phép và giảm nguy cơ DDoS | Positive |
| 7 | Backup & VM Snapshot | 0 | Đảm bảo khả năng phục hồi dữ liệu và giảm thiệt hại khi xảy ra sự cố | Positive |

 

## **5.3.2. CBA Report**

Kết quả phân tích Cost-Benefit Analysis cho thấy các biện pháp bảo mật được đề xuất đều có tính khả thi và mang lại hiệu quả kinh tế cao trong phạm vi triển khai của đề tài. Phần lớn các thành phần như Wazuh SIEM, Apache Kafka, Sysmon, Suricata, pfSense và Local LLM đều là các giải pháp mã nguồn mở nên không phát sinh chi phí bản quyền. Điều này giúp giảm đáng kể tổng chi phí triển khai nhưng vẫn đảm bảo hiệu quả trong việc giám sát, phát hiện và phản ứng với các sự cố an ninh mạng.

Bên cạnh đó, việc sử dụng **Local AI kết hợp Retrieval-Augmented Generation (RAG) và cơ chế Human-in-the-Loop (HITL)** không chỉ loại bỏ chi phí sử dụng các dịch vụ AI trên nền tảng đám mây mà còn giảm nguy cơ rò rỉ dữ liệu nhạy cảm ra bên ngoài. Apache Kafka đóng vai trò là hàng đợi thông điệp trung gian giúp hệ thống hoạt động ổn định hơn, hạn chế mất log khi AI Agent hoặc các thành phần xử lý gặp sự cố.

Mặc dù hệ thống có phát sinh một khoản chi phí nhỏ cho việc lưu trữ dữ liệu sao lưu và snapshot máy ảo, nhưng khoản đầu tư này giúp tăng đáng kể khả năng khôi phục sau sự cố, giảm thời gian gián đoạn dịch vụ và hạn chế nguy cơ mất dữ liệu. Vì vậy, lợi ích thu được từ các biện pháp bảo mật đều lớn hơn chi phí triển khai.

Kết quả phân tích CBA chứng minh rằng các biện pháp giảm thiểu rủi ro được lựa chọn là **hiệu quả về mặt chi phí, phù hợp với môi trường phòng Lab và có khả năng mở rộng để triển khai trong môi trường doanh nghiệp**. Góp phần nâng cao tính bảo mật, tính sẵn sàng và độ tin cậy của hệ thống giám sát an ninh mạng được đề xuất.

# **5.4. Implement the RMiP**

## **5.4.1. Tools and Techniques**

Để triển khai kế hoạch giảm thiểu rủi ro, hệ thống sử dụng nhiều công cụ và kỹ thuật bảo mật khác nhau nhằm xây dựng mô hình phòng thủ nhiều lớp (Defense-in-Depth). Mỗi thành phần đảm nhận một vai trò riêng trong việc thu thập dữ liệu, phát hiện mối đe dọa, phân tích cảnh báo và phản ứng với sự cố.  
Table XX. Tools and Techniques Used for Risk Mitigation Implementation

| No. | Tool and techniques | Details |
| :---: | ----- | ----- |
| 1 | Wazuh SIEM | Thu thập, phân tích log và tạo cảnh báo an ninh từ các endpoint Windows/Linux. |
| 2 | Apache Kafka | Đóng vai trò Message Broker trung gian, truyền tải log và cảnh báo giữa Wazuh và AI Agent, giúp hệ thống hoạt động bất đồng bộ và tránh mất dữ liệu khi AI quá tải. |
| 3 | Local AI | Đóng vai trò Message Broker trung gian, truyền tải log và cảnh báo giữa Wazuh và AI Agent, giúp hệ thống hoạt động bất đồng bộ và tránh mất dữ liệu khi AI quá tải. |
| 4 | Retrieval-Augmented Generation (RAG) | Bổ sung ngữ cảnh từ cơ sở tri thức để giảm hiện tượng AI Hallucination và nâng cao độ chính xác của phản hồi. |
| 5 | Human-in-the-Loop (HITL) | Bổ sung ngữ cảnh từ cơ sở tri thức để giảm hiện tượng AI Hallucination và nâng cao độ chính xác của phản hồi. |
| 6 | Sysmon | Bổ sung ngữ cảnh từ cơ sở tri thức để giảm hiện tượng AI Hallucination và nâng cao độ chính xác của phản hồi. |
| 7 | File Integrity Monitoring (FIM) | Theo dõi và phát hiện các thay đổi trái phép trên các tệp tin quan trọng. |
| 8 | Suricata IDS/IPS | Giám sát lưu lượng mạng và phát hiện các hành vi tấn công theo thời gian thực. |
| 9 | pfSense Firewall | Kiểm soát lưu lượng mạng, ngăn chặn truy cập trái phép và hỗ trợ chống DoS/DDoS. |
| 10 | Wazuh Active Response | Tự động thực hiện các hành động như chặn IP hoặc cô lập endpoint khi phát hiện mối đe dọa nghiêm trọng. |

 

## **5.4.2. Policies, Procedures for Controlling Regular Backups and Configuration Hardening.**

Để đảm bảo tính sẵn sàng (Availability), tính toàn vẹn (Integrity) và khả năng phục hồi (Recoverability) của hệ thống, dự án xây dựng các chính sách sao lưu (Backup Policy) và quy trình tăng cường bảo mật cấu hình (Configuration Hardening). Hai chính sách này đóng vai trò quan trọng trong việc giảm thiểu rủi ro mất dữ liệu, hạn chế các lỗi cấu hình và đảm bảo hệ thống luôn hoạt động ổn định ngay cả khi xảy ra sự cố.

### **5.4.2.1. Backup Policy**

Hệ thống áp dụng chính sách sao lưu định kỳ nhằm đảm bảo dữ liệu quan trọng luôn có thể được phục hồi trong trường hợp xảy ra tấn công mạng, lỗi phần cứng hoặc lỗi vận hành. Các dữ liệu cần được sao lưu bao gồm cơ sở dữ liệu của Wazuh Indexer, cấu hình của Wazuh Manager, Apache Kafka, AI Agent, Dashboard, cũng như các máy ảo đang vận hành trên nền tảng ảo hóa.

Để tối ưu giữa dung lượng lưu trữ và khả năng phục hồi, hệ thống sử dụng kết hợp nhiều hình thức sao lưu khác nhau. Cụ thể, **Incremental Backup** được thực hiện hằng ngày để chỉ lưu các thay đổi mới phát sinh, giúp tiết kiệm không gian lưu trữ và giảm thời gian sao lưu. Bên cạnh đó, **Full Backup** được thực hiện mỗi tuần nhằm tạo ra một bản sao hoàn chỉnh của toàn bộ hệ thống, phục vụ cho việc khôi phục khi xảy ra sự cố nghiêm trọng. Trước mỗi lần cập nhật phần mềm hoặc thay đổi cấu hình quan trọng, hệ thống cũng tạo **VM Snapshot** để có thể nhanh chóng quay trở lại trạng thái ổn định nếu quá trình nâng cấp gặp lỗi.

Ngoài việc tạo bản sao lưu, nhóm còn xây dựng quy trình **Restore Testing** theo định kỳ. Việc kiểm thử khôi phục giúp xác minh rằng các bản sao lưu không bị lỗi, dữ liệu có thể phục hồi đầy đủ và thời gian khôi phục đáp ứng yêu cầu vận hành của hệ thống. Đây là bước quan trọng vì một bản sao lưu chỉ thực sự có giá trị khi có thể khôi phục thành công trong tình huống thực tế.

Trong môi trường triển khai thực tế, các bản sao lưu cần được lưu trữ trên thiết bị độc lập với hệ thống chính như NAS hoặc máy chủ Backup riêng, đồng thời áp dụng nguyên tắc **3-2-1 Backup Rule** (03 bản sao dữ liệu, lưu trên 02 loại phương tiện khác nhau và có ít nhất 01 bản lưu ở vị trí độc lập) nhằm nâng cao khả năng chống mất dữ liệu khi xảy ra thiên tai hoặc tấn công ransomware.

### **5.4.2.2. Configuration Hardening Policy**

Bên cạnh việc sao lưu dữ liệu, hệ thống cũng áp dụng các chính sách Configuration Hardening nhằm giảm thiểu các lỗ hổng phát sinh từ việc cấu hình sai hoặc sử dụng các thiết lập mặc định không an toàn.

Trước hết, tất cả các máy chủ đều được **vô hiệu hóa các dịch vụ và cổng mạng không cần thiết**, chỉ giữ lại các dịch vụ phục vụ trực tiếp cho hoạt động của hệ thống. Điều này giúp giảm bề mặt tấn công (Attack Surface) và hạn chế khả năng khai thác của kẻ tấn công.

Đối với tài khoản người dùng và tài khoản dịch vụ, hệ thống áp dụng nguyên tắc **Least Privilege**, chỉ cấp những quyền tối thiểu cần thiết để thực hiện công việc. Đồng thời, các tài khoản quản trị đều phải sử dụng **mật khẩu mạnh**, kích hoạt **Multi-Factor Authentication (MFA)** và được ghi nhận đầy đủ lịch sử đăng nhập để phục vụ việc kiểm tra sau này.

Các thành phần như Wazuh Manager, Wazuh Agent, Apache Kafka và AI Agent được cập nhật thường xuyên nhằm đảm bảo các lỗ hổng bảo mật đã được vá kịp thời. Ngoài ra, toàn bộ kết nối giữa các thành phần trong hệ thống đều sử dụng giao thức **TLS** để bảo vệ dữ liệu trong quá trình truyền tải, ngăn chặn nguy cơ nghe lén hoặc giả mạo kết nối.

Riêng đối với Apache Kafka, hệ thống cấu hình **Access Control List (ACL)** để kiểm soát quyền truy cập của từng Producer và Consumer. Điều này giúp đảm bảo chỉ các dịch vụ được cấp quyền mới có thể gửi hoặc nhận dữ liệu từ Kafka, giảm nguy cơ truy cập trái phép hoặc làm thay đổi dữ liệu cảnh báo.

Song song với đó, hệ thống định kỳ sử dụng tính năng **Security Configuration Assessment (SCA)** của Wazuh để kiểm tra mức độ tuân thủ các tiêu chuẩn bảo mật và phát hiện các cấu hình chưa an toàn. Kết quả đánh giá sẽ được sử dụng để điều chỉnh cấu hình và cập nhật Security Baseline của hệ thống.

Việc kết hợp giữa chính sách sao lưu và Configuration Hardening giúp hệ thống vừa có khả năng phục hồi nhanh sau sự cố, vừa giảm đáng kể nguy cơ bị khai thác thông qua các lỗ hổng cấu hình.

   
 

## **5.4.3. Operational Controls**

Bên cạnh các biện pháp kỹ thuật, dự án còn triển khai các biện pháp kiểm soát vận hành (Operational Controls) nhằm đảm bảo hệ thống luôn được quản lý đúng quy trình, giảm thiểu sai sót do con người và nâng cao khả năng ứng phó với các sự cố an ninh mạng. Các biện pháp này đóng vai trò quan trọng trong việc duy trì hiệu quả lâu dài của toàn bộ hệ thống.

### **5.4.3.1. Security Awareness Training**

Con người luôn được xem là một trong những mắt xích dễ bị khai thác nhất trong hệ thống thông tin. Vì vậy, tất cả nhân viên hoặc quản trị viên tham gia vận hành hệ thống đều cần được đào tạo định kỳ về nhận thức an toàn thông tin.

Chương trình đào tạo tập trung vào việc nhận biết các hình thức tấn công phổ biến như Phishing, Malware, Ransomware, Social Engineering và Credential Theft. Người vận hành cũng được hướng dẫn cách đọc và phân tích các cảnh báo do Wazuh SIEM sinh ra, hiểu được ý nghĩa của các khuyến nghị do AI Agent đề xuất và biết cách sử dụng cơ chế **Human-in-the-Loop** để xác nhận hoặc từ chối các hành động trước khi hệ thống thực hiện phản ứng tự động.

Ngoài ra, nhân viên còn được phổ biến các quy định về quản lý tài khoản, bảo vệ mật khẩu, sử dụng xác thực đa yếu tố và quy trình báo cáo khi phát hiện dấu hiệu bất thường. Việc đào tạo thường xuyên sẽ góp phần giảm thiểu các lỗi vận hành và nâng cao khả năng phối hợp khi xảy ra sự cố.  
 

### **5.4.3.2. Configuration Management**

Mọi thay đổi cấu hình của hệ thống đều phải được quản lý theo một quy trình thống nhất nhằm tránh phát sinh lỗi ngoài ý muốn.

Trước khi áp dụng bất kỳ thay đổi nào, nhóm quản trị sẽ đánh giá mức độ ảnh hưởng, lập kế hoạch triển khai và thực hiện kiểm thử trên môi trường thử nghiệm nếu cần thiết. Sau khi thay đổi được áp dụng, hệ thống tiếp tục được giám sát để đảm bảo các dịch vụ vẫn hoạt động bình thường và không phát sinh lỗ hổng mới.

Tất cả các thay đổi đều được ghi nhận vào nhật ký quản lý cấu hình (Configuration Change Log), bao gồm thời gian thay đổi, người thực hiện, nội dung thay đổi và lý do thực hiện. Trong trường hợp phát hiện lỗi, hệ thống có thể nhanh chóng quay trở lại cấu hình trước đó thông qua các bản sao lưu hoặc VM Snapshot đã được tạo trước khi cập nhật.

Quy trình này giúp đảm bảo tính nhất quán của hệ thống, giảm thiểu sai sót trong quá trình bảo trì và tạo điều kiện thuận lợi cho việc kiểm tra, đánh giá sau này.

### **5.4.3.3. Contingency Planning**

Để đảm bảo tính liên tục của dịch vụ khi xảy ra sự cố, nhóm xây dựng kế hoạch dự phòng (Contingency Plan) cho các tình huống có thể ảnh hưởng đến hoạt động của hệ thống.

Trong trường hợp AI Agent ngừng hoạt động, Wazuh SIEM vẫn tiếp tục thu thập log và sinh cảnh báo theo các quy tắc đã cấu hình, giúp hệ thống không bị gián đoạn hoàn toàn. Nếu Apache Kafka gặp sự cố, dữ liệu sẽ được lưu tạm thời và đồng bộ trở lại sau khi dịch vụ được khôi phục nhằm hạn chế nguy cơ mất log.

Đối với các sự cố nghiêm trọng như lỗi máy chủ, hỏng ổ cứng hoặc mất điện, hệ thống sẽ sử dụng VM Snapshot và các bản sao lưu gần nhất để khôi phục toàn bộ môi trường vận hành. Sau khi khôi phục, nhóm quản trị sẽ tiến hành kiểm tra tính toàn vẹn của dữ liệu và xác nhận rằng tất cả các dịch vụ đã hoạt động bình thường trước khi đưa hệ thống trở lại trạng thái khai thác.

Việc xây dựng kế hoạch dự phòng giúp giảm thời gian gián đoạn dịch vụ, nâng cao khả năng phục hồi và đảm bảo tính sẵn sàng của hệ thống.

### **5.4.3.4. Incident Response**

Hệ thống áp dụng quy trình ứng cứu sự cố theo bốn giai đoạn chính nhằm đảm bảo mọi sự cố đều được xử lý một cách nhất quán và hiệu quả.

Khi Wazuh SIEM, Sysmon hoặc Suricata phát hiện dấu hiệu bất thường, hệ thống sẽ ghi nhận sự kiện và chuyển cảnh báo tới AI Agent thông qua Apache Kafka. AI Agent sẽ phân tích log, đánh giá mức độ nghiêm trọng và đưa ra khuyến nghị xử lý. Đối với các hành động có mức ảnh hưởng cao, cơ chế Human-in-the-Loop sẽ yêu cầu chuyên viên an ninh xác nhận trước khi thực hiện.

Sau khi được phê duyệt, Wazuh Active Response có thể tự động chặn địa chỉ IP độc hại, cô lập endpoint bị xâm nhập hoặc dừng tiến trình đáng ngờ nhằm ngăn chặn sự lan rộng của cuộc tấn công. Tiếp theo, nhóm quản trị tiến hành loại bỏ nguyên nhân gây ra sự cố, cập nhật bản vá nếu cần thiết và khôi phục hệ thống từ bản sao lưu trong trường hợp dữ liệu bị ảnh hưởng.

Cuối cùng, toàn bộ quá trình xử lý được tổng hợp thành báo cáo, phân tích nguyên nhân gốc (Root Cause Analysis) và cập nhật lại cơ sở tri thức của AI cũng như các quy tắc phát hiện của Wazuh. Điều này giúp hệ thống ngày càng hoàn thiện, giảm khả năng lặp lại các sự cố tương tự trong tương lai và nâng cao hiệu quả của mô hình giám sát an ninh mạng thông minh.

# **5.5. Follow Up on the RMiP**

## **5.5.1. Ensuring Countermeasures Are Implemented**

Sau khi các biện pháp giảm thiểu rủi ro (Risk Mitigation Plan \- RMiP) được phê duyệt, mỗi biện pháp sẽ được phân công cho các thành viên phụ trách và thực hiện theo đúng kế hoạch triển khai của dự án. Sau khi hoàn thành, nhóm tiến hành kiểm tra, đánh giá và cập nhật trạng thái của từng biện pháp nhằm đảm bảo rằng tất cả các cơ chế bảo mật đã được triển khai đầy đủ và hoạt động đúng như thiết kế. Bảng dưới đây thể hiện tiến độ triển khai các biện pháp giảm thiểu chính trong hệ thống. Các hoạt động mang tính định kỳ như cập nhật bản vá, đào tạo nhận thức an toàn thông tin hoặc kiểm tra sao lưu không được liệt kê trong bảng này vì chúng được thực hiện xuyên suốt quá trình vận hành hệ thống.  
Table XX. Implementation Status of Risk Mitigation Countermeasures

| No. | Countermeasur | Expected Date of Implementation | Status |
| ----- | ----- | ----- | ----- |
| 1 | Triển khai hệ thống **Wazuh SIEM** để thu thập log tập trung và giám sát an ninh mạng. |   |   |
| 2 | Cấu hình **Apache Kafka** làm Message Broker trung gian giữa Wazuh và AI Agent. |   |   |
| 3 | Tích hợp **Local LLM kết hợp RAG và Human-in-the-Loop** để hỗ trợ phân tích và xử lý cảnh báo. |   |   |
| 4 | Triển khai **Sysmon** và **File Integrity Monitoring (FIM)** trên các máy trạm và máy chủ cần giám sát. |   |   |
| 5 | Cấu hình **Suricata IDS/IPS** và **pfSense Firewall** nhằm bảo vệ hệ thống trước các cuộc tấn công từ mạng. |   |   |
| 6 | Kích hoạt **Wazuh Active Response** để tự động phản ứng khi phát hiện các mối đe dọa nghiêm trọng. |   |   |
| 7 | Thiết lập chính sách **sao lưu dữ liệu (Backup)** và **VM Snapshot** phục vụ khôi phục sau sự cố. |   |   |
| 8 | Thực hiện **Configuration Hardening** và **Security Configuration Assessment (SCA)** nhằm tăng cường bảo mật hệ thống. |   |   |

 

## **5.5.2. Ensuring Security Gaps Have Been Closed**

Sau khi hoàn thành việc triển khai các biện pháp giảm thiểu, nhóm tiến hành đánh giá lại toàn bộ hệ thống nhằm xác minh rằng các lỗ hổng và khoảng trống bảo mật đã được xử lý hiệu quả. Quá trình đánh giá này bao gồm việc kiểm tra khả năng phát hiện của hệ thống, đánh giá hiệu quả của các cơ chế phản ứng tự động và xác nhận rằng các cấu hình bảo mật đã đáp ứng các yêu cầu đặt ra.

Để đảm bảo việc đánh giá được thực hiện đầy đủ, nhóm tiến hành kiểm tra từng thành phần của hệ thống như Wazuh SIEM, Apache Kafka, AI Agent, Suricata IDS/IPS và pfSense Firewall. Đồng thời, các kịch bản mô phỏng tấn công được thực hiện để xác minh rằng hệ thống vẫn có thể phát hiện và phản ứng chính xác trước các hành vi bất thường sau khi các biện pháp bảo mật được triển khai.

Table XX. Countermeasures Implementation Assessment Result

| No. | Security Verification Activity | Expected Date of Implementation | Immediately after Implementation | 1 Month Later | 3 Months Later |
| :---: | ----- | ----- | ----- | ----- | ----- |
| 1 | Kiểm tra khả năng phát hiện của **Wazuh SIEM** thông qua các kịch bản mô phỏng tấn công. |   | Effective | Effective | Effective |
| 2 | Kiểm tra quá trình truyền dữ liệu giữa **Wazuh**, **Apache Kafka** và **AI Agent**. |   | Effective | Effective | Effective |
| 3 | Đánh giá độ chính xác của các khuyến nghị do **AI Agent** tạo ra thông qua cơ chế **Human-in-the-Loop**. |   | Partly Effective | Effective | Effective |
| 4 | Thực hiện **Security Configuration Assessment (SCA)** để đánh giá cấu hình bảo mật của hệ thống. |   | Effective | Effective | Effective |
| 5 | Kiểm tra khả năng hoạt động của **Wazuh Active Response** khi xảy ra các sự kiện bất thường. |   | Effective | Effective | Effective |
| 6 | Thử nghiệm **khôi phục dữ liệu từ Backup và VM Snapshot**. |   | Effective | Effective | Effective |
| 7 | Đánh giá khả năng phát hiện của **Suricata IDS/IPS** đối với các cuộc tấn công mạng. |   | Partly Effective | Effective | Effective |
| 8 | Rà soát các quy tắc của **pfSense Firewall** và chính sách phân quyền truy cập. |   | Effective | Effective | Effective |

   
 

