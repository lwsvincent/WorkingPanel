import React, { useState, useMemo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import type { Task } from '../types/task';
import { useTasks } from '../contexts/TaskContext';
import { getDeadlineStatus, getDeadlineText } from '../utils/date';
import { TaskForm } from './TaskForm';

interface TaskCardProps {
  task: Task;
  cardColor?: string;
}

const TaskCardBase: React.FC<{
  task: Task;
  cardColor?: string;
  style?: React.CSSProperties;
  attributes?: any;
  listeners?: any;
  setNodeRef?: (node: HTMLElement | null) => void;
  isOverlay?: boolean;
}> = React.memo(({ task, cardColor, style, attributes, listeners, setNodeRef, isOverlay }) => {
  const { dispatch } = useTasks();
  const [showEditForm, setShowEditForm] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const deadlineStatus = getDeadlineStatus(task.deadline);

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOverlay) {
      dispatch({ type: 'TOGGLE_COMPLETE', payload: task.id });
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOverlay) {
      if (confirm('確定要刪除這個任務嗎?')) {
        dispatch({ type: 'DELETE_TASK', payload: task.id });
      }
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOverlay) {
      setShowEditForm(true);
    }
  };

  const getBorderColor = () => {
    if (deadlineStatus === 'overdue') return 'border-l-4 border-l-red-500';
    if (deadlineStatus === 'today') return 'border-l-4 border-l-orange-500';
    return '';
  };

  const getTagColor = (tag: string) => {
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 85%)`;
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`w-40 ${cardColor || 'bg-white'} border border-gray-200/50 rounded-xl shadow-sm ${isOverlay ? 'shadow-xl cursor-grabbing' : 'hover:shadow-lg hover:scale-[1.02] cursor-move'
          } transition-all duration-200 backdrop-blur-sm ${getBorderColor()}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDoubleClick={handleDoubleClick}
        {...listeners}
        {...attributes}
      >
        {/* Compact Header - 標題與標籤 */}
        <div className="p-2">
          <div className="flex items-start justify-between gap-1">
            <input
              type="checkbox"
              checked={task.isCompleted}
              onChange={() => { }}
              onClick={handleToggleComplete}
              className={`mt-0.5 flex-shrink-0 ${isOverlay ? '' : 'cursor-pointer'}`}
              readOnly={isOverlay}
            />
            <h3
              className={`flex-1 text-xs font-semibold text-gray-800 line-clamp-2 ${task.isCompleted ? 'line-through text-gray-500' : ''
                }`}
            >
              {task.title}
            </h3>
            {/* 刪除按鈕 - 垃圾桶圖示 */}
            <button
              className={`text-gray-400 flex-shrink-0 ${isOverlay ? '' : 'hover:text-red-500 transition-colors'
                }`}
              onClick={handleDelete}
              title="刪除任務"
              disabled={isOverlay}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>

          {/* Deadline 指示器 - 總是顯示 */}
          {task.deadline && (
            <div
              className={`text-[10px] flex items-center gap-0.5 mt-1 ${deadlineStatus === 'overdue'
                ? 'text-red-600 font-semibold'
                : deadlineStatus === 'today'
                  ? 'text-orange-600 font-semibold'
                  : 'text-gray-500'
                }`}
            >
              <span>📅</span>
              <span>{getDeadlineText(task.deadline)}</span>
            </div>
          )}
        </div>

        {/* Hover 時顯示標籤和內容 */}
        {(isHovered || isOverlay) && (
          <div className="px-2 pb-2 border-t border-gray-200/50 pt-1.5 space-y-1.5">
            {/* Tags */}
            {task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {task.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-[10px] px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: getTagColor(tag) }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {/* Content */}
            {task.content && (
              <p className="text-[10px] text-gray-600 line-clamp-3">{task.content}</p>
            )}
          </div>
        )}
      </div>

      {/* Edit Form Modal */}
      {showEditForm && !isOverlay && (
        <TaskForm task={task} onClose={() => setShowEditForm(false)} />
      )}
    </>
  );
});

export const TaskCard: React.FC<TaskCardProps> = ({ task, cardColor }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
  });

  const style = useMemo(() => ({
    // 當拖曳時，原位置的卡片只改變透明度，不改變位置（因為有 Overlay 跟隨滑鼠）
    // CSS.Translate.toString(transform) 在這裡移除，讓原卡片留在原地
    position: 'absolute' as const,
    left: `${task.position.x}%`,
    top: `${task.position.y}%`,
    opacity: isDragging ? 0.3 : 1,
    zIndex: 1, // 原卡片層級較低
  }), [task.position.x, task.position.y, isDragging]);

  return (
    <TaskCardBase
      task={task}
      cardColor={cardColor}
      style={style}
      attributes={attributes}
      listeners={listeners}
      setNodeRef={setNodeRef}
    />
  );
};

export const TaskCardOverlay: React.FC<TaskCardProps> = ({ task, cardColor }) => {
  return (
    <TaskCardBase
      task={task}
      cardColor={cardColor}
      isOverlay={true}
    />
  );
};
