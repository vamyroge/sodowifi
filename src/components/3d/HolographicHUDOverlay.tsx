import { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useTwinStore } from '../../store/twin-store';
import { getSceneIndex } from '../../lib/3d/scene';
import { floorLabel } from '../../lib/3d/scene-index';

export function HolographicHUDOverlay() {
  const viewMode = useTwinStore((s) => s.viewMode);
  const selection = useTwinStore((s) => s.selection);
  const hovered = useTwinStore((s) => s.hovered);
  const selectBuilding = useTwinStore((s) => s.selectBuilding);
  const setHovered = useTwinStore((s) => s.setHovered);

  const sceneIndex = getSceneIndex();

  const isTransparent = viewMode === 'transparent';

  // Compute building HUD cards data
  const buildingCards = useMemo(() => {
    return sceneIndex.layouts.map((l) => {
      const b = l.building;
      const totalRooms = l.floors.reduce((acc, f) => acc + f.rooms.length, 0);
      const isSelected = selection.buildingId === b.id;
      const isHovered = hovered?.id === b.id;

      return {
        id: b.id,
        code: b.code,
        name: b.name,
        floorsCount: b.floors.length,
        totalRooms,
        position: [l.bounds.cx, l.structureHeight + 3.8, l.bounds.cz] as [number, number, number],
        roofTop: [l.bounds.cx, l.structureHeight, l.bounds.cz] as [number, number, number],
        isSelected,
        isHovered,
      };
    });
  }, [sceneIndex, selection.buildingId, hovered]);

  // Selected room details for holographic room badge
  const selectedRoomEntry = selection.roomId
    ? sceneIndex.roomById.get(selection.roomId)
    : null;

  if (!isTransparent) return null;

  return (
    <group name="holographic-hud-overlay">
      {/* 1. FLOATING SCI-FI BUILDING HUD LABELS WITH LEADER LINES */}
      {buildingCards.map((b) => (
        <group key={b.id}>
          {/* Vertical Glowing Leader Line */}
          <lineSegments
            geometry={
              new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(b.roofTop[0], b.roofTop[1], b.roofTop[2]),
                new THREE.Vector3(b.position[0], b.position[1] - 0.5, b.position[2]),
              ])
            }
          >
            <lineBasicMaterial
              color={b.isSelected ? '#ffffff' : '#00e5ff'}
              transparent
              opacity={b.isSelected || b.isHovered ? 0.95 : 0.5}
            />
          </lineSegments>

          {/* Anchor Node Dot at building roof */}
          <mesh position={b.roofTop}>
            <sphereGeometry args={[0.3, 12, 12]} />
            <meshBasicMaterial color="#00e5ff" />
          </mesh>

          {/* Natural Architectural Tag */}
          <Html position={b.position} center distanceFactor={52} zIndexRange={[100, 10]}>
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
                  sub: `${b.floorsCount} tầng • ${b.totalRooms} phòng`,
                });
              }}
              onPointerOut={() => setHovered(null)}
              className={`cursor-pointer select-none transition-all duration-200 text-[10px] px-2.5 py-1 rounded-lg border backdrop-blur-md shadow-md flex items-center gap-1.5 ${
                b.isSelected
                  ? 'bg-blue-900/90 border-cyan-300 text-white shadow-cyan-500/30 scale-105'
                  : b.isHovered
                    ? 'bg-slate-900/90 border-cyan-400 text-cyan-200 shadow-cyan-500/20'
                    : 'bg-black/75 border-cyan-500/40 text-cyan-300 hover:border-cyan-300'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span className="font-semibold">Dãy {b.code}</span>
              <span className="text-cyan-400/50">•</span>
              <span className="text-[9px] text-cyan-300/80">{b.floorsCount} tầng ({b.totalRooms}p)</span>
            </div>
          </Html>
        </group>
      ))}

      {/* 2. SELECTED ROOM COMPACT BADGE */}
      {selectedRoomEntry && (
        <Html
          position={[
            selectedRoomEntry.roomLayout.volume.cx,
            selectedRoomEntry.floorLayout.baseY + selectedRoomEntry.roomLayout.volume.cy + 1.6,
            selectedRoomEntry.roomLayout.volume.cz,
          ]}
          center
          distanceFactor={38}
          zIndexRange={[120, 20]}
        >
          <div className="pointer-events-none select-none text-[10px] px-2 py-1 rounded-lg border border-cyan-400/60 bg-slate-950/90 text-cyan-100 shadow-md shadow-cyan-500/20 backdrop-blur-md flex items-center gap-1.5 whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="font-bold text-white">{selectedRoomEntry.room.name}</span>
            <span className="text-cyan-400/50">•</span>
            <span className="text-[9px] text-cyan-300/90">{floorLabel(selectedRoomEntry.floor.level)}</span>
          </div>
        </Html>
      )}
    </group>
  );
}
