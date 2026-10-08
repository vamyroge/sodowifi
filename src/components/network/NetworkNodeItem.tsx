import React from 'react';
import type { LayoutNode } from '../../types/network';

interface NetworkNodeItemProps {
  node: LayoutNode;
  isSelected: boolean;
  isHovered: boolean;
  isRelated: boolean;
  isSearchMatch: boolean;
  onClick: (e: React.MouseEvent) => void;
  onDoubleClick: (e: React.MouseEvent) => void;
  onMouseEnter: (e: React.MouseEvent) => void;
  onMouseLeave: () => void;
}

const TYPE_THEME = {
  gateway: {
    icon: '🌐',
    label: 'ISP Gateway',
    border: 'border-orange-500/70',
    borderSelected: 'border-orange-500 ring-4 ring-orange-500/30 shadow-orange-500/30',
    bg: 'bg-gradient-to-b from-white to-orange-50/60 dark:from-zinc-900 dark:to-orange-950/30',
    badge: 'bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30',
    headerBg: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    accent: '#ea580c',
  },
  router: {
    icon: '📡',
    label: 'Router',
    border: 'border-sky-500/60',
    borderSelected: 'border-sky-500 ring-4 ring-sky-500/30 shadow-sky-500/30',
    bg: 'bg-gradient-to-b from-white to-sky-50/60 dark:from-zinc-900 dark:to-sky-950/30',
    badge: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30',
    headerBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    accent: '#0284c7',
  },
  switch: {
    icon: '🔀',
    label: 'Switch',
    border: 'border-emerald-500/60',
    borderSelected: 'border-emerald-500 ring-4 ring-emerald-500/30 shadow-emerald-500/30',
    bg: 'bg-gradient-to-b from-white to-emerald-50/60 dark:from-zinc-900 dark:to-emerald-950/30',
    badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
    headerBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    accent: '#10b981',
  },
  hub: {
    icon: '🔌',
    label: 'Hub',
    border: 'border-green-500/60',
    borderSelected: 'border-green-500 ring-4 ring-green-500/30 shadow-green-500/30',
    bg: 'bg-gradient-to-b from-white to-green-50/60 dark:from-zinc-900 dark:to-green-950/30',
    badge: 'bg-green-500/15 text-green-700 dark:text-green-300 border-green-500/30',
    headerBg: 'bg-green-500/10 text-green-600 dark:text-green-400',
    accent: '#059669',
  },
  'access-point': {
    icon: '📶',
    label: 'WAP WiFi',
    border: 'border-purple-500/60',
    borderSelected: 'border-purple-500 ring-4 ring-purple-500/30 shadow-purple-500/30',
    bg: 'bg-gradient-to-b from-white to-purple-50/60 dark:from-zinc-900 dark:to-purple-950/30',
    badge: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
    headerBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    accent: '#9333ea',
  },
  pc: {
    icon: '💻',
    label: 'Máy tính',
    border: 'border-slate-400/50 dark:border-zinc-700',
    borderSelected: 'border-blue-500 ring-4 ring-blue-500/30 shadow-blue-500/30',
    bg: 'bg-white dark:bg-zinc-900',
    badge: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20',
    headerBg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
    accent: '#475569',
  },
  camera: {
    icon: '📷',
    label: 'Camera',
    border: 'border-cyan-500/50 dark:border-cyan-700/60',
    borderSelected: 'border-cyan-500 ring-4 ring-cyan-500/30 shadow-cyan-500/30',
    bg: 'bg-white dark:bg-zinc-900',
    badge: 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20',
    headerBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    accent: '#06b6d4',
  },
};

export const NetworkNodeItem: React.FC<NetworkNodeItemProps> = React.memo(({
  node,
  isSelected,
  isHovered,
  isRelated,
  isSearchMatch,
  onClick,
  onDoubleClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const theme = TYPE_THEME[node.device.type] || TYPE_THEME.pc;
  const isCompact = node.device.type === 'pc' || node.device.type === 'camera';

  // Node position style (centered at node.x, node.y)
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${node.x - node.width / 2}px`,
    top: `${node.y - node.height / 2}px`,
    width: `${node.width}px`,
    height: `${node.height}px`,
    zIndex: isSelected ? 30 : isSearchMatch ? 25 : isHovered ? 20 : isRelated ? 15 : 10,
  };

  const borderClass = isSelected
    ? theme.borderSelected
    : isSearchMatch
      ? 'border-amber-400 ring-4 ring-amber-400/40 shadow-lg shadow-amber-500/20 animate-pulse'
      : isHovered
        ? `${theme.border} ring-2 ring-blue-400/30 shadow-md`
        : isRelated
          ? 'border-blue-400/80 ring-2 ring-blue-400/20'
          : `${theme.border} hover:border-zinc-400 dark:hover:border-zinc-500`;

  return (
    <div
      style={style}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`group cursor-pointer select-none rounded-xl border transition-all duration-150 flex flex-col justify-between overflow-hidden shadow-xs backdrop-blur-md ${theme.bg} ${borderClass} ${
        isSelected ? 'scale-[1.03]' : isHovered ? 'scale-[1.02]' : ''
      }`}
    >
      {/* Top Header Bar */}
      <div className={`px-2 py-1 flex items-center justify-between border-b border-zinc-200/50 dark:border-zinc-800/60 ${theme.headerBg}`}>
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-xs sm:text-sm shrink-0">{theme.icon}</span>
          <span className="font-mono font-bold text-[10px] tracking-tight truncate text-zinc-800 dark:text-zinc-200">
            {node.device.code}
          </span>
        </div>

        {/* Status dot & badge */}
        <div className="flex items-center gap-1 shrink-0">
          <span
            className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981] animate-pulse"
            title="Đang hoạt động (Online)"
          />
          <span className="text-[9px] font-mono text-zinc-500 dark:text-zinc-400">
            {isCompact ? '' : '<1ms'}
          </span>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="px-2 py-1 flex-1 flex flex-col justify-center min-w-0">
        <div className="font-semibold text-[11px] leading-tight truncate text-zinc-900 dark:text-zinc-100">
          {node.device.label}
        </div>
        {!isCompact && (
          <div className="text-[9px] text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
            {node.device.location.roomName || node.device.location.roomId || 'Hạ tầng mạng'}
          </div>
        )}
      </div>

      {/* Bottom Footer Specs */}
      <div className="px-2 py-0.5 bg-zinc-50/70 dark:bg-zinc-950/40 border-t border-zinc-200/40 dark:border-zinc-800/40 flex items-center justify-between text-[9px] font-mono text-zinc-500 dark:text-zinc-400">
        <span className="truncate">{node.ip || 'DHCP'}</span>
        {node.device.metadata?.ports && (
          <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
            {node.device.metadata.ports}P
          </span>
        )}
        {node.device.metadata?.pcCount && (
          <span className="font-bold text-blue-600 dark:text-blue-400 shrink-0">
            {node.device.metadata.pcCount}PC
          </span>
        )}
      </div>
    </div>
  );
});

NetworkNodeItem.displayName = 'NetworkNodeItem';
