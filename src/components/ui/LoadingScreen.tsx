import { useTwinStore } from '../../store/twin-store';

export function LoadingScreen() {
  const loadStage = useTwinStore((s) => s.loadStage);

  if (loadStage === 'ready') return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#eef0f2] dark:bg-zinc-950 transition-opacity duration-500">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm px-6">
        <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        <div>
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
            THPT SỐ 1 TƯ NGHĨA
          </h2>
          <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider font-mono">
            Đang khởi tạo 3D Digital Twin...
          </p>
        </div>
      </div>
    </div>
  );
}
