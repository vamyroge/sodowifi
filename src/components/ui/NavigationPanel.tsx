import { useState } from 'react';
import { useTwinStore } from '../../store/twin-store';
import { getSceneIndex } from '../../lib/3d/scene';

export function NavigationPanel() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sceneIndex = getSceneIndex();
  const school = sceneIndex.school;
  const navSection = useTwinStore((s) => s.navSection);
  const setNavSection = useTwinStore((s) => s.setNavSection);
  const selection = useTwinStore((s) => s.selection);
  const selectBuilding = useTwinStore((s) => s.selectBuilding);
  const selectFacility = useTwinStore((s) => s.selectFacility);
  const clearSelection = useTwinStore((s) => s.clearSelection);
  const resetCamera = useTwinStore((s) => s.resetCamera);

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-start rounded-2xl bg-white/85 dark:bg-zinc-900/85 backdrop-blur-2xl border border-zinc-200/70 dark:border-zinc-800/70 shadow-xl p-1.5 transition-all">
        <button
          onClick={() => setIsCollapsed(false)}
          title="Mở bảng Tòa Nhà · Khuôn Viên · Tổng Quan"
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-zinc-800 dark:text-zinc-100 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-zinc-800 dark:to-zinc-800 hover:from-blue-100 hover:to-indigo-100 transition-all shadow-sm border border-blue-200/50 dark:border-zinc-700"
        >
          <span className="text-sm">🏢</span>
          <span>Tòa Nhà · Khuôn Viên</span>
          <span className="text-[10px] bg-blue-600 text-white font-mono px-1.5 py-0.5 rounded-md ml-1 shadow-xs">
            Mở ra ▶
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-68 max-h-[calc(100vh-6.5rem)] flex flex-col rounded-2xl bg-white/85 dark:bg-zinc-900/85 backdrop-blur-2xl border border-zinc-200/70 dark:border-zinc-800/70 shadow-xl overflow-hidden transition-all">
      {/* Header with Title and explicit Thu gọn button */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/80 dark:bg-zinc-800/60">
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
          <span>🏛️</span>
          <span>Sơ đồ danh mục</span>
        </span>
        <button
          onClick={() => setIsCollapsed(true)}
          title="Thu gọn bảng danh mục (Tòa nhà / Khuôn viên / Tổng quan)"
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/70 dark:hover:bg-zinc-700/70 transition-all border border-zinc-200/60 dark:border-zinc-700/60 shadow-xs"
        >
          <span>Thu gọn</span>
          <span className="text-[10px]">◀</span>
        </button>
      </div>

      {/* Tab Switcher: Tòa nhà / Khuôn viên / Tổng quan */}
      <div className="flex border-b border-zinc-200/50 dark:border-zinc-800/50 p-1.5 gap-1 bg-zinc-100/50 dark:bg-zinc-800/30">
        {(['buildings', 'campus', 'overview'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setNavSection(tab)}
            className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg capitalize transition-all ${
              navSection === tab
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25 ring-1 ring-blue-400/30'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-700/60'
            }`}
          >
            {tab === 'buildings' ? 'Tòa nhà' : tab === 'campus' ? 'Khuôn viên' : 'Tổng quan'}
          </button>
        ))}
      </div>

      {/* Content list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 text-xs">
        {navSection === 'buildings' && (
          <>
            <div className="px-2 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
              Danh sách khối nhà ({school.buildings.length})
            </div>
            {school.buildings.map((b) => {
              const isSelected = selection.buildingId === b.id;
              const bLayout = sceneIndex.layoutById.get(b.id);
              const roomCount = bLayout?.floors.reduce((acc, f) => acc + f.rooms.length, 0) || 0;

              return (
                <button
                  key={b.id}
                  onClick={() => selectBuilding(b.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-medium'
                      : 'hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="truncate pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">{b.code}</span>
                      <span className="text-zinc-400">•</span>
                      <span className="truncate">{b.name.replace(/Dãy [A-Z·]+ · /, '')}</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                      {b.floors.length} tầng · {roomCount} phòng
                    </div>
                  </div>
                  <div
                    className={`w-1.5 h-1.5 rounded-full transition-opacity ${
                      isSelected ? 'bg-blue-600 opacity-100' : 'bg-zinc-300 opacity-0 group-hover:opacity-100'
                    }`}
                  />
                </button>
              );
            })}
          </>
        )}

        {navSection === 'campus' && (
          <>
            <div className="px-2 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
              Công trình ngoài trời ({school.facilities.length})
            </div>
            {school.facilities.map((f) => {
              const isSelected = selection.facilityId === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => selectFacility(f.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-medium'
                      : 'hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="truncate">
                    <div className="font-medium text-zinc-800 dark:text-zinc-200">{f.name}</div>
                    <div className="text-[10px] text-zinc-400">
                      {f.provenance.estimated ? 'Ước lượng' : 'Theo sơ đồ'}
                    </div>
                  </div>
                  <div
                    className={`w-1.5 h-1.5 rounded-full transition-opacity ${
                      isSelected ? 'bg-blue-600 opacity-100' : 'bg-zinc-300 opacity-0 group-hover:opacity-100'
                    }`}
                  />
                </button>
              );
            })}
          </>
        )}

        {navSection === 'overview' && (
          <div className="p-3 space-y-3 text-zinc-600 dark:text-zinc-400">
            <div>
              <div className="text-[11px] font-semibold text-zinc-900 dark:text-zinc-100">Bản đồ số trường</div>
              <p className="text-[11px] leading-relaxed mt-1">
                Dữ liệu được số hóa chuẩn xác từ mặt bằng <strong>sodotruong.jpg</strong>.
              </p>
            </div>
            <div className="pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50 space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span>Tổng khối nhà:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{school.buildings.length}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>Tổng phòng & khoang:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{sceneIndex.roomById.size}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>Khuôn viên:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {Math.round(sceneIndex.campusBounds.w)}m × {Math.round(sceneIndex.campusBounds.d)}m
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                clearSelection();
                resetCamera();
              }}
              className="w-full py-1.5 px-3 mt-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 font-medium text-[11px] transition-all"
            >
              Toàn cảnh khuôn viên
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
