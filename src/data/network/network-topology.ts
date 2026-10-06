import type { NetworkTopology } from '../../types/network';

const PROV_SOURCE = 'sodomang.jpg';

export const NETWORK_TOPOLOGY: NetworkTopology = {
  version: '1.0.0',
  sourceImage: PROV_SOURCE,
  devices: [
    // ═══════════════════════════════════════════════════════════════════════
    // 1. CỤM DÃY B & LIÊN TÒA SANG DÃY C·D
    // ═══════════════════════════════════════════════════════════════════════
    {
      id: 'gw-vnpt-b',
      code: 'VNPT-B',
      label: 'Cổng cáp quang VNPT (Dãy B)',
      type: 'gateway',
      location: {
        buildingId: 'building-b',
        floorId: 'building-b-floor-2',
        roomId: 'room-p21',
        localPosition: [0, 1.2, 0.4],
      },
      connectedDeviceIds: ['r-b-p19-p20', 'r-b-p21-p22', 'r-b-p23-p24', 'hub-1'],
      metadata: {
        notes: 'Đầu nối cáp quang ISP VNPT cấp cho Lầu 1 Dãy B và cụm phòng chức năng Dãy C·D',
        ipRange: '192.168.1.1/24',
      },
      provenance: {
        sourceReferences: [{ image: PROV_SOURCE, note: 'Biểu tượng VNPT cụm Dãy B' }],
        confidence: 'high',
        estimated: false,
      },
    },
    {
      id: 'r-b-p19-p20',
      code: 'R-B-01',
      label: 'Router VNPT (P.19 – P.20)',
      type: 'router',
      location: {
        buildingId: 'building-b',
        floorId: 'building-b-floor-2',
        roomId: 'room-p19',
        localPosition: [1.8, 1.8, 0],
      },
      connectedDeviceIds: ['gw-vnpt-b', 'pc-p19', 'cam-p19', 'pc-p20', 'cam-p20'],
      metadata: {
        notes: 'Router cấp mạng LAN và Camera cho 2 phòng P.19 và P.20',
      },
      provenance: {
        sourceReferences: [{ image: PROV_SOURCE, note: 'Router VNPT nhánh P19-P20' }],
        confidence: 'high',
        estimated: false,
      },
    },
    {
      id: 'r-b-p21-p22',
      code: 'R-B-02',
      label: 'Router VNPT (P.21 – P.22)',
      type: 'router',
      location: {
        buildingId: 'building-b',
        floorId: 'building-b-floor-2',
        roomId: 'room-p21',
        localPosition: [1.8, 1.8, 0],
      },
      connectedDeviceIds: ['gw-vnpt-b', 'pc-p21', 'cam-p21', 'pc-p22', 'cam-p22'],
      metadata: {
        notes: 'Router cấp mạng LAN và Camera cho 2 phòng P.21 và P.22',
      },
      provenance: {
        sourceReferences: [{ image: PROV_SOURCE, note: 'Router VNPT nhánh P21-P22' }],
        confidence: 'high',
        estimated: false,
      },
    },
    {
      id: 'r-b-p23-p24',
      code: 'R-B-03',
      label: 'Router VNPT (P.23 – P.24)',
      type: 'router',
      location: {
        buildingId: 'building-b',
        floorId: 'building-b-floor-2',
        roomId: 'room-p23',
        localPosition: [1.8, 1.8, 0],
      },
      connectedDeviceIds: ['gw-vnpt-b', 'pc-p23', 'cam-p23', 'pc-p24', 'cam-p24'],
      metadata: {
        notes: 'Router cấp mạng LAN và Camera cho 2 phòng P.23 và P.24',
      },
      provenance: {
        sourceReferences: [{ image: PROV_SOURCE, note: 'Router VNPT nhánh P23-P24' }],
        confidence: 'high',
        estimated: false,
      },
    },
    {
      id: 'hub-1',
      code: 'HUB-01',
      label: 'Hub 1 (Chuyển tiếp Dãy B ➔ C·D)',
      type: 'hub',
      location: {
        buildingId: 'building-b',
        floorId: 'building-b-floor-2',
        roomId: 'connector-b-cd',
        roomName: 'Hành lang nối Dãy B & C·D (Tầng 2)',
        localPosition: [0, 1.8, 0],
      },
      connectedDeviceIds: ['gw-vnpt-b', 'r-cd-pm1', 'r-cd-pm2', 'pc-thu-vien', 'pc-th-ly'],
      metadata: {
        notes: 'Hub chia đường truyền sang các phòng máy vi tính và phòng thí nghiệm Dãy C·D đặt tại hành lang nối B & CD',
        ports: 8,
      },
      provenance: {
        sourceReferences: [{ image: PROV_SOURCE, note: 'Hub 1 tại tầng 2 bên ngoài dãy ngay hành lang nối CD với B' }],
        confidence: 'high',
        estimated: false,
      },
    },

    // ───────────────────────────────────────────────────────────────────────
    // DÃY C·D: PHÒNG MÁY 1 & PHÒNG MÁY 2 & THƯ VIỆN & TH VẬT LÝ
    // ───────────────────────────────────────────────────────────────────────
    {
      id: 'r-cd-pm1',
      code: 'R-PM1',
      label: 'Router VNPT (Phòng Máy 1)',
      type: 'router',
      location: {
        buildingId: 'building-cd',
        floorId: 'building-cd-floor-2',
        roomId: 'room-c-vi-tinh-1',
        localPosition: [-3.2, 1.2, -1.0],
      },
      connectedDeviceIds: ['hub-1', 'sw-pm1-1', 'sw-pm1-2', 'sw-pm1-3'],
      metadata: {
        notes: 'Router gateway phân phối cho dàn máy vi tính phòng máy 1',
      },
      provenance: {
        sourceReferences: [{ image: PROV_SOURCE, note: 'Router VNPT tại Phòng máy 1' }],
        confidence: 'high',
        estimated: false,
      },
    },
    {
      id: 'sw-pm1-1',
      code: 'SW-PM1-01',
      label: 'Switch 1 (Phòng Máy 1)',
      type: 'switch',
      location: {
        buildingId: 'building-cd',
        floorId: 'building-cd-floor-2',
        roomId: 'room-c-vi-tinh-1',
        localPosition: [-3.2, 0.9, -1.0],
      },
      connectedDeviceIds: ['r-cd-pm1'],
      metadata: { ports: 24, notes: 'Switch chia nhánh 1 (12-16 máy học sinh)' },
      provenance: { sourceReferences: [{ image: PROV_SOURCE, note: 'Switch 1 Phòng máy 1' }], confidence: 'high', estimated: false },
    },
    {
      id: 'sw-pm1-2',
      code: 'SW-PM1-02',
      label: 'Switch 2 (Phòng Máy 1)',
      type: 'switch',
      location: {
        buildingId: 'building-cd',
        floorId: 'building-cd-floor-2',
        roomId: 'room-c-vi-tinh-1',
        localPosition: [-3.2, 0.7, -1.0],
      },
      connectedDeviceIds: ['r-cd-pm1'],
      metadata: { ports: 24, notes: 'Switch chia nhánh 2 (12-16 máy học sinh)' },
      provenance: { sourceReferences: [{ image: PROV_SOURCE, note: 'Switch 2 Phòng máy 1' }], confidence: 'high', estimated: false },
    },
    {
      id: 'sw-pm1-3',
      code: 'SW-PM1-03',
      label: 'Switch 3 (Phòng Máy 1)',
      type: 'switch',
      location: {
        buildingId: 'building-cd',
        floorId: 'building-cd-floor-2',
        roomId: 'room-c-vi-tinh-1',
        localPosition: [-3.2, 0.5, -1.0],
      },
      connectedDeviceIds: ['r-cd-pm1', 'pc-pm1-cluster'],
      metadata: { ports: 24, notes: 'Switch chia nhánh 3, tổng kết nối 37 máy tính' },
      provenance: { sourceReferences: [{ image: PROV_SOURCE, note: 'Switch 3 Phòng máy 1 - 37 máy tính' }], confidence: 'high', estimated: false },
    },
    {
      id: 'pc-pm1-cluster',
      code: 'PC-PM1-37',
      label: 'Hệ thống 37 Máy tính (Phòng Máy 1)',
      type: 'pc',
      location: {
        buildingId: 'building-cd',
        floorId: 'building-cd-floor-2',
        roomId: 'room-c-vi-tinh-1',
        localPosition: [0, 0.4, 0],
      },
      connectedDeviceIds: ['sw-pm1-3'],
      metadata: { pcCount: 37, notes: 'Tổng 37 máy tính học sinh thực hành Tin học' },
      provenance: { sourceReferences: [{ image: PROV_SOURCE, note: '37 máy tính Phòng máy 1' }], confidence: 'high', estimated: false },
    },

    {
      id: 'r-cd-pm2',
      code: 'R-PM2',
      label: 'Router VNPT (Phòng Máy 2)',
      type: 'router',
      location: {
        buildingId: 'building-cd',
        floorId: 'building-cd-floor-2',
        roomId: 'room-c-vi-tinh-2',
        localPosition: [-3.2, 1.2, -1.0],
      },
      connectedDeviceIds: ['hub-1', 'sw-pm2-1', 'sw-pm2-2', 'sw-pm2-3'],
      metadata: {
        notes: 'Router gateway phân phối cho dàn máy vi tính phòng máy 2',
      },
      provenance: {
        sourceReferences: [{ image: PROV_SOURCE, note: 'Router VNPT tại Phòng máy 2' }],
        confidence: 'high',
        estimated: false,
      },
    },
    {
      id: 'sw-pm2-1',
      code: 'SW-PM2-01',
      label: 'Switch 1 (Phòng Máy 2)',
      type: 'switch',
      location: {
        buildingId: 'building-cd',
        floorId: 'building-cd-floor-2',
        roomId: 'room-c-vi-tinh-2',
        localPosition: [-3.2, 0.9, -1.0],
      },
      connectedDeviceIds: ['r-cd-pm2'],
      metadata: { ports: 24, notes: 'Switch chia nhánh 1 Phòng máy 2' },
      provenance: { sourceReferences: [{ image: PROV_SOURCE, note: 'Switch 1 Phòng máy 2' }], confidence: 'high', estimated: false },
    },
    {
      id: 'sw-pm2-2',
      code: 'SW-PM2-02',
      label: 'Switch 2 (Phòng Máy 2)',
      type: 'switch',
      location: {
        buildingId: 'building-cd',
        floorId: 'building-cd-floor-2',
        roomId: 'room-c-vi-tinh-2',
        localPosition: [-3.2, 0.7, -1.0],
      },
      connectedDeviceIds: ['r-cd-pm2'],
      metadata: { ports: 24, notes: 'Switch chia nhánh 2 Phòng máy 2' },
      provenance: { sourceReferences: [{ image: PROV_SOURCE, note: 'Switch 2 Phòng máy 2' }], confidence: 'high', estimated: false },
    },
    {
      id: 'sw-pm2-3',
      code: 'SW-PM2-03',
      label: 'Switch 3 (Phòng Máy 2)',
      type: 'switch',
      location: {
        buildingId: 'building-cd',
        floorId: 'building-cd-floor-2',
        roomId: 'room-c-vi-tinh-2',
        localPosition: [-3.2, 0.5, -1.0],
      },
      connectedDeviceIds: ['r-cd-pm2', 'pc-pm2-cluster'],
      metadata: { ports: 24, notes: 'Switch chia nhánh 3 Phòng máy 2' },
      provenance: { sourceReferences: [{ image: PROV_SOURCE, note: 'Switch 3 Phòng máy 2' }], confidence: 'high', estimated: false },
    },
    {
      id: 'pc-pm2-cluster',
      code: 'PC-PM2-SYS',
      label: 'Hệ thống Máy tính (Phòng Máy 2)',
      type: 'pc',
      location: {
        buildingId: 'building-cd',
        floorId: 'building-cd-floor-2',
        roomId: 'room-c-vi-tinh-2',
        localPosition: [0, 0.4, 0],
      },
      connectedDeviceIds: ['sw-pm2-3'],
      metadata: { notes: 'Dàn máy tính thực hành Phòng Máy 2' },
      provenance: { sourceReferences: [{ image: PROV_SOURCE, note: 'Máy tính Phòng máy 2' }], confidence: 'high', estimated: false },
    },
    {
      id: 'pc-thu-vien',
      code: 'PC-TV',
      label: 'Máy tính Thư viện',
      type: 'pc',
      location: {
        buildingId: 'building-cd',
        floorId: 'building-cd-floor-2',
        roomId: 'room-d-thu-vien',
        localPosition: [0, 0.4, 0],
      },
      connectedDeviceIds: ['hub-1'],
      metadata: { notes: 'Máy tính quản lý và tra cứu sách phòng Thư viện' },
      provenance: { sourceReferences: [{ image: PROV_SOURCE, note: 'Máy tính phòng thư viện' }], confidence: 'high', estimated: false },
    },
    {
      id: 'pc-th-ly',
      code: 'PC-TH-LY',
      label: 'Máy tính Thực hành Vật lí (Tầng 1)',
      type: 'pc',
      location: {
        buildingId: 'building-cd',
        floorId: 'building-cd-floor-1',
        roomId: 'room-d-th-ly',
        localPosition: [0, 0.4, 0],
      },
      connectedDeviceIds: ['hub-1'],
      metadata: { notes: 'Máy tính quản trị thiết bị thí nghiệm phòng TH Lý Tầng 1' },
      provenance: { sourceReferences: [{ image: PROV_SOURCE, note: 'Máy tính phòng TH vật lí (tầng 1)' }], confidence: 'high', estimated: false },
    },

    // ═══════════════════════════════════════════════════════════════════════
    // 2. CỤM DÃY A (BUILDING E TRONG 3D - KHỐI 2 TẦNG PHÍA BẮC)
    // ═══════════════════════════════════════════════════════════════════════
    {
      id: 'gw-vnpt-a',
      code: 'VNPT-A',
      label: 'Cổng cáp quang VNPT (Dãy A)',
      type: 'gateway',
      location: {
        buildingId: 'building-e',
        floorId: 'building-e-floor-2',
        roomId: 'room-p09',
        localPosition: [0, 1.5, 0],
      },
      connectedDeviceIds: ['hub-2', 'hub-3', 'hub-5'],
      metadata: {
        notes: 'Đầu nối cáp quang ISP VNPT cấp cho toàn bộ 12 phòng Dãy A (Tầng 1 & Tầng 2)',
      },
      provenance: { sourceReferences: [{ image: PROV_SOURCE, note: 'VNPT Dãy A' }], confidence: 'high', estimated: false },
    },
    {
      id: 'hub-2',
      code: 'HUB-02',
      label: 'Hub 2 (Dãy A – Lầu 1 Phía Nam)',
      type: 'hub',
      location: {
        buildingId: 'building-e',
        floorId: 'building-e-floor-2',
        roomId: 'room-p08',
        localPosition: [0, 1.8, 0],
      },
      connectedDeviceIds: ['gw-vnpt-a', 'wap-a-t2', 'pc-p07', 'cam-p07', 'pc-p08', 'cam-p08', 'pc-p09', 'cam-p09'],
      metadata: { notes: 'Cấp mạng cho P.07, P.08, P.09 và bộ phát WiFi WAP' },
      provenance: { sourceReferences: [{ image: PROV_SOURCE, note: 'Hub 2 Dãy A' }], confidence: 'high', estimated: false },
    },
    {
      id: 'wap-a-t2',
      code: 'WAP-A-L1',
      label: 'WAP WiFi (Dãy A – Tầng 2)',
      type: 'access-point',
      location: {
        buildingId: 'building-e',
        floorId: 'building-e-floor-2',
        roomId: 'room-p08',
        localPosition: [0, 2.7, 1.5], // Gắn trần hành lang
      },
      connectedDeviceIds: ['hub-2'],
      metadata: { notes: 'Điểm phát sóng không dây Wireless Access Point phủ sóng lầu 1' },
      provenance: { sourceReferences: [{ image: PROV_SOURCE, note: 'WAP kết nối Hub 2' }], confidence: 'high', estimated: false },
    },
    {
      id: 'hub-3',
      code: 'HUB-03',
      label: 'Hub 3 (Dãy A – Lầu 1 Phía Bắc)',
      type: 'hub',
      location: {
        buildingId: 'building-e',
        floorId: 'building-e-floor-2',
        roomId: 'room-p11',
        localPosition: [0, 1.8, 0],
      },
      connectedDeviceIds: ['gw-vnpt-a', 'r-a-t2', 'pc-p10', 'cam-p10', 'pc-p11', 'cam-p11', 'pc-p12', 'cam-p12'],
      metadata: { notes: 'Cấp mạng cho P.10, P.11, P.12 và Router Dãy A Tầng 2' },
      provenance: { sourceReferences: [{ image: PROV_SOURCE, note: 'Hub 3 Dãy A' }], confidence: 'high', estimated: false },
    },
    {
      id: 'r-a-t2',
      code: 'R-A-T2',
      label: 'Router VNPT (Dãy A Tầng 2)',
      type: 'router',
      location: {
        buildingId: 'building-e',
        floorId: 'building-e-floor-2',
        roomId: 'room-p11',
        localPosition: [0.8, 1.8, 0],
      },
      connectedDeviceIds: ['hub-3'],
      metadata: { notes: 'Router phân đoạn mạng Dãy A Tầng 2' },
      provenance: { sourceReferences: [{ image: PROV_SOURCE, note: 'Router VNPT nhánh Hub 3' }], confidence: 'high', estimated: false },
    },
    {
      id: 'hub-5',
      code: 'HUB-05',
      label: 'Hub 5 (Dãy A – Trệt Phía Bắc)',
      type: 'hub',
      location: {
        buildingId: 'building-e',
        floorId: 'building-e-floor-1',
        roomId: 'room-p02',
        localPosition: [0, 1.8, 0],
      },
      connectedDeviceIds: ['gw-vnpt-a', 'hub-4', 'pc-p01', 'cam-p01', 'pc-p02', 'cam-p02'],
      metadata: { notes: 'Hub nhận cáp trục từ tầng 2 xuống, cấp cho P.01, P.02 và cascade sang Hub 4' },
      provenance: { sourceReferences: [{ image: PROV_SOURCE, note: 'Hub 5 Dãy A tầng 1' }], confidence: 'high', estimated: false },
    },
    {
      id: 'hub-4',
      code: 'HUB-04',
      label: 'Hub 4 (Dãy A – Trệt Phía Nam)',
      type: 'hub',
      location: {
        buildingId: 'building-e',
        floorId: 'building-e-floor-1',
        roomId: 'room-p04',
        localPosition: [0, 1.8, 0],
      },
      connectedDeviceIds: ['hub-5', 'pc-p03', 'cam-p03', 'pc-p04', 'cam-p04', 'pc-p05', 'cam-p05', 'pc-p06', 'cam-p06'],
      metadata: { notes: 'Hub cấp cho 4 phòng P.03, P.04, P.05, P.06' },
      provenance: { sourceReferences: [{ image: PROV_SOURCE, note: 'Hub 4 kết nối từ Hub 5' }], confidence: 'high', estimated: false },
    },

    // ───────────────────────────────────────────────────────────────────────
    // THIẾT BỊ ĐẦU CUỐI TẠI CÁC PHÒNG HỌC (P.01 - P.12 & P.19 - P.24)
    // ───────────────────────────────────────────────────────────────────────
    // Dãy A - Tầng 1 (Trệt): P01 - P06
    ...['01', '02', '03', '04', '05', '06'].flatMap((no) => [
      {
        id: `pc-p${no}`,
        code: `PC-P${no}`,
        label: `Máy tính P.${no}`,
        type: 'pc' as const,
        location: {
          buildingId: 'building-e',
          floorId: 'building-e-floor-1',
          roomId: `room-p${no}`,
          localPosition: [-0.8, 0.4, 0] as [number, number, number],
        },
        connectedDeviceIds: [Number(no) <= 2 ? 'hub-5' : 'hub-4'],
        provenance: { sourceReferences: [{ image: PROV_SOURCE, note: `Máy tính tại P.${no}` }], confidence: 'high' as const, estimated: false },
      },
      {
        id: `cam-p${no}`,
        code: `CAM-P${no}`,
        label: `Camera P.${no}`,
        type: 'camera' as const,
        location: {
          buildingId: 'building-e',
          floorId: 'building-e-floor-1',
          roomId: `room-p${no}`,
          localPosition: [1.2, 2.6, 1.2] as [number, number, number],
        },
        connectedDeviceIds: [Number(no) <= 2 ? 'hub-5' : 'hub-4'],
        provenance: { sourceReferences: [{ image: PROV_SOURCE, note: `Camera tại P.${no}` }], confidence: 'high' as const, estimated: false },
      },
    ]),

    // Dãy A - Tầng 2 (Lầu 1): P07 - P12
    ...['07', '08', '09', '10', '11', '12'].flatMap((no) => [
      {
        id: `pc-p${no}`,
        code: `PC-P${no}`,
        label: `Máy tính P.${no}`,
        type: 'pc' as const,
        location: {
          buildingId: 'building-e',
          floorId: 'building-e-floor-2',
          roomId: `room-p${no}`,
          localPosition: [-0.8, 0.4, 0] as [number, number, number],
        },
        connectedDeviceIds: [Number(no) <= 9 ? 'hub-2' : 'hub-3'],
        provenance: { sourceReferences: [{ image: PROV_SOURCE, note: `Máy tính tại P.${no}` }], confidence: 'high' as const, estimated: false },
      },
      {
        id: `cam-p${no}`,
        code: `CAM-P${no}`,
        label: `Camera P.${no}`,
        type: 'camera' as const,
        location: {
          buildingId: 'building-e',
          floorId: 'building-e-floor-2',
          roomId: `room-p${no}`,
          localPosition: [1.2, 2.6, 1.2] as [number, number, number],
        },
        connectedDeviceIds: [Number(no) <= 9 ? 'hub-2' : 'hub-3'],
        provenance: { sourceReferences: [{ image: PROV_SOURCE, note: `Camera tại P.${no}` }], confidence: 'high' as const, estimated: false },
      },
    ]),

    // Dãy B - Tầng 2 (Lầu 1): P19 - P24
    ...['19', '20', '21', '22', '23', '24'].flatMap((no) => {
      const routerId = Number(no) <= 20 ? 'r-b-p19-p20' : Number(no) <= 22 ? 'r-b-p21-p22' : 'r-b-p23-p24';
      return [
        {
          id: `pc-p${no}`,
          code: `PC-P${no}`,
          label: `Máy tính P.${no}`,
          type: 'pc' as const,
          location: {
            buildingId: 'building-b',
            floorId: 'building-b-floor-2',
            roomId: `room-p${no}`,
            localPosition: [-0.8, 0.4, 0] as [number, number, number],
          },
          connectedDeviceIds: [routerId],
          provenance: { sourceReferences: [{ image: PROV_SOURCE, note: `Máy tính tại P.${no}` }], confidence: 'high' as const, estimated: false },
        },
        {
          id: `cam-p${no}`,
          code: `CAM-P${no}`,
          label: `Camera P.${no}`,
          type: 'camera' as const,
          location: {
            buildingId: 'building-b',
            floorId: 'building-b-floor-2',
            roomId: `room-p${no}`,
            localPosition: [1.2, 2.6, 1.2] as [number, number, number],
          },
          connectedDeviceIds: [routerId],
          provenance: { sourceReferences: [{ image: PROV_SOURCE, note: `Camera tại P.${no}` }], confidence: 'high' as const, estimated: false },
        },
      ];
    }),

    // Dãy C · P.25 – P.44 (Building A trong 3D - Dãy phòng học phía Tây Nam)
    // Tầng trệt: P.25 - P.34
    ...['25', '26', '27', '28', '29', '30', '31', '32', '33', '34'].flatMap((no) => [
      {
        id: `pc-p${no}`,
        code: `PC-P${no}`,
        label: `Máy tính P.${no}`,
        type: 'pc' as const,
        location: {
          buildingId: 'building-a',
          floorId: 'building-a-floor-1',
          roomId: `room-p${no}`,
          localPosition: [-0.8, 0.4, 0] as [number, number, number],
        },
        connectedDeviceIds: [],
        metadata: { notes: `Máy tính giáo viên phòng học P.${no} (Dãy C)` },
        provenance: { sourceReferences: [{ image: PROV_SOURCE, note: `Máy tính tại P.${no} Dãy C` }], confidence: 'high' as const, estimated: false },
      },
      {
        id: `cam-p${no}`,
        code: `CAM-P${no}`,
        label: `Camera P.${no}`,
        type: 'camera' as const,
        location: {
          buildingId: 'building-a',
          floorId: 'building-a-floor-1',
          roomId: `room-p${no}`,
          localPosition: [1.2, 2.6, 1.2] as [number, number, number],
        },
        connectedDeviceIds: [],
        metadata: { notes: `Camera an ninh góc cửa P.${no} (Dãy C)` },
        provenance: { sourceReferences: [{ image: PROV_SOURCE, note: `Camera an ninh P.${no} Dãy C` }], confidence: 'high' as const, estimated: false },
      },
    ]),

    // Lầu 1: P.35 - P.44
    ...['35', '36', '37', '38', '39', '40', '41', '42', '43', '44'].flatMap((no) => [
      {
        id: `pc-p${no}`,
        code: `PC-P${no}`,
        label: `Máy tính P.${no}`,
        type: 'pc' as const,
        location: {
          buildingId: 'building-a',
          floorId: 'building-a-floor-2',
          roomId: `room-p${no}`,
          localPosition: [-0.8, 0.4, 0] as [number, number, number],
        },
        connectedDeviceIds: [],
        metadata: { notes: `Máy tính giáo viên phòng học P.${no} (Dãy C)` },
        provenance: { sourceReferences: [{ image: PROV_SOURCE, note: `Máy tính tại P.${no} Dãy C` }], confidence: 'high' as const, estimated: false },
      },
      {
        id: `cam-p${no}`,
        code: `CAM-P${no}`,
        label: `Camera P.${no}`,
        type: 'camera' as const,
        location: {
          buildingId: 'building-a',
          floorId: 'building-a-floor-2',
          roomId: `room-p${no}`,
          localPosition: [1.2, 2.6, 1.2] as [number, number, number],
        },
        connectedDeviceIds: [],
        metadata: { notes: `Camera an ninh góc cửa P.${no} (Dãy C)` },
        provenance: { sourceReferences: [{ image: PROV_SOURCE, note: `Camera an ninh P.${no} Dãy C` }], confidence: 'high' as const, estimated: false },
      },
    ]),
  ],

  // ═══════════════════════════════════════════════════════════════════════
  // KẾT NỐI VẬT LÝ & ĐỊNH TUYẾN ĐƯỜNG CÁP
  // ═══════════════════════════════════════════════════════════════════════
  connections: [
    // Phân vùng Dãy B
    { id: 'c-b-gw-r1', fromDeviceId: 'gw-vnpt-b', toDeviceId: 'r-b-p19-p20', medium: 'cat6', routingType: 'corridor', provenance: { sourceReferences: [{ image: PROV_SOURCE }], confidence: 'high', estimated: false } },
    { id: 'c-b-gw-r2', fromDeviceId: 'gw-vnpt-b', toDeviceId: 'r-b-p21-p22', medium: 'cat6', routingType: 'corridor', provenance: { sourceReferences: [{ image: PROV_SOURCE }], confidence: 'high', estimated: false } },
    { id: 'c-b-gw-r3', fromDeviceId: 'gw-vnpt-b', toDeviceId: 'r-b-p23-p24', medium: 'cat6', routingType: 'corridor', provenance: { sourceReferences: [{ image: PROV_SOURCE }], confidence: 'high', estimated: false } },
    { id: 'c-b-gw-hub1', fromDeviceId: 'gw-vnpt-b', toDeviceId: 'hub-1', medium: 'cat6', routingType: 'corridor', provenance: { sourceReferences: [{ image: PROV_SOURCE }], confidence: 'high', estimated: false } },

    // Tuyến liên tòa từ Dãy B sang Dãy CD (Phòng máy 1, 2, Thư viện, TH Lý qua mái che hành lang chữ U)
    { id: 'c-link-b-pm1', fromDeviceId: 'hub-1', toDeviceId: 'r-cd-pm1', medium: 'cat6', routingType: 'inter-building', provenance: { sourceReferences: [{ image: PROV_SOURCE, note: 'Tuyến cáp Hub 1 sang Phòng máy 1' }], confidence: 'high', estimated: false } },
    { id: 'c-link-b-pm2', fromDeviceId: 'hub-1', toDeviceId: 'r-cd-pm2', medium: 'cat6', routingType: 'inter-building', provenance: { sourceReferences: [{ image: PROV_SOURCE, note: 'Tuyến cáp Hub 1 sang Phòng máy 2' }], confidence: 'high', estimated: false } },
    { id: 'c-link-b-tv', fromDeviceId: 'hub-1', toDeviceId: 'pc-thu-vien', medium: 'cat6', routingType: 'inter-building', provenance: { sourceReferences: [{ image: PROV_SOURCE, note: 'Tuyến cáp Hub 1 sang Thư viện' }], confidence: 'high', estimated: false } },
    { id: 'c-link-b-ly', fromDeviceId: 'hub-1', toDeviceId: 'pc-th-ly', medium: 'cat6', routingType: 'inter-building', provenance: { sourceReferences: [{ image: PROV_SOURCE, note: 'Tuyến cáp Hub 1 sang TH Vật lí T1' }], confidence: 'high', estimated: false } },

    // Dãy CD nội bộ PM1
    { id: 'c-pm1-sw1', fromDeviceId: 'r-cd-pm1', toDeviceId: 'sw-pm1-1', medium: 'cat6', routingType: 'intra-room', provenance: { sourceReferences: [{ image: PROV_SOURCE }], confidence: 'high', estimated: false } },
    { id: 'c-pm1-sw2', fromDeviceId: 'r-cd-pm1', toDeviceId: 'sw-pm1-2', medium: 'cat6', routingType: 'intra-room', provenance: { sourceReferences: [{ image: PROV_SOURCE }], confidence: 'high', estimated: false } },
    { id: 'c-pm1-sw3', fromDeviceId: 'r-cd-pm1', toDeviceId: 'sw-pm1-3', medium: 'cat6', routingType: 'intra-room', provenance: { sourceReferences: [{ image: PROV_SOURCE }], confidence: 'high', estimated: false } },
    { id: 'c-pm1-cluster', fromDeviceId: 'sw-pm1-3', toDeviceId: 'pc-pm1-cluster', medium: 'cat6', routingType: 'intra-room', provenance: { sourceReferences: [{ image: PROV_SOURCE }], confidence: 'high', estimated: false } },

    // Dãy CD nội bộ PM2
    { id: 'c-pm2-sw1', fromDeviceId: 'r-cd-pm2', toDeviceId: 'sw-pm2-1', medium: 'cat6', routingType: 'intra-room', provenance: { sourceReferences: [{ image: PROV_SOURCE }], confidence: 'high', estimated: false } },
    { id: 'c-pm2-sw2', fromDeviceId: 'r-cd-pm2', toDeviceId: 'sw-pm2-2', medium: 'cat6', routingType: 'intra-room', provenance: { sourceReferences: [{ image: PROV_SOURCE }], confidence: 'high', estimated: false } },
    { id: 'c-pm2-sw3', fromDeviceId: 'r-cd-pm2', toDeviceId: 'sw-pm2-3', medium: 'cat6', routingType: 'intra-room', provenance: { sourceReferences: [{ image: PROV_SOURCE }], confidence: 'high', estimated: false } },
    { id: 'c-pm2-cluster', fromDeviceId: 'sw-pm2-3', toDeviceId: 'pc-pm2-cluster', medium: 'cat6', routingType: 'intra-room', provenance: { sourceReferences: [{ image: PROV_SOURCE }], confidence: 'high', estimated: false } },

    // Phân vùng Dãy A
    { id: 'c-a-gw-hub2', fromDeviceId: 'gw-vnpt-a', toDeviceId: 'hub-2', medium: 'cat6', routingType: 'corridor', provenance: { sourceReferences: [{ image: PROV_SOURCE }], confidence: 'high', estimated: false } },
    { id: 'c-a-gw-hub3', fromDeviceId: 'gw-vnpt-a', toDeviceId: 'hub-3', medium: 'cat6', routingType: 'corridor', provenance: { sourceReferences: [{ image: PROV_SOURCE }], confidence: 'high', estimated: false } },
    { id: 'c-a-hub2-wap', fromDeviceId: 'hub-2', toDeviceId: 'wap-a-t2', medium: 'cat6', routingType: 'intra-room', provenance: { sourceReferences: [{ image: PROV_SOURCE }], confidence: 'high', estimated: false } },
    { id: 'c-a-hub3-r', fromDeviceId: 'hub-3', toDeviceId: 'r-a-t2', medium: 'cat6', routingType: 'intra-room', provenance: { sourceReferences: [{ image: PROV_SOURCE }], confidence: 'high', estimated: false } },
    { id: 'c-a-gw-hub5', fromDeviceId: 'gw-vnpt-a', toDeviceId: 'hub-5', medium: 'cat6', routingType: 'riser', provenance: { sourceReferences: [{ image: PROV_SOURCE, note: 'Tuyến cáp trục xuyên sàn xuống Trệt Hub 5' }], confidence: 'high', estimated: false } },
    { id: 'c-a-hub5-hub4', fromDeviceId: 'hub-5', toDeviceId: 'hub-4', medium: 'cat6', routingType: 'corridor', provenance: { sourceReferences: [{ image: PROV_SOURCE, note: 'Tuyến cascade Hub 5 sang Hub 4' }], confidence: 'high', estimated: false } },

    // Kết nối End Devices Dãy B
    ...['19', '20'].flatMap((no) => [
      { id: `c-b-r1-pc${no}`, fromDeviceId: 'r-b-p19-p20', toDeviceId: `pc-p${no}`, medium: 'cat6' as const, routingType: 'intra-room' as const, provenance: { sourceReferences: [{ image: PROV_SOURCE }], confidence: 'high' as const, estimated: false } },
      { id: `c-b-r1-cam${no}`, fromDeviceId: 'r-b-p19-p20', toDeviceId: `cam-p${no}`, medium: 'cat6' as const, routingType: 'intra-room' as const, provenance: { sourceReferences: [{ image: PROV_SOURCE }], confidence: 'high' as const, estimated: false } },
    ]),
    ...['21', '22'].flatMap((no) => [
      { id: `c-b-r2-pc${no}`, fromDeviceId: 'r-b-p21-p22', toDeviceId: `pc-p${no}`, medium: 'cat6' as const, routingType: 'intra-room' as const, provenance: { sourceReferences: [{ image: PROV_SOURCE }], confidence: 'high' as const, estimated: false } },
      { id: `c-b-r2-cam${no}`, fromDeviceId: 'r-b-p21-p22', toDeviceId: `cam-p${no}`, medium: 'cat6' as const, routingType: 'intra-room' as const, provenance: { sourceReferences: [{ image: PROV_SOURCE }], confidence: 'high' as const, estimated: false } },
    ]),
    ...['23', '24'].flatMap((no) => [
      { id: `c-b-r3-pc${no}`, fromDeviceId: 'r-b-p23-p24', toDeviceId: `pc-p${no}`, medium: 'cat6' as const, routingType: 'intra-room' as const, provenance: { sourceReferences: [{ image: PROV_SOURCE }], confidence: 'high' as const, estimated: false } },
      { id: `c-b-r3-cam${no}`, fromDeviceId: 'r-b-p23-p24', toDeviceId: `cam-p${no}`, medium: 'cat6' as const, routingType: 'intra-room' as const, provenance: { sourceReferences: [{ image: PROV_SOURCE }], confidence: 'high' as const, estimated: false } },
    ]),

    // Kết nối End Devices Dãy A - Tầng 2
    ...['07', '08', '09'].flatMap((no) => [
      { id: `c-a-h2-pc${no}`, fromDeviceId: 'hub-2', toDeviceId: `pc-p${no}`, medium: 'cat6' as const, routingType: 'intra-room' as const, provenance: { sourceReferences: [{ image: PROV_SOURCE }], confidence: 'high' as const, estimated: false } },
      { id: `c-a-h2-cam${no}`, fromDeviceId: 'hub-2', toDeviceId: `cam-p${no}`, medium: 'cat6' as const, routingType: 'intra-room' as const, provenance: { sourceReferences: [{ image: PROV_SOURCE }], confidence: 'high' as const, estimated: false } },
    ]),
    ...['10', '11', '12'].flatMap((no) => [
      { id: `c-a-h3-pc${no}`, fromDeviceId: 'hub-3', toDeviceId: `pc-p${no}`, medium: 'cat6' as const, routingType: 'intra-room' as const, provenance: { sourceReferences: [{ image: PROV_SOURCE }], confidence: 'high' as const, estimated: false } },
      { id: `c-a-h3-cam${no}`, fromDeviceId: 'hub-3', toDeviceId: `cam-p${no}`, medium: 'cat6' as const, routingType: 'intra-room' as const, provenance: { sourceReferences: [{ image: PROV_SOURCE }], confidence: 'high' as const, estimated: false } },
    ]),

    // Kết nối End Devices Dãy A - Tầng 1
    ...['01', '02'].flatMap((no) => [
      { id: `c-a-h5-pc${no}`, fromDeviceId: 'hub-5', toDeviceId: `pc-p${no}`, medium: 'cat6' as const, routingType: 'intra-room' as const, provenance: { sourceReferences: [{ image: PROV_SOURCE }], confidence: 'high' as const, estimated: false } },
      { id: `c-a-h5-cam${no}`, fromDeviceId: 'hub-5', toDeviceId: `cam-p${no}`, medium: 'cat6' as const, routingType: 'intra-room' as const, provenance: { sourceReferences: [{ image: PROV_SOURCE }], confidence: 'high' as const, estimated: false } },
    ]),
    ...['03', '04', '05', '06'].flatMap((no) => [
      { id: `c-a-h4-pc${no}`, fromDeviceId: 'hub-4', toDeviceId: `pc-p${no}`, medium: 'cat6' as const, routingType: 'intra-room' as const, provenance: { sourceReferences: [{ image: PROV_SOURCE }], confidence: 'high' as const, estimated: false } },
      { id: `c-a-h4-cam${no}`, fromDeviceId: 'hub-4', toDeviceId: `cam-p${no}`, medium: 'cat6' as const, routingType: 'intra-room' as const, provenance: { sourceReferences: [{ image: PROV_SOURCE }], confidence: 'high' as const, estimated: false } },
    ]),
  ],
};
