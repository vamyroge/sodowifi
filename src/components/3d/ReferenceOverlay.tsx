import { useMemo } from 'react';
import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';
import { getSceneIndex } from '../../lib/3d/scene';
import { imageWorldRect } from '../../lib/geometry/plan';
import { useTwinStore } from '../../store/twin-store';

export function ReferenceOverlay() {
  const showReference = useTwinStore((s) => s.showReference);
  const sceneIndex = getSceneIndex();
  const cal = sceneIndex.school.calibration;

  const texture = useLoader(THREE.TextureLoader, 'reference/sodotruong.jpg');

  const bounds = useMemo(() => imageWorldRect(cal), [cal]);

  if (!showReference) return null;

  return (
    <mesh position={[bounds.cx, 0.05, bounds.cz]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[bounds.w, bounds.d]} />
      <meshBasicMaterial map={texture} transparent opacity={0.65} depthWrite={false} />
    </mesh>
  );
}
