import { useMemo } from 'react';
import * as THREE from 'three';
import { useTwinStore } from '../../store/twin-store';
import { HOLO_MATERIALS } from '../../lib/3d/hologram-materials';

export function HolographicGrid() {
  const viewMode = useTwinStore((s) => s.viewMode);

  // Generate grid geometry once
  const { gridGeometry, ringGeometries } = useMemo(() => {
    // 1. Orthogonal grid
    const points: THREE.Vector3[] = [];
    const size = 180;
    const step = 8;

    for (let x = -size; x <= size; x += step) {
      points.push(new THREE.Vector3(x, 0.02, -size));
      points.push(new THREE.Vector3(x, 0.02, size));
    }
    for (let z = -size; z <= size; z += step) {
      points.push(new THREE.Vector3(-size, 0.02, z));
      points.push(new THREE.Vector3(size, 0.02, z));
    }

    const gridGeom = new THREE.BufferGeometry().setFromPoints(points);

    // 2. Polar range rings
    const radii = [25, 55, 90, 135];
    const ringGeoms = radii.map((r) => {
      const ringPts: THREE.Vector3[] = [];
      const segments = 64;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        ringPts.push(new THREE.Vector3(Math.cos(theta) * r, 0.03, Math.sin(theta) * r));
      }
      return new THREE.BufferGeometry().setFromPoints(ringPts);
    });

    return { gridGeometry: gridGeom, ringGeometries: ringGeoms };
  }, []);

  if (viewMode !== 'transparent') return null;

  return (
    <group name="holographic-grid" position={[15, 0, -10]}>
      {/* Rectangular Cyan Grid */}
      <lineSegments geometry={gridGeometry} material={HOLO_MATERIALS.groundGrid} />

      {/* Concentric Polar Range Rings */}
      {ringGeometries.map((geom, idx) => (
        <lineLoop key={idx} geometry={geom} material={HOLO_MATERIALS.groundGrid} />
      ))}

      {/* Axis markers */}
      <lineSegments
        geometry={
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-140, 0.04, 0),
            new THREE.Vector3(140, 0.04, 0),
            new THREE.Vector3(0, 0.04, -140),
            new THREE.Vector3(0, 0.04, 140),
          ])
        }
      >
        <lineBasicMaterial color="#38bdf8" transparent opacity={0.35} />
      </lineSegments>
    </group>
  );
}
