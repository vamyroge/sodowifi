import { schoolScene } from '../../data/school/school-scene';
import { buildSceneIndex, type SceneIndex } from './scene-index';

let cached: SceneIndex | null = null;

/** Lazily-built, memoised scene index (layouts are computed once). */
export function getSceneIndex(): SceneIndex {
  if (!cached) cached = buildSceneIndex(schoolScene);
  return cached;
}
