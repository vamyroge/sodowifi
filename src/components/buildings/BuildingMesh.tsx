import { useMemo } from 'react';
import type { BuildingLayout } from '../../lib/geometry/building-layout';
import { ROOF_T } from '../../lib/geometry/building-layout';
import { FloorMesh } from '../floors/FloorMesh';
import { mergeBoxes, mergeBoxEdges, gableRoofGeometry } from '../../lib/3d/geometry-builders';
import { MATERIALS, modeFlags } from '../../lib/3d/materials';
import { HOLO_MATERIALS } from '../../lib/3d/hologram-materials';
import { useTwinStore } from '../../store/twin-store';
import { explodeOffset } from '../../lib/3d/visibility';
import { Html } from '@react-three/drei';

interface BuildingMeshProps {
  layout: BuildingLayout;
}

export function BuildingMesh({ layout }: BuildingMeshProps) {
  const selection = useTwinStore((s) => s.selection);
  const explode = useTwinStore((s) => s.explode);
  const viewMode = useTwinStore((s) => s.viewMode);
  const selectBuilding = useTwinStore((s) => s.selectBuilding);
  const setHovered = useTwinStore((s) => s.setHovered);

  const b = layout.building;
  const isSelected = selection.buildingId === b.id;
  const flags = modeFlags(viewMode);
  const maxLevel = layout.floors.length - 1;

  // Detailed Roof Geometries
  const {
    roofSlabGeom,
    roofPitchGeom,
    roofEdgeGeom,
  } = useMemo(() => {
    return {
      roofSlabGeom: mergeBoxes([layout.roof.slab]),
      roofPitchGeom: gableRoofGeometry(layout.bounds.w, layout.bounds.d, 2.0, 0.45),
      roofEdgeGeom: mergeBoxEdges([
        layout.roof.slab,
      ]),
    };
  }, [layout]);

  const roofYOffset = explodeOffset(layout.floors.length, explode);
  const isHolo = viewMode === 'transparent';

  return (
    <group>
      {/* Floor Groups */}
      {layout.floors.map((fl) => {
        const yOff = explodeOffset(fl.level, explode);
        return (
          <group key={fl.floor.id} position={[0, yOff, 0]}>
            <FloorMesh buildingId={b.id} floorLayout={fl} maxLevel={maxLevel} />
          </group>
        );
      })}

      {/* Architectural Pitched Roof Structure (Mái ngói dốc truyền thống trường học) */}
      {flags.showRoof && (
        <group position={[0, layout.structureHeight + roofYOffset, 0]}>
          {roofSlabGeom && <mesh geometry={roofSlabGeom} material={MATERIALS.slab} castShadow receiveShadow />}
          <mesh
            geometry={roofPitchGeom}
            material={[MATERIALS.exterior, MATERIALS.roof]}
            position={[layout.bounds.cx, ROOF_T, layout.bounds.cz]}
            castShadow
            receiveShadow
          />
        </group>
      )}

      {/* Holographic Roof in Transparent Mode */}
      {isHolo && (
        <group position={[0, layout.structureHeight + roofYOffset, 0]}>
          {roofSlabGeom && <mesh geometry={roofSlabGeom} material={HOLO_MATERIALS.slab} />}
          {roofEdgeGeom && <lineSegments geometry={roofEdgeGeom} material={HOLO_MATERIALS.floorEdge} />}
        </group>
      )}

      {/* Building Header 3D Label (Standard modes) */}
      {viewMode !== 'transparent' && (
        <Html
          position={[layout.bounds.cx, layout.structureHeight + roofYOffset + 3.8, layout.bounds.cz]}
          center
          distanceFactor={60}
          zIndexRange={[10, 0]}
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
              selectBuilding(b.id);
            }}
            onPointerOver={() => {
              setHovered({
                id: b.id,
                kind: 'building',
                label: b.name,
                sub: `${b.floors.length} tầng • ${layout.floors.reduce((acc, f) => acc + f.rooms.length, 0)} phòng`,
              });
            }}
            onPointerOut={() => setHovered(null)}
            className={`pointer-events-auto cursor-pointer px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider transition-all duration-200 select-none shadow-md border flex items-center gap-1.5 ${
              isSelected
                ? 'bg-blue-600 text-white border-blue-400 shadow-blue-500/30 scale-110'
                : 'bg-white/95 dark:bg-zinc-900/95 text-zinc-800 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700 hover:border-blue-500 hover:scale-105'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>DÃY {b.code}</span>
          </div>
        </Html>
      )}
    </group>
  );
}
