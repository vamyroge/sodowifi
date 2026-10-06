import { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import type { FloorLayout } from '../../lib/geometry/building-layout';
import { mergeBoxes, mergeColoredBoxes, mergeBoxEdges } from '../../lib/3d/geometry-builders';
import { MATERIALS, modeFlags } from '../../lib/3d/materials';
import { HOLO_MATERIALS } from '../../lib/3d/hologram-materials';
import { ROOM_TYPES, ROOM_TYPE_SCHEMATIC } from '../../data/rooms/room-types';
import { useTwinStore } from '../../store/twin-store';
import { floorVisual } from '../../lib/3d/visibility';

interface FloorMeshProps {
  buildingId: string;
  floorLayout: FloorLayout;
  maxLevel: number;
}

export function FloorMesh({ buildingId, floorLayout, maxLevel }: FloorMeshProps) {
  const selection = useTwinStore((s) => s.selection);
  const floorFilter = useTwinStore((s) => s.floorFilter);
  const isolatedBuildingId = useTwinStore((s) => s.isolatedBuildingId);
  const viewMode = useTwinStore((s) => s.viewMode);
  const selectRoom = useTwinStore((s) => s.selectRoom);
  const setHovered = useTwinStore((s) => s.setHovered);
  const hovered = useTwinStore((s) => s.hovered);

  const isHolo = viewMode === 'transparent';

  const vis = floorVisual(buildingId, floorLayout.level, maxLevel, {
    selection,
    floorFilter,
    isolatedBuildingId,
  });

  const flags = modeFlags(viewMode);

  // Compute merged geometries for this floor
  const {
    slabGeom,
    corridorTileGeom,
    tileGeom,
    extWallGeom,
    corrWallGeom,
    partGeom,
    windowGeom,
    windowFrameGeom,
    windowSillGeom,
    doorGeom,
    doorFrameGeom,
    railGeom,
    railPostGeom,
    columnGeom,
    beamGeom,
    stairGeom,
    stairRailingGeom,
    plinthGeom,
    entranceStepGeom,
    ghostGeom,
    ghostLineGeom,
    roomLinesGeom,
    slabEdgeGeom,
    wallEdgeGeom,
    stairEdgeGeom,
    columnEdgeGeom,
    beamEdgeGeom,
    winFrameEdgeGeom,
  } = useMemo(() => {
    const coloredTiles = floorLayout.rooms.map((r) => ({
      ...r.tile,
      key: r.room.type,
    }));

    const colorFn = (typeKey: string) => {
      const t = typeKey as keyof typeof ROOM_TYPES;
      return flags.schematicColors
        ? ROOM_TYPE_SCHEMATIC[t] || '#cccccc'
        : ROOM_TYPES[t]?.color || '#e0e0e0';
    };

    return {
      slabGeom: mergeBoxes([floorLayout.slab]),
      corridorTileGeom: mergeBoxes([floorLayout.corridorTile]),
      tileGeom: mergeColoredBoxes(coloredTiles, colorFn),
      extWallGeom: mergeBoxes(floorLayout.exteriorWalls),
      corrWallGeom: mergeBoxes(floorLayout.corridorWalls),
      partGeom: mergeBoxes(floorLayout.partitions),
      windowGeom: mergeBoxes(floorLayout.windows),
      windowFrameGeom: mergeBoxes(floorLayout.windowFrames),
      windowSillGeom: mergeBoxes(floorLayout.windowSills),
      doorGeom: mergeBoxes(floorLayout.doors),
      doorFrameGeom: mergeBoxes(floorLayout.doorFrames),
      railGeom: mergeBoxes(floorLayout.railings),
      railPostGeom: mergeBoxes(floorLayout.railingPosts),
      columnGeom: mergeBoxes(floorLayout.columns),
      beamGeom: mergeBoxes(floorLayout.beams),
      stairGeom: mergeBoxes(floorLayout.stairs),
      stairRailingGeom: mergeBoxes(floorLayout.stairRailings),
      plinthGeom: floorLayout.plinth ? mergeBoxes(floorLayout.plinth) : null,
      entranceStepGeom: floorLayout.entranceSteps ? mergeBoxes(floorLayout.entranceSteps) : null,
      ghostGeom: mergeBoxes([floorLayout.slab, ...floorLayout.exteriorWalls]),
      ghostLineGeom: mergeBoxEdges([floorLayout.slab, ...floorLayout.exteriorWalls]),
      roomLinesGeom: mergeBoxEdges(floorLayout.rooms.map((r) => r.volume)),
      slabEdgeGeom: mergeBoxEdges([floorLayout.slab, floorLayout.corridorTile]),
      wallEdgeGeom: mergeBoxEdges([
        ...floorLayout.exteriorWalls,
        ...floorLayout.corridorWalls,
        ...floorLayout.partitions,
      ]),
      stairEdgeGeom: mergeBoxEdges([...floorLayout.stairs, ...floorLayout.stairRailings]),
      columnEdgeGeom: mergeBoxEdges(floorLayout.columns),
      beamEdgeGeom: mergeBoxEdges(floorLayout.beams),
      winFrameEdgeGeom: mergeBoxEdges(floorLayout.windowFrames),
    };
  }, [floorLayout, flags.schematicColors]);

  if (vis === 'hidden') return null;

  if (vis === 'ghost') {
    return (
      <group position={[0, floorLayout.baseY, 0]}>
        {ghostGeom && <mesh geometry={ghostGeom} material={MATERIALS.ghost} />}
        {ghostLineGeom && <lineSegments geometry={ghostLineGeom} material={MATERIALS.ghostLine} />}
      </group>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MODE 1: TRANSPARENT / SCI-FI HOLOGRAPHIC MODE
  // ═══════════════════════════════════════════════════════════════════════════
  if (isHolo) {
    return (
      <group position={[0, floorLayout.baseY, 0]}>
        {/* Layer 1: Semi-transparent structural surfaces */}
        {slabGeom && <mesh geometry={slabGeom} material={HOLO_MATERIALS.slab} />}
        {corridorTileGeom && <mesh geometry={corridorTileGeom} material={HOLO_MATERIALS.slab} />}
        {extWallGeom && <mesh geometry={extWallGeom} material={HOLO_MATERIALS.wall} />}
        {corrWallGeom && <mesh geometry={corrWallGeom} material={HOLO_MATERIALS.wall} />}
        {partGeom && <mesh geometry={partGeom} material={HOLO_MATERIALS.wall} />}
        {columnGeom && <mesh geometry={columnGeom} material={HOLO_MATERIALS.column} />}
        {beamGeom && <mesh geometry={beamGeom} material={HOLO_MATERIALS.beam} />}
        {stairGeom && <mesh geometry={stairGeom} material={HOLO_MATERIALS.stair} />}
        {windowGeom && <mesh geometry={windowGeom} material={HOLO_MATERIALS.window} />}
        {doorGeom && <mesh geometry={doorGeom} material={HOLO_MATERIALS.door} />}

        {/* Layer 2: Neon glowing structural wireframes & edges */}
        {slabEdgeGeom && <lineSegments geometry={slabEdgeGeom} material={HOLO_MATERIALS.floorEdge} />}
        {wallEdgeGeom && <lineSegments geometry={wallEdgeGeom} material={HOLO_MATERIALS.edge} />}
        {columnEdgeGeom && <lineSegments geometry={columnEdgeGeom} material={HOLO_MATERIALS.edge} />}
        {beamEdgeGeom && <lineSegments geometry={beamEdgeGeom} material={HOLO_MATERIALS.edge} />}
        {stairEdgeGeom && <lineSegments geometry={stairEdgeGeom} material={HOLO_MATERIALS.stairEdge} />}
        {winFrameEdgeGeom && <lineSegments geometry={winFrameEdgeGeom} material={HOLO_MATERIALS.windowEdge} />}
        {roomLinesGeom && <lineSegments geometry={roomLinesGeom} material={HOLO_MATERIALS.roomLine} />}

        {/* Layer 3: Interactive Holographic Room Volumes */}
        {floorLayout.rooms.map((rl) => {
          const isSelected = selection.roomId === rl.room.id;
          const isHovered = hovered?.id === rl.room.id;

          return (
            <group key={rl.room.id}>
              <mesh
                position={[rl.volume.cx, rl.volume.cy, rl.volume.cz]}
                onClick={(e) => {
                  e.stopPropagation();
                  selectRoom(rl.room.id);
                }}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  document.body.style.cursor = 'pointer';
                  setHovered({
                    id: rl.room.id,
                    kind: 'room',
                    label: rl.room.name,
                    sub: `${ROOM_TYPES[rl.room.type]?.label || rl.room.type} • Tầng ${floorLayout.level + 1}`,
                  });
                }}
                onPointerOut={() => {
                  document.body.style.cursor = 'default';
                  setHovered(null);
                }}
              >
                <boxGeometry args={[rl.volume.sx, rl.volume.sy, rl.volume.sz]} />
                <primitive
                  object={
                    isSelected
                      ? HOLO_MATERIALS.roomSelected
                      : isHovered
                        ? HOLO_MATERIALS.roomHover
                        : MATERIALS.pick
                  }
                  attach="material"
                />
              </mesh>

              {/* Selection box outline in holographic mode */}
              {isSelected && (
                <lineSegments position={[rl.volume.cx, rl.volume.cy, rl.volume.cz]}>
                  <edgesGeometry args={[new THREE.BoxGeometry(rl.volume.sx, rl.volume.sy, rl.volume.sz)]} />
                  <primitive object={HOLO_MATERIALS.selectionOutline} attach="material" />
                </lineSegments>
              )}
            </group>
          );
        })}
      </group>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MODE 2: STANDARD ARCHITECTURAL / SCHEMATIC / FLOORPLAN / NETWORK MODES
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <group position={[0, floorLayout.baseY, 0]}>
      {/* Structural Slabs & Tiles */}
      {slabGeom && <mesh geometry={slabGeom} material={MATERIALS.slab} receiveShadow />}
      {corridorTileGeom && <mesh geometry={corridorTileGeom} material={MATERIALS.corridorTile} receiveShadow />}
      {tileGeom && <mesh geometry={tileGeom} material={MATERIALS.tile} receiveShadow />}

      {/* Ground Floor Plinth & Entrance Steps */}
      {plinthGeom && <mesh geometry={plinthGeom} material={MATERIALS.plinth} castShadow receiveShadow />}
      {entranceStepGeom && <mesh geometry={entranceStepGeom} material={MATERIALS.stairs} receiveShadow />}

      {/* Walls, Columns & Ceiling Beams */}
      {extWallGeom && <mesh geometry={extWallGeom} material={MATERIALS.exterior} castShadow receiveShadow />}
      {corrWallGeom && <mesh geometry={corrWallGeom} material={MATERIALS.corridorWall} castShadow receiveShadow />}
      {partGeom && <mesh geometry={partGeom} material={MATERIALS.partition} castShadow receiveShadow />}
      {columnGeom && <mesh geometry={columnGeom} material={MATERIALS.column} castShadow />}
      {beamGeom && <mesh geometry={beamGeom} material={MATERIALS.beam} castShadow />}

      {/* Windows, Doors, Stairs & Railings */}
      {flags.showOpenings && (
        <>
          {/* Architectural Window Assembly with Depth */}
          {windowSillGeom && <mesh geometry={windowSillGeom} material={MATERIALS.windowSill} castShadow receiveShadow />}
          {windowFrameGeom && <mesh geometry={windowFrameGeom} material={MATERIALS.windowFrame} castShadow />}
          {windowGeom && <mesh geometry={windowGeom} material={MATERIALS.glass} />}

          {/* Architectural Door Assembly */}
          {doorFrameGeom && <mesh geometry={doorFrameGeom} material={MATERIALS.doorFrame} castShadow />}
          {doorGeom && <mesh geometry={doorGeom} material={MATERIALS.door} />}

          {/* Architectural Railing with Balusters */}
          {railGeom && <mesh geometry={railGeom} material={MATERIALS.railing} castShadow />}
          {railPostGeom && <mesh geometry={railPostGeom} material={MATERIALS.baluster} castShadow />}

          {/* Architectural Staircase with Handrails */}
          {stairGeom && <mesh geometry={stairGeom} material={MATERIALS.stairs} castShadow receiveShadow />}
          {stairRailingGeom && <mesh geometry={stairRailingGeom} material={MATERIALS.stairRailing} castShadow />}
        </>
      )}

      {/* Wireframe Room outlines in Schematic / Floorplan mode */}
      {flags.showRoomLines && roomLinesGeom && (
        <lineSegments geometry={roomLinesGeom} material={MATERIALS.roomLine} />
      )}

      {/* Interactive Room Picking Volumes */}
      {floorLayout.rooms.map((rl) => {
        const isSelected = selection.roomId === rl.room.id;
        return (
          <group key={rl.room.id}>
            <mesh
              position={[rl.volume.cx, rl.volume.cy, rl.volume.cz]}
              onClick={(e) => {
                e.stopPropagation();
                selectRoom(rl.room.id);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = 'pointer';
                setHovered({
                  id: rl.room.id,
                  kind: 'room',
                  label: rl.room.name,
                  sub: `${ROOM_TYPES[rl.room.type]?.label || rl.room.type} • Tầng ${floorLayout.level + 1}`,
                });
              }}
              onPointerOut={() => {
                document.body.style.cursor = 'default';
                setHovered(null);
              }}
            >
              <boxGeometry args={[rl.volume.sx, rl.volume.sy, rl.volume.sz]} />
              <primitive object={isSelected ? MATERIALS.selected : MATERIALS.pick} attach="material" />
            </mesh>

            {isSelected && (
              <lineSegments position={[rl.volume.cx, rl.volume.cy, rl.volume.cz]}>
                <edgesGeometry args={[new THREE.BoxGeometry(rl.volume.sx, rl.volume.sy, rl.volume.sz)]} />
                <primitive object={MATERIALS.outline} attach="material" />
              </lineSegments>
            )}

            {/* 3D Floating Room Label Badge */}
            {(isSelected ||
              hovered?.id === rl.room.id ||
              selection.buildingId === buildingId ||
              floorFilter !== 'all' ||
              viewMode === 'floorplan') && (
              <Html
                position={[rl.volume.cx, rl.volume.cy + rl.volume.sy * 0.45, rl.volume.cz]}
                center
                distanceFactor={30}
                zIndexRange={[60, 0]}
                style={{ pointerEvents: 'none' }}
              >
                <div
                  className={`px-2 py-0.5 rounded-lg border text-[10px] font-semibold tracking-wide whitespace-nowrap transition-all duration-150 select-none shadow-md ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-400 shadow-blue-500/40 scale-105'
                      : hovered?.id === rl.room.id
                        ? 'bg-zinc-950/90 text-cyan-300 border-cyan-400/80 shadow-cyan-500/30'
                        : rl.room.type === 'computer-lab'
                          ? 'bg-zinc-950/80 text-cyan-200 border-cyan-500/50'
                          : rl.room.type === 'meeting'
                            ? 'bg-zinc-950/80 text-amber-200 border-amber-500/50'
                            : 'bg-zinc-950/75 text-zinc-200 border-white/20'
                  }`}
                >
                  {rl.room.name}
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}
