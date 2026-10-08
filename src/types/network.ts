import type { Provenance } from './school';

export type NetworkDeviceType =
  | 'gateway'
  | 'router'
  | 'switch'
  | 'hub'
  | 'access-point'
  | 'pc'
  | 'camera';

export interface NetworkLocation {
  buildingId: string;
  floorId: string;
  roomId?: string;
  roomName?: string;
  /** Tọa độ cục bộ [x, y, z] tính theo mét tương đối với tâm phòng hoặc tầng */
  localPosition: [number, number, number];
  /** Tọa độ thế giới tính toán [x, y, z] tính theo mét */
  worldPosition?: [number, number, number];
}

export interface NetworkDevice {
  id: string;
  code: string;
  label: string;
  type: NetworkDeviceType;
  location: NetworkLocation;
  connectedDeviceIds: string[];
  metadata?: {
    ipRange?: string;
    vlan?: number;
    notes?: string;
    ports?: number;
    pcCount?: number;
  };
  provenance: Provenance;
}

export type CableMedium = 'cat6' | 'fiber' | 'wireless';
export type CableTopologyType = 'intra-room' | 'corridor' | 'inter-building' | 'riser';

export interface NetworkConnection {
  id: string;
  fromDeviceId: string;
  toDeviceId: string;
  medium: CableMedium;
  routingType: CableTopologyType;
  waypoints?: [number, number, number][];
  provenance: Provenance;
}

export interface NetworkTopology {
  version: string;
  sourceImage: string;
  devices: NetworkDevice[];
  connections: NetworkConnection[];
}

export type NetworkClusterId = 'all' | 'b-cd' | 'a';

export type DeviceOperationalStatus = 'online' | 'warning' | 'offline';

export interface LayoutNode {
  id: string;
  device: NetworkDevice;
  x: number;
  y: number;
  width: number;
  height: number;
  tier: number;
  cluster: 'b-cd' | 'a' | 'wan';
  status: DeviceOperationalStatus;
  ip?: string;
}

export interface LayoutEdge {
  id: string;
  fromId: string;
  toId: string;
  medium: CableMedium;
  path: string;
  cluster: 'b-cd' | 'a' | 'wan';
  status: DeviceOperationalStatus;
}

export interface TopologyLayout {
  nodes: LayoutNode[];
  edges: LayoutEdge[];
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
  };
}
