import * as THREE from 'three';
import type { ViewMode } from '../../store/twin-store';

/**
 * Shared materials — created once, mutated per view mode.
 * Sharing keeps GPU programs & draw state minimal.
 */
const std = (color: string, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.88, metalness: 0, ...extra });

export const MATERIALS = {
  // Vibrant Vietnamese school architectural palette: warm yellow walls, terracotta/orange roof tiles, wooden doors
  exterior: std('#eed99f', { roughness: 0.72 }), // Warm school yellow (vàng chanh/vàng nghệ đặc trưng)
  exteriorDado: std('#ca8a04', { roughness: 0.8 }), // Mảng tường sơn chân tường vàng sậm/nâu đất chống bẩn
  corridorWall: std('#faebc4', { roughness: 0.8 }), // Light cream corridor
  corridorDado: std('#0d9488', { roughness: 0.75 }), // Chân tường hành lang màu xanh lam/ngọc chống bẩn đặc trưng
  molding: std('#fef3c7', { roughness: 0.65 }), // Phào chỉ gờ tường / dầm ngắt tầng nổi
  partition: std('#fdfbf7', { roughness: 0.85 }), // Off-white interior partitions
  slab: std('#cbd5e1', { roughness: 0.7 }), // Concrete slab
  tile: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 }),
  corridorTile: std('#ea580c', { roughness: 0.75 }), // Terracotta tiled corridors (gạch tàu đỏ cam ấm)
  corridorBorder: std('#7c2d12', { roughness: 0.7 }), // Gạch viền chỉ mép hành lang đỏ sẫm
  ceilingLamp: new THREE.MeshStandardMaterial({
    color: '#fef08a',
    emissive: '#fde047',
    emissiveIntensity: 0.8,
    roughness: 0.2,
  }), // Hộp đèn trần hành lang phát sáng
  column: std('#dfbe78', { roughness: 0.7 }), // Sturdy warm columns
  railing: std('#1e3a5f', { metalness: 0.65, roughness: 0.35 }), // Navy blue school railings
  railingPost: std('#1e3a5f', { metalness: 0.65, roughness: 0.35 }), // Railing posts
  baluster: std('#334155', { metalness: 0.55, roughness: 0.4 }), // Vertical grille balusters
  glass: new THREE.MeshStandardMaterial({
    color: '#7dd3fc',
    roughness: 0.08,
    metalness: 0.15,
    transparent: true,
    opacity: 0.7,
  }),
  windowFrame: std('#1e293b', { roughness: 0.45, metalness: 0.4 }), // Dark aluminum frame
  windowGrille: std('#0284c7', { roughness: 0.4, metalness: 0.5 }), // Hoa sắt bảo vệ cửa sổ màu xanh dương
  windowSill: std('#e2e8f0', { roughness: 0.65 }), // Precast concrete sill
  door: std('#78350f', { roughness: 0.6 }), // Warm natural wood doors
  doorPanel: std('#5c2807', { roughness: 0.55 }), // Pano gỗ tạo gờ âm nổi cánh cửa
  doorFrame: std('#451a03', { roughness: 0.6 }), // Solid wood door frame
  doorHandle: new THREE.MeshStandardMaterial({
    color: '#e2e8f0',
    metalness: 0.85,
    roughness: 0.2,
  }), // Tay nắm cửa kim loại inox sáng bóng
  beam: std('#dfbe78', { roughness: 0.7 }), // Concrete structural beam
  plinth: std('#475569', { roughness: 0.85 }), // Ground foundation stone trim
  coping: std('#e2e8f0', { roughness: 0.6 }), // Parapet cap stone
  penthouse: std('#eed99f', { roughness: 0.75 }), // Roof stair tum structure
  stairs: std('#94a3b8'), // Durable grey stair steps
  stairRailing: std('#1e3a5f', { metalness: 0.6, roughness: 0.35 }), // Stair handrail
  roof: std('#c2410c', { roughness: 0.65 }), // Rich terracotta clay roof (ngói đỏ cam)
  parapet: std('#d97706'), // Warm roof edge
  ghost: new THREE.MeshBasicMaterial({ color: '#9aa4ae', transparent: true, opacity: 0.07, depthWrite: false }),
  ghostLine: new THREE.LineBasicMaterial({ color: '#8a94a0', transparent: true, opacity: 0.25 }),
  roomLine: new THREE.LineBasicMaterial({ color: '#2563eb', transparent: true, opacity: 0.65 }),
  pick: new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false, transparent: true, opacity: 0 }),
  hover: new THREE.MeshBasicMaterial({ color: '#3b82f6', transparent: true, opacity: 0.18, depthWrite: false }),
  selected: new THREE.MeshBasicMaterial({ color: '#2563eb', transparent: true, opacity: 0.3, depthWrite: false }),
  outline: new THREE.LineBasicMaterial({ color: '#1d4ed8' }),
  outlineHover: new THREE.LineBasicMaterial({ color: '#3b82f6', transparent: true, opacity: 0.5 }),
  // Outdoor environment
  ground: std('#e2e8f0', { roughness: 0.95 }), // Campus ground boundary
  courtyard: std('#fde047', { roughness: 0.95 }), // Warm paver courtyard
  outside: std('#94a3b8', { roughness: 1 }), // Outside surrounding ground
  grass: std('#4ade80', { roughness: 0.85 }), // Fresh vivid soccer pitch turf
  fieldLine: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
  water: new THREE.MeshStandardMaterial({
    color: '#0066ee', // Vibrant swimming pool blue (xanh dương rực rỡ)
    emissive: '#003399',
    emissiveIntensity: 0.18,
    roughness: 0.08,
    metalness: 0.35,
  }),
  asphalt: std('#334155', { roughness: 0.9 }), // Dark realistic asphalt for QL1A
  sidewalk: std('#e2e8f0'),
  roadLine: new THREE.MeshBasicMaterial({ color: '#facc15' }), // Yellow road markings
  fence: std('#64748b', { metalness: 0.4, roughness: 0.5 }),
  metal: std('#94a3b8', { metalness: 0.7, roughness: 0.25 }),
  foliage: std('#16a34a', { flatShading: true, roughness: 0.8 }), // Rich lush tree canopy
  trunk: std('#78350f'),
  flagRed: std('#dc2626', { roughness: 0.5, side: THREE.DoubleSide }),
  flagStar: new THREE.MeshBasicMaterial({ color: '#facc15', side: THREE.DoubleSide }),
  board: std('#0f172a'),
  marker: new THREE.MeshBasicMaterial({ color: '#2563eb', transparent: true, opacity: 0.6 }),
} as const;

/** Wall-type materials whose transparency depends on view mode. */
const WALLS = [
  MATERIALS.exterior,
  MATERIALS.exteriorDado,
  MATERIALS.corridorWall,
  MATERIALS.corridorDado,
  MATERIALS.molding,
  MATERIALS.partition,
  MATERIALS.column,
  MATERIALS.beam,
  MATERIALS.plinth,
  MATERIALS.penthouse,
] as const;

const SCHEMATIC_WALL = '#ffffff';

export interface ModeFlags {
  showRoof: boolean;
  showOpenings: boolean;
  showRoomLines: boolean;
  shadows: boolean;
  schematicColors: boolean;
}

export function modeFlags(mode: ViewMode): ModeFlags {
  switch (mode) {
    case 'architectural':
      return { showRoof: true, showOpenings: true, showRoomLines: false, shadows: true, schematicColors: false };
    case 'transparent':
      return { showRoof: false, showOpenings: true, showRoomLines: false, shadows: false, schematicColors: false };
    case 'floorplan':
      return { showRoof: false, showOpenings: false, showRoomLines: true, shadows: false, schematicColors: false };
    case 'schematic':
      return { showRoof: false, showOpenings: false, showRoomLines: true, shadows: false, schematicColors: true };
    case 'network':
      return { showRoof: false, showOpenings: false, showRoomLines: true, shadows: false, schematicColors: false };
  }
}

function setWall(m: THREE.MeshStandardMaterial, opacity: number, color?: string) {
  const transparent = opacity < 0.999;
  m.opacity = opacity;
  m.transparent = transparent;
  m.depthWrite = !transparent;
  if (color) m.color.set(color);
  m.needsUpdate = true;
}

const BASE_COLORS = new Map<THREE.MeshStandardMaterial, string>(
  WALLS.map((m) => [m, `#${m.color.getHexString()}`]),
);

/** Mutate shared materials for a view mode. */
export function applyViewMode(mode: ViewMode): void {
  const opacity: Record<ViewMode, number> = {
    architectural: 1,
    transparent: 0.2,
    floorplan: 0.55,
    schematic: 0.3,
    network: 0.14,
  };
  for (const m of WALLS) {
    setWall(m, opacity[mode], mode === 'schematic' ? SCHEMATIC_WALL : BASE_COLORS.get(m));
  }
  MATERIALS.glass.opacity = mode === 'architectural' ? 0.7 : 0.35;
  MATERIALS.slab.color.set(mode === 'schematic' ? '#eef0f3' : '#d9d5cd');
  MATERIALS.tile.color.set(mode === 'network' ? '#dfe3e8' : '#ffffff');
}

/** Opacity boost applied when the camera is close to the model (architectural readability). */
export function applyProximity(mode: ViewMode, closeness: number): void {
  if (mode !== 'transparent') return;
  const o = 0.2 + closeness * 0.25;
  for (const m of WALLS) {
    if (Math.abs(m.opacity - o) > 0.01) setWall(m, o);
  }
}
