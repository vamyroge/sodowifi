import type { Building } from '../../types/school';
import {
  CORRIDOR_NOTE,
  CORRIDOR_WIDTH_M,
  FLAT_ROOF_NOTE,
  FLOOR_HEIGHT_M,
  estimated,
  fromImage,
  rect,
  room,
  stair,
} from '../school/provenance';

/**
 * Dãy F — khối hành chính (phải-dưới).
 * Cột TRỆT: x 987–1052, LẦU 1: x 1052–1150, LẦU 2: x 1150–1207; y 570–802.
 * Hàng NHÀ VỆ SINH (y 543–570) được mô hình hoá thành khối phụ — xem outdoor.ts.
 */
const DRAWN = rect(987, 543, 1207, 802);
const G = (y0: number, y1: number) => rect(987, y0, 1052, y1);
const L1 = (y0: number, y1: number) => rect(1052, y0, 1150, y1);
const L2 = (y0: number, y1: number) => rect(1135, y0, 1207, y1);
const STAIR_REGION = rect(987, 648, 1207, 677);

export const buildingF: Building = {
  id: 'building-f',
  code: 'F',
  name: 'Dãy F · Khối hành chính',
  description: 'Khối 3 tầng: y tế, văn thư, phòng họp, ban giám hiệu, kế toán, phòng truyền thống, tổ bộ môn.',
  axis: 'y',
  drawnRegion: DRAWN,
  footprint: rect(1060, 570, 1134, 802),
  floorHeightM: FLOOR_HEIGHT_M,
  corridor: { side: '-x', widthM: CORRIDOR_WIDTH_M, provenance: estimated(CORRIDOR_NOTE) },
  roof: { type: 'flat-parapet', provenance: estimated(FLAT_ROOF_NOTE) },
  floors: [
    {
      id: 'building-f-floor-1',
      level: 0,
      sourceLabel: 'TRỆT',
      provenance: fromImage(rect(987, 570, 1052, 830)),
      rooms: [
        room('room-f-y-te', 'P. Y tế', 'medical', [570, 608], G(570, 608)),
        room('room-f-van-thu', 'P. Văn thư', 'admin-office', [608, 648], G(608, 648)),
        stair('f', 1, 0, [648, 677], STAIR_REGION),
        room('room-f-phong-hop', 'Phòng họp', 'meeting', [677, 802], G(677, 802)),
      ],
    },
    {
      id: 'building-f-floor-2',
      level: 1,
      sourceLabel: 'LẦU 1',
      provenance: fromImage(rect(1052, 570, 1150, 830)),
      rooms: [
        room('room-f-ke-toan', 'P. Kế toán', 'admin-office', [570, 608], L1(570, 608)),
        room('room-f-pht-1', 'P. PHT', 'admin-office', [608, 648], L1(608, 648)),
        stair('f', 1, 1, [648, 677], STAIR_REGION),
        room('room-f-ht', 'P. HT', 'admin-office', [677, 718], L1(677, 718)),
        room('room-f-hop-lien-tich', 'P. Họp liên tịch', 'meeting', [718, 760], L1(718, 760)),
        room('room-f-pht-2', 'P. PHT', 'admin-office', [760, 802], L1(760, 802)),
      ],
    },
    {
      id: 'building-f-floor-3',
      level: 2,
      sourceLabel: 'LẦU 2',
      provenance: fromImage(rect(1135, 570, 1207, 830)),
      rooms: [
        room('room-f-truyen-thong', 'Phòng Truyền thống', 'heritage', [570, 648], L2(570, 648)),
        stair('f', 1, 2, [648, 677], STAIR_REGION),
        room('room-f-bm-tieng-anh', 'P. BM Tiếng Anh', 'subject-office', [677, 718], L2(677, 718)),
        room('room-f-bm-su-dia-gdcd', 'P. BM Sử-Địa-GDCD', 'subject-office', [718, 760], L2(718, 760)),
        room('room-f-bm-ngu-van', 'P. BM Ngữ văn', 'subject-office', [760, 802], L2(760, 802)),
      ],
    },
  ],
  provenance: fromImage(DRAWN, 'high', 'Footprint đặt tại tâm vùng vẽ (estimated).'),
};
