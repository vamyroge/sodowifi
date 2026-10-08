import React from 'react';
import type { NetworkClusterId } from '../../types/network';

interface NetworkToolbarProps {
  currentCluster: NetworkClusterId;
  onClusterChange: (c: NetworkClusterId) => void;
  scale: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onResetView: () => void;
  showDataFlow: boolean;
  onToggleDataFlow: () => void;
  showLegend: boolean;
  onToggleLegend: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  matchCount: number;
}

export const NetworkToolbar: React.FC<NetworkToolbarProps> = ({
  currentCluster,
  onClusterChange,
  scale,
  onZoomIn,
  onZoomOut,
  onFitView,
  onResetView,
  showDataFlow,
  onToggleDataFlow,
  showLegend,
  onToggleLegend,
  searchQuery,
  onSearchChange,
  matchCount,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border-b border-zinc-200/80 dark:border-zinc-800/80 text-xs">
      {/* Cluster Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 overflow-x-auto max-w-full">
        <button
          onClick={() => onClusterChange('all')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
            currentCluster === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <span>🏢</span>
          <span>Toàn trường (Full)</span>
        </button>

        <button
          onClick={() => onClusterChange('b-cd')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
            currentCluster === 'b-cd'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <span>🏫</span>
          <span>Dãy B & C·D (Phòng máy)</span>
        </button>

        <button
          onClick={() => onClusterChange('a')}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
            currentCluster === 'a'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <span>🏛️</span>
          <span>Dãy A (P.01 – P.12)</span>
        </button>
      </div>

      {/* Center / Right: Search Bar */}
      <div className="relative flex items-center min-w-[200px] sm:min-w-[260px]">
        <span className="absolute left-3 text-zinc-400">🔍</span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Tìm thiết bị / phòng (VD: P.08, Router, Hub)..."
          className="w-full pl-8 pr-16 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        />
        {searchQuery && (
          <div className="absolute right-2 flex items-center gap-1">
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-semibold">
              {matchCount}
            </span>
            <button
              onClick={() => onSearchChange('')}
              className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-xs px-1"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Right: Zoom Controls & Toggles */}
      <div className="flex items-center gap-1.5">
        {/* Zoom In / Out / Fit / Reset */}
        <div className="flex items-center p-0.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60">
          <button
            onClick={onZoomOut}
            title="Thu nhỏ (Zoom -)"
            className="w-7 h-7 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center font-bold text-zinc-600 dark:text-zinc-300 transition-colors"
          >
            −
          </button>
          <span className="px-2 font-mono text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 min-w-[42px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={onZoomIn}
            title="Phóng to (Zoom +)"
            className="w-7 h-7 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center font-bold text-zinc-600 dark:text-zinc-300 transition-colors"
          >
            +
          </button>
          <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-700 mx-0.5" />
          <button
            onClick={onFitView}
            title="Vừa màn hình (Fit)"
            className="px-2 py-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1 transition-colors"
          >
            <span>⛶</span>
            <span className="hidden sm:inline">Vừa khung</span>
          </button>
          <button
            onClick={onResetView}
            title="Đặt lại tỉ lệ 100%"
            className="px-2 py-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1 transition-colors"
          >
            <span>↺</span>
            <span className="hidden md:inline">100%</span>
          </button>
        </div>

        {/* Data pulse flow toggle */}
        <button
          onClick={onToggleDataFlow}
          title={showDataFlow ? 'Tắt hiệu ứng xung dữ liệu' : 'Bật hiệu ứng xung dữ liệu'}
          className={`px-2.5 py-1.5 rounded-xl border font-semibold flex items-center gap-1.5 transition-all ${
            showDataFlow
              ? 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700'
          }`}
        >
          <span>⚡</span>
          <span className="hidden sm:inline">Luồng dữ liệu</span>
        </button>

        {/* Legend toggle */}
        <button
          onClick={onToggleLegend}
          title="Xem chú giải ký hiệu sơ đồ mạng"
          className={`px-2.5 py-1.5 rounded-xl border font-semibold flex items-center gap-1.5 transition-all ${
            showLegend
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700'
          }`}
        >
          <span>ℹ️</span>
          <span className="hidden sm:inline">Chú giải</span>
        </button>
      </div>
    </div>
  );
};
