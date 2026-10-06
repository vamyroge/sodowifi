import { describe, it, expect } from 'vitest';
import { schoolScene } from '../data/school/school-scene';
import { validateScene } from '../lib/3d/validate-scene';
import { buildSceneIndex } from '../lib/3d/scene-index';

describe('School Digital Twin Data Integrity', () => {
  it('passes scene validation with zero critical errors', () => {
    const issues = validateScene(schoolScene);
    const errors = issues.filter((i) => i.level === 'error');
    expect(errors).toEqual([]);
  });

  it('builds scene index correctly with all 5 buildings and facilities', () => {
    const index = buildSceneIndex(schoolScene);
    expect(index.layouts.length).toBe(5);
    expect(index.school.facilities.length).toBeGreaterThan(5);
    expect(index.roomById.size).toBeGreaterThan(30);
  });
});
