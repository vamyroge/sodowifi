import { create } from 'zustand';
import { getSceneIndex } from '../lib/3d/scene';

export type ViewMode = 'architectural' | 'transparent' | 'floorplan' | 'schematic' | 'network';
export type CameraMode = 'overview' | 'building' | 'floor' | 'room' | 'facility' | 'top' | 'orbit' | 'interior';
export type FloorFilter = number | 'all';
export type NavSection = 'overview' | 'campus' | 'buildings';
export type LoadStage = 'boot' | 'data' | 'geometry' | 'gpu' | 'ready' | 'error';

export interface Selection {
  buildingId: string | null;
  roomId: string | null;
  facilityId: string | null;
  networkDeviceId: string | null;
}

export interface HoverInfo {
  id: string;
  kind: 'building' | 'room' | 'facility' | 'network-device';
  label: string;
  sub?: string;
}

export interface NetworkFilterState {
  gateway: boolean;
  router: boolean;
  switch: boolean;
  hub: boolean;
  'access-point': boolean;
  pc: boolean;
  camera: boolean;
}

interface TwinState {
  selection: Selection;
  hovered: HoverInfo | null;
  pointer: { x: number; y: number };
  floorFilter: FloorFilter;
  explode: boolean;
  isolatedBuildingId: string | null;
  viewMode: ViewMode;
  networkLayerVisible: boolean;
  networkFilter: NetworkFilterState;
  showTopologyModal: boolean;
  showSearchModal: boolean;
  lighting: 'day' | 'evening' | 'night';
  uiHidden: boolean;
  showReference: boolean;
  showShortcuts: boolean;
  navSection: NavSection;
  mobileSheet: 'none' | 'nav' | 'inspector';
  cameraMode: CameraMode;
  /** Incremented on every camera request so identical requests still fly. */
  cameraNonce: number;
  loadStage: LoadStage;
  devWarnings: string[];

  selectBuilding: (id: string) => void;
  selectRoom: (id: string) => void;
  selectFacility: (id: string) => void;
  selectNetworkDevice: (id: string | null) => void;
  setFloorFilter: (f: FloorFilter) => void;
  clearSelection: () => void;
  resetCamera: () => void;
  setCameraMode: (m: CameraMode) => void;
  focusSelected: () => void;
  toggleExplode: () => void;
  toggleIsolate: (buildingId: string | null) => void;
  setViewMode: (m: ViewMode) => void;
  toggleNetworkLayer: (v?: boolean) => void;
  setNetworkFilter: (key: keyof NetworkFilterState, val: boolean) => void;
  toggleTopologyModal: (v?: boolean) => void;
  toggleSearchModal: (v?: boolean) => void;
  setLighting: (l: 'day' | 'evening' | 'night') => void;
  toggleUi: () => void;
  toggleReference: () => void;
  toggleShortcuts: (v?: boolean) => void;
  setNavSection: (s: NavSection) => void;
  setMobileSheet: (s: 'none' | 'nav' | 'inspector') => void;
  setHovered: (h: HoverInfo | null) => void;
  setPointer: (x: number, y: number) => void;
  setLoadStage: (s: LoadStage) => void;
  addDevWarning: (w: string) => void;
}

const EMPTY: Selection = { buildingId: null, roomId: null, facilityId: null, networkDeviceId: null };

export const useTwinStore = create<TwinState>((set, get) => ({
  selection: EMPTY,
  hovered: null,
  pointer: { x: 0, y: 0 },
  floorFilter: 'all',
  explode: false,
  isolatedBuildingId: null,
  viewMode: 'architectural',
  networkLayerVisible: false,
  networkFilter: {
    gateway: true,
    router: true,
    switch: true,
    hub: true,
    'access-point': true,
    pc: true,
    camera: true,
  },
  showTopologyModal: false,
  showSearchModal: false,
  lighting: 'day',
  uiHidden: false,
  showReference: false,
  showShortcuts: false,
  navSection: 'buildings',
  mobileSheet: 'none',
  cameraMode: 'overview',
  cameraNonce: 0,
  loadStage: 'boot',
  devWarnings: [],

  selectBuilding: (id) =>
    set((s) => ({
      selection: { buildingId: id, roomId: null, facilityId: null, networkDeviceId: null },
      floorFilter: s.selection.buildingId === id ? s.floorFilter : s.viewMode === 'floorplan' ? 0 : 'all',
      cameraMode: 'building',
      cameraNonce: s.cameraNonce + 1,
      mobileSheet: s.mobileSheet === 'nav' ? 'inspector' : s.mobileSheet,
    })),

  selectRoom: (id) => {
    const entry = getSceneIndex().roomById.get(id);
    if (!entry) return;
    set((s) => ({
      selection: { buildingId: entry.building.id, roomId: id, facilityId: null, networkDeviceId: null },
      floorFilter: entry.floor.level,
      cameraMode: 'room',
      cameraNonce: s.cameraNonce + 1,
    }));
  },

  selectFacility: (id) =>
    set((s) => ({
      selection: { buildingId: null, roomId: null, facilityId: id, networkDeviceId: null },
      floorFilter: s.viewMode === 'floorplan' ? 0 : 'all',
      cameraMode: 'facility',
      cameraNonce: s.cameraNonce + 1,
    })),

  selectNetworkDevice: (id) =>
    set((s) => ({
      selection: { ...s.selection, networkDeviceId: id },
      cameraNonce: id ? s.cameraNonce + 1 : s.cameraNonce,
      mobileSheet: id ? 'inspector' : s.mobileSheet,
    })),

  setFloorFilter: (f) =>
    set((s) => {
      const roomEntry = s.selection.roomId ? getSceneIndex().roomById.get(s.selection.roomId) : undefined;
      const keepRoom = roomEntry && f !== 'all' && roomEntry.floor.level === f;
      return {
        floorFilter: f,
        selection: keepRoom ? s.selection : { ...s.selection, roomId: null },
        cameraMode: s.selection.buildingId ? (f === 'all' ? 'building' : 'floor') : s.cameraMode,
        cameraNonce: s.selection.buildingId ? s.cameraNonce + 1 : s.cameraNonce,
      };
    }),

  clearSelection: () =>
    set((s) => ({
      selection: EMPTY,
      floorFilter: s.viewMode === 'floorplan' ? 0 : 'all',
      isolatedBuildingId: null,
      cameraMode: 'overview',
      cameraNonce: s.cameraNonce + 1,
    })),

  resetCamera: () => set((s) => ({ cameraMode: 'overview', cameraNonce: s.cameraNonce + 1 })),
  setCameraMode: (m) => set((s) => ({ cameraMode: m, cameraNonce: s.cameraNonce + 1 })),

  focusSelected: () => {
    const { selection, floorFilter } = get();
    const mode: CameraMode = selection.roomId
      ? 'room'
      : selection.facilityId
        ? 'facility'
        : selection.buildingId
          ? floorFilter === 'all'
            ? 'building'
            : 'floor'
          : 'overview';
    set((s) => ({ cameraMode: mode, cameraNonce: s.cameraNonce + 1 }));
  },

  toggleExplode: () => set((s) => ({ explode: !s.explode, cameraNonce: s.cameraNonce + 1 })),

  toggleIsolate: (buildingId) =>
    set((s) => ({
      isolatedBuildingId: buildingId === null || s.isolatedBuildingId === buildingId ? null : buildingId,
    })),

  setViewMode: (m) =>
    set((s) => ({
      viewMode: m,
      networkLayerVisible: m === 'network' || m === 'transparent' ? true : s.networkLayerVisible,
      floorFilter: m === 'floorplan' && s.floorFilter === 'all' ? 0 : s.floorFilter,
      cameraNonce: s.cameraNonce + 1,
    })),

  toggleNetworkLayer: (v) =>
    set((s) => ({
      networkLayerVisible: v ?? !s.networkLayerVisible,
    })),

  setNetworkFilter: (key, val) =>
    set((s) => ({
      networkFilter: { ...s.networkFilter, [key]: val },
    })),

  toggleTopologyModal: (v) =>
    set((s) => ({
      showTopologyModal: v ?? !s.showTopologyModal,
    })),

  toggleSearchModal: (v) =>
    set((s) => ({
      showSearchModal: v ?? !s.showSearchModal,
    })),

  setLighting: (l) => set({ lighting: l }),
  toggleUi: () => set((s) => ({ uiHidden: !s.uiHidden })),
  toggleReference: () => set((s) => ({ showReference: !s.showReference })),
  toggleShortcuts: (v) => set((s) => ({ showShortcuts: v ?? !s.showShortcuts })),
  setNavSection: (n) => set({ navSection: n }),
  setMobileSheet: (m) => set({ mobileSheet: m }),
  setHovered: (h) => set({ hovered: h }),
  setPointer: (x, y) => set({ pointer: { x, y } }),
  setLoadStage: (st) => set({ loadStage: st }),
  addDevWarning: (w) => set((s) => (s.devWarnings.includes(w) ? s : { devWarnings: [...s.devWarnings, w] })),
}));
