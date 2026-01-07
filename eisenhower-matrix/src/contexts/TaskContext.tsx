import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { AppState, TaskAction } from '../types/task';
import { loadState, saveState } from '../utils/storage';
import { useAuth } from './AuthContext';
import { saveUserState, loadUserState, onUserStateChange } from '../services/firebase';
import type { Unsubscribe } from 'firebase/firestore';

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
  const { user } = useAuth();
  const [state, dispatch] = useReducer(taskReducer, initialState, () => {
    const savedState = loadState();
    return savedState || initialState;
  });

  const isSyncing = useRef(false); // 防止循環更新
  const unsubscribeRef = useRef<Unsubscribe | null>(null);

  // 當使用者登入/登出時，載入對應的資料
  useEffect(() => {
    if (user) {
      // 使用者登入：載入 Firebase 資料
      loadUserState(user.uid)
        .then((firebaseState) => {
          if (firebaseState) {
            isSyncing.current = true;
            dispatch({ type: 'LOAD_STATE', payload: firebaseState });
            isSyncing.current = false;
          } else {
            // Firebase 沒有資料，將本地資料上傳
            const localState = loadState();
            if (localState && localState.tasks.length > 0) {
              saveUserState(user.uid, localState);
            }
          }
        })
        .catch((error) => {
          console.error('載入 Firebase 資料失敗:', error);
        });

      // 監聽 Firebase 即時更新
      unsubscribeRef.current = onUserStateChange(user.uid, (firebaseState) => {
        if (firebaseState && !isSyncing.current) {
          isSyncing.current = true;
          dispatch({ type: 'LOAD_STATE', payload: firebaseState });
          isSyncing.current = false;
        }
      });
    } else {
      // 使用者登出：清除監聽器
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [user]);

  // 使用防抖保存狀態
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // 總是保存到 localStorage 作為備份
      saveState(state);

      // 如果已登入，同步到 Firebase
      if (user && !isSyncing.current) {
        saveUserState(user.uid, state).catch((error) => {
          console.error('同步到 Firebase 失敗:', error);
        });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [state, user]);

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
