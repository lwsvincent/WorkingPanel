import React, { useRef } from 'react';
import { useTasks } from '../contexts/TaskContext';
import { exportTasks, importTasks } from '../utils/storage';
import { AuthButton } from './AuthButton';
import { useUI } from '../contexts/UIContext';

export const FilterBar: React.FC = () => {
  const { state, dispatch, syncStatus, error } = useTasks();
  const { zoomLevel, setZoomLevel } = useUI();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 獲取所有唯一標籤
  const allTags = Array.from(new Set(state.tasks.flatMap((task) => task.tags)));

  const getSyncStatusDisplay = () => {
    switch (syncStatus) {
      case 'syncing':
        return (
          <span className="flex items-center gap-1 text-xs text-blue-600">
            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            同步中...
          </span>
        );
      case 'saved':
        return (
          <span className="flex items-center gap-1 text-xs text-green-600">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            已儲存
          </span>
        );
      case 'error':
        return (
          <div className="group relative flex items-center gap-1 text-xs text-red-600 cursor-help">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>同步失敗</span>
            {error && (
              <div className="absolute right-0 top-full mt-1 w-48 p-2 bg-red-100 text-red-800 text-xs rounded shadow-lg z-50 hidden group-hover:block">
                {error}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  const getTagColor = (tag: string) => {
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 85%)`;
  };

  const handleTagToggle = (tag: string) => {
    const newTags = state.filters.tags.includes(tag)
      ? state.filters.tags.filter((t) => t !== tag)
      : [...state.filters.tags, tag];
    dispatch({ type: 'SET_FILTER_TAGS', payload: newTags });
  };

  const handleExport = () => {
    exportTasks(state.tasks);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const tasks = await importTasks(file);
      const confirmMessage = `即將匯入 ${tasks.length} 個任務。\n\n選擇「確定」覆蓋現有任務\n選擇「取消」合併任務`;

      if (confirm(confirmMessage)) {
        // 覆蓋模式
        dispatch({ type: 'IMPORT_TASKS', payload: tasks });
      } else {
        // 合併模式 - 添加所有匯入的任務
        tasks.forEach((task) => {
          dispatch({ type: 'ADD_TASK', payload: task });
        });
      }

      // 重置 file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      alert('匯入失敗: ' + (error as Error).message);
    }
  };

  return (
    <div className="bg-white border-b border-gray-300 p-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col gap-4">
        {/* Top Row: Title & Global Actions */}
        <div className="flex items-center justify-between">
          {/* Left: Title */}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">艾森豪工作流</h1>
            <p className="text-sm text-gray-600">Eisenhower Workflow Manager</p>
          </div>

          {/* Right: Global Actions (Sync, Auth, Import/Export) */}
          <div className="flex items-center gap-4">
            {getSyncStatusDisplay()}
            <AuthButton />

            <div className="h-6 w-px bg-gray-300 mx-2" /> {/* Divider */}

            <button
              onClick={handleImportClick}
              className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              匯入
            </button>
            <button
              onClick={handleExport}
              className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              匯出
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>
        </div>

        {/* Bottom Row: Filters & View Options */}
        <div className="flex items-center justify-between gap-4">
          {/* Left: Tag Filters (Scrollable if needed, or wrap) */}
          <div className="flex-1 flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700 shrink-0">標籤篩選:</span>
            {allTags.length === 0 ? (
              <span className="text-sm text-gray-400">尚無標籤</span>
            ) : (
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-0.5 rounded-full text-xs transition-all ${state.filters.tags.includes(tag)
                      ? 'ring-2 ring-blue-500 font-semibold'
                      : 'opacity-60 hover:opacity-100'
                      }`}
                    style={{ backgroundColor: getTagColor(tag) }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Zoom & View Settings */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Zoom Controls */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1" title="調整介面大小">
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="range"
                min="50"
                max="150"
                step="5"
                value={zoomLevel}
                onChange={(e) => setZoomLevel(Number(e.target.value))}
                className="w-24 h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700"
              />
              <div
                className="text-xs font-mono w-10 text-right text-gray-600 cursor-pointer hover:bg-gray-200 rounded px-1"
                onClick={() => setZoomLevel(100)}
                title="點擊重置為 100%"
              >
                {zoomLevel}%
              </div>
            </div>

            {/* Show Completed Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={state.filters.showCompleted}
                onChange={() => dispatch({ type: 'TOGGLE_SHOW_COMPLETED' })}
                className="cursor-pointer"
              />
              <span className="text-sm text-gray-700">顯示已完成</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
