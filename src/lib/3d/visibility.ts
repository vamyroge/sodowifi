import type { FloorFilter, Selection } from '../../store/twin-store';

export type FloorVisual = 'full' | 'ghost' | 'hidden';

export const EXPLODE_GAP_M = 5;

export interface VisibilityInput {
  selection: Selection;
  floorFilter: FloorFilter;
  isolatedBuildingId: string | null;
}

/**
 * Visibility rule for one floor:
 *  - isolated building elsewhere → ghost
 *  - floor filter L applies to the selected building (or all buildings if none selected)
 *    level > L hidden, level < L ghost, level = L full.
 */
export function floorVisual(buildingId: string, level: number, maxLevel: number, s: VisibilityInput): FloorVisual {
  if (s.isolatedBuildingId && s.isolatedBuildingId !== buildingId) return 'ghost';
  const applies = s.selection.buildingId === null || s.selection.buildingId === buildingId;
  if (!applies || s.floorFilter === 'all') return 'full';
  const L = s.floorFilter;
  if (L > maxLevel) return 'ghost';
  if (level > L) return 'hidden';
  if (level < L) return 'ghost';
  return 'full';
}

export function explodeOffset(level: number, explode: boolean): number {
  return explode ? level * EXPLODE_GAP_M : 0;
}
