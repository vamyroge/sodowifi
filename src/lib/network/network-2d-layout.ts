import { NETWORK_TOPOLOGY } from '../../data/network/network-topology';
import type {
  NetworkClusterId,
  NetworkDevice,
  LayoutNode,
  LayoutEdge,
  TopologyLayout,
  CableMedium,
} from '../../types/network';

// Virtual WAN Root node when viewing all clusters
const WAN_INTERNET_NODE: NetworkDevice = {
  id: 'wan-isp',
  code: 'WAN-ISP',
  label: 'Internet FTTH VNPT (Gateway Trung Tâm)',
  type: 'gateway',
  location: {
    buildingId: 'telecom',
    floorId: 'telecom-core',
    roomName: 'Đường truyền Cáp quang VNPT Quảng Ngãi',
    localPosition: [0, 0, 0],
  },
  connectedDeviceIds: ['gw-vnpt-b', 'gw-vnpt-a'],
  metadata: {
    ipRange: '14.161.x.x / 1Gbps Cáp quang',
    notes: 'Đường truyền băng thông rộng phục vụ toàn trường THPT Số 1 Tư Nghĩa',
  },
  provenance: {
    sourceReferences: [{ image: 'sodomang.jpg', note: 'Điểm cấp Internet VNPT chính' }],
    confidence: 'high',
    estimated: false,
  },
};

/**
 * Returns formatted IP address or subnet for a device
 */
export function getDeviceIp(device: NetworkDevice): string {
  if (device.metadata?.ipRange) return device.metadata.ipRange;
  if (device.id === 'wan-isp') return '14.161.42.1 (WAN)';
  if (device.id === 'gw-vnpt-b') return '192.168.1.1/24';
  if (device.id === 'gw-vnpt-a') return '192.168.2.1/24';
  if (device.id === 'r-cd-pm1') return '192.168.10.1/24';
  if (device.id === 'r-cd-pm2') return '192.168.20.1/24';
  if (device.id === 'hub-1') return '192.168.1.2';
  if (device.id === 'wap-a-t2') return '192.168.2.50';
  if (device.id.startsWith('r-b-')) {
    const no = device.id.slice(-2);
    return `192.168.1.${no}`;
  }
  if (device.id.startsWith('pc-p')) {
    const pNo = parseInt(device.id.replace('pc-p', ''), 10);
    return isNaN(pNo) ? 'DHCP' : pNo <= 12 ? `192.168.2.${100 + pNo}` : `192.168.1.${100 + pNo}`;
  }
  if (device.id.startsWith('cam-p')) {
    const pNo = parseInt(device.id.replace('cam-p', ''), 10);
    return isNaN(pNo) ? 'DHCP' : pNo <= 12 ? `192.168.2.${200 + pNo}` : `192.168.1.${200 + pNo}`;
  }
  return 'DHCP';
}

/**
 * Generates orthogonal or smooth Bezier SVG path string between two coordinates
 */
export function generateEdgePath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  curveType: 'bezier' | 'orthogonal' = 'bezier'
): string {
  if (curveType === 'orthogonal') {
    const midY = (y1 + y2) / 2;
    return `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
  }
  // Smooth cubic bezier
  const dy = Math.abs(y2 - y1);
  const cpOffset = Math.max(30, dy * 0.45);
  return `M ${x1} ${y1} C ${x1} ${y1 + cpOffset}, ${x2} ${y2 - cpOffset}, ${x2} ${y2}`;
}

/**
 * Computes 2D topology positions for all nodes in the given cluster
 */
export function buildTopologyLayout(cluster: NetworkClusterId): TopologyLayout {
  const nodes: LayoutNode[] = [];
  const edges: LayoutEdge[] = [];
  const allDevicesMap = new Map<string, NetworkDevice>();

  for (const d of NETWORK_TOPOLOGY.devices) {
    allDevicesMap.set(d.id, d);
  }
  allDevicesMap.set(WAN_INTERNET_NODE.id, WAN_INTERNET_NODE);

  // Position dictionaries for clusters
  const positions = new Map<
    string,
    { x: number; y: number; width: number; height: number; tier: number; cluster: 'b-cd' | 'a' | 'wan' }
  >();

  // Helper to add position
  const setPos = (
    id: string,
    x: number,
    y: number,
    width = 180,
    height = 64,
    tier = 1,
    cl: 'b-cd' | 'a' | 'wan' = 'b-cd'
  ) => {
    positions.set(id, { x, y, width, height, tier, cluster: cl });
  };

  // ───────────────────────────────────────────────────────────────────────────
  // LAYOUT COORDINATES FOR CLUSTER B & CD
  // ───────────────────────────────────────────────────────────────────────────
  const buildClusterB_CD = (offsetX: number, offsetY: number) => {
    // Gateway B
    setPos('gw-vnpt-b', offsetX + 520, offsetY + 60, 210, 72, 1, 'b-cd');

    // Tier 2: Dãy B Routers (Left) & Hub 1 (Right)
    setPos('r-b-p19-p20', offsetX + 80, offsetY + 210, 170, 64, 2, 'b-cd');
    setPos('r-b-p21-p22', offsetX + 270, offsetY + 210, 170, 64, 2, 'b-cd');
    setPos('r-b-p23-p24', offsetX + 460, offsetY + 210, 170, 64, 2, 'b-cd');
    setPos('hub-1', offsetX + 780, offsetY + 210, 190, 64, 2, 'b-cd');

    // Tier 3:
    // Under Dãy B Routers: Phòng 19..24 endpoints
    setPos('pc-p19', offsetX + 40, offsetY + 350, 110, 52, 3, 'b-cd');
    setPos('cam-p19', offsetX + 40, offsetY + 420, 110, 52, 3, 'b-cd');
    setPos('pc-p20', offsetX + 130, offsetY + 350, 110, 52, 3, 'b-cd');
    setPos('cam-p20', offsetX + 130, offsetY + 420, 110, 52, 3, 'b-cd');

    setPos('pc-p21', offsetX + 230, offsetY + 350, 110, 52, 3, 'b-cd');
    setPos('cam-p21', offsetX + 230, offsetY + 420, 110, 52, 3, 'b-cd');
    setPos('pc-p22', offsetX + 320, offsetY + 350, 110, 52, 3, 'b-cd');
    setPos('cam-p22', offsetX + 320, offsetY + 420, 110, 52, 3, 'b-cd');

    setPos('pc-p23', offsetX + 420, offsetY + 350, 110, 52, 3, 'b-cd');
    setPos('cam-p23', offsetX + 420, offsetY + 420, 110, 52, 3, 'b-cd');
    setPos('pc-p24', offsetX + 510, offsetY + 350, 110, 52, 3, 'b-cd');
    setPos('cam-p24', offsetX + 510, offsetY + 420, 110, 52, 3, 'b-cd');

    // Under Hub 1: Routers PM1, PM2, Thư viện, TH Lý
    setPos('r-cd-pm1', offsetX + 720, offsetY + 350, 180, 64, 3, 'b-cd');
    setPos('r-cd-pm2', offsetX + 1150, offsetY + 350, 180, 64, 3, 'b-cd');
    setPos('pc-thu-vien', offsetX + 1440, offsetY + 350, 130, 56, 3, 'b-cd');
    setPos('pc-th-ly', offsetX + 1440, offsetY + 430, 130, 56, 3, 'b-cd');

    // Tier 4: Switches under PM1 & PM2
    setPos('sw-pm1-1', offsetX + 580, offsetY + 490, 130, 56, 4, 'b-cd');
    setPos('sw-pm1-2', offsetX + 720, offsetY + 490, 130, 56, 4, 'b-cd');
    setPos('sw-pm1-3', offsetX + 860, offsetY + 490, 130, 56, 4, 'b-cd');

    setPos('sw-pm2-1', offsetX + 1010, offsetY + 490, 130, 56, 4, 'b-cd');
    setPos('sw-pm2-2', offsetX + 1150, offsetY + 490, 130, 56, 4, 'b-cd');
    setPos('sw-pm2-3', offsetX + 1290, offsetY + 490, 130, 56, 4, 'b-cd');

    // Tier 5: Cụm máy tính từng switch trong PM1 & PM2
    setPos('pc-pm1-c1', offsetX + 580, offsetY + 590, 130, 56, 5, 'b-cd');
    setPos('pc-pm1-c2', offsetX + 720, offsetY + 590, 130, 56, 5, 'b-cd');
    setPos('pc-pm1-c3', offsetX + 860, offsetY + 590, 130, 56, 5, 'b-cd');

    setPos('pc-pm2-c1', offsetX + 1010, offsetY + 590, 130, 56, 5, 'b-cd');
    setPos('pc-pm2-c2', offsetX + 1150, offsetY + 590, 130, 56, 5, 'b-cd');
    setPos('pc-pm2-c3', offsetX + 1290, offsetY + 590, 130, 56, 5, 'b-cd');
  };

  // ───────────────────────────────────────────────────────────────────────────
  // LAYOUT COORDINATES FOR CLUSTER A
  // ───────────────────────────────────────────────────────────────────────────
  const buildClusterA = (offsetX: number, offsetY: number) => {
    // Gateway A
    setPos('gw-vnpt-a', offsetX + 480, offsetY + 60, 210, 72, 1, 'a');

    // Tier 2: Tầng 2 (Hub 2, Hub 3) & Tầng 1 (Hub 5)
    setPos('hub-2', offsetX + 180, offsetY + 210, 180, 64, 2, 'a');
    setPos('hub-3', offsetX + 480, offsetY + 210, 180, 64, 2, 'a');
    setPos('hub-5', offsetX + 780, offsetY + 210, 180, 64, 2, 'a');

    // Tier 3:
    // Under Hub 2: WAP + P.07..P.09
    setPos('wap-a-t2', offsetX + 60, offsetY + 340, 140, 56, 3, 'a');
    setPos('pc-p07', offsetX + 140, offsetY + 350, 105, 52, 3, 'a');
    setPos('cam-p07', offsetX + 140, offsetY + 420, 105, 52, 3, 'a');
    setPos('pc-p08', offsetX + 215, offsetY + 350, 105, 52, 3, 'a');
    setPos('cam-p08', offsetX + 215, offsetY + 420, 105, 52, 3, 'a');
    setPos('pc-p09', offsetX + 290, offsetY + 350, 105, 52, 3, 'a');
    setPos('cam-p09', offsetX + 290, offsetY + 420, 105, 52, 3, 'a');

    // Under Hub 3: Router A-T2 + P.10..P.12
    setPos('r-a-t2', offsetX + 375, offsetY + 340, 140, 56, 3, 'a');
    setPos('pc-p10', offsetX + 445, offsetY + 350, 105, 52, 3, 'a');
    setPos('cam-p10', offsetX + 445, offsetY + 420, 105, 52, 3, 'a');
    setPos('pc-p11', offsetX + 520, offsetY + 350, 105, 52, 3, 'a');
    setPos('cam-p11', offsetX + 520, offsetY + 420, 105, 52, 3, 'a');
    setPos('pc-p12', offsetX + 595, offsetY + 350, 105, 52, 3, 'a');
    setPos('cam-p12', offsetX + 595, offsetY + 420, 105, 52, 3, 'a');

    // Under Hub 5: P.01, P.02 & Hub 4 (Cascade)
    setPos('pc-p01', offsetX + 680, offsetY + 350, 105, 52, 3, 'a');
    setPos('cam-p01', offsetX + 680, offsetY + 420, 105, 52, 3, 'a');
    setPos('pc-p02', offsetX + 755, offsetY + 350, 105, 52, 3, 'a');
    setPos('cam-p02', offsetX + 755, offsetY + 420, 105, 52, 3, 'a');
    setPos('hub-4', offsetX + 870, offsetY + 340, 170, 64, 3, 'a');

    // Tier 4: Under Hub 4: P.03..P.06
    setPos('pc-p03', offsetX + 760, offsetY + 490, 105, 52, 4, 'a');
    setPos('cam-p03', offsetX + 760, offsetY + 560, 105, 52, 4, 'a');
    setPos('pc-p04', offsetX + 835, offsetY + 490, 105, 52, 4, 'a');
    setPos('cam-p04', offsetX + 835, offsetY + 560, 105, 52, 4, 'a');
    setPos('pc-p05', offsetX + 910, offsetY + 490, 105, 52, 4, 'a');
    setPos('cam-p05', offsetX + 910, offsetY + 560, 105, 52, 4, 'a');
    setPos('pc-p06', offsetX + 985, offsetY + 490, 105, 52, 4, 'a');
    setPos('cam-p06', offsetX + 985, offsetY + 560, 105, 52, 4, 'a');
  };

  // ───────────────────────────────────────────────────────────────────────────
  // APPLY CLUSTER FILTER
  // ───────────────────────────────────────────────────────────────────────────
  if (cluster === 'b-cd') {
    buildClusterB_CD(50, 30);
  } else if (cluster === 'a') {
    buildClusterA(50, 30);
  } else {
    // 'all': Top WAN Internet Cloud + Left Cluster B & CD + Right Cluster A (tách biệt rõ ràng, không bị dính)
    setPos('wan-isp', 1425, 40, 260, 72, 0, 'wan');
    buildClusterB_CD(50, 160);
    buildClusterA(1800, 160);
  }

  // Build LayoutNode objects
  positions.forEach((pos, id) => {
    const dev = allDevicesMap.get(id);
    if (!dev) return;

    nodes.push({
      id,
      device: dev,
      x: pos.x,
      y: pos.y,
      width: pos.width,
      height: pos.height,
      tier: pos.tier,
      cluster: pos.cluster,
      status: 'online',
      ip: getDeviceIp(dev),
    });
  });

  // Calculate Node Map for fast edge coordinate lookups
  const nodeMap = new Map<string, LayoutNode>();
  for (const n of nodes) {
    nodeMap.set(n.id, n);
  }

  // Build LayoutEdge objects
  // 1. If cluster is 'all', connect WAN Internet to both Gateways
  if (cluster === 'all') {
    const wanNode = nodeMap.get('wan-isp');
    const gwB = nodeMap.get('gw-vnpt-b');
    const gwA = nodeMap.get('gw-vnpt-a');

    if (wanNode && gwB) {
      edges.push({
        id: 'edge-wan-b',
        fromId: 'wan-isp',
        toId: 'gw-vnpt-b',
        medium: 'fiber',
        path: generateEdgePath(wanNode.x, wanNode.y + wanNode.height / 2, gwB.x, gwB.y - gwB.height / 2),
        cluster: 'wan',
        status: 'online',
      });
    }
    if (wanNode && gwA) {
      edges.push({
        id: 'edge-wan-a',
        fromId: 'wan-isp',
        toId: 'gw-vnpt-a',
        medium: 'fiber',
        path: generateEdgePath(wanNode.x, wanNode.y + wanNode.height / 2, gwA.x, gwA.y - gwA.height / 2),
        cluster: 'wan',
        status: 'online',
      });
    }
  }

  // 2. Add edges from NETWORK_TOPOLOGY connections
  for (const conn of NETWORK_TOPOLOGY.connections) {
    const nFrom = nodeMap.get(conn.fromDeviceId);
    const nTo = nodeMap.get(conn.toDeviceId);

    if (!nFrom || !nTo) continue;

    const fromY = nFrom.y + nFrom.height / 2;
    const toY = nTo.y - nTo.height / 2;
    const path = generateEdgePath(nFrom.x, fromY, nTo.x, toY);

    const edgeCluster: 'b-cd' | 'a' | 'wan' = nFrom.cluster === 'a' || nTo.cluster === 'a' ? 'a' : 'b-cd';

    edges.push({
      id: conn.id,
      fromId: conn.fromDeviceId,
      toId: conn.toDeviceId,
      medium: conn.medium as CableMedium,
      path,
      cluster: edgeCluster,
      status: 'online',
    });
  }

  // Compute bounding box
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const n of nodes) {
    const left = n.x - n.width / 2;
    const right = n.x + n.width / 2;
    const top = n.y - n.height / 2;
    const bottom = n.y + n.height / 2;

    if (left < minX) minX = left;
    if (top < minY) minY = top;
    if (right > maxX) maxX = right;
    if (bottom > maxY) maxY = bottom;
  }

  if (nodes.length === 0) {
    minX = 0;
    minY = 0;
    maxX = 1000;
    maxY = 800;
  }

  const padding = 80;
  return {
    nodes,
    edges,
    bounds: {
      minX: minX - padding,
      minY: minY - padding,
      maxX: maxX + padding,
      maxY: maxY + padding,
      width: maxX - minX + padding * 2,
      height: maxY - minY + padding * 2,
    },
  };
}
