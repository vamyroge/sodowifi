import { useTwinStore } from '../../store/twin-store';

export function ShortcutsModal() {
  const showShortcuts = useTwinStore((s) => s.showShortcuts);
  const toggleShortcuts = useTwinStore((s) => s.toggleShortcuts);

  if (!showShortcuts) return null;

  const SHORTCUTS = [
    { key: 'Ctrl + K / /', desc: 'Tìm kiếm nhanh phòng, thiết bị, dãy nhà' },
    { key: 'R', desc: 'Đặt lại góc nhìn toàn cảnh (Reset camera)' },
    { key: 'F', desc: 'Phóng to đối tượng đang chọn (Focus)' },
    { key: 'E', desc: 'Bật / tắt chế độ tách tầng (Explode)' },
    { key: '1 / 2 / 3', desc: 'Chọn nhanh tầng 1, tầng 2 hoặc tầng 3' },
    { key: '0 / A', desc: 'Hiển thị tất cả các tầng' },
    { key: 'H', desc: 'Ẩn / hiện giao diện điều khiển (Zen mode)' },
    { key: 'Esc', desc: 'Bỏ chọn đối tượng đang chọn' },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
      onClick={() => toggleShortcuts(false)}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">Phím tắt thao tác nhanh</h3>
          <button
            onClick={() => toggleShortcuts(false)}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-xs"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2 text-xs">
          {SHORTCUTS.map((s) => (
            <div key={s.key} className="flex items-center justify-between py-1">
              <span className="text-zinc-500 dark:text-zinc-400">{s.desc}</span>
              <kbd className="px-2 py-0.5 rounded font-mono text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
