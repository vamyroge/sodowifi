import { useState } from 'react';
import { useTwinStore } from '../../store/twin-store';
import { NETWORK_TOPOLOGY } from '../../data/network/network-topology';
import type { NetworkDevice, NetworkDeviceType } from '../../types/network';

const TYPE_CONFIG: Record<
  NetworkDeviceType,
  { label: string; bg: string; text: string; border: string; icon: string }
> = {
  gateway: { label: 'Cổng ISP (VNPT)', bg: 'bg-orange-500/15', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-500/30', icon: '🌐' },
  router: { label: 'Bộ định tuyến (Router)', bg: 'bg-sky-500/15', text: 'text-sky-600 dark:text-sky-400', border: 'border-sky-500/30', icon: '📡' },
  switch: { label: 'Bộ chuyển mạch (Switch)', bg: 'bg-emerald-500/15', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/30', icon: '🔀' },
  hub: { label: 'Bộ chia mạng (Hub)', bg: 'bg-green-500/15', text: 'text-green-600 dark:text-green-400', border: 'border-green-500/30', icon: '🔌' },
  'access-point': { label: 'Điểm phát sóng (WAP)', bg: 'bg-purple-500/15', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/30', icon: '📶' },
  pc: { label: 'Máy tính (PC)', bg: 'bg-slate-500/15', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-500/30', icon: '💻' },
  camera: { label: 'Camera quan sát', bg: 'bg-cyan-500/15', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-500/30', icon: '📷' },
};

export function TopologyModal() {
  const showTopologyModal = useTwinStore((s) => s.showTopologyModal);
  const toggleTopologyModal = useTwinStore((s) => s.toggleTopologyModal);
  const selectNetworkDevice = useTwinStore((s) => s.selectNetworkDevice);
  const selectRoom = useTwinStore((s) => s.selectRoom);
  const toggleNetworkLayer = useTwinStore((s) => s.toggleNetworkLayer);
  const setViewMode = useTwinStore((s) => s.setViewMode);

  const [activeTab, setActiveTab] = useState<'b-cd' | 'a'>('b-cd');
  const [selectedId, setSelectedId] = useState<string | null>('gw-vnpt-b');

  if (!showTopologyModal) return null;

  const currentDevice = selectedId
    ? NETWORK_TOPOLOGY.devices.find((d) => d.id === selectedId)
    : null;

  const handleJumpTo3D = (dev: NetworkDevice) => {
    toggleTopologyModal(false);
    toggleNetworkLayer(true);
    setViewMode('network');
    selectNetworkDevice(dev.id);
    if (dev.location.roomId) {
      selectRoom(dev.location.roomId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-2xl overflow-hidden text-xs">
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600/10 dark:bg-blue-400/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
              🌐
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                Sơ đồ mạng máy tính THPT Số 1 Tư Nghĩa
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  Dữ liệu thật từ {NETWORK_TOPOLOGY.sourceImage}
                </span>
              </h2>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Mô hình mạng logic 2D đồng bộ 100% với hạ tầng vật lý trong Digital Twin 3D
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switch between 2 VNPT domains */}
            <div className="flex p-1 rounded-xl bg-zinc-200/70 dark:bg-zinc-800 text-[11px] font-medium">
              <button
                onClick={() => {
                  setActiveTab('b-cd');
                  setSelectedId('gw-vnpt-b');
                }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'b-cd'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                Cụm Dãy B & Phòng chức năng C·D
              </button>
              <button
                onClick={() => {
                  setActiveTab('a');
                  setSelectedId('gw-vnpt-a');
                }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'a'
                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs font-semibold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                Cụm Dãy A (12 phòng P.01 – P.12)
              </button>
            </div>

            <button
              onClick={() => toggleTopologyModal(false)}
              className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-500 dark:text-zinc-300 font-bold transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* MODAL MAIN CONTENT */}
        <div className="flex-1 flex overflow-hidden">
          {/* TOPOLOGY GRAPH CANVAS */}
          <div className="flex-1 p-6 overflow-y-auto bg-zinc-50/50 dark:bg-zinc-950/20 space-y-6">
            {/* 1. CLUSTER: DÃY B & DÃY C·D */}
            {activeTab === 'b-cd' && (
              <div className="space-y-6">
                {/* Gateway Root */}
                <div className="flex flex-col items-center">
                  <div
                    onClick={() => setSelectedId('gw-vnpt-b')}
                    className={`cursor-pointer px-4 py-2.5 rounded-2xl border-2 flex items-center gap-2.5 transition-all shadow-sm ${
                      selectedId === 'gw-vnpt-b'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 ring-4 ring-orange-500/20 scale-105'
                        : 'border-orange-400/40 bg-white dark:bg-zinc-800 hover:border-orange-400'
                    }`}
                  >
                    <span className="text-xl">🌐</span>
                    <div>
                      <div className="font-bold text-zinc-900 dark:text-zinc-100">Cổng ISP VNPT (Dãy B)</div>
                      <div className="text-[10px] text-zinc-500 font-mono">Gateway Dãy B · Tầng 2 Lầu 1</div>
                    </div>
                  </div>
                  <div className="w-0.5 h-6 bg-zinc-300 dark:bg-zinc-700 my-1" />
                </div>

                {/* Subnet branches */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Left Column: Phòng học Dãy B (P19-P24) */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 space-y-4">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-700">
                      <span>Phòng học Lầu 1 Dãy B (P.19 – P.24)</span>
                      <span className="text-[10px] text-blue-600 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full font-mono">
                        3 Routers · 6 Lớp
                      </span>
                    </div>

                    <div className="space-y-3">
                      {[
                        { rid: 'r-b-p19-p20', rooms: ['19', '20'] },
                        { rid: 'r-b-p21-p22', rooms: ['21', '22'] },
                        { rid: 'r-b-p23-p24', rooms: ['23', '24'] },
                      ].map(({ rid, rooms }) => {
                        const rDev = NETWORK_TOPOLOGY.devices.find((d) => d.id === rid)!;
                        return (
                          <div
                            key={rid}
                            onClick={() => setSelectedId(rid)}
                            className={`cursor-pointer p-3 rounded-xl border transition-all ${
                              selectedId === rid
                                ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 ring-2 ring-sky-500/20'
                                : 'border-zinc-200 dark:border-zinc-700 hover:border-sky-400 bg-zinc-50/50 dark:bg-zinc-800/40'
                            }`}
                          >
                            <div className="flex items-center justify-between font-semibold text-sky-700 dark:text-sky-300">
                              <span className="flex items-center gap-1.5">📡 {rDev.label}</span>
                              <span className="text-[10px] font-mono text-zinc-400">{rDev.code}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              {rooms.map((no) => (
                                <div
                                  key={no}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedId(`pc-p${no}`);
                                  }}
                                  className="p-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-750 flex items-center justify-between text-[10px]"
                                >
                                  <span className="font-medium text-zinc-700 dark:text-zinc-300">P.{no}</span>
                                  <span className="text-zinc-400 font-mono">1 PC + 1 Cam</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Cụm chức năng Dãy C·D (PM1, PM2, Thư viện, TH Lý) */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 space-y-4">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-700">
                      <span>Cụm chức năng Dãy C·D (Qua Hub 1)</span>
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full font-mono">
                        Liên tòa Dãy B ➔ C·D
                      </span>
                    </div>

                    {/* Hub 1 Node */}
                    <div
                      onClick={() => setSelectedId('hub-1')}
                      className={`cursor-pointer p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                        selectedId === 'hub-1'
                          ? 'border-green-500 bg-green-50 dark:bg-green-950/40 ring-2 ring-green-500/20'
                          : 'border-zinc-200 dark:border-zinc-700 hover:border-green-400 bg-zinc-50/50 dark:bg-zinc-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-semibold text-green-700 dark:text-green-300">
                        <span>🔌 Hub 1 (Core Hub Dãy B ➔ C·D)</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono">HUB-01 · 8 Ports</span>
                    </div>

                    <div className="space-y-3">
                      {/* PM1 */}
                      <div
                        onClick={() => setSelectedId('r-cd-pm1')}
                        className={`cursor-pointer p-3 rounded-xl border transition-all ${
                          selectedId === 'r-cd-pm1' || selectedId === 'pc-pm1-cluster'
                            ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 ring-2 ring-sky-500/20'
                            : 'border-zinc-200 dark:border-zinc-700 hover:border-sky-400 bg-zinc-50/50 dark:bg-zinc-800/40'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold text-zinc-800 dark:text-zinc-200">
                          <span>📡 Phòng Máy 1 (P. Vi tính I - Lầu 1)</span>
                          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                            37 Máy tính
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-500 mt-1">
                          Router VNPT ➔ 3 Switches (SW-1, SW-2, SW-3) ➔ 37 PC học sinh
                        </div>
                      </div>

                      {/* PM2 */}
                      <div
                        onClick={() => setSelectedId('r-cd-pm2')}
                        className={`cursor-pointer p-3 rounded-xl border transition-all ${
                          selectedId === 'r-cd-pm2' || selectedId === 'pc-pm2-cluster'
                            ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 ring-2 ring-sky-500/20'
                            : 'border-zinc-200 dark:border-zinc-700 hover:border-sky-400 bg-zinc-50/50 dark:bg-zinc-800/40'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold text-zinc-800 dark:text-zinc-200">
                          <span>📡 Phòng Máy 2 (P. Vi tính II - Lầu 1)</span>
                          <span className="text-[10px] text-blue-600 font-bold bg-blue-100 dark:bg-blue-950/60 px-2 py-0.5 rounded-full">
                            Hệ thống PC PM2
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-500 mt-1">
                          Router VNPT ➔ 3 Switches (SW-1, SW-2, SW-3) ➔ Dàn máy tính PM2
                        </div>
                      </div>

                      {/* Thư viện & TH Lý */}
                      <div className="grid grid-cols-2 gap-2">
                        <div
                          onClick={() => setSelectedId('pc-thu-vien')}
                          className={`cursor-pointer p-2 rounded-xl border transition-all ${
                            selectedId === 'pc-thu-vien'
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40'
                              : 'border-zinc-200 dark:border-zinc-700 hover:border-blue-400'
                          }`}
                        >
                          <div className="font-semibold text-zinc-800 dark:text-zinc-200">💻 Thư viện</div>
                          <div className="text-[10px] text-zinc-400">Lầu 1 Dãy C·D (1 PC)</div>
                        </div>

                        <div
                          onClick={() => setSelectedId('pc-th-ly')}
                          className={`cursor-pointer p-2 rounded-xl border transition-all ${
                            selectedId === 'pc-th-ly'
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40'
                              : 'border-zinc-200 dark:border-zinc-700 hover:border-blue-400'
                          }`}
                        >
                          <div className="font-semibold text-zinc-800 dark:text-zinc-200">💻 TH Vật lí</div>
                          <div className="text-[10px] text-zinc-400">Trệt Tầng 1 Dãy C·D (1 PC)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. CLUSTER: DÃY A */}
            {activeTab === 'a' && (
              <div className="space-y-6">
                {/* Gateway Root */}
                <div className="flex flex-col items-center">
                  <div
                    onClick={() => setSelectedId('gw-vnpt-a')}
                    className={`cursor-pointer px-4 py-2.5 rounded-2xl border-2 flex items-center gap-2.5 transition-all shadow-sm ${
                      selectedId === 'gw-vnpt-a'
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 ring-4 ring-orange-500/20 scale-105'
                        : 'border-orange-400/40 bg-white dark:bg-zinc-800 hover:border-orange-400'
                    }`}
                  >
                    <span className="text-xl">🌐</span>
                    <div>
                      <div className="font-bold text-zinc-900 dark:text-zinc-100">Cổng ISP VNPT (Dãy A)</div>
                      <div className="text-[10px] text-zinc-500 font-mono">Gateway Dãy A · 12 Phòng học</div>
                    </div>
                  </div>
                  <div className="w-0.5 h-6 bg-zinc-300 dark:bg-zinc-700 my-1" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Left Column: Tầng 2 Lầu 1 */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 space-y-4">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-700">
                      <span>Tầng 2 (Lầu 1) — P.07 đến P.12</span>
                      <span className="text-[10px] text-purple-600 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-full font-mono">
                        Hub 2 + Hub 3 + WAP WiFi
                      </span>
                    </div>

                    <div className="space-y-3">
                      {/* Hub 2 Branch */}
                      <div
                        onClick={() => setSelectedId('hub-2')}
                        className={`cursor-pointer p-3 rounded-xl border transition-all ${
                          selectedId === 'hub-2' || selectedId === 'wap-a-t2'
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 ring-2 ring-purple-500/20'
                            : 'border-zinc-200 dark:border-zinc-700 hover:border-purple-400 bg-zinc-50/50 dark:bg-zinc-800/40'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold text-purple-700 dark:text-purple-300">
                          <span>🔌 Hub 2 (Dãy A – Lầu 1)</span>
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedId('wap-a-t2');
                            }}
                            className="text-[10px] bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-bold cursor-pointer hover:underline"
                          >
                            📶 WAP WiFi
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 mt-2">
                          {['07', '08', '09'].map((no) => (
                            <div
                              key={no}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedId(`pc-p${no}`);
                              }}
                              className="p-1 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-750 text-center text-[10px]"
                            >
                              <div className="font-semibold text-zinc-700 dark:text-zinc-300">P.{no}</div>
                              <div className="text-[9px] text-zinc-400 font-mono">PC + Cam</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Hub 3 Branch */}
                      <div
                        onClick={() => setSelectedId('hub-3')}
                        className={`cursor-pointer p-3 rounded-xl border transition-all ${
                          selectedId === 'hub-3' || selectedId === 'r-a-t2'
                            ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 ring-2 ring-sky-500/20'
                            : 'border-zinc-200 dark:border-zinc-700 hover:border-sky-400 bg-zinc-50/50 dark:bg-zinc-800/40'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold text-sky-700 dark:text-sky-300">
                          <span>🔌 Hub 3 (Dãy A – Lầu 1)</span>
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedId('r-a-t2');
                            }}
                            className="text-[10px] bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 px-2 py-0.5 rounded-full font-bold cursor-pointer hover:underline"
                          >
                            📡 Router VNPT
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 mt-2">
                          {['10', '11', '12'].map((no) => (
                            <div
                              key={no}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedId(`pc-p${no}`);
                              }}
                              className="p-1 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-750 text-center text-[10px]"
                            >
                              <div className="font-semibold text-zinc-700 dark:text-zinc-300">P.{no}</div>
                              <div className="text-[9px] text-zinc-400 font-mono">PC + Cam</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Tầng 1 Trệt */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 space-y-4">
                    <div className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-700">
                      <span>Tầng 1 (Trệt) — P.01 đến P.06</span>
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full font-mono">
                        Trục cáp xuyên sàn ➔ Hub 5 ➔ Hub 4
                      </span>
                    </div>

                    <div className="space-y-3">
                      {/* Hub 5 */}
                      <div
                        onClick={() => setSelectedId('hub-5')}
                        className={`cursor-pointer p-3 rounded-xl border transition-all ${
                          selectedId === 'hub-5'
                            ? 'border-green-500 bg-green-50 dark:bg-green-950/40 ring-2 ring-green-500/20'
                            : 'border-zinc-200 dark:border-zinc-700 hover:border-green-400 bg-zinc-50/50 dark:bg-zinc-800/40'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold text-green-700 dark:text-green-300">
                          <span>🔌 Hub 5 (Dãy A – Trệt)</span>
                          <span className="text-[10px] text-zinc-400 font-mono">Nhận cáp từ VNPT</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {['01', '02'].map((no) => (
                            <div
                              key={no}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedId(`pc-p${no}`);
                              }}
                              className="p-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-750 text-center text-[10px]"
                            >
                              <div className="font-semibold text-zinc-700 dark:text-zinc-300">P.{no}</div>
                              <div className="text-[9px] text-zinc-400 font-mono">PC + Cam</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Hub 4 (Cascaded from Hub 5) */}
                      <div
                        onClick={() => setSelectedId('hub-4')}
                        className={`cursor-pointer p-3 rounded-xl border transition-all ${
                          selectedId === 'hub-4'
                            ? 'border-green-500 bg-green-50 dark:bg-green-950/40 ring-2 ring-green-500/20'
                            : 'border-zinc-200 dark:border-zinc-700 hover:border-green-400 bg-zinc-50/50 dark:bg-zinc-800/40'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold text-green-700 dark:text-green-300">
                          <span>🔌 Hub 4 (Dãy A – Trệt, Nối từ Hub 5)</span>
                          <span className="text-[10px] text-zinc-400 font-mono">Cascade</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1 mt-2">
                          {['03', '04', '05', '06'].map((no) => (
                            <div
                              key={no}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedId(`pc-p${no}`);
                              }}
                              className="p-1 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-750 text-center text-[10px]"
                            >
                              <div className="font-semibold text-zinc-700 dark:text-zinc-300">P.{no}</div>
                              <div className="text-[9px] text-zinc-400 font-mono">PC + Cam</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* INSPECTOR PANEL FOR SELECTED NODE IN TOPOLOGY */}
          <div className="w-80 border-l border-zinc-200/80 dark:border-zinc-800 p-5 bg-white dark:bg-zinc-900 flex flex-col justify-between overflow-y-auto">
            {currentDevice ? (
              <div className="space-y-4">
                <div>
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold uppercase tracking-wider text-[10px] border mb-2 ${
                      TYPE_CONFIG[currentDevice.type].bg
                    } ${TYPE_CONFIG[currentDevice.type].text} ${TYPE_CONFIG[currentDevice.type].border}`}
                  >
                    <span>{TYPE_CONFIG[currentDevice.type].icon}</span>
                    <span>{TYPE_CONFIG[currentDevice.type].label}</span>
                  </div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    {currentDevice.label}
                  </h3>
                  <div className="font-mono text-[11px] text-zinc-500 mt-0.5">
                    Mã thiết bị: {currentDevice.code}
                  </div>
                </div>

                <div className="space-y-2 py-3 border-y border-zinc-200/60 dark:border-zinc-800 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Tòa nhà:</span>
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">
                      {currentDevice.location.buildingId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Vị trí phòng:</span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      {currentDevice.location.roomId || 'Hành lang / Hộp kỹ thuật'}
                    </span>
                  </div>
                  {currentDevice.metadata?.ports && (
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Cổng kết nối:</span>
                      <span className="font-medium text-zinc-800 dark:text-zinc-200">
                        {currentDevice.metadata.ports} ports
                      </span>
                    </div>
                  )}
                  {currentDevice.metadata?.pcCount && (
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Số lượng máy:</span>
                      <span className="font-medium text-zinc-800 dark:text-zinc-200">
                        {currentDevice.metadata.pcCount} máy trạm
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Liên kết trực tiếp:</span>
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">
                      {currentDevice.connectedDeviceIds.length} thiết bị
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Nguồn dữ liệu:</span>
                    <span className="font-mono text-[10px] text-zinc-500">
                      {currentDevice.provenance.sourceReferences[0]?.image}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Độ tin cậy:</span>
                    <span className="font-semibold text-emerald-600 capitalize">
                      {currentDevice.provenance.confidence} (100% khớp)
                    </span>
                  </div>
                </div>

                {currentDevice.metadata?.notes && (
                  <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[11px] leading-relaxed">
                    <strong>Ghi chú kỹ thuật:</strong> {currentDevice.metadata.notes}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-zinc-400 py-12">
                Bấm vào một thiết bị trên sơ đồ để xem thông tin kỹ thuật
              </div>
            )}

            {currentDevice && (
              <button
                onClick={() => handleJumpTo3D(currentDevice)}
                className="w-full mt-4 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span>🚀</span>
                <span>Xem vị trí thiết bị trong không gian 3D</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
