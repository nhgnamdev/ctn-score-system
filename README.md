# CTN Score

**CTN Score** là web demo quản lý thi đua Đoàn trường THPT Chuyên Thái Nguyên, lấy **lớp** làm đơn vị tính điểm.

## Tính năng chính

- **39 lớp · 35 tuần**: Khối 10 K37, Khối 11 K36, Khối 12 K35.
- **Xếp hạng toàn trường**: hiển thị đầy đủ 39 lớp theo tuần; lọc theo khối.
- **Class Detail**: điểm Nề nếp 100đ + Học tập 40đ + Bonus, giao dịch, vi phạm, thành tích và lịch sử xếp hạng.
- **Đoàn viên**: danh sách, hồ sơ, vi phạm, thành tích, Đoàn phí.
- **Nghiệp vụ tuần**: Sổ đầu bài, ghi nhận vi phạm, giao dịch điểm, trực tuần, duyệt & khiếu nại.
- **Rule Engine**: luật có mã, version, scope, kiểu tính và nguồn tham khảo.
- **Thành tích & Sự kiện**: quản lý dữ liệu hoạt động và điểm thưởng.
- **Quản trị**: Demo Data, Integrity Check, Export JSON, Audit Log.
- **Tìm kiếm nhanh** lớp và Đoàn viên.

## Phân quyền

| Vai trò | Phạm vi |
|---|---|
| **Admin** | Toàn hệ thống |
| **Bí thư BCH Đoàn trường** | Toàn trường, quản lý luật/năm học, duyệt, audit |
| **Phó Bí thư BCH Đoàn trường** | Toàn trường, nghiệp vụ và duyệt |
| **Ủy viên BCH Đoàn trường** | Toàn trường, nghiệp vụ |
| **Bí thư Chi đoàn** | Lớp được phân công |

> Đây là **phân quyền mô phỏng phía frontend** để phục vụ demo portfolio, chưa phải hệ thống xác thực production.

## Công nghệ

**HTML · Tailwind CSS · Vanilla JavaScript · Chart.js · SweetAlert2 · LocalStorage**

Cấu trúc chính:

```text
CTN_Score/
├── index.html
├── css/
└── js/
    ├── core/        # DB, Score Engine, Permissions
    ├── data/        # Demo data
    └── components/  # UI
```

## Chạy

Mở `index.html` bằng trình duyệt hoặc dùng **VS Code Live Server**.

1. Chọn vai trò ở góc phải.
2. Bấm **Khởi tạo / làm mới Demo**.
3. Chọn tuần và phạm vi.
4. Chọn **Toàn trường** để xem bảng xếp hạng đầy đủ 39 lớp.

## Lưu ý

Dữ liệu và điểm số trong project là **demo mô phỏng**. Các rule có `source=REFERENCE` chỉ là nguồn tham khảo, không đại diện cho quy định thi đua hiện hành của nhà trường.

**Portfolio project · Frontend demo · 2026**
