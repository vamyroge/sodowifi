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
 * Dãy C + D — dãy chức năng phía sau sân khấu, chạy theo trục X.
 * Vùng vẽ x 520–1027, y 162–272. Hàng trên = LẦU 2, giữa = LẦU 1, dưới = TRỆT
 * (nhãn ghi rõ ở phần D, x 860–892).
 */
const DRAWN = rect(520, 162, 1027, 272);
const ROW_L2 = { y0: 162, y1: 197 };
const ROW_L1 = { y0: 197, y1: 232 };
const ROW_G = { y0: 232, y1: 272 };
const D_ROW_L2 = { y0: 162, y1: 202 };
const D_ROW_L1 = { y0: 202, y1: 237 };
const D_ROW_G = { y0: 237, y1: 272 };
const cell = (x0: number, x1: number, row: { y0: number; y1: number }) => rect(x0, row.y0, x1, row.y1);

const C_LEVEL_NOTE = 'Số tầng của phần C suy ra từ phần D (cùng cấu trúc 3 hàng).';
const BAY_NOTE = 'Ô x 822–860 trên ảnh không ghi tên — chức năng chưa xác định.';

function bay(level: number) {
  return room(`room-cd-bay-l${level}`, 'Khoang chưa ghi tên', 'unknown', [822, 860], rect(822, 162, 860, 272), {
    estimated: true,
    confidence: 'low',
    notes: BAY_NOTE,
  });
}

export const buildingCD: Building = {
  id: 'building-cd',
  code: 'C·D',
  name: 'Dãy C·D · Bộ môn – Thư viện',
  description:
    'Dãy 3 tầng phía sau sân khấu: phòng thực hành, phòng vi tính, phòng bộ môn, thư viện và phòng TTTA. 1 cầu thang.',
  axis: 'x',
  drawnRegion: DRAWN,
  footprint: rect(520, 187, 1027, 247),
  floorHeightM: FLOOR_HEIGHT_M,
  corridor: { side: '+y', widthM: CORRIDOR_WIDTH_M, provenance: estimated(CORRIDOR_NOTE) },
  roof: { type: 'flat-parapet', provenance: estimated(FLAT_ROOF_NOTE) },
  floors: [
    {
      id: 'building-cd-floor-1',
      level: 0,
      sourceLabel: 'TRỆT',
      provenance: fromImage(rect(520, ROW_G.y0, 1027, ROW_G.y1)),
      rooms: [
        room('room-c-th-hoa', 'P. Thực hành Hóa', 'science-lab', [520, 760], cell(520, 760, ROW_G), {
          confidence: 'medium',
          notes: C_LEVEL_NOTE,
        }),
        stair('cd', 1, 0, [760, 822], rect(760, 162, 822, 272)),
        bay(0),
        room('room-d-th-ly', 'P. Thực hành Lý', 'science-lab', [860, 1027], cell(892, 1027, D_ROW_G)),
      ],
    },
    {
      id: 'building-cd-floor-2',
      level: 1,
      sourceLabel: 'LẦU 1',
      provenance: fromImage(rect(520, ROW_L1.y0, 1027, ROW_L1.y1)),
      rooms: [
        room('room-c-vi-tinh-2', 'P. Vi tính II', 'computer-lab', [520, 640], cell(520, 640, ROW_L1), {
          confidence: 'medium',
          notes: C_LEVEL_NOTE,
        }),
        room('room-c-vi-tinh-1', 'P. Vi tính I', 'computer-lab', [640, 760], cell(640, 760, ROW_L1), {
          confidence: 'medium',
          notes: C_LEVEL_NOTE,
        }),
        stair('cd', 1, 1, [760, 822], rect(760, 162, 822, 272)),
        bay(1),
        room('room-d-thu-vien', 'Thư viện', 'library', [860, 1027], cell(892, 1027, D_ROW_L1)),
      ],
    },
    {
      id: 'building-cd-floor-3',
      level: 2,
      sourceLabel: 'LẦU 2',
      provenance: fromImage(rect(520, ROW_L2.y0, 1027, ROW_L2.y1)),
      rooms: [
        room('room-c-bm-tin-hoc', 'P.BM Tin học', 'subject-office', [520, 580], cell(520, 580, ROW_L2), {
          confidence: 'medium',
          notes: C_LEVEL_NOTE,
        }),
        room('room-c-bm-hoa', 'P.BM Hóa', 'subject-office', [580, 640], cell(580, 640, ROW_L2), {
          confidence: 'medium',
          notes: C_LEVEL_NOTE,
        }),
        room('room-c-bm-ly', 'P.BM Lý', 'subject-office', [640, 700], cell(640, 700, ROW_L2), {
          confidence: 'medium',
          notes: C_LEVEL_NOTE,
        }),
        room('room-c-bm-sinh-cn', 'P.BM Sinh-CN', 'subject-office', [700, 760], cell(700, 760, ROW_L2), {
          confidence: 'medium',
          notes: C_LEVEL_NOTE,
        }),
        stair('cd', 1, 2, [760, 822], rect(760, 162, 822, 272)),
        bay(2),
        room('room-d-ttta', 'Phòng TTTA', 'subject-office', [860, 1027], cell(892, 1027, D_ROW_L2), {
          notes: 'Tên viết tắt theo ảnh; ảnh không giải nghĩa.',
        }),
      ],
    },
  ],
  provenance: fromImage(DRAWN, 'high', 'Footprint thu hẹp quanh trục giữa vùng vẽ (estimated).'),
};
