import React from 'react';

interface NetworkHeaderProps {
  onBackTo3D: () => void;
  totalDevicesCount: number;
}

export const NetworkHeader: React.FC<NetworkHeaderProps> = ({
  onBackTo3D,
  totalDevicesCount,
}) => {
  const schoolName = 'THPT Số 1 Tư Nghĩa';

  return (
    <header className="px-4 py-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between gap-4 text-xs z-20">
      {/* Left: BACK TO 3D BUTTON */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBackTo3D}
          title="Quay lại mô hình không gian 3D (phím Esc)"
          className="group px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-blue-500/20 active:scale-[0.98] transition-all"
        >
          <span className="text-sm group-hover:-translate-x-1 transition-transform">◀</span>
          <span className="tracking-wide">Quay lại mô hình 3D</span>
          <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 rounded bg-black/20 text-[10px] font-mono font-medium text-white/80">
            Esc
          </kbd>
        </button>

        {/* School title */}
        <div className="min-w-0 hidden md:block">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm truncate">
              Sơ đồ mạng máy tính {schoolName}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              Khảo sát thực tế
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
            Cấu trúc mạng logic 2D (Network Topology) đồng bộ cùng Digital Twin 3D
          </p>
        </div>
      </div>

      {/* Right: Live System Status Badges */}
      <div className="flex items-center gap-2 overflow-x-auto">
        {/* Status: Online */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/25 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
          <span className="font-semibold text-emerald-700 dark:text-emerald-400 text-[11px]">
            Trực tuyến 100% ({totalDevicesCount} thiết bị)
          </span>
        </div>

        {/* Speed */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 dark:bg-blue-950/40 border border-blue-500/25 shrink-0 text-[11px] font-medium text-blue-700 dark:text-blue-400">
          <span>⚡</span>
          <span>FTTH VNPT 1Gbps</span>
        </div>

        {/* Latency */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 shrink-0 text-[11px] font-mono text-zinc-600 dark:text-zinc-300">
          <span>⏱️</span>
          <span>Ping: &lt;1ms</span>
        </div>
      </div>
    </header>
  );
};
