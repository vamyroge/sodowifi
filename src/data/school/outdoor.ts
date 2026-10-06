import type { Facility, FenceSegment, Gate, Road } from '../../types/school';
import { estimated, fromImage, rect } from './provenance';

const HEIGHT_NOTE = 'Chiều cao không có trong ảnh (ước lượng).';

function facility(f: Omit<Facility, 'networkNodes'>): Facility {
  return { ...f, networkNodes: [] };
}

export const facilities: Facility[] = [
  facility({
    id: 'facility-hoi-truong',
    kind: 'hall',
    name: 'Hội trường',
    rect: rect(260, 27, 390, 142),
    heightM: 8,
    roof: { type: 'gable', provenance: estimated('Mái dốc 2 phía — ảnh không thể hiện mái.') },
    provenance: { ...fromImage(rect(260, 27, 390, 142)), notes: `Vị trí & footprint từ ảnh. ${HEIGHT_NOTE}` },
  }),
  facility({
    id: 'facility-san-bong',
    kind: 'football-field',
    name: 'Sân bóng đá',
    rect: rect(707, 25, 1093, 130),
    heightM: 0,
    provenance: fromImage(rect(707, 25, 1093, 130), 'high', 'Vạch giữa sân, vòng tròn giữa sân, 2 vòng cấm theo ảnh.'),
  }),
  facility({
    id: 'facility-ho-boi',
    kind: 'swimming-pool',
    name: 'Hồ bơi',
    rect: rect(1160, 38, 1235, 107),
    heightM: 0,
    provenance: fromImage(rect(1160, 38, 1235, 107)),
  }),
  facility({
    id: 'facility-nha-thi-dau',
    kind: 'gym',
    name: 'Nhà thi đấu',
    rect: rect(1177, 153, 1245, 237),
    heightM: 9,
    roof: { type: 'gable', provenance: estimated('Mái dốc 2 phía — ảnh không thể hiện mái.') },
    provenance: { ...fromImage(rect(1177, 153, 1245, 237)), notes: HEIGHT_NOTE },
  }),
  facility({
    id: 'facility-wc-bac',
    kind: 'restroom-block',
    name: 'Nhà vệ sinh',
    rect: rect(1027, 162, 1090, 225),
    heightM: 3.6,
    roof: { type: 'flat-parapet', provenance: estimated('Mái bằng (tối giản).') },
    provenance: { ...fromImage(rect(1027, 162, 1090, 225), 'medium'), notes: `Số tầng không ghi — giả định 1 tầng. ${HEIGHT_NOTE}` },
  }),
  facility({
    id: 'facility-wc-hanh-chinh',
    kind: 'restroom-block',
    name: 'Nhà vệ sinh (khối hành chính)',
    rect: rect(1060, 543, 1134, 570),
    heightM: 3.6,
    roof: { type: 'flat-parapet', provenance: estimated('Mái bằng (tối giản).') },
    provenance: {
      ...fromImage(rect(987, 543, 1207, 570), 'medium'),
      notes: 'Hàng NHÀ VỆ SINH vẽ trên đầu dãy F, không gắn nhãn tầng — mô hình 1 tầng, cùng bề sâu với dãy F.',
    },
  }),
  facility({
    id: 'facility-san-khau',
    kind: 'stage',
    name: 'Sân khấu',
    rect: rect(678, 247, 880, 289),
    heightM: 1.0,
    provenance: { ...fromImage(rect(678, 247, 880, 289)), notes: `Bục sân khấu gắn liền với mặt tiền Dãy C·D. ${HEIGHT_NOTE}` },
  }),

  facility({
    id: 'facility-bon-cay',
    kind: 'planter',
    name: 'Bồn cây',
    rect: rect(796, 598, 872, 670),
    heightM: 0.6,
    provenance: fromImage(rect(796, 598, 872, 670), 'high', 'Ảnh vẽ 1 cây cảnh trong bồn.'),
  }),
  facility({
    id: 'facility-bang-tin',
    kind: 'notice-board',
    name: 'Bảng tin',
    rect: rect(548, 578, 583, 675),
    heightM: 2.2,
    provenance: { ...fromImage(rect(548, 578, 583, 675)), notes: HEIGHT_NOTE },
  }),
  facility({
    id: 'facility-nha-xe-gv',
    kind: 'parking-canopy',
    name: 'Nhà để xe giáo viên',
    rect: rect(122, 797, 350, 848),
    heightM: 3,
    provenance: { ...fromImage(rect(122, 797, 350, 848)), notes: `Mái che trên cột (ước lượng). ${HEIGHT_NOTE}` },
  }),
  facility({
    id: 'facility-bao-ve',
    kind: 'guard-house',
    name: 'Phòng bảo vệ',
    rect: rect(352, 790, 427, 848),
    heightM: 3.2,
    roof: { type: 'gable', provenance: fromImage(rect(345, 768, 433, 792), 'medium', 'Biểu tượng mái dốc trong ảnh.') },
    provenance: fromImage(rect(345, 768, 433, 848), 'high'),
  }),
];

export const fenceSegments: FenceSegment[] = [
  { id: 'fence-left', from: [80, 50], to: [80, 850] },
  { id: 'fence-right', from: [1250, 70], to: [1250, 850] },
  { id: 'fence-front-1a', from: [80, 850], to: [430, 850] },
  { id: 'fence-front-1b', from: [495, 850], to: [557, 850] },
  { id: 'fence-front-3', from: [797, 850], to: [855, 850] },
  { id: 'fence-front-4', from: [908, 850], to: [1020, 850] },
  { id: 'fence-front-5', from: [1047, 850], to: [1250, 850] },
];

export const fenceProvenance = fromImage(
  rect(52, 50, 1250, 870),
  'high',
  'Ảnh chỉ vẽ rào trái, phải và mặt trước. Chiều cao rào ước lượng 2.0 m. Không dựng rào phía sau vì ảnh không vẽ.',
);

export const gates: Gate[] = [
  {
    id: 'gate-side',
    name: 'Cổng phụ (gần Bảo vệ)',
    x0: 430,
    x1: 495,
    y: 850,
    main: false,
    provenance: fromImage(rect(430, 820, 495, 855), 'high', 'Cổng phụ cạnh phòng bảo vệ theo sơ đồ trường.'),
  },
  {
    id: 'gate-main',
    name: 'Cổng chính',
    x0: 557,
    x1: 797,
    y: 850,
    main: true,
    provenance: fromImage(rect(557, 765, 797, 880), 'high', 'Nhãn “CỔNG CHÍNH” + mũi tên vào.'),
  },
  {
    id: 'gate-3',
    name: 'Lối vào 3',
    x0: 855,
    x1: 908,
    y: 850,
    main: false,
    provenance: fromImage(rect(855, 825, 908, 855), 'high', 'Khe hở rào + mũi tên vào.'),
  },
  {
    id: 'gate-4',
    name: 'Lối vào 4',
    x0: 1020,
    x1: 1047,
    y: 850,
    main: false,
    provenance: fromImage(rect(1020, 825, 1047, 855), 'high', 'Khe hở rào + mũi tên vào.'),
  },
];

export const roads: Road[] = [
  {
    id: 'road-ql1a',
    name: 'Quốc lộ 1A',
    rect: rect(45, 905, 1255, 947),
    provenance: fromImage(rect(45, 905, 1255, 947), 'high', 'Bề rộng đường theo tỷ lệ ảnh (estimated).'),
  },
];
