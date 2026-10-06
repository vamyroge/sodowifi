import type { Confidence, NetworkNode, Provenance, PxRect, Room, RoomType } from '../../types/school';

/** The only reference image found in the project (see school-analysis.md §1). */
export const REFERENCE_IMAGE = 'sodotruong.jpg';

export const rect = (x0: number, y0: number, x1: number, y1: number): PxRect => ({ x0, y0, x1, y1 });

/** Data read directly from the reference image. */
export function fromImage(region: PxRect, confidence: Confidence = 'high', notes?: string): Provenance {
  return {
    sourceReferences: [{ image: REFERENCE_IMAGE, region }],
    confidence,
    estimated: false,
    notes,
  };
}

/** Data NOT available in the reference image — a documented assumption. */
export function estimated(notes: string, confidence: Confidence = 'low', region?: PxRect): Provenance {
  return {
    sourceReferences: region ? [{ image: REFERENCE_IMAGE, region, note: 'layout only' }] : [],
    confidence,
    estimated: true,
    notes,
  };
}

const NO_NODES: NetworkNode[] = [];

interface RoomOptions {
  confidence?: Confidence;
  estimated?: boolean;
  notes?: string;
}

/**
 * Room factory. `region` is the cell on the reference image the room label
 * was read from (used for audit), `span` the extent along the building axis.
 */
export function room(
  id: string,
  name: string,
  type: RoomType,
  span: [number, number],
  region: PxRect,
  opts: RoomOptions = {},
): Room {
  const confidence = opts.confidence ?? 'high';
  return {
    id,
    name,
    type,
    span,
    provenance: opts.estimated
      ? estimated(opts.notes ?? 'Not labelled on the reference image', confidence, region)
      : fromImage(region, confidence, opts.notes),
    networkNodes: NO_NODES.slice(),
    notes: opts.notes,
  };
}

/** Stairwells are drawn spanning every floor column ⇒ present on every level. */
export function stair(buildingCode: string, index: number, level: number, span: [number, number], region: PxRect): Room {
  return room(
    `stair-${buildingCode}-${index}-l${level}`,
    'Cầu thang',
    'stair',
    span,
    region,
    { notes: 'Cầu thang vẽ trải qua mọi cột tầng trên ảnh' },
  );
}

export const FLOOR_HEIGHT_M = 3.6;
export const CORRIDOR_WIDTH_M = 2.4;

export const CORRIDOR_NOTE =
  'Ảnh không vẽ hành lang. Giả định hành lang 2.4 m hướng ra sân trường (bố trí điển hình).';
export const FLAT_ROOF_NOTE = 'Ảnh không thể hiện mái. Dùng mái bằng có tường chắn mái (dạng tối giản).';
