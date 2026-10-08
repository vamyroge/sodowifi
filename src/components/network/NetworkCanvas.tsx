import React, { useRef, useState, useCallback } from 'react';
import type { TopologyLayout, LayoutNode } from '../../types/network';
import { NetworkNodeItem } from './NetworkNodeItem';
import { NetworkEdgeItem } from './NetworkEdgeItem';

interface NetworkCanvasProps {
  layout: TopologyLayout;
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  showDataFlow: boolean;
  matchedNodeIds: Set<string>;
  scale: number;
  pan: { x: number; y: number };
  onTransformChange: (scale: number, pan: { x: number; y: number }) => void;
}

export const NetworkCanvas: React.FC<NetworkCanvasProps> = ({
  layout,
  selectedNodeId,
  onSelectNode,
  showDataFlow,
  matchedNodeIds,
  scale,
  pan,
  onTransformChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<LayoutNode | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Touch pinch-to-zoom tracking
  const touchDistRef = useRef<number | null>(null);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag with left click or middle click
    if (e.button !== 0 && e.button !== 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });

    if (!isDragging) return;
    onTransformChange(scale, {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Wheel zoom centered at mouse position
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
      const newScale = Math.min(Math.max(scale * zoomFactor, 0.2), 2.8);

      // Adjust pan to zoom towards mouse position
      const newPanX = mouseX - (mouseX - pan.x) * (newScale / scale);
      const newPanY = mouseY - (mouseY - pan.y) * (newScale / scale);

      onTransformChange(newScale, { x: newPanX, y: newPanY });
    },
    [scale, pan, onTransformChange]
  );

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const t0 = e.touches[0];
    const t1 = e.touches[1];
    if (e.touches.length === 1 && t0) {
      setIsDragging(true);
      setDragStart({
        x: t0.clientX - pan.x,
        y: t0.clientY - pan.y,
      });
      touchDistRef.current = null;
    } else if (e.touches.length === 2 && t0 && t1) {
      setIsDragging(false);
      const dx = t0.clientX - t1.clientX;
      const dy = t0.clientY - t1.clientY;
      touchDistRef.current = Math.hypot(dx, dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const t0 = e.touches[0];
    const t1 = e.touches[1];
    if (e.touches.length === 1 && isDragging && t0) {
      onTransformChange(scale, {
        x: t0.clientX - dragStart.x,
        y: t0.clientY - dragStart.y,
      });
    } else if (e.touches.length === 2 && touchDistRef.current && t0 && t1) {
      const dx = t0.clientX - t1.clientX;
      const dy = t0.clientY - t1.clientY;
      const dist = Math.hypot(dx, dy);
      const factor = dist / touchDistRef.current;
      const newScale = Math.min(Math.max(scale * factor, 0.25), 2.5);

      touchDistRef.current = dist;
      onTransformChange(newScale, pan);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchDistRef.current = null;
  };

  // Center on node when double clicked
  const handleDoubleClickNode = (node: LayoutNode, e: React.MouseEvent) => {
    e.stopPropagation();
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const targetScale = Math.max(scale, 1.0);
    const newPanX = rect.width / 2 - node.x * targetScale;
    const newPanY = rect.height / 2 - node.y * targetScale;

    onTransformChange(targetScale, { x: newPanX, y: newPanY });
    onSelectNode(node.id);
  };

  // Determine connected edges and nodes for selectedNodeId
  const connectedNodeIds = new Set<string>();
  const highlightedEdgeIds = new Set<string>();

  if (selectedNodeId) {
    connectedNodeIds.add(selectedNodeId);
    for (const edge of layout.edges) {
      if (edge.fromId === selectedNodeId) {
        highlightedEdgeIds.add(edge.id);
        connectedNodeIds.add(edge.toId);
      } else if (edge.toId === selectedNodeId) {
        highlightedEdgeIds.add(edge.id);
        connectedNodeIds.add(edge.fromId);
      }
    }
  }

  // Prevent background click from deselecting when dragging
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg') {
      onSelectNode(null);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleCanvasClick}
      className={`relative w-full h-full overflow-hidden select-none bg-[#f8fafc] dark:bg-[#090d16] ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* High-tech Canvas Background Grid */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.22] dark:opacity-[0.15]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="network-grid"
            width={40 * scale}
            height={40 * scale}
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(${pan.x}, ${pan.y})`}
          >
            <circle cx="2" cy="2" r="1.2" className="fill-zinc-600 dark:fill-zinc-300" />
            <path
              d={`M ${40 * scale} 0 L 0 0 0 ${40 * scale}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-zinc-300 dark:text-zinc-800"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#network-grid)" />
      </svg>

      {/* Transformable Canvas Content */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          width: `${layout.bounds.width + 400}px`,
          height: `${layout.bounds.height + 400}px`,
        }}
        className="relative transition-transform duration-75 ease-out"
      >
        {/* SVG Layer for Cables & Connections */}
        <svg
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          {layout.edges.map((edge) => {
            const isHighlighted = highlightedEdgeIds.has(edge.id);
            const isDimmed = selectedNodeId !== null && !isHighlighted;
            return (
              <NetworkEdgeItem
                key={edge.id}
                edge={edge}
                isHighlighted={isHighlighted}
                isDimmed={isDimmed}
                showDataFlow={showDataFlow}
              />
            );
          })}
        </svg>

        {/* HTML Layer for Interactive Nodes */}
        {layout.nodes.map((node) => {
          const isSelected = selectedNodeId === node.id;
          const isHovered = hoveredNode?.id === node.id;
          const isRelated = connectedNodeIds.has(node.id) && !isSelected;
          const isSearchMatch = matchedNodeIds.has(node.id);

          return (
            <NetworkNodeItem
              key={node.id}
              node={node}
              isSelected={isSelected}
              isHovered={isHovered}
              isRelated={isRelated}
              isSearchMatch={isSearchMatch}
              onClick={(e) => {
                e.stopPropagation();
                onSelectNode(node.id);
              }}
              onDoubleClick={(e) => handleDoubleClickNode(node, e)}
              onMouseEnter={() => setHoveredNode(node)}
              onMouseLeave={() => setHoveredNode(null)}
            />
          );
        })}
      </div>

      {/* Floating Hover Tooltip */}
      {hoveredNode && !selectedNodeId && (
        <div
          style={{
            position: 'fixed',
            left: `${mousePos.x + 14}px`,
            top: `${mousePos.y + 14}px`,
            pointerEvents: 'none',
            zIndex: 60,
          }}
          className="px-3 py-2 rounded-xl bg-zinc-900/90 dark:bg-zinc-800/90 text-white backdrop-blur-md border border-zinc-700/60 shadow-xl text-xs space-y-1 animate-in fade-in duration-100"
        >
          <div className="font-bold flex items-center gap-1.5">
            <span>{hoveredNode.device.label}</span>
            <span className="font-mono text-[10px] text-zinc-400">({hoveredNode.device.code})</span>
          </div>
          <div className="text-[11px] text-zinc-300">
            {hoveredNode.device.location.roomName || hoveredNode.device.location.roomId || 'Hạ tầng mạng'}
          </div>
          <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-2">
            <span>IP: {hoveredNode.ip || 'DHCP'}</span>
            <span>•</span>
            <span>Online</span>
          </div>
        </div>
      )}

      {/* Canvas Watermark in Bottom Left */}
      <div className="absolute bottom-3 left-4 pointer-events-none select-none text-[11px] font-mono text-zinc-400/60 dark:text-zinc-600 tracking-wider">
        THPT Số 1 Tư Nghĩa · Network Topology 2D Engine
      </div>
    </div>
  );
};
