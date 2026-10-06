import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTwinStore } from '../../store/twin-store';
import { getSceneIndex } from '../../lib/3d/scene';
import { NETWORK_TOPOLOGY } from '../../data/network/network-topology';
import { ROOM_TYPES } from '../../data/rooms/room-types';

interface SearchItem {
  id: string;
  title: string;
  category: 'Phòng học' | 'Tòa nhà & Khuôn viên' | 'Thiết bị mạng' | 'Tiện ích';
  icon: string;
  sub: string;
  action: () => void;
}

export function QuickSearchModal() {
  const showSearchModal = useTwinStore((s) => s.showSearchModal);
  const toggleSearchModal = useTwinStore((s) => s.toggleSearchModal);
  const selectRoom = useTwinStore((s) => s.selectRoom);
  const selectBuilding = useTwinStore((s) => s.selectBuilding);
  const selectFacility = useTwinStore((s) => s.selectFacility);
  const selectNetworkDevice = useTwinStore((s) => s.selectNetworkDevice);
  const setCameraMode = useTwinStore((s) => s.setCameraMode);

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (showSearchModal) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [showSearchModal]);

  // Xây dựng danh mục tìm kiếm toàn diện từ dữ liệu trường
  const searchIndex: SearchItem[] = useMemo(() => {
    const items: SearchItem[] = [];
    const sceneIndex = getSceneIndex();

    // 1. Tòa nhà chính
    for (const b of sceneIndex.school.buildings) {
      items.push({
        id: `building-${b.id}`,
        title: b.name,
        category: 'Tòa nhà & Khuôn viên',
        icon: '🏢',
        sub: `${b.floors.length} tầng lầu · Dãy công trình trường học`,
        action: () => {
          selectBuilding(b.id);
          setCameraMode('building');
        },
      });
    }

    // 2. Các phòng học & phòng chức năng
    for (const [, roomEntry] of sceneIndex.roomById) {
      const { room, building, floor } = roomEntry;
      const typeLabel = ROOM_TYPES[room.type]?.label || room.type;
      items.push({
        id: `room-${room.id}`,
        title: room.name,
        category: 'Phòng học',
        icon: room.type === 'computer-lab' ? '💻' : room.type === 'meeting' ? '👥' : '📖',
        sub: `${typeLabel} · ${building.name} (Tầng ${floor.level + 1})`,
        action: () => {
          selectRoom(room.id);
          setCameraMode('room');
        },
      });
    }

    // 3. Tiện ích khuôn viên (Sân khấu, Hồ bơi, Cổng...)
    for (const fac of sceneIndex.school.facilities) {
      items.push({
        id: `facility-${fac.id}`,
        title: fac.name,
        category: 'Tiện ích',
        icon: fac.kind === 'swimming-pool' ? '🏊' : fac.kind === 'stage' ? '🎭' : fac.kind === 'flagpole' ? '🚩' : '📍',
        sub: `Khuôn viên ngoài trời THPT Số 1 Tư Nghĩa`,
        action: () => {
          selectFacility(fac.id);
          setCameraMode('facility');
        },
      });
    }

    // 4. Thiết bị mạng (Gateway, Router, Switch, WAP)
    for (const dev of NETWORK_TOPOLOGY.devices) {
      items.push({
        id: `dev-${dev.id}`,
        title: `${dev.label} (${dev.code})`,
        category: 'Thiết bị mạng',
        icon: dev.type === 'gateway' ? '🌐' : dev.type === 'router' ? '📡' : dev.type === 'switch' ? '🔀' : dev.type === 'access-point' ? '📶' : '🖥️',
        sub: dev.metadata?.notes || `Thiết bị mạng hạ tầng`,
        action: () => {
          selectNetworkDevice(dev.id);
        },
      });
    }

    return items;
  }, [selectRoom, selectBuilding, selectFacility, selectNetworkDevice, setCameraMode]);

  // Bộ lọc tìm kiếm nhanh không dấu & có dấu
  const filtered = useMemo(() => {
    if (!query.trim()) {
      return searchIndex.slice(0, 8); // Gợi ý mặc định
    }
    const q = query.toLowerCase().trim();
    return searchIndex
      .filter((item) => item.title.toLowerCase().includes(q) || item.sub.toLowerCase().includes(q))
      .slice(0, 10);
  }, [searchIndex, query]);

  // Điều khiển bàn phím (Mũi tên lên/xuống, Enter, Escape)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
        toggleSearchModal(false);
      }
    } else if (e.key === 'Escape') {
      toggleSearchModal(false);
    }
  };

  if (!showSearchModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={() => toggleSearchModal(false)}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl overflow-hidden flex flex-col text-zinc-900 dark:text-zinc-100 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-200/80 dark:border-zinc-800/80">
          <span className="text-lg text-zinc-400">🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Tìm phòng học, phòng máy, router, switch, dãy nhà..."
            className="w-full bg-transparent text-sm sm:text-base font-medium outline-hidden placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 sm:max-h-96 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-zinc-500">
              Không tìm thấy phòng hoặc thiết bị phù hợp với &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => {
                  item.action();
                  toggleSearchModal(false);
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                  selectedIndex === idx
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-800 dark:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xl shrink-0">{item.icon}</span>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-semibold truncate">{item.title}</div>
                    <div
                      className={`text-[11px] truncate ${
                        selectedIndex === idx ? 'text-blue-100' : 'text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      {item.sub}
                    </div>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-md shrink-0 ml-2 ${
                    selectedIndex === idx
                      ? 'bg-blue-500/80 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  {item.category}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="flex items-center justify-between px-4 py-2.5 text-[11px] text-zinc-500 bg-zinc-50/80 dark:bg-zinc-950/50 border-t border-zinc-200/60 dark:border-zinc-800/60">
          <div className="flex items-center gap-3">
            <span>↑↓ để chuyển</span>
            <span>↵ để chọn & bay tới</span>
          </div>
          <span>THPT Số 1 Tư Nghĩa 3D</span>
        </div>
      </div>
    </div>
  );
}
