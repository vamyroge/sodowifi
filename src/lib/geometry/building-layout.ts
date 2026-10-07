/**
 * Turns building data (image-pixel spans) into architectural boxes in metres.
 *
 * Pure functions --- no three.js dependency --- so the layout can be unit-tested
 * and reused by any renderer. World Y in a FloorLayout is *floor-local*
 * (0 = bottom of slab); the renderer offsets each floor group vertically.
 */
import type { Building, Floor, PlanCalibration, Room } from '../../types/school';
import { pxX, pxY, rectToWorld, type WorldRect } from './plan';

/** Axis-aligned box: centre + size (metres). */
export interface Box {
  cx: number;
  cy: number;
  cz: number;
  sx: number;
  sy: number;
  sz: number;
}

export interface ColoredBox extends Box {
  key: string;
}

export interface RoomLayout {
  room: Room;
  /** Interior volume (floor-local Y). */
  volume: Box;
  /** Floor finish tile (floor-local Y). */
  tile: Box;
}

export interface FloorLayout {
  floor: Floor;
  level: number;
  /** World Y of the bottom of this floor's slab (without explode offset). */
  baseY: number;
  height: number;
  rooms: RoomLayout[];
  slab: Box;
  corridorTile: Box;
  corridorBorders?: Box[]; // Decorative border strips along corridor edges
  exteriorWalls: Box[];
  exteriorDados?: Box[]; // Lower dado wall finish (warm/darker lower wall band)
  corridorWalls: Box[];
  corridorDados?: Box[]; // Lower corridor dado band (teal/greenish protective trim)
  moldings?: Box[]; // Cornice and architectural string courses
  partitions: Box[];
  windows: Box[]; // glass panes
  windowFrames: Box[]; // window outer frames, transoms, mullions
  windowSills: Box[]; // protruding window sills
  windowGrilles?: Box[]; // Security burglar bars / metal grilles
  doors: Box[]; // door leaf panels
  doorPanels?: Box[]; // 3D recessed/raised door panel moldings
  doorFrames: Box[]; // door jambs & head
  doorHandles?: Box[]; // Metallic door levers/handles
  ceilingLamps?: Box[]; // Ceiling mounted warm corridor lights
  railings: Box[]; // top & bottom rails
  railingPosts: Box[]; // balusters & posts
  columns: Box[]; // structural columns
  beams: Box[]; // structural ceiling beams (longitudinal & transverse)
  stairs: Box[]; // stair treads, risers, and landing
  stairRailings: Box[]; // stair handrails & stringers
  plinth?: Box[]; // ground floor foundation trim
  entranceSteps?: Box[]; // ground floor entry steps
}

export interface BuildingLayout {
  building: Building;
  bounds: WorldRect;
  floors: FloorLayout[];
  /** Height of the top of the structure excluding roof parapet. */
  structureHeight: number;
  roof: {
    slab: Box;
    parapets: Box[];
    copings: Box[]; // Parapet cap stone trim
    stairPenthouses: Box[]; // Roof stair access structures
  };
  /** Unit vector (x, z) pointing from the building toward its corridor side. */
  corridorNormal: [number, number];
  center: [number, number, number];
}

// --------------- Architectural constants (estimated --- see school-analysis.md §6) ---------------
export const SLAB_T = 0.25;
export const WALL_T = 0.2;
export const PARTITION_T = 0.12;
export const WINDOW_W = 1.6;
export const WINDOW_H = 1.45;
export const WINDOW_SILL = 0.95;
export const WINDOW_PITCH = 2.6;
export const DOOR_W = 1.05;
export const DOOR_H = 2.25;
export const RAIL_H = 1.05;
export const COLUMN = 0.36;
export const ROOF_T = 0.28;
export const PARAPET_H = 0.9;
export const STEP_COUNT = 9;

/** Local frame: L = long axis, D = depth axis. */
interface Frame {
  axis: 'x' | 'y';
  toBox(l0: number, l1: number, d0: number, d1: number, y0: number, y1: number): Box;
  L0: number;
  L1: number;
  D0: number;
  D1: number;
  corridorAtMax: boolean;
  spanToL(span: [number, number]): [number, number];
}

function makeFrame(b: Building, bounds: WorldRect, cal: PlanCalibration): Frame {
  const alongY = b.axis === 'y';
  const side = b.corridor.side;
  if (alongY && (side === '+y' || side === '-y')) {
    throw new Error(`${b.id}: corridor side ${side} is parallel to the long axis`);
  }
  if (!alongY && (side === '+x' || side === '-x')) {
    throw new Error(`${b.id}: corridor side ${side} is parallel to the long axis`);
  }
  const toBox = (l0: number, l1: number, d0: number, d1: number, y0: number, y1: number): Box => {
    const lMin = Math.min(l0, l1);
    const lMax = Math.max(l0, l1);
    const dMin = Math.min(d0, d1);
    const dMax = Math.max(d0, d1);
    const cy = (y0 + y1) / 2;
    const sy = Math.abs(y1 - y0);
    return alongY
      ? { cx: (dMin + dMax) / 2, cz: (lMin + lMax) / 2, cy, sx: dMax - dMin, sz: lMax - lMin, sy }
      : { cx: (lMin + lMax) / 2, cz: (dMin + dMax) / 2, cy, sx: lMax - lMin, sz: dMax - dMin, sy };
  };
  return {
    axis: b.axis,
    toBox,
    L0: alongY ? bounds.minZ : bounds.minX,
    L1: alongY ? bounds.maxZ : bounds.maxX,
    D0: alongY ? bounds.minX : bounds.minZ,
    D1: alongY ? bounds.maxX : bounds.maxZ,
    corridorAtMax: side.startsWith('+'),
    spanToL: ([a, c]) => (alongY ? [pxY(cal, a), pxY(cal, c)] : [pxX(cal, a), pxX(cal, c)]),
  };
}

const round = (v: number) => Math.round(v * 100) / 100;

function layoutFloor(b: Building, floor: Floor, f: Frame): FloorLayout {
  const H = b.floorHeightM;
  const cw = b.corridor.widthM;
  const { D0, D1, L0, L1, corridorAtMax } = f;

  // Room band & corridor band along the depth axis.
  const roomD0 = corridorAtMax ? D0 : D0 + cw;
  const roomD1 = corridorAtMax ? D1 - cw : D1;
  const innerD = corridorAtMax ? roomD1 : roomD0; // corridor wall line
  const edgeD = corridorAtMax ? D1 : D0; // corridor outer edge
  const outerWall: [number, number] = corridorAtMax ? [D0, D0 + WALL_T] : [D1 - WALL_T, D1];
  const outerFace = corridorAtMax ? D0 : D1;

  const wallY0 = SLAB_T;
  const wallY1 = H;

  const rooms: RoomLayout[] = [];
  const exteriorWalls: Box[] = [];
  const corridorWalls: Box[] = [];
  const partitions: Box[] = [];
  const exteriorDados: Box[] = [];
  const corridorDados: Box[] = [];
  const moldings: Box[] = [];
  const windows: Box[] = [];
  const windowFrames: Box[] = [];
  const windowSills: Box[] = [];
  const windowGrilles: Box[] = [];
  const doors: Box[] = [];
  const doorPanels: Box[] = [];
  const doorFrames: Box[] = [];
  const doorHandles: Box[] = [];
  const corridorBorders: Box[] = [];
  const ceilingLamps: Box[] = [];
  const railings: Box[] = [];
  const railingPosts: Box[] = [];
  const columns: Box[] = [];
  const beams: Box[] = [];
  const stairs: Box[] = [];
  const stairRailings: Box[] = [];
  const plinth: Box[] = [];
  const entranceSteps: Box[] = [];
  const boundaries = new Set<number>();

  // Recess frame 0.05m from outer wall face for realistic depth and shadow
  const frameD0 = corridorAtMax ? outerFace + 0.04 : outerFace - 0.10;
  const frameD1 = frameD0 + 0.06;
  const glassD0 = (frameD0 + frameD1) / 2 - 0.008;
  const glassD1 = glassD0 + 0.016;

  // Corridor wall frame depth
  const cFrameD0 = innerD - 0.04;
  const cFrameD1 = innerD + 0.04;
  const cGlassD0 = innerD - 0.008;
  const cGlassD1 = innerD + 0.008;

  // Chiều cao mảng sơn chân tường (dado wall) đặc trưng trường học
  const DADO_H = 1.1;
  const dadoY1 = wallY0 + DADO_H;

  for (const room of floor.rooms) {
    const [la, lb] = f.spanToL(room.span);
    const l0 = Math.min(la, lb);
    const l1 = Math.max(la, lb);
    const len = l1 - l0;
    boundaries.add(round(l0));
    boundaries.add(round(l1));

    rooms.push({
      room,
      volume: f.toBox(l0 + 0.08, l1 - 0.08, roomD0 + 0.08, roomD1 - 0.08, wallY0 + 0.01, wallY1 - 0.05),
      tile: f.toBox(l0 + 0.04, l1 - 0.04, roomD0 + 0.04, roomD1 - 0.04, SLAB_T, SLAB_T + 0.03),
    });

    const isStair = room.type === 'stair';
    // Đập tường dưới gầm cầu thang Dãy B gần phòng họp để làm lối đi thông qua sân sau
    const isOpenPassageway = b.id === 'building-b' && floor.level === 0 && room.span[0] === 301;

    if (isOpenPassageway) {
      // Đập tường mở toang lối đi thông qua sân sau (không xây tường đặc, không cửa sổ)
      const portalW0 = l0 + 0.4;
      const portalW1 = l1 - 0.4;
      // Trụ tường 2 bên mép
      exteriorWalls.push(
        f.toBox(l0, portalW0, outerWall[0], outerWall[1], wallY0, wallY1),
        f.toBox(portalW1, l1, outerWall[0], outerWall[1], wallY0, wallY1),
      );
      // Dầm lintel phía trên (khoảng thông từ sàn lên cao 2.5m)
      exteriorWalls.push(
        f.toBox(portalW0, portalW1, outerWall[0], outerWall[1], wallY0 + 2.5, wallY1),
      );
      // Bậc thềm/lối đi lát sàn dẫn ra ngoài sân sau
      const stepD0 = corridorAtMax ? outerFace - 1.1 : outerFace;
      const stepD1 = corridorAtMax ? outerFace : outerFace + 1.1;
      entranceSteps.push(
        f.toBox(portalW0 + 0.1, portalW1 - 0.1, stepD0, stepD1, 0, SLAB_T),
      );
    } else {
      // ─────────────────────────────────────────────────────────────────────────
      // EXTERIOR WALL ASSEMBLY WITH ARCHITECTURAL DEPTH & WINDOWS
      // ─────────────────────────────────────────────────────────────────────────
      // Dãy CD: mỗi phòng có 2 cửa sổ ở mặt sau; buồng thang có 1 cửa sổ. Các dãy khác: len / WINDOW_PITCH.
      const winCount = isStair ? 1 : b.id === 'building-cd' ? 2 : Math.max(1, Math.floor(len / WINDOW_PITCH));
      const winW = Math.min(WINDOW_W, (len / winCount) * 0.72);
      const winCenters: number[] = [];
      for (let i = 0; i < winCount; i++) {
        winCenters.push(l0 + (len / winCount) * (i + 0.5));
      }

      // Pier walls and window openings
      let currentL = l0;
      for (let i = 0; i < winCount; i++) {
        const c = winCenters[i]!;
        const w0 = c - winW / 2;
        const w1 = c + winW / 2;
        const sill = isStair ? WINDOW_SILL + 0.8 : WINDOW_SILL;
        const winH = isStair ? WINDOW_H * 0.85 : WINDOW_H;

        // Pier wall to the left of window (chia thành mảng tường trên và dado chân tường)
        if (w0 > currentL + 0.02) {
          exteriorWalls.push(f.toBox(currentL, w0, outerWall[0], outerWall[1], dadoY1, wallY1));
          exteriorDados.push(f.toBox(currentL, w0, outerWall[0], outerWall[1], wallY0, dadoY1));
        }

        // Spandrel wall under window (nếu bậu cửa > dadoH thì chia tầng, nếu thấp hơn thì dado đến bậu)
        const spandrelTop = wallY0 + sill;
        if (spandrelTop > dadoY1) {
          exteriorDados.push(f.toBox(w0, w1, outerWall[0], outerWall[1], wallY0, dadoY1));
          exteriorWalls.push(f.toBox(w0, w1, outerWall[0], outerWall[1], dadoY1, spandrelTop));
        } else {
          exteriorDados.push(f.toBox(w0, w1, outerWall[0], outerWall[1], wallY0, spandrelTop));
        }

        // Lintel wall above window
        exteriorWalls.push(f.toBox(w0, w1, outerWall[0], outerWall[1], wallY0 + sill + winH, wallY1));

        // ── Architectural Window Elements ──
        // Protruding Window Sill
        const sillD0 = corridorAtMax ? outerFace - 0.04 : outerWall[0];
        const sillD1 = corridorAtMax ? outerWall[1] : outerFace + 0.04;
        windowSills.push(f.toBox(w0 - 0.04, w1 + 0.04, sillD0, sillD1, wallY0 + sill - 0.06, wallY0 + sill));

        // Window Outer Frame (Jambs, Head, Sill bar)
        const FT = 0.045; // frame profile thickness
        windowFrames.push(
          // Bottom frame
          f.toBox(w0, w1, frameD0, frameD1, wallY0 + sill, wallY0 + sill + FT),
          // Top frame
          f.toBox(w0, w1, frameD0, frameD1, wallY0 + sill + winH - FT, wallY0 + sill + winH),
          // Left jamb
          f.toBox(w0, w0 + FT, frameD0, frameD1, wallY0 + sill, wallY0 + sill + winH),
          // Right jamb
          f.toBox(w1 - FT, w1, frameD0, frameD1, wallY0 + sill, wallY0 + sill + winH),
          // Transom bar (upper fanlight divider)
          f.toBox(w0, w1, frameD0, frameD1, wallY0 + sill + winH - 0.4, wallY0 + sill + winH - 0.4 + FT),
          // Vertical mullion dividing lower sashes
          f.toBox(c - FT / 2, c + FT / 2, frameD0, frameD1, wallY0 + sill, wallY0 + sill + winH - 0.4),
        );

        // Security Burglar Bars / Hoa sắt bảo vệ bên trong cửa sổ
        const grilleD = (glassD0 + glassD1) / 2;
        const numGrilleBars = 3;
        for (let gb = 1; gb <= numGrilleBars; gb++) {
          const gbx = w0 + (winW / (numGrilleBars + 1)) * gb;
          windowGrilles.push(
            f.toBox(gbx - 0.008, gbx + 0.008, grilleD - 0.008, grilleD + 0.008, wallY0 + sill + FT, wallY0 + sill + winH - 0.4),
          );
        }

        // Recessed Window Glass Panes (lower leaves & upper fanlight)
        windows.push(
          f.toBox(w0 + FT, w1 - FT, glassD0, glassD1, wallY0 + sill + FT, wallY0 + sill + winH - FT),
        );

        currentL = w1;
      }

      // Pier wall to the right of the last window
      if (l1 > currentL + 0.02) {
        exteriorWalls.push(f.toBox(currentL, l1, outerWall[0], outerWall[1], dadoY1, wallY1));
        exteriorDados.push(f.toBox(currentL, l1, outerWall[0], outerWall[1], wallY0, dadoY1));
      }

      // Phào chỉ ngắt tầng / gờ nẹp nổi dọc theo mép dưới cửa sổ
      moldings.push(
        f.toBox(l0, l1, outerFace - 0.02, outerFace + 0.02, wallY0 + WINDOW_SILL - 0.08, wallY0 + WINDOW_SILL - 0.04),
      );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CORRIDOR WALL ASSEMBLY WITH DOORS & CORRIDOR WINDOWS
    // ─────────────────────────────────────────────────────────────────────────
    if (!isStair) {
      const cWallT = WALL_T;
      const cWallD0 = innerD - cWallT / 2;
      const cWallD1 = innerD + cWallT / 2;

      const hasDoor = len > 2.4;
      const dc = l0 + Math.min(1.4, len * 0.25);
      const dw0 = dc - DOOR_W / 2;
      const dw1 = dc + DOOR_W / 2;

      const hasWin = b.id === 'building-cd' ? len > 3.2 : len > 5;
      const ws = l0 + Math.min(2.2, len * 0.35);
      const wc = (ws + l1) / 2;
      const ww = Math.min(WINDOW_W * 1.15, (l1 - ws) * 0.65);
      const cw0 = wc - ww / 2;
      const cw1 = wc + ww / 2;

      // Segments along corridor wall
      let curC = l0;

      if (hasDoor) {
        if (dw0 > curC + 0.02) {
          corridorWalls.push(f.toBox(curC, dw0, cWallD0, cWallD1, dadoY1, wallY1));
          corridorDados.push(f.toBox(curC, dw0, cWallD0, cWallD1, wallY0, dadoY1));
        }
        // Lintel above door
        corridorWalls.push(f.toBox(dw0, dw1, cWallD0, cWallD1, wallY0 + DOOR_H, wallY1));

        // Door Frame
        const DFT = 0.05;
        doorFrames.push(
          f.toBox(dw0, dw0 + DFT, cFrameD0, cFrameD1, wallY0, wallY0 + DOOR_H),
          f.toBox(dw1 - DFT, dw1, cFrameD0, cFrameD1, wallY0, wallY0 + DOOR_H),
          f.toBox(dw0, dw1, cFrameD0, cFrameD1, wallY0 + DOOR_H - DFT, wallY0 + DOOR_H),
        );

        // Door Leaf
        const leafW0 = dw0 + DFT + 0.005;
        const leafW1 = dw1 - DFT - 0.005;
        doors.push(
          f.toBox(leafW0, leafW1, innerD - 0.02, innerD + 0.02, wallY0, wallY0 + DOOR_H - DFT),
        );

        // 3D Door Panels (Pano gỗ dập nổi)
        const pInset = 0.06;
        doorPanels.push(
          // Pano dưới
          f.toBox(leafW0 + pInset, leafW1 - pInset, innerD - 0.026, innerD + 0.026, wallY0 + 0.12, wallY0 + 0.88),
          // Pano trên
          f.toBox(leafW0 + pInset, leafW1 - pInset, innerD - 0.026, innerD + 0.026, wallY0 + 1.05, wallY0 + DOOR_H - DFT - 0.12),
        );

        // Tay nắm cửa inox (tay gạt kim loại)
        const handleX = dw1 - DFT - 0.12;
        const handleY = wallY0 + 0.98;
        const handleSide0 = corridorAtMax ? innerD + 0.02 : innerD - 0.06;
        const handleSide1 = corridorAtMax ? innerD + 0.06 : innerD - 0.02;
        doorHandles.push(
          f.toBox(handleX - 0.06, handleX + 0.02, handleSide0, handleSide1, handleY - 0.015, handleY + 0.015),
          f.toBox(handleX - 0.02, handleX + 0.02, innerD - 0.04, innerD + 0.04, handleY - 0.06, handleY + 0.06),
        );

        curC = dw1;
      }

      if (hasWin && cw0 > curC) {
        if (cw0 > curC + 0.02) {
          corridorWalls.push(f.toBox(curC, cw0, cWallD0, cWallD1, dadoY1, wallY1));
          corridorDados.push(f.toBox(curC, cw0, cWallD0, cWallD1, wallY0, dadoY1));
        }
        const cSill = WINDOW_SILL + 0.2;
        const cWinH = WINDOW_H - 0.2;

        // Spandrel below corridor window
        const cSpandrelTop = wallY0 + cSill;
        if (cSpandrelTop > dadoY1) {
          corridorDados.push(f.toBox(cw0, cw1, cWallD0, cWallD1, wallY0, dadoY1));
          corridorWalls.push(f.toBox(cw0, cw1, cWallD0, cWallD1, dadoY1, cSpandrelTop));
        } else {
          corridorDados.push(f.toBox(cw0, cw1, cWallD0, cWallD1, wallY0, cSpandrelTop));
        }

        // Lintel above corridor window
        corridorWalls.push(f.toBox(cw0, cw1, cWallD0, cWallD1, wallY0 + cSill + cWinH, wallY1));

        // Corridor Window Frame
        const CFT = 0.04;
        windowFrames.push(
          f.toBox(cw0, cw1, cFrameD0, cFrameD1, wallY0 + cSill, wallY0 + cSill + CFT),
          f.toBox(cw0, cw1, cFrameD0, cFrameD1, wallY0 + cSill + cWinH - CFT, wallY0 + cSill + cWinH),
          f.toBox(cw0, cw0 + CFT, cFrameD0, cFrameD1, wallY0 + cSill, wallY0 + cSill + cWinH),
          f.toBox(cw1 - CFT, cw1, cFrameD0, cFrameD1, wallY0 + cSill, wallY0 + cSill + cWinH),
          f.toBox(wc - CFT / 2, wc + CFT / 2, cFrameD0, cFrameD1, wallY0 + cSill, wallY0 + cSill + cWinH),
        );

        // Corridor Glass
        windows.push(
          f.toBox(cw0 + CFT, cw1 - CFT, cGlassD0, cGlassD1, wallY0 + cSill + CFT, wallY0 + cSill + cWinH - CFT),
        );

        curC = cw1;
      }

      if (l1 > curC + 0.02) {
        corridorWalls.push(f.toBox(curC, l1, cWallD0, cWallD1, dadoY1, wallY1));
        corridorDados.push(f.toBox(curC, l1, cWallD0, cWallD1, wallY0, dadoY1));
      }
    } else {
      // ───────────────────────────────────────────────────────────────────────
      // ARCHITECTURAL STAIRCASE ASSEMBLY (CẦU THANG DỌC THEO CHIỀU SÂU NHÀ)
      // ───────────────────────────────────────────────────────────────────────
      const lMid = (l0 + l1) / 2;
      const minD = Math.min(roomD0, roomD1);
      const maxD = Math.max(roomD0, roomD1);
      const landingDepth = 1.45;

      // Không dựng cầu thang leo lên tầng tiếp theo nếu đây là tầng cao nhất của dãy
      // (Bỏ cầu thang tầng 2-3 của dãy 2 tầng, bỏ cầu thang 3-4 của dãy 3 tầng)
      if (floor.level >= b.floors.length - 1) {
        // Tầng cao nhất: chỉ dựng lan can an toàn che chắn quanh lỗ thông tầng
        if (corridorAtMax) {
          stairRailings.push(
            f.toBox(lMid - 0.04, lMid + 0.04, minD + 0.2, maxD - 0.2, SLAB_T, SLAB_T + 0.95),
            f.toBox(l0 + 0.15, lMid, maxD - 0.25, maxD - 0.15, SLAB_T, SLAB_T + 0.95),
          );
        } else {
          stairRailings.push(
            f.toBox(lMid - 0.04, lMid + 0.04, minD + 0.2, maxD - 0.2, SLAB_T, SLAB_T + 0.95),
            f.toBox(l0 + 0.15, lMid, minD + 0.15, minD + 0.25, SLAB_T, SLAB_T + 0.95),
          );
        }
      } else {
        const lA: [number, number] = [l0 + 0.15, lMid - 0.08]; // Vế thang 1 (trái)
        const lB: [number, number] = [lMid + 0.08, l1 - 0.15]; // Vế thang 2 (phải)

        const totalDepth = maxD - minD;
        const usableRunDepth = Math.max(2.2, totalDepth - landingDepth - 0.35);
        const run = usableRunDepth / STEP_COUNT;
        const rise = H / 2 / STEP_COUNT;

        if (corridorAtMax) {
          // Hành lang ở maxD, Chiếu nghỉ ở minD (sát tường ngoài)
          // Vế 1: Đi từ hành lang (maxD - 0.2) xuống/vào chiếu nghỉ (minD + landingDepth)
          for (let i = 0; i < STEP_COUNT; i++) {
            const dStart = maxD - 0.2 - i * run;
            const dEnd = maxD - 0.2 - (i + 1) * run;
            const stepY0 = SLAB_T + i * rise;
            const stepY1 = SLAB_T + (i + 1) * rise;
            // Mặt bậc
            stairs.push(f.toBox(lA[0], lA[1], dEnd, dStart, stepY1 - 0.04, stepY1));
            // Cổ bậc
            stairs.push(f.toBox(lA[0], lA[1], dEnd - 0.03, dEnd, stepY0, stepY1));
          }

          // Dầm đỡ bản thang Vế 1
          stairRailings.push(
            f.toBox(lA[0], lA[0] + 0.08, minD + landingDepth, maxD - 0.2, SLAB_T, SLAB_T + H / 2),
          );

          // Chiếu nghỉ giữa tầng (ở phía tường ngoài)
          stairs.push(
            f.toBox(lA[0], lB[1], minD + 0.08, minD + landingDepth, SLAB_T + H / 2 - 0.18, SLAB_T + H / 2),
          );
          // Lan can an toàn chiếu nghỉ
          stairRailings.push(
            f.toBox(lA[0], lB[1], minD + 0.08, minD + 0.14, SLAB_T + H / 2, SLAB_T + H / 2 + 0.95),
          );

          // Vế 2: Từ chiếu nghỉ (minD + landingDepth) leo tiếp lên tầng trên về phía hành lang (maxD - 0.2)
          for (let i = 0; i < STEP_COUNT; i++) {
            const dStart = minD + landingDepth + i * run;
            const dEnd = minD + landingDepth + (i + 1) * run;
            const stepY0 = SLAB_T + H / 2 + i * rise;
            const stepY1 = SLAB_T + H / 2 + (i + 1) * rise;
            // Mặt bậc
            stairs.push(f.toBox(lB[0], lB[1], dStart, dEnd, stepY1 - 0.04, stepY1));
            // Cổ bậc
            stairs.push(f.toBox(lB[0], lB[1], dEnd, dEnd + 0.03, stepY0, stepY1));
          }

          // Dầm đỡ bản thang Vế 2
          stairRailings.push(
            f.toBox(lB[1] - 0.08, lB[1], minD + landingDepth, maxD - 0.2, SLAB_T + H / 2, H),
          );

          // Lan can tay vịn phân cách giữa 2 vế thang
          stairRailings.push(
            f.toBox(lMid - 0.04, lMid + 0.04, minD + landingDepth, maxD - 0.2, SLAB_T + 0.9, SLAB_T + H / 2 + 0.9),
            f.toBox(lMid - 0.04, lMid + 0.04, minD + landingDepth, maxD - 0.2, SLAB_T + H / 2 + 0.9, H + 0.9),
          );
        } else {
          // Hành lang ở minD, Chiếu nghỉ ở maxD (sát tường ngoài)
          // Vế 1: Đi từ hành lang (minD + 0.2) lên chiếu nghỉ (maxD - landingDepth)
          for (let i = 0; i < STEP_COUNT; i++) {
            const dStart = minD + 0.2 + i * run;
            const dEnd = minD + 0.2 + (i + 1) * run;
            const stepY0 = SLAB_T + i * rise;
            const stepY1 = SLAB_T + (i + 1) * rise;
            stairs.push(f.toBox(lA[0], lA[1], dStart, dEnd, stepY1 - 0.04, stepY1));
            stairs.push(f.toBox(lA[0], lA[1], dEnd, dEnd + 0.03, stepY0, stepY1));
          }

          stairRailings.push(
            f.toBox(lA[0], lA[0] + 0.08, minD + 0.2, maxD - landingDepth, SLAB_T, SLAB_T + H / 2),
          );

          // Chiếu nghỉ
          stairs.push(
            f.toBox(lA[0], lB[1], maxD - landingDepth, maxD - 0.08, SLAB_T + H / 2 - 0.18, SLAB_T + H / 2),
          );
          stairRailings.push(
            f.toBox(lA[0], lB[1], maxD - 0.14, maxD - 0.08, SLAB_T + H / 2, SLAB_T + H / 2 + 0.95),
          );

          // Vế 2: Từ chiếu nghỉ lên tầng trên về phía hành lang
          for (let i = 0; i < STEP_COUNT; i++) {
            const dStart = maxD - landingDepth - i * run;
            const dEnd = maxD - landingDepth - (i + 1) * run;
            const stepY0 = SLAB_T + H / 2 + i * rise;
            const stepY1 = SLAB_T + H / 2 + (i + 1) * rise;
            stairs.push(f.toBox(lB[0], lB[1], dEnd, dStart, stepY1 - 0.04, stepY1));
            stairs.push(f.toBox(lB[0], lB[1], dEnd - 0.03, dEnd, stepY0, stepY1));
          }

          stairRailings.push(
            f.toBox(lB[1] - 0.08, lB[1], minD + 0.2, maxD - landingDepth, SLAB_T + H / 2, H),
          );

          // Lan can giữa 2 vế
          stairRailings.push(
            f.toBox(lMid - 0.04, lMid + 0.04, minD + 0.2, maxD - landingDepth, SLAB_T + 0.9, SLAB_T + H / 2 + 0.9),
            f.toBox(lMid - 0.04, lMid + 0.04, minD + 0.2, maxD - landingDepth, SLAB_T + H / 2 + 0.9, H + 0.9),
          );
        }
      }
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // PARTITIONS, STRUCTURAL COLUMNS & CEILING BEAMS
  // ─────────────────────────────────────────────────────────────────────────
  const sorted = [...boundaries].sort((a, b) => a - b);
  sorted.forEach((l, i) => {
    const isEnd = i === 0 || i === sorted.length - 1;
    const t = isEnd ? WALL_T : PARTITION_T;
    const box = f.toBox(l - t / 2, l + t / 2, roomD0, roomD1, wallY0, wallY1);
    (isEnd ? exteriorWalls : partitions).push(box);

    // Corridor columns at every structural bay line
    const cIn = corridorAtMax ? edgeD - COLUMN : edgeD;
    columns.push(f.toBox(l - COLUMN / 2, l + COLUMN / 2, cIn, cIn + COLUMN, wallY0, wallY1));

    // Column Base Plinth for visual architectural solidity
    columns.push(
      f.toBox(l - (COLUMN + 0.06) / 2, l + (COLUMN + 0.06) / 2, cIn - 0.03, cIn + COLUMN + 0.03, wallY0, wallY0 + 0.28),
    );

    // Transverse ceiling beam connecting corridor column to exterior wall along room boundary
    beams.push(
      f.toBox(l - 0.11, l + 0.11, roomD0, cIn + COLUMN, wallY1 - 0.35, wallY1),
    );
  });

  // Longitudinal Ceiling Beam along corridor columns
  const cInEdge = corridorAtMax ? edgeD - COLUMN : edgeD;
  beams.push(
    f.toBox(L0, L1, cInEdge + 0.03, cInEdge + COLUMN - 0.03, wallY1 - 0.35, wallY1),
  );

  // ───────────────────────────────────────────────────────────────────────────
  // CORRIDOR RAILING ASSEMBLY WITH BALUSTERS (Tất cả các tầng kể cả tầng trệt)
  // ─────────────────────────────────────────────────────────────────────────
  const r0 = corridorAtMax ? edgeD - 0.12 : edgeD;
  const rMid = r0 + 0.06;

  // Xác định các khoảng mở cho lối vào tầng trệt (tại buồng thang)
  const stairOpenings: Array<[number, number]> = [];
  if (floor.level === 0) {
    floor.rooms.forEach((r) => {
      if (r.type === 'stair') {
        const [la, lb] = f.spanToL(r.span);
        // Chừa lối vào rộng rãi tại buồng thang bước lên từ sân trường
        stairOpenings.push([Math.min(la, lb) + 0.15, Math.max(la, lb) - 0.15]);
      }
    });
  }

  // Chia chiều dài hành lang thành các đoạn có lan can (loại trừ khoảng mở vào tầng trệt)
  const railingSegments: Array<[number, number]> = [];
  if (floor.level > 0 || stairOpenings.length === 0) {
    railingSegments.push([Math.min(L0, L1), Math.max(L0, L1)]);
  } else {
    const sortedOpenings = [...stairOpenings].sort((a, b) => a[0] - b[0]);
    let cur = Math.min(L0, L1);
    for (const [o0, o1] of sortedOpenings) {
      if (o0 > cur + 0.3) {
        railingSegments.push([cur, o0]);
      }
      cur = Math.max(cur, o1);
    }
    const endL = Math.max(L0, L1);
    if (endL > cur + 0.3) {
      railingSegments.push([cur, endL]);
    }
  }

  // Dựng lan can cho từng đoạn (Top handrail, Bottom guard rail, Balusters)
  for (const [seg0, seg1] of railingSegments) {
    // Top Handrail
    railings.push(
      f.toBox(seg0, seg1, rMid - 0.045, rMid + 0.045, SLAB_T + RAIL_H - 0.05, SLAB_T + RAIL_H),
    );
    // Bottom Guard Rail
    railings.push(
      f.toBox(seg0, seg1, rMid - 0.025, rMid + 0.025, SLAB_T + 0.08, SLAB_T + 0.14),
    );

    // End posts for each segment
    railingPosts.push(
      f.toBox(seg0 - 0.03, seg0 + 0.03, rMid - 0.03, rMid + 0.03, SLAB_T, SLAB_T + RAIL_H),
      f.toBox(seg1 - 0.03, seg1 + 0.03, rMid - 0.03, rMid + 0.03, SLAB_T, SLAB_T + RAIL_H),
    );

    // Vertical Balusters (~0.22m spacing)
    const segLen = seg1 - seg0;
    const numBalusters = Math.floor(segLen / 0.22);
    for (let bi = 1; bi < numBalusters; bi++) {
      const bl = seg0 + bi * 0.22;
      const nearColumn = sorted.some((l) => Math.abs(l - bl) < 0.12);
      if (!nearColumn) {
        railingPosts.push(
          f.toBox(bl - 0.012, bl + 0.012, rMid - 0.012, rMid + 0.012, SLAB_T + 0.14, SLAB_T + RAIL_H - 0.05),
        );
      }
    }
  }

  // Cột lan can tại các vị trí trục cột
  sorted.forEach((l) => {
    const inSegment = railingSegments.some(([s0, s1]) => l >= s0 - 0.05 && l <= s1 + 0.05);
    if (inSegment) {
      railingPosts.push(
        f.toBox(l - 0.03, l + 0.03, rMid - 0.03, rMid + 0.03, SLAB_T, SLAB_T + RAIL_H),
      );
    }
  });

  // ───────────────────────────────────────────────────────────────────────────
  // GROUND FLOOR BASE PLINTH & ENTRANCE STEPS
  // ─────────────────────────────────────────────────────────────────────────
  if (floor.level === 0) {
    // Exterior wall base plinth (chừa khoảng trống cho lối đi thông dưới gầm thang Dãy B nếu có)
    const plinthD0 = corridorAtMax ? outerFace - 0.03 : outerWall[0];
    const plinthD1 = corridorAtMax ? outerWall[1] : outerFace + 0.03;
    const passageRoom = b.id === 'building-b' ? floor.rooms.find((r) => r.span[0] === 301) : undefined;
    if (passageRoom) {
      const [la, lb] = f.spanToL(passageRoom.span);
      const pl0 = Math.min(la, lb);
      const pl1 = Math.max(la, lb);
      plinth.push(
        f.toBox(L0 - 0.05, pl0 + 0.35, plinthD0, plinthD1, 0, SLAB_T + 0.35),
        f.toBox(pl1 - 0.35, L1 + 0.05, plinthD0, plinthD1, 0, SLAB_T + 0.35),
      );
    } else {
      plinth.push(
        f.toBox(L0 - 0.05, L1 + 0.05, plinthD0, plinthD1, 0, SLAB_T + 0.35),
      );
    }

    // Entrance steps at ground floor stairwells or corridor entrances
    floor.rooms.forEach((r) => {
      if (r.type === 'stair') {
        const [la, lb] = f.spanToL(r.span);
        const l0 = Math.min(la, lb);
        const l1 = Math.max(la, lb);
        const stepD0 = corridorAtMax ? edgeD : edgeD - 0.85;
        const stepD1 = corridorAtMax ? edgeD + 0.85 : edgeD;
        // 2 steps down to ground
        entranceSteps.push(
          f.toBox(l0 + 0.3, l1 - 0.3, stepD0, stepD1, 0, SLAB_T * 0.5),
          f.toBox(l0 + 0.15, l1 - 0.15, corridorAtMax ? edgeD : edgeD - 0.45, corridorAtMax ? edgeD + 0.45 : edgeD, SLAB_T * 0.5, SLAB_T),
        );
      }
    });
  }

  const corrD0 = corridorAtMax ? roomD1 : D0;
  const corrD1 = corridorAtMax ? D1 : roomD0;

  // ───────────────────────────────────────────────────────────────────────────
  // CORRIDOR BORDER TILES & CEILING LAMPS (Chi tiết gạch viền & đèn trần hành lang)
  // ─────────────────────────────────────────────────────────────────────────
  const borderW = 0.12;
  // Dải gạch viền 2 bên mép hành lang
  corridorBorders.push(
    f.toBox(L0 + 0.04, L1 - 0.04, corrD0 + 0.02, corrD0 + 0.02 + borderW, SLAB_T, SLAB_T + 0.022),
    f.toBox(L0 + 0.04, L1 - 0.04, corrD1 - 0.02 - borderW, corrD1 - 0.02, SLAB_T, SLAB_T + 0.022),
  );

  // Đèn ốp trần hành lang (khoảng cách ~5m/đèn dọc theo trục hành lang)
  const corrMidD = (corrD0 + corrD1) / 2;
  const numLamps = Math.max(1, Math.floor(Math.abs(L1 - L0) / 4.8));
  for (let li = 0; li < numLamps; li++) {
    const lampL = Math.min(L0, L1) + (Math.abs(L1 - L0) / numLamps) * (li + 0.5);
    ceilingLamps.push(
      f.toBox(lampL - 0.35, lampL + 0.35, corrMidD - 0.15, corrMidD + 0.15, wallY1 - 0.08, wallY1 - 0.02),
    );
  }

  return {
    floor,
    level: floor.level,
    baseY: floor.level * H,
    height: H,
    rooms,
    slab: f.toBox(L0, L1, D0, D1, 0, SLAB_T),
    corridorTile: f.toBox(L0 + 0.04, L1 - 0.04, corrD0 + 0.04, corrD1 - 0.04, SLAB_T, SLAB_T + 0.02),
    corridorBorders: corridorBorders.length > 0 ? corridorBorders : undefined,
    exteriorWalls,
    exteriorDados: exteriorDados.length > 0 ? exteriorDados : undefined,
    corridorWalls,
    corridorDados: corridorDados.length > 0 ? corridorDados : undefined,
    moldings: moldings.length > 0 ? moldings : undefined,
    partitions,
    windows,
    windowFrames,
    windowSills,
    windowGrilles: windowGrilles.length > 0 ? windowGrilles : undefined,
    doors,
    doorPanels: doorPanels.length > 0 ? doorPanels : undefined,
    doorFrames,
    doorHandles: doorHandles.length > 0 ? doorHandles : undefined,
    ceilingLamps: ceilingLamps.length > 0 ? ceilingLamps : undefined,
    railings,
    railingPosts,
    columns,
    beams,
    stairs,
    stairRailings,
    plinth: plinth.length > 0 ? plinth : undefined,
    entranceSteps: entranceSteps.length > 0 ? entranceSteps : undefined,
  };
}

export function computeBuildingLayout(b: Building, cal: PlanCalibration): BuildingLayout {
  const bounds = rectToWorld(cal, b.footprint);
  const f = makeFrame(b, bounds, cal);
  const sortedFloors = [...b.floors].sort((a, c) => a.level - c.level);
  const floors = sortedFloors.map((fl) => layoutFloor(b, fl, f));
  const structureHeight = sortedFloors.length * b.floorHeightM;

  // ───────────────────────────────────────────────────────────────────────────
  // ARCHITECTURAL ROOF ASSEMBLY (Overhang, Parapet, Coping, Stair Tum Penthouse)
  // ───────────────────────────────────────────────────────────────────────────
  // Roof slab with 0.25m eaves overhang on all sides
  const OVERHANG = 0.25;
  const slab = f.toBox(f.L0 - OVERHANG, f.L1 + OVERHANG, f.D0 - OVERHANG, f.D1 + OVERHANG, 0, ROOF_T);

  const p0 = ROOF_T;
  const p1 = ROOF_T + PARAPET_H;
  const parapets = [
    f.toBox(f.L0, f.L1, f.D0, f.D0 + WALL_T, p0, p1),
    f.toBox(f.L0, f.L1, f.D1 - WALL_T, f.D1, p0, p1),
    f.toBox(f.L0, f.L0 + WALL_T, f.D0, f.D1, p0, p1),
    f.toBox(f.L1 - WALL_T, f.L1, f.D0, f.D1, p0, p1),
  ];

  // Parapet Coping Trim (capping stone with 0.03m drip overhang)
  const COPING_T = 0.06;
  const COPING_OVER = 0.03;
  const copings = [
    f.toBox(f.L0 - COPING_OVER, f.L1 + COPING_OVER, f.D0 - COPING_OVER, f.D0 + WALL_T + COPING_OVER, p1, p1 + COPING_T),
    f.toBox(f.L0 - COPING_OVER, f.L1 + COPING_OVER, f.D1 - WALL_T - COPING_OVER, f.D1 + COPING_OVER, p1, p1 + COPING_T),
    f.toBox(f.L0 - COPING_OVER, f.L0 + WALL_T + COPING_OVER, f.D0, f.D1, p1, p1 + COPING_T),
    f.toBox(f.L1 - WALL_T - COPING_OVER, f.L1 + COPING_OVER, f.D0, f.D1, p1, p1 + COPING_T),
  ];

  // Roof Stair Penthouse: bỏ theo yêu cầu (không còn cục trên cùng của cầu thang)
  const stairPenthouses: Box[] = [];

  const side = b.corridor.side;
  const corridorNormal: [number, number] =
    side === '+x' ? [1, 0] : side === '-x' ? [-1, 0] : side === '+y' ? [0, 1] : [0, -1];

  return {
    building: b,
    bounds,
    floors,
    structureHeight,
    roof: { slab, parapets, copings, stairPenthouses },
    corridorNormal,
    center: [bounds.cx, structureHeight / 2, bounds.cz],
  };
}

/** Room centre in world space (without explode offset). */
export function roomWorldCenter(fl: FloorLayout, r: RoomLayout): [number, number, number] {
  return [r.volume.cx, fl.baseY + r.volume.cy, r.volume.cz];
}

