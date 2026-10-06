import { useEffect } from 'react';
import { useTwinStore } from '../../store/twin-store';
import { applyViewMode } from '../../lib/3d/materials';
import { BuildingMesh } from '../buildings/BuildingMesh';
import { ConnectingCorridorsU } from '../buildings/ConnectingCorridorsU';
import { OutdoorMesh } from '../outdoor/OutdoorMesh';
import { Network3DLayer } from '../network/Network3DLayer';
import { HolographicGrid } from './HolographicGrid';
import { HolographicHUDOverlay } from './HolographicHUDOverlay';
import { getSceneIndex } from '../../lib/3d/scene';

export function CampusScene() {
  const viewMode = useTwinStore((s) => s.viewMode);
  const setLoadStage = useTwinStore((s) => s.setLoadStage);

  const sceneIndex = getSceneIndex();

  useEffect(() => {
    applyViewMode(viewMode);
  }, [viewMode]);

  useEffect(() => {
    setLoadStage('ready');
  }, [setLoadStage]);

  return (
    <group>
      {/* Campus Ground & Outdoor Facilities */}
      <OutdoorMesh />

      {/* Holographic 3D Coordinate Grid & Range Rings */}
      <HolographicGrid />

      {/* Khối hành lang 2 tầng nối Dãy A & B với CD tạo thành khối chữ U */}
      <ConnectingCorridorsU />

      {/* Buildings */}
      {sceneIndex.layouts.map((layout) => (
        <BuildingMesh key={layout.building.id} layout={layout} />
      ))}

      {/* Holographic Sci-Fi FUI Building & Room HUD Overlays */}
      <HolographicHUDOverlay />

      {/* Network Infrastructure 3D Layer (Routers, Switches, WAPs, Cables) */}
      <Network3DLayer />
    </group>
  );
}
