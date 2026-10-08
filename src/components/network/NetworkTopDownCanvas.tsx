import React, { useRef, useState, useCallback, useMemo } from 'react';
import type { LayoutNode, LayoutEdge } from '../../types/network';
import {
  SCHOOL_IMAGE_DIMS,
  SCHOOL_BUILDINGS_PLAN,
  SCHOOL_OUTDOOR_PLAN,
} from '../../lib/network/network-topdown-layout';
import { NetworkEdgeItem } from './NetworkEdgeItem';

interface NetworkTopDownCanvasProps {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  showDataFlow: boolean;
  matchedNodeIds: Set<string>;
  scale: number;
  pan: { x: number; y: number };
  onTransformChange: (scale: number, pan: { x: number; y: number }) => void;
  showBlueprintImage: boolean;
  blueprintOpacity: number;
  showArchitectureOverlay: boolean;
}

const DEVICE_TYPE_COLORS: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  gateway: { bg: 'bg-orange-500/95', border: 'border-orange-300 ring-2 ring-orange-500/40 shadow-orange-500/30', text: 'text-white', icon: '🌐' },
  router: { bg: 'bg-sky-600/95', border: 'border-sky-300 ring-2 ring-sky-500/40 shadow-sky-500/30', text: 'text-white', icon: '📡' },
  switch: { bg: 'bg-emerald-600/95', border: 'border-emerald-300 ring-2 ring-emerald-500/40 shadow-emerald-500/30', text: 'text-white', icon: '🔀' },
  hub: { bg: 'bg-green-600/95', border: 'border-green-300 ring-2 ring-green-500/40 shadow-green-500/30', text: 'text-white', icon: '🔌' },
  'access-point': { bg: 'bg-purple-600/95', border: 'border-purple-300 ring-2 ring-purple-500/40 shadow-purple-500/30', text: 'text-white', icon: '📶' },
  pc: { bg: 'bg-slate-700/95', border: 'border-slate-400 ring-1 ring-slate-500/30 shadow-slate-500/20', text: 'text-white', icon: '💻' },
  camera: { bg: 'bg-cyan-700/95', border: 'border-cyan-400 ring-1 ring-cyan-500/30 shadow-cyan-500/20', text: 'text-white', icon: '📷' },
};

const DEVICE_TYPE_VIETNAMESE: Record<string, string> = {
  gateway: 'Cổng quang Gateway (VNPT)',
  router: 'Bộ định tuyến (Router)',
  hub: 'Bộ chia mạng (Hub)',
  switch: 'Bộ chuyển mạch (Switch)',
  'access-point': 'Điểm phát Wi-Fi (WAP)',
  pc: 'Máy tính trạm (PC)',
  camera: 'Camera an ninh (CCTV)',
};

const BUILDING_NAME_MAP: Record<string, string> = {
  'building-b': 'Dãy B (Tây)',
  'building-cd': 'Dãy C·D (Bắc)',
  'building-a': 'Dãy C (Tây Nam)',
  'building-e': 'Dãy A / Nhà E (Đông)',
  'building-f': 'Khối Hiệu bộ',
};

const FLOOR_NAME_MAP: Record<string, string> = {
  'floor-1': 'Tầng trệt',
  'floor-2': 'Lầu 1',
  'floor-3': 'Lầu 2',
};

// Kích thước kí hiệu nhỏ gọn, thanh thoát cho mặt bằng CAD
interface SymbolSpec {
  width: number;
  height: number;
  iconSize: string;
  shape: string;
  isCluster: boolean;
  count?: number;
}

function getDeviceSymbolSpecs(type: string, metadata?: { pcCount?: number }): SymbolSpec {
  if (type === 'gateway') {
    return { width: 26, height: 26, iconSize: 'text-[13px]', shape: 'rounded-xl', isCluster: false };
  }
  if (type === 'router') {
    return { width: 22, height: 22, iconSize: 'text-[11px]', shape: 'rounded-lg', isCluster: false };
  }
  if (type === 'hub') {
    return { width: 20, height: 20, iconSize: 'text-[10px]', shape: 'rounded-lg', isCluster: false };
  }
  if (type === 'switch') {
    return { width: 18, height: 18, iconSize: 'text-[9px]', shape: 'rounded-md', isCluster: false };
  }
  if (type === 'access-point') {
    return { width: 20, height: 20, iconSize: 'text-[10px]', shape: 'rounded-full', isCluster: false };
  }
  if (type === 'pc') {
    if (metadata?.pcCount && metadata.pcCount > 1) {
      return { width: 34, height: 20, iconSize: 'text-[10px]', shape: 'rounded-lg', isCluster: true, count: metadata.pcCount };
    }
    return { width: 16, height: 16, iconSize: 'text-[9px]', shape: 'rounded-md', isCluster: false };
  }
  if (type === 'camera') {
    return { width: 16, height: 16, iconSize: 'text-[9px]', shape: 'rounded-full', isCluster: false };
  }
  return { width: 18, height: 18, iconSize: 'text-[9px]', shape: 'rounded-md', isCluster: false };
}

export const NetworkTopDownCanvas: React.FC<NetworkTopDownCanvasProps> = ({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  showDataFlow,
  matchedNodeIds,
  scale,
  pan,
  onTransformChange,
  showBlueprintImage,
  blueprintOpacity,
  showArchitectureOverlay,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<LayoutNode | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const touchDistRef = useRef<number | null>(null);

  // Mouse pan drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
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

  // Mouse wheel zoom centered on cursor
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const zoomFactor = e.deltaY < 0 ? 1.12 : 0.89;
      const newScale = Math.min(Math.max(scale * zoomFactor, 0.25), 3.0);

      const newPanX = mouseX - (mouseX - pan.x) * (newScale / scale);
      const newPanY = mouseY - (mouseY - pan.y) * (newScale / scale);

      onTransformChange(newScale, { x: newPanX, y: newPanY });
    },
    [scale, pan, onTransformChange]
  );

  // Touch handlers for mobile/tablets
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
      const newScale = Math.min(Math.max(scale * factor, 0.25), 3.0);

      touchDistRef.current = dist;
      onTransformChange(newScale, pan);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    touchDistRef.current = null;
  };

  // Connected elements highlighting
  const connectedNodeIds = new Set<string>();
  const highlightedEdgeIds = new Set<string>();

  if (selectedNodeId) {
    connectedNodeIds.add(selectedNodeId);
    for (const edge of edges) {
      if (edge.fromId === selectedNodeId) {
        highlightedEdgeIds.add(edge.id);
        connectedNodeIds.add(edge.toId);
      } else if (edge.toId === selectedNodeId) {
        highlightedEdgeIds.add(edge.id);
        connectedNodeIds.add(edge.fromId);
      }
    }
  }

  const handleDoubleClickNode = (node: LayoutNode, e: React.MouseEvent) => {
    e.stopPropagation();
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const targetScale = Math.max(scale, 1.2);
    const newPanX = rect.width / 2 - node.x * targetScale;
    const newPanY = rect.height / 2 - node.y * targetScale;

    onTransformChange(targetScale, { x: newPanX, y: newPanY });
    onSelectNode(node.id);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg') {
      onSelectNode(null);
    }
  };

  // Map tên thiết bị để hiển thị liên kết trong hover card
  const deviceNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const n of nodes) {
      map.set(n.id, n.device.label || n.device.code);
    }
    return map;
  }, [nodes]);

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
      className={`relative w-full h-full overflow-hidden select-none bg-[#0b0f19] ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* Transformable Master Plan Container */}
      <div
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          width: `${SCHOOL_IMAGE_DIMS.width}px`,
          height: `${SCHOOL_IMAGE_DIMS.height}px`,
        }}
        className="relative transition-transform duration-75 ease-out shadow-2xl"
      >
        {/* SVG LAYER: Architectural Map + Reference Blueprint + Cable Conduits */}
        <svg
          viewBox={`0 0 ${SCHOOL_IMAGE_DIMS.width} ${SCHOOL_IMAGE_DIMS.height}`}
          className="absolute inset-0 w-full h-full"
          style={{ width: `${SCHOOL_IMAGE_DIMS.width}px`, height: `${SCHOOL_IMAGE_DIMS.height}px` }}
        >
          {/* 1. Underlying Blueprint Image */}
          {showBlueprintImage && (
            <image
              href={SCHOOL_IMAGE_DIMS.imageSrc}
              x="0"
              y="0"
              width={SCHOOL_IMAGE_DIMS.width}
              height={SCHOOL_IMAGE_DIMS.height}
              opacity={blueprintOpacity}
              preserveAspectRatio="none"
            />
          )}

          {/* 2. Vector Architectural Overlay (Khung mặt bằng trường học) */}
          {showArchitectureOverlay && (
            <g className="school-architectural-overlay" opacity="0.85">
              {/* Campus Boundary & Courtyard */}
              <rect
                x="80"
                y="20"
                width="1170"
                height="830"
                fill="#111827"
                fillOpacity="0.4"
                stroke="#374151"
                strokeWidth="2"
                strokeDasharray="6 4"
              />

              {/* Quốc lộ 1A banner ở đáy */}
              <rect x="0" y="905" width="1280" height="42" fill="#1f2937" fillOpacity="0.8" />
              <text x="640" y="930" fill="#9ca3af" fontSize="14" fontWeight="bold" textAnchor="middle" letterSpacing="2">
                QUỐC LỘ 1A (MẶT TRƯỚC TRƯỜNG THPT SỐ 1 TƯ NGHĨA)
              </text>

              {/* Outdoor Facilities */}
              {SCHOOL_OUTDOOR_PLAN.map((fac) => {
                const w = fac.rect.x1 - fac.rect.x0;
                const h = fac.rect.y1 - fac.rect.y0;
                return (
                  <g key={fac.id}>
                    <rect
                      x={fac.rect.x0}
                      y={fac.rect.y0}
                      width={w}
                      height={h}
                      fill={fac.color}
                      fillOpacity="0.25"
                      stroke={fac.color}
                      strokeWidth="1.5"
                      rx="6"
                    />
                    <text
                      x={fac.rect.x0 + w / 2}
                      y={fac.rect.y0 + h / 2 + 4}
                      fill="#e2e8f0"
                      fontSize="11"
                      fontWeight="600"
                      textAnchor="middle"
                    >
                      {fac.icon} {fac.name}
                    </text>
                  </g>
                );
              })}

              {/* School Buildings Footprints & Rooms */}
              {SCHOOL_BUILDINGS_PLAN.map((b) => {
                const bw = b.drawnRect.x1 - b.drawnRect.x0;
                const bh = b.drawnRect.y1 - b.drawnRect.y0;

                return (
                  <g key={b.id}>
                    {/* Building main shell */}
                    <rect
                      x={b.drawnRect.x0}
                      y={b.drawnRect.y0}
                      width={bw}
                      height={bh}
                      fill="#1e293b"
                      fillOpacity="0.65"
                      stroke={b.color}
                      strokeWidth="2"
                      rx="8"
                    />

                    {/* Building Title Header */}
                    <rect
                      x={b.drawnRect.x0}
                      y={b.drawnRect.y0 - 18}
                      width={bw}
                      height="16"
                      fill={b.color}
                      fillOpacity="0.2"
                      rx="4"
                    />
                    <text
                      x={b.drawnRect.x0 + bw / 2}
                      y={b.drawnRect.y0 - 6}
                      fill="#38bdf8"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {b.name}
                    </text>

                    {/* Rooms within building */}
                    {b.rooms.map((r) => {
                      const rw = r.rect.x1 - r.rect.x0;
                      const rh = r.rect.y1 - r.rect.y0;
                      return (
                        <g key={r.id}>
                          <rect
                            x={r.rect.x0}
                            y={r.rect.y0}
                            width={rw}
                            height={rh}
                            fill="#0f172a"
                            fillOpacity="0.4"
                            stroke="#334155"
                            strokeWidth="1"
                            strokeDasharray="2 2"
                            rx="4"
                          />
                          <text
                            x={r.rect.x0 + rw / 2}
                            y={r.rect.y0 + rh / 2 + 3}
                            fill="#94a3b8"
                            fontSize="9"
                            fontWeight="500"
                            textAnchor="middle"
                          >
                            {r.label}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                );
              })}

              {/* Connecting Walkway U between Dãy B and Dãy C·D */}
              <path
                d="M 505 220 L 505 190 L 530 190"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="4"
                strokeOpacity="0.4"
                strokeLinecap="round"
              />
              <text x="500" y="180" fill="#38bdf8" fontSize="9" fontWeight="bold">
                Hành lang nối B ➔ C·D
              </text>
            </g>
          )}

          {/* 3. Physical Network Cables on Top-down plan */}
          <g className="school-network-cables">
            {edges.map((edge) => {
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
          </g>
        </svg>

        {/* HTML LAYER: Compact Network Symbols placed at room positions */}
        <div className="absolute inset-0 pointer-events-none">
          {nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isHovered = hoveredNode?.id === node.id;
            const isRelated = connectedNodeIds.has(node.id) && !isSelected;
            const isSearchMatch = matchedNodeIds.has(node.id);

            const defaultTheme = { bg: 'bg-slate-700/95', border: 'border-slate-400', text: 'text-white', icon: '📦' };
            const theme = DEVICE_TYPE_COLORS[node.device.type] || defaultTheme;
            const spec = getDeviceSymbolSpecs(node.device.type, node.device.metadata);

            const borderClass = isSelected
              ? 'border-yellow-400 ring-4 ring-yellow-400/60 shadow-lg shadow-yellow-500/50 scale-125 z-40'
              : isSearchMatch
                ? 'border-amber-400 ring-4 ring-amber-400/50 shadow-lg shadow-amber-500/40 animate-pulse z-30'
                : isHovered
                  ? 'border-white ring-2 ring-white/70 shadow-lg scale-125 z-30'
                  : isRelated
                    ? 'border-cyan-300 ring-2 ring-cyan-400/40 z-20'
                    : `${theme.border} z-10`;

            return (
              <div
                key={node.id}
                style={{
                  position: 'absolute',
                  left: `${node.x - spec.width / 2}px`,
                  top: `${node.y - spec.height / 2}px`,
                  width: `${spec.width}px`,
                  height: `${spec.height}px`,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectNode(node.id);
                }}
                onDoubleClick={(e) => handleDoubleClickNode(node, e)}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
                className={`pointer-events-auto cursor-pointer border flex items-center justify-center backdrop-blur-md transition-all duration-150 ${spec.shape} ${theme.bg} ${theme.text} ${borderClass}`}
                title={`${node.device.label} (${node.device.code})`}
              >
                {/* Icon biểu tượng nhỏ gọn */}
                <span className={`${spec.iconSize} leading-none select-none drop-shadow-xs`}>
                  {theme.icon}
                </span>

                {/* Hiển thị số lượng máy nếu là cụm phòng máy */}
                {spec.isCluster && spec.count && (
                  <span className="text-[9px] font-mono font-bold tracking-tighter ml-0.5 leading-none">
                    {spec.count}
                  </span>
                )}

                {/* Chấm trạng thái nhỏ */}
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_5px_#10b981]" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Rich Tooltip - Hiện thông tin chi tiết khi trỏ chuột vào */}
      {hoveredNode && (
        <div
          style={{
            position: 'fixed',
            left: `${
              typeof window !== 'undefined' && mousePos.x + 300 > window.innerWidth
                ? Math.max(12, mousePos.x - 290)
                : mousePos.x + 16
            }px`,
            top: `${
              typeof window !== 'undefined' && mousePos.y + 240 > window.innerHeight
                ? Math.max(12, mousePos.y - 200)
                : mousePos.y + 16
            }px`,
            pointerEvents: 'none',
            zIndex: 70,
            maxWidth: '300px',
          }}
          className="p-3 rounded-xl bg-zinc-900/95 text-white backdrop-blur-xl border border-zinc-700/80 shadow-2xl text-xs space-y-2 animate-in fade-in duration-100"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 border-b border-zinc-800 pb-2">
            <div className="flex items-center gap-2">
              <span className="text-base p-1 rounded-lg bg-zinc-800 border border-zinc-700">
                {DEVICE_TYPE_COLORS[hoveredNode.device.type]?.icon || '📦'}
              </span>
              <div>
                <div className="font-bold text-sm text-zinc-100 leading-tight">
                  {hoveredNode.device.label}
                </div>
                <div className="font-mono text-[10px] text-zinc-400">
                  {hoveredNode.device.code} · {DEVICE_TYPE_VIETNAMESE[hoveredNode.device.type] || hoveredNode.device.type}
                </div>
              </div>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
          </div>

          {/* Vị trí mặt bằng */}
          <div className="space-y-1 text-[11px] text-zinc-300">
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500">📍 Phòng/Khu vực:</span>
              <span className="font-semibold text-zinc-200">
                {hoveredNode.device.location.roomName || hoveredNode.device.location.roomId || 'Hạ tầng mạng'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500">🏢 Dãy & Tầng:</span>
              <span>
                {BUILDING_NAME_MAP[hoveredNode.device.location.buildingId] || hoveredNode.device.location.buildingId}
                {' · '}
                {FLOOR_NAME_MAP[hoveredNode.device.location.floorId] || hoveredNode.device.location.floorId}
              </span>
            </div>
          </div>

          {/* Thông số mạng */}
          <div className="bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/80 space-y-1 text-[11px]">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Địa chỉ IP:</span>
              <span className="font-mono font-bold text-emerald-400">
                {hoveredNode.ip || hoveredNode.device.metadata?.ipRange || 'DHCP'}
              </span>
            </div>

            {hoveredNode.device.metadata?.pcCount && (
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Số lượng máy trạm:</span>
                <span className="font-semibold text-sky-400">
                  {hoveredNode.device.metadata.pcCount} PC kết nối
                </span>
              </div>
            )}

            {hoveredNode.device.connectedDeviceIds.length > 0 && (
              <div className="pt-1 border-t border-zinc-800/80 text-[10px] text-zinc-400">
                <span className="text-zinc-500">Liên kết trực tiếp: </span>
                <span className="text-zinc-300">
                  {hoveredNode.device.connectedDeviceIds
                    .slice(0, 3)
                    .map((id) => deviceNameMap.get(id) || id)
                    .join(', ')}
                  {hoveredNode.device.connectedDeviceIds.length > 3 &&
                    ` +${hoveredNode.device.connectedDeviceIds.length - 3} thiết bị`}
                </span>
              </div>
            )}
          </div>

          {/* Hint footer */}
          <div className="text-[10px] text-zinc-400 flex items-center justify-between pt-0.5">
            <span>💡 Click để ghim xem 3D</span>
            <span className="text-zinc-500">Double click: Focus</span>
          </div>
        </div>
      )}

      {/* Map Legend Watermark in Bottom Left */}
      <div className="absolute bottom-3 left-4 pointer-events-none select-none text-[11px] font-mono text-zinc-400/80 bg-black/40 backdrop-blur-md px-3 py-1 rounded-lg border border-zinc-700/40 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-400" />
        <span>Bản đồ mạng mặt bằng 2D · Khung chiếu gốc (1280 × 960 px)</span>
      </div>
    </div>
  );
};
