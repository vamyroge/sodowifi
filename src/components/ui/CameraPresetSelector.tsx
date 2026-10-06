import { useTwinStore, type CameraMode } from '../../store/twin-store';

const PRESETS: Array<{ id: CameraMode; label: string; icon: string; desc: string }> = [
  { id: 'overview', label: 'Toàn cảnh', icon: '🌐', desc: 'Bao quát toàn bộ khuôn viên trường' },
  { id: 'building', label: 'Tòa nhà', icon: '🏢', desc: 'Tiếp cận mặt đứng công trình đang chọn' },
  { id: 'floor', label: 'Ngang tầng', icon: '🚶', desc: 'Góc nhìn người đi bộ dọc hành lang' },
  { id: 'interior', label: 'Trong phòng', icon: '🚪', desc: 'Góc nhìn bên trong phòng học' },
  { id: 'top', label: 'Mặt bằng', icon: '📐', desc: 'Nhìn từ trên xuống đối chiếu sơ đồ' },
  { id: 'orbit', label: 'Orbit 360°', icon: '🔄', desc: 'Tự động quay chậm quanh công trình' },
];

export function CameraPresetSelector() {
  const cameraMode = useTwinStore((s) => s.cameraMode);
  const setCameraMode = useTwinStore((s) => s.setCameraMode);

  return (
    <div className="flex items-center gap-1 p-1.5 rounded-2xl bg-white/75 dark:bg-zinc-900/75 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-sm transition-all text-xs">
      <span className="text-[10px] font-mono font-semibold uppercase text-zinc-400 dark:text-zinc-500 px-1 hidden lg:inline">
        Góc nhìn:
      </span>
      {PRESETS.map((p) => {
        const isActive = cameraMode === p.id;
        return (
          <button
            key={p.id}
            onClick={() => setCameraMode(p.id)}
            title={p.desc}
            className={`px-2.5 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1 ${
              isActive
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            <span>{p.icon}</span>
            <span className="hidden sm:inline">{p.label}</span>
          </button>
        );
      })}
    </div>
  );
}
