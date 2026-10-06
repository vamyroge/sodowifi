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
 * Dãy B — giữa-trái. Cột LẦU 1: x 378–445, cột TRỆT: x 445–520, y 217–545.
 */
const DRAWN = rect(378, 217, 520, 545);
const L1 = (y0: number, y1: number) => rect(378, y0, 445, y1);
const G = (y0: number, y1: number) => rect(445, y0, 520, y1);
const FULL = (y0: number, y1: number) => rect(378, y0, 520, y1);

export const buildingB: Building = {
  id: 'building-b',
  code: 'B',
  name: 'Dãy B · P.16 – P.24',
  description: 'Dãy 2 tầng ở giữa: tầng trệt gồm phòng chức năng & văn phòng, lầu 1 là phòng học. 2 cầu thang.',
  axis: 'y',
  drawnRegion: DRAWN,
  footprint: rect(414, 217, 484, 545),
  floorHeightM: FLOOR_HEIGHT_M,
  corridor: { side: '+x', widthM: CORRIDOR_WIDTH_M, provenance: estimated(CORRIDOR_NOTE) },
  roof: { type: 'flat-parapet', provenance: estimated(FLAT_ROOF_NOTE) },
  floors: [
    {
      id: 'building-b-floor-1',
      level: 0,
      sourceLabel: 'TRỆT',
      provenance: fromImage(rect(445, 217, 520, 570)),
      rooms: [
        room('room-b-phong-hop', 'Phòng Họp', 'meeting', [217, 301], G(217, 301), {
          notes: 'Gộp từ P.TH Sinh và P.CNTT (bỏ tường ngăn cách).',
        }),
        stair('b', 1, 0, [301, 340], FULL(301, 340)),
        room('room-p16', 'P.16', 'classroom', [340, 370], G(340, 370)),
        room('room-b-vp-doan', 'VP Đoàn', 'admin-office', [370, 420], G(370, 420)),
        room('room-b-tvhd', 'P.TVHĐ', 'admin-office', [420, 445], G(420, 445), {
          notes: 'Tên viết tắt theo ảnh; ảnh không giải nghĩa.',
        }),
        stair('b', 2, 0, [445, 478], FULL(445, 478)),
        room('room-b-tdgp', 'P. TDGP', 'admin-office', [478, 512], G(478, 512), {
          notes: 'Tên viết tắt theo ảnh; ảnh không giải nghĩa.',
        }),
        room('room-b-giao-vien', 'P. Giáo viên', 'staff', [512, 545], G(512, 545)),
      ],
    },
    {
      id: 'building-b-floor-2',
      level: 1,
      sourceLabel: 'LẦU 1',
      provenance: fromImage(rect(378, 217, 445, 570)),
      rooms: [
        room('room-p19', 'P.19', 'classroom', [217, 258], L1(217, 258)),
        room('room-p20', 'P.20', 'classroom', [258, 301], L1(258, 301)),
        stair('b', 1, 1, [301, 340], FULL(301, 340)),
        room('room-p21', 'P.21', 'classroom', [340, 392], L1(340, 392)),
        room('room-p22', 'P.22', 'classroom', [392, 445], L1(392, 445)),
        stair('b', 2, 1, [445, 478], FULL(445, 478)),
        room('room-p23', 'P.23', 'classroom', [478, 512], L1(478, 512)),
        room('room-p24', 'P.24', 'classroom', [512, 545], L1(512, 545)),
      ],
    },
  ],
  provenance: fromImage(DRAWN, 'high', 'Footprint đặt tại tâm vùng vẽ (estimated).'),
};
