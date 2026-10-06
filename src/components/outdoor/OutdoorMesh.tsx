import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTwinStore } from '../../store/twin-store';
import { getSceneIndex } from '../../lib/3d/scene';
import { rectToWorld } from '../../lib/geometry/plan';
import { MATERIALS } from '../../lib/3d/materials';
import { HOLO_MATERIALS } from '../../lib/3d/hologram-materials';
import { gableRoofGeometry } from '../../lib/3d/geometry-builders';
import { Html } from '@react-three/drei';

function AnimatedPoolWater({ width, depth }: { width: number; depth: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useMemo(() => {
    if (typeof document === 'undefined') return new THREE.Texture();
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0066ee';
      ctx.fillRect(0, 0, 128, 128);
      ctx.fillStyle = 'rgba(125, 230, 255, 0.4)';
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.arc(16 + i * 16, 20 + (i % 3) * 32, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(8 + i * 16, 75 + (i % 2) * 26, 12, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return tex;
  }, []);

  useEffect(() => {
    return () => {
      texture.dispose();
    };
  }, [texture]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    texture.offset.x = Math.sin(t * 0.4) * 0.05 + t * 0.04;
    texture.offset.y = Math.cos(t * 0.3) * 0.05 + t * 0.02;
    if (meshRef.current) {
      meshRef.current.position.y = 0.06 + Math.sin(t * 1.6) * 0.004;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[width, depth]} />
      <meshStandardMaterial
        color="#0080ff"
        emissive="#003cd6"
        emissiveIntensity={0.65}
        roughness={0.12}
        metalness={0.35}
        map={texture}
        transparent
        opacity={0.92}
      />
    </mesh>
  );
}

export function OutdoorMesh() {
  const selectFacility = useTwinStore((s) => s.selectFacility);
  const setHovered = useTwinStore((s) => s.setHovered);
  const selection = useTwinStore((s) => s.selection);
  const viewMode = useTwinStore((s) => s.viewMode);
  const isHolo = viewMode === 'transparent';

  const sceneIndex = getSceneIndex();
  const school = sceneIndex.school;
  const cal = school.calibration;

  // Ground plane & campus yard
  const groundBounds = useMemo(() => rectToWorld(cal, school.campus.ground), [cal, school]);
  const courtyardBounds = useMemo(() => rectToWorld(cal, school.campus.courtyard), [cal, school]);

  return (
    <group>
      {/* Surrounding terrain */}
      <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[400, 300]} />
        <primitive object={isHolo ? HOLO_MATERIALS.deepGround : MATERIALS.outside} attach="material" />
      </mesh>

      {/* Campus Ground boundary */}
      <mesh
        position={[groundBounds.cx, -0.05, groundBounds.cz]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[groundBounds.w, groundBounds.d]} />
        <primitive object={isHolo ? HOLO_MATERIALS.deepGround : MATERIALS.ground} attach="material" />
      </mesh>

      {/* Main Courtyard */}
      <mesh
        position={[courtyardBounds.cx, 0.01, courtyardBounds.cz]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[courtyardBounds.w, courtyardBounds.d]} />
        <primitive object={isHolo ? HOLO_MATERIALS.deepCourtyard : MATERIALS.courtyard} attach="material" />
      </mesh>

      {/* Quốc Lộ 1A Road */}
      {school.roads.map((r) => {
        const rw = rectToWorld(cal, r.rect);
        return (
          <group key={r.id}>
            <mesh position={[rw.cx, 0.02, rw.cz]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[rw.w, rw.d]} />
              <primitive object={isHolo ? HOLO_MATERIALS.deepAsphalt : MATERIALS.asphalt} attach="material" />
            </mesh>
            {/* Road divider line */}
            <mesh position={[rw.cx, 0.03, rw.cz]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[rw.w * 0.95, 0.3]} />
              <primitive object={MATERIALS.roadLine} attach="material" />
            </mesh>
          </group>
        );
      })}

      {/* Fence segments */}
      {school.fence.segments.map((seg) => {
        const p1 = rectToWorld(cal, { x0: seg.from[0], y0: seg.from[1], x1: seg.from[0], y1: seg.from[1] });
        const p2 = rectToWorld(cal, { x0: seg.to[0], y0: seg.to[1], x1: seg.to[0], y1: seg.to[1] });
        const dx = p2.cx - p1.cx;
        const dz = p2.cz - p1.cz;
        const len = Math.hypot(dx, dz);
        const angle = Math.atan2(dx, dz);
        return (
          <mesh
            key={seg.id}
            position={[(p1.cx + p2.cx) / 2, school.fence.heightM / 2, (p1.cz + p2.cz) / 2]}
            rotation={[0, angle, 0]}
          >
            <boxGeometry args={[0.2, school.fence.heightM, len]} />
            <primitive object={MATERIALS.fence} attach="material" />
          </mesh>
        );
      })}

      {/* Gates */}
      {school.gates.map((g) => {
        const gw = rectToWorld(cal, { x0: g.x0, y0: g.y, x1: g.x1, y1: g.y });
        return (
          <group key={g.id} position={[gw.cx, 0, gw.cz]}>
            {/* Gate Pillars */}
            <mesh position={[-gw.w / 2, 2.2, 0]} castShadow>
              <boxGeometry args={[0.8, 4.4, 0.8]} />
              <primitive object={MATERIALS.exterior} attach="material" />
            </mesh>
            <mesh position={[gw.w / 2, 2.2, 0]} castShadow>
              <boxGeometry args={[0.8, 4.4, 0.8]} />
              <primitive object={MATERIALS.exterior} attach="material" />
            </mesh>
            {/* Overhead beam for Main Gate */}
            {g.main && (
              <mesh position={[0, 4.2, 0]} castShadow>
                <boxGeometry args={[gw.w + 0.8, 0.6, 0.8]} />
                <primitive object={MATERIALS.exterior} attach="material" />
              </mesh>
            )}
            {/* Overhead beam for Side Gate (cổng phụ thông thoáng, không có cánh cửa) */}
            {g.id === 'gate-side' && (
              <mesh position={[0, 3.6, 0]} castShadow>
                <boxGeometry args={[gw.w + 0.8, 0.45, 0.7]} />
                <primitive object={MATERIALS.exterior} attach="material" />
              </mesh>
            )}
          </group>
        );
      })}

      {/* Facilities (Football field, Pool, Stage, Hall, Gym, Flagpole, Planter, etc.) */}
      {school.facilities.map((fac) => {
        const bounds = rectToWorld(cal, fac.rect);
        const isSelected = selection.facilityId === fac.id;

        return (
          <group key={fac.id}>
            {fac.kind === 'football-field' && (
              <group position={[bounds.cx, 0.05, bounds.cz]}>
                {/* Grass Turf */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                  <planeGeometry args={[bounds.w, bounds.d]} />
                  <primitive object={MATERIALS.grass} attach="material" />
                </mesh>
                {/* Field Markings */}
                <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[6, 6.2, 32]} />
                  <primitive object={MATERIALS.fieldLine} attach="material" />
                </mesh>
                <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[0.2, bounds.d]} />
                  <primitive object={MATERIALS.fieldLine} attach="material" />
                </mesh>
              </group>
            )}

            {fac.kind === 'swimming-pool' && (
              <group position={[bounds.cx, 0.05, bounds.cz]}>
                {/* Animated Rippling Pool Water (Mặt nước hồ bơi gợn sóng lấp lánh sống động) */}
                <AnimatedPoolWater width={bounds.w} depth={bounds.d} />
                {/* Pool Basin Floor (đáy hồ bơi) */}
                <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                  <planeGeometry args={[bounds.w, bounds.d]} />
                  <primitive object={MATERIALS.water} attach="material" />
                </mesh>
                {/* Pool Deck / Coping Rim (thành hồ bơi bo xung quanh) */}
                <mesh position={[-bounds.w / 2 - 0.35, 0.08, 0]}>
                  <boxGeometry args={[0.7, 0.16, bounds.d + 1.4]} />
                  <primitive object={MATERIALS.sidewalk} attach="material" />
                </mesh>
                <mesh position={[bounds.w / 2 + 0.35, 0.08, 0]}>
                  <boxGeometry args={[0.7, 0.16, bounds.d + 1.4]} />
                  <primitive object={MATERIALS.sidewalk} attach="material" />
                </mesh>
                <mesh position={[0, 0.08, -bounds.d / 2 - 0.35]}>
                  <boxGeometry args={[bounds.w, 0.16, 0.7]} />
                  <primitive object={MATERIALS.sidewalk} attach="material" />
                </mesh>
                <mesh position={[0, 0.08, bounds.d / 2 + 0.35]}>
                  <boxGeometry args={[bounds.w, 0.16, 0.7]} />
                  <primitive object={MATERIALS.sidewalk} attach="material" />
                </mesh>
                {/* Swimming Lane Lines (đường bơi) */}
                {[-bounds.d * 0.25, 0, bounds.d * 0.25].map((laneZ, li) => (
                  <mesh key={li} position={[0, 0.065, laneZ]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[bounds.w * 0.9, 0.15]} />
                    <primitive object={MATERIALS.fieldLine} attach="material" />
                  </mesh>
                ))}
              </group>
            )}

            {(fac.kind === 'hall' || fac.kind === 'gym' || fac.kind === 'restroom-block' || fac.kind === 'guard-house') && (
              <group position={[bounds.cx, 0, bounds.cz]}>
                {/* Building Main Volume */}
                <mesh position={[0, fac.heightM / 2, 0]} castShadow receiveShadow>
                  <boxGeometry args={[bounds.w, fac.heightM, bounds.d]} />
                  <primitive object={MATERIALS.exterior} attach="material" />
                </mesh>

                {/* Gable Roof if specified */}
                {fac.roof?.type === 'gable' && (
                  <group position={[0, fac.heightM, 0]}>
                    <primitive
                      object={new THREE.Mesh(gableRoofGeometry(bounds.w, bounds.d, 2.5), MATERIALS.roof)}
                      castShadow
                    />
                  </group>
                )}
              </group>
            )}

            {fac.kind === 'stage' && (
              <group position={[bounds.cx, 0, bounds.cz]}>
                {/* Bục sân khấu dính sát mặt tiền Dãy C·D */}
                <mesh position={[0, fac.heightM / 2, 0]} castShadow receiveShadow>
                  <boxGeometry args={[bounds.w, fac.heightM, bounds.d]} />
                  <primitive object={MATERIALS.slab} attach="material" />
                </mesh>
                {/* Mặt sàn sân khấu gạch cam */}
                <mesh position={[0, fac.heightM + 0.015, 0]} receiveShadow>
                  <boxGeometry args={[bounds.w - 0.2, 0.03, bounds.d - 0.2]} />
                  <primitive object={MATERIALS.corridorTile} attach="material" />
                </mesh>
                {/* Bậc tam cấp phía trước bước xuống sân trường */}
                <mesh position={[0, fac.heightM * 0.25, bounds.d / 2 + 0.35]}>
                  <boxGeometry args={[bounds.w * 0.65, fac.heightM * 0.5, 0.7]} />
                  <primitive object={MATERIALS.stairs} attach="material" />
                </mesh>
                <mesh position={[0, fac.heightM * 0.12, bounds.d / 2 + 0.7]}>
                  <boxGeometry args={[bounds.w * 0.75, fac.heightM * 0.25, 0.7]} />
                  <primitive object={MATERIALS.stairs} attach="material" />
                </mesh>
              </group>
            )}



            {fac.kind === 'planter' && (
              <group position={[bounds.cx, 0, bounds.cz]}>
                <mesh position={[0, fac.heightM / 2, 0]}>
                  <boxGeometry args={[bounds.w, fac.heightM, bounds.d]} />
                  <primitive object={MATERIALS.slab} attach="material" />
                </mesh>
                {/* Foliage */}
                <mesh position={[0, 1.6, 0]} castShadow>
                  <sphereGeometry args={[1.2, 7, 7]} />
                  <primitive object={MATERIALS.foliage} attach="material" />
                </mesh>
              </group>
            )}

            {fac.kind === 'notice-board' && (
              <mesh position={[bounds.cx, fac.heightM / 2, bounds.cz]} castShadow>
                <boxGeometry args={[bounds.w, fac.heightM, bounds.d]} />
                <primitive object={MATERIALS.board} attach="material" />
              </mesh>
            )}

            {fac.kind === 'parking-canopy' && (
              <group position={[bounds.cx, 0, bounds.cz]}>
                <mesh position={[0, fac.heightM, 0]} castShadow>
                  <boxGeometry args={[bounds.w, 0.15, bounds.d]} />
                  <primitive object={MATERIALS.metal} attach="material" />
                </mesh>
                {/* Support pillars */}
                {[-bounds.w / 2 + 1, bounds.w / 2 - 1].map((px, i) => (
                  <mesh key={i} position={[px, fac.heightM / 2, 0]}>
                    <cylinderGeometry args={[0.08, 0.08, fac.heightM, 8]} />
                    <primitive object={MATERIALS.metal} attach="material" />
                  </mesh>
                ))}
              </group>
            )}

            {/* Interactive Hitbox for outdoor facility */}
            <mesh
              position={[bounds.cx, Math.max(fac.heightM / 2, 0.5), bounds.cz]}
              onClick={(e) => {
                e.stopPropagation();
                selectFacility(fac.id);
              }}
              onPointerOver={(e) => {
                e.stopPropagation();
                document.body.style.cursor = 'pointer';
                setHovered({
                  id: fac.id,
                  kind: 'facility',
                  label: fac.name,
                  sub: fac.provenance.estimated ? 'Chi tiết ước lượng' : 'Vị trí theo ảnh',
                });
              }}
              onPointerOut={() => {
                document.body.style.cursor = 'default';
                setHovered(null);
              }}
            >
              <boxGeometry args={[bounds.w + 0.4, Math.max(fac.heightM, 1), bounds.d + 0.4]} />
              <primitive object={isSelected ? MATERIALS.selected : MATERIALS.pick} attach="material" />
            </mesh>

            {isSelected && (
              <lineSegments position={[bounds.cx, Math.max(fac.heightM / 2, 0.5), bounds.cz]}>
                <edgesGeometry args={[new THREE.BoxGeometry(bounds.w + 0.4, Math.max(fac.heightM, 1), bounds.d + 0.4)]} />
                <primitive object={MATERIALS.outline} attach="material" />
              </lineSegments>
            )}

            {/* Label badge for major outdoor facilities */}
            {(fac.kind === 'hall' || fac.kind === 'gym' || fac.kind === 'football-field' || fac.kind === 'swimming-pool') && (
              <Html position={[bounds.cx, Math.max(fac.heightM, 1) + 2.5, bounds.cz]} center distanceFactor={70}>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    selectFacility(fac.id);
                  }}
                  className={`pointer-events-auto cursor-pointer px-2 py-0.5 rounded text-[10px] font-medium tracking-wide border select-none backdrop-blur-md shadow-xs transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-400'
                      : 'bg-white/70 dark:bg-zinc-800/70 text-zinc-700 dark:text-zinc-300 border-zinc-200/50 hover:border-blue-400'
                  }`}
                >
                  {fac.name}
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}
