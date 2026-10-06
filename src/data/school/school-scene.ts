/**
 * School scene data — STEP 5 of the workflow.
 *
 * Every coordinate is in reference-image pixels (sodotruong.jpg). The 3D layer
 * converts them via `calibration` (see src/lib/geometry/plan.ts).
 * See school-analysis.md for the reasoning behind each value.
 */
import type { School } from '../../types/school';
import { buildingA } from '../buildings/building-a';
import { buildingB } from '../buildings/building-b';
import { buildingCD } from '../buildings/building-cd';
import { buildingE } from '../buildings/building-e';
import { buildingF } from '../buildings/building-f';
import { facilities, fenceProvenance, fenceSegments, gates, roads } from './outdoor';
import { REFERENCE_IMAGE, estimated, fromImage, rect } from './provenance';

export const schoolScene: School = {
  id: 'school-main',
  name: 'THPT Số 1 Tư Nghĩa',
  subtitle: '3D Digital Twin',
  calibration: {
    image: REFERENCE_IMAGE,
    imageWidthPx: 1280,
    imageHeightPx: 960,
    originPx: [640, 480],
    metresPerPx: 0.2,
    northDirection: '+x',
    provenance: {
      ...estimated(
        'Ảnh không có thước tỷ lệ. 0.2 m/px được chọn để ô phòng học (~36 px) ≈ 7.2 m. Hướng Bắc đọc từ mũi tên “NAM → BẮC” (high).',
        'medium',
      ),
    },
  },
  campus: {
    ground: rect(80, 20, 1250, 850),
    courtyard: rect(240, 140, 1050, 850),
    provenance: estimated('Ranh khuôn viên theo tường rào; bề mặt sân lát ước lượng.', 'medium', rect(80, 20, 1250, 850)),
  },
  buildings: [buildingE, buildingB, buildingA, buildingCD, buildingF],
  facilities,
  fence: { segments: fenceSegments, heightM: 2, provenance: fenceProvenance },
  gates,
  roads,
  network: { nodes: [], connections: [] },
  referenceImages: [
    {
      image: REFERENCE_IMAGE,
      region: rect(0, 0, 1280, 960),
      note: 'Mặt bằng tổng thể 2D — ảnh tham chiếu duy nhất.',
    },
  ],
};

/** Provenance of the scene as a whole, used by the inspector. */
export const sceneProvenance = fromImage(rect(0, 0, 1280, 960), 'high', 'Bố cục tổng thể đọc trực tiếp từ sodotruong.jpg.');
