import { useTwinStore } from '../../store/twin-store';
import { getSceneIndex } from '../../lib/3d/scene';

export function Header() {
  const school = getSceneIndex().school;
  const lighting = useTwinStore((s) => s.lighting);
  const setLighting = useTwinStore((s) => s.setLighting);
  const toggleShortcuts = useTwinStore((s) => s.toggleShortcuts);
  const networkLayerVisible = useTwinStore((s) => s.networkLayerVisible);
  const toggleNetworkLayer = useTwinStore((s) => s.toggleNetworkLayer);
  const toggleSearchModal = useTwinStore((s) => s.toggleSearchModal);
  const showTopologyModal = useTwinStore((s) => s.showTopologyModal);
  const toggleTopologyModal = useTwinStore((s) => s.toggleTopologyModal);

  return (
    <header className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 z-20 flex items-center justify-between pointer-events-none gap-2">
      {/* Brand title */}
      <div className="pointer-events-auto flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-xs transition-all shrink-0">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
        <div className="min-w-0">
          <h1 className="text-xs sm:text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 sm:gap-2">
            <span className="truncate max-w-[130px] sm:max-w-none">{school.name}</span>
            <span className="text-[9px] sm:text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 shrink-0">
              LIVE 3D
            </span>
          </h1>
          <p className="text-[10px] sm:text-[11px] font-medium text-zinc-500 dark:text-zinc-400 tracking-wide uppercase truncate max-w-[120px] sm:max-w-none">
            {school.subtitle}
          </p>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="pointer-events-auto flex items-center gap-1 sm:gap-1.5 p-1 rounded-xl bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-xs overflow-x-auto max-w-[70vw] sm:max-w-none">
        {/* Quick Search Button */}
        <button
          onClick={() => toggleSearchModal(true)}
          title="Tìm kiếm nhanh phòng, thiết bị, dãy nhà (Ctrl+K)"
          className="px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-xl text-zinc-700 dark:text-zinc-200 bg-zinc-100/90 dark:bg-zinc-800/90 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all flex items-center gap-1.5 shrink-0 shadow-xs"
        >
          <span>🔍</span>
          <span className="hidden sm:inline">Tìm kiếm</span>
          <kbd className="hidden md:inline text-[9px] font-mono px-1 py-0.5 rounded bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-500">
            Ctrl+K
          </kbd>
        </button>

        {/* Nút MẠNG WIFI TO RÕ NỔI BẬT */}
        <button
          onClick={() => toggleNetworkLayer()}
          title="Bật/Tắt hiển thị hạ tầng Mạng & Thiết bị WiFi 3D"
          className={`px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 shrink-0 shadow-sm border ${
            networkLayerVisible
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-blue-400 ring-2 ring-blue-400/40 shadow-blue-500/25'
              : 'bg-zinc-100/90 dark:bg-zinc-800/90 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
        >
          <span className="text-base sm:text-lg">📶</span>
          <span className="tracking-wide">Mạng WiFi 3D</span>
          <span
            className={`w-2 h-2 rounded-full transition-all ${
              networkLayerVisible ? 'bg-cyan-300 shadow-[0_0_8px_#22d3ee] animate-pulse' : 'bg-zinc-400'
            }`}
          />
        </button>

        {/* Nút SƠ ĐỒ MẠNG 2D MỚI */}
        <button
          onClick={() => toggleTopologyModal(true)}
          title="Mở Sơ đồ mạng 2D trực quan chuyên nghiệp (Network Topology)"
          className={`px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 flex items-center gap-2 shrink-0 shadow-sm border ${
            showTopologyModal
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 ring-2 ring-blue-400/40 shadow-blue-500/25'
              : 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-zinc-800 dark:to-zinc-850 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-zinc-700 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-zinc-750 dark:hover:to-zinc-750 hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          <span className="text-base sm:text-lg group-hover:rotate-12 transition-transform">🌐</span>
          <span className="tracking-wide">Sơ đồ mạng 2D</span>
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white dark:bg-blue-500 shadow-xs">
            2D
          </span>
        </button>

        {/* Day / Night / Evening toggle */}
        <button
          onClick={() => setLighting(lighting === 'day' ? 'night' : lighting === 'night' ? 'evening' : 'day')}
          title="Chuyển đổi chế độ Ngày / Ban Đêm / Hoàng hôn"
          className={`px-2.5 sm:px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 shrink-0 ${
            lighting === 'night'
              ? 'bg-indigo-600 text-white shadow-xs font-semibold'
              : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          <span>{lighting === 'day' ? '☀️ Ngày' : lighting === 'night' ? '🌙 Đêm' : '🌅 Chiều'}</span>
        </button>

        {/* Shortcuts toggle */}
        <button
          onClick={() => toggleShortcuts()}
          title="Phím tắt điều khiển"
          className="hidden sm:flex px-2 sm:px-2.5 py-1.5 text-xs font-mono font-medium rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shrink-0"
        >
          ⌘ / ?
        </button>
      </div>
    </header>
  );
}
