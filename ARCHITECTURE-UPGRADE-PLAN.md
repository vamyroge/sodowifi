# KẾ HOẠCH NÂNG CẤP KIẾN TRÚC 3D DIGITAL TWIN — THPT SỐ 1 TƯ NGHĨA
**Phiên bản:** Architectural Upgrade Plan v1.0  
**Tác giả:** Senior 3D Web Engineer + Architectural Visualization Artist + Digital Twin UX Designer  
**Dự án:** THPT Số 1 Tư Nghĩa Digital Twin 3D  

---

## 1. Hiện trạng kiến trúc (Current Architecture)
- Hiện tại, các tòa nhà được tạo từ `building-layout.ts` thông qua các hình khối chữ nhật `Box` (AABB - Axis-Aligned Bounding Box) đơn giản ghép lại thành `exteriorWalls`, `corridorWalls`, `partitions`, `slab`, `windows`, `doors`, `railings`, `columns`, `stairs`.
- Các cửa sổ hiện tại chỉ là các khối hộp mỏng phẳng chèn xuyên qua tường, không có khung (frame), không có nan chia ô (mullions/transom), không có độ thụt lùi (window reveal / recess) vào tường, không có bậu cửa (sill).
- Cửa đi chỉ là một tấm box phẳng màu nâu cắm vào tường hành lang, thiếu khung cửa (door jamb) và chiều sâu cánh cửa.
- Lan can hành lang là một khối hộp liền mạch cao 1m mỏng 0.12m chạy suốt chiều dài tầng lầu, trông giống như một bức tường lùn hơn là hệ lan can chấn song sắt trường học.
- Cầu thang hiện chỉ là các bậc thang dạng khối hộp đặc xếp bậc, thiếu lan can tay vịn cầu thang, thiếu dầm chịu lực bản thang.
- Thiếu hệ dầm đỡ (structural beams / lintels) liên kết giữa các đầu cột hành lang và trần nhà, khiến các tầng trông như bị rỗng trơ trụi giữa các cột.
- Mái tòa nhà chỉ là một tấm slab với 4 dải tường bao parapet thấp đơn điệu, thiếu gờ giọt nước, mũ tường parapet (coping), ô văng / mái hắt chống nắng (eyebrow / sunshade canopy) đặc trưng của trường học vùng nhiệt đới miền Trung.

---

## 2. Vấn đề cần giải quyết (Problems & Objectives)
1. **Thiếu chiều sâu thị giác (Lack of Architectural Depth):** Bề mặt tường và kính nằm cùng một phẳng hoặc lồi ra lộn xộn; cần tạo hốc cửa sâu 6–8cm vào tường để khi ánh sáng đổ xuống hoặc camera xoay góc nghiêng, bóng đổ và viền khung nổi rõ rệt.
2. **Khung cửa & Cửa sổ quá thô sơ:** Cần xây dựng component kiến trúc chuyên nghiệp `ArchitecturalWindow` và `ArchitecturalDoor` với đầy đủ Frame (khung), Glass (kính bóng phản chiếu), Mullions (đố cửa chia ô), Sill (bậu cửa).
3. **Lan can hành lang cần có chấn song:** Lan can trường học thực tế gồm tay vịn (top rail), trụ chính (posts) và các nan song bảo vệ thoáng gió đón sáng.
4. **Cầu thang kiến trúc thật (`ArchitecturalStaircase`):** Gồm bậc thang bậc rỗng/đặc thanh thoát, dầm cọc bản thang (stringer beam), chiếu nghỉ (landing slab) và lan can dốc phát sáng theo bậc.
5. **Hệ kết cấu Cột - Dầm - Sàn - Móng (Structural Assembly):**
   - Chân móng / plinth tạo bệ đỡ cho toàn công trình, nâng sàn trệt cao hơn mặt sân 0.45m với bậc tam cấp (entrance steps) tại các vị trí cầu thang và sảnh chính.
   - Hệ dầm trần hành lang và dầm giằng ngang tạo cảm giác bê tông cốt thép thật.
6. **Mái kiến trúc (`ArchitecturalRoof`):** Nắp mũ parapet (coping trim), mái hắt chống nắng tầng trên cùng, phân biệt rõ khối kỹ thuật mái.
7. **Bảo tồn 100% tính tương thích:** Giữ nguyên vẹn hệ thống tọa độ (`1 unit = 1m`, `metresPerPx = 0.2`, `originPx: [640, 480]`), giữ nguyên Room ID, Building ID, Network Topology và tương thích hoàn hảo với chế độ **Hologram FUI / Transparent Mode**.

---

## 3. Phân tích ảnh tham chiếu (`sodotruong.jpg`)
| Dãy nhà | Số tầng | Trục | Vùng vẽ (px) | Đặc điểm từ ảnh & thực tế |
|---|---|---|---|---|
| **Dãy A** (Dãy C P.25–P.44) | **2 tầng** | Dọc (Y) | 105–235, 112–542 | Dãy học dài nhất phía Nam, 4 cầu thang thông suốt chia đều 5 cụm phòng học. Hành lang quay mặt về hướng Đông (+x) nhìn ra sân trường. |
| **Dãy B** (P.16–P.24, Lab, VP) | **2 tầng** | Dọc (Y) | 378–520, 217–545 | Nằm ở giữa-trái. Trệt gồm phòng thực hành Sinh, CNTT, VP Đoàn, P.TVHĐ, P.TDGP, P. Giáo viên; Lầu 1 gồm các phòng học P.19–P.24. 2 cầu thang. |
| **Dãy C·D** (Bộ môn, Lab, Thư viện) | **3 tầng** | Ngang (X) | 520–1027, 162–272 | Dãy chức năng 3 tầng nằm ngang phía sau sân khấu. Cầu thang trung tâm rộng rãi (x: 760–822). 2 cụm phòng thực hành Lý - Hóa, Tin học I/II, Thư viện, TTTA. Kết nối chữ U với A và B. |
| **Dãy E** (Dãy A P.01–P.12) | **2 tầng** | Dọc (Y) | 1052–1167, 232–508 | Dãy phòng học 2 tầng phía Bắc, 2 cầu thang đối xứng, hành lang hướng Tây (-x) nhìn vào sân trường. |
| **Dãy F** (Khối Hành chính - Hiệu bộ) | **3 tầng** | Dọc (Y) | 987–1207, 543–802 | Khối hành chính bộ mặt của trường, 3 tầng: Y tế, Văn thư, Hội trường/phòng họp lớn, Kế toán, Ban giám hiệu (HT, PHT), Phòng Truyền thống, các phòng tổ bộ môn. 1 cầu thang trung tâm. |

---

## 4. Hệ thống tỷ lệ & Architectural Scales
- **Đơn vị:** 1 unit 3D = 1 mét (m).
- **Chiều cao tầng chuẩn:** 3.6m.
- **Sàn bê tông chịu lực (Floor Slab):** dày 0.25m, mép sàn nhô nhẹ 0.05m tạo chỉ phân tầng sắc nét.
- **Tường ngoài (Exterior Walls):** dày 0.20m.
- **Tường hành lang (Corridor Walls):** dày 0.18m.
- **Vách ngăn phòng (Interior Partitions):** dày 0.12m.
- **Khung cửa đi (`ArchitecturalDoor`):**
  - Kích thước: Rộng 1.1m, Cao 2.3m.
  - Khuôn bao (jamb): dày 0.08m, viền nổi 0.03m.
  - Cánh cửa: âm lùi vào trong khuôn 0.04m, tay nắm inox mạ bóng tối giản.
- **Cửa sổ (`ArchitecturalWindow`):**
  - Phòng học: Rộng 1.6m, Cao 1.5m, cách sàn (sill height) 0.9m.
  - Khuôn cửa lùi sâu 0.06m tạo góc vát bóng đổ (window recess).
  - Khung nhôm/sắt 0.05m, đố ngang (transom) chia ô chớp thoáng phía trên cao 0.35m, 2 cánh kính phía dưới chia bởi đố dọc (mullion).
  - Bậu cửa sổ (window sill) nhô nhẹ 0.04m ra ngoài tạo chi tiết gờ chỉ kiến trúc.
- **Cầu thang (`ArchitecturalStaircase`):**
  - Chiều rộng bản thang: 1.4m - 1.6m.
  - Chiều cao bậc: 0.18m, mặt bậc rộng: 0.28m (chuẩn công thái học trường học).
  - Chiếu nghỉ giữa tầng rộng 1.5m, dầm đỡ bản thang 0.25m x 0.35m.
  - Lan can tay vịn cao 0.95m nghiêng theo góc thang.
- **Lan can hành lang (`ArchitecturalRailing`):**
  - Chiều cao tổng: 1.05m.
  - Tay vịn trên cùng (top rail): ống chữ nhật bo tròn nhẹ.
  - Trụ đứng chịu lực: mỗi nhịp 1.2m - 1.5m.
  - Hệ nan chấn song sắt đứng cách nhau 0.12m an toàn cho học sinh.
- **Cột & Dầm (`Columns & Beams`):**
  - Cột hành lang: tiết diện vuông 0.35m x 0.35m, đế cột chân bệ 0.40m x 0.40m.
  - Dầm dọc hành lang (Longitudinal Beam): 0.25m x 0.40m chạy dưới mép slab.

---

## 5. Chiến lược vật liệu (Material Strategy)
### 5.1. Normal / Architectural Mode
- `MATERIALS.exterior`: Màu vàng kem trường học Việt Nam cao cấp (`#eed99f`), chân tường ốp gạch gốm sẫm màu chống ẩm mốc (`#7c6f5e`).
- `MATERIALS.corridorWall`: Màu kem sáng dịu mắt (`#faebd2`).
- `MATERIALS.partition`: Màu trắng sứ ấm (`#f8fafc`).
- `MATERIALS.slab`: Bê tông xám sáng thanh lịch (`#cbd5e1`), chỉ gờ bo viền đậm hơn (`#94a3b8`).
- `MATERIALS.windowFrame`: Khung kim loại ghi xám đậm (`#334155`).
- `MATERIALS.glass`: Kính xanh nhạt có độ phản quang bóng (`color: #7dd3fc, opacity: 0.72, roughness: 0.08, metalness: 0.45`).
- `MATERIALS.door`: Gỗ tự nhiên sơn bóng chống ẩm (`#78350f` / `#92400e`), tay nắm kim loại sáng (`#e2e8f0`).
- `MATERIALS.railing`: Kim loại sơn xanh navy hoặc ghi xám sẫm (`#1e293b`).
- `MATERIALS.stairs`: Đá mài granite xám tro bền bỉ (`#64748b`).
- `MATERIALS.roof`: Mái ngói/mái bằng gờ viền sắc sảo màu đỏ gạch đất nung (`#b91c1c` / `#c2410c`).

### 5.2. Transparent / Hologram Mode
- Toàn bộ kết cấu kiến trúc chi tiết (khung cửa sổ, khuôn cửa đi, bậc thang, nan lan can, dầm, cột) đều được ánh xạ tự động vào bộ vật liệu holographic:
  - `HOLO_MATERIALS.wall`: Thân tường mờ trong suốt cyan nhạt.
  - `HOLO_MATERIALS.floorEdge`, `HOLO_MATERIALS.edge`: Đường viền khung cửa, dầm trần, mép sàn phát sáng neon electric cyan (`#00e5ff`).
  - `HOLO_MATERIALS.stairEdge`: Phát sáng các bậc thang và lan can cầu thang tạo đường dẫn luồng giao thông rõ rệt.

---

## 6. Chiến lược Camera Presets
Bổ sung các preset chuyển động mượt mà trong CameraRig / Store:
1. **Campus Overview:** Góc nhìn 45 độ bao quát toàn bộ ngôi trường và Quốc lộ 1A.
2. **Building Focus:** Zoom cận cảnh tòa nhà đang chọn, camera tự động hạ thấp và nhìn vào mặt đứng chính.
3. **Floor Level View:** Camera hạ độ cao xuống đúng cao độ sàn (eye-level 1.7m trên sàn), nhìn thẳng vào dãy hành lang và các phòng học.
4. **Interior View:** Đi vào tâm phòng học / phòng chức năng đang chọn.
5. **Top Plan View:** Nhìn thẳng đứng 90 độ xuống để đối chiếu chuẩn xác với bản vẽ sơ đồ 2D gốc.
6. **Architectural Orbit:** Tự động xoay chậm quanh tòa nhà được chọn để phô diễn trọn vẹn chiều sâu kiến trúc 3D.

---

## 7. Chiến lược hiệu năng (Performance Strategy)
- Sử dụng mô hình hình học gom cụm (Geometry Merging) hoặc Instancing cho các chi tiết lặp lại nhiều lần (chấn song lan can, nan cửa sổ, bậc thang).
- Tách biệt rõ ràng các tầng để cơ chế Floor Isolation & Explode View hoạt động mượt mà ở 60 FPS.
- Tận dụng `useMemo` tính toán trước tọa độ và chỉ cập nhật khi dữ liệu thay đổi.
- Thư viện Three.js / React Three Fiber giữ nguyên bộ shader nhẹ nhàng, không gây giật lag trên máy phổ thông.

---

## 8. Thứ tự triển khai (Implementation Order)
1. **Tạo tài liệu kế hoạch:** `ARCHITECTURE-UPGRADE-PLAN.md` (hoàn thành).
2. **Nâng cấp `src/lib/geometry/building-layout.ts`:**
   - Mở rộng data structure: bổ sung `beams`, `doorFrames`, `windowFrames`, `windowMullions`, `windowSills`, `stairRailings`, `railingPosts`, `balusters`, `plinth`, `entranceSteps`.
   - Tính toán chi tiết chiều sâu thụt lùi (recess), bậu cửa (sill), khung cửa (frame) cho từng phòng.
   - Xây dựng thuật toán tạo nhịp cửa sổ chuẩn theo mặt đứng thực tế cho từng Dãy (A, B, CD, E, F).
   - Thiết kế kết cấu cầu thang thật gồm bậc thang, dầm bản thang và lan can nghiêng.
3. **Cập nhật `src/lib/3d/materials.ts`:**
   - Thêm các vật liệu kiến trúc mới: `windowFrame`, `windowSill`, `doorFrame`, `plinth`, `beam`, `railingPost`.
4. **Nâng cấp `src/components/floors/FloorMesh.tsx`:**
   - Tích hợp render đầy đủ các lớp kiến trúc chi tiết cho cả Normal Mode và Transparent/Hologram Mode.
   - Thêm các đường edge viền cho khung cửa, dầm, bậc thang trong chế độ Hologram.
5. **Nâng cấp `src/components/buildings/BuildingMesh.tsx`:**
   - Render mái kiến trúc có gờ mũ parapet, móng bệ đỡ (plinth) và sảnh đón (entrance).
6. **Nâng cấp Camera Controller & Presets:**
   - Hỗ trợ đầy đủ các góc nhìn kiến trúc chuyên nghiệp: Overview, Building, Floor, Interior, Top, Orbit.
7. **Kiểm tra, biên dịch (`tsc -b && vite build`), kiểm tra hiệu năng và dev server.**
8. **Viết báo cáo nghiệm thu:** `ARCHITECTURE-UPGRADE-REPORT.md`.
