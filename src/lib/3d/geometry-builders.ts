import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Box, ColoredBox } from '../geometry/building-layout';

const UNIT_BOX = new THREE.BoxGeometry(1, 1, 1);

function boxGeometry(b: Box): THREE.BufferGeometry {
  const g = UNIT_BOX.clone();
  g.scale(Math.max(b.sx, 0.001), Math.max(b.sy, 0.001), Math.max(b.sz, 0.001));
  g.translate(b.cx, b.cy, b.cz);
  return g;
}

/** Merge many boxes into one geometry → one draw call. */
export function mergeBoxes(boxes: Box[]): THREE.BufferGeometry | null {
  if (boxes.length === 0) return null;
  const parts = boxes.map(boxGeometry);
  const merged = mergeGeometries(parts, false);
  parts.forEach((p) => p.dispose());
  if (merged) merged.computeBoundingSphere();
  return merged;
}

/** Merge boxes with per-box vertex colours. */
export function mergeColoredBoxes(boxes: ColoredBox[], colorOf: (key: string) => string): THREE.BufferGeometry | null {
  if (boxes.length === 0) return null;
  const c = new THREE.Color();
  const parts = boxes.map((b) => {
    const g = boxGeometry(b);
    c.set(colorOf(b.key));
    const count = g.getAttribute('position').count;
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return g;
  });
  const merged = mergeGeometries(parts, false);
  parts.forEach((p) => p.dispose());
  return merged;
}

/** Outline edges of many boxes merged into a single LineSegments geometry. */
export function mergeBoxEdges(boxes: Box[]): THREE.BufferGeometry | null {
  if (boxes.length === 0) return null;
  const parts = boxes.map((b) => {
    const g = boxGeometry(b);
    const e = new THREE.EdgesGeometry(g);
    g.dispose();
    return e;
  });
  const merged = mergeGeometries(parts, false);
  parts.forEach((p) => p.dispose());
  return merged;
}

/** Symmetric gable roof (triangular prism) along the longer horizontal side. */
export function gableRoofGeometry(w: number, d: number, rise: number, overhang = 0.4): THREE.BufferGeometry {
  const alongX = w >= d;
  const span = (alongX ? d : w) + overhang * 2;
  const length = (alongX ? w : d) + overhang * 2;
  const shape = new THREE.Shape();
  shape.moveTo(-span / 2, 0);
  shape.lineTo(span / 2, 0);
  shape.lineTo(0, rise);
  shape.closePath();
  const g = new THREE.ExtrudeGeometry(shape, { depth: length, bevelEnabled: false });
  g.translate(0, 0, -length / 2);
  // Shape lies in XY extruded along Z: span along X, length along Z.
  if (alongX) g.rotateY(Math.PI / 2);
  g.computeVertexNormals();
  return g;
}
