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
 * Dãy E — dãy phòng học phía Bắc (cạnh phải ảnh).
 * Cột TRỆT: x 1052–1110, cột LẦU 1: x 1110–1167, y 232–508.
 */
const DRAWN = rect(1052, 232, 1167, 508);
const COL_G = { x0: 1052, x1: 1110 };
const COL_L1 = { x0: 1110, x1: 1167 };

const ROWS: Array<{ span: [number, number]; ground: string | null; upper: string | null }> = [
  { span: [232, 264], ground: '06', upper: '07' },
  { span: [264, 297], ground: '05', upper: '08' },
  { span: [297, 336], ground: null, upper: null },
  { span: [336, 368], ground: '04', upper: '09' },
  { span: [368, 402], ground: '03', upper: '10' },
  { span: [402, 440], ground: null, upper: null },
  { span: [440, 474], ground: '02', upper: '11' },
  { span: [474, 508], ground: '01', upper: '12' },
];

function rowsToRooms(level: 0 | 1): Room[] {
  const col = level === 0 ? COL_G : COL_L1;
  let stairIndex = 0;
  return ROWS.map(({ span, ground, upper }) => {
    const no = level === 0 ? ground : upper;
    if (no === null) {
      stairIndex += 1;
      return stair('e', stairIndex, level, span, rect(DRAWN.x0, span[0], DRAWN.x1, span[1]));
    }
    return room(`room-p${no}`, `P.${no}`, 'classroom', span, rect(col.x0, span[0], col.x1, span[1]));
  });
}

export const buildingE: Building = {
  id: 'building-e',
  code: 'A',
  name: 'Dãy A · P.01 – P.12',
  description: 'Dãy phòng học 2 tầng phía Bắc khuôn viên (từ phải qua trái theo mặt bằng), 2 cầu thang.',
  axis: 'y',
  drawnRegion: DRAWN,
  footprint: rect(1080, 232, 1140, 508),
  floorHeightM: FLOOR_HEIGHT_M,
  corridor: { side: '-x', widthM: CORRIDOR_WIDTH_M, provenance: estimated(CORRIDOR_NOTE) },
  roof: { type: 'flat-parapet', provenance: estimated(FLAT_ROOF_NOTE) },
  floors: [
    {
      id: 'building-e-floor-1',
      level: 0,
      sourceLabel: 'TRỆT',
      rooms: rowsToRooms(0),
      provenance: fromImage(rect(COL_G.x0, 232, COL_G.x1, 530)),
    },
    {
      id: 'building-e-floor-2',
      level: 1,
      sourceLabel: 'LẦU 1',
      rooms: rowsToRooms(1),
      provenance: fromImage(rect(COL_L1.x0, 232, COL_L1.x1, 530)),
    },
  ],
  provenance: fromImage(DRAWN, 'high', 'Footprint đặt tại tâm vùng vẽ (estimated).'),
};
