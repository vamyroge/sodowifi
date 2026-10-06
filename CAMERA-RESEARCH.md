# NGHIÊN CỨU & THIẾT KẾ HỆ THỐNG CAMERA + VIEW CONTROL CHO 3D DIGITAL TWIN TRƯỜNG HỌC
**Dự án**: Digital Twin 3D THPT Số 1 Tư Nghĩa  
**Tác giả**: Senior 3D Interaction Engineer & UX Specialist  
**Ngày lập**: Tháng 10/2026  

---

## 1. MỤC TIÊU & YÊU CẦU CỐT LÕI

Mô hình 3D Digital Twin trường học có đặc tính không gian đặc thù:
* Khuôn viên rộng hàng trăm mét (sân trường, cổng chính QL1A, sân bóng, hồ bơi).
* Các công trình kiến trúc nhiều tầng (Dãy A, B, CD, Hiệu bộ, Nhà xe) với hệ thống phòng học, hành lang, cầu thang và hệ thống hạ tầng mạng (dây cáp, switch, router).
* Đối tượng người dùng đa dạng: Ban giám hiệu, giáo viên, học sinh, phụ huynh và khách tham quan — **đa số không phải là kỹ sư 3D hay game thủ**.

### Tiêu chí vàng:
> **DỄ DÙNG → MƯỢT MÀ → KHÓ BỊ LỆCH GÓC → NHÌN KIẾN TRÚC ĐẸP → ÍT THAO TÁC**

Người dùng lần đầu mở web không cần phải học phím hay đọc sách hướng dẫn:
* **Kéo chuột trái**: Xoay quanh tâm công trình một cách tự nhiên, đường chân trời luôn thẳng đứng, không bao giờ bị lộn ngược.
* **Cuộn chuột**: Thu phóng mượt mà, xa thì lướt nhanh, gần thì tinh tế, không bao giờ xuyên thủng lòng đất hay văng ra vô tận.
* **Click vào bất kỳ tòa nhà, phòng học hay thiết bị**: Camera tự động lướt êm ái tới góc nhìn tối ưu (Auto-framing 3/4 phối cảnh kiến trúc).

---

## 2. PHÂN TÍCH SO SÁNH CÁC MÔ HÌNH CAMERA (CAMERA MODELS)

| Mô hình Camera | Cơ chế hoạt động | Ưu điểm | Nhược điểm trong Digital Twin Kiến trúc | Đánh giá phù hợp |
| :--- | :--- | :--- | :--- | :--- |
| **A. Orbit / Turntable (Chuẩn)** | Xoay quanh một tọa độ tâm (Target) theo hệ tọa độ cầu $(\theta, \phi, r)$, khóa trục thẳng đứng (World Y). | • Rất trực quan, tự nhiên.<br>• Giữ trục thẳng đứng không bị nghiêng lệch.<br>• Rất phù hợp xem khối công trình. | • Nếu dùng mặc định của Three.js, dễ bị trôi Target khi Pan.<br>• Lerp Cartesian khiến camera đâm xuyên đất.<br>• Hardcode góc nhìn làm mất tính linh hoạt. | **9.5/10** (Nền tảng lý tưởng nhất khi được cải tiến Damping & Smart Framing) |
| **B. Arcball Camera** | Xoay tự do trên mặt cầu ảo quaternion 3 trục (như xoay quả cầu thủy tinh trên tay). | • Tự do góc nhìn tối đa.<br>• Xoay được mọi hướng. | • Dễ làm nghiêng đường chân trời (Roll).<br>• Người dùng không chuyên rất dễ bị say xe hoặc mất phương hướng.<br>• Không phù hợp với kiến trúc có phương thẳng đứng cố định. | **3/10** (Không phù hợp) |
| **C. Trackball Camera** | Tương tự Arcball, không có khóa trục cực (no polar constraint). | • Nhẹ, xoay linh hoạt cho phân tích vật thể đơn lẻ (CAD part). | • Scene bị lộn ngược khi qua đỉnh cực.<br>• Mất mốc phương hướng mặt đất của trường học. | **2/10** (Loại) |
| **D. First-Person / Walkthrough (FPS)** | Đặt camera ngang tầm mắt người (1.6m - 1.7m), điều khiển bằng WASD + chuột. | • Cảm giác nhập vai cao khi đi bộ dọc hành lang. | • Thao tác phức tạp, đòi hỏi nhớ nhiều phím.<br>• Không thể bao quát toàn cảnh trường học.<br>• Dễ kẹt tường, kẹt góc hành lang nếu không có Physics engine nặng nề. | **4/10** (Chỉ phù hợp làm chế độ bổ trợ, không thể làm Camera chính) |
| **E. Fly Camera** | Di chuyển tự do trong không gian 6 bậc tự do (6-DOF) như drone bay. | • Di chuyển bao quát mọi vị trí. | • Khó điều khiển chính xác, dễ va chạm.<br>• Quá nhiều thao tác cho người dùng phổ thông. | **3/10** (Loại) |
| **F. Hybrid Model (Tổng hợp)** | Kết hợp Orbit Campus Overview + Click-to-Focus Framing + Preset Views thông minh. | • Đơn giản nhất cho người dùng.<br>• Hệ thống tự tính toán góc nhìn đẹp thay vì bắt người dùng tự xoay.<br>• Tối ưu hiệu năng tuyệt đối. | • Cần thuật toán toán học Auto-framing chính xác. | **10/10 (LỰA CHỌN TỐI ƯU NHẤT)** |

---

## 3. THIẾT KẾ CHI TIẾT CAMERA MODEL ĐƯỢC CHỌN

Chúng tôi chọn mô hình **Target-based Smooth Orbit Camera kết hợp Mathematical Auto-Framing**:

### 3.1. Hệ tọa độ cầu (Spherical Coordinate System)
Camera được điều khiển thông qua bộ 5 tham số không gian:
$$\text{State} = \big( \mathbf{T} = [x_t, y_t, z_t], \; r, \; \theta, \; \phi \big)$$
Trong đó:
* $\mathbf{T}$: Điểm tâm ngắm thông minh (Smart Target Vector).
* $r$: Khoảng cách từ Camera tới Target (Distance/Radius).
* $\theta$: Góc phương vị (Azimuth angle) xoay quanh trục Y ($0 \le \theta < 2\pi$).
* $\phi$: Góc nâng cực (Polar/Elevation angle) so với trục đứng Y ($0 < \phi < \pi$).

Vị trí Camera được chuyển đổi tự nhiên sang tọa độ Cartesian:
$$\begin{aligned}
x_c &= x_t + r \cdot \sin(\phi) \cdot \sin(\theta) \\
y_c &= y_t + r \cdot \cos(\phi) \\
z_c &= z_t + r \cdot \sin(\phi) \cdot \cos(\theta)
\end{aligned}$$

### 3.2. Giới hạn vật lý chống quay loạn (Orientation & Ground Clamping)
Để người dùng tự do khám phá nhưng **không bao giờ bị mất phương hướng hay rơi xuống đất**:
* $\phi_{\min} = 0.05 \text{ rad} \ (\approx 2.9^\circ)$: Tránh hiện tượng Gimbal Lock khi nhìn thẳng từ trên đỉnh xuống.
* $\phi_{\max} = \frac{\pi}{2} - 0.04 \text{ rad} \ (\approx 87.7^\circ)$: Đảm bảo Camera luôn nằm trên mặt đất, không bao giờ chui xuống lòng đất hay nhìn ngược từ đáy lên.
* $r_{\min} = 3.5\text{m}$: Không zoom xuyên thủng bên trong khối bê tông khi ở ngoài.
* $r_{\max} = 220\text{m}$: Ngăn zoom văng quá xa làm mất hình dáng trường học.
* **Soft Pan Clamping**: Điểm ngắm $\mathbf{T}$ chỉ được di chuyển trong phạm vi hộp ranh giới khuôn viên trường $(\Delta X \le 120\text{m}, \Delta Z \le 140\text{m})$. Người dùng không thể vô tình kéo target ra biển hay khoảng không vô định.

---

## 4. CHIẾN LƯỢC AUTO-FRAMING & GÓC PHỐI CẢNH KIẾN TRÚC VÀNG

### 4.1. Không hardcode vị trí (Mathematical Framing)
Khi click vào đối tượng (Building, Floor, Room, Network Device), hệ thống tự động trích xuất:
1. **Bounding Box** $[\mathbf{P}_{\min}, \mathbf{P}_{\max}]$.
2. **Kích thước** $\mathbf{S} = [S_x, S_y, S_z]$.
3. **Bán kính cầu bao quanh (Bounding Sphere Radius)**:
   $$R_{\text{sphere}} = \frac{1}{2} \sqrt{S_x^2 + S_y^2 + S_z^2}$$
4. **Khoảng cách tối ưu dựa trên Camera FOV và khung hình (Aspect Ratio)**:
   $$D_{\text{optimal}} = \frac{R_{\text{sphere}}}{\sin(\text{FOV}_v / 2)} \times K_{\text{margin}}$$
   *Đối với tòa nhà, hệ số an toàn $K_{\text{margin}} = 1.15$ đảm bảo công trình lọt thỏm cân đối giữa màn hình, không bị tràn mép.*

### 4.2. Góc nhìn 3/4 Phối cảnh kiến trúc (The Architectural 3/4 View)
Khác với việc nhìn trực diện (Front View) làm mất chiều sâu, hoặc nhìn từ cạnh hông (Side View) làm mất mặt tiền, góc nhìn tối ưu kiến trúc là:
* **Góc phương vị (Azimuth $\theta$)**: Lệch $35^\circ \sim 45^\circ$ so với trục chính diện của tòa nhà.
* **Góc nâng (Elevation $\phi$)**: Nghiêng khoảng $30^\circ \sim 36^\circ$ so với mặt phẳng ngang.
* **Hiệu quả thị giác**:
  1. Thấy rõ chiều dài **mặt tiền** lớp học.
  2. Thấy rõ **chiều sâu** hồi nhà và hành lang.
  3. Thấy rõ **các tầng lầu** xếp chồng lên nhau.
  4. Thấy trọn vẹn **hệ thống đường dây mạng, Hub, Switch** chạy dọc máng ngoài.

### 4.3. Smart Target Offset (Trọng tâm thị giác thay vì tâm hình học)
* Với tòa nhà 3 tầng: Nếu lấy tâm hình học $(H/2)$, góc nhìn thường bị hút về tầng trệt. Thuật toán **Smart Target** dịch nhẹ điểm ngắm lên độ cao tầng 2 $(0.55 \sim 0.6 \times H)$ để tạo điểm tựa thị giác vững chãi và cân đối.
* Với phòng học hoặc trạm máy tính: Target đặt chính xác tại cao độ mặt bàn $(Y = 0.8\text{m} \sim 1.2\text{m})$ với góc nhìn chéo từ trên xuống giúp quan sát rõ thiết bị và dây cáp cắm vào máy.

---

## 5. THIẾT KẾ CHỐNG GIẬT (DAMPING & SMOOTH INTERPOLATION)

### 5.1. Phân biệt các cấp độ làm mượt
1. **Damping phản hồi chuột (Orbit Damping)**:
   * Áp dụng hệ số quán tính tự nhiên $0.06$.
   * Không dùng quán tính quá lớn (như $0.01$) gây cảm giác "trôi nổi bồng bềnh như dưới nước", khó dừng đúng điểm mong muốn.
2. **Nội suy chuyển cảnh tự động (Transition Interpolation)**:
   * **Sai lầm phổ biến**: Dùng `camera.position.lerp(desiredPos)` trong không gian Descartes $\mathbb{R}^3$. Nếu điểm đầu và điểm cuối ở 2 phía tòa nhà, đường nối thẳng cắt xuyên qua ruột công trình và mặt đất!
   * **Giải pháp chuẩn**: Nội suy theo **Hệ tọa độ cầu (Spherical Slerp)**:
     $$\mathbf{T}(t) = \text{Lerp}(\mathbf{T}_{\text{start}}, \mathbf{T}_{\text{end}}, E(t))$$
     $$\theta(t) = \text{AngleLerp}(\theta_{\text{start}}, \theta_{\text{end}}, E(t))$$
     $$\phi(t) = \text{Lerp}(\phi_{\text{start}}, \phi_{\text{end}}, E(t))$$
     $$r(t) = \text{Lerp}(r_{\text{start}}, r_{\text{end}}, E(t))$$
     Với hàm làm êm mượt **Cubic Ease-Out**:
     $$E(t) = 1 - (1 - t)^3, \quad t \in [0, 1]$$
   * Thời gian chuyển cảnh: **500ms – 650ms** (ngắn gọn, dứt khoát, êm ái, không gây cảm giác chờ đợi).

### 5.2. Zoom thích ứng (Adaptive Exponential Zoom)
* Khi Camera ở xa ($r > 100\text{m}$): Mỗi nấc cuộn chuột dịch chuyển $8\text{m} \sim 12\text{m}$ để di chuyển nhanh.
* Khi Camera ở gần ($r < 20\text{m}$): Mỗi nấc cuộn chuột chỉ dịch chuyển $0.5\text{m} \sim 1.0\text{m}$ để người dùng soi kỹ chi tiết máy tính, dây mạng hay phòng học mà không sợ bị "vọt" lố vào tường.

---

## 6. KIẾN TRÚC CODE & TỐI ƯU HIỆU NĂNG 60 FPS

### 6.1. Luồng dữ liệu không qua React State (Zero Re-render)
```
Input Event (Pointer / Wheel)
       ↓
Input Accumulator (Refs: deltaTheta, deltaPhi, deltaR)
       ↓
useFrame Loop (Tick 60Hz)
       ↓
Calculate Spherical Target & Position (Pure Math in Temp Vectors)
       ↓
Apply directly to camera.position & controls.target
       ↓
WebGL Render
```
* **Không gọi `setState` hay trigger re-render component tree** khi người dùng xoay hoặc cuộn chuột.
* **Không cấp phát bộ nhớ mới (`new THREE.Vector3`)** trong vòng lặp `useFrame`. Tái sử dụng các vector tạm (`_vTarget`, `_vPos`, `_vSpherical`).

### 6.2. Bố trí tương tác chuột & Touch trực quan tối giản
* **Chuột trái (Left drag)**: Xoay tự nhiên (Orbit).
* **Cuộn chuột (Wheel)**: Thu phóng mượt (Zoom).
* **Chuột phải (Right drag)**: Dịch chuyển khung hình (Pan có giới hạn biên).
* **Click đối tượng**: Tự động chuyển cảnh và lấy nét (Click-to-Focus).
* **Phím tắt hỗ trợ**:
  * `R`: Đặt lại toàn cảnh trường học (Reset View).
  * `F`: Lấy nét đối tượng đang chọn (Focus Selected).

---

## 7. KẾ HOẠCH TRIỂN KHAI

1. Tạo thư viện toán học Auto-framing: `src/lib/3d/camera-math.ts`.
2. Tái cấu trúc bộ điều khiển Camera duy nhất: `src/components/3d/CameraRig.tsx`.
3. Tích hợp thanh công cụ góc nhìn gọn gàng và thẻ gợi ý tương tác ban đầu (First-interaction Hint).
4. Kiểm thử Benchmark và lập báo cáo `CAMERA-REPORT.md`.
