/**
 * Core domain model for the THPT Số 1 Tư Nghĩa digital twin.
 *
 * Coordinates in data files are expressed in **reference-image pixels**
 * (sodotruong.jpg, 1280×960) so every piece of geometry can be audited
 * against the source drawing. Conversion to metres happens in
 * `src/lib/geometry/plan.ts`.
 */

export type Confidence = 'high' | 'medium' | 'low';

/** A rectangle in reference-image pixel space. */
export interface PxRect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface SourceReference {
  /** Path relative to project root, e.g. "sodotruong.jpg". */
  image: string;
  /** Region of the image this element was read from. */
  region?: PxRect;
  note?: string;
}

/** Audit metadata attached to every piece of geometry. */
export interface Provenance {
  sourceReferences: SourceReference[];
  confidence: Confidence;
  /** true when the value is NOT read directly from a reference image. */
  estimated: boolean;
  notes?: string;
}

export type RoomType =
  | 'classroom'
  | 'subject-office'
  | 'science-lab'
  | 'computer-lab'
  | 'library'
  | 'admin-office'
  | 'meeting'
  | 'medical'
  | 'heritage'
  | 'staff'
  | 'stair'
  | 'restroom'
  | 'unknown';

/** Image-space direction used to describe which side a corridor faces. */
export type PlanSide = '+x' | '-x' | '+y' | '-y';

/** Long axis of a building in image space. */
export type PlanAxis = 'x' | 'y';

// ───────────────────────────── Network (reserved) ─────────────────────────────

export type NetworkNodeType = 'router' | 'switch' | 'hub' | 'access-point' | 'pc' | 'server' | 'other';

export interface NetworkNode {
  id: string;
  type: NetworkNodeType;
  label?: string;
  /** Position relative to the room origin (metres, room-local). */
  position: [number, number, number];
  connections: string[];
  provenance: Provenance;
}

export type CableType = 'cat5e' | 'cat6' | 'cat6a' | 'fiber' | 'wireless' | 'unknown';

export interface NetworkConnection {
  id: string;
  from: string;
  to: string;
  cableType: CableType;
  provenance: Provenance;
}

// ───────────────────────────────── Buildings ─────────────────────────────────

export interface Room {
  /** Stable ID, independent from display name. */
  id: string;
  /** Name exactly as written on the reference image. */
  name: string;
  type: RoomType;
  /** Start/end along the building's long axis, in image px. */
  span: [number, number];
  provenance: Provenance;
  networkNodes: NetworkNode[];
  notes?: string;
}

export interface Floor {
  id: string;
  /** 0 = Trệt (ground), 1 = Lầu 1, 2 = Lầu 2. */
  level: number;
  /** Label as written on the reference image. */
  sourceLabel: string;
  rooms: Room[];
  provenance: Provenance;
}

export interface CorridorSpec {
  side: PlanSide;
  widthM: number;
  provenance: Provenance;
}

export type RoofType = 'flat-parapet' | 'gable';

export interface RoofSpec {
  type: RoofType;
  provenance: Provenance;
}

export interface Building {
  id: string;
  /** Internal code assigned by this project (the image has no building names). */
  code: string;
  name: string;
  description: string;
  axis: PlanAxis;
  /** The region in which this building is drawn on the reference image. */
  drawnRegion: PxRect;
  /** 3D footprint (image px) — see school-analysis.md §3. */
  footprint: PxRect;
  floorHeightM: number;
  corridor: CorridorSpec;
  roof: RoofSpec;
  floors: Floor[];
  provenance: Provenance;
}

// ───────────────────────────────── Outdoor ─────────────────────────────────

export type FacilityKind =
  | 'hall'
  | 'gym'
  | 'restroom-block'
  | 'guard-house'
  | 'parking-canopy'
  | 'football-field'
  | 'swimming-pool'
  | 'stage'
  | 'flagpole'
  | 'planter'
  | 'notice-board';

export interface Facility {
  id: string;
  kind: FacilityKind;
  name: string;
  rect: PxRect;
  heightM: number;
  roof?: RoofSpec;
  provenance: Provenance;
  networkNodes: NetworkNode[];
}

export interface FenceSegment {
  id: string;
  /** Polyline in image px. */
  from: [number, number];
  to: [number, number];
}

export interface Gate {
  id: string;
  name: string;
  /** Opening along the front fence, image px x-range at y = fence line. */
  x0: number;
  x1: number;
  y: number;
  main: boolean;
  provenance: Provenance;
}

export interface Road {
  id: string;
  name: string;
  rect: PxRect;
  provenance: Provenance;
}

export interface PlanCalibration {
  image: string;
  imageWidthPx: number;
  imageHeightPx: number;
  /** Pixel mapped to world origin. */
  originPx: [number, number];
  metresPerPx: number;
  /** Image direction pointing North. */
  northDirection: PlanSide;
  provenance: Provenance;
}

export interface School {
  id: string;
  name: string;
  subtitle: string;
  location?: string;
  calibration: PlanCalibration;
  campus: { ground: PxRect; courtyard: PxRect; provenance: Provenance };
  buildings: Building[];
  facilities: Facility[];
  fence: { segments: FenceSegment[]; heightM: number; provenance: Provenance };
  gates: Gate[];
  roads: Road[];
  network: { nodes: NetworkNode[]; connections: NetworkConnection[] };
  referenceImages: SourceReference[];
}
