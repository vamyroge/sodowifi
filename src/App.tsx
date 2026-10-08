import { useEffect } from 'react';
import { Viewport3D } from './components/3d/Viewport3D';
import { Header } from './components/ui/Header';
import { NavigationPanel } from './components/ui/NavigationPanel';
import { ContextInspector } from './components/ui/ContextInspector';
import { FloorController } from './components/ui/FloorController';
import { ViewModeSelector } from './components/ui/ViewModeSelector';
import { CameraControlHint } from './components/ui/CameraControlHint';
import { HoverTooltip } from './components/ui/HoverTooltip';
import { ShortcutsModal } from './components/ui/ShortcutsModal';
import { QuickSearchModal } from './components/ui/QuickSearchModal';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { Network2DView } from './components/network/Network2DView';
import { useTwinStore } from './store/twin-store';

export function App() {
  const uiHidden = useTwinStore((s) => s.uiHidden);
  const toggleUi = useTwinStore((s) => s.toggleUi);
  const clearSelection = useTwinStore((s) => s.clearSelection);
  const resetCamera = useTwinStore((s) => s.resetCamera);
  const focusSelected = useTwinStore((s) => s.focusSelected);
  const toggleExplode = useTwinStore((s) => s.toggleExplode);
  const setFloorFilter = useTwinStore((s) => s.setFloorFilter);
  const toggleShortcuts = useTwinStore((s) => s.toggleShortcuts);
  const toggleSearchModal = useTwinStore((s) => s.toggleSearchModal);
  const toggleTopologyModal = useTwinStore((s) => s.toggleTopologyModal);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Shortcut Ctrl+K / Cmd+K or slash to trigger search modal
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleSearchModal();
        return;
      }

      // Ignore when typing in input/textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key === '/') {
        e.preventDefault();
        toggleSearchModal();
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'r':
          resetCamera();
          break;
        case 'f':
          focusSelected();
          break;
        case 'e':
          toggleExplode();
          break;
        case 'h':
          toggleUi();
          break;
        case '1':
          setFloorFilter(0);
          break;
        case '2':
          setFloorFilter(1);
          break;
        case '3':
          setFloorFilter(2);
          break;
        case '0':
        case 'a':
          setFloorFilter('all');
          break;
        case 'escape':
          clearSelection();
          break;
        case 'm':
          toggleTopologyModal();
          break;
        case '?':
          toggleShortcuts();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetCamera, focusSelected, toggleExplode, toggleUi, setFloorFilter, clearSelection, toggleShortcuts, toggleSearchModal, toggleTopologyModal]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#eef0f2] dark:bg-zinc-950 font-sans antialiased">
      {/* 3D Viewport Layer */}
      <Viewport3D />

      {/* UI Overlay Layer */}
      {!uiHidden && (
        <>
          <Header />

          {/* Left Navigation Panel */}
          <aside className="absolute left-4 top-20 z-10 pointer-events-auto transition-all hidden md:block">
            <NavigationPanel />
          </aside>

          {/* Right Context Inspector */}
          <aside className="absolute right-4 top-20 z-10 pointer-events-auto transition-all hidden md:block">
            <ContextInspector />
          </aside>

          {/* Bottom Floating Toolbar: Floor Controller & View Mode */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex flex-wrap justify-center items-center gap-3 max-w-[95vw]">
            <FloorController />
            <ViewModeSelector />
          </div>

          <CameraControlHint />
          <HoverTooltip />
          <ShortcutsModal />
          <QuickSearchModal />
        </>
      )}

      {/* Zen mode toggle button if UI is hidden */}
      {uiHidden && (
        <button
          onClick={toggleUi}
          className="absolute top-4 right-4 z-30 px-3 py-1.5 rounded-xl bg-zinc-900/80 text-white text-xs backdrop-blur-md hover:bg-zinc-900 transition-all font-medium"
        >
          Hiện giao diện (H)
        </button>
      )}

      {/* Dedicated 2D Network Topology View */}
      <Network2DView />

      {/* Initial Loading Screen */}
      <LoadingScreen />

      {/* Subtle watermark in bottom-right corner */}
      <div className="fixed bottom-2.5 right-4 z-20 pointer-events-none select-none text-[11px] font-mono tracking-wider text-zinc-500/50 dark:text-zinc-400/40 uppercase">
        Design by Triều
      </div>
    </div>
  );
}

export default App;
