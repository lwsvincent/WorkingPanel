import React, { useRef } from 'react';
import { useTasks } from '../contexts/TaskContext';
import { exportTasks, importTasks } from '../utils/storage';

export const FilterBar: React.FC = () => {
  const { state, dispatch } = useTasks();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 獲取所有唯一標籤
  const allTags = Array.from(new Set(state.tasks.flatMap((task) => task.tags)));

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
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Title */}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">艾森豪工作流</h1>
            <p className="text-sm text-gray-600">Eisenhower Workflow Manager</p>
          </div>

          {/* Middle: Tag Filters */}
          <div className="flex-1 flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">標籤篩選:</span>
            {allTags.length === 0 ? (
              <span className="text-sm text-gray-400">尚無標籤</span>
            ) : (
              allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${state.filters.tags.includes(tag)
                      ? 'ring-2 ring-blue-500 font-semibold'
                      : 'opacity-60 hover:opacity-100'
                    }`}
                  style={{ backgroundColor: getTagColor(tag) }}
                >
                  {tag}
                </button>
              ))
            )}
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-3">
            {/* Show Completed Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={state.filters.showCompleted}
                onChange={() => dispatch({ type: 'TOGGLE_SHOW_COMPLETED' })}
                className="cursor-pointer"
              />
              <span className="text-sm text-gray-700">顯示已完成</span>
            </label>

            {/* Import/Export */}
            <div className="flex gap-2">
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
        </div>
      </div>
    </div>
  );
};
