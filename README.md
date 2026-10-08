# ctn-score-system
High School Emulation &amp; Score Management System Demo
# CTN Score System - Hệ thống Quản lý Thi đua THPT
> Bản Prototype (V7 Ultimate) mô phỏng hệ thống quản lý Đoàn viên và tính điểm thi đua cho trường THPT Chuyên Thái Nguyên.

## 🌟 Tổng quan kiến trúc (Architecture Overview)
Dự án được thiết kế theo tư duy **Data-driven & Event-sourcing** thu nhỏ. Thay vì lưu trữ điểm số dưới dạng tĩnh (hardcode), hệ thống tính toán điểm theo thời gian thực (Real-time Calculation) dựa trên Lịch sử giao dịch (Transactions).

### Nguyên tắc cốt lõi (Core Principles)
* **LỚP là đơn vị chịu điểm:** Điểm gốc mỗi tuần gồm Nề nếp (100đ) và Học tập (40đ).
* **ĐOÀN VIÊN là đối tượng ghi nhận:** Học sinh vi phạm sẽ được lưu vào hồ sơ cá nhân, nhưng điểm trừ được tự động trừ vào tổng của Lớp.
* **Score Transaction (Lịch sử giao dịch):** Mọi sự kiện (Lỗi, Thành tích, Sổ đầu bài) đều sinh ra một bản ghi Transaction. Điểm cuối cùng = Điểm gốc + Tổng điểm từ các Transactions. Không cho phép sửa điểm trực tiếp.

## 🚀 Tính năng nổi bật (Key Features)
1. **Rule Engine Động:** Admin có thể tạo, vô hiệu hóa, và thay đổi số điểm của từng luật vi phạm/khen thưởng mà không cần can thiệp source code.
2. **Approval Workflow (Quy trình duyệt điểm):** Dữ liệu do Cán bộ trực tuần nhập sẽ ở trạng thái `PENDING`. Chỉ khi Admin xác nhận (`APPROVED`), hệ thống mới tiến hành cộng/trừ điểm lớp.
3. **Appeals (Khiếu nại):** Bí thư các lớp có quyền gửi yêu cầu xem xét lại một vi phạm, hệ thống sẽ đưa vào luồng chờ Admin phân xử.
4. **Data Integrity & Audit Log:** Tính năng kiểm tra tính toàn vẹn của dữ liệu (chống mồ côi data) và ghi vết (Audit Log) toàn bộ thao tác Sửa/Xóa của mọi user.
5. **Score Simulation (Mô phỏng điểm):** Cho phép ướm thử một luật vào lớp xem tổng điểm biến động ra sao trước khi áp dụng thật.
6. **Role-Based Access Control (Phân quyền RBAC):** Giới hạn quyền hạn (Scope) truy cập dữ liệu dựa trên vai trò (Super Admin, Admin, Sao đỏ, Bí thư).

## 🛠 Kỹ thuật áp dụng
* **Frontend:** HTML5, JavaScript thuần (Vanilla JS), TailwindCSS cho UI/UX.
* **Data Storage:** LocalStorage (Mô phỏng Database NoSQL nội bộ giúp dự án chạy độc lập không cần Server).
* **Libraries:** Chart.js (Vẽ biểu đồ Analytics), Phosphor Icons, SweetAlert2.
* **Cỗ máy Seed Data:** Tích hợp bộ tạo dữ liệu giả lập có cấu trúc (39 Lớp, ~1170 Đoàn viên, 35 Tuần giao dịch) xử lý mượt mà trên trình duyệt.

## 💻 Trải nghiệm Live Demo
*Lưu ý: Bấm nút "Khởi tạo Dữ liệu Demo" ở menu góc trái dưới cùng khi truy cập lần đầu.*
