# **REPORT 2: PROJECT MANAGEMENT PLAN**

# **I. Problem Setting**

## **1.1. Name of the Project**

Nghiên cứu và xây dựng hệ thống giám sát an ninh mạng tự động hóa dựa trên cơ chế hợp tác người – máy (Human-in-the-Loop) và AI tạo sinh  

## **1.2. Abstract**

Trong bối cảnh chuyển đổi số diễn ra mạnh mẽ, hạ tầng công nghệ thông tin ngày càng trở thành thành phần cốt lõi trong hoạt động của các tổ chức và doanh nghiệp. Song song với sự phát triển đó, số lượng các mối đe dọa an ninh mạng cũng không ngừng gia tăng cả về quy mô lẫn mức độ tinh vi. Các cuộc tấn công mạng hiện đại như ransomware, khai thác lỗ hổng zero-day, tấn công có chủ đích (APT) hay tấn công chuỗi cung ứng đã đặt ra yêu cầu cấp thiết về việc xây dựng các hệ thống giám sát an ninh mạng hiệu quả và có khả năng phản ứng nhanh.

Hiện nay, các nền tảng SIEM truyền thống chủ yếu dựa trên các quy tắc phát hiện tĩnh (rule-based detection). Mặc dù có khả năng thu thập, tập trung và phân tích dữ liệu log từ nhiều nguồn khác nhau, các hệ thống này vẫn tồn tại nhiều hạn chế như số lượng cảnh báo quá lớn, tỷ lệ cảnh báo giả cao, thiếu khả năng hiểu ngữ cảnh và chưa hỗ trợ hiệu quả cho quá trình ra quyết định của chuyên viên vận hành an ninh. Bên cạnh đó, các hệ thống SOAR tuy có khả năng tự động hóa phản ứng sự cố nhưng thường phụ thuộc vào các playbook được định nghĩa trước và thiếu tính linh hoạt đối với những tình huống bất thường.

Xuất phát từ thực tế trên, đề tài hướng đến việc nghiên cứu và xây dựng một hệ thống giám sát an ninh mạng thông minh bằng cách tích hợp nền tảng SIEM Wazuh, mô hình trí tuệ nhân tạo tạo sinh (Generative AI), cơ chế Human-in-the-Loop (HITL) và khả năng phản ứng sự cố tự động theo định hướng SOAR.

Trong mô hình đề xuất, Wazuh đảm nhiệm vai trò thu thập và phát hiện các sự kiện bất thường từ các endpoint Windows và Linux. Sau khi cảnh báo được tạo ra, AI Agent sẽ tiến hành phân tích dữ liệu và đề xuất phương án xử lý phù hợp, tóm tắt nội dung cảnh báo, đánh giá mức độ nghiêm trọng. Các kết quả phân tích của AI sẽ không được thực thi trực tiếp mà phải trải qua cơ chế Human-in-the-Loop, cho phép chuyên viên an ninh xem xét, xác nhận hoặc chỉnh sửa trước khi hệ thống thực hiện phản ứng sự cố.

Đề tài được triển khai trong môi trường thực nghiệm sử dụng đồng bộ giữa tầng vật lý và tầng công nghệ ảo kết hợp với các máy Host và các máy ảo để mô phỏng một môi trường hệ thống SOC giám sát các máy endpoint Windows/Linux, đồng thời tích hợp AI để hỗ trợ theo mục tiêu của đề tài đưa ra. Ngoài ra, hệ thống còn tích hợp Sysmon, File Integrity Monitoring (FIM), Wazuh Active Response và các thành phần mở rộng của IDS/IPS(pfSense, Suricata, etc.) nhằm nâng cao tính hoạt động của hệ thống.

Kết quả nghiên cứu kỳ vọng sẽ xây dựng được một mô hình giám sát an ninh mạng có khả năng:

* Thu thập và phân tích dữ liệu tập trung từ nhiều endpoint;  
* Hỗ trợ chuyên viên an ninh trong quá trình điều tra và xử lý cảnh báo;  
* Giảm thời gian phát hiện và phản ứng sự cố;  
* Hạn chế tình trạng quá tải cảnh báo trong SOC;  
* Tăng cường độ chính xác trong quá trình xử lý thông qua cơ chế Human-in-the-Loop;  
* Đặt nền tảng cho việc xây dựng các hệ thống SOC thông minh dựa trên AI trong tương lai.

Thông qua việc kết hợp giữa SIEM, Generative AI, HITL và SOAR, đề tài góp phần đề xuất một hướng tiếp cận mới trong lĩnh vực giám sát an ninh mạng, đồng thời mang lại giá trị ứng dụng thực tiễn đối với các doanh nghiệp vừa và nhỏ tại Việt Nam.

## **1.3. Project Overview**

### **1.3.1. The Current Situation**

Để tăng cường khả năng giám sát và phát hiện các mối đe dọa, nhiều tổ chức đã triển khai các hệ thống SIEM nhằm thu thập, tập trung và phân tích dữ liệu bảo mật từ nhiều nguồn khác nhau. Tuy nhiên, các hệ thống SIEM truyền thống chủ yếu hoạt động dựa trên các quy tắc phát hiện được định nghĩa sẵn. Cách tiếp cận này tuy mang lại hiệu quả đối với các mẫu tấn công đã biết nhưng lại gặp nhiều khó khăn trong việc phát hiện các hành vi bất thường mới hoặc các kỹ thuật tấn công chưa từng xuất hiện trước đó. Điều này làm giảm khả năng thích ứng của hệ thống trước bối cảnh an ninh mạng liên tục thay đổi.

Bên cạnh đó, khối lượng dữ liệu log và số lượng cảnh báo được tạo ra mỗi ngày là rất lớn. Trong số đó tồn tại một tỷ lệ đáng kể các cảnh báo giả (False Positive), gây ra hiện tượng quá tải cảnh báo (Alert Fatigue). Khi phải xử lý một lượng lớn cảnh báo trong thời gian dài, các chuyên viên an ninh dễ bị quá tải, dẫn đến việc bỏ sót các sự kiện quan trọng hoặc chậm trễ trong quá trình phản ứng sự cố.

Một khó khăn khác của các hệ thống SIEM hiện nay là khả năng hiểu ngữ cảnh còn hạn chế. Các cảnh báo thường chứa nhiều thông tin kỹ thuật phức tạp và rời rạc, đòi hỏi chuyên viên vận hành phải dành nhiều thời gian để phân tích thủ công nhằm xác định mức độ nguy hiểm thực sự của sự cố. Quá trình điều tra và xử lý thủ công không chỉ tiêu tốn nhiều nguồn lực mà còn làm kéo dài thời gian phát hiện (Mean Time To Detect – MTTD) và thời gian phản ứng (Mean Time To Respond – MTTR).

Mặc dù các nền tảng SOAR có khả năng tự động hóa phản ứng sự cố, nhưng phần lớn các hệ thống này đều phụ thuộc vào các playbook được định nghĩa trước. Do đó, chúng khó có thể thích ứng linh hoạt với các tình huống bất thường hoặc các cuộc tấn công có tính chất phức tạp. Ngoài ra, việc cho phép hệ thống thực hiện hoàn toàn tự động mà không có sự giám sát của con người có thể dẫn đến những quyết định sai lệch, chẳng hạn như chặn nhầm địa chỉ IP hợp lệ hoặc cô lập nhầm máy chủ quan trọng, từ đó gây ảnh hưởng đến hoạt động của toàn bộ hệ thống.

Thực tế cũng cho thấy rằng việc xây dựng và duy trì một Trung tâm điều hành an ninh mạng (Security Operations Center – SOC) hoàn chỉnh đòi hỏi chi phí đầu tư lớn cùng đội ngũ chuyên gia có trình độ chuyên môn cao. Đây là một thách thức đáng kể đối với các doanh nghiệp vừa và nhỏ tại Việt Nam, khi nguồn lực tài chính và nhân sự còn nhiều hạn chế. Do đó, nhu cầu về một giải pháp giám sát an ninh mạng có khả năng tự động hóa cao, hỗ trợ chuyên viên phân tích hiệu quả hơn nhưng vẫn đảm bảo sự kiểm soát của con người đang trở nên cấp thiết hơn bao giờ hết.

Chính những hạn chế và khó khăn nêu trên đã đặt ra yêu cầu cần nghiên cứu một mô hình giám sát an ninh mạng mới, có khả năng kết hợp giữa sức mạnh của trí tuệ nhân tạo tạo sinh với vai trò kiểm soát của con người nhằm nâng cao hiệu quả phát hiện, phân tích và phản ứng trước các sự cố an ninh mạng.

### **1.3.2. The Proposed Solution**

Nhằm khắc phục những hạn chế của các hệ thống giám sát an ninh mạng truyền thống, đề tài đề xuất xây dựng một mô hình hệ thống giám sát an ninh mạng thông minh dựa trên sự kết hợp giữa nền tảng SIEM, trí tuệ nhân tạo tạo sinh (Generative AI), cơ chế Human-in-the-Loop và khả năng phản ứng sự cố tự động theo định hướng SOAR.

Trong kiến trúc được đề xuất, nền tảng Wazuh đóng vai trò là thành phần trung tâm chịu trách nhiệm thu thập, chuẩn hóa và phân tích dữ liệu từ các endpoint Windows và Linux. Các dữ liệu đầu vào bao gồm log hệ thống, log bảo mật, dữ liệu telemetry từ Sysmon, File Integrity Monitoring (FIM) và các nguồn dữ liệu bổ sung khác.

Khi phát hiện các dấu hiệu bất thường, Wazuh sẽ tạo ra các cảnh báo an ninh và chuyển chúng đến mô-đun AI Agent. AI Agent sử dụng các mô hình ngôn ngữ lớn (LLM) kết hợp với Prompt Engineering và cơ chế Retrieval-Augmented Generation (RAG) để phân tích sâu hơn nội dung cảnh báo. Kết quả đầu ra bao gồm việc tóm tắt sự kiện, đánh giá mức độ nghiêm trọng, xác định các dấu hiệu tấn công (Indicators of Compromise – IOC) và đề xuất hướng xử lý phù hợp.

Thay vì để AI tự động thực thi các quyết định, hệ thống áp dụng cơ chế Human-in-the-Loop nhằm đảm bảo rằng con người luôn giữ vai trò kiểm soát cuối cùng. Các chuyên viên an ninh có thể xem xét cảnh báo, đánh giá kết quả phân tích của AI, sau đó xác nhận, chỉnh sửa hoặc từ chối các đề xuất xử lý trước khi hệ thống thực hiện phản ứng sự cố.

Sau khi được phê duyệt, các hành động phản ứng sẽ được thực hiện thông qua cơ chế Active Response của Wazuh hoặc các thành phần SOAR bổ trợ. Các hành động này có thể bao gồm chặn địa chỉ IP độc hại, cô lập endpoint, thu thập dữ liệu điều tra số hoặc cập nhật chính sách trên tường lửa.

Thông qua việc kết hợp giữa SIEM, AI tạo sinh, Human-in-the-Loop và SOAR, hệ thống không chỉ giúp giảm tải cho các chuyên viên SOC mà còn nâng cao độ chính xác trong phân tích, rút ngắn thời gian phản ứng sự cố và tăng cường khả năng tự động hóa trong quá trình vận hành.

### **1.3.3. Boundaries of the Solution**

Để đảm bảo tính khả thi cũng như phù hợp với phạm vi nghiên cứu của đồ án, đề tài xác định rõ phạm vi triển khai và các giới hạn của hệ thống.

Trong phạm vi nghiên cứu, hệ thống được xây dựng và triển khai trong môi trường phòng thí nghiệm sử dụng công nghệ ảo hóa. Nền tảng Wazuh được sử dụng để thực hiện chức năng thu thập, phân tích và sinh cảnh báo an ninh. Các endpoint Windows và Linux đóng vai trò phát sinh dữ liệu log và telemetry phục vụ quá trình giám sát.

Hệ thống tích hợp mô-đun AI Agent nhằm hỗ trợ phân tích và đề xuất phương án xử lý đối với các cảnh báo được tạo ra. Đồng thời, cơ chế Human-in-the-Loop được áp dụng để đảm bảo các hành động phản ứng chỉ được thực hiện sau khi đã có sự xác nhận của người quản trị.

Một số chức năng phản ứng sự cố cơ bản như chặn địa chỉ IP, cô lập endpoint hoặc thu thập thông tin phục vụ điều tra số cũng được triển khai nhằm đánh giá khả năng tự động hóa của hệ thống.

Tuy nhiên, đề tài không hướng đến việc xây dựng một hệ thống SOC hoàn chỉnh ở quy mô doanh nghiệp thực tế. Việc huấn luyện hoặc fine-tune mô hình ngôn ngữ lớn từ đầu cũng không nằm trong phạm vi nghiên cứu. Ngoài ra, các nội dung liên quan đến phân tích malware chuyên sâu, phát hiện APT quy mô lớn hoặc triển khai trên môi trường production đều được xem là định hướng mở rộng trong tương lai.

### **1.3.4. Development Environment**

Hệ thống được triển khai trong môi trường phòng thí nghiệm sử dụng nền tảng ảo hóa VMware Workstation nhằm mô phỏng các thành phần của một hệ thống giám sát an ninh mạng thực tế.

Máy chủ trung tâm được cài đặt hệ điều hành Ubuntu Server và đảm nhận vai trò của Wazuh Server, Wazuh Indexer và Wazuh Dashboard. Các endpoint bao gồm Windows 10 và Linux được cài đặt Wazuh Agent để thu thập log và dữ liệu telemetry.

Đối với hệ điều hành Windows, công cụ Sysmon được triển khai nhằm tăng cường khả năng giám sát các tiến trình, kết nối mạng và các hành vi đáng ngờ trên hệ thống. Cơ chế File Integrity Monitoring cũng được cấu hình để theo dõi các thay đổi trái phép đối với các tập tin quan trọng.

Mô-đun AI Agent được xây dựng dựa trên các mô hình Generative AI kết hợp với Prompt Engineering và cơ chế Retrieval-Augmented Generation. Kho tri thức nội bộ được sử dụng để cung cấp thêm thông tin ngữ cảnh cho AI nhằm nâng cao chất lượng phân tích và hạn chế hiện tượng Hallucination.

Ngoài các thành phần cốt lõi, hệ thống có thể được mở rộng bằng việc tích hợp pfSense Firewall và Suricata IDS/IPS nhằm tăng cường khả năng giám sát ở tầng mạng.

 

# **II. Project Organization**

## **2.1. Solution Process Model**

Đề tài được thực hiện theo hướng nghiên cứu ứng dụng kết hợp thực nghiệm nhằm xây dựng và đánh giá tính khả thi của một hệ thống giám sát an ninh mạng tích hợp giữa nền tảng SIEM, trí tuệ nhân tạo tạo sinh và cơ chế Human-in-the-Loop. Phương pháp tiếp cận này cho phép kết hợp giữa nghiên cứu lý thuyết và triển khai thực tế trong môi trường phòng thí nghiệm, từ đó đánh giá hiệu quả của giải pháp thông qua các kịch bản mô phỏng.

Quá trình thực hiện dự án được chia thành nhiều giai đoạn liên tiếp, trong đó kết quả của giai đoạn trước đóng vai trò là cơ sở cho việc triển khai các giai đoạn tiếp theo. Cách tiếp cận này giúp đảm bảo tính hệ thống, dễ kiểm soát tiến độ và thuận lợi trong việc đánh giá kết quả ở từng giai đoạn.

**Giai đoạn khảo sát và phân tích yêu cầu**

Đây là giai đoạn đầu tiên của dự án nhằm xác định mục tiêu nghiên cứu, phạm vi triển khai và các yêu cầu của hệ thống. Nhóm tiến hành khảo sát các công nghệ SIEM mã nguồn mở, nghiên cứu các hạn chế của hệ thống giám sát truyền thống cũng như tìm hiểu các hướng tiếp cận mới dựa trên trí tuệ nhân tạo và Human-in-the-Loop.

**Giai đoạn thiết kế kiến trúc hệ thống**

Sau khi hoàn thành việc phân tích yêu cầu, nhóm xây dựng kiến trúc tổng thể của hệ thống dựa trên nền tảng Wazuh. Các thành phần như Wazuh Agent, Wazuh Server, Wazuh Indexer, Dashboard, AI Agent và cơ chế Human-in-the-Loop được thiết kế nhằm đảm bảo khả năng mở rộng và dễ dàng tích hợp.

**Giai đoạn triển khai môi trường thực nghiệm**

Môi trường phòng thí nghiệm được xây dựng trên nền tảng ảo hóa với các máy chủ Ubuntu và các endpoint Windows/Linux. Trong giai đoạn này, hệ thống Wazuh được cài đặt và cấu hình để thực hiện việc thu thập dữ liệu từ các endpoint.

**Giai đoạn tích hợp AI Agent**

Sau khi hệ thống SIEM hoạt động ổn định, mô-đun AI Agent được tích hợp nhằm hỗ trợ phân tích cảnh báo. AI Agent thực hiện việc tóm tắt sự kiện, đánh giá mức độ nghiêm trọng và đề xuất phương án xử lý dựa trên dữ liệu đầu vào nhận được từ Wazuh.

**Giai đoạn xây dựng cơ chế Human-in-the-Loop**

Nhóm tiến hành thiết kế giao diện cho phép chuyên viên an ninh xem xét kết quả phân tích của AI trước khi thực thi phản ứng sự cố. Điều này giúp đảm bảo AI chỉ đóng vai trò hỗ trợ và con người vẫn giữ quyền quyết định cuối cùng.

**Giai đoạn phản ứng sự cố**

Các cơ chế phản ứng tự động được triển khai dựa trên Wazuh Active Response và các công cụ bổ trợ. Hệ thống có khả năng thực hiện các hành động như chặn địa chỉ IP, cô lập endpoint hoặc thu thập dữ liệu phục vụ điều tra số.

**Giai đoạn kiểm thử và đánh giá**

Cuối cùng, hệ thống được kiểm thử thông qua nhiều kịch bản mô phỏng nhằm đánh giá khả năng phát hiện, phân tích và phản ứng trước các sự cố an ninh mạng. Các chỉ số hiệu năng được thu thập và sử dụng làm cơ sở để đánh giá hiệu quả của giải pháp.

## **2.2. Roles and Responsibilities**

| Role | Responsibilities: |
| :---- | :---- |
| **Project Manager** | Project planning. Managing project progress. Coordinating work among team members. Monitoring and evaluating results. Compiling reports and preparing documentation. |
| **System Developer** | Deploying the laboratory environment. Installing and configuring Wazuh. Developing integration scripts and APIs. Building the Dashboard and Backend. Integrating system components. |
| **Security Analyst** | Analyzing logs and telemetry. Building detection rules. Designing attack simulation scenarios. Analyzing IOC and TTP. Evaluating the system's detection effectiveness. |
| **AI Engineer** | Building an AI Agent. Designing Prompt Engineering. Building a Knowledge Base. Integrating RAG mechanisms. Optimizing AI output quality. |
| **Tester** | Building Test Cases. Performing functional testing. Evaluating system performance. Analyzing experimental results. Proposing improvements. |

## **2.3. Tools and Techniques**

Trong quá trình nghiên cứu và triển khai hệ thống, nhóm sử dụng nhiều công cụ và kỹ thuật khác nhau nhằm đáp ứng các yêu cầu về giám sát, phân tích và phản ứng sự cố.

| Tools | Description |
| :---- | :---- |
| **Wazuh** | Wazuh is an open-source SIEM platform chosen as the central component of the system. Wazuh is capable of log collection, event analysis, file integrity monitoring, and supports proactive response mechanisms. |
| **Sysmon** | Sysmon is deployed on Windows endpoints to enhance telemetry data collection. This tool allows for detailed recording of created processes, network connections, and significant system changes. |
| **VMware Workstation**   | VMware Workstation is used to build a virtualized lab environment. The use of virtual machines allows for the simulation of system components without the need for complex physical infrastructure investment. |
| **Ubuntu Server**   | Ubuntu Server acts as the central server of the system, deploying the Wazuh Server, Indexer, and Dashboard components. |
| **Windows 10 và Linux Endpoint**   | Windows and Linux workstations are used to generate log and telemetry data for monitoring. |
| **Generative AI**   | An AI-generated model is used to support the analysis of security alerts. AI is capable of summarizing data, assessing severity, and suggesting appropriate solutions. |
| **Prompt Engineering**   | Prompt Engineering is used to optimize the quality of AI output, minimizing hallucinations and improving contextual understanding.   |
| **Retrieval-Augmented Generation (RAG)**   | RAG is integrated to provide additional context to the AI model by retrieving information from the internal knowledge base. This enhances the accuracy of the analysis and recommendations.   |
| **Human-in-the-Loop**   | Human-in-the-Loop is a mechanism that allows security professionals to directly participate in evaluating the results generated by the AI. This is a crucial control layer to limit erroneous decisions and increase system reliability.   |
| **Wazuh Active Response**   | Wazuh Active Response is used to automatically execute reactive actions such as blocking IP addresses, isolating endpoints, or collecting data for digital forensics.   |
| **pfSense và Suricata**   | These two components are used as extension modules to enhance network-level monitoring capabilities. pfSense acts as a firewall, while Suricata assists in intrusion detection and prevention. |

Trong quá trình nghiên cứu và triển khai, đề tài áp dụng nhiều kỹ thuật khác nhau, bao gồm:

* Thu thập và chuẩn hóa dữ liệu log.  
* Phân tích dựa trên rule-based detection.  
* Phân tích cảnh báo bằng trí tuệ nhân tạo tạo sinh.  
* Prompt Engineering.  
* Retrieval-Augmented Generation.  
* Human-in-the-Loop.  
* Tự động hóa phản ứng sự cố.  
* Mô phỏng tấn công và kiểm thử thực nghiệm.  
* Đánh giá hiệu năng thông qua các chỉ số MTTD và MTTR.

# **III. Tasks**

## **1.1. Task 1: Project Scope Definition and Requirements Analysis (xác định phạm vi và phân tích yêu cầu của dự án)**

**Description (mô tả)**

Nhiệm vụ đầu tiên của dự án là xác định phạm vi nghiên cứu, mục tiêu và các yêu cầu của hệ thống giám sát an ninh mạng tích hợp SIEM, AI Agent và Human-in-the-Loop. Nhóm tiến hành nghiên cứu các hạn chế của hệ thống SIEM truyền thống như phụ thuộc vào rule-based detection, số lượng cảnh báo lớn và khó khăn trong quá trình ưu tiên xử lý cảnh báo. Trên cơ sở đó, nhóm xây dựng định hướng nghiên cứu nhằm bổ sung lớp phân tích bằng AI Agent và cơ chế HITL để hỗ trợ quá trình ra quyết định. 

Trong giai đoạn này, nhóm thực hiện khảo sát các nền tảng SIEM mã nguồn mở như Wazuh, Elastic Security, Graylog và Security Onion trước khi lựa chọn Wazuh làm nền tảng triển khai chính của đề tài. Việc phân tích yêu cầu bao gồm các yêu cầu chức năng như thu thập log, phân tích cảnh báo, quản lý sự cố và phản ứng sự cố; đồng thời xác định các yêu cầu phi chức năng liên quan đến hiệu năng, tính bảo mật và khả năng mở rộng của hệ thống.  

**Deliverables (sản phẩm bàn giao)**

Sau khi hoàn thành nhiệm vụ, nhóm xây dựng bộ tài liệu mô tả phạm vi dự án (Project Scope Document), trong đó xác định rõ mục tiêu, phạm vi nghiên cứu và các giới hạn của hệ thống. Bên cạnh đó, nhóm hoàn thiện danh sách các yêu cầu chức năng và phi chức năng của hệ thống, xây dựng sơ đồ Use Case mô tả các chức năng chính và thiết kế kiến trúc hệ thống ban đầu. Những tài liệu này là cơ sở để định hướng thiết kế, triển khai và phát triển các thành phần của hệ thống trong các giai đoạn tiếp theo.

**Resources Needed (nguồn lực)**

Trong giai đoạn khảo sát và phân tích yêu cầu, nhóm sử dụng nguồn nhân lực của các thành viên để nghiên cứu, trao đổi và đánh giá các giải pháp phù hợp. Đồng thời, nhiều tài liệu tham khảo về SIEM, Wazuh, GenAI, Human-in-the-Loop (HITL), Kafka và các công nghệ liên quan được khai thác nhằm xây dựng cơ sở lý thuyết cho đề tài. Máy tính cá nhân cùng kết nối Internet cũng được sử dụng để nghiên cứu, thử nghiệm và thu thập các tài liệu chuyên môn cần thiết. 

**Dependencies and Constraints  (các phụ thuộc và ràng buộ)**

Đây là nhiệm vụ khởi đầu của dự án nên không phụ thuộc vào bất kỳ công việc nào trước đó. Tuy nhiên, quá trình thực hiện chịu ảnh hưởng bởi nhiều yếu tố như thời gian nghiên cứu có hạn, phạm vi triển khai chỉ giới hạn trong môi trường phòng thí nghiệm và khả năng tiếp cận các tài liệu chuyên sâu về SIEM, AI Agent và SOAR còn hạn chế. Những yếu tố này ảnh hưởng trực tiếp đến việc lựa chọn phạm vi và định hướng phát triển của đề tài. 

**Risks (rủi ro )**

Trong quá trình khảo sát và phân tích yêu cầu, nhóm có thể gặp rủi ro như hiểu chưa đầy đủ các yêu cầu của hệ thống hoặc lựa chọn phạm vi nghiên cứu chưa phù hợp. Ngoài ra, việc thiếu các tài liệu tham khảo có chất lượng hoặc phạm vi nghiên cứu quá rộng cũng có thể làm ảnh hưởng đến tiến độ thực hiện cũng như chất lượng của các giai đoạn triển khai sau này.  

## **1.2. Task 2:Lab Architecture and Environment Setup  (thiết lập cơ sở hạ tầng và môi trường phòng thí nghiệm)**

**Description (mô tả)**

Sau khi hoàn thành phân tích yêu cầu, nhóm tiến hành thiết kế và triển khai môi trường thực nghiệm. Kiến trúc hệ thống được xây dựng dựa trên mô hình Wazuh bao gồm Wazuh Agent, Wazuh Server, Wazuh Indexer và Wazuh Dashboard. Mô hình này cho phép tách biệt quá trình thu thập dữ liệu, xử lý cảnh báo, lưu trữ dữ liệu và hiển thị thông tin giám sát. 

Môi trường triển khai gồm máy chủ Ubuntu đóng vai trò Wazuh Server và Indexer, các endpoint Windows và Linux được cài đặt Wazuh Agent để thu thập dữ liệu. Nhóm đồng thời triển khai Sysmon trên Windows nhằm tăng khả năng thu thập telemetry phục vụ phân tích an ninh mạng. Toàn bộ các thành phần được kết nối thông qua mạng nội bộ phục vụ quá trình kiểm thử và mô phỏng các tình huống an ninh mạng. 

**Deliverables (sp bàn giao)**

Kết quả của nhiệm vụ là môi trường phòng thí nghiệm hoàn chỉnh phục vụ quá trình triển khai và kiểm thử hệ thống. Nhóm xây dựng sơ đồ kiến trúc mạng, triển khai và cấu hình thành công máy chủ Wazuh, các máy trạm Windows và Linux, đồng thời hoàn thiện tài liệu hướng dẫn cài đặt và cấu hình môi trường. Những thành phần này tạo nền tảng để triển khai các chức năng thu thập dữ liệu, phân tích cảnh báo và phản ứng sự cố ở các giai đoạn tiếp theo của dự án. 

**Resources Needed (nguồn lực)**

Để xây dựng môi trường thực nghiệm, nhóm sử dụng VMware Workstation nhằm tạo và quản lý các máy ảo. Máy chủ Ubuntu được triển khai để cài đặt Wazuh Server và Wazuh Indexer, trong khi các máy ảo Windows và Linux được sử dụng làm các endpoint phục vụ thu thập dữ liệu. Ngoài ra, bộ cài đặt Wazuh cùng mạng nội bộ và kết nối Internet được sử dụng để cài đặt, cấu hình và kiểm thử khả năng giao tiếp giữa các thành phần của hệ thống. 

**Dependencies and Constraints (phụ thuốc và hạn chế)**

Nhiệm vụ này được triển khai sau khi hoàn thành quá trình phân tích yêu cầu và xác định kiến trúc tổng thể của hệ thống. Trong quá trình xây dựng môi trường, nhóm phải đối mặt với các ràng buộc về tài nguyên phần cứng như dung lượng RAM, CPU và khả năng lưu trữ của máy tính. Đồng thời, việc đảm bảo tính tương thích giữa các thành phần như Wazuh Server, Agent và hệ điều hành cũng là yêu cầu quan trọng nhằm duy trì sự ổn định của toàn bộ hệ thống. 

**Risks**

Một số rủi ro có thể xảy ra trong quá trình triển khai bao gồm lỗi cấu hình môi trường, không tương thích giữa các phiên bản phần mềm hoặc mất kết nối giữa Wazuh Agent và Wazuh Server. Ngoài ra, việc phân bổ tài nguyên chưa hợp lý cho các máy ảo cũng có thể khiến hệ thống hoạt động không ổn định, ảnh hưởng đến quá trình kiểm thử và triển khai các nhiệm vụ tiếp theo. 

## **1.3. Task 3: Wazuh Telemetry Collection and Raw Alert Ingestion (Thu thập dữ liệu từ xa Wazuh và Nhập cảnh báo thô)**

**Description**

Ở giai đoạn này, nhóm tiến hành triển khai cơ chế thu thập dữ liệu giám sát từ các máy trạm và máy chủ chạy hệ điều hành Windows và Linux thông qua Wazuh Agent. Mỗi Agent được cấu hình để thu thập nhiều nguồn dữ liệu khác nhau, bao gồm nhật ký hệ thống (System Logs), nhật ký bảo mật (Security Logs), nhật ký ứng dụng (Application Logs), sự kiện xác thực người dùng, thông tin tiến trình đang thực thi và các dữ liệu telemetry quan trọng phục vụ công tác giám sát an toàn thông tin. Theo kiến trúc của Wazuh, Agent đóng vai trò là nguồn dữ liệu đầu vào của hệ thống SIEM, chịu trách nhiệm thu thập và truyền dữ liệu về Wazuh Server để phân tích tập trung.

Bên cạnh các nguồn log mặc định của hệ điều hành, nhóm tích hợp thêm Sysmon nhằm mở rộng khả năng ghi nhận các hành vi ở mức hệ thống như tạo và kết thúc tiến trình, tải thư viện động (DLL), thay đổi Registry, kết nối mạng, tạo tiến trình con, cũng như các sự kiện liên quan đến thực thi mã độc. Đồng thời, tính năng File Integrity Monitoring (FIM) của Wazuh cũng được kích hoạt để theo dõi các thay đổi đối với các tệp tin và thư mục quan trọng, bao gồm việc tạo mới, chỉnh sửa, đổi tên hoặc xóa tệp. Điều này giúp hệ thống phát hiện sớm các hành vi bất thường như mã độc chỉnh sửa tệp hệ thống hoặc thay đổi trái phép các tệp cấu hình.

Toàn bộ dữ liệu thu thập được sẽ được chuẩn hóa theo định dạng mà Wazuh Manager hỗ trợ, sau đó chuyển về máy chủ trung tâm để thực hiện quá trình giải mã (Decoding), đối chiếu với các quy tắc phát hiện (Rules Engine), sinh cảnh báo và lưu trữ trong kho dữ liệu nhật ký tập trung. Đây là nguồn dữ liệu đầu vào quan trọng cho các mô-đun quản lý cảnh báo, AI Agent và SOAR ở các giai đoạn tiếp theo của hệ thống.

### **Deliverables**

Kết quả của nhiệm vụ là hệ thống thu thập dữ liệu hoàn chỉnh từ các máy trạm Windows và Linux thông qua Wazuh Agent. Nhóm triển khai và cấu hình thành công Wazuh Agent, Sysmon và File Integrity Monitoring để phục vụ việc ghi nhận dữ liệu telemetry cũng như giám sát các thay đổi trên hệ thống. Bên cạnh đó, toàn bộ dữ liệu thu thập được được lưu trữ tập trung trên Wazuh Server và hình thành tập dữ liệu cảnh báo thô (Raw Alert Dataset), làm nguồn dữ liệu đầu vào cho các giai đoạn phân tích và xử lý cảnh báo tiếp theo. 

### **Tài nguyên sử dụng**

Để triển khai nhiệm vụ này, nhóm sử dụng Wazuh Agent làm thành phần thu thập log trên các endpoint, kết hợp với Sysmon nhằm mở rộng khả năng ghi nhận các hoạt động trên hệ điều hành Windows. Đối với Linux, các công cụ ghi log như Syslog hoặc Journald được sử dụng để thu thập nhật ký hệ thống. Ngoài ra, các nguồn log từ hệ điều hành, ứng dụng và bộ dữ liệu mô phỏng các sự kiện an ninh cũng được khai thác nhằm kiểm tra khả năng thu thập và xử lý dữ liệu của hệ thống. 

**Dependencies and Constraints**

Nhiệm vụ này được triển khai sau khi hạ tầng Wazuh và môi trường phòng thí nghiệm đã được cài đặt và cấu hình hoàn chỉnh. Trong quá trình vận hành, hệ thống phải xử lý khối lượng log lớn được sinh ra liên tục từ nhiều endpoint, do đó cần tối ưu dung lượng lưu trữ cũng như hiệu năng xử lý dữ liệu để đảm bảo khả năng giám sát gần thời gian thực. Đây là yêu cầu quan trọng nhằm duy trì tính ổn định của hệ thống trong quá trình thu thập và phân tích dữ liệu. 

**Risks**

Một số rủi ro có thể phát sinh bao gồm việc bỏ sót các nguồn dữ liệu quan trọng do cấu hình Agent chưa đầy đủ, thiết lập sai các quy tắc giám sát khiến hệ thống không phát hiện được hành vi bất thường hoặc sinh quá nhiều cảnh báo giả (False Positive). Ngoài ra, việc mất kết nối giữa Agent và Wazuh Server cũng có thể dẫn đến hiện tượng mất đồng bộ dữ liệu log, ảnh hưởng đến khả năng phân tích và điều tra sự cố. 

## **1.4. Task 4: Queue Management and Case Scheduling (Quản lý hàng đợi và lập kế hoạch cho Case)**

**Description**

Sau khi Wazuh hoàn thành quá trình phân tích và sinh cảnh báo, hệ thống chuyển sang giai đoạn chuẩn hóa dữ liệu và quản lý luồng xử lý cảnh báo. Mỗi cảnh báo được chuyển đổi thành một Case để phục vụ cho quá trình phân tích, điều tra và xử lý sự cố. Trong quá trình này, các thông tin như thời gian phát hiện, máy bị ảnh hưởng, quy tắc phát hiện, mức độ nghiêm trọng, nguồn dữ liệu và các chỉ số liên quan sẽ được chuẩn hóa trước khi lưu trữ.

Để xử lý hiệu quả số lượng lớn cảnh báo phát sinh trong môi trường thực tế, nhóm xây dựng mô-đun Queue Management nhằm đưa toàn bộ cảnh báo vào hàng đợi xử lý. Cơ chế này giúp tránh tình trạng mất dữ liệu, xử lý đồng thời nhiều cảnh báo và đảm bảo các sự kiện có mức độ ưu tiên cao luôn được xử lý trước. Đồng thời, hệ thống áp dụng các quy tắc phân loại ưu tiên dựa trên mức độ nghiêm trọng của cảnh báo (Severity), giá trị của tài sản bị ảnh hưởng (Asset Criticality), mức độ tin cậy của quy tắc phát hiện và các IOC liên quan.

Sau khi được phân loại, mỗi Case sẽ được lưu vào cơ sở dữ liệu để theo dõi toàn bộ vòng đời xử lý, từ thời điểm tạo Case, phân tích, đánh giá của AI Agent, xác nhận của quản trị viên cho đến khi đóng Case. Đây là lớp trung gian quan trọng giúp kết nối hệ thống SIEM với AI Agent và các thành phần SOAR phía sau.

**Deliverables**

Sau khi hoàn thành nhiệm vụ, nhóm xây dựng được mô-đun quản lý hàng đợi cảnh báo và mô-đun quản lý Case phục vụ quá trình xử lý sự cố. Đồng thời, hệ thống cũng được tích hợp các quy tắc phân loại mức độ ưu tiên và cơ sở dữ liệu lưu trữ thông tin của từng Case. Các thành phần này giúp quản lý toàn bộ vòng đời của cảnh báo và tạo nguồn dữ liệu đầu vào ổn định cho AI Agent trong các giai đoạn tiếp theo. 

**Resources Needed**

Để xây dựng mô-đun quản lý Case, nhóm sử dụng hệ quản trị cơ sở dữ liệu để lưu trữ thông tin cảnh báo và trạng thái xử lý. Backend Framework được sử dụng để phát triển các API phục vụ việc tiếp nhận, cập nhật và quản lý Case. Ngoài ra, mô-đun Queue Processing đảm nhiệm việc điều phối và xử lý các cảnh báo theo thứ tự ưu tiên nhằm đảm bảo hệ thống hoạt động ổn định. 

**Dependencies and Constraints**

Việc triển khai mô-đun quản lý hàng đợi chỉ được thực hiện sau khi hệ thống Wazuh đã hoàn thành quá trình thu thập dữ liệu và sinh cảnh báo. Hệ thống cần đáp ứng yêu cầu xử lý gần thời gian thực để hạn chế tình trạng tồn đọng cảnh báo và đảm bảo các Case có mức độ ưu tiên cao được xử lý nhanh chóng. Đây là yếu tố quan trọng nhằm nâng cao hiệu quả của toàn bộ hệ thống giám sát. 

**Risks**

Một số rủi ro có thể xảy ra là hiện tượng tắc nghẽn hàng đợi khi số lượng cảnh báo tăng đột biến hoặc nhiều cảnh báo giống nhau được sinh ra đồng thời. Ngoài ra, việc xây dựng chưa phù hợp các quy tắc phân loại mức độ ưu tiên cũng có thể dẫn đến đánh giá sai mức độ nghiêm trọng của sự cố, ảnh hưởng đến quá trình phân tích và xử lý sau này. 

## **1.5. Task 5: Local AI Agent Integration (Tích hợp AI Agent cục bộ)**

**Description**

Đây là nhiệm vụ trọng tâm của đề tài, tập trung vào việc xây dựng AI Agent hoạt động cục bộ nhằm hỗ trợ phân tích và diễn giải các cảnh báo do hệ thống SIEM sinh ra. AI Agent đóng vai trò là cầu nối giữa dữ liệu kỹ thuật phức tạp của Wazuh và người quản trị hệ thống, giúp giảm thời gian phân tích cũng như nâng cao hiệu quả xử lý sự cố.

Sau khi tiếp nhận dữ liệu từ hàng đợi cảnh báo, AI Agent sẽ kết hợp thông tin cảnh báo, log liên quan, metadata và dữ liệu từ kho tri thức nội bộ để thực hiện quá trình phân tích. Kết quả đầu ra bao gồm tóm tắt nội dung cảnh báo, xác định các IOC nổi bật, đánh giá mức độ ưu tiên, phân tích nguyên nhân có thể xảy ra và đề xuất các bước xử lý ban đầu theo quy trình ứng cứu sự cố.

Để hạn chế hiện tượng Hallucination của mô hình ngôn ngữ lớn, nhóm áp dụng Prompt Engineering kết hợp với Retrieval-Augmented Generation (RAG). Thay vì để AI suy luận hoàn toàn dựa trên kiến thức đã học, hệ thống sẽ truy xuất thông tin từ Knowledge Base nội bộ chứa các quy tắc phát hiện của Wazuh, IOC, MITRE ATT\&CK, Playbook phản ứng sự cố và các tài liệu kỹ thuật liên quan trước khi sinh kết quả. Việc triển khai AI cục bộ cũng giúp đảm bảo dữ liệu giám sát không phải gửi ra ngoài Internet, đáp ứng yêu cầu bảo mật của hệ thống.

**Deliverables**

Kết quả của nhiệm vụ là mô-đun AI Agent có khả năng tiếp nhận và phân tích các cảnh báo từ hệ thống SIEM. Đồng thời, nhóm xây dựng bộ Prompt Template, mô-đun RAG và Knowledge Base nhằm hỗ trợ AI truy xuất thông tin trước khi đưa ra kết quả phân tích. Hệ thống cũng tạo ra các báo cáo phân tích tự động bao gồm tóm tắt cảnh báo, IOC, mức độ ưu tiên và đề xuất hướng xử lý ban đầu. 

**Resources Needed**

Nhóm sử dụng mô hình ngôn ngữ cục bộ (Local LLM) để đảm bảo dữ liệu được xử lý trong môi trường nội bộ. Bên cạnh đó, Vector Database được triển khai để lưu trữ embedding phục vụ quá trình truy xuất thông tin, trong khi Knowledge Base chứa các quy tắc Wazuh, IOC, MITRE ATT\&CK và các Playbook phản ứng sự cố giúp nâng cao chất lượng phân tích của AI. 

**Dependencies and Constraints**

Nhiệm vụ này được thực hiện sau khi hoàn thành mô-đun quản lý hàng đợi và Case. Do giới hạn về tài nguyên phần cứng, đề tài không thực hiện Fine-tuning mô hình mà tập trung khai thác Prompt Engineering kết hợp với RAG nhằm nâng cao độ chính xác của kết quả phân tích. Đồng thời, toàn bộ quá trình xử lý được thực hiện cục bộ để đảm bảo an toàn cho dữ liệu giám sát. 

**Risks**

Trong quá trình vận hành, AI Agent có thể phát sinh hiện tượng Hallucination hoặc đưa ra nhận định chưa phù hợp nếu dữ liệu đầu vào hoặc kho tri thức chưa đầy đủ. Ngoài ra, việc xử lý lượng log lớn cũng có thể làm tăng thời gian phản hồi của AI, ảnh hưởng đến khả năng hỗ trợ phân tích trong các tình huống cần xử lý nhanh. 

## **1.6. Task 6: HITL Dashboard and Review Workflow (Bảng điều khiển HITL và quy trình đánh giá)**

**Description**

Sau khi AI Agent hoàn thành phân tích, hệ thống chuyển kết quả đến giao diện Human-in-the-Loop (HITL) để quản trị viên xem xét trước khi thực hiện phản ứng sự cố. Dashboard được thiết kế theo hướng trực quan, giúp hiển thị đồng thời cảnh báo gốc của Wazuh, dữ liệu log liên quan, mức độ nghiêm trọng, kết quả phân tích của AI và các khuyến nghị xử lý.

Quản trị viên có thể xác nhận, chỉnh sửa hoặc từ chối kết quả do AI đề xuất trước khi hệ thống chuyển sang bước phản ứng tự động. Đối với các hành động có mức độ ảnh hưởng lớn như cô lập máy trạm hoặc cập nhật luật tường lửa, hệ thống bắt buộc phải có sự phê duyệt của người quản trị nhằm giảm thiểu rủi ro do AI đưa ra quyết định sai.

Ngoài chức năng phê duyệt, Dashboard còn lưu lại toàn bộ phản hồi của người dùng để phục vụ việc cải thiện Prompt Template và cập nhật Knowledge Base trong các phiên bản tiếp theo của hệ thống.

**Deliverables**

Sau khi hoàn thành, nhóm xây dựng giao diện HITL Dashboard cho phép quản trị viên theo dõi và đánh giá kết quả phân tích của AI Agent. Hệ thống cũng cung cấp quy trình Review Workflow, giao diện phê duyệt và mô-đun thu thập phản hồi nhằm hỗ trợ cải thiện chất lượng phân tích của AI trong quá trình vận hành. 

**Resources Needed**

Quá trình phát triển Dashboard sử dụng Web Framework để xây dựng giao diện và Backend API để xử lý các yêu cầu từ người dùng. Đồng thời, hệ quản trị cơ sở dữ liệu được sử dụng để lưu trữ thông tin Case, kết quả phân tích và phản hồi của quản trị viên nhằm phục vụ quá trình theo dõi và đánh giá hệ thống. 

**Dependencies and Constraints**

Mô-đun HITL chỉ được triển khai sau khi AI Agent hoàn thành việc phân tích cảnh báo. Giao diện được thiết kế theo tiêu chí đơn giản, trực quan và dễ sử dụng để giúp quản trị viên nhanh chóng đánh giá kết quả của AI mà không làm ảnh hưởng đến tốc độ xử lý sự cố. 

**Risks**

Một số rủi ro có thể gặp phải là quy trình phê duyệt quá phức tạp làm kéo dài thời gian xử lý hoặc giao diện chưa đủ trực quan khiến người dùng khó theo dõi thông tin. Ngoài ra, nếu hệ thống không thu thập được đủ phản hồi từ người quản trị thì việc cải thiện Prompt và Knowledge Base trong các giai đoạn tiếp theo sẽ bị hạn chế. 

 

## **1.7. Task 7: Response Workflow and SOAR / Active Response (Quy trình phản ứng và SOAR/ Phản ứng sự cố)**

**Description**

Sau khi cảnh báo được quản trị viên xác nhận thông qua cơ chế HITL, hệ thống chuyển sang giai đoạn phản ứng sự cố bằng mô hình SOAR (Security Orchestration, Automation and Response). Mục tiêu của mô-đun này là tự động hóa các hành động ứng cứu nhằm giảm thời gian phản hồi và hạn chế tác động của sự cố an ninh mạng.

Hệ thống tích hợp Wazuh Active Response, PowerShell Remoting và API của pfSense để thực hiện các hành động như chặn địa chỉ IP độc hại, cô lập máy trạm bị tấn công, thu thập dữ liệu phục vụ điều tra số, cập nhật luật tường lửa hoặc thực thi các kịch bản phản ứng đã được xây dựng trước. Những hành động có nguy cơ ảnh hưởng lớn đến hệ thống đều yêu cầu xác nhận từ quản trị viên thông qua Dashboard HITL trước khi được thực thi nhằm đảm bảo tính an toàn và hạn chế các phản ứng sai.  

**Deliverables**

Kết quả của nhiệm vụ bao gồm quy trình SOAR phục vụ điều phối phản ứng sự cố, bộ Active Response Scripts để thực hiện các hành động tự động và mô-đun PowerShell Remoting hỗ trợ điều khiển từ xa các máy Windows. Những thành phần này giúp hệ thống có khả năng phản ứng nhanh đối với các sự kiện an ninh sau khi được quản trị viên phê duyệt. 

**Resources Needed**

Nhóm sử dụng Wazuh Active Response để tự động hóa các hành động phản ứng, PowerShell Remoting để điều khiển các máy Windows từ xa và pfSense API để cập nhật các quy tắc tường lửa. Ngoài ra, các Firewall Rules được cấu hình sẵn nhằm hỗ trợ quá trình ngăn chặn các kết nối hoặc địa chỉ IP độc hại khi có sự cố xảy ra. 

**Dependencies and Constraints**

Mô-đun phản ứng sự cố chỉ được kích hoạt sau khi cảnh báo đã được xác nhận thông qua Dashboard HITL. Toàn bộ quá trình triển khai được giới hạn trong môi trường phòng thí nghiệm và các hành động có mức độ ảnh hưởng lớn đều yêu cầu sự phê duyệt của quản trị viên trước khi thực hiện nhằm đảm bảo an toàn cho hệ thống. 

**Risks**

Rủi ro lớn nhất của giai đoạn này là hệ thống có thể thực hiện sai hành động phản ứng, chẳng hạn như chặn nhầm địa chỉ IP hợp lệ hoặc cô lập nhầm máy trạm đang hoạt động bình thường. Những sai sót này có thể làm gián đoạn hoạt động của hệ thống, do đó cơ chế HITL đóng vai trò quan trọng trong việc giảm thiểu các rủi ro trên. 

## **1.8 Task-8: Scenario Testing, Evaluation and Reporting**

**Description**

Đây là giai đoạn cuối cùng của dự án nhằm đánh giá toàn diện tính khả thi và hiệu quả của mô hình SIEM kết hợp GenAI, HITL và SOAR. Nhóm xây dựng nhiều kịch bản mô phỏng các sự kiện an ninh phổ biến như đăng nhập thất bại liên tiếp (Brute Force), thực thi tiến trình bất thường, thay đổi trái phép các tệp quan trọng, kết nối mạng đáng ngờ, truy cập trái phép và các hành vi thường gặp trong các cuộc tấn công mạng.

Trong quá trình kiểm thử, hệ thống sẽ thu thập các chỉ số đánh giá bao gồm khả năng phát hiện của Wazuh, độ chính xác của AI Agent trong phân tích và tóm tắt cảnh báo, hiệu quả của cơ chế HITL trong việc hỗ trợ ra quyết định, thời gian phản ứng của SOAR và mức độ giảm tải công việc cho quản trị viên. Các kết quả thu được sẽ được phân tích, so sánh với mục tiêu ban đầu của đề tài và tổng hợp thành báo cáo cuối cùng nhằm chứng minh hiệu quả của mô hình đề xuất.

**Deliverables**

Sau giai đoạn kiểm thử, nhóm hoàn thiện bộ Test Case, kết quả đánh giá, các chỉ số hiệu năng của hệ thống và báo cáo tổng kết đồ án. Ngoài ra, nhóm cũng chuẩn bị bộ slide trình bày nhằm phục vụ quá trình báo cáo và bảo vệ kết quả nghiên cứu trước hội đồng. 

**Resources Needed**

Quá trình đánh giá sử dụng các công cụ mô phỏng tấn công để tạo ra nhiều tình huống an ninh khác nhau, kết hợp với Monitoring Dashboard để theo dõi hoạt động của hệ thống và Evaluation Dataset để đánh giá độ chính xác của các thành phần như Wazuh, AI Agent, HITL và SOAR. 

**Dependencies and Constraints**

Nhiệm vụ này được triển khai sau khi toàn bộ hệ thống đã hoàn thành và hoạt động ổn định. Việc đánh giá chỉ được thực hiện trong môi trường phòng thí nghiệm nên kết quả phản ánh hiệu quả của hệ thống trong điều kiện mô phỏng, chưa thể bao quát đầy đủ các tình huống phát sinh trong môi trường thực tế. 

**Risks**

Trong quá trình đánh giá, các kịch bản mô phỏng có thể chưa phản ánh đầy đủ các hình thức tấn công thực tế hoặc dữ liệu kiểm thử chưa đủ đa dạng để đánh giá toàn diện hiệu quả của hệ thống. Ngoài ra, việc tổng hợp số liệu, phân tích kết quả và hoàn thiện báo cáo cũng có thể ảnh hưởng đến tiến độ chung của dự án nếu không được thực hiện theo đúng kế hoạch.  

# **IV. Task Sheet: Assignments and Timetable (nhiệm vụ và thời gian biểu)**

| Task | Assigned Members | Start Date | End Date | Status |
| :---- | :---- | :---- | :---- | :---- |
| Project Scope Definition and Requirements Analysis | All Members | 04/05/2026 | 11/05/2026 | Completed |
| Lab Architecture and Environment Setup | All Members | 11/05/2026 | 18/05/2026 | Completed |
| Wazuh Telemetry Collection and Raw Alert Ingestion | All Members | dd/mm/2026 | dd/mm/2026 | Pending |
| Queue Management and Case Scheduling | All Members | dd/mm/2026 | dd/mm/2026 | Pending |
| Local AI Agent Integration | All Members | dd/mm/2026 | dd/mm/2026 | Pending |
| HITL Dashboard and Review Workflow | All Members | dd/mm/2026 | dd/mm/2026 | Pending |
| Response Workflow and SOAR / Active Response | All Members | dd/mm/2026 | dd/mm/2026 | Pending |
| Scenario Testing, Evaluation and Reporting | All Members | dd/mm/2026 | dd/mm/2026 | Pending |

 

# **V. All Meeting Minutes**

**Meeting Minute 01**

| Item | Details |
| :---- | :---- |
| Date | 04/05/2026 |
| Participants | All members |
| Discussion | Thảo luận đề tài và phạm vi nghiên cứu |
| Decision | Lựa chọn kiến trúc Wazuh \+ GenAI \+ HITL |
| Assigned Tasks | Phân tích yêu cầu và chuẩn bị môi trường |

**Meeting Minute 02**

| Item | Details |
| :---- | :---- |
| Date | 07/05/2026 |
| Participants | All members |
| Discussion | Triển khai môi trường lab và cấu hình máy ảo |
| Decision | Sử dụng Windows/Linux Endpoint |
| Assigned Tasks | Cài đặt Wazuh Server và Wazuh Agent |

 

**Meeting Minute 03**

| Item | Details |
| :---- | :---- |
| Date | 20/05/2026 |
| Participants | All members |
| Discussion | Tích hợp AI Agent và cơ chế HITL |
| Decision | Sử dụng prompt engineering kết hợp knowledge base |
| Assigned Tasks | Phát triển AI module và giao diện quản trị |

 

