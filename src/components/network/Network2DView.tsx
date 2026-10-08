import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useTwinStore } from '../../store/twin-store';
import type { NetworkClusterId } from '../../types/network';
import { buildTopologyLayout } from '../../lib/network/network-2d-layout';
import { buildTopDownLayout } from '../../lib/network/network-topdown-layout';
import { NetworkHeader } from './NetworkHeader';
import { NetworkToolbar } from './NetworkToolbar';
import { NetworkCanvas } from './NetworkCanvas';
import { NetworkTopDownCanvas } from './NetworkTopDownCanvas';
import { NetworkInspector } from './NetworkInspector';
import { NetworkLegend } from './NetworkLegend';

export const Network2DView: React.FC = () => {
  const showTopologyModal = useTwinStore((s) => s.showTopologyModal);
  const toggleTopologyModal = useTwinStore((s) => s.toggleTopologyModal);
  const selection = useTwinStore((s) => s.selection);

  // Default to 'topdown' as requested by user ("vẽ sơ đồ mạng theo góc nhìn từ trên xuống dựa theo khung sodotruong.jpg")
  const [mapMode, setMapMode] = useState<'topdown' | 'hierarchy'>('topdown');
  const [currentCluster, setCurrentCluster] = useState<NetworkClusterId>('all');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [scale, setScale] = useState(0.85);
  const [pan, setPan] = useState({ x: 40, y: 30 });
  const [showDataFlow, setShowDataFlow] = useState(true);
  const [showLegend, setShowLegend] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Top-down blueprint layers
  const [showBlueprintImage, setShowBlueprintImage] = useState(true);
  const [showArchitectureOverlay, setShowArchitectureOverlay] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync initial selection from store if present
  useEffect(() => {
    if (selection.networkDeviceId) {
      setSelectedNodeId(selection.networkDeviceId);
    }
  }, [selection.networkDeviceId]);

  // Top-down layout (sodotruong.jpg coordinates 1280x960)
  const topdownLayout = useMemo(() => {
    return buildTopDownLayout(currentCluster);
  }, [currentCluster]);

  // Logical hierarchy layout
  const hierarchyLayout = useMemo(() => {
    return buildTopologyLayout(currentCluster);
  }, [currentCluster]);

  // Current active layout
  const activeLayout = mapMode === 'topdown' ? topdownLayout : hierarchyLayout;

  // Fit view calculation
  const handleFitView = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    if (clientWidth === 0 || clientHeight === 0) return;

    const availableW = clientWidth;
    const availableH = Math.max(clientHeight - 110, 300);

    const bounds = activeLayout.bounds;
    const contentW = bounds.width;
    const contentH = bounds.height;

    const scaleX = (availableW - 60) / contentW;
    const scaleY = (availableH - 60) / contentH;
    const fitScale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.25), 1.5);

    const centerX = availableW / 2;
    const centerY = availableH / 2;
    const contentCenterX = (bounds.minX + bounds.maxX) / 2;
    const contentCenterY = (bounds.minY + bounds.maxY) / 2;

    const fitPanX = centerX - contentCenterX * fitScale;
    const fitPanY = centerY - contentCenterY * fitScale;

    setScale(fitScale);
    setPan({ x: fitPanX, y: fitPanY });
  }, [activeLayout]);

  // Auto fit when cluster changes, map mode changes, or modal opens
  useEffect(() => {
    if (showTopologyModal) {
      const timer = setTimeout(() => {
        handleFitView();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [currentCluster, mapMode, showTopologyModal, handleFitView]);

  const handleResetView = () => {
    setScale(1.0);
    setPan({ x: 40, y: 40 });
  };

  const handleZoomIn = () => {
    setScale((s) => Math.min(s * 1.2, 2.8));
  };

  const handleZoomOut = () => {
    setScale((s) => Math.max(s / 1.2, 0.25));
  };

  // Search filtering
  const matchedNodeIds = useMemo(() => {
    const matched = new Set<string>();
    if (!searchQuery.trim()) return matched;

    const query = searchQuery.toLowerCase().trim();
    for (const node of activeLayout.nodes) {
      const dev = node.device;
      const matchLabel = dev.label.toLowerCase().includes(query);
      const matchCode = dev.code.toLowerCase().includes(query);
      const matchType = dev.type.toLowerCase().includes(query);
      const matchRoom = (dev.location.roomName || dev.location.roomId || '').toLowerCase().includes(query);
      const matchIp = (node.ip || '').toLowerCase().includes(query);
      const matchNotes = (dev.metadata?.notes || '').toLowerCase().includes(query);

      if (matchLabel || matchCode || matchType || matchRoom || matchIp || matchNotes) {
        matched.add(node.id);
      }
    }
    return matched;
  }, [searchQuery, activeLayout.nodes]);

  // Keyboard controls
  useEffect(() => {
    if (!showTopologyModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
        }
        return;
      }

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          toggleTopologyModal(false);
          break;
        case '+':
        case '=':
          e.preventDefault();
          handleZoomIn();
          break;
        case '-':
        case '_':
          e.preventDefault();
          handleZoomOut();
          break;
        case '0':
          e.preventDefault();
          handleFitView();
          break;
        case 'l':
        case 'L':
          setShowLegend((v) => !v);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showTopologyModal, toggleTopologyModal, handleFitView]);

  if (!showTopologyModal) return null;

  const selectedNode = selectedNodeId
    ? activeLayout.nodes.find((n) => n.id === selectedNodeId) || null
    : null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-slate-50 dark:bg-zinc-950 animate-in fade-in duration-200"
    >
      {/* 1. HEADER */}
      <NetworkHeader
        onBackTo3D={() => toggleTopologyModal(false)}
        totalDevicesCount={activeLayout.nodes.length}
      />

      {/* 2. TOOLBAR */}
      <NetworkToolbar
        mapMode={mapMode}
        onMapModeChange={(m) => {
          setMapMode(m);
          setSelectedNodeId(null);
        }}
        currentCluster={currentCluster}
        onClusterChange={(c) => {
          setCurrentCluster(c);
          setSelectedNodeId(null);
        }}
        scale={scale}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onFitView={handleFitView}
        onResetView={handleResetView}
        showDataFlow={showDataFlow}
        onToggleDataFlow={() => setShowDataFlow((v) => !v)}
        showLegend={showLegend}
        onToggleLegend={() => setShowLegend((v) => !v)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        matchCount={matchedNodeIds.size}
        showBlueprintImage={showBlueprintImage}
        onToggleBlueprintImage={() => setShowBlueprintImage((v) => !v)}
        showArchitectureOverlay={showArchitectureOverlay}
        onToggleArchitectureOverlay={() => setShowArchitectureOverlay((v) => !v)}
      />

      {/* 3. MAIN WORKSPACE: CANVAS + FLOATING INSPECTOR */}
      <div className="relative flex-1 overflow-hidden">
        {mapMode === 'topdown' ? (
          /* Top-Down Master Plan Canvas (sodotruong.jpg) */
          <NetworkTopDownCanvas
            nodes={topdownLayout.nodes}
            edges={topdownLayout.edges}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            showDataFlow={showDataFlow}
            matchedNodeIds={matchedNodeIds}
            scale={scale}
            pan={pan}
            onTransformChange={(newScale, newPan) => {
              setScale(newScale);
              setPan(newPan);
            }}
            showBlueprintImage={showBlueprintImage}
            blueprintOpacity={0.65}
            showArchitectureOverlay={showArchitectureOverlay}
          />
        ) : (
          /* Logical Hierarchy Topology Canvas */
          <NetworkCanvas
            layout={hierarchyLayout}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            showDataFlow={showDataFlow}
            matchedNodeIds={matchedNodeIds}
            scale={scale}
            pan={pan}
            onTransformChange={(newScale, newPan) => {
              setScale(newScale);
              setPan(newPan);
            }}
          />
        )}

        {/* Floating Right Inspector Panel */}
        {selectedNode && (
          <div className="absolute top-4 right-4 bottom-4 pointer-events-auto animate-in slide-in-from-right duration-200">
            <NetworkInspector
              selectedNode={selectedNode}
              onClose={() => setSelectedNodeId(null)}
              onSelectNodeById={(id) => {
                setSelectedNodeId(id);
                const targetNode = activeLayout.nodes.find((n) => n.id === id);
                if (targetNode && containerRef.current) {
                  const rect = containerRef.current.getBoundingClientRect();
                  const targetScale = Math.max(scale, 1.0);
                  setPan({
                    x: rect.width / 2 - targetNode.x * targetScale,
                    y: rect.height / 2 - targetNode.y * targetScale,
                  });
                }
              }}
            />
          </div>
        )}
      </div>

      {/* 4. LEGEND MODAL */}
      <NetworkLegend isOpen={showLegend} onClose={() => setShowLegend(false)} />
    </div>
  );
};
