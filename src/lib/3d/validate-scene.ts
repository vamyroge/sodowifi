import type { PxRect, School } from '../../types/school';

export interface SceneIssue {
  level: 'error' | 'warning';
  message: string;
}

const inside = (v: number, a: number, b: number) => v >= Math.min(a, b) - 0.5 && v <= Math.max(a, b) + 0.5;

/**
 * Data integrity checks. Never throws — the app surfaces issues to developers
 * instead of crashing (requirement §25).
 */
export function validateScene(school: School): SceneIssue[] {
  const issues: SceneIssue[] = [];
  const ids = new Set<string>();
  const claim = (id: string, where: string) => {
    if (ids.has(id)) issues.push({ level: 'error', message: `Duplicate id "${id}" (${where})` });
    ids.add(id);
  };

  claim(school.id, 'school');
  for (const b of school.buildings) {
    claim(b.id, 'building');
    if (b.floors.length === 0) issues.push({ level: 'warning', message: `${b.id} has no floors` });
    const fp: PxRect = b.footprint;
    const levels = new Set<number>();
    for (const fl of b.floors) {
      claim(fl.id, `${b.id} floor`);
      if (levels.has(fl.level)) issues.push({ level: 'error', message: `${b.id}: duplicate level ${fl.level}` });
      levels.add(fl.level);
      const spans: Array<[number, number, string]> = [];
      for (const r of fl.rooms) {
        claim(r.id, `${fl.id} room`);
        const [a, c] = r.span;
        const lo = b.axis === 'y' ? fp.y0 : fp.x0;
        const hi = b.axis === 'y' ? fp.y1 : fp.x1;
        if (!inside(a, lo, hi) || !inside(c, lo, hi)) {
          issues.push({ level: 'error', message: `${r.id}: span [${a}, ${c}] outside footprint of ${b.id}` });
        }
        if (c <= a) issues.push({ level: 'error', message: `${r.id}: empty span` });
        spans.push([a, c, r.id]);
      }
      spans.sort((p, q) => p[0] - q[0]);
      for (let i = 1; i < spans.length; i++) {
        const prev = spans[i - 1]!;
        const cur = spans[i]!;
        if (cur[0] < prev[1] - 0.5) {
          issues.push({ level: 'error', message: `${cur[2]} overlaps ${prev[2]} on ${fl.id}` });
        }
      }
    }
  }
  for (const f of school.facilities) claim(f.id, 'facility');
  for (const g of school.gates) claim(g.id, 'gate');
  for (const n of school.network.nodes) claim(n.id, 'network node');
  return issues;
}
