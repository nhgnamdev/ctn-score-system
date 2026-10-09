<div align="center">

# CTN Score
### Hệ thống quản lý thi đua Đoàn trường THPT Chuyên Thái Nguyên

**Một bảng điểm thống nhất cho 39 lớp — từ ghi nhận nghiệp vụ đến xếp hạng tuần.**

![HTML5](https://img.shields.io/badge/HTML5-Structure-orange?logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS-Responsive-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?logo=javascript&logoColor=black)
![Chart.js](https://img.shields.io/badge/Charts-Chart.js-FF6384)
![Status](https://img.shields.io/badge/Status-Portfolio%20Demo-2563EB)

</div>

---

## Giới thiệu

**CTN Score** là ứng dụng web mô phỏng công tác quản lý thi đua theo tuần tại trường THPT Chuyên Thái Nguyên. Lớp học là đơn vị tính điểm và xếp hạng; vi phạm cá nhân vẫn lưu theo đoàn viên nhưng điểm tác động vào kết quả của lớp. Dữ liệu lớp, đoàn viên, quy tắc, giao dịch điểm và thành tích được liên kết để dễ tra cứu, đối chiếu và theo dõi lịch sử.

## Tính năng chính

- **Dashboard & xếp hạng:** xem toàn trường hoặc từng khối; bảng xếp hạng hỗ trợ đủ **39 lớp** theo tuần, kèm biểu đồ xu hướng.
- **Hồ sơ lớp:** phân tích điểm Nề nếp, Học tập, điểm cộng; xem vi phạm, thành tích, đoàn viên và lịch sử thứ hạng trong **35 tuần**.
- **Quản lý đoàn viên:** lọc theo khối/lớp, tìm kiếm hồ sơ, xem lịch sử vi phạm, thành tích và trạng thái Đoàn phí.
- **Ghi nhận nghiệp vụ:** nhập vi phạm, Sổ đầu bài, giao dịch điểm, phân công trực tuần và xử lý giao dịch chờ duyệt.
- **Rule Engine:** quản lý quy tắc chấm điểm, loại tính, phạm vi áp dụng, phiên bản và trạng thái hoạt động.
- **Thành tích & sự kiện:** theo dõi kết quả hoạt động và điểm thưởng liên quan.
- **Phân quyền giao diện:** Admin, Bí thư BCH Đoàn trường, Phó Bí thư BCH Đoàn trường, Ủy viên BCH Đoàn trường và Bí thư Chi đoàn.
- **Quản trị dữ liệu:** Audit Log, kiểm tra tính toàn vẹn, tạo lại dữ liệu demo và xuất dữ liệu JSON.
- **Tìm kiếm nhanh:** tra cứu lớp và đoàn viên từ thanh tìm kiếm chung.

## Quy mô mô phỏng

| Thành phần | Quy mô |
|---|---:|
| Khối | 3 |
| Lớp | 39 |
| Đoàn viên mẫu | 1.170 (30/lớp) |
| Tuần dữ liệu | 35 |
| Điểm nền mỗi lớp/tuần | 100 Nề nếp + 40 Học tập + điểm cộng |

## Công nghệ

- **HTML5, CSS, Tailwind CSS:** giao diện và bố cục responsive.
- **Vanilla JavaScript:** điều hướng, xử lý nghiệp vụ và cập nhật giao diện.
- **LocalStorage:** lưu dữ liệu demo ngay trên trình duyệt.
- **Chart.js:** biểu đồ; **SweetAlert2** và **Phosphor Icons:** thông báo và biểu tượng.

## Chạy thử

https://nhgnamdev.github.io/ctn-score-system/

1. Tải ZIP hoặc clone repository về máy.
2. Mở thư mục dự án bằng VS Code.
3. Mở `index.html` bằng tiện ích **Live Server**.
4. Nhấn **Khởi tạo / làm mới Demo** để tạo dữ liệu mẫu.
5. Chọn tuần, vai trò và phạm vi; thử mở một lớp, lọc danh sách đoàn viên, ghi nhận giao dịch và xem bảng xếp hạng.

## Cấu trúc dự án

```text
CTN_Score/
├── index.html
├── README.md
├── css/
│   └── app.css
└── js/
    ├── app.js
    ├── core/
    │   ├── db.js
    │   ├── engine.js
    │   └── permissions.js
    ├── data/
    │   └── seed.js
    └── components/
        └── ui.js
```

## Lưu ý

Đây là **portfolio demo frontend**, chưa có backend hoặc xác thực tài khoản thực. Phân quyền dùng để minh họa luồng thao tác trên giao diện, không thay thế kiểm soát quyền phía máy chủ. Dữ liệu được lưu trong LocalStorage của trình duyệt; dữ liệu và quy tắc mẫu không đại diện mặc nhiên cho hồ sơ hoặc quy định thi đua hiện hành của nhà trường.

---

<div align="center">

**CTN Score · Portfolio Project · 2026**

</div>
