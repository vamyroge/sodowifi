import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTwinStore } from '../../store/twin-store';

export function HolographicScanLine() {
  const viewMode = useTwinStore((s) => s.viewMode);
  const scanGroupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!scanGroupRef.current || viewMode !== 'transparent') return;
    const time = state.clock.getElapsedTime();
    // Smooth triangular wave: elevation 0 to 18 metres with 8 second period
    const cycle = (time * 0.25) % 2;
    const height = cycle < 1 ? cycle * 18 : (2 - cycle) * 18;
    scanGroupRef.current.position.y = height;
  });

  if (viewMode !== 'transparent') return null;

  return (
    <group ref={scanGroupRef} position={[25, 0, 5]}>
      {/* Laser scan plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[180, 140]} />
        <meshBasicMaterial
          color="#00e5ff"
          transparent
          opacity={0.06}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Laser edge frame */}
      <lineSegments
        geometry={
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-90, 0, -70),
            new THREE.Vector3(90, 0, -70),
            new THREE.Vector3(90, 0, -70),
            new THREE.Vector3(90, 0, 70),
            new THREE.Vector3(90, 0, 70),
            new THREE.Vector3(-90, 0, 70),
            new THREE.Vector3(-90, 0, 70),
            new THREE.Vector3(-90, 0, -70),
          ])
        }
      >
        <lineBasicMaterial color="#00ffff" transparent opacity={0.4} />
      </lineSegments>
    </group>
  );
}
