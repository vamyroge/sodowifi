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
