import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Task, QuadrantType } from '../types/task';
import { useTasks } from '../contexts/TaskContext';
import { TagInput } from './TagInput';

interface TaskFormProps {
  task?: Task;
  quadrant?: QuadrantType;
  onClose: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({ task, quadrant, onClose }) => {
  const { dispatch, state } = useTasks();
  const [title, setTitle] = useState(task?.title || '');
  const [content, setContent] = useState(task?.content || '');
  const [tags, setTags] = useState<string[]>(task?.tags || []);
  const [deadline, setDeadline] = useState(task?.deadline || '');

  // 獲取所有已存在的標籤
  const existingTags = Array.from(
    new Set(state.tasks.flatMap((t) => t.tags))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('請輸入任務標題');
      return;
    }

    if (task) {
      // 更新現有任務
      dispatch({
        type: 'UPDATE_TASK',
        payload: {
          ...task,
          title: title.trim(),
          content: content.trim(),
          tags,
          deadline: deadline || undefined,
        },
      });
    } else {
      // 建立新任務
      const newTask: Task = {
        id: uuidv4(),
        title: title.trim(),
        content: content.trim(),
        tags,
        createdAt: new Date().toISOString(),
        deadline: deadline || undefined,
        quadrant: quadrant || 'urgent-important',
        position: { x: 25, y: 25 }, // 預設位置
        isCompleted: false,
      };
      dispatch({ type: 'ADD_TASK', payload: newTask });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h2 className="text-2xl font-bold mb-4">
          {task ? '編輯任務' : '新增任務'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 標題 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              標題 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="輸入任務標題..."
              autoFocus
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {title.length}/100
            </div>
          </div>

          {/* 內容 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              內容描述
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={500}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="輸入任務詳細內容..."
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {content.length}/500
            </div>
          </div>

          {/* 標籤 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              標籤
            </label>
            <TagInput
              tags={tags}
              onChange={setTags}
              suggestions={existingTags}
            />
          </div>

          {/* 截止日期 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              截止日期
            </label>
            <input
              type="date"
              value={deadline ? deadline.split('T')[0] : ''}
              onChange={(e) => setDeadline(e.target.value ? new Date(e.target.value).toISOString() : '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* 按鈕 */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              {task ? '更新' : '建立'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
