import React from 'react';
import type { LayoutEdge } from '../../types/network';

interface NetworkEdgeItemProps {
  edge: LayoutEdge;
  isHighlighted: boolean;
  isDimmed: boolean;
  showDataFlow: boolean;
}

const MEDIUM_COLORS = {
  fiber: {
    stroke: '#f97316', // Orange WAN Fiber
    pulse: '#fdba74',
  },
  cat6: {
    stroke: '#0284c7', // Sky Blue Cat6
    pulse: '#38bdf8',
  },
  wireless: {
    stroke: '#a855f7', // Purple WiFi
    pulse: '#e9d5ff',
  },
};

export const NetworkEdgeItem: React.FC<NetworkEdgeItemProps> = React.memo(({
  edge,
  isHighlighted,
  isDimmed,
  showDataFlow,
}) => {
  const color = MEDIUM_COLORS[edge.medium] || MEDIUM_COLORS.cat6;

  const baseStrokeWidth = isHighlighted ? 3 : 1.8;
  const baseOpacity = isDimmed ? 0.15 : isHighlighted ? 1 : 0.65;

  return (
    <g className="transition-opacity duration-200">
      {/* Background Line (Base physical cable) */}
      <path
        d={edge.path}
        fill="none"
        stroke={isHighlighted ? '#38bdf8' : color.stroke}
        strokeWidth={baseStrokeWidth}
        strokeOpacity={baseOpacity}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          filter: isHighlighted ? 'drop-shadow(0 0 4px rgba(56, 189, 248, 0.6))' : 'none',
        }}
      />

      {/* Animated Data Packet Flow (Gentle pulse flowing forward) */}
      {showDataFlow && !isDimmed && (
        <path
          d={edge.path}
          fill="none"
          stroke={isHighlighted ? '#ffffff' : color.pulse}
          strokeWidth={isHighlighted ? 2.5 : 1.5}
          strokeDasharray="6 14"
          strokeLinecap="round"
          className="network-cable-flow"
          style={{
            opacity: isHighlighted ? 0.95 : 0.7,
          }}
        />
      )}
    </g>
  );
});

NetworkEdgeItem.displayName = 'NetworkEdgeItem';
