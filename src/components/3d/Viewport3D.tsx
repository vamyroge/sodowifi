import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { SceneLighting } from './SceneLighting';
import { CameraRig } from './CameraRig';
import { CampusScene } from './CampusScene';
import { CAMPUS_CONSTRAINTS } from '../../lib/3d/camera-math';
import { useTwinStore } from '../../store/twin-store';

export function Viewport3D() {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const clearSelection = useTwinStore((s) => s.clearSelection);
  const viewMode = useTwinStore((s) => s.viewMode);
  const lighting = useTwinStore((s) => s.lighting);

  return (
    <div className="relative w-full h-full select-none">
      <Canvas
        onPointerMissed={() => {
          clearSelection();
        }}
        shadows={viewMode === 'architectural'}
        camera={{ position: [0, 85, 125], fov: 42, near: 0.5, far: 500 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <color
          attach="background"
          args={[
            viewMode === 'transparent'
              ? '#030712'
              : viewMode === 'floorplan'
                ? '#e2e8f0'
                : lighting === 'night'
                  ? '#060a17'
                  : lighting === 'evening'
                    ? '#2e1c2b'
                    : '#bae6fd',
          ]}
        />
        
        <SceneLighting />
        <CampusScene />
        <CameraRig controlsRef={controlsRef} />

        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.06}
          minDistance={CAMPUS_CONSTRAINTS.minDistance}
          maxDistance={CAMPUS_CONSTRAINTS.maxDistance}
          maxPolarAngle={viewMode === 'floorplan' ? 0.05 : CAMPUS_CONSTRAINTS.maxPolarAngle}
          minPolarAngle={CAMPUS_CONSTRAINTS.minPolarAngle}
        />
      </Canvas>
    </div>
  );
}
