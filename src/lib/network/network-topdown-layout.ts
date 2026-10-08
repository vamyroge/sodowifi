import { NETWORK_TOPOLOGY } from '../../data/network/network-topology';
import type {
  NetworkDevice,
  LayoutNode,
  LayoutEdge,
  CableMedium,
} from '../../types/network';
import { getDeviceIp } from './network-2d-layout';

export interface SchoolBuildingPlan {
  id: string;
  code: string;
  name: string;
  drawnRect: { x0: number; y0: number; x1: number; y1: number };
  footprint: { x0: number; y0: number; x1: number; y1: number };
  color: string;
  rooms: Array<{
    id: string;
    label: string;
    level: number;
    rect: { x0: number; y0: number; x1: number; y1: number };
  }>;
}

export interface OutdoorFacilityPlan {
  id: string;
  name: string;
  icon: string;
  rect: { x0: number; y0: number; x1: number; y1: number };
  color: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. DỮ LIỆU MẶT BẰNG TRƯỜNG THEO ẢNH SODOTRUONG.JPG (1280 × 960 px)
// ─────────────────────────────────────────────────────────────────────────────

export const SCHOOL_IMAGE_DIMS = {
  width: 1280,
  height: 960,
  imageSrc: '/reference/sodotruong.jpg',
};

export const SCHOOL_BUILDINGS_PLAN: SchoolBuildingPlan[] = [
  // Dãy B (Giữa - Trái)
  {
    id: 'building-b',
    code: 'B',
    name: 'Dãy B · P.16 – P.24 & Phòng chức năng',
    drawnRect: { x0: 378, y0: 217, x1: 520, y1: 545 },
    footprint: { x0: 414, y0: 217, x1: 484, y1: 545 },
    color: '#0284c7', // Sky Blue
    rooms: [
      { id: 'room-p19', label: 'P.19 (Lầu 1)', level: 1, rect: { x0: 378, y0: 217, x1: 445, y1: 258 } },
      { id: 'room-p20', label: 'P.20 (Lầu 1)', level: 1, rect: { x0: 378, y0: 258, x1: 445, y1: 301 } },
      { id: 'stair-b-1', label: 'Cầu thang 1', level: 1, rect: { x0: 378, y0: 301, x1: 520, y1: 340 } },
      { id: 'room-p21', label: 'P.21 (Lầu 1)', level: 1, rect: { x0: 378, y0: 340, x1: 445, y1: 392 } },
      { id: 'room-p22', label: 'P.22 (Lầu 1)', level: 1, rect: { x0: 378, y0: 392, x1: 445, y1: 445 } },
      { id: 'stair-b-2', label: 'Cầu thang 2', level: 1, rect: { x0: 378, y0: 445, x1: 520, y1: 478 } },
      { id: 'room-p23', label: 'P.23 (Lầu 1)', level: 1, rect: { x0: 378, y0: 478, x1: 445, y1: 512 } },
      { id: 'room-p24', label: 'P.24 (Lầu 1)', level: 1, rect: { x0: 378, y0: 512, x1: 445, y1: 545 } },
    ],
  },

  // Dãy C·D (Phía sau sân khấu, chạy theo trục ngang X)
  {
    id: 'building-cd',
    code: 'C·D',
    name: 'Dãy C·D · Phòng Vi Tính & Thư Viện',
    drawnRect: { x0: 520, y0: 162, x1: 1027, y1: 272 },
    footprint: { x0: 520, y0: 187, x1: 1027, y1: 247 },
    color: '#059669', // Emerald
    rooms: [
      { id: 'room-c-vi-tinh-2', label: 'P. Vi tính II (Lầu 1)', level: 1, rect: { x0: 520, y0: 197, x1: 640, y1: 232 } },
      { id: 'room-c-vi-tinh-1', label: 'P. Vi tính I (Lầu 1 - 37 PC)', level: 1, rect: { x0: 640, y0: 197, x1: 760, y1: 232 } },
      { id: 'stair-cd', label: 'Cầu thang C·D', level: 1, rect: { x0: 760, y0: 162, x1: 822, y1: 272 } },
      { id: 'room-d-thu-vien', label: 'Thư viện (Lầu 1)', level: 1, rect: { x0: 892, y0: 202, x1: 1027, y1: 237 } },
      { id: 'room-d-th-ly', label: 'TH Vật lí (Trệt)', level: 0, rect: { x0: 892, y0: 237, x1: 1027, y1: 272 } },
    ],
  },

  // Dãy A (Building E trong 3D - Dãy phòng học phía Bắc, phải ảnh)
  {
    id: 'building-e',
    code: 'A',
    name: 'Dãy A · P.01 – P.12',
    drawnRect: { x0: 1052, y0: 232, x1: 1167, y1: 508 },
    footprint: { x0: 1081, y0: 232, x1: 1138, y1: 508 },
    color: '#7c3aed', // Purple
    rooms: [
      { id: 'room-p07', label: 'P.07 (Lầu 1)', level: 1, rect: { x0: 1110, y0: 232, x1: 1167, y1: 268 } },
      { id: 'room-p08', label: 'P.08 (Lầu 1 - WAP)', level: 1, rect: { x0: 1110, y0: 268, x1: 1167, y1: 304 } },
      { id: 'stair-a-1', label: 'Cầu thang A1', level: 1, rect: { x0: 1052, y0: 304, x1: 1167, y1: 340 } },
      { id: 'room-p09', label: 'P.09 (Lầu 1)', level: 1, rect: { x0: 1110, y0: 340, x1: 1167, y1: 376 } },
      { id: 'room-p10', label: 'P.10 (Lầu 1)', level: 1, rect: { x0: 1110, y0: 376, x1: 1167, y1: 412 } },
      { id: 'stair-a-2', label: 'Cầu thang A2 (VNPT A)', level: 1, rect: { x0: 1052, y0: 412, x1: 1167, y1: 448 } },
      { id: 'room-p11', label: 'P.11 (Lầu 1)', level: 1, rect: { x0: 1110, y0: 448, x1: 1167, y1: 480 } },
      { id: 'room-p12', label: 'P.12 (Lầu 1)', level: 1, rect: { x0: 1110, y0: 480, x1: 1167, y1: 508 } },
    ],
  },

  // Dãy C (Building A trong 3D - Dãy phòng học P.25 – P.44 phía Tây Nam)
  {
    id: 'building-a',
    code: 'C',
    name: 'Dãy C · P.25 – P.44',
    drawnRect: { x0: 105, y0: 112, x1: 235, y1: 542 },
    footprint: { x0: 137, y0: 112, x1: 203, y1: 542 },
    color: '#64748b', // Slate
    rooms: [],
  },

  // Dãy F (Khối Hiệu bộ - Hành chính)
  {
    id: 'building-f',
    code: 'F',
    name: 'Dãy F · Khối Hiệu Bộ – Hành Chính',
    drawnRect: { x0: 987, y0: 543, x1: 1207, y1: 802 },
    footprint: { x0: 987, y0: 570, x1: 1207, y1: 802 },
    color: '#ea580c', // Orange
    rooms: [],
  },
];

export const SCHOOL_OUTDOOR_PLAN: OutdoorFacilityPlan[] = [
  { id: 'san-bong', name: 'Sân bóng đá', icon: '⚽', rect: { x0: 707, y0: 25, x1: 1093, y1: 130 }, color: '#15803d' },
  { id: 'hoi-truong', name: 'Hội trường', icon: '🏛️', rect: { x0: 260, y0: 27, x1: 390, y1: 142 }, color: '#b45309' },
  { id: 'ho-boi', name: 'Hồ bơi', icon: '🏊', rect: { x0: 1160, y0: 38, x1: 1235, y1: 107 }, color: '#0284c7' },
  { id: 'nha-thi-dau', name: 'Nhà thi đấu đa năng', icon: '🏀', rect: { x0: 1177, y0: 153, x1: 1245, y1: 237 }, color: '#d97706' },
  { id: 'san-khau', name: 'Sân khấu chào cờ', icon: '🎭', rect: { x0: 678, y0: 277, x1: 880, y1: 319 }, color: '#475569' },
  { id: 'cot-co', name: 'Cột cờ trung tâm', icon: '🚩', rect: { x0: 740, y0: 407, x1: 820, y1: 480 }, color: '#dc2626' },
  { id: 'nha-xe', name: 'Nhà để xe', icon: '🛵', rect: { x0: 122, y0: 797, x1: 350, y1: 848 }, color: '#64748b' },
  { id: 'cong-chinh', name: 'Cổng chính & Bảo vệ', icon: '🚪', rect: { x0: 557, y0: 825, x1: 797, y1: 865 }, color: '#2563eb' },
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. TỌA ĐỘ VỊ TRÍ THIẾT BỊ MẠNG TRÊN MẶT BẰNG SODOTRUONG.JPG (Top-down)
// ─────────────────────────────────────────────────────────────────────────────

export interface TopDownNodePosition {
  x: number;
  y: number;
  width: number;
  height: number;
  cluster: 'b-cd' | 'a';
}

export const TOPDOWN_DEVICE_COORDINATES: Record<string, TopDownNodePosition> = {
  // ── DÃY B ──
  'gw-vnpt-b': { x: 485, y: 320, width: 95, height: 38, cluster: 'b-cd' }, // VNPT Dãy B tại buồng thang 1
  'hub-1': { x: 505, y: 228, width: 85, height: 34, cluster: 'b-cd' },     // Hub 1 tại góc hành lang nối CD
  'r-b-p19-p20': { x: 480, y: 260, width: 80, height: 32, cluster: 'b-cd' },
  'r-b-p21-p22': { x: 480, y: 366, width: 80, height: 32, cluster: 'b-cd' },
  'r-b-p23-p24': { x: 480, y: 495, width: 80, height: 32, cluster: 'b-cd' },

  // Endpoints P19..P24 trong phòng
  'pc-p19': { x: 412, y: 238, width: 48, height: 24, cluster: 'b-cd' },
  'cam-p19': { x: 436, y: 248, width: 44, height: 22, cluster: 'b-cd' },
  'pc-p20': { x: 412, y: 280, width: 48, height: 24, cluster: 'b-cd' },
  'cam-p20': { x: 436, y: 290, width: 44, height: 22, cluster: 'b-cd' },

  'pc-p21': { x: 412, y: 366, width: 48, height: 24, cluster: 'b-cd' },
  'cam-p21': { x: 436, y: 378, width: 44, height: 22, cluster: 'b-cd' },
  'pc-p22': { x: 412, y: 418, width: 48, height: 24, cluster: 'b-cd' },
  'cam-p22': { x: 436, y: 430, width: 44, height: 22, cluster: 'b-cd' },

  'pc-p23': { x: 412, y: 495, width: 48, height: 24, cluster: 'b-cd' },
  'cam-p23': { x: 436, y: 505, width: 44, height: 22, cluster: 'b-cd' },
  'pc-p24': { x: 412, y: 528, width: 48, height: 24, cluster: 'b-cd' },
  'cam-p24': { x: 436, y: 538, width: 44, height: 22, cluster: 'b-cd' },

  // ── DÃY C·D ──
  // PM1
  'r-cd-pm1': { x: 700, y: 198, width: 84, height: 32, cluster: 'b-cd' },
  'sw-pm1-1': { x: 672, y: 215, width: 48, height: 22, cluster: 'b-cd' },
  'sw-pm1-2': { x: 700, y: 215, width: 48, height: 22, cluster: 'b-cd' },
  'sw-pm1-3': { x: 728, y: 215, width: 48, height: 22, cluster: 'b-cd' },
  'pc-pm1-cluster': { x: 700, y: 240, width: 100, height: 28, cluster: 'b-cd' },

  // PM2
  'r-cd-pm2': { x: 580, y: 198, width: 84, height: 32, cluster: 'b-cd' },
  'sw-pm2-1': { x: 552, y: 215, width: 48, height: 22, cluster: 'b-cd' },
  'sw-pm2-2': { x: 580, y: 215, width: 48, height: 22, cluster: 'b-cd' },
  'sw-pm2-3': { x: 608, y: 215, width: 48, height: 22, cluster: 'b-cd' },
  'pc-pm2-cluster': { x: 580, y: 240, width: 95, height: 28, cluster: 'b-cd' },

  // Thư viện & TH Lý
  'pc-thu-vien': { x: 960, y: 215, width: 75, height: 26, cluster: 'b-cd' },
  'pc-th-ly': { x: 960, y: 252, width: 75, height: 26, cluster: 'b-cd' },

  // ── DÃY A (BUILDING E) ──
  'gw-vnpt-a': { x: 1070, y: 430, width: 95, height: 38, cluster: 'a' }, // VNPT Dãy A tại buồng thang 2
  'hub-3': { x: 1070, y: 405, width: 75, height: 30, cluster: 'a' },
  'r-a-t2': { x: 1045, y: 405, width: 70, height: 28, cluster: 'a' },
  'hub-2': { x: 1070, y: 318, width: 75, height: 30, cluster: 'a' },
  'wap-a-t2': { x: 1045, y: 282, width: 72, height: 28, cluster: 'a' },

  'hub-5': { x: 1092, y: 445, width: 75, height: 30, cluster: 'a' }, // Tầng trệt
  'hub-4': { x: 1092, y: 338, width: 75, height: 30, cluster: 'a' }, // Cascade từ Hub 5

  // Endpoints P.01..P.06 (Trệt)
  'pc-p01': { x: 1138, y: 495, width: 46, height: 22, cluster: 'a' },
  'cam-p01': { x: 1155, y: 502, width: 42, height: 20, cluster: 'a' },
  'pc-p02': { x: 1138, y: 465, width: 46, height: 22, cluster: 'a' },
  'cam-p02': { x: 1155, y: 472, width: 42, height: 20, cluster: 'a' },
  'pc-p03': { x: 1138, y: 395, width: 46, height: 22, cluster: 'a' },
  'cam-p03': { x: 1155, y: 402, width: 42, height: 20, cluster: 'a' },
  'pc-p04': { x: 1138, y: 360, width: 46, height: 22, cluster: 'a' },
  'cam-p04': { x: 1155, y: 367, width: 42, height: 20, cluster: 'a' },
  'pc-p05': { x: 1138, y: 285, width: 46, height: 22, cluster: 'a' },
  'cam-p05': { x: 1155, y: 292, width: 42, height: 20, cluster: 'a' },
  'pc-p06': { x: 1138, y: 250, width: 46, height: 22, cluster: 'a' },
  'cam-p06': { x: 1155, y: 257, width: 42, height: 20, cluster: 'a' },

  // Endpoints P.07..P.12 (Lầu 1)
  'pc-p07': { x: 1120, y: 242, width: 46, height: 22, cluster: 'a' },
  'cam-p07': { x: 1135, y: 248, width: 42, height: 20, cluster: 'a' },
  'pc-p08': { x: 1120, y: 275, width: 46, height: 22, cluster: 'a' },
  'cam-p08': { x: 1135, y: 282, width: 42, height: 20, cluster: 'a' },
  'pc-p09': { x: 1120, y: 348, width: 46, height: 22, cluster: 'a' },
  'cam-p09': { x: 1135, y: 355, width: 42, height: 20, cluster: 'a' },
  'pc-p10': { x: 1120, y: 385, width: 46, height: 22, cluster: 'a' },
  'cam-p10': { x: 1135, y: 392, width: 42, height: 20, cluster: 'a' },
  'pc-p11': { x: 1120, y: 455, width: 46, height: 22, cluster: 'a' },
  'cam-p11': { x: 1135, y: 462, width: 42, height: 20, cluster: 'a' },
  'pc-p12': { x: 1120, y: 490, width: 46, height: 22, cluster: 'a' },
  'cam-p12': { x: 1135, y: 498, width: 42, height: 20, cluster: 'a' },
};

/**
 * Tạo đường dẫn cáp mạng thực tế trên mặt bằng (chạy dọc hành lang và nối các phòng)
 */
export function buildTopDownCables(
  _connId: string,
  fromId: string,
  toId: string,
  fromPos: TopDownNodePosition,
  toPos: TopDownNodePosition
): string {
  const fx = fromPos.x;
  const fy = fromPos.y;
  const tx = toPos.x;
  const ty = toPos.y;

  // 1. Tuyến liên tòa đặc biệt: Từ Hub 1 (Dãy B) sang Dãy C·D
  if (fromId === 'hub-1' && toId.startsWith('r-cd-pm')) {
    // Chạy từ Hub 1 (505, 228) -> ngoặt lên góc hành lang mái che (505, 198) -> chạy ngang sang Dãy CD
    return `M ${fx} ${fy} L 505 198 L ${tx} 198 L ${tx} ${ty}`;
  }

  if (fromId === 'hub-1' && (toId === 'pc-thu-vien' || toId === 'pc-th-ly')) {
    // Chạy từ Hub 1 dọc hành lang Dãy CD qua hết các phòng máy đến Thư viện
    return `M ${fx} ${fy} L 505 188 L ${tx} 188 L ${tx} ${ty}`;
  }

  // 2. Tuyến nội bộ phòng máy PM1 & PM2: Từ router xuống switch
  if (fromId.startsWith('r-cd-pm') && toId.startsWith('sw-pm')) {
    return `M ${fx} ${fy} L ${tx} ${ty}`;
  }

  if (fromId.startsWith('sw-pm') && toId.startsWith('pc-pm')) {
    return `M ${fx} ${fy} L ${tx} ${ty}`;
  }

  // 3. Tuyến dọc hành lang Dãy B (Router nối tới các phòng P.19..24)
  if (fromId.startsWith('r-b-') || fromId === 'gw-vnpt-b') {
    if (Math.abs(fx - tx) > 20) {
      // Đi ra máng hành lang trước rồi rẽ vào phòng
      return `M ${fx} ${fy} L ${fx} ${ty} L ${tx} ${ty}`;
    }
  }

  // 4. Tuyến Dãy A (VNPT A nối Hub 2, 3, 5, 4 dọc hành lang)
  if (fromId.startsWith('gw-vnpt-a') || fromId.startsWith('hub-')) {
    if (Math.abs(fx - tx) > 15) {
      return `M ${fx} ${fy} L ${fx} ${ty} L ${tx} ${ty}`;
    }
  }

  // Tuyến thẳng / gập góc tiêu chuẩn
  const midX = (fx + tx) / 2;
  return `M ${fx} ${fy} L ${midX} ${fy} L ${midX} ${ty} L ${tx} ${ty}`;
}

/**
 * Xây dựng toàn bộ layout 2D Top-Down theo khung ảnh sodotruong.jpg
 */
export function buildTopDownLayout(clusterFilter: 'all' | 'b-cd' | 'a' = 'all'): {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  bounds: { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number };
} {
  const nodes: LayoutNode[] = [];
  const edges: LayoutEdge[] = [];

  const deviceMap = new Map<string, NetworkDevice>();
  for (const d of NETWORK_TOPOLOGY.devices) {
    deviceMap.set(d.id, d);
  }

  // Tạo các LayoutNode dựa trên TOPDOWN_DEVICE_COORDINATES
  Object.entries(TOPDOWN_DEVICE_COORDINATES).forEach(([id, pos]) => {
    if (clusterFilter !== 'all' && pos.cluster !== clusterFilter) {
      return;
    }

    const dev = deviceMap.get(id);
    if (!dev) return;

    nodes.push({
      id,
      device: dev,
      x: pos.x,
      y: pos.y,
      width: pos.width,
      height: pos.height,
      tier: 1,
      cluster: pos.cluster,
      status: 'online',
      ip: getDeviceIp(dev),
    });
  });

  const nodeMap = new Map<string, LayoutNode>();
  for (const n of nodes) {
    nodeMap.set(n.id, n);
  }

  // Tạo các LayoutEdge dựa trên connections thực tế
  for (const conn of NETWORK_TOPOLOGY.connections) {
    const fromPos = TOPDOWN_DEVICE_COORDINATES[conn.fromDeviceId];
    const toPos = TOPDOWN_DEVICE_COORDINATES[conn.toDeviceId];

    if (!fromPos || !toPos) continue;
    if (clusterFilter !== 'all' && (fromPos.cluster !== clusterFilter || toPos.cluster !== clusterFilter)) {
      continue;
    }

    const path = buildTopDownCables(conn.id, conn.fromDeviceId, conn.toDeviceId, fromPos, toPos);

    edges.push({
      id: `td-${conn.id}`,
      fromId: conn.fromDeviceId,
      toId: conn.toDeviceId,
      medium: conn.medium as CableMedium,
      path,
      cluster: fromPos.cluster,
      status: 'online',
    });
  }

  return {
    nodes,
    edges,
    bounds: {
      minX: 0,
      minY: 0,
      maxX: SCHOOL_IMAGE_DIMS.width,
      maxY: SCHOOL_IMAGE_DIMS.height,
      width: SCHOOL_IMAGE_DIMS.width,
      height: SCHOOL_IMAGE_DIMS.height,
    },
  };
}
