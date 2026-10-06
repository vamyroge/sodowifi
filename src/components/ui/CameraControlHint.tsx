import { useEffect, useState } from 'react';

export function CameraControlHint() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Dismiss after 7 seconds automatically, or on first user pointer/wheel interaction
    const timer = setTimeout(() => {
      setVisible(false);
    }, 7000);

    const handleInteraction = () => {
      setVisible(false);
    };

    window.addEventListener('pointerdown', handleInteraction, { once: true });
    window.addEventListener('wheel', handleInteraction, { once: true });
    window.addEventListener('keydown', handleInteraction, { once: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('pointerdown', handleInteraction);
      window.removeEventListener('wheel', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 pointer-events-none z-30 transition-all duration-500 animate-in fade-in slide-in-from-top-3">
      <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-zinc-950/85 text-white backdrop-blur-md border border-white/10 shadow-2xl text-[11px] font-medium tracking-wide">
        <div className="flex items-center gap-1 text-cyan-300">
          <span className="text-sm">🖱️</span>
          <span>Kéo để xoay</span>
        </div>
        <span className="text-zinc-600">•</span>
        <div className="flex items-center gap-1 text-zinc-300">
          <span className="text-sm">⚙️</span>
          <span>Cuộn để zoom</span>
        </div>
        <span className="text-zinc-600">•</span>
        <div className="flex items-center gap-1 text-emerald-400">
          <span className="text-sm">🎯</span>
          <span>Click công trình để lấy nét</span>
        </div>
      </div>
    </div>
  );
}
