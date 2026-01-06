import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { Task } from '../types/task';
import { TaskCard } from './TaskCard';

interface CompletedAreaProps {
  tasks: Task[];
}

export const CompletedArea: React.FC<CompletedAreaProps> = ({ tasks }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { setNodeRef, isOver } = useDroppable({
    id: 'completed',
  });

  return (
    <div className="border-2 border-gray-300 rounded-lg bg-gray-50 h-full flex flex-col overflow-hidden">
      {/* Header - 精簡 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-100 transition-colors flex-shrink-0"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">{isExpanded ? '▼' : '▶'}</span>
          <div className="text-left">
            <span className="text-sm font-bold text-gray-700">已完成</span>
            <span className="text-xs text-gray-500 ml-2">
              ({tasks.length} 個任務)
            </span>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          {isExpanded ? '收起' : '展開'}
        </div>
      </button>

      {/* Content */}
      {isExpanded && (
        <div
          ref={setNodeRef}
          className={`flex-1 min-h-0 overflow-auto px-3 pb-2 relative ${
            isOver ? 'bg-blue-50' : ''
          }`}
        >
          {tasks.length === 0 ? (
            <div className="text-center py-4 text-gray-400 text-sm">
              尚無已完成的任務
            </div>
          ) : (
            <div className="relative min-h-[100px]">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
