import type { Building, Facility, Floor, Room, School } from '../../types/school';
import { computeBuildingLayout, type BuildingLayout, type FloorLayout, type RoomLayout } from '../geometry/building-layout';
import { rectToWorld, type WorldRect } from '../geometry/plan';

export interface RoomEntry {
  room: Room;
  floor: Floor;
  building: Building;
  floorLayout: FloorLayout;
  roomLayout: RoomLayout;
}

export interface FacilityEntry {
  facility: Facility;
  bounds: WorldRect;
}

/** Fast lookups + precomputed layouts, derived once from scene data. */
export interface SceneIndex {
  school: School;
  layouts: BuildingLayout[];
  layoutById: Map<string, BuildingLayout>;
  roomById: Map<string, RoomEntry>;
  facilityById: Map<string, FacilityEntry>;
  maxLevel: number;
  campusBounds: WorldRect;
}

export function buildSceneIndex(school: School): SceneIndex {
  const layouts = school.buildings.map((b) => computeBuildingLayout(b, school.calibration));
  const layoutById = new Map(layouts.map((l) => [l.building.id, l]));
  const roomById = new Map<string, RoomEntry>();
  let maxLevel = 0;
  for (const layout of layouts) {
    for (const fl of layout.floors) {
      maxLevel = Math.max(maxLevel, fl.level);
      for (const rl of fl.rooms) {
        roomById.set(rl.room.id, {
          room: rl.room,
          floor: fl.floor,
          building: layout.building,
          floorLayout: fl,
          roomLayout: rl,
        });
      }
    }
  }
  const facilityById = new Map(
    school.facilities.map((f) => [f.id, { facility: f, bounds: rectToWorld(school.calibration, f.rect) }]),
  );
  return {
    school,
    layouts,
    layoutById,
    roomById,
    facilityById,
    maxLevel,
    campusBounds: rectToWorld(school.calibration, school.campus.ground),
  };
}

/** Human floor label: Tầng 1 = Trệt. */
export function floorLabel(level: number): string {
  return `Tầng ${level + 1}`;
}

export function floorSourceLabel(level: number): string {
  return level === 0 ? 'Trệt' : `Lầu ${level}`;
}
