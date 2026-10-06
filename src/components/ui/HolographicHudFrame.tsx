import { useTwinStore } from '../../store/twin-store';

export function HolographicHudFrame() {
  const viewMode = useTwinStore((s) => s.viewMode);
  const selection = useTwinStore((s) => s.selection);

  if (viewMode !== 'transparent') return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-15 overflow-hidden select-none font-mono">
      {/* 1. Corner Framing Brackets */}
      {/* Top Left */}
      <div className="absolute top-20 left-6 flex items-start gap-2">
        <div className="w-8 h-8 border-t-2 border-l-2 border-cyan-400/60" />
        <div className="text-[10px] text-cyan-400/80 tracking-wider space-y-0.5">
          <div className="font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>SYS.MONITOR // LIVE TWIN</span>
          </div>
          <div className="text-cyan-500/70 text-[9px]">TARGET: THPT SO 1 TU NGHIA</div>
        </div>
      </div>

      {/* Top Right */}
      <div className="absolute top-20 right-6 flex items-start gap-2 flex-row-reverse text-right">
        <div className="w-8 h-8 border-t-2 border-r-2 border-cyan-400/60" />
        <div className="text-[10px] text-cyan-400/80 tracking-wider space-y-0.5">
          <div className="font-bold text-emerald-400 flex items-center justify-end gap-1.5">
            <span>SCANNER: ACTIVE</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          <div className="text-cyan-500/70 text-[9px]">GRID REF: 108.742°E 15.123°N</div>
        </div>
      </div>

      {/* Bottom Left */}
      <div className="absolute bottom-20 left-6 flex items-end gap-2">
        <div className="w-8 h-8 border-b-2 border-l-2 border-cyan-400/60" />
        <div className="text-[9px] text-cyan-500/70 tracking-widest uppercase">
          MODE: HOLOGRAM FUI TRACE // WIREFRAME V2
        </div>
      </div>

      {/* Bottom Right */}
      <div className="absolute bottom-20 right-6 flex items-end gap-2 flex-row-reverse">
        <div className="w-8 h-8 border-b-2 border-r-2 border-cyan-400/60" />
        <div className="text-[9px] text-cyan-500/70 tracking-widest text-right">
          STATUS: {selection.roomId || selection.buildingId ? 'FOCUSED LOCK' : 'WIDE RECON'}
        </div>
      </div>

      {/* Center Targeting Reticle (Subtle crosshair) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-25">
        <div className="w-6 h-6 border border-cyan-400 rounded-full flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
        </div>
      </div>
    </div>
  );
}
