export type QuadrantType =
  | 'urgent-important'           // 緊急重要 (DO)
  | 'not-urgent-important'       // 不緊急重要 (SCHEDULE)
  | 'urgent-not-important'       // 緊急不重要 (DELEGATE)
  | 'not-urgent-not-important'   // 不緊急不重要 (ELIMINATE)
  | 'completed';                 // 已完成

export interface Task {
  id: string;                    // UUID
  title: string;                 // 任務標題
  content: string;               // 任務內容描述
  tags: string[];                // 多標籤
  createdAt: string;             // ISO 8601 格式
  deadline?: string;             // ISO 8601 格式（可選）
  quadrant: QuadrantType;        // 所屬象限
  position: {                    // 象限內坐標
    x: number;                   // 百分比 0-100
    y: number;                   // 百分比 0-100
  };
  isCompleted: boolean;          // 完成狀態
}

export interface Filters {
  tags: string[];                // 啟用的標籤篩選
  showCompleted: boolean;        // 顯示已完成任務
}

export interface AppState {
  tasks: Task[];
  filters: Filters;
}

export type TaskAction =
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'MOVE_TASK'; payload: { id: string; quadrant: QuadrantType; position: { x: number; y: number } } }
  | { type: 'TOGGLE_COMPLETE'; payload: string }
  | { type: 'SET_FILTER_TAGS'; payload: string[] }
  | { type: 'TOGGLE_SHOW_COMPLETED' }
  | { type: 'IMPORT_TASKS'; payload: Task[] }
  | { type: 'LOAD_STATE'; payload: AppState };
