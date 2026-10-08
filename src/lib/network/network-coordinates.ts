import * as THREE from 'three';
import type { SceneIndex } from '../3d/scene-index';
import { pxY, rectToWorld } from '../geometry/plan';
import type { NetworkDevice, NetworkConnection } from '../../types/network';

export interface ComputerLabWorkstation {
  id: string;
  roomId: string;
  labName: string;
  position: [number, number, number];
  cableDropPoints: [number, number, number][];
  switchCode?: string;
  switchLabel?: string;
  groupName?: string;
}

export interface ResolvedNetworkDevice {
  device: NetworkDevice;
  worldPosition: [number, number, number];
}

export interface ResolvedNetworkConnection {
  connection: NetworkConnection;
  points: [number, number, number][];
}

/**
 * Tính toán tọa độ không gian 3D chính xác cho các thiết bị mạng:
 * - Hub/Router Dãy A: Đặt tại góc trên cùng của tầng (mặt ngoài hành lang) gần buồng thang bộ.
 * - Hub/Router Dãy B: Đặt tại góc trên cùng ngoài hành lang gần các buồng thang.
 * - PC trong phòng: Đặt tại bàn giáo viên, dây kéo từ trần trên cùng cắm thẳng vào máy tính.
 */
export function resolveDevicePositions(
  devices: NetworkDevice[],
  sceneIndex: SceneIndex
): Map<string, [number, number, number]> {
  const map = new Map<string, [number, number, number]>();
  if (!sceneIndex || !sceneIndex.school || !sceneIndex.layoutById) return map;
  const cal = sceneIndex.school.calibration;

  const layoutA = sceneIndex.layoutById.get('building-e'); // Dãy A (Building E)
  const layoutB = sceneIndex.layoutById.get('building-b'); // Dãy B
  const layoutCD = sceneIndex.layoutById.get('building-cd'); // Dãy CD

  // Tọa độ đặc biệt cho Dãy A (Corridor ở phía -x)
  if (layoutA) {
    const f1 = layoutA.floors[0];
    const f2 = layoutA.floors[1];
    const outerX = layoutA.bounds.minX - 0.08; // Mặt ngoài cùng hành lang
    const topY_F1 = (f1?.baseY ?? 0) + (f1?.height ?? 3.6) - 0.22; // Góc trên cùng tầng 1
    const topY_F2 = (f2?.baseY ?? 3.6) + (f2?.height ?? 3.6) - 0.22; // Góc trên cùng tầng 2

    // Cầu thang 1: pixel y 297-336 (tâm ~316)
    // Cầu thang 2: pixel y 402-440 (tâm ~421)
    const stair1_Z = pxY(cal, 316);
    const stair2_Z = pxY(cal, 421);

    // Tầng 1 (Trệt):
    // Hub 5: Đặt chỗ gần cầu thang dưới tầng 2, góc trên của tầng 1 (gần Stair 2, phục vụ P01, P02)
    map.set('hub-5', [outerX, topY_F1, stair2_Z]);
    // Hub 4: Đặt chỗ gần cầu thang 1 ở góc trên của tầng 1 (phục vụ P03, P04, P05, P06)
    map.set('hub-4', [outerX, topY_F1, stair1_Z]);

    // Tầng 2 (Lầu 1):
    // VNPT Gateway Dãy A
    map.set('gw-vnpt-a', [outerX, topY_F2, stair2_Z + 1.2]);
    // Hub 3 & Router tầng 2 gần Stair 2
    map.set('hub-3', [outerX, topY_F2, stair2_Z]);
    map.set('r-a-t2', [outerX + 0.35, topY_F2, stair2_Z - 0.5]);
    // Hub 2 gần Stair 1
    map.set('hub-2', [outerX, topY_F2, stair1_Z]);
    // WAP WiFi treo trần giữa tầng 2
    map.set('wap-a-t2', [outerX + 1.1, topY_F2 - 0.1, pxY(cal, 280)]);
  }

  // Tọa độ đặc biệt cho Dãy B (Corridor ở phía +x)
  if (layoutB) {
    const f2 = layoutB.floors[1];
    const outerX = layoutB.bounds.maxX + 0.08; // Mặt ngoài cùng hành lang
    const topY_F2 = (f2?.baseY ?? 3.6) + (f2?.height ?? 3.6) - 0.22; // Góc trên cùng lầu 1

    // Cầu thang 1 Dãy B: pixel y 301-340 (tâm ~320)
    // Cầu thang 2 Dãy B: pixel y 445-478 (tâm ~461)
    const stair1_Z = pxY(cal, 320);
    const stair2_Z = pxY(cal, 461);

    // VNPT Gateway Dãy B đặt tại buồng thang 1
    map.set('gw-vnpt-b', [outerX, topY_F2, stair1_Z - 0.8]);
    // Hub 1: Đặt tại tầng 2 bên ngoài dãy ngay hành lang nối CD với B theo sơ đồ mạng
    const cornerMid = rectToWorld(cal, { x0: 484, y0: 220, x1: 520, y1: 242 });
    map.set('hub-1', [cornerMid.cx, topY_F2, cornerMid.maxZ + 0.08]);

    // Các Router phụ trách các cặp phòng đặt ngoài hành lang tại buồng thang / góc trên
    map.set('r-b-p19-p20', [outerX, topY_F2, pxY(cal, 275)]);
    map.set('r-b-p21-p22', [outerX, topY_F2, stair1_Z]);
    map.set('r-b-p23-p24', [outerX, topY_F2, stair2_Z]);
  }

  // Tọa độ cho Dãy CD (Phòng máy 1, 2, Thư viện, TH Lý)
  if (layoutCD) {
    const f2 = layoutCD.floors[1];
    const floorY = (f2?.baseY ?? 3.6) + 0.25; // Mặt sàn lầu 1
    const switchY = floorY + 0.18; // Switch để ngay dưới mặt sàn (trên chân đế sàn)

    // PM1 (Phòng Máy 1): 3 Switch tách rời nhau để dưới mặt đất, cách nhau 3.2m
    const pm1Entry = sceneIndex.roomById.get('room-c-vi-tinh-1');
    if (pm1Entry) {
      const { cx, cz } = pm1Entry.roomLayout.volume;
      // Router VNPT đặt ở bàn điều khiển mạng phía vách
      map.set('r-cd-pm1', [cx - 4.5, floorY + 0.75, cz - 1.8]);
      // 3 Switch rời nhau cách 3.2m đặt dưới mặt sàn
      map.set('sw-pm1-1', [cx - 3.2, switchY, cz - 1.8]);
      map.set('sw-pm1-2', [cx + 0.0, switchY, cz - 1.8]);
      map.set('sw-pm1-3', [cx + 3.2, switchY, cz - 1.8]);
      map.set('pc-pm1-cluster', [cx, floorY + 0.75, cz]);
    }

    // PM2 (Phòng Máy 2): 3 Switch tách rời nhau để dưới mặt đất, cách nhau 3.2m
    const pm2Entry = sceneIndex.roomById.get('room-c-vi-tinh-2');
    if (pm2Entry) {
      const { cx, cz } = pm2Entry.roomLayout.volume;
      map.set('r-cd-pm2', [cx - 4.5, floorY + 0.75, cz - 1.8]);
      map.set('sw-pm2-1', [cx - 3.2, switchY, cz - 1.8]);
      map.set('sw-pm2-2', [cx + 0.0, switchY, cz - 1.8]);
      map.set('sw-pm2-3', [cx + 3.2, switchY, cz - 1.8]);
      map.set('pc-pm2-cluster', [cx, floorY + 0.75, cz]);
    }
  }

  // Tọa độ cho tất cả các thiết bị còn lại (Máy tính lớp học, Camera...)
  for (const dev of devices) {
    if (map.has(dev.id)) continue;

    if (dev.location.roomId) {
      const roomEntry = sceneIndex.roomById.get(dev.location.roomId);
      if (roomEntry) {
        const { roomLayout, floorLayout } = roomEntry;
        const b = roomEntry.building;
        const isAlongY = b.axis === 'y';

        // Kiểm tra xem phòng có phải là phòng vi tính không (2 phòng vi tính giữ nguyên cấu trúc lab riêng)
        const isLab = dev.location.roomId.includes('vi-tinh');

        if (!isLab && (dev.type === 'pc' || dev.type === 'camera')) {
          const { cx, cz, sx, sz } = roomLayout.volume;
          const minX = cx - sx / 2;
          const maxX = cx + sx / 2;
          const minZ = cz - sz / 2;
          const maxZ = cz + sz / 2;

          let doorCornerX: number;
          let doorCornerZ: number;
          let pcOppositeDoorX: number;
          let pcOppositeDoorZ: number;

          if (isAlongY) {
            // Dãy A và Dãy B: Cửa ra vào nằm trên vách hành lang ở vị trí l0 + offset (minZ + 1.4m)
            const isCorridorPlusX = b.corridor.side.startsWith('+');
            // Cửa ra vào ở vách hành lang
            const doorZ = minZ + 1.4;
            // Camera an ninh: Nằm ở góc trên cùng ngay sát cửa ra vào
            doorCornerX = isCorridorPlusX ? maxX - 0.35 : minX + 0.35;
            doorCornerZ = minZ + 0.35;

            // Máy tính: Nằm ở vị trí ĐỐI DIỆN CỬA RA VÀO (bên vách đối diện cửa)
            // Cửa ở vách hành lang -> Đối diện cửa là vách bên kia phòng theo chiều X, ngang tầm cửa (doorZ)
            pcOppositeDoorX = isCorridorPlusX ? minX + 1.15 : maxX - 1.15;
            pcOppositeDoorZ = doorZ;
          } else {
            // Dãy C·D: Chiều dài theo trục X, cửa ở vách hành lang tại minX + 1.4m
            const isCorridorPlusZ = b.corridor.side.startsWith('+');
            const doorX = minX + 1.4;
            // Camera an ninh: Góc trên cùng sát cửa ra vào
            doorCornerX = minX + 0.35;
            doorCornerZ = isCorridorPlusZ ? maxZ - 0.35 : minZ + 0.35;

            // Máy tính: Nằm ở vị trí ĐỐI DIỆN CỬA RA VÀO (bên vách đối diện cửa theo chiều Z)
            pcOppositeDoorX = doorX;
            pcOppositeDoorZ = isCorridorPlusZ ? minZ + 1.15 : maxZ - 1.15;
          }

          // Camera an ninh: Nằm ở góc trên cùng chỗ cửa ra vào của góc phòng
          if (dev.type === 'camera') {
            const topY = floorLayout.baseY + floorLayout.height - 0.22;
            map.set(dev.id, [doorCornerX, topY, doorCornerZ]);
            continue;
          }

          // Máy tính: Đặt tại vị trí đối diện cửa ra vào của mỗi phòng học
          if (dev.type === 'pc') {
            const deskY = floorLayout.baseY + 0.78;
            map.set(dev.id, [pcOppositeDoorX, deskY, pcOppositeDoorZ]);
            continue;
          }
        }

        const wx = roomLayout.volume.cx + dev.location.localPosition[0];
        const wy = floorLayout.baseY + roomLayout.volume.cy + dev.location.localPosition[1];
        const wz = roomLayout.volume.cz + dev.location.localPosition[2];
        map.set(dev.id, [wx, wy, wz]);
        continue;
      }
    }
  }

  return map;
}

/**
 * Sinh danh sách các máy tính thực hành mô phỏng trong Phòng Máy 1 & Phòng Máy 2
 * Được phân chia logic cho 3 Switch đặt dưới mặt sàn ở mỗi phòng
 */
export function generateLabWorkstations(sceneIndex: SceneIndex): ComputerLabWorkstation[] {
  const workstations: ComputerLabWorkstation[] = [];
  if (!sceneIndex || !sceneIndex.roomById) return workstations;

  const labs = [
    { roomId: 'room-c-vi-tinh-1', labName: 'Phòng Máy 1' },
    { roomId: 'room-c-vi-tinh-2', labName: 'Phòng Máy 2' },
  ];

  for (const lab of labs) {
    const entry = sceneIndex.roomById.get(lab.roomId);
    if (!entry) continue;

    const { roomLayout, floorLayout } = entry;
    const baseY = floorLayout.baseY;
    const floorY = baseY + 0.25;
    const deskY = floorY + 0.72;
    const switchY = floorY + 0.18;
    const { cx, cz } = roomLayout.volume;

    // 3 Cụm máy tính riêng biệt, mỗi cụm kết nối trực tiếp với 1 Switch đặt dưới mặt sàn
    const clusters = [
      {
        switchId: lab.roomId === 'room-c-vi-tinh-1' ? 'sw-pm1-1' : 'sw-pm2-1',
        switchCode: lab.roomId === 'room-c-vi-tinh-1' ? 'SW-PM1-01' : 'SW-PM2-01',
        switchLabel: lab.roomId === 'room-c-vi-tinh-1' ? 'Switch 1' : 'Switch 1',
        groupName: 'Cụm máy 1 (Bên trái)',
        switchPos: [cx - 3.2, switchY, cz - 1.8] as [number, number, number],
        computers: [
          [cx - 3.8, cz - 0.7],
          [cx - 2.6, cz - 0.7],
          [cx - 3.8, cz + 0.9],
          [cx - 2.6, cz + 0.9],
        ],
      },
      {
        switchId: lab.roomId === 'room-c-vi-tinh-1' ? 'sw-pm1-2' : 'sw-pm2-2',
        switchCode: lab.roomId === 'room-c-vi-tinh-1' ? 'SW-PM1-02' : 'SW-PM2-02',
        switchLabel: lab.roomId === 'room-c-vi-tinh-1' ? 'Switch 2' : 'Switch 2',
        groupName: 'Cụm máy 2 (Ở giữa)',
        switchPos: [cx + 0.0, switchY, cz - 1.8] as [number, number, number],
        computers: [
          [cx - 0.6, cz - 0.7],
          [cx + 0.6, cz - 0.7],
          [cx - 0.6, cz + 0.9],
          [cx + 0.6, cz + 0.9],
        ],
      },
      {
        switchId: lab.roomId === 'room-c-vi-tinh-1' ? 'sw-pm1-3' : 'sw-pm2-3',
        switchCode: lab.roomId === 'room-c-vi-tinh-1' ? 'SW-PM1-03' : 'SW-PM2-03',
        switchLabel: lab.roomId === 'room-c-vi-tinh-1' ? 'Switch 3' : 'Switch 3',
        groupName: 'Cụm máy 3 (Bên phải)',
        switchPos: [cx + 3.2, switchY, cz - 1.8] as [number, number, number],
        computers: [
          [cx + 2.6, cz - 0.7],
          [cx + 3.8, cz - 0.7],
          [cx + 2.6, cz + 0.9],
          [cx + 3.8, cz + 0.9],
        ],
      },
    ];

    let wsIndex = 1;
    for (const cluster of clusters) {
      for (const comp of cluster.computers) {
        const posX = comp[0] as number;
        const posZ = comp[1] as number;
        // Tuyến cáp xuất phát từ cổng RJ45 của Switch trên mặt sàn, chạy theo nẹp sàn tới sau máy tính
        const cableDropPoints: [number, number, number][] = [
          [cluster.switchPos[0], cluster.switchPos[1] + 0.04, cluster.switchPos[2] + 0.36],
          [cluster.switchPos[0], floorY + 0.03, cluster.switchPos[2] + 0.55],
          [posX, floorY + 0.03, posZ - 0.2],
          [posX + 0.48, deskY - 0.42, posZ - 0.2],
          [posX + 0.48, deskY - 0.42, posZ - 0.31],
        ];

        workstations.push({
          id: `${lab.roomId}-ws-${wsIndex}`,
          roomId: lab.roomId,
          labName: lab.labName,
          position: [posX, deskY, posZ],
          cableDropPoints,
          switchCode: cluster.switchCode,
          switchLabel: `${cluster.switchLabel} (${lab.labName})`,
          groupName: cluster.groupName,
        });
        wsIndex++;
      }
    }
  }

  return workstations;
}

/**
 * Định tuyến đường cáp 3D theo đúng yêu cầu:
 * 1. Chạy ở MẶT NGOÀI CỦA DÃY Ở PHÍA TRÊN CÙNG (máng cáp ngoại vi).
 * 2. ĐI VÀO PHÒNG Ở VỊ TRÍ TRÊN CÙNG CỦA PHÒNG (qua đà/vách trên cửa sổ).
 * 3. THẢ THẲNG DÂY XUỐNG CẮM CHÍNH XÁC VÀO MÁY TÍNH / THIẾT BỊ.
 */
export function resolveConnections(
  connections: NetworkConnection[],
  devicePositions: Map<string, [number, number, number]>,
  sceneIndex: SceneIndex
): ResolvedNetworkConnection[] {
  const result: ResolvedNetworkConnection[] = [];
  if (!sceneIndex || !sceneIndex.layoutById || !sceneIndex.roomById) return result;
  const layoutA = sceneIndex.layoutById.get('building-e');
  const layoutB = sceneIndex.layoutById.get('building-b');
  const layoutCD = sceneIndex.layoutById.get('building-cd');

  for (const conn of connections) {
    const p1 = devicePositions.get(conn.fromDeviceId);
    const p2 = devicePositions.get(conn.toDeviceId);
    if (!p1 || !p2) continue;

    let points: [number, number, number][];

    // Kiểm tra nếu là kết nối tới máy tính phòng học (PC-P01..12 hoặc PC-P19..24)
    if (conn.toDeviceId.startsWith('pc-p') || conn.toDeviceId.startsWith('cam-p')) {
      const roomNo = conn.toDeviceId.replace(/^(pc|cam)-p/, '');
      const roomId = `room-p${roomNo}`;
      const roomEntry = sceneIndex.roomById.get(roomId);

      if (roomEntry) {
        const { roomLayout, floorLayout } = roomEntry;
        const b = roomEntry.building;
        const isBuildingA = b.id === 'building-e';
        const isBuildingB = b.id === 'building-b';

        // Tọa độ mép ngoài hành lang trên cùng
        const outerX = isBuildingA
          ? layoutA!.bounds.minX - 0.08
          : isBuildingB
            ? layoutB!.bounds.maxX + 0.08
            : p1[0];

        const topCeilingY = floorLayout.baseY + floorLayout.height - 0.22;
        const roomWallX = roomLayout.volume.cx + (isBuildingA ? -roomLayout.volume.sx / 2 : roomLayout.volume.sx / 2);

        // Đường dẫn dây logic tuyệt đối:
        // 1. Xuất phát từ Hub (p1) trên máng ngoài
        // 2. Chạy dọc máng cáp mặt ngoài trên cùng đến ngang phòng (outerX, topCeilingY, p2[2])
        // 3. Đâm xuyên qua tường trên cùng vào trong phòng (roomWallX, topCeilingY, p2[2])
        // 4. Đi trên trần phòng đến ngay phía trên máy tính (p2[0], topCeilingY, p2[2])
        // 5. Thả ống gen đứng thẳng xuống cắm thẳng vào cổng mạng sau máy tính (p2[0], p2[1] + 0.1, p2[2])
        points = [
          p1,
          [outerX, topCeilingY, p1[2]],
          [outerX, topCeilingY, p2[2]],
          [roomWallX, topCeilingY, p2[2]],
          [p2[0], topCeilingY, p2[2]],
          [p2[0], p2[1] + 0.1, p2[2]],
          p2,
        ];

        result.push({ connection: conn, points });
        continue;
      }
    }

    // Tuyến trục thẳng đứng xuyên sàn (Riser Hub 5 -> VNPT Gateway Dãy A)
    if (conn.routingType === 'riser') {
      points = [
        p1,
        [p1[0], p2[1], p1[2]],
        p2,
      ];
      result.push({ connection: conn, points });
      continue;
    }

    // Tuyến liên tòa (Từ Hub 1 ngay hành lang nối B-CD sang các phòng Dãy C·D chạy sát mép Dãy C·D)
    if (conn.routingType === 'inter-building') {
      const topY = Math.max(p1[1], p2[1]);
      // Mép máng cáp mặt ngoài hành lang Dãy CD (trục +z)
      const cdWallZ = layoutCD ? layoutCD.bounds.maxZ + 0.08 : p1[2];

      points = [
        p1,                         // Xuất phát từ Hub 1 tại hành lang nối B-CD
        [p1[0], topY, cdWallZ],     // Tiếp giáp máng cáp mặt ngoài Dãy CD
        [p2[0], topY, cdWallZ],     // CHẠY HOÀN TOÀN SÁT DÃY CD theo trục X!
        [p2[0], topY, p2[2]],       // Rẽ vào phòng qua trần
        p2,                         // Thả xuống thiết bị
      ];
      result.push({ connection: conn, points });
      continue;
    }

    // Tuyến nội bộ phòng máy: từ Router VNPT chạy rãnh cáp sàn đến từng Switch đặt dưới mặt đất
    if (conn.fromDeviceId.startsWith('r-cd-pm') && conn.toDeviceId.startsWith('sw-pm')) {
      const floorRacewayY = (p2[1] - 0.18) + 0.04;
      points = [
        p1,
        [p1[0], floorRacewayY, p1[2]],
        [p2[0], floorRacewayY, p1[2]],
        [p2[0], p2[1], p2[2] - 0.25],
        p2,
      ];
      result.push({ connection: conn, points });
      continue;
    }

    // Tuyến hành lang tiêu chuẩn
    const topY = Math.max(p1[1], p2[1]);
    points = [
      p1,
      [p1[0], topY, p1[2]],
      [p1[0], topY, p2[2]],
      [p2[0], topY, p2[2]],
      p2,
    ];

    result.push({ connection: conn, points });
  }

  return result;
}

/**
 * Xây dựng Three.js Tube geometry dày dặn, nổi bật từ danh sách điểm
 */
export function createTubeFromPoints(points: [number, number, number][], radius = 0.04): THREE.BufferGeometry {
  const vectors = points.map((p) => new THREE.Vector3(p[0], p[1], p[2]));
  const curve = new THREE.CatmullRomCurve3(vectors, false, 'catmullrom', 0.05);
  return new THREE.TubeGeometry(curve, Math.max(points.length * 6, 16), radius, 8, false);
}
