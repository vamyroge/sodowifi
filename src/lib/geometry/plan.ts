import type { PlanCalibration, PxRect } from '../../types/school';

export interface WorldRect {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  cx: number;
  cz: number;
  /** Size along X (m). */
  w: number;
  /** Size along Z (m). */
  d: number;
}

/** Reference-image pixel → world metres. Image +x → world +X, image +y → world +Z. */
export function pxToWorld(cal: PlanCalibration, px: number, py: number): { x: number; z: number } {
  return {
    x: (px - cal.originPx[0]) * cal.metresPerPx,
    z: (py - cal.originPx[1]) * cal.metresPerPx,
  };
}

export function pxX(cal: PlanCalibration, px: number): number {
  return (px - cal.originPx[0]) * cal.metresPerPx;
}

export function pxY(cal: PlanCalibration, py: number): number {
  return (py - cal.originPx[1]) * cal.metresPerPx;
}

export function rectToWorld(cal: PlanCalibration, r: PxRect): WorldRect {
  const a = pxToWorld(cal, Math.min(r.x0, r.x1), Math.min(r.y0, r.y1));
  const b = pxToWorld(cal, Math.max(r.x0, r.x1), Math.max(r.y0, r.y1));
  return {
    minX: a.x,
    maxX: b.x,
    minZ: a.z,
    maxZ: b.z,
    cx: (a.x + b.x) / 2,
    cz: (a.z + b.z) / 2,
    w: b.x - a.x,
    d: b.z - a.z,
  };
}

/** World extents of the full reference image (used by the reference overlay). */
export function imageWorldRect(cal: PlanCalibration): WorldRect {
  return rectToWorld(cal, { x0: 0, y0: 0, x1: cal.imageWidthPx, y1: cal.imageHeightPx });
}
