import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { QuadrantType, Task } from '../types/task';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';

interface QuadrantProps {
  type: QuadrantType;
  title: string;
  subtitle: string;
  tasks: Task[];
  borderColor: string;
  bgColor: string;
  cardColor: string;
}

export const Quadrant: React.FC<QuadrantProps> = ({
  type,
  title,
  subtitle,
  tasks,
  borderColor,
  bgColor,
  cardColor,
}) => {
  const [showForm, setShowForm] = useState(false);
  const { setNodeRef, isOver } = useDroppable({
    id: type,
  });

  return (
    <div
      ref={setNodeRef}
      className={`relative border-2 rounded-xl p-3 overflow-hidden flex flex-col transition-all duration-200 ${borderColor} ${isOver ? 'ring-2 ring-blue-400 ring-offset-2' : ''
        } ${bgColor}`}
    >
      {/* Header - 精簡版 */}
      <div className={`mb-2 pb-1.5 border-b-2 ${borderColor} flex-shrink-0`}>
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-gray-800">{title}</h2>
            <p className="text-xs text-gray-600">{subtitle}</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="w-6 h-6 rounded-full bg-blue-500 text-white hover:bg-blue-600 flex items-center justify-center text-lg font-bold transition-colors"
            title="新增任務"
          >
            +
          </button>
        </div>
      </div>

      {/* Task Container - 自適應並可滾動，雙擊可新增任務 */}
      <div
        className="relative flex-1 min-h-0 overflow-auto cursor-pointer"
        onDoubleClick={(e) => {
          // 只有雙擊空白區域才新增，避免與任務卡雙擊編輯衝突
          if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('min-h-[150px]')) {
            setShowForm(true);
          }
        }}
        title="雙擊新增任務"
      >
        <div className="relative h-full min-h-[150px]">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} cardColor={cardColor} />
          ))}
        </div>
      </div>

      {/* Task Form Modal */}
      {showForm && (
        <TaskForm
          quadrant={type}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};
