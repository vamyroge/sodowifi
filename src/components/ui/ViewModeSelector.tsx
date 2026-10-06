import { useTwinStore, type ViewMode } from '../../store/twin-store';

const MODES: Array<{ id: ViewMode; label: string; desc: string }> = [
  { id: 'architectural', label: 'Kiến trúc', desc: 'Mô hình kiến trúc đầy đủ của trường' },
  { id: 'transparent', label: 'Mạng & Trong suốt', desc: 'Xem kiến trúc trong suốt và toàn bộ hệ thống cáp mạng 3D' },
];

export function ViewModeSelector() {
  const viewMode = useTwinStore((s) => s.viewMode);
  const setViewMode = useTwinStore((s) => s.setViewMode);

  return (
    <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/85 dark:bg-zinc-900/85 backdrop-blur-2xl border border-zinc-200/70 dark:border-zinc-800/70 shadow-lg shadow-black/5 transition-all text-xs">
      <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase px-1.5 hidden sm:inline">
        Chế độ:
      </span>
      {MODES.map((m) => {
        const isActive = viewMode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => setViewMode(m.id)}
            title={m.desc}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all flex items-center gap-1.5 ${
              isActive
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm shadow-zinc-900/20 ring-1 ring-zinc-700/20'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <span>{m.id === 'architectural' ? '🏛️' : '🔮'}</span>
            <span>{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}
