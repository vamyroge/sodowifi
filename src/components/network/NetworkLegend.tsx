import React from 'react';

interface NetworkLegendProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NetworkLegend: React.FC<NetworkLegendProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-5 text-xs space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-200/80 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="text-lg">ℹ️</span>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
              Chú giải Ký hiệu Sơ đồ mạng (Legend)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-500 font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Device Types */}
        <div className="space-y-2">
          <div className="font-bold uppercase tracking-wider text-[10px] text-zinc-400">
            Các loại thiết bị mạng (Hardware Devices)
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center gap-2">
              <span className="text-base">🌐</span>
              <div>
                <div className="font-bold text-orange-700 dark:text-orange-400">ISP Gateway</div>
                <div className="text-[10px] text-zinc-500">Cổng quang nhà mạng VNPT</div>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center gap-2">
              <span className="text-base">📡</span>
              <div>
                <div className="font-bold text-sky-700 dark:text-sky-400">Router</div>
                <div className="text-[10px] text-zinc-500">Bộ định tuyến mạng LAN</div>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
              <span className="text-base">🔀</span>
              <div>
                <div className="font-bold text-emerald-700 dark:text-emerald-400">Switch</div>
                <div className="text-[10px] text-zinc-500">Bộ chuyển mạch đa cổng</div>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-2">
              <span className="text-base">🔌</span>
              <div>
                <div className="font-bold text-green-700 dark:text-green-400">Hub</div>
                <div className="text-[10px] text-zinc-500">Bộ chia tín hiệu mạng</div>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-2">
              <span className="text-base">📶</span>
              <div>
                <div className="font-bold text-purple-700 dark:text-purple-400">WAP (Access Point)</div>
                <div className="text-[10px] text-zinc-500">Điểm phát sóng WiFi</div>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-slate-500/10 border border-slate-500/20 flex items-center gap-2">
              <span className="text-base">💻</span>
              <div>
                <div className="font-bold text-slate-700 dark:text-slate-300">Máy tính (PC)</div>
                <div className="text-[10px] text-zinc-500">Máy giáo viên / Phòng máy</div>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center gap-2">
              <span className="text-base">📷</span>
              <div>
                <div className="font-bold text-cyan-700 dark:text-cyan-400">Camera quan sát</div>
                <div className="text-[10px] text-zinc-500">Camera an ninh lớp học</div>
              </div>
            </div>
          </div>
        </div>

        {/* Cable Types */}
        <div className="space-y-2 pt-2 border-t border-zinc-200/80 dark:border-zinc-800">
          <div className="font-bold uppercase tracking-wider text-[10px] text-zinc-400">
            Môi trường truyền dẫn (Cables & Links)
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
              <div className="flex items-center gap-2">
                <span className="w-4 h-1 rounded-full bg-orange-500 shadow-xs" />
                <span>Cáp quang Internet FTTH (VNPT)</span>
              </div>
              <span className="font-mono text-[10px] text-zinc-400">1 Gbps High-Speed</span>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
              <div className="flex items-center gap-2">
                <span className="w-4 h-1 rounded-full bg-sky-500 shadow-xs" />
                <span>Cáp xoắn đôi UTP Cat6 (Mạng LAN)</span>
              </div>
              <span className="font-mono text-[10px] text-zinc-400">100/1000 Mbps</span>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
              <div className="flex items-center gap-2">
                <span className="w-4 h-1 rounded-full bg-purple-500 shadow-xs" />
                <span>Sóng không dây WiFi (802.11ac)</span>
              </div>
              <span className="font-mono text-[10px] text-zinc-400">Phủ sóng lớp học</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40 text-[11px] text-blue-700 dark:text-blue-300">
          💡 <strong>Mẹo thao tác:</strong> Cuộn chuột để Phóng to / Thu nhỏ; Kéo giữ chuột để Di chuyển bản đồ; Bấm đúp vào thiết bị để Căn giữa góc nhìn.
        </div>
      </div>
    </div>
  );
};
