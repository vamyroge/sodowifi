import { useMemo } from 'react';
import { getSceneIndex } from '../../lib/3d/scene';
import { rectToWorld } from '../../lib/geometry/plan';
import { MATERIALS } from '../../lib/3d/materials';
import { HOLO_MATERIALS } from '../../lib/3d/hologram-materials';
import { useTwinStore } from '../../store/twin-store';

/**
 * 1. Khối hành lang 2 tầng nối Dãy A (phải) và Dãy B (giữa) với Dãy CD tạo khối chữ U.
 * 2. Hệ mái che 1 tầng liền mạch:
 *    - Nhánh ngang chạy ngang qua khoảng sân (đối diện Nhà để xe giáo viên, y: 590 -> 615).
 *    - 2 Nhánh dọc có mái che nối thẳng từ đầu đuôi Dãy C (y: 542 -> 590) và Dãy B (y: 545 -> 590)
 *      vào hành lang ngang, tạo thành một hệ thống lối đi có mái che liên tục, khép kín và cực kỳ logic!
 */
export function ConnectingCorridorsU() {
  const viewMode = useTwinStore((s) => s.viewMode);
  const isHolo = viewMode === 'transparent';

  const sceneIndex = getSceneIndex();
  const cal = sceneIndex.school.calibration;

  // 1. Góc nối phải (2 tầng): Dãy A (x: 1080 -> 1140) <-> Dãy CD (x: 1027), y: 228 -> 250
  const cornerRight = useMemo(() => {
    return rectToWorld(cal, { x0: 1027, y0: 228, x1: 1080, y1: 250 });
  }, [cal]);

  // 2. Góc nối giữa (2 tầng): Dãy B (x: 484) <-> Dãy CD (x: 520), y: 220 -> 242
  const cornerMid = useMemo(() => {
    return rectToWorld(cal, { x0: 484, y0: 220, x1: 520, y1: 242 });
  }, [cal]);

  // 3. Hệ hành lang có mái che 1 tầng liên kết:
  // a) Nhánh ngang (x: 170 -> 484, y: 590 -> 615) đối diện Nhà để xe
  const walkwayMainHorizontal = useMemo(() => {
    return rectToWorld(cal, { x0: 170, y0: 590, x1: 484, y1: 615 });
  }, [cal]);

  // b) Nhánh dọc từ hành lang Dãy C (x: 170 -> 202, y: 540 -> 592) cắm thẳng vào nhánh ngang
  const stubWalkwayFromC = useMemo(() => {
    return rectToWorld(cal, { x0: 170, y0: 540, x1: 202, y1: 592 });
  }, [cal]);

  // c) Nhánh dọc nối thẳng vào hành lang dãy B:
  // Dãy B có hành lang ở phía +x (x từ 450 -> 484). Nhánh này khớp thẳng 100% từ mép hành lang dãy B (y: 542) dẫn thẳng vào hành lang có mái che (y: 592)
  const stubWalkwayFromB = useMemo(() => {
    return rectToWorld(cal, { x0: 450, y0: 542, x1: 484, y1: 592 });
  }, [cal]);

  const heightPerFloor = 3.6;

  // Render hành lang 2 tầng (chữ U)
  const renderConnector2Floors = (bounds: ReturnType<typeof rectToWorld>, key: string) => {
    return (
      <group key={key} position={[bounds.cx, 0, bounds.cz]}>
        {Array.from({ length: 2 }).map((_, lvl) => {
          const yBase = lvl * heightPerFloor;
          return (
            <group key={lvl} position={[0, yBase, 0]}>
              <mesh position={[0, 0.12, 0]} receiveShadow>
                <boxGeometry args={[bounds.w, 0.25, bounds.d]} />
                <primitive object={isHolo ? HOLO_MATERIALS.slab : MATERIALS.corridorTile} attach="material" />
              </mesh>
              <mesh position={[0, heightPerFloor, 0]} castShadow receiveShadow>
                <boxGeometry args={[bounds.w + 0.1, 0.25, bounds.d + 0.1]} />
                <primitive object={isHolo ? HOLO_MATERIALS.slab : MATERIALS.slab} attach="material" />
              </mesh>
              <mesh position={[0, 0.6, -bounds.d / 2 + 0.1]}>
                <boxGeometry args={[bounds.w, 1.0, 0.2]} />
                <primitive object={isHolo ? HOLO_MATERIALS.column : MATERIALS.railing} attach="material" />
              </mesh>
              <mesh position={[0, 0.6, bounds.d / 2 - 0.1]}>
                <boxGeometry args={[bounds.w, 1.0, 0.2]} />
                <primitive object={isHolo ? HOLO_MATERIALS.column : MATERIALS.railing} attach="material" />
              </mesh>
              {[-bounds.w / 2 + 0.2, bounds.w / 2 - 0.2].map((px, idx) => (
                <group key={idx}>
                  <mesh position={[px, heightPerFloor / 2, -bounds.d / 2 + 0.2]} castShadow>
                    <boxGeometry args={[0.35, heightPerFloor, 0.35]} />
                    <primitive object={isHolo ? HOLO_MATERIALS.column : MATERIALS.column} attach="material" />
                  </mesh>
                  <mesh position={[px, heightPerFloor / 2, bounds.d / 2 - 0.2]} castShadow>
                    <boxGeometry args={[0.35, heightPerFloor, 0.35]} />
                    <primitive object={isHolo ? HOLO_MATERIALS.column : MATERIALS.column} attach="material" />
                  </mesh>
                </group>
              ))}
            </group>
          );
        })}
        <mesh position={[0, 2 * heightPerFloor + 0.2, 0]} castShadow>
          <boxGeometry args={[bounds.w + 0.3, 0.3, bounds.d + 0.3]} />
          <primitive object={isHolo ? HOLO_MATERIALS.slab : MATERIALS.roof} attach="material" />
        </mesh>
      </group>
    );
  };

  // Render các nhánh hành lang 1 tầng có mái che
  const renderSingleFloorWalkway = (bounds: ReturnType<typeof rectToWorld>, key: string) => {
    const colSpacing = 3.5;
    const numCols = Math.max(1, Math.floor(Math.max(bounds.w, bounds.d) / colSpacing));
    const corridorHeight = 3.3;
    const alongX = bounds.w >= bounds.d;

    return (
      <group key={key} position={[bounds.cx, 0, bounds.cz]}>
        {/* Nền gạch */}
        <mesh position={[0, 0.1, 0]} receiveShadow>
          <boxGeometry args={[bounds.w, 0.2, bounds.d]} />
          <primitive object={isHolo ? HOLO_MATERIALS.slab : MATERIALS.corridorTile} attach="material" />
        </mesh>

        {/* Mái che 1 tầng */}
        <mesh position={[0, corridorHeight, 0]} castShadow receiveShadow>
          <boxGeometry args={[bounds.w + 0.3, 0.25, bounds.d + 0.3]} />
          <primitive object={isHolo ? HOLO_MATERIALS.slab : MATERIALS.roof} attach="material" />
        </mesh>

        {/* Lan can an toàn 2 bên */}
        {alongX ? (
          <>
            <mesh position={[0, 0.55, -bounds.d / 2 + 0.1]}>
              <boxGeometry args={[bounds.w, 0.9, 0.15]} />
              <primitive object={MATERIALS.railing} attach="material" />
            </mesh>
            <mesh position={[0, 0.55, bounds.d / 2 - 0.1]}>
              <boxGeometry args={[bounds.w, 0.9, 0.15]} />
              <primitive object={MATERIALS.railing} attach="material" />
            </mesh>
          </>
        ) : (
          <>
            <mesh position={[-bounds.w / 2 + 0.1, 0.55, 0]}>
              <boxGeometry args={[0.15, 0.9, bounds.d]} />
              <primitive object={MATERIALS.railing} attach="material" />
            </mesh>
            <mesh position={[bounds.w / 2 - 0.1, 0.55, 0]}>
              <boxGeometry args={[0.15, 0.9, bounds.d]} />
              <primitive object={MATERIALS.railing} attach="material" />
            </mesh>
          </>
        )}

        {/* Hàng cột trụ đỡ mái che */}
        {Array.from({ length: numCols + 1 }).map((_, idx) => {
          const ratio = idx / numCols - 0.5;
          if (alongX) {
            const posX = ratio * (bounds.w - 0.6);
            return (
              <group key={idx}>
                <mesh position={[posX, corridorHeight / 2, -bounds.d / 2 + 0.2]} castShadow>
                  <boxGeometry args={[0.25, corridorHeight, 0.25]} />
                  <primitive object={MATERIALS.column} attach="material" />
                </mesh>
                <mesh position={[posX, corridorHeight / 2, bounds.d / 2 - 0.2]} castShadow>
                  <boxGeometry args={[0.25, corridorHeight, 0.25]} />
                  <primitive object={MATERIALS.column} attach="material" />
                </mesh>
              </group>
            );
          } else {
            const posZ = ratio * (bounds.d - 0.6);
            return (
              <group key={idx}>
                <mesh position={[-bounds.w / 2 + 0.2, corridorHeight / 2, posZ]} castShadow>
                  <boxGeometry args={[0.25, corridorHeight, 0.25]} />
                  <primitive object={MATERIALS.column} attach="material" />
                </mesh>
                <mesh position={[bounds.w / 2 - 0.2, corridorHeight / 2, posZ]} castShadow>
                  <boxGeometry args={[0.25, corridorHeight, 0.25]} />
                  <primitive object={MATERIALS.column} attach="material" />
                </mesh>
              </group>
            );
          }
        })}
      </group>
    );
  };

  return (
    <group>
      {/* 1. Khối chữ U 2 tầng giữa A, B và CD */}
      {renderConnector2Floors(cornerRight, 'conn-u-a-cd')}
      {renderConnector2Floors(cornerMid, 'conn-u-b-cd')}

      {/* 2. Hệ thống mái che 1 tầng liên hoàn nối từ cửa 2 tòa nhà B & C ra hành lang đối diện nhà xe */}
      {renderSingleFloorWalkway(stubWalkwayFromC, 'walkway-stub-from-c')}
      {renderSingleFloorWalkway(stubWalkwayFromB, 'walkway-stub-from-b')}
      {renderSingleFloorWalkway(walkwayMainHorizontal, 'walkway-main-horizontal')}
    </group>
  );
}
