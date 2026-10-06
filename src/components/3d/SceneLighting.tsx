import { useTwinStore } from '../../store/twin-store';

export function SceneLighting() {
  const lighting = useTwinStore((s) => s.lighting);
  const viewMode = useTwinStore((s) => s.viewMode);

  const isEvening = lighting === 'evening';
  const isNight = lighting === 'night';
  const isFloorPlan = viewMode === 'floorplan';

  if (viewMode === 'transparent') {
    return (
      <>
        {/* Subtle deep cyan ambient lighting */}
        <ambientLight intensity={0.45} color="#082f49" />
        {/* Key cyan beam */}
        <directionalLight position={[60, 90, 70]} intensity={1.3} color="#00e5ff" />
        {/* Rim back light to highlight glass architecture contours */}
        <directionalLight position={[-70, 40, -80]} intensity={1.0} color="#38bdf8" />
        {/* Bottom cyber glow */}
        <hemisphereLight args={['#0ea5e9', '#020617', 0.5]} />
      </>
    );
  }

  if (isFloorPlan) {
    return (
      <>
        <ambientLight intensity={1.8} />
        <directionalLight position={[0, 80, 0]} intensity={1.2} />
      </>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CHẾ ĐỘ BAN ĐÊM (CYBER NIGHT MODE) - BẦU TRỜI ĐÊM, ÁNH TRĂNG BẠC & ĐÈN HỌC ĐƯỜNG
  // ═══════════════════════════════════════════════════════════════════════════
  if (isNight) {
    return (
      <>
        {/* Ánh sáng môi trường đêm trầm */}
        <ambientLight intensity={0.25} color="#0c1a30" />

        {/* Ánh trăng bàng bạc chiếu rọi toàn sân trường */}
        <directionalLight
          position={[-50, 75, -55]}
          intensity={0.8}
          color="#93c5fd"
          castShadow={viewMode === 'architectural'}
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0001}
        >
          <orthographicCamera attach="shadow-camera" args={[-90, 90, 80, -80, 10, 200]} />
        </directionalLight>

        {/* Ánh đèn sân trường trung tâm */}
        <pointLight position={[0, 14, 0]} intensity={2.5} distance={90} color="#fef08a" decay={2} />

        {/* Đèn vàng ấm hắt sáng từ hành lang Dãy A */}
        <pointLight position={[35, 7, 5]} intensity={1.8} distance={55} color="#fed7aa" decay={2} />

        {/* Đèn vàng ấm hắt sáng từ hành lang Dãy B & Phòng Họp */}
        <pointLight position={[-12, 7, 5]} intensity={1.8} distance={55} color="#fed7aa" decay={2} />

        {/* Đèn ấm từ Dãy C·D & Phòng Máy Vi Tính */}
        <pointLight position={[5, 7, -35]} intensity={2.0} distance={60} color="#fed7aa" decay={2} />

        {/* Đèn thủy sinh xanh ngọc hồ bơi */}
        <pointLight position={[-42, 3, 28]} intensity={1.8} distance={35} color="#38bdf8" decay={2} />

        {/* Bầu khí quyển ánh xanh đêm */}
        <hemisphereLight args={['#60a5fa', '#020617', 0.25]} />
      </>
    );
  }

  return (
    <>
      <ambientLight intensity={isEvening ? 0.6 : 0.9} color={isEvening ? '#ffd8b3' : '#ffffff'} />
      <directionalLight
        position={isEvening ? [-60, 30, -50] : [50, 80, 60]}
        intensity={isEvening ? 1.2 : 1.6}
        color={isEvening ? '#ff9955' : '#fffcf7'}
        castShadow={viewMode === 'architectural'}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      >
        <orthographicCamera attach="shadow-camera" args={[-90, 90, 80, -80, 10, 200]} />
      </directionalLight>
      <hemisphereLight
        args={[isEvening ? '#ffcaa0' : '#dbe8f5', isEvening ? '#4a3224' : '#e5ded5', 0.4]}
      />
    </>
  );
}
