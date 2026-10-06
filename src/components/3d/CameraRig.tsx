import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useTwinStore } from '../../store/twin-store';
import { getSceneIndex } from '../../lib/3d/scene';
import { applyProximity } from '../../lib/3d/materials';
import {
  computeOptimalPose,
  cartesianToSpherical,
  sphericalToCartesian,
  shortestAngleDelta,
  easeOutCubic,
  CAMPUS_CONSTRAINTS,
} from '../../lib/3d/camera-math';

interface TransitionState {
  active: boolean;
  startTime: number;
  duration: number;
  startTarget: THREE.Vector3;
  destTarget: THREE.Vector3;
  startDist: number;
  destDist: number;
  startAzimuth: number;
  deltaAzimuth: number;
  startPolar: number;
  destPolar: number;
}

// Reusable temporary vectors to prevent allocation per frame
const _tempTarget = new THREE.Vector3();

export function CameraRig({ controlsRef }: { controlsRef: React.RefObject<OrbitControlsImpl | null> }) {
  const { camera } = useThree();
  const cameraMode = useTwinStore((s) => s.cameraMode);
  const cameraNonce = useTwinStore((s) => s.cameraNonce);
  const selection = useTwinStore((s) => s.selection);
  const floorFilter = useTwinStore((s) => s.floorFilter);
  const explode = useTwinStore((s) => s.explode);
  const viewMode = useTwinStore((s) => s.viewMode);

  const transitionRef = useRef<TransitionState>({
    active: false,
    startTime: 0,
    duration: 550,
    startTarget: new THREE.Vector3(),
    destTarget: new THREE.Vector3(),
    startDist: 150,
    destDist: 150,
    startAzimuth: 0,
    deltaAzimuth: 0,
    startPolar: Math.PI / 4,
    destPolar: Math.PI / 4,
  });

  // Calculate and launch smooth spherical transition on selection/cameraMode change
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const sceneIndex = getSceneIndex();
    const destPose = computeOptimalPose({
      sceneIndex,
      selection,
      cameraMode,
      floorFilter,
      explode,
      viewMode,
    });

    const currentSpherical = cartesianToSpherical(camera.position, controls.target);
    const deltaAzimuth = shortestAngleDelta(currentSpherical.azimuth, destPose.azimuth);

    // Adaptive duration based on angular and positional distance (450ms - 650ms)
    const targetDist = controls.target.distanceTo(destPose.target);
    const radDist = Math.abs(currentSpherical.distance - destPose.distance);
    const duration = THREE.MathUtils.clamp(460 + targetDist * 1.8 + radDist * 0.4, 460, 680);

    transitionRef.current = {
      active: true,
      startTime: performance.now(),
      duration,
      startTarget: controls.target.clone(),
      destTarget: destPose.target,
      startDist: currentSpherical.distance,
      destDist: destPose.distance,
      startAzimuth: currentSpherical.azimuth,
      deltaAzimuth,
      startPolar: currentSpherical.polar,
      destPolar: destPose.polar,
    };
  }, [cameraNonce, cameraMode, selection, floorFilter, explode, viewMode, camera, controlsRef]);

  useFrame(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const trans = transitionRef.current;

    if (trans.active) {
      const now = performance.now();
      const elapsed = now - trans.startTime;
      const progress = Math.min(1, elapsed / trans.duration);
      const easedT = easeOutCubic(progress);

      // Interpolate Target vector
      _tempTarget.lerpVectors(trans.startTarget, trans.destTarget, easedT);
      controls.target.copy(_tempTarget);

      // Interpolate Spherical coordinates
      const currentDist = THREE.MathUtils.lerp(trans.startDist, trans.destDist, easedT);
      const currentAzimuth = trans.startAzimuth + trans.deltaAzimuth * easedT;
      const currentPolar = THREE.MathUtils.lerp(trans.startPolar, trans.destPolar, easedT);

      // Update Camera Cartesian position
      sphericalToCartesian(_tempTarget, currentDist, currentAzimuth, currentPolar, camera.position);
      controls.update();

      if (progress >= 1) {
        trans.active = false;
      }
    } else {
      // Continuous Auto-Orbit when orbit preset is chosen
      if (cameraMode === 'orbit') {
        controls.autoRotate = true;
        controls.autoRotateSpeed = 1.0;
      } else {
        controls.autoRotate = false;
      }

      // Soft Pan Boundary Clamping to prevent losing the campus
      controls.target.x = THREE.MathUtils.clamp(
        controls.target.x,
        CAMPUS_CONSTRAINTS.panBounds.minX,
        CAMPUS_CONSTRAINTS.panBounds.maxX
      );
      controls.target.z = THREE.MathUtils.clamp(
        controls.target.z,
        CAMPUS_CONSTRAINTS.panBounds.minZ,
        CAMPUS_CONSTRAINTS.panBounds.maxZ
      );
      controls.target.y = Math.max(0, controls.target.y);

      // Ground Protection (keep camera above surface)
      if (camera.position.y < 0.6) {
        camera.position.y = 0.6;
      }
    }

    // Proximity fade for transparent holographic mode
    const dist = camera.position.distanceTo(controls.target);
    const closeness = THREE.MathUtils.clamp(1 - (dist - 15) / 80, 0, 1);
    applyProximity(viewMode, closeness);
  });

  return null;
}
