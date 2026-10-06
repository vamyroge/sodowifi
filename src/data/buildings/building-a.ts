import type { Building, Room } from '../../types/school';
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
 * Dãy A — dãy phòng học phía Nam (cạnh trái ảnh).
 * Cột LẦU 1: x 105–170, cột TRỆT: x 170–235, y 112–542.
 */
const DRAWN = rect(105, 112, 235, 542);
const COL_L1 = { x0: 105, x1: 170 };
const COL_G = { x0: 170, x1: 235 };

/** Rows top→bottom; `null` marks a stairwell row. */
const ROWS: Array<{ span: [number, number]; ground: string | null; upper: string | null }> = [
  { span: [112, 148], ground: '34', upper: '35' },
  { span: [148, 180], ground: '33', upper: '36' },
  { span: [180, 211], ground: null, upper: null },
  { span: [211, 244], ground: '32', upper: '37' },
  { span: [244, 276], ground: '31', upper: '38' },
  { span: [276, 308], ground: null, upper: null },
  { span: [308, 340], ground: '30', upper: '39' },
  { span: [340, 372], ground: '29', upper: '40' },
  { span: [372, 402], ground: null, upper: null },
  { span: [402, 429], ground: '28', upper: '41' },
  { span: [429, 456], ground: '27', upper: '42' },
  { span: [456, 481], ground: null, upper: null },
  { span: [481, 509], ground: '26', upper: '43' },
  { span: [509, 542], ground: '25', upper: '44' },
];

function rowsToRooms(level: 0 | 1): Room[] {
  const col = level === 0 ? COL_G : COL_L1;
  let stairIndex = 0;
  return ROWS.map(({ span, ground, upper }) => {
    const region = rect(col.x0, span[0], col.x1, span[1]);
    const no = level === 0 ? ground : upper;
    if (no === null) {
      stairIndex += 1;
      return stair('a', stairIndex, level, span, rect(DRAWN.x0, span[0], DRAWN.x1, span[1]));
    }
    return room(`room-p${no}`, `P.${no}`, 'classroom', span, region);
  });
}

export const buildingA: Building = {
  id: 'building-a',
  code: 'C',
  name: 'Dãy C · P.25 – P.44',
  description: 'Dãy phòng học 2 tầng phía Nam khuôn viên (dãy ngoài cùng bên trái), 4 cầu thang.',
  axis: 'y',
  drawnRegion: DRAWN,
  footprint: rect(138, 112, 202, 542),
  floorHeightM: FLOOR_HEIGHT_M,
  corridor: { side: '+x', widthM: CORRIDOR_WIDTH_M, provenance: estimated(CORRIDOR_NOTE) },
  roof: { type: 'flat-parapet', provenance: estimated(FLAT_ROOF_NOTE) },
  floors: [
    {
      id: 'building-a-floor-1',
      level: 0,
      sourceLabel: 'TRỆT',
      rooms: rowsToRooms(0),
      provenance: fromImage(rect(COL_G.x0, 112, COL_G.x1, 570)),
    },
    {
      id: 'building-a-floor-2',
      level: 1,
      sourceLabel: 'LẦU 1',
      rooms: rowsToRooms(1),
      provenance: fromImage(rect(COL_L1.x0, 112, COL_L1.x1, 570)),
    },
  ],
  provenance: {
    ...fromImage(DRAWN, 'high', 'Bố cục, tên phòng, số tầng đọc trực tiếp. Footprint đặt tại tâm vùng vẽ (estimated).'),
  },
};
