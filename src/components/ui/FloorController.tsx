import { useTwinStore } from '../../store/twin-store';
import { getSceneIndex } from '../../lib/3d/scene';
import { floorLabel } from '../../lib/3d/scene-index';

export function FloorController() {
  const selection = useTwinStore((s) => s.selection);
  const floorFilter = useTwinStore((s) => s.floorFilter);
  const setFloorFilter = useTwinStore((s) => s.setFloorFilter);
  const explode = useTwinStore((s) => s.explode);
  const toggleExplode = useTwinStore((s) => s.toggleExplode);

  const sceneIndex = getSceneIndex();

  // Find max floor level in context:
  let availableLevels: number[] = [0, 1, 2];
  if (selection.buildingId) {
    const bLayout = sceneIndex.layoutById.get(selection.buildingId);
    if (bLayout) {
      availableLevels = bLayout.floors.map((f) => f.level);
    }
  }

  return (
    <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/85 dark:bg-zinc-900/85 backdrop-blur-2xl border border-zinc-200/70 dark:border-zinc-800/70 shadow-lg shadow-black/5 transition-all text-xs">
      {/* Floor Filter Buttons */}
      <div className="flex items-center gap-1 pr-1.5 border-r border-zinc-200/60 dark:border-zinc-800/60">
        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase px-1.5 hidden sm:inline">
          Tầng:
        </span>
        <button
          onClick={() => setFloorFilter('all')}
          className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
            floorFilter === 'all'
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25 ring-1 ring-blue-400/30'
              : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          Tất cả
        </button>

        {availableLevels.map((lvl) => (
          <button
            key={lvl}
            onClick={() => setFloorFilter(lvl)}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
              floorFilter === lvl
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25 ring-1 ring-blue-400/30'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            {floorLabel(lvl)}
          </button>
        ))}
      </div>

      {/* Explode Floors Toggle Button */}
      <button
        onClick={toggleExplode}
        title="Tách các tầng không gian để nhìn rõ từng tầng"
        className={`px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 ${
          explode
            ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/25 ring-1 ring-amber-300/30'
            : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
        }`}
      >
        <span>{explode ? '📦 Thu gọn tầng' : '✨ Tách tầng'}</span>
      </button>
    </div>
  );
}
