import * as THREE from 'three';
import type { SceneIndex } from './scene-index';
import type { CameraMode, Selection, FloorFilter } from '../../store/twin-store';
import { explodeOffset } from './visibility';
import { NETWORK_TOPOLOGY } from '../../data/network/network-topology';
import { resolveDevicePositions } from '../network/network-coordinates';

export interface CameraPose {
  target: THREE.Vector3;
  distance: number;
  azimuth: number; // theta around Y axis in radians
  polar: number;   // phi from top Y axis (0) to ground in radians
}

export interface CameraConstraints {
  minDistance: number;
  maxDistance: number;
  minPolarAngle: number;
  maxPolarAngle: number;
  panBounds: {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  };
}

export const CAMPUS_CONSTRAINTS: CameraConstraints = {
  minDistance: 3.5,
  maxDistance: 220,
  minPolarAngle: 0.035, // ~2.0 deg: prevents gimbal flip when looking directly from top
  maxPolarAngle: Math.PI / 2 - 0.035, // ~88.0 deg: prevents dipping below ground plane
  panBounds: {
    minX: -130,
    maxX: 130,
    minZ: -140,
    maxZ: 140,
  },
};

/**
 * Tính góc sai khác ngắn nhất giữa 2 góc radian (Shortest Angular Delta).
 * Tránh việc quay 350 độ khi chuyển từ 355° sang 5°.
 */
export function shortestAngleDelta(fromAngle: number, toAngle: number): number {
  const diff = (toAngle - fromAngle) % (Math.PI * 2);
  return ((diff + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
}

/**
 * Hàm làm êm chuyển cảnh Cubic Ease-Out: Dứt khoát ở đầu, hạ cánh siêu mượt ở đích.
 */
export function easeOutCubic(t: number): number {
  const f = t - 1;
  return f * f * f + 1;
}

/**
 * Chuyển đổi từ hệ tọa độ cầu (Target, Distance, Azimuth, Polar) sang vector Cartesian (x, y, z).
 */
export function sphericalToCartesian(
  target: THREE.Vector3,
  distance: number,
  azimuth: number,
  polar: number,
  outPos: THREE.Vector3 = new THREE.Vector3()
): THREE.Vector3 {
  const sinP = Math.sin(polar);
  const cosP = Math.cos(polar);
  const sinA = Math.sin(azimuth);
  const cosA = Math.cos(azimuth);

  outPos.set(
    target.x + distance * sinP * sinA,
    target.y + distance * cosP,
    target.z + distance * sinP * cosA
  );
  return outPos;
}

/**
 * Chuyển đổi từ tọa độ Cartesian (cameraPos, targetPos) sang hệ tọa độ cầu.
 */
export function cartesianToSpherical(
  cameraPos: THREE.Vector3,
  targetPos: THREE.Vector3
): { distance: number; azimuth: number; polar: number } {
  const dx = cameraPos.x - targetPos.x;
  const dy = cameraPos.y - targetPos.y;
  const dz = cameraPos.z - targetPos.z;

  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (distance < 0.0001) {
    return { distance: 1, azimuth: 0, polar: Math.PI / 4 };
  }

  // Polar: góc so với trục đứng Y (0 = đỉnh, pi/2 = mặt đất)
  const polar = Math.acos(THREE.MathUtils.clamp(dy / distance, -1, 1));
  // Azimuth: góc xoay quanh trục Y trong mặt phẳng X-Z
  let azimuth = Math.atan2(dx, dz);
  if (azimuth < 0) azimuth += Math.PI * 2;

  return { distance, azimuth, polar };
}

/**
 * Thuật toán tính toán Tọa độ & Góc nhìn tối ưu (Optimal Camera Pose)
 * dựa trên Bounding Box, tỷ lệ kích thước công trình và phối cảnh kiến trúc 3/4.
 */
export function computeOptimalPose({
  sceneIndex,
  selection,
  cameraMode,
  floorFilter,
  explode,
  viewMode,
}: {
  sceneIndex: SceneIndex;
  selection: Selection;
  cameraMode: CameraMode;
  floorFilter: FloorFilter;
  explode: boolean;
  viewMode: string;
}): CameraPose {
  // 1. CHẾ ĐỘ MẶT BẰNG 2D (TOP-DOWN PLAN)
  if (cameraMode === 'top' || viewMode === 'floorplan') {
    return {
      target: new THREE.Vector3(0, 0, 5),
      distance: 135,
      azimuth: 0,
      polar: 0.001, // Gần như thẳng đứng từ trên xuống, không bị gimbal lock
    };
  }

  // 2. LẤY NÉT THIẾT BỊ MẠNG (NETWORK DEVICE FOCUS)
  if (selection.networkDeviceId) {
    const devPositions = resolveDevicePositions(NETWORK_TOPOLOGY.devices, sceneIndex);
    const pos = devPositions.get(selection.networkDeviceId);
    if (pos) {
      const dev = NETWORK_TOPOLOGY.devices.find((d) => d.id === selection.networkDeviceId);
      const isPC = dev?.type === 'pc';
      return {
        target: new THREE.Vector3(pos[0], pos[1], pos[2]),
        distance: isPC ? 4.8 : 6.2,
        azimuth: Math.PI * 0.28,
        polar: 1.12, // ~64° nghiêng từ trên xuống, thấy rõ thiết bị và đầu cắm dây
      };
    }
  }

  // 3. LẤY NÉT PHÒNG HỌC (ROOM FOCUS)
  if (selection.roomId || cameraMode === 'interior') {
    const targetRoomId = selection.roomId || 'room-c-vi-tinh-1';
    const r = sceneIndex.roomById.get(targetRoomId);
    if (r) {
      const yOff = explodeOffset(r.floor.level, explode);
      const vol = r.roomLayout.volume;
      const [cx, cy, cz] = [vol.cx, r.floorLayout.baseY + vol.cy + yOff, vol.cz];

      if (cameraMode === 'interior') {
        // Góc nhìn người bên trong phòng học
        return {
          target: new THREE.Vector3(cx, cy, cz),
          distance: 4.2,
          azimuth: Math.PI * 0.35,
          polar: 1.42, // ~81° tầm mắt tự nhiên
        };
      }

      // Phối cảnh phòng học cắt lớp
      const roomRadius = Math.max(vol.sx, vol.sz) * 1.6;
      return {
        target: new THREE.Vector3(cx, cy - 0.2, cz),
        distance: Math.max(roomRadius, 14),
        azimuth: Math.PI * 0.25,
        polar: 1.05, // ~60° nhìn rõ bố cục bàn ghế
      };
    }
  }

  // 4. LẤY NÉT NGANG TẦNG (FLOOR LEVEL VIEW)
  if (cameraMode === 'floor') {
    const bId = selection.buildingId || 'building-cd';
    const bLayout = sceneIndex.layoutById.get(bId);
    if (bLayout && bLayout.floors.length > 0) {
      const targetLvl = typeof floorFilter === 'number' ? floorFilter : 0;
      const fl = bLayout.floors.find((f) => f.level === targetLvl) || bLayout.floors[0]!;
      const yOff = explodeOffset(fl.level, explode);
      const eyeY = fl.baseY + 1.65 + yOff;

      return {
        target: new THREE.Vector3(bLayout.bounds.cx, eyeY, bLayout.bounds.cz),
        distance: Math.max(bLayout.bounds.w, bLayout.bounds.d) * 1.1,
        azimuth: bLayout.building.axis === 'y' ? Math.PI * 0.25 : Math.PI * 0.15,
        polar: 1.28, // ~73° ngang tầm mắt người đi hành lang
      };
    }
  }

  // 5. LẤY NÉT TÒA NHÀ (BUILDING FOCUS - GÓC PHỐI CẢNH 3/4 VÀNG)
  if (selection.buildingId || cameraMode === 'building' || cameraMode === 'orbit') {
    const bId = selection.buildingId || 'building-cd';
    const bLayout = sceneIndex.layoutById.get(bId);
    if (bLayout) {
      const { bounds, structureHeight, building } = bLayout;
      // Smart Target: Dịch trọng tâm thị giác lên độ cao tầng 2 (0.52 * H)
      let yTarget = structureHeight * 0.52;
      if (floorFilter !== 'all') {
        const fl = bLayout.floors.find((f) => f.level === floorFilter);
        if (fl) {
          const yOff = explodeOffset(fl.level, explode);
          yTarget = fl.baseY + fl.height / 2 + yOff;
        }
      }

      // Bán kính cầu bao quanh
      const sphereRadius = Math.sqrt(bounds.w * bounds.w + bounds.d * bounds.d + structureHeight * structureHeight) * 0.5;
      const optimalDistance = Math.max(sphereRadius * 1.85, 28);

      // Lựa chọn góc phương vị 3/4 phù hợp với mặt tiền của từng dãy nhà
      let optimalAzimuth = Math.PI * 0.25; // 45 độ mặc định
      if (building.id === 'building-e') {
        // Dãy A: Hành lang hướng phía Tây (-X), nhìn đẹp nhất từ góc Tây-Nam
        optimalAzimuth = -Math.PI * 0.72;
      } else if (building.id === 'building-b') {
        // Dãy B: Hành lang hướng phía Đông (+X), nhìn đẹp nhất từ góc Đông-Nam
        optimalAzimuth = Math.PI * 0.28;
      } else if (building.id === 'building-cd') {
        // Dãy CD: Trục ngang (X), hành lang hướng Nam (+Z), nhìn từ góc Nam-Đông
        optimalAzimuth = Math.PI * 0.22;
      }

      return {
        target: new THREE.Vector3(bounds.cx, yTarget, bounds.cz),
        distance: optimalDistance,
        azimuth: optimalAzimuth,
        polar: 1.06, // ~60.7° phối cảnh công trình cân đối chiều cao và chiều sâu
      };
    }
  }

  // 6. LẤY NÉT KHU TIỆN ÍCH NGOÀI TRỜI (FACILITY FOCUS)
  if (selection.facilityId) {
    const f = sceneIndex.facilityById.get(selection.facilityId);
    if (f) {
      const radius = Math.max(f.bounds.w, f.bounds.d, 16) * 1.35;
      return {
        target: new THREE.Vector3(f.bounds.cx, f.facility.heightM * 0.5, f.bounds.cz),
        distance: radius,
        azimuth: Math.PI * 0.25,
        polar: 0.95,
      };
    }
  }

  // 7. TOÀN CẢNH KHUÔN VIÊN TRƯỜNG (CAMPUS OVERVIEW MẶC ĐỊNH)
  return {
    target: new THREE.Vector3(0, 3.5, 5),
    distance: 155,
    azimuth: 0.0, // Nhìn từ hướng cổng chính đường QL1A vào trong trường
    polar: 0.92,  // ~52.7° góc nhìn bao quát toàn bộ trường học
  };
}
