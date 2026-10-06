# BÁO CÁO NGHIÊN CỨU & NÂNG CẤP HỆ THỐNG CAMERA DIGITAL TWIN
**Dự án**: Digital Twin 3D THPT Số 1 Tư Nghĩa  
**Tác giả**: Senior 3D Interaction Engineer & UX Specialist  
**Ngày hoàn thành**: Tháng 10/2026  

---

## 1. CAMERA MODEL ĐÃ CHỌN
* **Tên mô hình**: **Target-based Smooth Orbit Camera kết hợp Mathematical Auto-Framing**.
* **Định nghĩa toán học**: Camera vận hành hoàn toàn trong hệ tọa độ cầu 5 tham số:
  $$\text{Pose} = \big(\mathbf{T} \in \mathbb{R}^3, \; r \in [3.5, 220], \; \theta \in [0, 2\pi), \; \phi \in [0.035, 1.53] \big)$$
  kết hợp thuật toán nội suy cung tròn ngắn nhất (Shortest Arc Spherical Slerp) và hàm làm êm Cubic Ease-Out.

---

## 2. VÌ SAO CHỌN MÔ HÌNH NÀY?
1. **Trực quan tuyệt đối cho người dùng phổ thông**: Trục đứng World Y luôn được khóa thẳng đứng, đường chân trời không bao giờ bị nghiêng lệch gây say xe hay mất phương hướng.
2. **Không bao giờ lộn ngược hay chui xuống đất**: Giới hạn góc cực $\phi \in [0.035, \frac{\pi}{2} - 0.035]$ bảo đảm tầm nhìn luôn ở trên mặt đất.
3. **Chuyển cảnh thông minh không cắt xuyên vật thể**: Khắc phục triệt để lỗi của phép `lerp()` Descartes thông thường (vốn bay xuyên lòng đất và xuyên qua ruột công trình).
4. **Phô diễn tối đa vẻ đẹp kiến trúc**: Tự động tính toán góc phối cảnh 3/4 (35°–45° Azimuth, 28°–35° Elevation) khi người dùng nhấp chọn công trình, làm nổi bật đồng thời mặt tiền, chiều sâu hồi nhà, các tầng lầu và hệ thống dây cáp mạng máng ngoài.

---

## 3. CÁC MÔ HÌNH ĐÃ CÂN NHẮC & SO SÁNH
* **Arcball / Trackball Camera**: Bị loại vì cho phép xoay 3 bậc tự do tự do không giới hạn trục, dễ làm lộn ngược mô hình và mất mốc phương hướng mặt đất của trường học.
* **First-Person (FPS/WASD) Camera**: Bị loại khỏi vai trò camera chính vì thao tác rườm rà, đòi hỏi nhớ nhiều phím và dễ bị kẹt góc hẹp trong các phòng học.
* **Fly/Drone Camera**: Bị loại vì quá khó kiểm soát đối với người dùng không chuyên môn 3D.

---

## 4. BẢNG PHÂN BỔ TƯƠNG TÁC (INPUT MAPPING)
* **Kéo chuột trái (Left Drag) / 1 ngón chạm**: Xoay quanh tâm công trình (Orbit / Turntable) mượt mà với quán tính tự nhiên.
* **Cuộn chuột (Wheel) / Pinch 2 ngón**: Thu phóng thích ứng (Adaptive Exponential Zoom: ở xa lướt nhanh, ở gần tinh chỉnh mượt).
* **Kéo chuột phải (Right Drag) / 2 ngón trượt**: Dịch chuyển khung hình (Screen-Space Pan) có rào chắn giới hạn khuôn viên (Soft Pan Clamping).
* **Click vào bất kỳ đối tượng (Building / Floor / Room / Network Device)**: Tự động tính toán bounding box và lướt êm ái tới góc nhìn tối ưu (Click-to-Focus).
* **Phím tắt hỗ trợ**:
  * `R`: Đặt lại toàn cảnh trường học (Reset View).
  * `F`: Lấy nét đối tượng đang chọn (Focus Selected).

---

## 5. CHIẾN LƯỢC LÀM MƯỢT (DAMPING & TRANSITION STRATEGY)
1. **Damping phản hồi chuột**: `dampingFactor = 0.06` – vừa đủ tạo cảm giác công nghệ đầm chắc, loại bỏ hoàn toàn độ trễ hay cảm giác trôi nổi bồng bềnh.
2. **Nội suy chuyển cảnh tự động (Programmatic Transition)**:
   * Thời gian thích ứng theo khoảng cách: $460\text{ms} \sim 680\text{ms}$.
   * Hàm làm mượt: $E(t) = 1 - (1 - t)^3$ (Cubic Ease-Out).
   * Xoay góc theo cung ngắn nhất: `shortestAngleDelta()`, không quay vòng ngược vô lý.

---

## 6. CHIẾN LƯỢC AUTO-FRAMING & SMART TARGET
* **Không hardcode tọa độ**: Tự động tính bán kính cầu bao quanh $R_{\text{sphere}}$ từ Bounding Box của đối tượng, bù trừ theo góc mở ống kính (Camera FOV 42°).
* **Góc phối cảnh 3/4 đặc thù theo từng công trình**:
  * **Dãy A (Building E)**: Hành lang phía Tây $\rightarrow$ Camera tiếp cận từ hướng Tây-Nam ($\theta = -130^\circ$).
  * **Dãy B**: Hành lang phía Đông $\rightarrow$ Camera tiếp cận từ hướng Đông-Nam ($\theta = +50^\circ$).
  * **Dãy C·D**: Hành lang phía Nam $\rightarrow$ Camera tiếp cận từ góc Nam-Đông ($\theta = +40^\circ$).
  * **Thiết bị mạng (Router / Switch / Hub / PC)**: Camera tiếp cận góc nghiêng 64° từ cự ly $4.8\text{m} \sim 6.2\text{m}$, nhìn rõ thân máy, dải đèn LED và ống dây cáp cắm vào cổng.
* **Smart Target**: Điểm ngắm của tòa nhà cao tầng được nâng lên cao độ tầng 2 ($0.52 \times H$) thay vì rơi xuống sàn tầng trệt, tạo bố cục cân đối hoàn hảo trong viewport.

---

## 7. CHIẾN LƯỢC BẢO VỆ VA CHẠM & GIỚI HẠN (COLLISION & BOUNDS)
* **Chống lộn ngược scene**: `minPolarAngle = 0.035 rad` ($\approx 2^\circ$).
* **Chống chui xuống lòng đất**: `maxPolarAngle = 1.535 rad` ($\approx 88^\circ$) và `camera.position.y >= 0.6m`.
* **Giới hạn cự ly zoom**: `minDistance = 3.5m`, `maxDistance = 220m`.
* **Rào chắn điểm ngắm (Soft Pan Bounds)**: Tâm ngắm Target bị giữ chặt trong phạm vi khuôn viên:
  $$X \in [-130\text{m}, +130\text{m}], \quad Z \in [-140\text{m}, +140\text{m}], \quad Y \ge 0$$
  Người dùng không thể vô tình kéo target bay mất ra khoảng không vô định.

---

## 8. PHÁT HIỆN HIỆU NĂNG & QUAN SÁT FPS (PERFORMANCE FINDINGS)
* **Zero UI Re-render**: Toàn bộ quá trình tính toán chuyển động và cập nhật vị trí camera diễn ra trực tiếp trong vòng lặp `useFrame` thông qua Vector Refs (`_tempTarget`), không gọi `setState` hay trigger re-render React Component Tree mỗi frame.
* **Bộ nhớ ổn định**: Tái sử dụng đối tượng vector, loại bỏ hoàn toàn việc cấp phát `new THREE.Vector3()` trong mỗi khung hình.
* **FPS thực tế**: Đạt ổn định **60 FPS** xuyên suốt quá trình xoay chuột, cuộn zoom, chuyển cảnh giữa các tòa nhà và cả trong chế độ trong suốt Hologram.

---

## 9. CÁC VẤN ĐỀ ĐÃ SỬA HOÀN TOÀN
1. Sửa lỗi camera Cartesian lerp bay cắt xuyên sàn và đất khi đổi tòa nhà.
2. Sửa lỗi quay ngược 350° khi chuyển góc phương vị gần mốc 0°.
3. Sửa lỗi pan chuột phải làm trôi target văng mất khuôn viên trường.
4. Sửa lỗi zoom xuyên thủng bên trong khối tường khi ở góc thấp.
5. Thêm thẻ hướng dẫn tương tác ban đầu (`CameraControlHint.tsx`) tự động biến mất khi người dùng bắt đầu thao tác.

---

## 10. BẢNG THÔNG SỐ VẬN HÀNH CUỐI CÙNG (FINAL PARAMETERS)

| Tham số | Giá trị | Mục đích |
| :--- | :--- | :--- |
| `minDistance` | `3.5m` | Khoảng cách zoom cận cảnh an toàn |
| `maxDistance` | `220m` | Khoảng cách bao quát tối đa |
| `minPolarAngle` | `0.035 rad` ($2.0^\circ$) | Khóa đỉnh chống Gimbal Lock |
| `maxPolarAngle` | `1.535 rad` ($88.0^\circ$) | Khóa đáy chống chui lòng đất |
| `dampingFactor` | `0.06` | Quán tính xoay đầm chắc |
| `transitionDuration` | `460ms ~ 680ms` | Thời gian chuyển cảnh tự thích ứng |
| `easeFunction` | Cubic Ease-Out | Làm êm chuyển cảnh dứt khoát và mượt |
| `panBoundsX` | `[-130, 130]` | Rào chắn tọa độ X |
| `panBoundsZ` | `[-140, 140]` | Rào chắn tọa độ Z |
| `dpr` | `[1, 1.5]` | Cân bằng độ nét Retina và tải GPU |
