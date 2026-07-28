**RUNBOOK TÍCH HỢP HỆ THỐNG SOC \- LOCAL AI \- HITL**

**Wazuh → Kafka → n8n → Ollama → MongoDB → Streamlit**

Kỹ sư trưởng Week 5 / Điều phối viên tích hợp hệ thống

20/07/2026

Table of Contents

# **1 Thông tin kiểm soát tài liệu**

| Thuộc tính | Giá trị |
| :---- | :---- |
| Mã tài liệu | SOC-AI-RUNBOOK-W1-W5-V1.0 |
| Phiên bản | 1.0 |
| Môi trường | Lab LAN 192.168.1.0/24 |
| Phạm vi | Kết nối Week 1 đến Week 5; chưa triển khai SOAR/Active Response |
| Schema | 1.0 |
| Trạng thái hợp lệ | Suppressed, Queued\_AI, Processing\_AI, Waiting\_HITL, Failed, Approved, Rejected |
| Mức AI hợp lệ | Low, Medium, High |
| Điều kiện tiên quyết | Đã snapshot VM, đã sao lưu workflow/source/configuration |

***Nguyên tắc vận hành:** Thực hiện tuần tự. Sau mỗi checkpoint phải đối chiếu output dự kiến. Khi output khác dự kiến, dừng tại checkpoint đó, không tiếp tục sang phần sau.*

# **2 0\. Kiến trúc và quy ước bắt buộc**

## **2.1 0.1. Bản đồ dịch vụ**

Wazuh AIO \- 192.168.1.243  
/var/ossec/logs/alerts/alerts.json (NDJSON)  
        |  
        | Filebeat instance riêng: filebeat-soc-ai  
        v  
Kafka \- 192.168.1.246:9094  
Topic: soc-ai-logs  
        |  
        v  
n8n Workflow 1  
Normalize \-\> Dedup \-\> Threshold D4 \-\> MongoDB Insert  
        |  
        v  
MongoDB \- 192.168.1.247:27017  
Database: soc\_ai  
Collection: cases  
        |  
        v  
n8n Workflow 2  
Atomic Claim \-\> Ollama \-\> Parse/Validate \-\> MongoDB Update  
        |  
        v  
Ollama \- 192.168.1.242:11434  
Model: qwen2.5:3b  
        |  
        v  
MongoDB status \= Waiting\_HITL  
        |  
        v  
Streamlit \- 192.168.1.247:8501  
Approve / Reject \-\> audit\_trail

## **2.2 0.2. Schema Version 1.0**

**{**  
  "schema\_version"**:** "1.0"**,**  
  "case\_id"**:** "CASE-YYYYMMDD-\<12\_HEX\>"**,**  
  "dedup\_hash"**:** "\<64\_HEX\_SHA256\>"**,**  
  "status"**:** "Suppressed | Queued\_AI | Processing\_AI | Waiting\_HITL | Failed | Approved | Rejected"**,**  
  "received\_at"**:** "UTC ISO-8601 string"**,**  
  "updated\_at"**:** "UTC ISO-8601 string"**,**  
  "retry\_count"**:** 0**,**  
  "last\_error"**:** **null,**  
  "raw\_alert"**:** **{},**  
  "indicators"**:** **{**  
    "src\_ip"**:** **null,**  
    "destination\_ip"**:** **null,**  
    "hostname"**:** **null,**  
    "username"**:** **null,**  
    "rule\_id"**:** **null,**  
    "event\_type"**:** **null,**  
    "file"**:** **null,**  
    "process"**:** **null**  
  **},**  
  "ai\_result"**:** **{**  
    "summary"**:** **null,**  
    "severity"**:** **null,**  
    "recommendation"**:** **null,**  
    "confidence"**:** **null**  
  **},**  
  "hitl"**:** **{**  
    "decision"**:** **null,**  
    "edited\_recommendation"**:** **null,**  
    "feedback"**:** **null,**  
    "reviewer"**:** **null,**  
    "reviewed\_at"**:** **null**  
  **},**  
  "audit\_trail"**:** \[\]  
**}**

## **2.3 0.3. Quy tắc không được vi phạm**

• Không tạo dữ liệu AI tại root: summary, severity, recommendation.

• Không tạo trạng thái mới Open, Pending\_Threshold, Processing, AI\_Done.

• Không sử dụng trường fingerprint; trường chính thức là dedup\_hash.

• Không để AI sinh indicators; Workflow 1 trích xuất indicators từ Wazuh JSON.

• Không dùng tài khoản MongoDB root cho n8n hoặc Dashboard.

• Không chạy docker compose down \-v, docker volume prune, docker system prune \--volumes.

• Không kéo lại image latest hoặc recreate Ollama/n8n trong vòng tích hợp.

• Không bật Active Response trong Runbook này.

• Không khởi động service Streamlit cũ trong Docker Compose của MongoDB.

# **3 PHẦN 1 \- DỌN XUNG ĐỘT HẠ TẦNG VÀ KHỞI TẠO DATABASE**

## **3.1 1.1. Mục tiêu**

1\. Loại bỏ service Docker streamlit cũ khỏi Compose trên VM 192.168.1.247.

2\. Chứng minh port 8501 không còn bị Docker giữ.

3\. Khởi động lại riêng MongoDB, không khởi động toàn bộ stack cũ.

4\. Tạo hoặc xác nhận các index phục vụ dedup, FIFO, Dashboard và Threshold D4.

## **3.2 1.2. Sao lưu Compose trước khi chỉnh**

Đăng nhập VM MongoDB \+ Web 192.168.1.247:

**sudo** \-i  
cd /root/soc-ai-laptop2

STAMP**\=**"$(**date** \+%Y%m%d-%H%M%S)"  
**cp** \-a docker-compose.yml "docker-compose.yml.pre-runbook-${STAMP}"  
**chmod** 600 "docker-compose.yml.pre-runbook-${STAMP}"

**ls** \-l docker-compose.yml "docker-compose.yml.pre-runbook-${STAMP}"  
docker compose config \--services

**Output dự kiến trước khi chỉnh:**

mongodb  
streamlit

## **3.3 1.3. Dừng và loại bỏ container Streamlit cũ**

Thực hiện trước khi comment service trong YAML:

docker compose stop streamlit 2**\>**/dev/null **||** **true**  
docker compose rm \-f streamlit 2**\>**/dev/null **||** **true**  
docker rm \-f streamlit 2**\>**/dev/null **||** **true**

docker ps \-a \--format 'table {{.Names}}\\t{{.Status}}\\t{{.Ports}}' **|** **grep** \-i streamlit **||** **true**

**Output thành công:** không còn container tên streamlit. Lệnh grep không trả dòng nào.

## **3.4 1.4. Tạm dừng Streamlit native để kiểm tra port tuyệt đối**

Thực hiện bằng user sở hữu \~/soc-ai-dashboard, không chạy bằng root nếu project thuộc user thường:

screen \-ls  
screen \-S soc-dashboard \-X stuff $'\\003' 2**\>**/dev/null **||** **true**  
**sleep** 3  
ss \-ltnp **|** **grep** ':8501' **||** echo 'PORT\_8501\_FREE'

**Output bắt buộc tại thời điểm kiểm tra:**

PORT\_8501\_FREE

Nếu vẫn có listener, xác định process:

**sudo** ss \-ltnp **|** **grep** ':8501'  
**sudo** lsof \-nP \-iTCP:8501 \-sTCP:LISTEN

Không tiếp tục cho đến khi xác định process đó không phải container Streamlit cũ.

## **3.5 1.5. Comment toàn bộ service streamlit trong Compose**

Mở file:

**sudo** \-i  
cd /root/soc-ai-laptop2  
**nano** docker-compose.yml

Giữ service MongoDB và comment hoặc xóa toàn bộ block streamlit:. Ví dụ:

**services:**  
  **mongodb:**  
    **image:** mongo:8  
    **container\_name:** mongodb  
    **restart:** unless-stopped  
    **ports:**  
      **\-** "27017:27017"  
    **volumes:**  
      **\-** mongo\_data:/data/db

  *\# streamlit:*  
  *\#   build: ...*  
  *\#   container\_name: streamlit*  
  *\#   ports:*  
  *\#     \- "8501:8501"*  
  *\#   ...*

**volumes:**  
  **mongo\_data:**

Sau khi lưu:

docker compose config \--quiet  
docker compose config \--services

**Output bắt buộc:**

mongodb

Không được còn dòng streamlit.

## **3.6 1.6. Reconcile Compose và khởi động riêng MongoDB**

cd /root/soc-ai-laptop2

docker compose up \-d \--no-deps mongodb  
docker compose ps mongodb

docker ps \--format 'table {{.Names}}\\t{{.Image}}\\t{{.Status}}\\t{{.Ports}}'

**Output dự kiến:**

mongodb   mongo:8   Up ...   0.0.0.0:27017-\>27017/tcp

Không chạy lệnh không chỉ rõ service:

docker compose up \-d

## **3.7 1.7. Khởi động lại Dashboard native bằng screen**

Đăng nhập bằng user sở hữu project:

cd \~/soc-ai-dashboard

screen \-S soc-dashboard \-X quit 2**\>**/dev/null **||** **true**  
screen \-dmS soc-dashboard bash \-lc 'cd \~/soc-ai-dashboard && source venv/bin/activate && exec streamlit run app.py'

**sleep** 5  
screen \-ls  
ss \-ltnp **|** **grep** ':8501'  
curl \-I \--max-time 10 http://127.0.0.1:8501

**Output dự kiến:**

\<PID\>.soc-dashboard (Detached)  
LISTEN ... 0.0.0.0:8501 ... python/streamlit  
HTTP/1.1 200 OK

Kiểm tra không có Docker container giữ port:

docker ps \--format '{{.Names}} {{.Ports}}' **|** **grep** '8501' **||** echo 'NO\_DOCKER\_8501\_BINDING'

**Output bắt buộc:**

NO\_DOCKER\_8501\_BINDING

## **3.8 1.8. Kết nối mongosh bằng application user**

Không ghi mật khẩu vào lịch sử shell:

docker exec \-it mongodb mongosh \\  
  \--host 127.0.0.1 \\  
  \--port 27017 \\  
  \--username soc\_ai\_app \\  
  \--authenticationDatabase soc\_ai \\  
  \--password

Nhập mật khẩu khi được hỏi. Trong mongosh:

use soc\_ai

db**.runCommand**({ ping**:** 1 })  
db**.**cases**.countDocuments**({})

**Output dự kiến:**

{ ok**:** 1 }  
0

Số document có thể lớn hơn 0 sau khi đã bắt đầu kiểm thử; trước test đầu tiên, giá trị mong muốn là 0.

## **3.9 1.9. Tạo hoặc xác nhận index**

Chạy trong mongosh:

db**.**cases**.createIndex**(  
  { dedup\_hash**:** 1 }**,**  
  {  
    name**:** "dedup\_hash\_1"**,**  
    unique**:** **true**  
  }  
)

db**.**cases**.createIndex**(  
  { case\_id**:** 1 }**,**  
  {  
    name**:** "case\_id\_1"**,**  
    unique**:** **true**  
  }  
)

db**.**cases**.createIndex**(  
  { status**:** 1**,** received\_at**:** **\-**1 }**,**  
  {  
    name**:** "status\_1\_received\_at\_-1"  
  }  
)

db**.**cases**.createIndex**(  
  { status**:** 1 }**,**  
  {  
    name**:** "status\_1"  
  }  
)

db**.**cases**.createIndex**(  
  { received\_at**:** **\-**1 }**,**  
  {  
    name**:** "received\_at\_-1"  
  }  
)

db**.**cases**.createIndex**(  
  {  
    "indicators.src\_ip"**:** 1**,**  
    "indicators.rule\_id"**:** 1**,**  
    received\_at**:** **\-**1  
  }**,**  
  {  
    name**:** "idx\_threshold\_src\_rule\_time"  
  }  
)

Các lệnh là idempotent nếu index cùng tên và cùng option đã tồn tại.

## **3.10 1.10. Kiểm tra index**

db**.**cases**.getIndexes**()

Hoặc output gọn:

db**.**cases**.getIndexes**()**.forEach**(**function**(index) {  
  **printjson**({  
    name**:** index**.**name**,**  
    key**:** index**.**key**,**  
    unique**:** index**.**unique **\===** **true**  
  })  
})

**Output bắt buộc phải chứa:**

case\_id\_1                    unique: true  
dedup\_hash\_1                 unique: true  
status\_1\_received\_at\_-1  
status\_1  
received\_at\_-1  
idx\_threshold\_src\_rule\_time

Thoát:

exit

## **3.11 1.11. Checkpoint PHẦN 1**

nc \-vz \-w 5 192.168.1.247 27017  
curl \-I \--max-time 10 http://192.168.1.247:8501

**PASS khi:**

• MongoDB container Up.

• Không có container Streamlit cũ.

• Port 8501 do Streamlit native giữ.

• MongoDB application user đăng nhập được.

• Các index đúng tên và option.

# **4 PHẦN 2 \- PRODUCER RIÊNG WAZUH → KAFKA**

## **4.1 2.1. Thiết kế**

Dùng binary Filebeat đã cài cùng Wazuh nhưng chạy thành instance thứ hai, độc lập hoàn toàn:

Filebeat mặc định của Wazuh  
  config: /etc/filebeat/filebeat.yml  
  data:   /var/lib/filebeat  
  output: Wazuh Indexer

Filebeat SOC-AI mới  
  config: /etc/filebeat/filebeat-soc-ai.yml  
  data:   /var/lib/filebeat-soc-ai  
  registry: /var/lib/filebeat-soc-ai/registry  
  logs:   /var/log/filebeat-soc-ai  
  output: 192.168.1.246:9094 / soc-ai-logs

Không chỉnh Filebeat mặc định.

## **4.2 2.2. Precheck trên Wazuh VM 192.168.1.243**

**sudo** \-i

/usr/share/filebeat/bin/filebeat version  
**stat** /var/ossec/logs/alerts/alerts.json  
nc \-vz \-w 5 192.168.1.246 9094

**Output dự kiến:**

filebeat version 7.x.x ...  
Access: (0640/-rw-r-----) Uid: wazuh Gid: wazuh  
Connection to 192.168.1.246 9094 ... succeeded\!

## **4.3 2.3. Tạo thư mục riêng**

**sudo** \-i

**install** \-d \-o root \-g root \-m 0750 /var/lib/filebeat-soc-ai  
**install** \-d \-o root \-g root \-m 0750 /var/log/filebeat-soc-ai

## **4.4 2.4. Tạo /etc/filebeat/filebeat-soc-ai.yml**

**cat** **\>** /etc/filebeat/filebeat-soc-ai.yml **\<\<'YAML'**  
\# Dedicated SOC-AI Filebeat instance.  
\# DO NOT merge with /etc/filebeat/filebeat.yml.

path.home: /usr/share/filebeat  
path.config: /etc/filebeat  
path.data: /var/lib/filebeat-soc-ai  
path.logs: /var/log/filebeat-soc-ai

filebeat.registry.path: /var/lib/filebeat-soc-ai/registry  
filebeat.registry.file\_permissions: 0600  
filebeat.registry.flush: 1s

filebeat.config.modules:  
  enabled: false

filebeat.inputs:  
  \- type: log  
    enabled: true  
    paths:  
      \- /var/ossec/logs/alerts/alerts.json

    \# Bootstrap only: start at EOF to avoid replaying the historical file.  
    \# After the first successful new alert, change this to false.  
    tail\_files: true

    scan\_frequency: 1s  
    backoff: 1s  
    max\_backoff: 10s  
    close\_inactive: 5m  
    close\_removed: true  
    clean\_removed: true  
    ignore\_older: 72h  
    clean\_inactive: 96h

    fields:  
      transport\_source: wazuh-alerts-json  
      producer\_instance: filebeat-soc-ai  
    fields\_under\_root: true

processors:  
  \- decode\_json\_fields:  
      fields: \["message"\]  
      process\_array: false  
      max\_depth: 10  
      target: ""  
      overwrite\_keys: true  
      add\_error\_key: true

  \- drop\_fields:  
      fields:  
        \- message  
        \- ecs  
        \- host  
        \- input  
        \- log  
      ignore\_missing: true

  \- add\_fields:  
      target: ""  
      fields:  
        pipeline\_source: wazuh-filebeat-soc-ai

setup.template.enabled: false  
setup.ilm.enabled: false

output.kafka:  
  enabled: true  
  hosts:  
    \- 192.168.1.246:9094  
  topic: soc-ai-logs  
  client\_id: filebeat-soc-ai-wazuh-243  
  version: "2.6.0"

  partition.round\_robin:  
    reachable\_only: true

  required\_acks: 1  
  compression: gzip  
  max\_message\_bytes: 1000000  
  timeout: 30s  
  broker\_timeout: 10s

  codec.json:  
    pretty: false  
    escape\_html: false

logging.level: info  
logging.to\_syslog: false  
logging.to\_files: true  
logging.files:  
  path: /var/log/filebeat-soc-ai  
  name: filebeat-soc-ai  
  keepfiles: 7  
  permissions: 0640

logging.metrics.enabled: true  
logging.metrics.period: 30s  
**YAML**

**chown** root:root /etc/filebeat/filebeat-soc-ai.yml  
**chmod** 0600 /etc/filebeat/filebeat-soc-ai.yml

## **4.5 2.5. Test cú pháp và output Kafka**

/usr/share/filebeat/bin/filebeat test config \\  
  \-c /etc/filebeat/filebeat-soc-ai.yml \\  
  \--path.home /usr/share/filebeat \\  
  \--path.config /etc/filebeat \\  
  \--path.data /var/lib/filebeat-soc-ai \\  
  \--path.logs /var/log/filebeat-soc-ai

**Output bắt buộc:**

Config OK

Kiểm tra Kafka:

/usr/share/filebeat/bin/filebeat test output \\  
  \-c /etc/filebeat/filebeat-soc-ai.yml \\  
  \--path.home /usr/share/filebeat \\  
  \--path.config /etc/filebeat \\  
  \--path.data /var/lib/filebeat-soc-ai \\  
  \--path.logs /var/log/filebeat-soc-ai

**Output dự kiến chứa:**

kafka: 192.168.1.246:9094...  
  connection...  
    dial up... OK

## **4.6 2.6. Tạo systemd service /lib/systemd/system/filebeat-soc-ai.service**

**cat** **\>** /lib/systemd/system/filebeat-soc-ai.service **\<\<'UNIT'**  
\[Unit\]  
Description=Filebeat SOC-AI dedicated Wazuh to Kafka producer  
Documentation=https://www.elastic.co/guide/en/beats/filebeat/current/index.html  
Wants=network-online.target  
After=network-online.target

\[Service\]  
Type=simple  
User=root  
Group=root  
UMask=0027

ExecStartPre=/usr/share/filebeat/bin/filebeat test config \-c /etc/filebeat/filebeat-soc-ai.yml \--path.home /usr/share/filebeat \--path.config /etc/filebeat \--path.data /var/lib/filebeat-soc-ai \--path.logs /var/log/filebeat-soc-ai  
ExecStart=/usr/share/filebeat/bin/filebeat \-c /etc/filebeat/filebeat-soc-ai.yml \--path.home /usr/share/filebeat \--path.config /etc/filebeat \--path.data /var/lib/filebeat-soc-ai \--path.logs /var/log/filebeat-soc-ai

Restart=on-failure  
RestartSec=5s  
TimeoutStopSec=30s  
LimitNOFILE=65536

\[Install\]  
WantedBy=multi-user.target  
**UNIT**

**chown** root:root /lib/systemd/system/filebeat-soc-ai.service  
**chmod** 0644 /lib/systemd/system/filebeat-soc-ai.service

systemctl daemon-reload  
systemctl enable filebeat-soc-ai.service  
systemctl start filebeat-soc-ai.service

## **4.7 2.7. Kiểm tra service**

systemctl status filebeat-soc-ai.service \--no-pager  
systemctl is-active filebeat-soc-ai.service  
journalctl \-u filebeat-soc-ai.service \-n 100 \--no-pager  
**ls** \-lah /var/lib/filebeat-soc-ai/  
**ls** \-lah /var/log/filebeat-soc-ai/

**Output bắt buộc:**

Active: active (running)  
active

Trong log không được có các lỗi:

permission denied  
connection refused  
client has run out of available brokers  
Failed to publish events  
Exiting: error loading config file

Log theo thời gian thực:

journalctl \-u filebeat-soc-ai.service \-f

Hoặc:

**tail** \-F /var/log/filebeat-soc-ai/filebeat-soc-ai*\**

## **4.8 2.8. Mở console consumer trên Queue VM trước khi tạo alert**

Trên Queue VM 192.168.1.246:

**sudo** \-i  
cd /root/soc-ai-queue

docker exec kafka kafka-topics \\  
  \--bootstrap-server kafka:9092 \\  
  \--describe \\  
  \--topic soc-ai-logs

**Output dự kiến:**

PartitionCount: 1  
ReplicationFactor: 1  
Leader: 1  
Isr: 1

Mở consumer chờ đúng message mới:

**rm** \-f /tmp/soc-ai-kafka-one.json

**timeout** 90 docker exec kafka kafka-console-consumer \\  
  \--bootstrap-server kafka:9092 \\  
  \--topic soc-ai-logs \\  
  \--consumer-property auto.offset.reset=latest \\  
  \--max-messages 1 \\  
  \--timeout-ms 85000 \\  
  **\>** /tmp/soc-ai-kafka-one.json

Giữ terminal này chờ. Sau đó tạo một FIM event ở PHẦN 5 hoặc sửa một file đang được Wazuh giám sát.

## **4.9 2.9. Xác minh nested Wazuh JSON trong Kafka**

Sau khi consumer nhận một message:

**wc** \-c /tmp/soc-ai-kafka-one.json  
python3 \-m json.tool /tmp/soc-ai-kafka-one.json **|** **sed** \-n '1,160p'

Kiểm tra cấu trúc bằng Python:

python3 \- /tmp/soc-ai-kafka-one.json **\<\<'PY'**  
import json  
import sys

path \= sys.argv\[1\]  
with open(path, encoding="utf-8") as fh:  
    event \= json.load(fh)

assert isinstance(event, dict), "Kafka payload is not a JSON object"  
assert isinstance(event.get("rule"), dict), "Missing nested rule object"  
assert isinstance(event.get("agent"), dict), "Missing nested agent object"  
assert event\["rule"\].get("id") is not None, "Missing rule.id"  
assert event\["rule"\].get("level") is not None, "Missing rule.level"  
assert event\["agent"\].get("id") is not None, "Missing agent.id"  
assert event.get("timestamp") is not None, "Missing timestamp"

print("KAFKA\_WAZUH\_NESTED\_JSON\_OK")  
print("rule.id=", event\["rule"\].get("id"))  
print("rule.level=", event\["rule"\].get("level"))  
print("agent.id=", event\["agent"\].get("id"))  
print("agent.name=", event\["agent"\].get("name"))  
**PY**

**Output bắt buộc:**

KAFKA\_WAZUH\_NESTED\_JSON\_OK

## **4.10 2.10. Chuyển tail\_files sang chế độ vận hành lâu dài**

tail\_files: true chỉ dùng lần đầu để tránh gửi toàn bộ file cũ. Sau khi registry đã tạo và một alert mới đã được gửi thành công, chỉnh:

**sudo** sed \-i 's/^\[\[:space:\]\]\*tail\_files: true/    tail\_files: false/' \\  
  /etc/filebeat/filebeat-soc-ai.yml

**grep** \-n 'tail\_files' /etc/filebeat/filebeat-soc-ai.yml

/usr/share/filebeat/bin/filebeat test config \\  
  \-c /etc/filebeat/filebeat-soc-ai.yml \\  
  \--path.home /usr/share/filebeat \\  
  \--path.config /etc/filebeat \\  
  \--path.data /var/lib/filebeat-soc-ai \\  
  \--path.logs /var/log/filebeat-soc-ai

systemctl restart filebeat-soc-ai.service  
systemctl is-active filebeat-soc-ai.service

**Output bắt buộc:**

tail\_files: false  
Config OK  
active

Không xóa registry sau bước này. Xóa registry sẽ làm thay đổi offset và có thể replay dữ liệu.

## **4.11 2.11. Checkpoint PHẦN 2**

**PASS khi:**

• Filebeat mặc định vẫn active.

• filebeat-soc-ai cũng active.

• Registry riêng tồn tại dưới /var/lib/filebeat-soc-ai.

• Log riêng tồn tại dưới /var/log/filebeat-soc-ai.

• Kafka nhận được một Wazuh JSON nested thật.

• tail\_files đã đổi về false sau bootstrap.

# **5 PHẦN 3 \- WORKFLOW 1: NORMALIZE, DEDUP VÀ THRESHOLD D4**

## **5.1 3.1. Layout mục tiêu**

Kafka Trigger  
  \-\> Normalize Wazuh Alert (Code)  
  \-\> Find Existing Dedup (MongoDB Find)  
  \-\> Duplicate? (IF)  
       TRUE  \-\> Duplicate Skipped  
       FALSE \-\> Has src\_ip? (IF)  
                  TRUE  \-\> Count Previous 60s (MongoDB Aggregate)  
                         \-\> Decide D4 With SrcIP (Code)  
                  FALSE \-\> Decide D4 Without SrcIP (Code)  
              \-\> Insert Case (MongoDB Insert)  
              \-\> Handle Insert Error / E11000

Khuyến nghị đặt Kafka Trigger xử lý một message mỗi execution nếu node có option Batch Size/Max Messages.

## **5.2 3.2. Kafka Trigger**

Cấu hình logic:

Broker: kafka:9092  
Topic: soc-ai-logs  
Group ID: soc-ai-ingest-v1  
Client ID: n8n-workflow1-ingest  
From Beginning: false

Sau khi cấu hình, chưa Publish Workflow. Test thủ công bằng một payload đã capture từ /tmp/soc-ai-kafka-one.json.

## **5.3 3.3. Code node Normalize Wazuh Alert**

Mode:

Run Once for All Items

Code:

**function** **parseMaybeJson**(value) {  
  **if** (value **\===** **null** **||** value **\===** **undefined**) **return** **null;**  
  **if** (**typeof** value **\===** 'object') **return** value**;**

  **const** text **\=** String(value)**.trim**()**;**  
  **if** (**\!**text) **return** **null;**

  **try** {  
    **return** JSON**.parse**(text)**;**  
  } **catch** {  
    **return** **null;**  
  }  
}

**function** **looksLikeWazuhAlert**(value) {  
  **return** Boolean(  
    value **&&**  
    **typeof** value **\===** 'object' **&&**  
    (  
      value**.**rule **||**  
      value**.**agent **||**  
      value**.**full\_log **||**  
      value**.**syscheck **||**  
      value**.**timestamp  
    )  
  )**;**  
}

**function** **unwrapKafkaPayload**(wrapper) {  
  **const** candidates **\=** \[  
    wrapper**?.**value**,**  
    wrapper**?.**message**,**  
    wrapper**?.**payload**,**  
    wrapper**?.**data**,**  
    wrapper**?.**body**,**  
    wrapper**,**  
  \]**;**

  **for** (**const** candidate **of** candidates) {  
    **const** parsed **\=** **parseMaybeJson**(candidate)**;**  
    **if** (**\!**parsed) **continue;**

    **if** (**looksLikeWazuhAlert**(parsed)) **return** parsed**;**  
    **if** (**looksLikeWazuhAlert**(parsed**.**json)) **return** parsed**.**json**;**

    **const** nestedMessage **\=** **parseMaybeJson**(parsed**.**message)**;**  
    **if** (**looksLikeWazuhAlert**(nestedMessage)) **return** nestedMessage**;**  
  }

  **throw** **new** Error('Unable to locate native Wazuh JSON in Kafka Trigger output')**;**  
}

**function** **firstNonEmpty**(**...**values) {  
  **for** (**const** value **of** values) {  
    **if** (value **\===** **null** **||** value **\===** **undefined**) **continue;**  
    **if** (**typeof** value **\===** 'string' **&&** value**.trim**() **\===** '') **continue;**  
    **return** value**;**  
  }  
  **return** **null;**  
}

**function** **stableObject**(value) {  
  **if** (Array**.isArray**(value)) {  
    **return** value**.map**(stableObject)**;**  
  }

  **if** (value **&&** **typeof** value **\===** 'object') {  
    **return** Object**.keys**(value)  
      **.sort**()  
      **.reduce**((accumulator**,** key) **\=\>** {  
        accumulator\[key\] **\=** **stableObject**(value\[key\])**;**  
        **return** accumulator**;**  
      }**,** {})**;**  
  }

  **return** value**;**  
}

**function** **stableStringify**(value) {  
  **return** JSON**.stringify**(**stableObject**(value))**;**  
}

**async** **function** **sha256Hex**(text) {  
  **if** (**\!**globalThis**.**crypto**?.**subtle) {  
    **throw** **new** Error(  
      'Web Crypto API is unavailable in this n8n Code node. Use the n8n Crypto node with SHA-256 instead.'  
    )**;**  
  }

  **const** data **\=** **new** **TextEncoder**()**.encode**(text)**;**  
  **const** digest **\=** **await** globalThis**.**crypto**.**subtle**.digest**('SHA-256'**,** data)**;**

  **return** Array**.from**(**new** Uint8Array(digest))  
    **.map**((byte) **\=\>** byte**.toString**(16)**.padStart**(2**,** '0'))  
    **.join**('')**;**  
}

**function** **utcDateForCaseId**(isoString) {  
  **const** date **\=** **new** Date(isoString)**;**  
  **if** (Number**.isNaN**(date**.getTime**())) {  
    **return** **new** Date()**.toISOString**()**.slice**(0**,** 10)**.replaceAll**('-'**,** '')**;**  
  }  
  **return** date**.toISOString**()**.slice**(0**,** 10)**.replaceAll**('-'**,** '')**;**  
}

**const** output **\=** \[\]**;**  
**const** items **\=** $input**.all**()**;**

**for** (**let** index **\=** 0**;** index **\<** items**.**length**;** index **\+=** 1) {  
  **const** raw **\=** **unwrapKafkaPayload**(items\[index\]**.**json)**;**  
  **const** receivedAt **\=** **new** Date()**.toISOString**()**;**

  **const** ruleId **\=** **firstNonEmpty**(raw**.**rule**?.**id**,** raw**.**rule\_id)**;**  
  **const** ruleLevelValue **\=** **firstNonEmpty**(raw**.**rule**?.**level**,** raw**.**rule\_level**,** 0)**;**  
  **const** ruleLevel **\=** Number**.parseInt**(ruleLevelValue**,** 10) **||** 0**;**

  **const** srcIp **\=** **firstNonEmpty**(  
    raw**.**data**?.**srcip**,**  
    raw**.**data**?.**src\_ip**,**  
    raw**.**data**?.**win**?.**eventdata**?.**sourceIp**,**  
    raw**.**data**?.**win**?.**eventdata**?.**srcIp**,**  
    raw**.**srcip  
  )**;**

  **const** destinationIp **\=** **firstNonEmpty**(  
    raw**.**data**?.**dstip**,**  
    raw**.**data**?.**destination\_ip**,**  
    raw**.**data**?.**win**?.**eventdata**?.**destinationIp**,**  
    raw**.**data**?.**win**?.**eventdata**?.**dstIp**,**  
    raw**.**dstip  
  )**;**

  **const** username **\=** **firstNonEmpty**(  
    raw**.**data**?.**srcuser**,**  
    raw**.**data**?.**user**,**  
    raw**.**data**?.**dstuser**,**  
    raw**.**data**?.**win**?.**eventdata**?.**user**,**  
    raw**.**data**?.**win**?.**eventdata**?.**targetUserName**,**  
    raw**.**data**?.**win**?.**eventdata**?.**subjectUserName  
  )**;**

  **const** processName **\=** **firstNonEmpty**(  
    raw**.**data**?.**process\_name**,**  
    raw**.**data**?.**process**,**  
    raw**.**data**?.**win**?.**eventdata**?.**image**,**  
    raw**.**data**?.**win**?.**eventdata**?.**processName**,**  
    raw**.**data**?.**command  
  )**;**

  **const** filePath **\=** **firstNonEmpty**(  
    raw**.**syscheck**?.**path**,**  
    raw**.**data**?.**path**,**  
    raw**.**data**?.**file**,**  
    raw**.**data**?.**win**?.**eventdata**?.**targetFilename  
  )**;**

  **const** eventType **\=** **firstNonEmpty**(  
    raw**.**decoder**?.**name**,**  
    raw**.**data**?.**win**?.**system**?.**eventID**,**  
    raw**.**data**?.**win**?.**system**?.**eventId**,**  
    raw**.**rule**?.**groups**?.**\[0\]**,**  
    raw**.**location  
  )**;**

  **const** wazuhEventId **\=** **firstNonEmpty**(  
    raw**.**id**,**  
    raw**.**event\_id**,**  
    raw**.**data**?.**id  
  )**;**

  **const** fallbackParts **\=** \[  
    raw**.**timestamp**,**  
    raw**.**agent**?.**id**,**  
    ruleId**,**  
    raw**.**location**,**  
    raw**.**full\_log**,**  
  \]**.map**((value) **\=\>** value **??** '')**;**

  **let** dedupSource**;**

  **if** (wazuhEventId) {  
    dedupSource **\=** \`wazuh-id:**${**String(wazuhEventId)**}**\`**;**  
  } **else** {  
    **const** nonEmptyFallbackCount **\=** fallbackParts**.filter**(  
      (value) **\=\>** String(value)**.trim**() **\!==** ''  
    )**.**length**;**

    dedupSource **\=** nonEmptyFallbackCount **\>=** 3  
      **?** \`fallback:**${**fallbackParts**.join**('|')**}**\`  
      **:** \`raw:**${stableStringify**(raw)**}**\`**;**  
  }

  **const** dedupHash **\=** **await** **sha256Hex**(dedupSource)**;**  
  **const** caseDate **\=** **utcDateForCaseId**(receivedAt)**;**  
  **const** caseId **\=** \`CASE-**${**caseDate**}**\-**${**dedupHash**.slice**(0**,** 12)**.toUpperCase**()**}**\`**;**

  **const** normalizedDocument **\=** {  
    schema\_version**:** '1.0'**,**  
    case\_id**:** caseId**,**  
    dedup\_hash**:** dedupHash**,**  
    received\_at**:** receivedAt**,**  
    updated\_at**:** receivedAt**,**  
    retry\_count**:** 0**,**  
    last\_error**:** **null,**

    raw\_alert**:** raw**,**

    indicators**:** {  
      src\_ip**:** srcIp **?** String(srcIp) **:** **null,**  
      destination\_ip**:** destinationIp **?** String(destinationIp) **:** **null,**  
      hostname**:** **firstNonEmpty**(raw**.**agent**?.**name**,** raw**.**hostname)**,**  
      username**:** username **?** String(username) **:** **null,**  
      rule\_id**:** ruleId **\!==** **null** **?** String(ruleId) **:** **null,**  
      event\_type**:** eventType **\!==** **null** **?** String(eventType) **:** **null,**  
      file**:** filePath **\!==** **null** **?** String(filePath) **:** **null,**  
      process**:** processName **\!==** **null** **?** String(processName) **:** **null,**  
    }**,**

    ai\_result**:** {  
      summary**:** **null,**  
      severity**:** **null,**  
      recommendation**:** **null,**  
      confidence**:** **null,**  
    }**,**

    hitl**:** {  
      decision**:** **null,**  
      edited\_recommendation**:** **null,**  
      feedback**:** **null,**  
      reviewer**:** **null,**  
      reviewed\_at**:** **null,**  
    }**,**

    audit\_trail**:** \[\]**,**

    \_workflow**:** {  
      rule\_level**:** ruleLevel**,**  
      threshold\_window\_start**:** **new** Date(Date**.now**() **\-** 60\_000)**.toISOString**()**,**  
      dedup\_source**:** dedupSource**,**  
    }**,**  
  }**;**

  **if** (**\!**/**^\[a-f0-9\]{64}$**/**.test**(normalizedDocument**.**dedup\_hash)) {  
    **throw** **new** Error('Invalid dedup\_hash generated')**;**  
  }

  **if** (**\!**/**^**CASE-**\\d{8}**\-**\[A-F0-9\]{12}$**/**.test**(normalizedDocument**.**case\_id)) {  
    **throw** **new** Error('Invalid case\_id generated')**;**  
  }

  output**.push**({  
    json**:** normalizedDocument**,**  
    pairedItem**:** { item**:** index }**,**  
  })**;**  
}

**return** output**;**

### **5.3.1 Trường hợp Web Crypto không khả dụng**

Không sửa Docker ngay. Dùng n8n **Crypto node**:

Operation: Hash  
Type: SHA256  
Value: {{$json.\_workflow.dedup\_source}}  
Output Field: dedup\_hash

Sau đó dùng một Code node ngắn để tạo case\_id từ dedup\_hash.

## **5.4 3.4. Verification ngay sau Normalize**

Output phải có:

schema\_version \= 1.0  
case\_id \= CASE-YYYYMMDD-XXXXXXXXXXXX  
dedup\_hash length \= 64  
raw\_alert.rule \= object  
raw\_alert.agent \= object  
indicators.rule\_id \!= null  
\_workflow.rule\_level \= number

Không tiếp tục nếu raw\_alert chỉ chứa wrapper Kafka mà không có rule/agent.

## **5.5 3.5. Dedup precheck**

MongoDB node Find Existing Dedup:

Credential: MongoDB soc\_ai\_app  
Operation: Find  
Collection: cases  
Query:  
{  
  "dedup\_hash": "={{ $json.dedup\_hash }}"  
}  
Limit: 1  
Always Output Data: ON

IF node Duplicate?:

Value 1: {{$json.case\_id}}  
Operator: is not empty

• TRUE: kết thúc qua node Duplicate Skipped.

• FALSE: đi vào D4.

Không dùng $input.all().length để xác định duplicate vì MongoDB Find có thể trả empty item {}.

## **5.6 3.6. Branch Has src\_ip?**

IF node:

Value 1: {{$json.indicators.src\_ip}}  
Operator: is not empty

### **5.6.1 Nhánh TRUE \- Count Previous 60s**

MongoDB Aggregate pipeline. Có thể dùng field Expression trả object/array:

**\=**{{ \[  
  {  
    $match**:** {  
      'indicators.src\_ip'**:** $json**.**indicators**.**src\_ip**,**  
      'indicators.rule\_id'**:** $json**.**indicators**.**rule\_id**,**  
      received\_at**:** {  
        $gte**:** $json**.**\_workflow**.**threshold\_window\_start**,**  
        $lt**:** $json**.**received\_at  
      }  
    }  
  }**,**  
  {  
    $count**:** 'previous\_count'  
  }  
\] }}

Cấu hình:

Collection: cases  
Operation: Aggregate  
Always Output Data: ON

### **5.6.2 Code node Decide D4 With SrcIP**

**const** base **\=** **$**('Normalize Wazuh Alert')**.first**()**.**json**;**  
**const** previousCount **\=** Number($json**.**previous\_count **??** 0)**;**  
**const** totalInWindow **\=** previousCount **\+** 1**;**  
**const** status **\=** totalInWindow **\>** 5 **?** 'Queued\_AI' **:** 'Suppressed'**;**  
**const** now **\=** **new** Date()**.toISOString**()**;**

**return** \[{  
  json**:** {  
    **...**base**,**  
    status**,**  
    updated\_at**:** now**,**  
    audit\_trail**:** \[  
      {  
        action**:** 'INGESTED\_THRESHOLD\_D4'**,**  
        from\_status**:** **null,**  
        to\_status**:** status**,**  
        actor**:** 'n8n-workflow-1'**,**  
        at**:** now**,**  
        details**:** {  
          policy**:** 'D4'**,**  
          src\_ip**:** base**.**indicators**.**src\_ip**,**  
          rule\_id**:** base**.**indicators**.**rule\_id**,**  
          window\_seconds**:** 60**,**  
          previous\_count**:** previousCount**,**  
          total\_including\_current**:** totalInWindow**,**  
          condition**:** 'total \> 5'  
        }  
      }  
    \]**,**  
    \_workflow**:** {  
      **...**base**.**\_workflow**,**  
      previous\_count**:** previousCount**,**  
      total\_in\_window**:** totalInWindow  
    }  
  }  
}\]**;**

**Quy tắc chính xác:**

Alert 1-5 trong cửa sổ: Suppressed  
Alert thứ 6 trở đi trong cùng cửa sổ: Queued\_AI

*D4 hiện tạo một case cho mỗi alert. Từ alert thứ 6 trở đi, nhiều alert có thể cùng vào AI. Đây chưa phải cơ chế gộp nhiều alert thành một incident duy nhất.*

### **5.6.3 Nhánh FALSE \- Code node Decide D4 Without SrcIP**

**const** base **\=** $json**;**  
**const** ruleLevel **\=** Number(base**.**\_workflow**?.**rule\_level **??** 0)**;**  
**const** status **\=** ruleLevel **\>=** 7 **?** 'Queued\_AI' **:** 'Suppressed'**;**  
**const** now **\=** **new** Date()**.toISOString**()**;**

**return** \[{  
  json**:** {  
    **...**base**,**  
    status**,**  
    updated\_at**:** now**,**  
    audit\_trail**:** \[  
      {  
        action**:** 'INGESTED\_THRESHOLD\_D4'**,**  
        from\_status**:** **null,**  
        to\_status**:** status**,**  
        actor**:** 'n8n-workflow-1'**,**  
        at**:** now**,**  
        details**:** {  
          policy**:** 'D4'**,**  
          src\_ip**:** **null,**  
          rule\_id**:** base**.**indicators**.**rule\_id**,**  
          rule\_level**:** ruleLevel**,**  
          decision**:** ruleLevel **\>=** 7  
            **?** 'NO\_SRC\_IP\_AND\_LEVEL\_GTE\_7'  
            **:** 'NO\_SRC\_IP\_AND\_LEVEL\_LT\_7'  
        }  
      }  
    \]  
  }  
}\]**;**

Điểm bắt buộc: nhánh này không chạy Aggregate với src\_ip \= null.

## **5.7 3.7. MongoDB Insert Case**

Merge hai nhánh D4 vào cùng node Insert.

Operation: Insert  
Collection: cases  
Fields:  
schema\_version,case\_id,dedup\_hash,status,received\_at,updated\_at,retry\_count,last\_error,raw\_alert,indicators,ai\_result,hitl,audit\_trail

Không insert field tạm \_workflow.

Node Settings:

On Error: Continue (using error output)

Tên hiển thị có thể là Continue On Fail ở bản node cũ. Mục tiêu là lỗi Insert đi ra error branch thay vì dừng toàn workflow.

## **5.8 3.8. Xử lý E11000**

Nối error output của Insert Case vào Code node Handle Insert Error:

**const** item **\=** $json**;**  
**const** errorText **\=** \[  
  item**.**error**?.**message**,**  
  item**.**error**?.**description**,**  
  item**.**message**,**  
  item**.**description**,**  
  item**.**cause**?.**message**,**  
  JSON**.stringify**(item)**,**  
\]  
  **.filter**(Boolean)  
  **.join**(' | ')**;**

**if** (/E11000/i**.test**(errorText) **&&** /dedup\_hash**|**case\_id/i**.test**(errorText)) {  
  **return** \[{  
    json**:** {  
      outcome**:** 'Duplicate Skipped'**,**  
      duplicate\_skipped**:** **true,**  
      error**:** errorText**.slice**(0**,** 1000)**,**  
    }  
  }\]**;**  
}

**throw** **new** Error(\`MongoDB insert failed: **${**errorText**.slice**(0**,** 1500)**}**\`)**;**

**Output thành công cho duplicate:**

**{**  
  "outcome"**:** "Duplicate Skipped"**,**  
  "duplicate\_skipped"**:** **true**  
**}**

E11000 là lớp bảo vệ cuối nếu hai execution cùng vượt qua precheck.

## **5.9 3.9. Kiểm tra document sau Workflow 1**

Trong mongosh:

use soc\_ai

db**.**cases**.find**(  
  {}**,**  
  {  
    \_id**:** 0**,**  
    case\_id**:** 1**,**  
    dedup\_hash**:** 1**,**  
    status**:** 1**,**  
    received\_at**:** 1**,**  
    updated\_at**:** 1**,**  
    retry\_count**:** 1**,**  
    last\_error**:** 1**,**  
    indicators**:** 1**,**  
    "raw\_alert.rule"**:** 1**,**  
    "raw\_alert.agent"**:** 1**,**  
    ai\_result**:** 1**,**  
    hitl**:** 1**,**  
    audit\_trail**:** 1  
  }  
)**.sort**({ received\_at**:** **\-**1 })**.limit**(3)**.pretty**()

**Output bắt buộc:**

• status chỉ là Suppressed hoặc Queued\_AI.

• Không có Open, Pending\_Threshold.

• Không có root summary, severity, recommendation.

• dedup\_hash đủ 64 ký tự.

• case\_id chứa 12 ký tự đầu của hash.

## **5.10 3.10. Checkpoint PHẦN 3**

Publish Workflow 1 chỉ sau khi:

• Một message Kafka thật được Normalize đúng.

• Dedup precheck hoạt động.

• E11000 được route thành Duplicate Skipped.

• FIM không có src\_ip không bị Aggregate theo null.

• Status cuối cùng chỉ là Suppressed hoặc Queued\_AI.

# **6 PHẦN 4 \- WORKFLOW 2: ATOMIC CLAIM, OLLAMA VÀ RETRY**

## **6.1 4.1. Layout mục tiêu**

Schedule Trigger (10s)  
  \-\> Prepare Claim Metadata  
  \-\> Atomic Claim Case (MongoDB Find And Update)  
  \-\> Claimed? (IF)  
       FALSE \-\> No Operation  
       TRUE  \-\> Build Ollama Request  
             \-\> HTTP Request Ollama  
                 success \-\> Parse and Validate AI JSON  
                          \-\> Update Waiting\_HITL  
                 error   \-\> Prepare Retry  
                          \-\> Update Queued\_AI or Failed

Không giữ chuỗi cũ Check Processing \-\> Find \-\> Update Key. Atomic claim tự giải quyết tranh chấp.

## **6.2 4.2. Prepare Claim Metadata**

Code node:

**const** now **\=** **new** Date()**.toISOString**()**;**

**return** \[{  
  json**:** {  
    claim\_now**:** now**,**  
    claim\_filter**:** {  
      status**:** 'Queued\_AI'  
    }**,**  
    claim\_sort**:** {  
      received\_at**:** 1**,**  
      \_id**:** 1  
    }**,**  
    claim\_update**:** {  
      $set**:** {  
        status**:** 'Processing\_AI'**,**  
        updated\_at**:** now  
      }**,**  
      $push**:** {  
        audit\_trail**:** {  
          action**:** 'AI\_CLAIMED'**,**  
          from\_status**:** 'Queued\_AI'**,**  
          to\_status**:** 'Processing\_AI'**,**  
          actor**:** 'n8n-workflow-2'**,**  
          at**:** now  
        }  
      }  
    }  
  }  
}\]**;**

## **6.3 4.3. Atomic Claim Case \- phương án ưu tiên**

Dùng MongoDB node operation **Find And Update** nếu node hiện tại có operation này.

Cấu hình logic:

Credential: soc\_ai\_app  
Collection: cases  
Operation: Find And Update  
Query:  \={{ $json.claim\_filter }}  
Sort:   \={{ $json.claim\_sort }}  
Update: \={{ $json.claim\_update }}  
Upsert: false  
Return: Updated document / Return New Document \= true  
Limit: 1

Raw MongoDB command mà node phải biểu diễn:

db**.runCommand**({  
  findAndModify**:** "cases"**,**  
  query**:** {  
    status**:** "Queued\_AI"  
  }**,**  
  sort**:** {  
    received\_at**:** 1**,**  
    \_id**:** 1  
  }**,**  
  update**:** {  
    $set**:** {  
      status**:** "Processing\_AI"**,**  
      updated\_at**:** "\<UTC\_NOW\>"  
    }**,**  
    $push**:** {  
      audit\_trail**:** {  
        action**:** "AI\_CLAIMED"**,**  
        from\_status**:** "Queued\_AI"**,**  
        to\_status**:** "Processing\_AI"**,**  
        actor**:** "n8n-workflow-2"**,**  
        at**:** "\<UTC\_NOW\>"  
      }  
    }  
  }**,**  
  **new:** **true,**  
  upsert**:** **false**  
})

sort có thêm \_id để thứ tự ổn định khi hai case có cùng received\_at.

### **6.3.1 Output thành công**

Node trả đúng một document:

**{**  
  "case\_id"**:** "CASE-..."**,**  
  "status"**:** "Processing\_AI"**,**  
  "raw\_alert"**:** **{},**  
  "retry\_count"**:** 0  
**}**

Nếu không còn Queued\_AI, output phải rỗng hoặc value: null; đi vào No Operation.

## **6.4 4.4. Fallback Compare-and-Set**

Chỉ dùng nếu MongoDB node không có Find And Update nhưng cho phép query nhiều điều kiện trong Update:

1\. Find oldest Queued\_AI, sort received\_at: 1, \_id: 1, limit 1\.

2\. Update với filter đồng thời:

**{**  
  "case\_id"**:** "={{ $json.case\_id }}"**,**  
  "status"**:** "Queued\_AI"  
**}**

3\. Set Processing\_AI.

4\. Chỉ gọi Ollama khi matchedCount \= 1 hoặc modifiedCount \= 1.

Nếu node chỉ hỗ trợ một Update Key và không hỗ trợ filter case\_id \+ status, fallback này không đủ an toàn. Dừng và dùng operation Find And Update; không quay lại pattern update chỉ theo case\_id.

## **6.5 4.5. IF Claimed?**

Nếu output node có wrapper value, dùng:

Value 1: {{$json.value.case\_id}}  
Operator: is not empty

Nếu trả document trực tiếp:

Value 1: {{$json.case\_id}}  
Operator: is not empty

## **6.6 4.6. Build Ollama Request**

Code node:

**const** claimed **\=** $json**.**value **??** $json**;**

**if** (**\!**claimed**.**case\_id **||** claimed**.**status **\!==** 'Processing\_AI') {  
  **throw** **new** Error('Atomic claim did not return a valid Processing\_AI case')**;**  
}

**const** prompt **\=** \[  
  'Bạn là kỹ sư phân tích SOC.'**,**  
  'Phân tích cảnh báo Wazuh bên dưới.'**,**  
  'Chỉ trả về một JSON object, không Markdown, không giải thích ngoài JSON.'**,**  
  'Schema bắt buộc:'**,**  
  '{"summary":"string","severity":"Low|Medium|High","recommendation":"string"}'**,**  
  'summary: một câu tiếng Việt ngắn gọn.'**,**  
  'recommendation: một câu hành động khắc phục ngắn gọn.'**,**  
  'Wazuh alert JSON:'**,**  
  JSON**.stringify**(claimed**.**raw\_alert)**,**  
\]**.join**('**\\n**')**;**

**return** \[{  
  json**:** {  
    **...**claimed**,**  
    ollama\_request**:** {  
      model**:** 'qwen2.5:3b'**,**  
      prompt**,**  
      format**:** 'json'**,**  
      stream**:** **false**  
    }  
  }  
}\]**;**

## **6.7 4.7. HTTP Request node Ollama**

Method: POST  
URL: http://192.168.1.242:11434/api/generate  
Authentication: None  
Send Headers: Yes  
Content-Type: application/json  
Send Body: Yes  
Body Content Type: JSON  
Specify Body: Using JSON  
JSON Body: \={{ $json.ollama\_request }}  
Response Format: JSON  
Timeout: 180000 ms  
Retry On Fail: OFF

Không bật built-in retry của HTTP node vì business retry được đếm bằng retry\_count; nếu bật cả hai sẽ khó xác định số lần gọi model.

**Response dự kiến:**

**{**  
  "model"**:** "qwen2.5:3b"**,**  
  "response"**:** "{\\"summary\\":\\"...\\",\\"severity\\":\\"High\\",\\"recommendation\\":\\"...\\"}"**,**  
  "done"**:** **true,**  
  "done\_reason"**:** "stop"  
**}**

## **6.8 4.8. Parse và validate AI JSON**

Code node Parse and Validate AI JSON:

**const** outer **\=** $json**;**  
**const** claimedNode **\=** **$**('Build Ollama Request')**.first**()**.**json**;**

**if** (outer**.**done **\!==** **true**) {  
  **throw** **new** Error(\`Ollama did not complete: done=**${**outer**.**done**}**\`)**;**  
}

**let** responseText **\=** String(outer**.**response **??** '')**.trim**()**;**

*// Defensive cleanup if the model unexpectedly emits Markdown fences.*  
responseText **\=** responseText  
  **.replace**(/**^**\`\`\`**(?**:json**)?\\s\***/i**,** '')  
  **.replace**(/**\\s\***\`\`\`**$**/i**,** '')  
  **.trim**()**;**

**if** (**\!**responseText) {  
  **throw** **new** Error('Ollama response field is empty after trim()')**;**  
}

**let** parsed**;**  
**try** {  
  parsed **\=** JSON**.parse**(responseText)**;**  
} **catch** (error) {  
  **throw** **new** Error(  
    \`Malformed AI JSON: **${**error**.**message**}**; response=**${**responseText**.slice**(0**,** 800)**}**\`  
  )**;**  
}

**for** (**const** field **of** \['summary'**,** 'severity'**,** 'recommendation'\]) {  
  **if** (**typeof** parsed\[field\] **\!==** 'string' **||** parsed\[field\]**.trim**() **\===** '') {  
    **throw** **new** Error(\`AI field **${**field**}** is missing or not a non-empty string\`)**;**  
  }  
}

**const** severity **\=** parsed**.**severity**.trim**()**;**  
**if** (**\!**\['Low'**,** 'Medium'**,** 'High'\]**.includes**(severity)) {  
  **throw** **new** Error(\`Invalid AI severity: **${**severity**}**\`)**;**  
}

**const** now **\=** **new** Date()**.toISOString**()**;**

**return** \[{  
  json**:** {  
    case\_id**:** claimedNode**.**case\_id**,**  
    update\_filter**:** {  
      case\_id**:** claimedNode**.**case\_id**,**  
      status**:** 'Processing\_AI'  
    }**,**  
    update\_document**:** {  
      $set**:** {  
        status**:** 'Waiting\_HITL'**,**  
        updated\_at**:** now**,**  
        last\_error**:** **null,**  
        'ai\_result.summary'**:** parsed**.**summary**.trim**()**,**  
        'ai\_result.severity'**:** severity**,**  
        'ai\_result.recommendation'**:** parsed**.**recommendation**.trim**()**,**  
        'ai\_result.confidence'**:** **null**  
      }**,**  
      $push**:** {  
        audit\_trail**:** {  
          action**:** 'AI\_ANALYSIS\_COMPLETED'**,**  
          from\_status**:** 'Processing\_AI'**,**  
          to\_status**:** 'Waiting\_HITL'**,**  
          actor**:** 'n8n-workflow-2'**,**  
          at**:** now**,**  
          details**:** {  
            model**:** outer**.**model **??** 'qwen2.5:3b'**,**  
            done\_reason**:** outer**.**done\_reason **??** **null**  
          }  
        }  
      }  
    }  
  }  
}\]**;**

Node Settings:

On Error: Continue (using error output)

Error output nối sang Prepare Retry.

## **6.9 4.9. Update Waiting\_HITL**

MongoDB node Update Waiting\_HITL dùng operation Find And Update:

Collection: cases  
Query:  \={{ $json.update\_filter }}  
Update: \={{ $json.update\_document }}  
Upsert: false  
Return New Document: true

Filter có cả case\_id và status: Processing\_AI, ngăn update một case đã bị luồng khác thay đổi.

**Output bắt buộc:**

status \= Waiting\_HITL  
ai\_result.summary \= non-empty  
ai\_result.severity \= Low|Medium|High  
ai\_result.recommendation \= non-empty

## **6.10 4.10. Prepare Retry**

Nối hai error output sau vào cùng Code node:

• HTTP Request Ollama.

• Parse and Validate AI JSON.

Code:

**const** claimed **\=** **$**('Build Ollama Request')**.first**()**.**json**;**  
**const** currentRetry **\=** Number(claimed**.**retry\_count **??** 0)**;**  
**const** nextRetry **\=** currentRetry **\+** 1**;**  
**const** nextStatus **\=** nextRetry **\>=** 3 **?** 'Failed' **:** 'Queued\_AI'**;**  
**const** now **\=** **new** Date()**.toISOString**()**;**

**const** errorText **\=** \[  
  $json**.**error**?.**message**,**  
  $json**.**error**?.**description**,**  
  $json**.**message**,**  
  $json**.**description**,**  
  $json**.**cause**?.**message**,**  
  JSON**.stringify**($json)**,**  
\]  
  **.filter**(Boolean)  
  **.join**(' | ')  
  **.slice**(0**,** 1500)**;**

**return** \[{  
  json**:** {  
    case\_id**:** claimed**.**case\_id**,**  
    next\_retry\_count**:** nextRetry**,**  
    next\_status**:** nextStatus**,**  
    update\_filter**:** {  
      case\_id**:** claimed**.**case\_id**,**  
      status**:** 'Processing\_AI'  
    }**,**  
    update\_document**:** {  
      $set**:** {  
        status**:** nextStatus**,**  
        updated\_at**:** now**,**  
        retry\_count**:** nextRetry**,**  
        last\_error**:** errorText **||** 'Unknown Ollama/JSON error'  
      }**,**  
      $push**:** {  
        audit\_trail**:** {  
          action**:** nextStatus **\===** 'Failed'  
            **?** 'AI\_ANALYSIS\_FAILED\_FINAL'  
            **:** 'AI\_ANALYSIS\_REQUEUED'**,**  
          from\_status**:** 'Processing\_AI'**,**  
          to\_status**:** nextStatus**,**  
          actor**:** 'n8n-workflow-2'**,**  
          at**:** now**,**  
          details**:** {  
            retry\_count**:** nextRetry**,**  
            max\_retries**:** 3**,**  
            error**:** errorText **||** 'Unknown error'  
          }  
        }  
      }  
    }  
  }  
}\]**;**

Quy tắc:

retry\_count 1 \-\> Queued\_AI  
retry\_count 2 \-\> Queued\_AI  
retry\_count 3 \-\> Failed

## **6.11 4.11. Retry Update Case**

MongoDB Find And Update:

Collection: cases  
Query:  \={{ $json.update\_filter }}  
Update: \={{ $json.update\_document }}  
Upsert: false  
Return New Document: true

Không update nếu document không còn Processing\_AI.

## **6.12 4.12. Kiểm tra không có case kẹt**

Trong mongosh:

db**.**cases**.find**(  
  { status**:** "Processing\_AI" }**,**  
  {  
    \_id**:** 0**,**  
    case\_id**:** 1**,**  
    status**:** 1**,**  
    updated\_at**:** 1**,**  
    retry\_count**:** 1**,**  
    last\_error**:** 1  
  }  
)**.sort**({ updated\_at**:** 1 })**.pretty**()

Kiểm tra case Processing\_AI quá 5 phút:

**const** cutoff **\=** **new** Date(Date**.now**() **\-** 5 **\*** 60 **\*** 1000)**.toISOString**()

db**.**cases**.find**(  
  {  
    status**:** "Processing\_AI"**,**  
    updated\_at**:** { $lt**:** cutoff }  
  }  
)**.pretty**()

**Output mong muốn:** không có document.

## **6.13 4.13. Checkpoint PHẦN 4**

Publish Workflow 2 chỉ sau khi:

• Atomic claim trả tối đa một case mỗi execution.

• Status đổi Queued\_AI \-\> Processing\_AI trước khi HTTP call.

• HTTP timeout là 180000 ms.

• Response được .trim() và JSON.parse().

• Success ghi vào ai\_result.\* và Waiting\_HITL.

• Error tăng retry\_count, ghi last\_error.

• Retry thứ ba chuyển Failed.

# **7 PHẦN 5 \- KIỂM THỬ END-TO-END VÀ HITL**

## **7.1 5.1. Thứ tự bật hệ thống**

1\. MongoDB và Dashboard hoạt động.

2\. Kafka và n8n hoạt động.

3\. filebeat-soc-ai hoạt động.

4\. Publish Workflow 1\.

5\. Chưa Publish Workflow 2\.

6\. Tạo một FIM event và kiểm tra document sau Workflow 1\.

7\. Publish Workflow 2\.

8\. Tạo event đủ điều kiện Queued\_AI.

9\. Theo dõi Processing\_AI \-\> Waiting\_HITL.

10\. Thử Approve và Reject trên Dashboard.

## **7.2 5.2. Tạo FIM event thật trên Windows 10 192.168.1.244**

Mở PowerShell **Run as Administrator**:

$TestFile **\=** "$env**:**USERPROFILE\\Downloads\\soc-ai-e2e.txt"

"SOC-AI baseline **$(Get-Date** **\-**Format o**)**" **|**  
    **Set-Content** **\-**Path $TestFile **\-**Encoding UTF8

**Start-Sleep** **\-**Seconds 15

1**..**3 **|** **ForEach-Object** **{**  
    "SOC-AI modification $\_ **$(Get-Date** **\-**Format o**)**" **|**  
        **Add-Content** **\-**Path $TestFile **\-**Encoding UTF8

    **Start-Sleep** **\-**Seconds 3  
**}**

**Get-Item** $TestFile **|**  
    **Format-List** FullName**,** Length**,** LastWriteTime

Sau khi đã quan sát event, có thể tạo delete event:

**Remove-Item** **\-**Path $TestFile **\-**Force

**Output PowerShell dự kiến:** file được tạo, sửa và xóa không lỗi.

## **7.3 5.3. Tạo chuỗi Sysmon network/process events có kiểm soát**

Chỉ dùng khi Sysmon config đang ghi Process Create và Network Connection:

1**..**6 **|** **ForEach-Object** **{**  
    **Start-Process** **\-**FilePath "cmd.exe" \\  
        **\-**ArgumentList "/c whoami \> NUL" \\  
        **\-**WindowStyle Hidden \\  
        **\-**Wait

    Test-NetConnection 192.168**.**1.243 **\-**Port 1514 \\  
        **\-**InformationLevel Quiet **|** **Out-Null**

    **Start-Sleep** **\-**Seconds 2  
**}**

Mục tiêu là tạo sáu sự kiện gần nhau. D4 chỉ gom khi Normalize lấy được cùng src\_ip \+ rule\_id.

*Nếu Sysmon config không thu Event ID 3 hoặc Wazuh rule không cung cấp source IP, bài test này có thể đi theo nhánh không có* src\_ip*. Đây không phải lỗi pipeline; phải kiểm tra JSON thật trước khi đánh giá Threshold D4.*

## **7.4 5.4. Xác minh alert xuất hiện tại Wazuh**

Trên Wazuh VM:

**sudo** python3 \- **\<\<'PY'**  
import json  
from pathlib import Path

path \= Path('/var/ossec/logs/alerts/alerts.json')  
needle \= 'soc-ai-e2e'

with path.open(encoding='utf-8', errors='replace') as fh:  
    lines \= fh.readlines()\[-500:\]

matches \= \[\]  
for line in lines:  
    try:  
        event \= json.loads(line)  
    except json.JSONDecodeError:  
        continue

    if needle.lower() in json.dumps(event, ensure\_ascii=False).lower():  
        matches.append(event)

print(f'MATCHES={len(matches)}')  
for event in matches\[-5:\]:  
    print(json.dumps({  
        'timestamp': event.get('timestamp'),  
        'id': event.get('id'),  
        'agent': event.get('agent'),  
        'rule': event.get('rule'),  
        'syscheck': event.get('syscheck'),  
        'full\_log': event.get('full\_log')  
    }, ensure\_ascii=False, indent=2))  
**PY**

**Output thành công:** MATCHES lớn hơn 0, có agent.id \= 001 và rule metadata.

## **7.5 5.5. Kiểm tra sau Workflow 1**

Đăng nhập mongosh bằng soc\_ai\_app, rồi:

use soc\_ai

db**.**cases**.find**(  
  {}**,**  
  {  
    \_id**:** 0**,**  
    case\_id**:** 1**,**  
    dedup\_hash**:** 1**,**  
    status**:** 1**,**  
    received\_at**:** 1**,**  
    updated\_at**:** 1**,**  
    "raw\_alert.id"**:** 1**,**  
    "raw\_alert.rule"**:** 1**,**  
    "raw\_alert.agent"**:** 1**,**  
    "raw\_alert.syscheck.path"**:** 1**,**  
    indicators**:** 1**,**  
    retry\_count**:** 1**,**  
    last\_error**:** 1**,**  
    audit\_trail**:** 1  
  }  
)**.sort**({ received\_at**:** **\-**1 })**.limit**(10)**.pretty**()

**Kết quả hợp lệ:**

• FIM không có src\_ip, rule level dưới 7: Suppressed.

• FIM không có src\_ip, rule level từ 7: Queued\_AI.

• Event có src\_ip: D4 quyết định theo số lượng trong 60 giây.

Lưu case\_id cần theo dõi:

**const** latest **\=** db**.**cases**.findOne**({}**,** { sort**:** { received\_at**:** **\-**1 } })  
**print**(latest**.**case\_id)

## **7.6 5.6. Theo dõi Processing\_AI**

Do Ollama có thể xử lý trong vài giây, dùng loop trong mongosh:

**for** (**let** i **\=** 0**;** i **\<** 90**;** i**\++**) {  
  **const** doc **\=** db**.**cases**.findOne**(  
    { status**:** "Processing\_AI" }**,**  
    {  
      \_id**:** 0**,**  
      case\_id**:** 1**,**  
      status**:** 1**,**  
      updated\_at**:** 1**,**  
      retry\_count**:** 1**,**  
      last\_error**:** 1  
    }  
  )

  **if** (doc) {  
    **print**("PROCESSING\_AI\_OBSERVED")  
    **printjson**(doc)  
    **break**  
  }

  **sleep**(1000)  
}

**Output mong muốn:**

PROCESSING\_AI\_OBSERVED  
status: Processing\_AI

Nếu không bắt kịp trạng thái trung gian, kiểm tra audit\_trail ở bước tiếp theo.

## **7.7 5.7. Theo dõi Waiting\_HITL**

**for** (**let** i **\=** 0**;** i **\<** 180**;** i**\++**) {  
  **const** doc **\=** db**.**cases**.findOne**(  
    { status**:** "Waiting\_HITL" }**,**  
    {  
      \_id**:** 0**,**  
      case\_id**:** 1**,**  
      status**:** 1**,**  
      updated\_at**:** 1**,**  
      retry\_count**:** 1**,**  
      last\_error**:** 1**,**  
      ai\_result**:** 1**,**  
      indicators**:** 1**,**  
      audit\_trail**:** 1  
    }  
  )

  **if** (doc) {  
    **print**("WAITING\_HITL\_OBSERVED")  
    **printjson**(doc)  
    **break**  
  }

  **sleep**(1000)  
}

**Output bắt buộc:**

WAITING\_HITL\_OBSERVED  
status: Waiting\_HITL  
ai\_result.summary: non-empty  
ai\_result.severity: Low | Medium | High  
ai\_result.recommendation: non-empty  
ai\_result.confidence: null

Audit trail phải có tối thiểu:

INGESTED\_THRESHOLD\_D4  
AI\_CLAIMED  
AI\_ANALYSIS\_COMPLETED

## **7.8 5.8. Kiểm tra Failed/retry**

Không phá Ollama container. Test bằng cách tạm chỉnh URL trong một bản sao Workflow 2 hoặc dùng Manual Execute với URL port sai, sau đó hoàn nguyên.

Sau một lỗi:

db**.**cases**.find**(  
  { retry\_count**:** { $gt**:** 0 } }**,**  
  {  
    \_id**:** 0**,**  
    case\_id**:** 1**,**  
    status**:** 1**,**  
    retry\_count**:** 1**,**  
    last\_error**:** 1**,**  
    audit\_trail**:** 1  
  }  
)**.sort**({ updated\_at**:** **\-**1 })**.pretty**()

**Kết quả:**

retry\_count 1 hoặc 2 \-\> Queued\_AI  
retry\_count 3 \-\> Failed  
last\_error \!= null

## **7.9 5.9. Database Layer cho Streamlit**

Cấu hình .env của Dashboard, không ghi mật khẩu vào source code:

MONGODB\_URI=mongodb://soc\_ai\_app:\<MONGODB\_PASSWORD\>@127.0.0.1:27017/soc\_ai?authSource=soc\_ai\&retryWrites=false  
MONGODB\_DATABASE=soc\_ai  
MONGODB\_COLLECTION=cases  
MONGODB\_TIMEOUT\_MS=5000  
SOC\_ANALYST\_NAME=SOC Admin

### **7.9.1 Mẫu database/mongodb.py**

from \_\_future\_\_ import annotations

import os  
from datetime import datetime, timezone  
from typing import Any, Literal

from pymongo import MongoClient, ReturnDocument  
from pymongo.collection import Collection  
from pymongo.errors import PyMongoError

Decision **\=** Literal\["Approved", "Rejected"\]

VALID\_DECISIONS: set\[str\] **\=** {"Approved", "Rejected"}  
VALID\_AI\_SEVERITIES: set\[str\] **\=** {"Low", "Medium", "High"}

**class** CaseNotReviewableError(*RuntimeError*):  
    *"""Case does not exist or is no longer Waiting\_HITL."""*

**def** utc\_now\_iso() **\-\>** str:  
    **return** (  
        datetime.now(timezone.utc)  
        .isoformat(timespec**\=**"milliseconds")  
        .replace("+00:00", "Z")  
    )

**def** get\_collection() **\-\>** Collection:  
    uri **\=** os.environ\["MONGODB\_URI"\]  
    database\_name **\=** os.getenv("MONGODB\_DATABASE", "soc\_ai")  
    collection\_name **\=** os.getenv("MONGODB\_COLLECTION", "cases")  
    timeout\_ms **\=** int(os.getenv("MONGODB\_TIMEOUT\_MS", "5000"))

    client **\=** MongoClient(  
        uri,  
        serverSelectionTimeoutMS**\=**timeout\_ms,  
        connectTimeoutMS**\=**timeout\_ms,  
        socketTimeoutMS**\=**timeout\_ms,  
        retryWrites**\=**False,  
    )

    client.admin.command("ping")  
    **return** client\[database\_name\]\[collection\_name\]

**def** normalize\_case\_for\_ui(document: dict\[str, Any\]) **\-\>** dict\[str, Any\]:  
    ai\_result **\=** document.get("ai\_result") **or** {}  
    indicators **\=** document.get("indicators") **or** {}  
    hitl **\=** document.get("hitl") **or** {}

    severity **\=** ai\_result.get("severity")  
    **if** severity **not** **in** VALID\_AI\_SEVERITIES:  
        severity **\=** None

    **return** {  
        "case\_id": document.get("case\_id"),  
        "status": document.get("status"),  
        "received\_at": document.get("received\_at"),  
        "updated\_at": document.get("updated\_at"),  
        "summary": ai\_result.get("summary"),  
        "severity": severity,  
        "recommendation": ai\_result.get("recommendation"),  
        "confidence": ai\_result.get("confidence"),  
        "indicators": indicators,  
        "hitl": hitl,  
        "audit\_trail": document.get("audit\_trail") **or** \[\],  
        "raw\_alert": document.get("raw\_alert") **or** {},  
        "retry\_count": int(document.get("retry\_count") **or** 0),  
        "last\_error": document.get("last\_error"),  
    }

**def** get\_case\_detail(case\_id: str) **\-\>** dict\[str, Any\] **|** None:  
    **if** **not** case\_id **or** **not** case\_id.strip():  
        **return** None

    collection **\=** get\_collection()  
    document **\=** collection.find\_one({"case\_id": case\_id.strip()})  
    **return** normalize\_case\_for\_ui(document) **if** document **else** None

**def** update\_hitl\_decision(  
    **\***,  
    case\_id: str,  
    decision: Decision,  
    reviewer: str,  
    feedback: str **\=** "",  
    edited\_recommendation: str **\=** "",  
) **\-\>** dict\[str, Any\]:  
    **if** decision **not** **in** VALID\_DECISIONS:  
        **raise** *ValueError*(f"Unsupported HITL decision: **{**decision**}**")

    case\_id **\=** case\_id.strip()  
    reviewer **\=** reviewer.strip()  
    feedback **\=** feedback.strip()  
    edited\_recommendation **\=** edited\_recommendation.strip()

    **if** **not** case\_id:  
        **raise** *ValueError*("case\_id is required")  
    **if** **not** reviewer:  
        **raise** *ValueError*("reviewer is required")

    reviewed\_at **\=** utc\_now\_iso()  
    collection **\=** get\_collection()

    update **\=** {  
        "$set": {  
            "status": decision,  
            "updated\_at": reviewed\_at,  
            "hitl.decision": decision,  
            "hitl.edited\_recommendation": (  
                edited\_recommendation **or** None  
            ),  
            "hitl.feedback": feedback **or** None,  
            "hitl.reviewer": reviewer,  
            "hitl.reviewed\_at": reviewed\_at,  
        },  
        "$push": {  
            "audit\_trail": {  
                "action": "HITL\_DECISION",  
                "from\_status": "Waiting\_HITL",  
                "to\_status": decision,  
                "actor": reviewer,  
                "at": reviewed\_at,  
                "details": {  
                    "feedback": feedback **or** None,  
                    "edited\_recommendation": (  
                        edited\_recommendation **or** None  
                    ),  
                },  
            }  
        },  
    }

    **try**:  
        updated **\=** collection.find\_one\_and\_update(  
            {  
                "case\_id": case\_id,  
                "status": "Waiting\_HITL",  
            },  
            update,  
            return\_document**\=**ReturnDocument.AFTER,  
        )  
    **except** PyMongoError as exc:  
        **raise** *RuntimeError*(f"MongoDB HITL update failed: **{**exc**}**") from exc

    **if** updated **is** None:  
        **raise** CaseNotReviewableError(  
            "Case was not found or has already been reviewed by another analyst"  
        )

    **return** normalize\_case\_for\_ui(updated)

### **7.9.2 Cách gọi từ Streamlit**

import streamlit as st

from database.mongodb import (  
    CaseNotReviewableError,  
    update\_hitl\_decision,  
)

case\_id **\=** st.session\_state.get("selected\_case\_id")  
reviewer **\=** st.text\_input("Reviewer", value**\=**"SOC Admin")  
feedback **\=** st.text\_area("Feedback")  
edited\_recommendation **\=** st.text\_area("Edited recommendation")

approve\_col, reject\_col **\=** st.columns(2)

**with** approve\_col:  
    **if** st.button("Approve", type**\=**"primary", use\_container\_width**\=**True):  
        **try**:  
            updated **\=** update\_hitl\_decision(  
                case\_id**\=**case\_id,  
                decision**\=**"Approved",  
                reviewer**\=**reviewer,  
                feedback**\=**feedback,  
                edited\_recommendation**\=**edited\_recommendation,  
            )  
            st.success(f"Approved **{**updated\['case\_id'\]**}**")  
            st.rerun()  
        **except** CaseNotReviewableError as exc:  
            st.warning(str(exc))  
        **except** *Exception* as exc:  
            st.error(f"Approve failed: **{**exc**}**")

**with** reject\_col:  
    **if** st.button("Reject", use\_container\_width**\=**True):  
        **try**:  
            updated **\=** update\_hitl\_decision(  
                case\_id**\=**case\_id,  
                decision**\=**"Rejected",  
                reviewer**\=**reviewer,  
                feedback**\=**feedback,  
                edited\_recommendation**\=**edited\_recommendation,  
            )  
            st.success(f"Rejected **{**updated\['case\_id'\]**}**")  
            st.rerun()  
        **except** CaseNotReviewableError as exc:  
            st.warning(str(exc))  
        **except** *Exception* as exc:  
            st.error(f"Reject failed: **{**exc**}**")

Điều kiện status: Waiting\_HITL trong filter là optimistic concurrency control. Hai analyst nhấn cùng lúc thì chỉ request đầu tiên được update; request còn lại nhận CaseNotReviewableError.

## **7.10 5.10. Kiểm tra sau Approve**

db**.**cases**.findOne**(  
  { status**:** "Approved" }**,**  
  {  
    \_id**:** 0**,**  
    case\_id**:** 1**,**  
    status**:** 1**,**  
    updated\_at**:** 1**,**  
    ai\_result**:** 1**,**  
    hitl**:** 1**,**  
    audit\_trail**:** 1  
  }  
)

**Output bắt buộc:**

status \= Approved  
hitl.decision \= Approved  
hitl.reviewer \!= null  
hitl.reviewed\_at \!= null  
audit\_trail cuối cùng: HITL\_DECISION / Waiting\_HITL \-\> Approved

## **7.11 5.11. Kiểm tra sau Reject**

Tạo case thứ hai hoặc dùng alert mới, sau đó:

db**.**cases**.findOne**(  
  { status**:** "Rejected" }**,**  
  {  
    \_id**:** 0**,**  
    case\_id**:** 1**,**  
    status**:** 1**,**  
    updated\_at**:** 1**,**  
    ai\_result**:** 1**,**  
    hitl**:** 1**,**  
    audit\_trail**:** 1  
  }  
)

**Output bắt buộc:**

status \= Rejected  
hitl.decision \= Rejected  
hitl.reviewer \!= null  
hitl.reviewed\_at \!= null  
audit\_trail cuối cùng: HITL\_DECISION / Waiting\_HITL \-\> Rejected

## **7.12 5.12. Tiêu chí nghiệm thu End-to-End**

| Checkpoint | Kết quả PASS |
| :---- | :---- |
| Windows endpoint | Tạo được FIM/Sysmon event thật |
| Wazuh | Alert xuất hiện trong alerts.json |
| Filebeat SOC-AI | Service active, registry tăng offset |
| Kafka | Nhận nested Wazuh JSON tại soc-ai-logs |
| Workflow 1 | Sinh deterministic case\_id, dedup\_hash, D4 đúng |
| MongoDB sau W1 | Chỉ Suppressed hoặc Queued\_AI |
| Workflow 2 claim | Queued\_AI \-\> Processing\_AI atomic |
| Ollama | HTTP 200, JSON parse/validate thành công |
| MongoDB sau AI | Waiting\_HITL, dữ liệu trong ai\_result.\* |
| Dashboard | Case hiển thị đúng nested schema |
| HITL Approve | Atomic transition sang Approved |
| HITL Reject | Atomic transition sang Rejected |
| Audit | Có lịch sử ingest, claim, AI, HITL |
| Retry | 1-2 requeue, lần 3 Failed |

# **8 Rollback có kiểm soát**

## **8.1 R1. Dừng ingest mới**

**sudo** systemctl disable \--now filebeat-soc-ai.service  
systemctl is-active filebeat-soc-ai.service

**Output:** inactive.

## **8.2 R2. Unpublish n8n workflows**

Trên giao diện http://192.168.1.246:5678:

Workflow 1: Unpublish  
Workflow 2: Unpublish  
Running executions: 0

## **8.3 R3. Không xóa dữ liệu MongoDB**

Không drop collection và không xóa volume. Chỉ truy vấn document lỗi để phân tích.

## **8.4 R4. Khôi phục Compose nếu cần**

**sudo** \-i  
cd /root/soc-ai-laptop2

**ls** \-1t docker-compose.yml.pre-runbook-*\** **|** **head** \-n 1  
**cp** \-a **\<**BACKUP\_FILE**\>** docker-compose.yml

docker compose config \--quiet

Không chạy toàn bộ stack nếu backup còn service Streamlit cũ. Chỉ khởi động:

docker compose up \-d \--no-deps mongodb

## **8.5 R5. Khôi phục workflow n8n**

Import file JSON đã export trước khi sửa. Không import credential decrypted.

# **9 Lưu ý vận hành sau triển khai**

1\. Topic giữ message một giờ. Khi Workflow 1 bị tắt lâu, phải dừng filebeat-soc-ai để tránh message hết retention trước khi được consume.

2\. ollama/ollama:latest và n8n:latest là floating tag. Không pull/recreate trong vòng demo; sau nghiệm thu nên ghi lại image digest.

3\. MongoDB hiện không có healthcheck; dùng db.runCommand({ping:1}) và docker compose ps làm health gate.

4\. D4 từ alert thứ sáu trở đi có thể gửi nhiều case vào AI. Đây chưa phải burst aggregation thành một incident.

5\. received\_at và updated\_at lưu UTC ISO-8601 string. Dashboard chỉ chuyển sang Asia/Ho\_Chi\_Minh ở lớp hiển thị.

6\. Không expose Ollama hoặc MongoDB ra Internet. Hai service chỉ dành cho LAN lab.

7\. Credential từng xuất hiện trong tài liệu làm việc phải được rotate trước demo cuối và cập nhật đồng bộ n8n/Dashboard.

# **10 Tài liệu tham chiếu chính thức**

• Elastic Filebeat project paths và registry: https://www.elastic.co/guide/en/beats/filebeat/current/configuration-path.html

• Elastic Filebeat Kafka output: https://www.elastic.co/guide/en/beats/filebeat/current/kafka-output.html

• Elastic Filebeat systemd: https://www.elastic.co/guide/en/beats/filebeat/current/running-with-systemd.html

• Elastic tail\_files: https://www.elastic.co/guide/en/beats/filebeat/8.19/filebeat-input-log.html

• MongoDB findAndModify: https://www.mongodb.com/docs/v8.0/reference/command/findandmodify/

• MongoDB findOneAndUpdate: https://www.mongodb.com/docs/v8.2/reference/method/db.collection.findoneandupdate/

• Ollama Generate API: https://docs.ollama.com/api/generate

• n8n documentation: https://docs.n8n.io/

