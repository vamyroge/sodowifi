import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useTwinStore } from '../../store/twin-store';
import type { NetworkClusterId } from '../../types/network';
import { buildTopologyLayout } from '../../lib/network/network-2d-layout';
import { NetworkHeader } from './NetworkHeader';
import { NetworkToolbar } from './NetworkToolbar';
import { NetworkCanvas } from './NetworkCanvas';
import { NetworkInspector } from './NetworkInspector';
import { NetworkLegend } from './NetworkLegend';

export const Network2DView: React.FC = () => {
  const showTopologyModal = useTwinStore((s) => s.showTopologyModal);
  const toggleTopologyModal = useTwinStore((s) => s.toggleTopologyModal);
  const selection = useTwinStore((s) => s.selection);

  const [currentCluster, setCurrentCluster] = useState<NetworkClusterId>('all');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [scale, setScale] = useState(0.85);
  const [pan, setPan] = useState({ x: 40, y: 30 });
  const [showDataFlow, setShowDataFlow] = useState(true);
  const [showLegend, setShowLegend] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync initial selection from store if present
  useEffect(() => {
    if (selection.networkDeviceId) {
      setSelectedNodeId(selection.networkDeviceId);
    }
  }, [selection.networkDeviceId]);

  // Build topology layout based on current cluster
  const layout = useMemo(() => {
    return buildTopologyLayout(currentCluster);
  }, [currentCluster]);

  // Fit view calculation
  const handleFitView = useCallback(() => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    if (clientWidth === 0 || clientHeight === 0) return;

    // Available canvas area (subtracting approximate header and toolbar height)
    const availableW = clientWidth;
    const availableH = Math.max(clientHeight - 120, 300);

    const contentW = layout.bounds.width;
    const contentH = layout.bounds.height;

    // Margin scale
    const scaleX = (availableW - 80) / contentW;
    const scaleY = (availableH - 80) / contentH;
    const fitScale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.3), 1.4);

    const centerX = availableW / 2;
    const centerY = availableH / 2;
    const contentCenterX = (layout.bounds.minX + layout.bounds.maxX) / 2;
    const contentCenterY = (layout.bounds.minY + layout.bounds.maxY) / 2;

    const fitPanX = centerX - contentCenterX * fitScale;
    const fitPanY = centerY - contentCenterY * fitScale;

    setScale(fitScale);
    setPan({ x: fitPanX, y: fitPanY });
  }, [layout]);

  // Auto fit when cluster changes or modal opens
  useEffect(() => {
    if (showTopologyModal) {
      // Small timeout to ensure DOM rect is ready
      const timer = setTimeout(() => {
        handleFitView();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [currentCluster, showTopologyModal, handleFitView]);

  // Reset scale to 100%
  const handleResetView = () => {
    setScale(1.0);
    setPan({ x: 50, y: 50 });
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
    for (const node of layout.nodes) {
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
  }, [searchQuery, layout.nodes]);

  // Keyboard controls
  useEffect(() => {
    if (!showTopologyModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // If typing in input, ignore shortcuts except Escape
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
    ? layout.nodes.find((n) => n.id === selectedNodeId) || null
    : null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-slate-50 dark:bg-zinc-950 animate-in fade-in duration-200"
    >
      {/* 1. HEADER */}
      <NetworkHeader
        onBackTo3D={() => toggleTopologyModal(false)}
        totalDevicesCount={layout.nodes.length}
      />

      {/* 2. TOOLBAR */}
      <NetworkToolbar
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
      />

      {/* 3. MAIN WORKSPACE: CANVAS + FLOATING INSPECTOR */}
      <div className="relative flex-1 overflow-hidden">
        {/* Canvas with Pan, Zoom, Nodes, and SVG Edges */}
        <NetworkCanvas
          layout={layout}
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

        {/* Floating Right Inspector Panel */}
        {selectedNode && (
          <div className="absolute top-4 right-4 bottom-4 pointer-events-auto animate-in slide-in-from-right duration-200">
            <NetworkInspector
              selectedNode={selectedNode}
              onClose={() => setSelectedNodeId(null)}
              onSelectNodeById={(id) => {
                setSelectedNodeId(id);
                // Also center view to node if on canvas
                const targetNode = layout.nodes.find((n) => n.id === id);
                if (targetNode && containerRef.current) {
                  const rect = containerRef.current.getBoundingClientRect();
                  const targetScale = Math.max(scale, 0.9);
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
