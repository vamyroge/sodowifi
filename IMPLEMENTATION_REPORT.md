# BÁO CÁO TRIỂN KHAI: 3D DIGITAL TWIN THPT SỐ 1 TƯ NGHĨA

Dự án đã được hoàn thiện đạt tiêu chuẩn **Interactive 3D School Digital Twin**, kiến trúc hướng dữ liệu (data-driven) trực tiếp từ bản vẽ mặt bằng gốc `sodotruong.jpg`.

---

## 1. Những gì đã xây dựng

1. **Hệ thống 3D Web Engine**:
   - Sử dụng **React 19 + TypeScript (Strict) + Three.js + React Three Fiber + Drei + Tailwind CSS**.
   - Hỗ trợ chiếu sáng kép (Day / Evening), đổ bóng thời gian thực, điều khiển quỹ đạo mượt mà (`OrbitControls`), khử răng cưa và thích ứng tỉ lệ màn hình.
   - Cơ chế gom cụm Geometry (`mergeGeometries`) tối ưu hiệu năng: mỗi tầng chỉ tốn 1 draw call cho mỗi loại vật liệu, đạt hiệu năng 60 FPS.

2. **Dữ liệu kiến trúc & Toàn bộ 5 khối dãy nhà**:
   - **Dãy A (Nam)**: 2 tầng (Trệt + Lầu 1), 4 cầu thang xuyên suốt, toàn bộ phòng P.25 đến P.44.
   - **Dãy B (Giữa-trái)**: 2 tầng, 2 cầu thang; tầng trệt gồm P.TH Sinh, P.CNTT, P.16, VP Đoàn, P.TVHĐ, P.TDGP, P.Giáo viên; lầu 1 gồm P.19 đến P.24.
   - **Dãy C·D (Giữa-trên)**: 3 tầng; phòng thực hành Hóa/Lý, P. Vi tính I & II, Thư viện, P.TTTA, 4 phòng bộ môn (Tin học, Hóa, Lý, Sinh-CN), 1 cầu thang trung tâm, khoang đệm kỹ thuật.
   - **Dãy E (Bắc)**: 2 tầng, 2 cầu thang, toàn bộ phòng P.01 đến P.12.
   - **Dãy F (Hành chính)**: 3 tầng, 1 cầu thang; tầng trệt (Phòng họp, Y tế, Văn thư), Lầu 1 (Hiệu trưởng, 2 Phó hiệu trưởng, Kế toán, Họp liên tịch), Lầu 2 (Phòng truyền thống, 3 tổ bộ môn Anh, Sử-Địa-GDCD, Ngữ văn).

3. **Toàn bộ công trình phụ trợ & khuôn viên ngoài trời**:
   - Sân bóng đá (kích thước tỉ lệ chuẩn, vòng tròn trung tâm, vạch sân).
   - Hồ bơi ngoài trời (mặt nước, viền bảo vệ).
   - Hội trường & Nhà thi đấu đa năng (khối hộp lớn, mái dốc gable).
   - Nhà vệ sinh phụ (khối phía Bắc & khối gắn liền đầu dãy F).
   - Sân khấu lễ đài, Cột cờ 2 cấp podium kèm lá cờ đỏ sao vàng.
   - Bồn cây cảnh sân trường, Bảng tin trường học.
   - Nhà để xe giáo viên (hệ cột & mái che), Phòng bảo vệ cổng chính (mái dốc).
   - Hệ thống tường rào phân đoạn, 4 cổng/lối vào (Cổng chính có xà ngang khẩu độ lớn), dải đường Quốc Lộ 1A.

4. **Hệ thống tương tác & Trải nghiệm số**:
   - **5 Chế độ xem (View Modes)**:
     - *Kiến trúc (Architectural)*: Đầy đủ mái, tường chuẩn, bóng đổ.
     - *Xuyên tường (Transparent)*: Tường bán trong suốt, nhìn xuyên thấu bố cục bên trong; tự động tăng độ mờ khi zoom gần.
     - *Mặt bằng (Floorplan)*: Camera khóa góc chiếu 90° nhìn vuông góc từ trên xuống như sơ đồ 2D.
     - *Sơ đồ công năng (Schematic)*: Màu hóa các phòng theo mục đích sử dụng (phòng học, thí nghiệm, bộ môn, hành chính...).
     - *Mạng hạ tầng (Network)*: Layer dự trù cho topology mạng Wi-Fi/LAN.
   - **Floor Controller**: Lọc hiển thị từng tầng riêng biệt (Tất cả / Tầng 1 / Tầng 2 / Tầng 3) và tính năng **Tách tầng (Explode)** nâng cao theo phương thẳng đứng.
   - **Camera tự động bay (Smooth transitions)**: Bay camera mượt mà vào từng phòng, từng dãy nhà hoặc từng công trình khi người dùng click chọn.
   - **Đối chiếu ảnh gốc 2D (Reference Overlay)**: Cho phép bật/tắt lớp ảnh bản vẽ gốc `sodotruong.jpg` chiếu trực tiếp dưới chân mô hình 3D để kiểm tra độ trùng khớp vị trí.
   - **Bảng điều khiển (Navigation & Context Inspector)**: Danh sách tòa nhà, tra cứu thông số kỹ thuật, kích thước, độ tin cậy dữ liệu (Provenance audit).
   - **Phím tắt**: `R` (reset), `F` (focus), `E` (explode), `1/2/3/0` (chọn tầng), `H` (ẩn/hiện UI), `Esc` (hủy chọn).

---

## 2. Phần trích xuất trực tiếp từ ảnh vs. Ước lượng (Audit Provenance)

| Thành phần | Nguồn dữ liệu | Mức tin cậy | Ghi chú |
|---|---|---|---|
| Bố cục, vị trí các khối | `sodotruong.jpg` | **High** | Khớp theo tọa độ pixel của ảnh gốc |
| Tên phòng, nhãn phòng | `sodotruong.jpg` | **High** | Giữ nguyên văn bản tiếng Việt từ ảnh |
| Thứ tự và vị trí cầu thang | `sodotruong.jpg` | **High** | 10 vị trí cầu thang trải qua các tầng |
| Hướng địa lý (Nam - Bắc) | `sodotruong.jpg` | **High** | Đọc từ mũi tên chỉ hướng Nam → Bắc |
| Số tầng dãy A, B, E, F, D | `sodotruong.jpg` | **High** | Đọc từ các nhãn cột Trệt, Lầu 1, Lầu 2 |
| Số tầng phần C (dãy sau sân khấu) | Suy luận | **Medium** | Dãy C cùng khối 3 hàng với phần D |
| Số tầng Nhà vệ sinh | Ước lượng | **Medium** | Mặc định 1 tầng |
| Tỉ lệ quy đổi (0.2m/px) | Ước lượng | **Medium** | Căn cứ vào khẩu độ 1 phòng học phổ thông ~7.2m |
| Chiều cao tầng (3.6m) | Ước lượng | **Low** | Tiêu chuẩn xây dựng trường học phổ thông |
| Vị trí hành lang & lan can | Ước lượng | **Low** | Mặc định hành lang 2.4m quay vào sân trường |
| Hình thức mái bằng / mái dốc | Ước lượng | **Low** | Ảnh không có bản vẽ mặt đứng (elevation) |

---

## 3. Cấu trúc thư mục mã nguồn

```
d:\sodowifi\
├── public/
│   └── reference/
│       └── sodotruong.jpg            # Bản sao phục vụ lớp chiếu Reference Overlay
├── src/
│   ├── types/
│   │   └── school.ts                 # Domain models, Audit Provenance, Network specs
│   ├── data/
│   │   ├── school/
│   │   │   ├── provenance.ts         # Helper gán nguồn ảnh & nhãn ước lượng
│   │   │   ├── outdoor.ts            # Công trình phụ, sân bãi, tường rào, cổng, đường
│   │   │   └── school-scene.ts       # Dữ liệu tích hợp toàn trường (Single Source of Truth)
│   │   ├── buildings/
│   │   │   ├── building-a.ts         # Khối phòng học phía Nam
│   │   │   ├── building-b.ts         # Khối giữa-trái
│   │   │   ├── building-cd.ts        # Khối chức năng sau sân khấu
│   │   │   ├── building-e.ts         # Khối phòng học phía Bắc
│   │   │   └── building-f.ts         # Khối hành chính & phòng họp
│   │   └── rooms/
│   │       └── room-types.ts         # Danh mục loại phòng và bảng màu
│   ├── lib/
│   │   ├── geometry/
│   │   │   ├── plan.ts               # Bộ chuyển đổi pixel -> mét
│   │   │   └── building-layout.ts    # Thuật toán sinh thể tích phòng, tường, cửa, cột
│   │   └── 3d/
│   │       ├── geometry-builders.ts  # Gom cụm geometry (tối ưu hóa draw calls)
│   │       ├── materials.ts          # Bộ vật liệu chia sẻ & quản lý độ trong suốt
│   │       ├── scene-index.ts        # Chỉ mục tra cứu nhanh và precalculated bounds
│   │       ├── validate-scene.ts     # Kiểm tra tính toàn vẹn dữ liệu
│   │       └── visibility.ts         # Logic cô lập, ẩn hiện tầng & tách tầng
│   ├── store/
│   │   └── twin-store.ts             # Zustand state management
│   ├── components/
│   │   ├── 3d/
│   │   │   ├── Viewport3D.tsx        # Canvas WebGL chính
│   │   │   ├── CampusScene.tsx       # Cụm mô hình trường học
│   │   │   ├── CameraRig.tsx         # Hệ thống bay camera mượt
│   │   │   ├── SceneLighting.tsx     # Ánh sáng ngày / chiều
│   │   │   └── ReferenceOverlay.tsx  # Lớp chiếu ảnh gốc đối chiếu
│   │   ├── buildings/BuildingMesh.tsx
│   │   ├── floors/FloorMesh.tsx
│   │   ├── outdoor/OutdoorMesh.tsx
│   │   └── ui/
│   │       ├── Header.tsx            # Tiêu đề & thanh công cụ nhanh
│   │       ├── NavigationPanel.tsx   # Danh sách chuyển tòa/khuôn viên
│   │       ├── ContextInspector.tsx  # Bảng thanh tra chi tiết
│   │       ├── FloorController.tsx   # Bộ lọc tầng & tách tầng
│   │       ├── ViewModeSelector.tsx  # Bộ chọn 5 chế độ hiển thị
│   │       ├── HoverTooltip.tsx      # Tooltip khi rê chuột
│   │       ├── ShortcutsModal.tsx    # Bảng hướng dẫn phím tắt
│   │       └── LoadingScreen.tsx     # Màn hình tải
│   ├── tests/
│   │   └── scene.test.ts             # Unit test dữ liệu
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── school-analysis.md                # Tài liệu phân tích ảnh nguồn chi tiết
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 4. Hướng dẫn chạy và triển khai

### Khởi động môi trường phát triển (Local)
```bash
npm run dev
```
Truy cập: `http://localhost:5173`

### Kiểm tra mã nguồn & Kiểm thử tự động
```bash
npm run typecheck   # Kiểm tra kiểu TypeScript Strict (0 lỗi)
npm run lint        # Kiểm tra chuẩn ESLint (0 lỗi)
npm run test        # Chạy kiểm thử tự động Vitest (Đã pass 100%)
```

### Đóng gói triển khai Web (Production Build)
```bash
npm run build
```
Thư mục `dist/` xuất ra hoàn toàn là static files (HTML/CSS/JS), có thể deploy trực tiếp lên **Vercel, GitHub Pages, Netlify, Cloudflare Pages** hoặc bất kỳ máy chủ Web tĩnh nào của nhà trường.

---

## 5. Các bước tiếp theo để tích hợp Sơ đồ Mạng (Network & Wi-Fi)

Mã nguồn và schema đã được thiết kế sẵn cho hạ tầng mạng trong `src/types/school.ts` (`NetworkNode`, `NetworkConnection`, `networkNodes[]` trong từng `Room`).

Khi có số liệu thực tế về hạ tầng mạng của trường:
1. Thêm vị trí Access Point, Switch, Router vào mảng `networkNodes` của từng phòng trong `src/data/buildings/**`.
2. Tạo component 3D `NetworkLayer.tsx` (sử dụng `THREE.InstancedMesh` cho các thiết bị và `THREE.CatmullRomCurve3` cho đường cáp truyền dẫn).
3. Bật tab **Mạng Wi-Fi (Network)** trên thanh View Mode để hiển thị trực quan bản đồ mạng nội bộ toàn trường.
