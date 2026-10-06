# KẾ HOẠCH TÍCH HỢP SƠ ĐỒ MẠNG VÀO DIGITAL TWIN 3D
**Dự án**: Trường THPT Số 1 Tư Nghĩa — 3D Digital Twin  
**Tài liệu**: NETWORK-INTEGRATION-PLAN.md  
**Nguồn phân tích**: Ảnh `sodomang.jpg` ("Sơ đồ mạng máy tính Tư Nghĩa 1") đối chiếu mặt bằng kiến trúc `sodotruong.jpg`  
**Ngày lập**: 05/10/2026  
**Trạng thái**: Kế hoạch chi tiết trước khi triển khai mã nguồn  

---

## MỤC LỤC
1. [A. Phân tích ảnh sơ đồ mạng (Image Analysis)](#a-phân-tích-ảnh-sơ-đồ-mạng-image-analysis)
2. [B. Đối chiếu kiến trúc & Định vị không gian (Architecture Mapping)](#b-đối-chiếu-kiến-trúc--định-vị-không-gian-architecture-mapping)
3. [C. Các hạng mục chưa khớp / Thiếu thông tin (Unresolved Items)](#c-các-hạng-mục-chưa-khớp--thiếu-thông-tin-unresolved-items)
4. [D. Cấu trúc mô hình dữ liệu (Data Model Changes)](#d-cấu-trúc-mô-hình-dữ-liệu-data-model-changes)
5. [E. Thành phần 3D trực quan hóa (3D Visualization Changes)](#e-thành-phần-3d-trực-quan-hóa-3d-visualization-changes)
6. [F. Giao diện người dùng & Điều khiển (UI Changes)](#f-giao-diện-người-dùng--điều-khiển-ui-changes)
7. [G. Chiến lược tọa độ & Định tuyến cáp (Coordinate & Cable Routing Strategy)](#g-chiến-lược-tọa-độ--định-tuyến-cáp-coordinate--cable-routing-strategy)
8. [H. Lộ trình triển khai (Execution Roadmap)](#h-lộ-trình-triển-khai-execution-roadmap)

---

## A. PHÂN TÍCH ẢNH SƠ ĐỒ MẠNG (IMAGE ANALYSIS)

### 1. Thông tin tệp nguồn
- **File**: `sodomang.jpg` (kích thước gốc ~1000×800 px, nằm tại thư mục gốc dự án).
- **Tiêu đề sơ đồ**: **"Sơ đồ mạng máy tính Tư Nghĩa 1"**.
- **Quy ước chú giải (Legend) trong ảnh**:
  - 🟠 **VNPT**: Điểm cấp dịch vụ Internet / Modem Gateway nhà mạng.
  - 🔵 **Router**: Ký hiệu hộp chữ nhật xanh lam có ăng-ten (định tuyến phân đoạn mạng).
  - 🟢 **Hub / Switch**: Ký hiệu hộp xanh lá cây có các cổng kết nối mạng.
  - 🟣 **WAP**: Wireless Access Point (Điểm phát sóng WiFi không dây).
  - 🖥️ **Tivi**: Biểu tượng màn hình TV thông minh / tương tác.
  - 💻 **Máy tính**: Biểu tượng máy tính PC để bàn.
  - 📷 **Camera**: Biểu tượng camera giám sát an ninh.
  - ⬛ **Phòng**: Khung viền góc bo tròn đen (P.19, P.20, P. máy 1...).
  - ── **Liên kết thiết bị**: Đường nét liền màu đen (kết nối vật lý nội bộ thiết bị).
  - ╌╌ **Kết nối phòng**: Đường nét đứt màu đen (đường dây cáp nối giữa các phòng / tầng / dãy).

---

### 2. Phân tích Topology theo cụm mạng (Subnets)

Hệ thống mạng trong ảnh chia thành **2 phân vùng chính (2 đường Internet VNPT độc lập)**:

#### Phân vùng 1: Cụm Dãy B & Các phòng thực hành (Dãy C·D)
- **Nguồn cấp Internet**: `VNPT (Dãy B)`.
- **Nhánh 1 — Các phòng học Lầu 1 Dãy B**:
  - `VNPT` nối tới **3 Router con phụ trách từng cặp phòng**:
    - **Router B-1**: Cấp mạng cho `P.19` (1 PC, 1 Camera) và `P.20` (1 PC, 1 Camera).
    - **Router B-2**: Cấp mạng cho `P.21` (1 PC, 1 Camera) và `P.22` (1 PC, 1 Camera).
    - **Router B-3**: Cấp mạng cho `P.23` (1 PC, 1 Camera) và `P.24` (1 PC, 1 Camera).
- **Nhánh 2 — Cụm phòng bộ môn & thực hành**:
  - `VNPT` nối tới `Hub 1` (đóng vai trò Core Hub phân phối sang các phòng chức năng):
    - Tuyến 1: `Hub 1` ➔ **Phòng máy 1**: Nối tới `Router VNPT (PM1)` ➔ Phân phối vào 3 bộ chia `Switch 1`, `Switch 2`, `Switch 3` ➔ Nuôi **37 máy tính học sinh**.
    - Tuyến 2: `Hub 1` ➔ **Phòng máy 2**: Nối tới `Router VNPT (PM2)` ➔ Phân phối vào 3 bộ chia `Switch 1`, `Switch 2`, `Switch 3` ➔ Nuôi dàn máy tính phòng 2.
    - Tuyến 3: `Hub 1` ➔ **Máy tính phòng Thư viện** (1 máy tính / trạm quản lý).
    - Tuyến 4: `Hub 1` ➔ **Máy tính phòng TH Vật lí (tầng 1)** (1 máy tính).

#### Phân vùng 2: Cụm Dãy A (Building E trong mô hình 3D - Khối 2 tầng phía Bắc)
- **Nguồn cấp Internet**: `VNPT (Dãy A)`.
- **Nhánh Tầng 2 (Lầu 1)**:
  - `VNPT (Dãy A)` nối tới:
    - **Hub 2**:
      - Cấp cho 1 bộ phát WiFi: `WAP`.
      - Cấp cáp cho 3 phòng học: `P.07` (1 PC, 1 Camera), `P.08` (1 PC, 1 Camera), `P.09` (1 PC, 1 Camera).
    - **Hub 3**:
      - Nối qua 1 `Router VNPT (Dãy A Tầng 2)`.
      - Cấp cáp cho 3 phòng học: `P.10` (1 PC, 1 Camera), `P.11` (1 PC, 1 Camera), `P.12` (1 PC, 1 Camera).
- **Nhánh Tầng 1 (Trệt)**:
  - `VNPT (Dãy A)` kéo đường trục (trunk cable) xuống tầng 1 vào **Hub 5**:
    - **Hub 5**: Cấp cho `P.01` (1 PC, 1 Camera) và `P.02` (1 PC, 1 Camera).
    - Đồng thời nối tầng (cascade) sang **Hub 4**.
    - **Hub 4**: Cấp cho 4 phòng học: `P.03`, `P.04`, `P.05`, `P.06` (mỗi phòng 1 PC, 1 Camera).

---

### 3. Bảng phân loại thiết bị mạng (Network Inventory Table)

| STT | Mã Node ID | Loại (Type) | Nhãn (Label) | Nối từ (From) | Nối tới (Connected To) | Nguồn trích xuất | Độ tin cậy |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `gw-vnpt-b` | ROUTER / ISP | VNPT Gateway (Dãy B) | ISP Cáp quang ngoài | `r-b-p19-p20`, `r-b-p21-p22`, `r-b-p23-p24`, `hub-1` | `sodomang.jpg` | High |
| 2 | `r-b-p19-p20` | ROUTER | Router P19-P20 | `gw-vnpt-b` | P19 (PC, Cam), P20 (PC, Cam) | `sodomang.jpg` | High |
| 3 | `r-b-p21-p22` | ROUTER | Router P21-P22 | `gw-vnpt-b` | P21 (PC, Cam), P22 (PC, Cam) | `sodomang.jpg` | High |
| 4 | `r-b-p23-p24` | ROUTER | Router P23-P24 | `gw-vnpt-b` | P23 (PC, Cam), P24 (PC, Cam) | `sodomang.jpg` | High |
| 5 | `hub-1` | HUB | Hub 1 (Trung tâm chức năng) | `gw-vnpt-b` | `r-cd-pm1`, `r-cd-pm2`, PC Thư viện, PC TH Lý | `sodomang.jpg` | High |
| 6 | `r-cd-pm1` | ROUTER | Router Phòng Máy 1 | `hub-1` | `sw-pm1-1`, `sw-pm1-2`, `sw-pm1-3` | `sodomang.jpg` | High |
| 7 | `sw-pm1-1` | SWITCH | Switch 1 (Phòng Máy 1) | `r-cd-pm1` | Dàn PC PM1 (nhánh 1) | `sodomang.jpg` | High |
| 8 | `sw-pm1-2` | SWITCH | Switch 2 (Phòng Máy 1) | `r-cd-pm1` | Dàn PC PM1 (nhánh 2) | `sodomang.jpg` | High |
| 9 | `sw-pm1-3` | SWITCH | Switch 3 (Phòng Máy 1) | `r-cd-pm1` | Dàn PC PM1 (nhánh 3 - tổng 37 máy) | `sodomang.jpg` | High |
| 10 | `r-cd-pm2` | ROUTER | Router Phòng Máy 2 | `hub-1` | `sw-pm2-1`, `sw-pm2-2`, `sw-pm2-3` | `sodomang.jpg` | High |
| 11 | `sw-pm2-1` | SWITCH | Switch 1 (Phòng Máy 2) | `r-cd-pm2` | Dàn PC PM2 (nhánh 1) | `sodomang.jpg` | High |
| 12 | `sw-pm2-2` | SWITCH | Switch 2 (Phòng Máy 2) | `r-cd-pm2` | Dàn PC PM2 (nhánh 2) | `sodomang.jpg` | High |
| 13 | `sw-pm2-3` | SWITCH | Switch 3 (Phòng Máy 2) | `r-cd-pm2` | Dàn PC PM2 (nhánh 3) | `sodomang.jpg` | High |
| 14 | `gw-vnpt-a` | ROUTER / ISP | VNPT Gateway (Dãy A) | ISP Cáp quang ngoài | `hub-2`, `hub-3`, `hub-5` (trục tầng 1) | `sodomang.jpg` | High |
| 15 | `hub-2` | HUB | Hub 2 (Dãy A - Lầu 1) | `gw-vnpt-a` | `wap-a-t2`, P07, P08, P09 | `sodomang.jpg` | High |
| 16 | `wap-a-t2` | ACCESS_POINT | WAP (WiFi Dãy A Lầu 1) | `hub-2` | Phủ sóng WiFi Lầu 1 | `sodomang.jpg` | High |
| 17 | `hub-3` | HUB | Hub 3 (Dãy A - Lầu 1) | `gw-vnpt-a` | `r-a-t2`, P10, P11, P12 | `sodomang.jpg` | High |
| 18 | `r-a-t2` | ROUTER | Router Dãy A Tầng 2 | `hub-3` | Tuyến bảo mật nội bộ tầng 2 | `sodomang.jpg` | High |
| 19 | `hub-5` | HUB | Hub 5 (Dãy A - Trệt) | `gw-vnpt-a` | `hub-4`, P01, P02 | `sodomang.jpg` | High |
| 20 | `hub-4` | HUB | Hub 4 (Dãy A - Trệt) | `hub-5` | P03, P04, P05, P06 | `sodomang.jpg` | High |
| 21..38 | End Devices | PC & CAMERA | 18 PC + 18 Cam (P01-P12, P19-P24) | Switch/Hub/Router tương ứng | Thiết bị đầu cuối tại phòng học | `sodomang.jpg` | High |

---

## B. ĐỐI CHIẾU KIẾN TRÚC & ĐỊNH VỊ KHÔNG GIAN (ARCHITECTURE MAPPING)

Dựa trên dữ liệu hình học thực tế tại `src/data/buildings/` của mô hình Digital Twin:

### 1. Phân vùng Dãy B (`building-b`)
*Đặc điểm mô hình*: Trục Y, 2 tầng (Trệt = `level 0`, Lầu 1 = `level 1`).
- **`gw-vnpt-b` (VNPT Dãy B)**:
  - Tòa: `building-b`
  - Tầng: `building-b-floor-2` (Lầu 1 / Tầng 2)
  - Phòng: Đặt tại hành lang / phòng CNTT hoặc hộp kỹ thuật trung tâm giữa dãy B.
- **Router `r-b-p19-p20`**:
  - Tòa: `building-b`, Tầng 2 (`building-b-floor-2`)
  - Vị trí: Vách ngăn chung giữa `room-p19` và `room-p20`.
- **Router `r-b-p21-p22`**:
  - Tòa: `building-b`, Tầng 2 (`building-b-floor-2`)
  - Vị trí: Vách ngăn chung giữa `room-p21` và `room-p22`.
- **Router `r-b-p23-p24`**:
  - Tòa: `building-b`, Tầng 2 (`building-b-floor-2`)
  - Vị trí: Vách ngăn chung giữa `room-p23` và `room-p24`.
- **Thiết bị đầu cuối**:
  - `room-p19`: 1 PC giáo viên, 1 Camera quan sát lớp.
  - `room-p20`: 1 PC giáo viên, 1 Camera quan sát lớp.
  - `room-p21`: 1 PC giáo viên, 1 Camera quan sát lớp.
  - `room-p22`: 1 PC giáo viên, 1 Camera quan sát lớp.
  - `room-p23`: 1 PC giáo viên, 1 Camera quan sát lớp.
  - `room-p24`: 1 PC giáo viên, 1 Camera quan sát lớp.

### 2. Phân vùng Cụm Dãy C·D (`building-cd`)
*Đặc điểm mô hình*: Trục X, 3 tầng (Trệt, Lầu 1, Lầu 2), nằm ngang sau sân khấu.
- **`hub-1`**:
  - Tòa: `building-b` hoặc hộp chuyển tiếp cáp tại hành lang cầu nối sang `building-cd`.
  - Cáp đi qua hành lang có mái che nối giữa Dãy B và Dãy CD.
- **Phòng Máy 1**:
  - Tòa: `building-cd`, Tầng 2 (`building-cd-floor-2`, Lầu 1)
  - Phòng: `room-c-vi-tinh-1` (P. Vi tính I)
  - Thiết bị: 1 Router + 3 Switch đặt trong Tủ rack mạng treo tường + 37 PC học sinh.
- **Phòng Máy 2**:
  - Tòa: `building-cd`, Tầng 2 (`building-cd-floor-2`, Lầu 1)
  - Phòng: `room-c-vi-tinh-2` (P. Vi tính II)
  - Thiết bị: 1 Router + 3 Switch đặt trong Tủ rack mạng + Dàn PC học sinh.
- **Thư viện**:
  - Tòa: `building-cd`, Tầng 2 (`building-cd-floor-2`, Lầu 1)
  - Phòng: `room-d-thu-vien` (Thư viện)
  - Thiết bị: 1 PC thủ thư / tra cứu.
- **Phòng Thực hành Vật lí**:
  - Tòa: `building-cd`, Tầng 1 (`building-cd-floor-1`, Trệt)
  - Phòng: `room-d-th-ly` (P. Thực hành Lý - tầng 1 ghi chú rõ trong ảnh)
  - Thiết bị: 1 PC quản lý thí nghiệm.

### 3. Phân vùng Dãy A (`building-e`)
*Đặc điểm mô hình*: Khối 2 tầng phía Bắc khuôn viên, mã hệ thống `building-e`, tên hiển thị `Dãy A · P.01 – P.12`.
- **`gw-vnpt-a` (VNPT Dãy A)**:
  - Tòa: `building-e`, Tầng 2 (`building-e-floor-2`)
  - Vị trí: Đặt tại hộp kỹ thuật đầu dãy / hành lang Lầu 1.
- **Tầng 2 (Lầu 1 - `building-e-floor-2`)**:
  - `hub-2`: Cụm phòng P.07 – P.09.
  - `wap-a-t2`: Điểm truy cập WiFi treo trần hành lang giữa P.07 và P.09.
  - `hub-3`: Cụm phòng P.10 – P.12.
  - `r-a-t2`: Đặt cùng tủ mạng với `hub-3`.
  - Các phòng: `room-p07`, `room-p08`, `room-p09`, `room-p10`, `room-p11`, `room-p12` (mỗi phòng 1 PC + 1 Camera).
- **Tầng 1 (Trệt - `building-e-floor-1`)**:
  - Đường cáp trục chính (Trunk) từ `gw-vnpt-a` tầng 2 đi qua hố cáp/cầu thang xuống trệt.
  - `hub-5`: Phụ trách `room-p01` và `room-p02`.
  - `hub-4`: Phụ trách `room-p03`, `room-p04`, `room-p05`, `room-p06`.
  - Các phòng: `room-p01` đến `room-p06` (mỗi phòng 1 PC + 1 Camera).

---

## C. CÁC HẠNG MỤC CHƯA KHỚP / THIẾU THÔNG TIN (UNRESOLVED ITEMS)

Nhằm tuân thủ nguyên tắc Digital Twin chính xác, không tự suy diễn:

1. **Dãy C (Khối phòng học P.25 – P.44 / `building-a`)**:
   - **Tình trạng**: **OMITTED IN SOURCE (UNRESOLVED)**.
   - **Lý do**: Ảnh `sodomang.jpg` hoàn toàn không thể hiện mạng của Dãy C (P.25 đến P.44). Có khả năng dãy này dùng mạng riêng, 4G, hoặc chưa được vẽ vào bản đồ mạng đợt 1.
   - **Giải pháp**: Đánh dấu trạng thái `UNMAPPED` trong hệ thống, không tự bịa thiết bị hay đường cáp cho Dãy C.

2. **Dãy F (Khối Hiệu bộ / Hành chính / `building-f`)**:
   - **Tình trạng**: **OMITTED IN SOURCE (UNRESOLVED)**.
   - **Lý do**: Không có trong `sodomang.jpg`.
   - **Giải pháp**: Ghi chú rõ nguồn tài liệu, không tự ý thêm thiết bị nếu không có bản vẽ.

3. **Chủng loại Switch / Router cụ thể & Địa chỉ IP Subnet**:
   - Ảnh sơ đồ thể hiện dạng sơ đồ logic thiết bị (Hub/Switch, Router, PC). Không có IP, MAC, VLAN ID, Model phần cứng (Cisco, TP-Link, MikroTik...).
   - **Giải pháp**: Thiết lập schema cho phép mở rộng IP/MAC/Model trong tương lai; hiện tại hiển thị các thông số đã xác thực từ ảnh.

---

## D. CẤU TRÚC MÔ HÌNH DỮ LIỆU (DATA MODEL CHANGES)

Tạo file mới chuyên biệt: `src/data/network/network-topology.ts` và `src/types/network.ts`:

```typescript
// src/types/network.ts
import { Provenance } from './school';

export type NetworkDeviceType = 
  | 'isp-gateway'
  | 'router'
  | 'switch'
  | 'hub'
  | 'access-point'
  | 'pc'
  | 'camera'
  | 'smart-tv'
  | 'server-rack';

export interface NetworkLocation {
  buildingId: string;
  floorId: string;
  roomId?: string;
  /** Tọa độ tương đối trong phòng [x, y, z] tính theo mét */
  localPosition: [number, number, number];
}

export interface NetworkDevice {
  id: string;
  code: string;               // Ví dụ: "R-B-01", "HUB-1"
  label: string;              // Tên hiển thị tiếng Việt
  type: NetworkDeviceType;
  location: NetworkLocation;
  portsCount?: number;
  metadata?: {
    ipRange?: string;
    vlan?: number;
    notes?: string;
  };
  provenance: Provenance;
}

export type CableMedium = 'utp-cat6' | 'fiber-optics' | 'wireless';
export type CableTopologyType = 'straight' | 'orthogonal' | 'building-to-building' | 'riser';

export interface NetworkCableConnection {
  id: string;
  fromDeviceId: string;
  toDeviceId: string;
  medium: CableMedium;
  routingType: CableTopologyType;
  /** Danh sách tọa độ 3D trung gian (waypoints) để uốn cáp theo hành lang / cầu nối */
  waypoints?: [number, number, number][];
  provenance: Provenance;
}

export interface NetworkTopologyData {
  version: string;
  sourceImage: string;
  devices: NetworkDevice[];
  connections: NetworkCableConnection[];
}
```

---

## E. THÀNH PHẦN 3D TRỰC QUAN HÓA (3D VISUALIZATION CHANGES)

### 1. Trực quan hóa thiết bị mạng (Clean Technical 3D Objects)
Tránh model nặng gây giật lag web, tạo các module hình học kỹ thuật tối giản (clean high-tech visuals):
- **Router**: Hộp dẹt màu xanh lam đậm với 2-4 thanh ăng-ten mảnh và đèn LED nhấp nháy xanh.
- **Switch / Hub**: Khối chữ nhật màu xanh lục kỹ thuật với dải LED port phát sáng nhẹ (`emissive`).
- **WAP (Access Point)**: Đĩa tròn ốp trần màu trắng/tím nhạt với vòng tròn sóng wifi bán trong suốt (alpha halo).
- **PC & Monitor**: Mô hình bàn máy tính tối giản màu xám đậm.
- **Camera**: Hình bán cầu / trụ nhỏ màu trắng gắn góc tường trần.
- **Tủ Rack / Gateway VNPT**: Tủ kỹ thuật kim loại kính viền cam VNPT.

### 2. Trực quan hóa đường cáp (Procedural 3D Cables)
- Sử dụng đường ống cáp kỹ thuật (3D Tube/Extrusion hoặc Polyline phát sáng):
  - Cáp mạng Cat6 nội bộ: Đường ống mảnh màu xanh lơ / xanh dương neon (`#00e5ff`).
  - Tuyến cáp quang ngoài / liên tòa (Building-to-Building): Cáp màu cam VNPT (`#ff6f00`).
  - Sóng kết nối WiFi (WAP): Vòng cung nét đứt bán trong suốt.
- Hiệu ứng tương tác:
  - Mặc định: Nét cáp mảnh, độ mờ 70%, hòa hợp với kiến trúc 3D.
  - Hover chuột vào thiết bị/dây: Dây phát sáng nổi bật (`bloom/emissive`), highlight toàn bộ chuỗi thiết bị liên quan đến đường truyền đó.

---

## F. GIAO DIỆN NGƯỜI DÙNG & ĐIỀU KHIỂN (UI CHANGES)

1. **Toggle Switch Layer trên Thanh công cụ (Header / ViewModeSelector)**:
   - Thêm nút bật/tắt **"Mạng & CNTT"** (Network Layer).
   - Khi OFF: Ẩn hoàn toàn thiết bị và cáp mạng, trả lại mô hình trường học kiến trúc thuần túy.
   - Khi ON: Hiện toàn bộ mạng lưới thiết bị và đường cáp 3D. Có chế độ "X-Ray / Bán trong suốt tòa nhà" để nhìn xuyên tường thấy thiết bị và cáp đi trong phòng.

2. **Bảng Network Inspector (Bên phải màn hình)**:
   - Khi click vào bất kỳ thiết bị mạng nào (Router, Switch, PC, Camera):
     - Tiêu đề: **THIẾT BỊ MẠNG (NETWORK DEVICE)**
     - Tên & Mã: `[R-01] Router VNPT Dãy B (P19-P20)`
     - Phân loại: `Router`
     - Vị trí không gian: `Dãy B ➔ Lầu 1 ➔ P.19 - P.20`
     - Thiết bị thượng tầng (Upstream): `VNPT Gateway`
     - Thiết bị hạ tầng (Downstream): `PC P.19, Camera P.19, PC P.20, Camera P.20`
     - Minh chứng (Source): `sodomang.jpg` (kèm nút xem lát cắt ảnh gốc).

3. **Chế độ 2D Topology Modal ("Sơ đồ Topology 2D")**:
   - Nút bấm "Xem Sơ đồ mạng 2D" trên thanh điều hướng.
   - Hiển thị cây cấu trúc mạng phân cấp tương tác (Interactive Tree / Graph layout).
   - Sử dụng **CÙNG MỘT NGUỒN DỮ LIỆU** (`network-topology.ts`) với mô hình 3D. Khi click một node trên 2D Topology, có nút "Xem vị trí 3D" để camera tự bay (fly-to) đến căn phòng chứa thiết bị đó trong không gian 3D.

4. **Bộ lọc thiết bị (Network Filters & Legend)**:
   - Lọc nhanh theo loại: `[x] Router`, `[x] Switch/Hub`, `[x] Access Point`, `[x] Camera`, `[x] PC`.
   - Lọc theo Dãy: `Dãy A`, `Dãy B`, `Dãy C·D`.

---

## G. CHIẾN LƯỢC TỌA ĐỘ & ĐỊNH TUYẾN CÁP (COORDINATE & CABLE STRATEGY)

### 1. Hệ tọa độ chuẩn hóa
- Áp dụng triệt để kiến trúc:  
  $$\text{WorldPosition} = \text{BuildingOrigin} + \text{FloorElevation} + \text{RoomLocalOffset} + \text{DeviceOffset}$$
- Tọa độ thiết bị là `localPosition` trong phòng:
  - Nếu phòng được di chuyển hoặc tòa nhà được hiệu chỉnh vị trí, toàn bộ Router, Switch, PC bên trong tự động dịch chuyển chính xác theo, không bị lệch.

### 2. Tuyến cáp thực tế (Cable Conduit & Trays)
Không vẽ cáp xuyên tường/xuyên sàn bừa bãi:
1. **Nội bộ phòng (Intra-room)**: Đi từ thiết bị ➔ Ống ghen dọc tường ➔ Khay cáp trần phòng.
2. **Hành lang cùng tầng (Corridor Cable Tray)**: Tập kết ra máng cáp treo dọc trần hành lang.
3. **Liên tầng (Floor-to-Floor Riser)**: Đi qua hộp gen kỹ thuật cạnh buồng thang bộ.
4. **Liên tòa nhà (Building-to-Building)**:
   - Từ Dãy B sang Dãy C·D: Chạy dọc theo phần mái che/hành lang chữ U (`ConnectingCorridorsU`) vừa xây dựng.
   - Tuyến cáp ngoài trời được luồn ống bọc bảo vệ chuyên dụng màu cam đậm.

---

## H. LỘ TRÌNH TRIỂN KHAI (EXECUTION ROADMAP)

- [ ] **Giai đoạn 1**: Tạo cấu trúc dữ liệu mạng chuẩn tại `src/data/network/network-topology.ts` và tích hợp ánh xạ chuẩn theo bảng phân tích ở Mục A và B.
- [ ] **Giai đoạn 2**: Xây dựng component 3D `Network3DLayer.tsx` hiển thị thiết bị (Routers, Switches, WAPs, PCs, Cameras) với vật liệu phát sáng nhẹ và icon trực quan.
- [ ] **Giai đoạn 3**: Xây dựng thuật toán tạo tuyến cáp trực giao (orthogonal cable routing) chạy theo máng trần và hành lang liên tòa.
- [ ] **Giai đoạn 4**: Tích hợp UI điều khiển: Nút bật/tắt Layer Mạng, Bộ lọc thiết bị, Bảng Inspector tra cứu thông tin chi tiết từng node.
- [ ] **Giai đoạn 5**: Tích hợp Modal xem Topology 2D đồng bộ hai chiều với mô hình 3D.

---
*Tài liệu này được lập làm cơ sở đối chiếu và cam kết chất lượng trước khi tiến hành viết code.*
