import type { RoomType } from '../../types/school';

export interface RoomTypeInfo {
  label: string;
  /** Muted architectural palette — used for floor tiles. */
  color: string;
}

export const ROOM_TYPES: Record<RoomType, RoomTypeInfo> = {
  classroom: { label: 'Phòng học', color: '#fed7aa' }, // Light peach/orange floor tile
  'subject-office': { label: 'Phòng bộ môn', color: '#e9d5ff' }, // Light violet
  'science-lab': { label: 'Phòng thực hành', color: '#a7f3d0' }, // Mint emerald
  'computer-lab': { label: 'Phòng vi tính / CNTT', color: '#bae6fd' }, // Sky blue
  library: { label: 'Thư viện', color: '#fde68a' }, // Warm amber
  'admin-office': { label: 'Văn phòng / hành chính', color: '#fecdd3' }, // Rose pink
  meeting: { label: 'Phòng họp', color: '#fda4af' }, // Salmon pink
  medical: { label: 'Y tế', color: '#99f6e4' }, // Teal
  heritage: { label: 'Phòng truyền thống', color: '#fef08a' }, // Gold
  staff: { label: 'Phòng giáo viên', color: '#fed7aa' }, // Soft warm sand
  stair: { label: 'Cầu thang', color: '#cbd5e1' }, // Clean slate
  restroom: { label: 'Vệ sinh', color: '#bfdbfe' }, // Soft blue
  unknown: { label: 'Chưa xác định', color: '#e2e8f0' },
};

/** Stronger palette for SCHEMATIC mode. */
export const ROOM_TYPE_SCHEMATIC: Record<RoomType, string> = {
  classroom: '#9db5d6',
  'subject-office': '#b4a3d6',
  'science-lab': '#8fc2a8',
  'computer-lab': '#85b5d4',
  library: '#d8bd84',
  'admin-office': '#d3ae96',
  meeting: '#d69a9a',
  medical: '#87c4c4',
  heritage: '#d4b98a',
  staff: '#bdb6a3',
  stair: '#a9a6a0',
  restroom: '#9fc0d6',
  unknown: '#bdbdbd',
};
