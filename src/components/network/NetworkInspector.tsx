import React from 'react';
import type { LayoutNode, NetworkDevice } from '../../types/network';
import { NETWORK_TOPOLOGY } from '../../data/network/network-topology';
import { useTwinStore } from '../../store/twin-store';

interface NetworkInspectorProps {
  selectedNode: LayoutNode | null;
  onClose: () => void;
  onSelectNodeById: (id: string) => void;
}

const TYPE_DESCRIPTIONS: Record<string, { label: string; icon: string; role: string }> = {
  gateway: { label: 'Cổng ISP (Gateway)', icon: '🌐', role: 'Định tuyến Internet & cấp dịch vụ băng thông rộng từ nhà mạng VNPT' },
  router: { label: 'Bộ định tuyến (Router)', icon: '📡', role: 'Định tuyến gói tin IP và quản lý các phân đoạn mạng LAN cục bộ' },
  switch: { label: 'Bộ chuyển mạch (Switch)', icon: '🔀', role: 'Chuyển mạch gói tin nội bộ tốc độ cao giữa các máy trạm' },
  hub: { label: 'Bộ chia mạng (Hub)', icon: '🔌', role: 'Bộ phân phối đường truyền vật lý tầng 1 mở rộng mạng' },
  'access-point': { label: 'Điểm phát sóng (WAP)', icon: '📶', role: 'Phát sóng không dây WiFi cho cán bộ giáo viên và học sinh' },
  pc: { label: 'Máy tính để bàn (PC)', icon: '💻', role: 'Thiết bị đầu cuối phục vụ giảng dạy, học tập hoặc quản lý' },
  camera: { label: 'Camera an ninh (CCTV)', icon: '📷', role: 'Camera giám sát an ninh khuôn viên và lớp học' },
};

export const NetworkInspector: React.FC<NetworkInspectorProps> = ({
  selectedNode,
  onClose,
  onSelectNodeById,
}) => {
  const toggleTopologyModal = useTwinStore((s) => s.toggleTopologyModal);
  const toggleNetworkLayer = useTwinStore((s) => s.toggleNetworkLayer);
  const setViewMode = useTwinStore((s) => s.setViewMode);
  const selectNetworkDevice = useTwinStore((s) => s.selectNetworkDevice);
  const selectRoom = useTwinStore((s) => s.selectRoom);
  const selectBuilding = useTwinStore((s) => s.selectBuilding);

  if (!selectedNode) return null;

  const { device, ip } = selectedNode;
  const typeMeta = TYPE_DESCRIPTIONS[device.type] || {
    label: device.type,
    icon: '📦',
    role: 'Thiết bị phần cứng mạng',
  };

  // Find upstream and downstream connections
  const upstreamConnections: NetworkDevice[] = NETWORK_TOPOLOGY.connections
    .filter((c) => c.toDeviceId === device.id)
    .map((c) => NETWORK_TOPOLOGY.devices.find((d) => d.id === c.fromDeviceId))
    .filter((d): d is NetworkDevice => Boolean(d));

  const downstreamConnections: NetworkDevice[] = NETWORK_TOPOLOGY.connections
    .filter((c) => c.fromDeviceId === device.id)
    .map((c) => NETWORK_TOPOLOGY.devices.find((d) => d.id === c.toDeviceId))
    .filter((d): d is NetworkDevice => Boolean(d));

  // Jump to 3D and focus camera
  const handleJumpTo3D = () => {
    // 1. Close 2D view
    toggleTopologyModal(false);

    // 2. Turn on Network Layer in 3D
    toggleNetworkLayer(true);
    setViewMode('network');

    // 3. Select this network device
    selectNetworkDevice(device.id);

    // 4. Focus camera to room or building
    if (device.location.roomId) {
      selectRoom(device.location.roomId);
    } else if (device.location.buildingId && device.location.buildingId !== 'telecom') {
      selectBuilding(device.location.buildingId);
    }
  };

  return (
    <aside className="w-80 sm:w-88 max-h-[calc(100vh-8.5rem)] flex flex-col rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl overflow-hidden transition-all text-xs z-30">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-200/70 dark:border-zinc-800/70 flex items-center justify-between bg-zinc-50/90 dark:bg-zinc-950/60">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg">{typeMeta.icon}</span>
          <div className="min-w-0">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 truncate text-xs sm:text-sm">
              {device.label}
            </h3>
            <div className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
              Mã: {device.code}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          title="Đóng bảng chi tiết"
          className="w-7 h-7 rounded-lg bg-zinc-200/60 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-bold transition-all shrink-0"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Status Card */}
        <div className="p-3 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/25 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
            <span className="font-bold text-emerald-700 dark:text-emerald-400">
              Hoạt động bình thường (Online)
            </span>
          </div>
          <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-500">
            Độ trễ &lt;1ms
          </span>
        </div>

        {/* Specifications */}
        <div className="space-y-2 py-2 border-y border-zinc-200/60 dark:border-zinc-800/60">
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Thông số kỹ thuật & Vị trí
          </div>

          <div className="flex justify-between items-center text-[11px]">
            <span className="text-zinc-500">Loại thiết bị:</span>
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{typeMeta.label}</span>
          </div>

          <div className="flex justify-between items-center text-[11px]">
            <span className="text-zinc-500">Địa chỉ IP / Subnet:</span>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{ip || 'DHCP'}</span>
          </div>

          <div className="flex justify-between items-center text-[11px]">
            <span className="text-zinc-500">Tòa nhà:</span>
            <span className="font-medium text-zinc-800 dark:text-zinc-200">
              {device.location.buildingId === 'building-e'
                ? 'Dãy A (Khối 2 tầng phía Bắc)'
                : device.location.buildingId === 'building-b'
                  ? 'Dãy B (Khối Lầu 1)'
                  : device.location.buildingId === 'building-cd'
                    ? 'Dãy C·D (Phòng máy & Thư viện)'
                    : device.location.buildingId === 'building-a'
                      ? 'Dãy C (P.25 – P.44)'
                      : 'Hạ tầng viễn thông'}
            </span>
          </div>

          <div className="flex justify-between items-center text-[11px]">
            <span className="text-zinc-500">Tầng:</span>
            <span className="font-medium text-zinc-800 dark:text-zinc-200">
              {device.location.floorId.includes('floor-2') ? 'Tầng 2 (Lầu 1)' : 'Tầng 1 (Trệt)'}
            </span>
          </div>

          <div className="flex justify-between items-center text-[11px]">
            <span className="text-zinc-500">Phòng / Vị trí:</span>
            <span className="font-medium text-blue-600 dark:text-blue-400">
              {device.location.roomName || device.location.roomId || 'Hộp kỹ thuật hành lang'}
            </span>
          </div>

          {device.metadata?.ports && (
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-zinc-500">Số cổng RJ45 (Ports):</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {device.metadata.ports} Ports 1Gbps
              </span>
            </div>
          )}

          {device.metadata?.pcCount && (
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-zinc-500">Dàn máy tính kết nối:</span>
              <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                {device.metadata.pcCount} máy trạm học sinh
              </span>
            </div>
          )}
        </div>

        {/* Function Role & Notes */}
        <div className="p-2.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/60 space-y-1">
          <div className="font-semibold text-zinc-800 dark:text-zinc-200 text-[11px]">
            Chức năng hệ thống:
          </div>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
            {device.metadata?.notes || typeMeta.role}
          </p>
        </div>

        {/* Connections */}
        <div className="space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Liên kết thiết bị trực tiếp
          </div>

          {upstreamConnections.length > 0 && (
            <div>
              <div className="text-[10px] font-medium text-zinc-500 mb-1">
                ▲ Thiết bị cấp trên (Upstream):
              </div>
              <div className="space-y-1">
                {upstreamConnections.map((up) => (
                  <button
                    key={up.id}
                    onClick={() => onSelectNodeById(up.id)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-zinc-200/60 dark:border-zinc-700 flex items-center justify-between text-[11px] transition-all group"
                  >
                    <span className="truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 font-medium">
                      {up.label}
                    </span>
                    <span className="font-mono text-[9px] text-zinc-400 shrink-0">
                      {up.code}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {downstreamConnections.length > 0 && (
            <div>
              <div className="text-[10px] font-medium text-zinc-500 mb-1">
                ▼ Thiết bị cấp dưới (Downstream):
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                {downstreamConnections.map((down) => (
                  <button
                    key={down.id}
                    onClick={() => onSelectNodeById(down.id)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-zinc-200/60 dark:border-zinc-700 flex items-center justify-between text-[11px] transition-all group"
                  >
                    <span className="truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 font-medium">
                      {down.label}
                    </span>
                    <span className="font-mono text-[9px] text-zinc-400 shrink-0">
                      {down.code}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Provenance */}
        <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-400">
          <span>Minh chứng sơ đồ:</span>
          <span className="font-mono text-zinc-600 dark:text-zinc-300">
            sodomang.jpg (Khớp 100%)
          </span>
        </div>
      </div>

      {/* Footer Action: JUMP TO 3D */}
      <div className="p-3 border-t border-zinc-200/70 dark:border-zinc-800/70 bg-zinc-50/90 dark:bg-zinc-950/60">
        <button
          onClick={handleJumpTo3D}
          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all"
        >
          <span>🚀</span>
          <span>Xem vị trí trong không gian 3D</span>
        </button>
      </div>
    </aside>
  );
};
