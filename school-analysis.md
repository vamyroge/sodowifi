# Phân tích ảnh tham chiếu — THPT Số 1 Tư Nghĩa

> Tài liệu này là **STEP 3–4** của workflow: ẢNH → PHÂN TÍCH → SCENE DATA.
> Mọi geometry trong `src/data/**` đều trỏ ngược về các vùng pixel ghi ở đây.

## 1. Ảnh tham chiếu đã quét

| File | Kích thước | Loại | Ghi chú |
|---|---|---|---|
| `sodotruong.jpg` | 1280 × 960 px | Mặt bằng tổng thể 2D (sơ đồ khối, nhìn từ trên xuống) | **Ảnh duy nhất** trong project. Không có ảnh mặt đứng, ảnh chụp, ảnh phối cảnh. |

Bản sao phục vụ runtime: `public/reference/sodotruong.jpg` (dùng cho lớp *Reference overlay* để đối chiếu).

### Hệ quả quan trọng
Ảnh là **sơ đồ mặt bằng dạng khối**, nên:

- **Chắc chắn (high)**: bố cục, vị trí tương đối các khối, thứ tự phòng, tên phòng, số tầng (qua nhãn TRỆT / LẦU 1 / LẦU 2), vị trí cầu thang, vị trí cổng, tường rào, hướng Nam → Bắc.
- **Không có trong ảnh → ước lượng (`estimated: true`)**: chiều cao, hình dạng mái, cửa sổ, cửa ra vào, hành lang, lan can, cột, vật liệu, kích thước tuyệt đối.

## 2. Hệ tọa độ & tỷ lệ

- Gốc tọa độ: pixel ảnh `(640, 480)` (tâm ảnh) → `(0, 0, 0)` trong 3D.
- `X_3D = (px − 640) × 0.2`, `Z_3D = (py − 480) × 0.2`, `Y` = chiều cao.
- **1 unit = 1 m**. **1 px = 0.2 m** → *estimated*. Ảnh không có thước tỷ lệ. Hệ số 0.2 được chọn để một ô phòng học (~36 px dọc dãy) ≈ 7.2 m — hợp lý với phòng học phổ thông. Mọi khối dùng chung một tỷ lệ.
- Hướng: mũi tên “NAM → BẮC” ở cuối ảnh trỏ sang phải ⇒ **+X = hướng Bắc**. Cổng chính nằm phía dưới ảnh (+Z), giáp **Quốc lộ 1A**.
- Chiều cao tầng: **3.6 m** (*estimated*, chuẩn phổ biến cho trường học).

## 3. Quy ước đọc tầng trong ảnh

Ảnh vẽ các tầng của một dãy **cạnh nhau** thành các cột, có nhãn cột ở chân (TRỆT, LẦU 1, LẦU 2). Ô **CẦU THANG** vẽ trải ngang qua mọi cột ⇒ cầu thang thông suốt các tầng.

⇒ Trong 3D: các cột được **xếp chồng** lên cùng một footprint. Footprint được đặt **tại tâm vùng vẽ** của dãy, bề sâu = bề rộng một cột (estimated) để giữ bố cục tổng thể mà không làm dãy nhà dày gấp đôi.

Quy ước số tầng trên UI: **Tầng 1 = Trệt**, **Tầng 2 = Lầu 1**, **Tầng 3 = Lầu 2**.

## 4. Các dãy nhà đã xác định

Ảnh **không ghi tên dãy**. Ký tự A–F là **mã nội bộ** do hệ thống gán theo vị trí (không phải tên chính thức).

### Dãy A — dãy phòng học phía Nam (trái ảnh)
- Vùng vẽ: x 105–235, y 112–542. Cột LẦU 1: x 105–170; cột TRỆT: x 170–235.
- Số tầng: **2** (high).
- Trệt (từ trên xuống): P.34, P.33, *Cầu thang*, P.32, P.31, *Cầu thang*, P.30, P.29, *Cầu thang*, P.28, P.27, *Cầu thang*, P.26, P.25.
- Lầu 1: P.35, P.36, *CT*, P.37, P.38, *CT*, P.39, P.40, *CT*, P.41, P.42, *CT*, P.43, P.44.
- Cầu thang: **4** (high).

### Dãy B — giữa-trái
- Vùng vẽ: x 378–520, y 217–545. Cột LẦU 1: x 378–445; cột TRỆT: x 445–520.
- Số tầng: **2** (high).
- Trệt: P.TH Sinh (217–270), P.CNTT (270–301), *CT* (301–340), P.16 (340–370), VP Đoàn (370–420), P.TVHĐ (420–445), *CT* (445–478), P.TDGP (478–512), P. Giáo viên (512–545).
- Lầu 1: P.19 (217–258), P.20 (258–301), *CT*, P.21 (340–392), P.22 (392–445), *CT*, P.23 (478–512), P.24 (512–545).
- Cầu thang: **2** (high).

### Dãy C + D — dãy chức năng phía sau sân khấu (giữa-trên)
- Vùng vẽ: x 520–1027, y 162–272. Dãy chạy theo trục X.
- Phần D (x 860–1027) có nhãn **LẦU 2 / LẦU 1 / TRỆT** rõ ràng ⇒ **3 tầng** (high).
- Phần C (x 520–760) có cùng cấu trúc 3 hàng ⇒ 3 tầng (**medium** — suy ra theo phần D).
  - Lầu 2: P.BM Tin học, P.BM Hóa, P.BM Lý, P.BM Sinh-CN.
  - Lầu 1: P. Vi tính II, P. Vi tính I.
  - Trệt: P. Thực hành Hóa.
- Cầu thang: x 760–822, trải cả 3 hàng (high).
- Khoang x 822–860: ô trống không ghi tên (low) → mô hình là khoang **chưa xác định chức năng**.
- Phần D: Lầu 2 = Phòng TTTA, Lầu 1 = Thư viện, Trệt = P. Thực hành Lý.

### Dãy E — dãy phòng học phía Bắc (phải ảnh)
- Vùng vẽ: x 1052–1167, y 232–508. Cột TRỆT: x 1052–1110; cột LẦU 1: x 1110–1167.
- Số tầng: **2** (high).
- Trệt: P.06, P.05, *CT*, P.04, P.03, *CT*, P.02, P.01.
- Lầu 1: P.07, P.08, *CT*, P.09, P.10, *CT*, P.11, P.12.
- Cầu thang: **2** (high).

### Dãy F — khối hành chính (phải-dưới)
- Vùng vẽ: x 987–1207, y 543–802. Cột TRỆT: x 987–1052; LẦU 1: x 1052–1150; LẦU 2: x 1150–1207.
- Số tầng: **3** (high).
- Trệt: P. Y tế (570–608), P. Văn thư (608–648), *CT* (648–677), Phòng họp (677–802).
- Lầu 1: P. Kế toán (570–608), P. PHT (608–648), *CT*, P. HT (677–718), P. Họp liên tịch (718–760), P. PHT (760–802).
- Lầu 2: Phòng Truyền thống (570–648), *CT*, P.BM Tiếng Anh (677–718), P.BM Sử-Địa-GDCD (718–760), P.BM Ngữ văn (760–802).
- Hàng **NHÀ VỆ SINH** (y 543–570) trải ngang toàn khối, không gắn nhãn tầng ⇒ mô hình là khối phụ 1 tầng gắn đầu dãy (medium).

## 5. Công trình phụ & ngoài trời

| Đối tượng | Vùng px | Ghi chú | Confidence |
|---|---|---|---|
| Hội trường | 260–390 × 27–142 | 1 khối lớn; chiều cao & mái ước lượng | layout high / hình khối low |
| Sân bóng đá | 707–1093 × 25–130 | Có vạch giữa sân, vòng tròn, 2 vòng cấm | high |
| Hồ bơi | 1160–1235 × 38–107 | | high |
| Nhà thi đấu | 1177–1245 × 153–237 | chiều cao & mái ước lượng | layout high |
| Nhà vệ sinh (cạnh D) | 1027–1090 × 162–225 | 1 tầng (estimated) | medium |
| Nhà vệ sinh (đầu dãy F) | 987–1207 × 543–570 | | medium |
| Sân khấu | 678–880 × 277–319 | bục thấp, cao ước lượng | layout high |
| Cột cờ | đế 740–820 × 407–480, cột x≈780 | đế 2 cấp vẽ rõ; lá cờ có ngôi sao | high |
| Bồn cây | 796–872 × 598–670 | có 1 cây cảnh | high |
| Bảng tin | 548–583 × 578–675 | | high |
| Nhà để xe giáo viên | 122–350 × 797–848 | mái che ước lượng | layout high |
| Phòng bảo vệ | 352–427 × 790–848 | biểu tượng mái dốc trong ảnh | medium |
| Tường rào | trái x=80; phải x=1250; trước y=850 | **Không có** rào phía sau (trên ảnh) ⇒ không dựng | high |
| Cổng / lối vào | khe hở rào tại x 465–500, 557–797 (cổng chính), 855–908, 1020–1047 | mũi tên chỉ hướng vào | high |
| Quốc lộ 1A | dải y 905–947 | | high |
| Sân trường | vùng trống giữa các dãy | bề mặt lát ước lượng | medium |

### Chưa xác định
- Đường gấp khúc tại x 87–122, y 703–848 (bên trái nhà để xe): không có nhãn ⇒ **không dựng**, ghi nhận để kiểm tra lại.
- Không có đường nội bộ nào được vẽ ⇒ không bịa lối đi; chỉ dựng nền sân chung.
- Không có cây nào khác ngoài bồn cây ⇒ không thêm cây trang trí.

## 6. Chi tiết ước lượng (áp dụng thống nhất)

| Hạng mục | Giá trị | Lý do |
|---|---|---|
| Chiều cao tầng | 3.6 m | chuẩn phổ biến |
| Hành lang | rộng 2.4 m, nằm **phía hướng ra sân trường** | ảnh không vẽ hành lang; đây là bố trí điển hình |
| Lan can | cao 1.0 m ở các tầng lầu | |
| Cột hành lang | tại mỗi vách ngăn phòng | |
| Cửa ra vào | 1 cửa/phòng, mở ra hành lang | |
| Cửa sổ | nhịp ~2.4 m trên tường ngoài & tường hành lang | |
| Mái dãy học | mái bằng có tường chắn mái (parapet) | không có thông tin mái — chọn dạng tối giản |
| Mái hội trường / nhà thi đấu | mái dốc 2 phía thấp | ước lượng |
| Kích thước tuyệt đối | theo tỷ lệ 0.2 m/px | không có thước tỷ lệ |

## 7. Mạng (network)
Ảnh **không chứa** bất kỳ thông tin nào về router, switch, access point, dây cáp. Lớp NETWORK chỉ là kiến trúc sẵn sàng; dữ liệu `networkNodes` hiện **rỗng**.
