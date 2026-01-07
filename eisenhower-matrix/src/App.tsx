import React, { useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useTasks } from './contexts/TaskContext';
import { useUI } from './contexts/UIContext';
import type { QuadrantType, Task } from './types/task';
import { Quadrant } from './components/Quadrant';
import { CompletedArea } from './components/CompletedArea';
import { FilterBar } from './components/FilterBar';
import { TaskCardOverlay } from './components/TaskCard';

function App() {
  const { state, dispatch } = useTasks();
  const { zoomLevel } = useUI();
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  // 篩選任務
  const filteredTasks = useMemo(() => {
    return state.tasks.filter((task) => {
      // 標籤篩選
      if (state.filters.tags.length > 0) {
        const hasMatchingTag = task.tags.some((tag) =>
          state.filters.tags.includes(tag)
        );
        if (!hasMatchingTag && task.tags.length > 0) {
          return false;
        }
      }
      return true;
    });
  }, [state.tasks, state.filters.tags]);

  // 按象限分組任務
  const tasksByQuadrant = useMemo(() => {
    const grouped: Record<QuadrantType, Task[]> = {
      'urgent-important': [],
      'not-urgent-important': [],
      'urgent-not-important': [],
      'not-urgent-not-important': [],
      'completed': [],
    };

    filteredTasks.forEach((task) => {
      grouped[task.quadrant].push(task);
    });

    return grouped;
  }, [filteredTasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const task = state.tasks.find((t) => t.id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event;

    if (!over) {
      setActiveTask(null);
      return;
    }

    const taskId = active.id as string;
    const task = state.tasks.find((t) => t.id === taskId);

    if (!task) {
      setActiveTask(null);
      return;
    }

    const newQuadrant = over.id as QuadrantType;

    // 如果在同一個象限內拖曳，使用 delta 計算新位置
    let newPosition;
    if (task.quadrant === newQuadrant && over.rect) {
      // 獲取目標象限的容器尺寸
      const containerWidth = over.rect.width;
      const containerHeight = over.rect.height;

      // 計算百分比偏移
      const deltaXPercent = (delta.x / containerWidth) * 100;
      const deltaYPercent = (delta.y / containerHeight) * 100;

      // 應用偏移到原始位置
      newPosition = {
        x: Math.max(5, Math.min(85, task.position.x + deltaXPercent)),
        y: Math.max(5, Math.min(85, task.position.y + deltaYPercent)),
      };
    } else {
      // 跨象限移動時使用隨機位置
      newPosition = {
        x: Math.random() * 60 + 20, // 20-80% 範圍
        y: Math.random() * 60 + 20,
      };
    }

    dispatch({
      type: 'MOVE_TASK',
      payload: {
        id: taskId,
        quadrant: newQuadrant,
        position: newPosition,
      },
    });

    setActiveTask(null);
  };

  const quadrants: Array<{
    type: QuadrantType;
    title: string;
    subtitle: string;
    borderColor: string;
    bgColor: string;
    cardColor: string;
  }> = [
      {
        type: 'urgent-important',
        title: '緊急 + 重要',
        subtitle: 'DO - 立即執行',
        borderColor: 'border-pink-300',
        bgColor: 'bg-pink-50',
        cardColor: 'bg-pink-200',
      },
      {
        type: 'not-urgent-important',
        title: '不緊急 + 重要',
        subtitle: 'SCHEDULE - 安排時間',
        borderColor: 'border-teal-300',
        bgColor: 'bg-teal-50',
        cardColor: 'bg-teal-200',
      },
      {
        type: 'urgent-not-important',
        title: '緊急 + 不重要',
        subtitle: 'DELEGATE - 委派他人',
        borderColor: 'border-amber-200',
        bgColor: 'bg-amber-50',
        cardColor: 'bg-amber-200',
      },
      {
        type: 'not-urgent-not-important',
        title: '不緊急 + 不重要',
        subtitle: 'ELIMINATE - 減少執行',
        borderColor: 'border-violet-300',
        bgColor: 'bg-violet-50',
        cardColor: 'bg-violet-200',
      },
    ];

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      <FilterBar />

      <div className="flex-1 flex flex-col min-h-0" style={{ zoom: zoomLevel / 100 }}>
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 flex flex-col p-3 overflow-hidden">
            {/* Four Quadrants Grid - 自適應高度 */}
            <div className={`grid grid-cols-2 gap-3 ${state.filters.showCompleted ? 'flex-1 min-h-0' : 'flex-1'}`}>
              {quadrants.map((quadrant) => (
                <Quadrant
                  key={quadrant.type}
                  type={quadrant.type}
                  title={quadrant.title}
                  subtitle={quadrant.subtitle}
                  borderColor={quadrant.borderColor}
                  bgColor={quadrant.bgColor}
                  cardColor={quadrant.cardColor}
                  tasks={tasksByQuadrant[quadrant.type]}
                />
              ))}
            </div>

            {/* Completed Area - 固定高度 */}
            {state.filters.showCompleted && (
              <div className="mt-3 flex-shrink-0 max-h-[25vh]">
                <CompletedArea tasks={tasksByQuadrant.completed} />
              </div>
            )}
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeTask ? (
              <TaskCardOverlay
                task={activeTask}
                cardColor={
                  quadrants.find((q) => q.type === activeTask.quadrant)?.cardColor
                }
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}

export default App;
