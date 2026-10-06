import { useTwinStore } from '../../store/twin-store';

export function HoverTooltip() {
  const hovered = useTwinStore((s) => s.hovered);

  if (!hovered) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 pointer-events-none z-30 transition-all duration-150">
      <div className="px-4 py-2 rounded-xl bg-zinc-900/95 text-white backdrop-blur-md shadow-2xl border border-sky-500/40 flex flex-col items-center gap-0.5 min-w-[180px]">
        <span className="font-semibold text-xs tracking-wide text-sky-300">{hovered.label}</span>
        {hovered.sub && <span className="text-[10px] text-zinc-300 font-medium">{hovered.sub}</span>}
      </div>
    </div>
  );
}
