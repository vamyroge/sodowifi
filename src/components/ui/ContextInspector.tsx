import { useState } from 'react';
import { useTwinStore } from '../../store/twin-store';
import { getSceneIndex } from '../../lib/3d/scene';
import { floorLabel } from '../../lib/3d/scene-index';
import { ROOM_TYPES } from '../../data/rooms/room-types';
import { NETWORK_TOPOLOGY } from '../../data/network/network-topology';

export function ContextInspector() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const selection = useTwinStore((s) => s.selection);
  const clearSelection = useTwinStore((s) => s.clearSelection);
  const selectRoom = useTwinStore((s) => s.selectRoom);
  const selectNetworkDevice = useTwinStore((s) => s.selectNetworkDevice);
  const floorFilter = useTwinStore((s) => s.floorFilter);
  const setFloorFilter = useTwinStore((s) => s.setFloorFilter);
  const isolatedBuildingId = useTwinStore((s) => s.isolatedBuildingId);
  const toggleIsolate = useTwinStore((s) => s.toggleIsolate);

  const sceneIndex = getSceneIndex();

  const selectedBuildingLayout = selection.buildingId ? sceneIndex.layoutById.get(selection.buildingId) : null;
  const selectedRoomEntry = selection.roomId ? sceneIndex.roomById.get(selection.roomId) : null;
  const selectedFacilityEntry = selection.facilityId ? sceneIndex.facilityById.get(selection.facilityId) : null;
  const selectedNetworkDevice = selection.networkDeviceId
    ? NETWORK_TOPOLOGY.devices.find((d) => d.id === selection.networkDeviceId)
    : null;

  const headerTitle = selectedNetworkDevice
    ? 'Thiết bị mạng'
    : selectedRoomEntry
      ? 'Chi tiết phòng'
      : selectedBuildingLayout
        ? 'Chi tiết tòa nhà'
        : selectedFacilityEntry
          ? 'Công trình'
          : 'Thông tin chung';

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-end rounded-2xl bg-white/85 dark:bg-zinc-900/85 backdrop-blur-2xl border border-zinc-200/70 dark:border-zinc-800/70 shadow-xl p-1.5 transition-all">
        <button
          onClick={() => setIsCollapsed(false)}
          title={`Mở bảng ${headerTitle}`}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-zinc-800 dark:text-zinc-100 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-zinc-800 dark:to-zinc-800 hover:from-emerald-100 hover:to-teal-100 transition-all shadow-sm border border-emerald-200/50 dark:border-zinc-700"
        >
          <span className="text-[10px] bg-emerald-600 text-white font-mono px-1.5 py-0.5 rounded-md mr-1 shadow-xs">
            ◀ Mở ra
          </span>
          <span className="text-sm">ℹ️</span>
          <span>{headerTitle}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 max-h-[calc(100vh-6.5rem)] flex flex-col rounded-2xl bg-white/85 dark:bg-zinc-900/85 backdrop-blur-2xl border border-zinc-200/70 dark:border-zinc-800/70 shadow-xl overflow-hidden transition-all text-xs">
      {/* Header with Title and explicit Thu gọn button */}
      <div className="px-3.5 py-2.5 border-b border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between bg-zinc-50/80 dark:bg-zinc-800/60">
        <div className="flex items-center gap-2">
          <span className="text-sm">ℹ️</span>
          <span className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-[11px]">
            {headerTitle}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsCollapsed(true)}
            title="Thu gọn bảng thông tin"
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/70 dark:hover:bg-zinc-700/70 transition-all border border-zinc-200/60 dark:border-zinc-700/60 shadow-xs"
          >
            <span>Thu gọn</span>
            <span className="text-[10px]">▶</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          {(selection.buildingId || selection.roomId || selection.facilityId || selection.networkDeviceId) && (
            <button
              onClick={() => {
                if (selection.networkDeviceId) {
                  selectNetworkDevice(null);
                } else {
                  clearSelection();
                }
              }}
              title="Bỏ chọn đối tượng"
              className="text-[10px] text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors px-1.5 py-0.5 rounded hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60"
            >
              Bỏ chọn ✕
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* NETWORK DEVICE DETAILS */}
        {selectedNetworkDevice && (
          <>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                {selectedNetworkDevice.type}
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-snug">
                {selectedNetworkDevice.label}
              </h3>
              <p className="text-zinc-500 font-mono text-[11px] mt-0.5">{selectedNetworkDevice.code}</p>
            </div>

            <div className="space-y-2 py-2 border-y border-zinc-200/50 dark:border-zinc-800/50">
              <div className="flex justify-between">
                <span className="text-zinc-400">Tòa nhà:</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {sceneIndex.layoutById.get(selectedNetworkDevice.location.buildingId)?.building.name ||
                    selectedNetworkDevice.location.buildingId}
                </span>
              </div>
              {selectedNetworkDevice.location.roomId && (
                <div className="flex justify-between">
                  <span className="text-zinc-400">Vị trí phòng:</span>
                  <button
                    onClick={() => selectRoom(selectedNetworkDevice.location.roomId!)}
                    className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {sceneIndex.roomById.get(selectedNetworkDevice.location.roomId)?.room.name ||
                      selectedNetworkDevice.location.roomId}
                  </button>
                </div>
              )}
              {selectedNetworkDevice.metadata?.ports && (
                <div className="flex justify-between">
                  <span className="text-zinc-400">Số cổng (Ports):</span>
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    {selectedNetworkDevice.metadata.ports} ports
                  </span>
                </div>
              )}
              {selectedNetworkDevice.metadata?.pcCount && (
                <div className="flex justify-between">
                  <span className="text-zinc-400">Số máy trạm:</span>
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">
                    {selectedNetworkDevice.metadata.pcCount} máy
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-zinc-400">Kết nối liên kết:</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {selectedNetworkDevice.connectedDeviceIds.length} thiết bị
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Nguồn trích xuất:</span>
                <span className="font-mono text-[10px] text-zinc-600 dark:text-zinc-400">
                  {selectedNetworkDevice.provenance.sourceReferences[0]?.image}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Độ tin cậy:</span>
                <span className="font-semibold text-emerald-600 capitalize">
                  {selectedNetworkDevice.provenance.confidence} (100% khớp)
                </span>
              </div>
            </div>

            {selectedNetworkDevice.metadata?.notes && (
              <div className="p-2.5 rounded-lg bg-zinc-100/70 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-300 text-[11px]">
                <strong>Ghi chú:</strong> {selectedNetworkDevice.metadata.notes}
              </div>
            )}

            {/* List connected devices */}
            <div>
              <div className="font-medium text-zinc-900 dark:text-zinc-100 text-[11px] mb-1.5">
                Thiết bị liên kết trực tiếp:
              </div>
              <div className="space-y-1">
                {selectedNetworkDevice.connectedDeviceIds.map((targetId) => {
                  const target = NETWORK_TOPOLOGY.devices.find((d) => d.id === targetId);
                  if (!target) return null;
                  return (
                    <button
                      key={targetId}
                      onClick={() => selectNetworkDevice(targetId)}
                      className="w-full text-left p-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-between text-[11px] transition-colors"
                    >
                      <span className="font-medium text-zinc-700 dark:text-zinc-300 truncate">
                        {target.label}
                      </span>
                      <span className="text-[10px] text-zinc-400 uppercase font-mono ml-2">
                        {target.type}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
        {/* ROOM DETAILS */}
        {!selectedNetworkDevice && selectedRoomEntry && (
          <>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {selectedRoomEntry.room.name}
              </h3>
              <p className="text-zinc-500 mt-0.5">
                {ROOM_TYPES[selectedRoomEntry.room.type]?.label || selectedRoomEntry.room.type}
              </p>
            </div>

            <div className="space-y-2 py-2 border-y border-zinc-200/50 dark:border-zinc-800/50">
              <div className="flex justify-between">
                <span className="text-zinc-400">Thuộc dãy:</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">{selectedRoomEntry.building.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Tầng:</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {floorLabel(selectedRoomEntry.floor.level)} ({selectedRoomEntry.floor.sourceLabel})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Mã định danh (ID):</span>
                <span className="font-mono text-[11px] text-zinc-600 dark:text-zinc-300">
                  {selectedRoomEntry.room.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Độ tin cậy:</span>
                <span
                  className={`font-semibold capitalize ${
                    selectedRoomEntry.room.provenance.confidence === 'high'
                      ? 'text-emerald-600'
                      : 'text-amber-600'
                  }`}
                >
                  {selectedRoomEntry.room.provenance.confidence}
                </span>
              </div>
            </div>

            {selectedRoomEntry.room.notes && (
              <div className="p-2.5 rounded-lg bg-zinc-100/70 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-300 text-[11px]">
                <strong>Ghi chú:</strong> {selectedRoomEntry.room.notes}
              </div>
            )}
          </>
        )}

        {/* BUILDING DETAILS (when device and room are NOT selected) */}
        {!selectedNetworkDevice && !selectedRoomEntry && selectedBuildingLayout && (
          <>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  {selectedBuildingLayout.building.code}
                </span>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {selectedBuildingLayout.building.name}
                </h3>
              </div>
              <p className="text-zinc-500 mt-1.5 leading-relaxed text-[11px]">
                {selectedBuildingLayout.building.description}
              </p>
            </div>

            {/* Quick action: isolate building */}
            <div className="flex gap-2">
              <button
                onClick={() => toggleIsolate(selectedBuildingLayout.building.id)}
                className={`flex-1 py-1.5 px-3 rounded-lg font-medium text-[11px] transition-all border ${
                  isolatedBuildingId === selectedBuildingLayout.building.id
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border-zinc-200/60 dark:border-zinc-700/60 hover:border-blue-400'
                }`}
              >
                {isolatedBuildingId === selectedBuildingLayout.building.id ? 'Hủy cô lập tòa' : 'Cô lập tòa nhà'}
              </button>
            </div>

            {/* Dimensions & Specs */}
            <div className="space-y-2 py-2 border-y border-zinc-200/50 dark:border-zinc-800/50">
              <div className="flex justify-between">
                <span className="text-zinc-400">Số tầng:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {selectedBuildingLayout.floors.length} tầng
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Kích thước (ước lượng):</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {Math.round(selectedBuildingLayout.bounds.w)}m × {Math.round(selectedBuildingLayout.bounds.d)}m ×{' '}
                  {selectedBuildingLayout.structureHeight.toFixed(1)}m
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Hành lang:</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  Rộng 2.4m ({selectedBuildingLayout.building.corridor.side})
                </span>
              </div>
            </div>

            {/* Room list grouped by floor */}
            <div className="space-y-3">
              <span className="font-semibold text-zinc-400 uppercase tracking-wider text-[10px]">
                Các phòng theo tầng
              </span>
              {selectedBuildingLayout.floors.map((fl) => (
                <div key={fl.floor.id} className="space-y-1">
                  <div className="font-medium text-zinc-700 dark:text-zinc-300 text-[11px] flex justify-between">
                    <span>
                      {floorLabel(fl.level)} ({fl.floor.sourceLabel})
                    </span>
                    <button
                      onClick={() => setFloorFilter(fl.level)}
                      className={`text-[10px] ${
                        floorFilter === fl.level ? 'text-blue-600 font-bold' : 'text-zinc-400 hover:text-blue-500'
                      }`}
                    >
                      {floorFilter === fl.level ? 'Đang chọn' : 'Lọc tầng'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {fl.rooms.map((r) => (
                      <button
                        key={r.room.id}
                        onClick={() => selectRoom(r.room.id)}
                        className="px-2 py-1 rounded bg-zinc-100/70 dark:bg-zinc-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-left truncate transition-colors text-[11px]"
                      >
                        {r.room.name}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* FACILITY DETAILS */}
        {!selectedRoomEntry && !selectedBuildingLayout && selectedFacilityEntry && (
          <>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                {selectedFacilityEntry.facility.name}
              </h3>
              <p className="text-zinc-500 mt-0.5 capitalize">{selectedFacilityEntry.facility.kind}</p>
            </div>

            <div className="space-y-2 py-2 border-y border-zinc-200/50 dark:border-zinc-800/50">
              <div className="flex justify-between">
                <span className="text-zinc-400">Kích thước:</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {Math.round(selectedFacilityEntry.bounds.w)}m × {Math.round(selectedFacilityEntry.bounds.d)}m
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Chiều cao:</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {selectedFacilityEntry.facility.heightM}m{' '}
                  {selectedFacilityEntry.facility.provenance.estimated ? '(ước lượng)' : ''}
                </span>
              </div>
            </div>

            {selectedFacilityEntry.facility.provenance.notes && (
              <div className="p-2.5 rounded-lg bg-zinc-100/70 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-300 text-[11px]">
                <strong>Căn cứ:</strong> {selectedFacilityEntry.facility.provenance.notes}
              </div>
            )}
          </>
        )}

        {/* DEFAULT OVERVIEW */}
        {!selectedNetworkDevice && !selectedRoomEntry && !selectedBuildingLayout && !selectedFacilityEntry && (
          <div className="space-y-4 text-zinc-600 dark:text-zinc-400">
            <div>
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">Hướng dẫn tương tác 3D</h4>
              <p className="mt-1 leading-relaxed text-[11px]">
                Bấm vào một tòa nhà hoặc phòng học trên mô hình để phóng to và xem thông số kỹ thuật.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-zinc-100/60 dark:bg-zinc-800/40 space-y-2 text-[11px]">
              <div className="font-medium text-zinc-900 dark:text-zinc-100">Thao tác chuột:</div>
              <ul className="space-y-1 list-disc list-inside text-zinc-500 dark:text-zinc-400">
                <li>Chuột trái: Xoay camera</li>
                <li>Chuột phải: Kéo di chuyển (Pan)</li>
                <li>Cuộn chuột: Phóng to / Thu nhỏ</li>
                <li>Click phòng: Chọn và bay camera tới</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
