import React, { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useTwinStore } from '../../store/twin-store';
import { getSceneIndex } from '../../lib/3d/scene';
import { NETWORK_TOPOLOGY } from '../../data/network/network-topology';
import {
  resolveDevicePositions,
  resolveConnections,
  generateLabWorkstations,
  createTubeFromPoints,
} from '../../lib/network/network-coordinates';
import type { NetworkDevice, NetworkDeviceType } from '../../types/network';

// Bảng màu thiết bị mạng rực rỡ, phát sáng công nghệ
const DEVICE_COLORS: Record<NetworkDeviceType, { base: string; emissive: string; glow: string }> = {
  gateway: { base: '#ea580c', emissive: '#f97316', glow: '#ff7700' },        // VNPT Orange rực rỡ
  router: { base: '#0284c7', emissive: '#38bdf8', glow: '#00d0ff' },         // Cisco Electric Blue
  switch: { base: '#16a34a', emissive: '#4ade80', glow: '#00ff88' },         // Switch Emerald Neon
  hub: { base: '#059669', emissive: '#34d399', glow: '#10b981' },            // Hub Mint Green
  'access-point': { base: '#9333ea', emissive: '#c084fc', glow: '#d946ef' },    // WAP Purple Neon
  pc: { base: '#0284c7', emissive: '#00e5ff', glow: '#38bdf8' },             // PC Cyan Glow
  camera: { base: '#06b6d4', emissive: '#22d3ee', glow: '#67e8f9' },         // Camera Aqua
};

const DEVICE_TYPE_LABELS: Record<NetworkDeviceType, string> = {
  gateway: 'ISP GATEWAY (VNPT)',
  router: 'BỘ ĐỊNH TUYẾN (ROUTER)',
  switch: 'BỘ CHUYỂN MẠCH (SWITCH)',
  hub: 'BỘ CHIA MẠNG (HUB)',
  'access-point': 'ĐIỂM PHÁT SÓNG (WAP)',
  pc: 'MÁY TÍNH (PC)',
  camera: 'CAMERA AN NINH',
};

/**
 * Tạo canvas texture phát sáng công nghệ với hiệu ứng gói tin / xung nhịp dữ liệu (Data packet pulse)
 * Render luồng xung điện chạy dọc theo chiều dài của các ống dây cáp quang và mạng LAN.
 */
function createDataFlowTexture(
  baseColor: string,
  pulseGlow: string,
  pulseCore: string = '#ffffff'
): THREE.Texture {
  if (typeof document === 'undefined') {
    return new THREE.Texture();
  }
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 32;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // 1. Nền dây mạng phát sáng mờ nhưng rõ nét
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 512, 32);

    // 2. Vẽ 2 gói xung ánh sáng (pulse packets) nối tiếp nhau
    const drawPacket = (centerX: number, width: number) => {
      // Đuôi sáng chuyển màu mượt mà
      const grad = ctx.createLinearGradient(centerX - width / 2, 0, centerX + width / 2, 0);
      grad.addColorStop(0.0, 'rgba(0,0,0,0)');
      grad.addColorStop(0.28, pulseGlow);
      grad.addColorStop(0.65, pulseCore);
      grad.addColorStop(0.85, pulseGlow);
      grad.addColorStop(1.0, 'rgba(0,0,0,0)');

      ctx.fillStyle = grad;
      ctx.fillRect(centerX - width / 2, 0, width, 32);

      // Điểm sáng hạt nhân trắng chói ở tâm gói tin
      const coreGrad = ctx.createLinearGradient(centerX - 16, 0, centerX + 16, 0);
      coreGrad.addColorStop(0.0, 'rgba(255,255,255,0)');
      coreGrad.addColorStop(0.5, '#ffffff');
      coreGrad.addColorStop(1.0, 'rgba(255,255,255,0)');
      ctx.fillStyle = coreGrad;
      ctx.fillRect(centerX - 16, 0, 32, 32);
    };

    drawPacket(128, 175);
    drawPacket(384, 175);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

interface DeviceMeshProps {
  device: NetworkDevice;
  position: [number, number, number];
  isSelected: boolean;
  isHovered: boolean;
  isRelatedToSelection: boolean;
  isTransparent: boolean;
  onClick: (e: ThreeEvent<MouseEvent>) => void;
  onPointerOver: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOut: (e: ThreeEvent<PointerEvent>) => void;
}

const DeviceVisual: React.FC<DeviceMeshProps> = React.memo(({
  device,
  position,
  isSelected,
  isHovered,
  isRelatedToSelection,
  isTransparent,
  onClick,
  onPointerOver,
  onPointerOut,
}) => {
  const { base, emissive, glow } = DEVICE_COLORS[device.type];
  const highlighted = isSelected || isHovered;

  // Tăng cường phát sáng nổi bật trong chế độ trong suốt (Transparent Mode)
  const matColor = highlighted ? '#ffffff' : isRelatedToSelection ? glow : base;
  const emColor = highlighted ? '#00ffff' : isTransparent ? glow : emissive;
  const emIntensity = highlighted
    ? 3.8
    : isTransparent
      ? 2.8
      : isRelatedToSelection
        ? 1.6
        : 0.8;

  // Chiều cao hiển thị tooltip phù hợp cho từng loại thiết bị
  const tooltipY = device.type === 'pc' ? 1.45 : device.type === 'gateway' ? 1.35 : device.type === 'access-point' ? 0.75 : 1.1;

  // Góc xoay hướng thiết bị (Camera chĩa chéo vào phòng, bàn máy tính giáo viên hướng về phía lớp)
  let devRotation: [number, number, number] = [0, 0, 0];
  if (device.type === 'camera') {
    const bId = device.location.buildingId;
    const yaw = bId === 'building-e' ? -Math.PI * 0.25 : (bId === 'building-b' || bId === 'building-a') ? Math.PI * 0.25 : -Math.PI * 0.75;
    devRotation = [0.45, yaw, 0];
  } else if (device.type === 'pc') {
    const bId = device.location.buildingId;
    // Bàn máy tính đặt ở vách đối diện cửa:
    // Dãy A (corridor -x): PC ở +x -> xoay mặt về -x (về phía cửa) = Math.PI / 2
    // Dãy B & Dãy C (corridor +x): PC ở -x -> xoay mặt về +x (về phía cửa) = -Math.PI / 2
    // Dãy CD (corridor +y): PC ở -z -> xoay mặt về +z (về phía cửa) = 0
    const yaw = bId === 'building-e' ? Math.PI * 0.5 : (bId === 'building-b' || bId === 'building-a') ? -Math.PI * 0.5 : 0;
    devRotation = [0, yaw, 0];
  }

  return (
    <group
      position={position}
      rotation={devRotation}
      onClick={onClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      {/* Ánh sáng điểm lan tỏa chất lượng cao khi tương tác (hover hoặc chọn) */}
      {highlighted && (
        <pointLight
          color={emColor}
          intensity={3.5}
          distance={6.0}
          decay={2}
        />
      )}

      {/* Vòng đĩa hào quang dưới chân thiết bị */}
      <mesh position={[0, -0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.7, 0.95, 32]} />
        <meshBasicMaterial
          color={highlighted ? '#ffffff' : emColor}
          side={THREE.DoubleSide}
          transparent
          opacity={highlighted ? 0.95 : isTransparent ? 0.75 : 0.35}
        />
      </mesh>

      {/* ═══════════════════════════════════════════════════════════════
          1. ROUTER TO & NỔI BẬT (BỘ ĐỊNH TUYẾN NGOÀI HÀNH LANG / CẦU THANG)
          ═══════════════════════════════════════════════════════════════ */}
      {device.type === 'router' && (
        <group>
          {/* Vỏ Router công nghiệp to rõ */}
          <mesh castShadow>
            <boxGeometry args={[1.35, 0.32, 0.8]} />
            <meshStandardMaterial
              color={matColor}
              emissive={emColor}
              emissiveIntensity={emIntensity}
              roughness={0.2}
              metalness={0.6}
            />
          </mesh>
          {/* 4 Ăng-ten phát sóng to dài */}
          {[-0.48, -0.16, 0.16, 0.48].map((xOffset, i) => (
            <mesh key={i} position={[xOffset, 0.48, -0.32]} rotation={[0.15, 0, (i - 1.5) * 0.08]}>
              <cylinderGeometry args={[0.022, 0.028, 0.72, 12]} />
              <meshStandardMaterial color="#0f172a" roughness={0.4} />
            </mesh>
          ))}
          {/* Bảng đèn LED tín hiệu mặt trước */}
          <mesh position={[0, 0, 0.41]}>
            <boxGeometry args={[1.1, 0.1, 0.03]} />
            <meshBasicMaterial color="#00ff88" />
          </mesh>
          {/* Khung nhãn thiết bị */}
          <mesh position={[0, 0.17, 0]}>
            <boxGeometry args={[0.75, 0.03, 0.45]} />
            <meshStandardMaterial color="#0284c7" emissive="#38bdf8" emissiveIntensity={0.8} />
          </mesh>
        </group>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          2. GATEWAY VNPT (TỦ KỸ THUẬT QUANG VIỀN CAM NỔI BẬT TO)
          ═══════════════════════════════════════════════════════════════ */}
      {device.type === 'gateway' && (
        <group>
          {/* Tủ thiết bị viễn thông */}
          <mesh castShadow>
            <boxGeometry args={[1.4, 0.95, 0.75]} />
            <meshStandardMaterial
              color="#1e293b"
              roughness={0.25}
              metalness={0.7}
            />
          </mesh>
          {/* Cửa kính tủ viền cam VNPT phát sáng */}
          <mesh position={[0, 0, 0.39]}>
            <boxGeometry args={[1.18, 0.78, 0.03]} />
            <meshStandardMaterial
              color={matColor}
              emissive={emColor}
              emissiveIntensity={emIntensity}
              roughness={0.15}
            />
          </mesh>
          {/* Màn hình hiển thị VNPT */}
          <mesh position={[0, 0.28, 0.41]}>
            <boxGeometry args={[0.65, 0.12, 0.03]} />
            <meshBasicMaterial color="#ffedd5" />
          </mesh>
          {/* Cụm đèn sợi quang */}
          <mesh position={[0, -0.18, 0.41]}>
            <boxGeometry args={[0.9, 0.06, 0.03]} />
            <meshBasicMaterial color="#ff7700" />
          </mesh>
        </group>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          3. SWITCH & HUB (BỘ CHUYỂN MẠCH CÔNG NGHIỆP 24 PORTS TO RÕ)
          ═══════════════════════════════════════════════════════════════ */}
      {(device.type === 'switch' || device.type === 'hub') && (
        <group>
          {/* Chân đế đặt sàn chống rung cho các switch đặt dưới sàn trong phòng máy */}
          {device.id.startsWith('sw-pm') && (
            <group position={[0, -0.20, 0]}>
              <mesh>
                <boxGeometry args={[1.55, 0.08, 0.8]} />
                <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
              </mesh>
              {[-0.65, 0.65].map((bx, bi) =>
                [-0.32, 0.32].map((bz, bzi) => (
                  <mesh key={`${bi}-${bzi}`} position={[bx, -0.06, bz]}>
                    <cylinderGeometry args={[0.06, 0.06, 0.05, 12]} />
                    <meshStandardMaterial color="#1e293b" />
                  </mesh>
                ))
              )}
            </group>
          )}
          {/* Khung vỏ Rackmount to */}
          <mesh castShadow>
            <boxGeometry args={[1.45, 0.32, 0.72]} />
            <meshStandardMaterial
              color={matColor}
              emissive={emColor}
              emissiveIntensity={emIntensity}
              roughness={0.25}
              metalness={0.5}
            />
          </mesh>
          {/* Dải 24 Cổng RJ45 phát sáng */}
          <mesh position={[0, 0.03, 0.37]}>
            <boxGeometry args={[1.25, 0.1, 0.03]} />
            <meshBasicMaterial color={device.type === 'switch' ? '#00ff88' : '#22c55e'} />
          </mesh>
          {/* Đèn chỉ báo nguồn và loop */}
          <mesh position={[-0.56, -0.06, 0.37]}>
            <boxGeometry args={[0.12, 0.04, 0.03]} />
            <meshBasicMaterial color="#00e5ff" />
          </mesh>
        </group>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          4. ACCESS POINT (WAP WIFI ỐP TRẦN ĐĨA TRÒN TO RÕ)
          ═══════════════════════════════════════════════════════════════ */}
      {device.type === 'access-point' && (
        <group>
          <mesh castShadow>
            <cylinderGeometry args={[0.55, 0.68, 0.18, 32]} />
            <meshStandardMaterial
              color={matColor}
              emissive={emColor}
              emissiveIntensity={emIntensity}
              roughness={0.2}
            />
          </mesh>
          {/* Vòng hào quang tín hiệu WiFi */}
          <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.3, 0.44, 32]} />
            <meshBasicMaterial color="#c084fc" side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, -0.11, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.7, 0.84, 32]} />
            <meshBasicMaterial color="#e879f9" side={THREE.DoubleSide} transparent opacity={0.65} />
          </mesh>
        </group>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          5. BÀN MÁY TÍNH TO, CÓ DÂY MẠNG CẮM THẲNG VÀO CASE MÁY TÍNH
          ═══════════════════════════════════════════════════════════════ */}
      {device.type === 'pc' && (
        <group>
          {/* Bàn làm việc giáo viên / trạm máy tính */}
          <mesh position={[0, -0.4, 0]} castShadow receiveShadow>
            <boxGeometry args={[1.85, 0.1, 1.05]} />
            <meshStandardMaterial color="#b45309" roughness={0.7} />
          </mesh>
          {/* Chân bàn kim loại */}
          <mesh position={[-0.82, -0.85, 0]}>
            <boxGeometry args={[0.1, 0.8, 0.9]} />
            <meshStandardMaterial color="#334155" metalness={0.5} />
          </mesh>
          <mesh position={[0.82, -0.85, 0]}>
            <boxGeometry args={[0.1, 0.8, 0.9]} />
            <meshStandardMaterial color="#334155" metalness={0.5} />
          </mesh>

          {/* Màn hình PC to (32 inch) */}
          <mesh position={[0, 0.1, -0.08]} castShadow>
            <boxGeometry args={[1.05, 0.68, 0.05]} />
            <meshStandardMaterial color="#1e293b" roughness={0.3} />
          </mesh>
          {/* Màn hình hiển thị phát sáng desktop */}
          <mesh position={[0, 0.1, -0.05]}>
            <planeGeometry args={[0.98, 0.62]} />
            <meshBasicMaterial color="#00e5ff" />
          </mesh>
          {/* Chân đế màn hình */}
          <mesh position={[0, -0.28, -0.08]}>
            <cylinderGeometry args={[0.04, 0.04, 0.35, 12]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0, -0.42, -0.08]}>
            <boxGeometry args={[0.38, 0.03, 0.32]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>

          {/* Bàn phím & Chuột trên mặt bàn */}
          <mesh position={[0, -0.34, 0.24]}>
            <boxGeometry args={[0.6, 0.03, 0.2]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0.42, -0.34, 0.24]}>
            <boxGeometry args={[0.1, 0.03, 0.15]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>

          {/* Thùng Case máy tính đứng to dưới bàn */}
          <mesh position={[0.6, -0.55, -0.05]} castShadow>
            <boxGeometry args={[0.32, 0.68, 0.65]} />
            <meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.4} />
          </mesh>
          {/* Cổng mạng RJ45 phát sáng sau thùng case (nơi dây cắm vào) */}
          <mesh position={[0.6, -0.42, -0.38]}>
            <boxGeometry args={[0.08, 0.08, 0.02]} />
            <meshBasicMaterial color="#00ffff" />
          </mesh>
        </group>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          6. CAMERA AN NINH GÓC PHÒNG
          ═══════════════════════════════════════════════════════════════ */}
      {device.type === 'camera' && (
        <group>
          <mesh castShadow>
            <cylinderGeometry args={[0.12, 0.15, 0.32, 16]} />
            <meshStandardMaterial color={matColor} emissive={emColor} emissiveIntensity={emIntensity} />
          </mesh>
          <mesh position={[0, -0.16, 0]}>
            <sphereGeometry args={[0.11, 16, 16]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0, 0.06, 0.14]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>
      )}

      {/* ─────────────────────────────────────────────────────────────
          CHÚ THÍCH NỔI 3D TRÊN KHÔNG (IN-WORLD 3D FLOATING TOOLTIP)
          KHI DI CHUỘT VÀO THIẾT BỊ HOẶC ĐƯỢC CHỌN
          ───────────────────────────────────────────────────────────── */}
      {highlighted && (
        <Html
          center
          position={[0, tooltipY, 0]}
          distanceFactor={22}
          zIndexRange={[100, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div className="flex flex-col items-center select-none animate-in fade-in zoom-in-95 duration-150 whitespace-nowrap">
            <div className="px-3.5 py-2.5 rounded-2xl bg-zinc-950/95 backdrop-blur-md border border-cyan-400/70 shadow-[0_0_28px_rgba(6,182,212,0.45)] text-white text-left min-w-[200px]">
              {/* Header: Loại thiết bị & Trạng thái */}
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <span
                  className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-black shadow-sm"
                  style={{ backgroundColor: emColor }}
                >
                  {DEVICE_TYPE_LABELS[device.type] || device.type.toUpperCase()}
                </span>
                <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  Đang hoạt động
                </span>
              </div>

              {/* Tên & Mã định danh */}
              <div className="font-bold text-sm text-white leading-tight mb-1 flex items-center gap-1.5">
                <span>{device.label}</span>
                <span className="text-[10px] text-zinc-400 font-normal">({device.code})</span>
              </div>

              {/* Vị trí không gian */}
              <div className="text-[10px] text-zinc-300 font-medium mb-1.5 flex items-center gap-1">
                <span>📍</span>
                <span>{device.location.roomName || `${device.location.buildingId} · Tầng ${device.location.floorId}`}</span>
              </div>

              {/* Thông số kỹ thuật */}
              <div className="pt-1.5 border-t border-zinc-800 text-[10px] text-zinc-400 flex flex-col gap-0.5">
                {device.metadata?.ports && (
                  <div className="text-zinc-200">🔌 Cổng: <span className="text-emerald-400 font-semibold">{device.metadata.ports} cổng RJ45 Gigabit</span></div>
                )}
                {device.metadata?.ipRange && (
                  <div className="text-cyan-300 font-mono text-[9px]">🌐 Dải IP: {device.metadata.ipRange}</div>
                )}
                <div className="text-zinc-300">🔗 Liên kết: <span className="text-sky-300 font-semibold">{device.connectedDeviceIds.length} thiết bị</span> trong mạng</div>
              </div>
            </div>
            {/* Mũi tên chỉ xuống thiết bị */}
            <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[7px] border-t-cyan-400/90" />
          </div>
        </Html>
      )}
    </group>
  );
});

export function Network3DLayer() {
  const viewMode = useTwinStore((s) => s.viewMode);
  const networkLayerVisible = useTwinStore((s) => s.networkLayerVisible);
  const networkFilter = useTwinStore((s) => s.networkFilter);
  const selectedNetworkDeviceId = useTwinStore((s) => s.selection.networkDeviceId);
  const hovered = useTwinStore((s) => s.hovered);
  const selectNetworkDevice = useTwinStore((s) => s.selectNetworkDevice);
  const setHovered = useTwinStore((s) => s.setHovered);

  const [hoveredCableId, setHoveredCableId] = useState<string | null>(null);
  const [hoveredWsId, setHoveredWsId] = useState<string | null>(null);

  const sceneIndex = getSceneIndex();
  const isVisible = networkLayerVisible || viewMode === 'network' || viewMode === 'transparent';
  const isTransparent = viewMode === 'transparent';

  // 1. Bản đồ tra cứu nhanh thiết bị theo ID
  const deviceMap = useMemo(() => {
    const map = new Map<string, NetworkDevice>();
    for (const dev of NETWORK_TOPOLOGY.devices) {
      map.set(dev.id, dev);
    }
    return map;
  }, []);

  // 2. Tính toán tọa độ chuẩn thiết bị
  const devicePositions = useMemo(() => {
    return resolveDevicePositions(NETWORK_TOPOLOGY.devices, sceneIndex);
  }, [sceneIndex]);

  // 3. Tính toán đường cáp theo đúng yêu cầu (chạy mặt ngoài trên cùng, đâm vào trần phòng và cắm vào PC)
  const resolvedConnections = useMemo(() => {
    return resolveConnections(NETWORK_TOPOLOGY.connections, devicePositions, sceneIndex);
  }, [devicePositions, sceneIndex]);

  // 4. Sinh các máy tính mô phỏng trong Phòng Máy 1 & 2
  const labWorkstations = useMemo(() => {
    return generateLabWorkstations(sceneIndex);
  }, [sceneIndex]);

  // 5. Lọc thiết bị theo trạng thái
  const visibleDevices = useMemo(() => {
    return NETWORK_TOPOLOGY.devices.filter((dev) => networkFilter[dev.type] !== false);
  }, [networkFilter]);

  // 6. Sinh BufferGeometry cho từng tuyến cáp: Dày dặn, to rõ vượt bậc khi bật chế độ trong suốt (isTransparent)
  const cableGeometries = useMemo(() => {
    return resolvedConnections.map(({ connection, points }) => {
      const isInterBuilding = connection.routingType === 'inter-building';
      // Trong chế độ trong suốt, tăng đường kính cáp lên gần gấp đôi để nổi bật xuyên qua các tầng lầu
      const radius = isInterBuilding
        ? (isTransparent ? 0.18 : 0.095)
        : (isTransparent ? 0.13 : 0.068);
      const geometry = createTubeFromPoints(points, radius);
      const midIndex = Math.floor(points.length / 2);
      const midpoint = points[midIndex] || points[0];
      return {
        id: connection.id,
        connection,
        points,
        geometry,
        midpoint,
        isInterBuilding,
      };
    });
  }, [resolvedConnections, isTransparent]);

  useEffect(() => {
    return () => {
      cableGeometries.forEach((cg) => cg.geometry.dispose());
    };
  }, [cableGeometries]);

  // 7. Khởi tạo Texture luồng dữ liệu (Data packet flow) có chu kỳ lặp và hiệu ứng xung điện chạy liên tục
  const { fiberTexture, lanTexture, labTexture } = useMemo(() => {
    const fiber = createDataFlowTexture(
      '#5c2400',       // Nền dây quang cam đậm
      '#ff8800',       // Vầng sáng neon hổ phách
      '#ffffff'        // Điểm nhân trắng chói
    );
    fiber.repeat.set(16, 1);

    const lan = createDataFlowTexture(
      '#003852',       // Nền dây LAN xanh cyber
      '#00e5ff',       // Vầng sáng neon cyan
      '#ffffff'        // Điểm nhân trắng chói
    );
    lan.repeat.set(9, 1);

    const lab = createDataFlowTexture(
      '#00334d',       // Nền dây thả phòng máy
      '#00f0ff',       // Vầng sáng neon cyan/teal
      '#ffffff'        // Điểm nhân trắng chói
    );
    lab.repeat.set(3, 1);

    return { fiberTexture: fiber, lanTexture: lan, labTexture: lab };
  }, []);

  useEffect(() => {
    return () => {
      fiberTexture.dispose();
      lanTexture.dispose();
      labTexture.dispose();
    };
  }, [fiberTexture, lanTexture, labTexture]);

  // 8. Frame loop di chuyển luồng xung điện (hiệu ứng chạy chạy) với hiệu năng 60 FPS tối đa
  useFrame((_, delta) => {
    if (!isVisible) return;
    const dt = Math.min(delta, 0.1);
    const speed = 1.35;
    fiberTexture.offset.x -= dt * speed;
    lanTexture.offset.x -= dt * speed;
    labTexture.offset.x -= dt * speed;
  });

  // 9. Các Material phát sáng PBR chuẩn công nghệ - Tăng cường tối đa độ rực rỡ khi bật trong suốt
  const materials = useMemo(() => {
    const fiberMat = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      map: fiberTexture,
      emissive: '#ffffff',
      emissiveMap: fiberTexture,
      emissiveIntensity: isTransparent ? 3.8 : 1.4,
      roughness: 0.15,
      metalness: 0.2,
      toneMapped: false,
    });

    const lanMat = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      map: lanTexture,
      emissive: '#ffffff',
      emissiveMap: lanTexture,
      emissiveIntensity: isTransparent ? 3.5 : 1.3,
      roughness: 0.15,
      metalness: 0.2,
      toneMapped: false,
    });

    const labMat = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      map: labTexture,
      emissive: '#ffffff',
      emissiveMap: labTexture,
      emissiveIntensity: isTransparent ? 3.2 : 1.2,
      roughness: 0.2,
      metalness: 0.15,
      toneMapped: false,
    });

    const highlightFiberMat = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      map: fiberTexture,
      emissive: '#ffffff',
      emissiveMap: fiberTexture,
      emissiveIntensity: 5.2,
      roughness: 0.1,
      metalness: 0.1,
      toneMapped: false,
    });

    const highlightLanMat = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      map: lanTexture,
      emissive: '#ffffff',
      emissiveMap: lanTexture,
      emissiveIntensity: 5.2,
      roughness: 0.1,
      metalness: 0.1,
      toneMapped: false,
    });

    return {
      fiberMat,
      lanMat,
      labMat,
      highlightFiberMat,
      highlightLanMat,
    };
  }, [isTransparent, fiberTexture, lanTexture, labTexture]);

  useEffect(() => {
    return () => {
      materials.fiberMat.dispose();
      materials.lanMat.dispose();
      materials.labMat.dispose();
      materials.highlightFiberMat.dispose();
      materials.highlightLanMat.dispose();
    };
  }, [materials]);

  // 10. Tạo thuộc tính hiển thị (màu sắc/highlight) cho cáp nhanh tức thì
  const cableTubes = useMemo(() => {
    return cableGeometries.map((cg) => {
      const { id, connection, geometry, midpoint, isInterBuilding } = cg;
      const isSelected =
        selectedNetworkDeviceId === connection.fromDeviceId ||
        selectedNetworkDeviceId === connection.toDeviceId;
      const isHovered =
        hoveredCableId === id ||
        hovered?.id === connection.fromDeviceId ||
        hovered?.id === connection.toDeviceId;
      const isHighlighted = isSelected || isHovered;

      const fromDev = deviceMap.get(connection.fromDeviceId);
      const toDev = deviceMap.get(connection.toDeviceId);

      const material = isInterBuilding
        ? (isHighlighted ? materials.highlightFiberMat : materials.fiberMat)
        : (isHighlighted ? materials.highlightLanMat : materials.lanMat);

      return {
        id,
        geometry,
        material,
        isHighlighted,
        isInterBuilding,
        midpoint,
        medium: connection.medium,
        routingType: connection.routingType,
        fromLabel: fromDev?.label || connection.fromDeviceId,
        toLabel: toDev?.label || connection.toDeviceId,
      };
    });
  }, [cableGeometries, selectedNetworkDeviceId, hovered?.id, hoveredCableId, materials, deviceMap]);

  // 11. Ống cáp cho các máy tính học sinh trong Phòng máy 1 & 2
  const labDropCables = useMemo(() => {
    return labWorkstations.map((ws) => {
      const geometry = createTubeFromPoints(ws.cableDropPoints, isTransparent ? 0.085 : 0.048);
      return {
        id: `cable-${ws.id}`,
        geometry,
      };
    });
  }, [labWorkstations, isTransparent]);

  useEffect(() => {
    return () => {
      labDropCables.forEach((drop) => drop.geometry.dispose());
    };
  }, [labDropCables]);

  if (!isVisible) return null;

  return (
    <group name="network-3d-layer">
      {/* ═══════════════════════════════════════════════════════════════
          A. HỆ THỐNG ỐNG CÁP 3D TO RÕ & PHÁT SÁNG NỔI BẬT (3D TUBES)
          Có hiệu ứng xung điện chạy liên tục và sự kiện di chuột (hover)
          ═══════════════════════════════════════════════════════════════ */}
      {cableTubes.map((cable) => (
        <group key={cable.id}>
          <mesh
            geometry={cable.geometry}
            material={cable.material}
            renderOrder={5}
            onClick={(e) => {
              e.stopPropagation();
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredCableId(cable.id);
              setHovered({
                id: cable.id,
                kind: 'network-device',
                label: `Tuyến Cáp: ${cable.fromLabel} ➔ ${cable.toLabel}`,
                sub: `${cable.medium === 'fiber' ? 'Cáp quang Multimode' : 'Cáp LAN CAT6 Gigabit'} · ${cable.isInterBuilding ? 'Trục chính liên tòa' : 'Hành lang vào phòng'}`,
              });
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              if (hoveredCableId === cable.id) setHoveredCableId(null);
              if (hovered?.id === cable.id) setHovered(null);
            }}
          />

          {/* CHÚ THÍCH NỔI TRÊN ĐƯỜNG DÂY KHI DI CHUỘT VÀO CÁP */}
          {hoveredCableId === cable.id && (
            <Html
              center
              position={cable.midpoint}
              distanceFactor={22}
              zIndexRange={[100, 0]}
              style={{ pointerEvents: 'none' }}
            >
              <div className="flex flex-col items-center select-none animate-in fade-in zoom-in-95 duration-150 whitespace-nowrap">
                <div className="px-3.5 py-2.5 rounded-2xl bg-zinc-950/95 backdrop-blur-md border border-amber-400/80 shadow-[0_0_24px_rgba(251,191,36,0.45)] text-white text-left min-w-[210px]">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-black bg-amber-400">
                      {cable.isInterBuilding ? 'CÁP QUANG LIÊN TÒA' : 'CÁP MẠNG LAN CAT6'}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold">1 Gbps</span>
                  </div>
                  <div className="text-xs font-bold text-white mb-0.5">
                    {cable.fromLabel} ➔ {cable.toLabel}
                  </div>
                  <div className="text-[9px] text-zinc-300">
                    {cable.isInterBuilding
                      ? 'Trục chính chạy máng ngoài trên cùng liên kết các tòa'
                      : 'Đường cáp máng ngoài trên cùng thả trần cắm vào máy tính'}
                  </div>
                </div>
                <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-amber-400/90" />
              </div>
            </Html>
          )}
        </group>
      ))}

      {/* Dây thả xuống các bàn máy tính học sinh trong phòng máy */}
      {labDropCables.map((drop) => (
        <mesh
          key={drop.id}
          geometry={drop.geometry}
          material={materials.labMat}
          renderOrder={5}
        />
      ))}

      {/* ═══════════════════════════════════════════════════════════════
          B. DÀN MÁY TÍNH HỌC SINH MÔ PHỎNG TRONG PHÒNG MÁY 1 & 2 (TO RÕ)
          ═══════════════════════════════════════════════════════════════ */}
      {labWorkstations.map((ws) => (
        <group
          key={ws.id}
          position={ws.position}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHoveredWsId(ws.id);
            setHovered({
              id: ws.id,
              kind: 'network-device',
              label: `Trạm Máy Tính Học Sinh #${ws.id.replace(/.*-ws-/, '')}`,
              sub: `${ws.labName} · ${ws.groupName || 'Dãy CD'} (Kết nối: ${ws.switchLabel || 'Switch sàn'})`,
            });
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            if (hoveredWsId === ws.id) setHoveredWsId(null);
            if (hovered?.id === ws.id) setHovered(null);
          }}
        >
          {/* Bàn máy tính học sinh to */}
          <mesh position={[0, -0.4, 0]}>
            <boxGeometry args={[1.5, 0.08, 0.85]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.6} />
          </mesh>
          <mesh position={[-0.68, -0.8, 0]}>
            <boxGeometry args={[0.08, 0.75, 0.7]} />
            <meshStandardMaterial color="#475569" />
          </mesh>
          <mesh position={[0.68, -0.8, 0]}>
            <boxGeometry args={[0.08, 0.75, 0.7]} />
            <meshStandardMaterial color="#475569" />
          </mesh>

          {/* Màn hình học sinh to */}
          <mesh position={[0, 0.08, -0.06]}>
            <boxGeometry args={[0.82, 0.52, 0.04]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[0, 0.08, -0.038]}>
            <planeGeometry args={[0.76, 0.46]} />
            <meshBasicMaterial color="#00e5ff" />
          </mesh>
          <mesh position={[0, -0.24, -0.06]}>
            <cylinderGeometry args={[0.03, 0.03, 0.28, 12]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>

          {/* Bàn phím */}
          <mesh position={[0, -0.35, 0.2]}>
            <boxGeometry args={[0.5, 0.03, 0.16]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>

          {/* Case máy tính & Cổng dây cắm to */}
          <mesh position={[0.48, -0.55, -0.05]}>
            <boxGeometry args={[0.26, 0.58, 0.52]} />
            <meshStandardMaterial color="#0f172a" metalness={0.5} />
          </mesh>
          <mesh position={[0.48, -0.42, -0.315]}>
            <boxGeometry args={[0.07, 0.07, 0.02]} />
            <meshBasicMaterial color="#00ffff" />
          </mesh>

          {/* CHÚ THÍCH NỔI TRÊN MÁY TÍNH HỌC SINH KHI DI CHUỘT */}
          {hoveredWsId === ws.id && (
            <Html
              center
              position={[0, 1.15, 0]}
              distanceFactor={22}
              zIndexRange={[100, 0]}
              style={{ pointerEvents: 'none' }}
            >
              <div className="flex flex-col items-center select-none animate-in fade-in zoom-in-95 duration-150 whitespace-nowrap">
                <div className="px-3.5 py-2.5 rounded-2xl bg-zinc-950/95 backdrop-blur-md border border-sky-400/80 shadow-[0_0_24px_rgba(56,189,248,0.45)] text-white text-left min-w-[210px]">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-sky-400 text-black">
                      MÁY TÍNH HỌC SINH
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold">Online</span>
                  </div>
                  <div className="text-xs font-bold text-white mb-0.5">
                    Trạm #{ws.id.replace(/.*-ws-/, '')} · {ws.groupName || ''}
                  </div>
                  <div className="text-[9px] text-zinc-300">
                    📍 {ws.labName} (Dãy CD) · Cáp mạng nối: <span className="text-emerald-400 font-semibold">{ws.switchLabel || 'Switch'}</span>
                  </div>
                </div>
                <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-sky-400/90" />
              </div>
            </Html>
          )}
        </group>
      ))}

      {/* ═══════════════════════════════════════════════════════════════
          C. CÁC THIẾT BỊ MẠNG CHÍNH (ROUTERS, SWITCHES, HUBS, GATEWAYS, PCS)
          ═══════════════════════════════════════════════════════════════ */}
      {visibleDevices.map((dev) => {
        const pos = devicePositions.get(dev.id);
        if (!pos) return null;

        const isSelected = selectedNetworkDeviceId === dev.id;
        const isHovered = hovered?.id === dev.id;
        const isRelated =
          Boolean(selectedNetworkDeviceId) &&
          (dev.connectedDeviceIds.includes(selectedNetworkDeviceId!) ||
            (selectedNetworkDeviceId &&
              NETWORK_TOPOLOGY.devices
                .find((d) => d.id === selectedNetworkDeviceId)
                ?.connectedDeviceIds.includes(dev.id)));

        return (
          <DeviceVisual
            key={dev.id}
            device={dev}
            position={pos}
            isSelected={isSelected}
            isHovered={isHovered}
            isRelatedToSelection={Boolean(isRelated)}
            isTransparent={isTransparent}
            onClick={(e) => {
              e.stopPropagation();
              selectNetworkDevice(dev.id);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHovered({
                id: dev.id,
                kind: 'network-device',
                label: dev.label,
                sub: `${dev.code} · ${DEVICE_TYPE_LABELS[dev.type] || dev.type.toUpperCase()}`,
              });
            }}
            onPointerOut={(e) => {
              e.stopPropagation();
              if (hovered?.id === dev.id) setHovered(null);
            }}
          />
        );
      })}
    </group>
  );
}
