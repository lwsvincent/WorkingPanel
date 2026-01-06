import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AppState, TaskAction } from '../types/task';
import { loadState, saveState } from '../utils/storage';

const initialState: AppState = {
  tasks: [],
  filters: {
    tags: [],
    showCompleted: true,
  },
};

const taskReducer = (state: AppState, action: TaskAction): AppState => {
  switch (action.type) {
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
      };

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? action.payload : task
        ),
      };

    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
      };

    case 'MOVE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id
            ? {
                ...task,
                quadrant: action.payload.quadrant,
                position: action.payload.position,
                // 如果從完成區移回象限,取消完成狀態
                isCompleted: action.payload.quadrant === 'completed' ? task.isCompleted : false,
              }
            : task
        ),
      };

    case 'TOGGLE_COMPLETE':
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload
            ? {
                ...task,
                isCompleted: !task.isCompleted,
                quadrant: !task.isCompleted ? 'completed' : task.quadrant,
              }
            : task
        ),
      };

    case 'SET_FILTER_TAGS':
      return {
        ...state,
        filters: {
          ...state.filters,
          tags: action.payload,
        },
      };

    case 'TOGGLE_SHOW_COMPLETED':
      return {
        ...state,
        filters: {
          ...state.filters,
          showCompleted: !state.filters.showCompleted,
        },
      };

    case 'IMPORT_TASKS':
      return {
        ...state,
        tasks: action.payload,
      };

    case 'LOAD_STATE':
      return action.payload;

    default:
      return state;
  }
};

interface TaskContextType {
  state: AppState;
  dispatch: React.Dispatch<TaskAction>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, initialState, () => {
    const savedState = loadState();
    return savedState || initialState;
  });

  // 使用防抖保存狀態
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveState(state);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [state]);

  return (
    <TaskContext.Provider value={{ state, dispatch }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
