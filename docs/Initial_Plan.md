# Eisenhower Matrix Task Manager - 專案計劃書

## 專案概述

**專案名稱**: Eisenhower Matrix Task Manager  
**目標**: 建立網頁版艾森豪矩陣工作流管理工具，支援拖曳操作與 MCP 整合  
**部署平台**: GitHub Pages  
**開發階段**: MVP

---

## 技術棧

### 前端技術
- **框架**: React 18 + TypeScript
- **建構工具**: Vite
- **拖曳庫**: @dnd-kit/core + @dnd-kit/sortable
- **樣式**: Tailwind CSS
- **狀態管理**: React Context + useReducer

### 資料儲存
- **本地儲存**: localStorage (JSON 格式)
- **未來擴充**: Google Drive 手動匯出/匯入

### MCP 整合
- **類型**: Stdio MCP Server
- **功能**: 任務 CRUD + 資料分析

---

## 資料結構設計

### Task Interface
```typescript
interface Task {
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

type QuadrantType = 
  | 'urgent-important'           // 緊急重要
  | 'not-urgent-important'       // 不緊急重要
  | 'urgent-not-important'       // 緊急不重要
  | 'not-urgent-not-important'   // 不緊急不重要
  | 'completed';                 // 已完成

interface AppState {
  tasks: Task[];
  filters: {
    tags: string[];              // 啟用的標籤篩選
    showCompleted: boolean;      // 顯示已完成任務
  };
}
```

---

## 核心功能規格

### 1. 四象限佈局 + 完成區域

**佈局結構**:
```
┌─────────────────┬─────────────────┐
│  緊急 + 重要    │  不緊急 + 重要  │
│  (DO)           │  (SCHEDULE)     │
├─────────────────┼─────────────────┤
│  緊急 + 不重要  │  不緊急 + 不重要│
│  (DELEGATE)     │  (ELIMINATE)    │
└─────────────────┴─────────────────┘
┌───────────────────────────────────┐
│  已完成 (COMPLETED)                │
└───────────────────────────────────┘
```

**規格**:
- 每個象限獨立滾動
- 完成區域可摺疊/展開
- 響應式設計（最小寬度 1024px）

---

### 2. 任務 CRUD

#### 新增任務
- **觸發**: 點擊象限內 "+" 按鈕
- **表單欄位**:
  - 標題（必填，最多 100 字）
  - 內容（選填，最多 500 字）
  - 標籤（多選，支援新增）
  - 截止日期（選填，日期選擇器）
- **預設象限**: 建立時所在象限
- **預設坐標**: 象限中心 (50, 50)

#### 編輯任務
- **觸發**: 點擊任務卡片
- **功能**: 修改所有欄位（除 id 和 createdAt）

#### 刪除任務
- **觸發**: 編輯面板內刪除按鈕
- **確認**: 彈窗確認

#### 完成任務
- **觸發**: 任務卡片勾選框
- **行為**: 
  - `isCompleted` 設為 true
  - `quadrant` 改為 'completed'
  - 移動至完成區域

---

### 3. 拖曳系統

**技術選擇**: @dnd-kit

**功能**:
- 跨象限拖曳（包含完成區）
- 象限內自由定位（坐標系統）
- 拖曳時視覺回饋（半透明預覽）

**坐標系統**:
- 每個象限獨立坐標空間
- 使用百分比 (0-100, 0-100)
- 基於滑鼠位置計算相對坐標

**限制**:
- 已完成任務可拖回四象限（自動取消完成狀態）

---

### 4. 篩選功能

**標籤篩選**:
- 多選模式
- 顯示所有包含任一選中標籤的任務
- 無標籤任務不受篩選影響

**顯示/隱藏已完成**:
- 切換開關控制完成區可見性

**篩選 UI**:
- 置於頂部工具列
- 標籤以彩色徽章顯示

---

### 5. 資料持久化

**儲存機制**:
```typescript
// localStorage key
const STORAGE_KEY = 'eisenhower-matrix-tasks';

// 儲存
localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));

// 讀取
const saved = localStorage.getItem(STORAGE_KEY);
const appState = saved ? JSON.parse(saved) : initialState;
```

**觸發時機**:
- 每次狀態變更（使用 useEffect 監聽）
- 防抖 500ms 避免頻繁寫入

**備份機制**:
- 手動匯出 JSON 檔案
- 手動匯入 JSON 檔案（覆蓋或合併選項）

---

## UI/UX 設計規範

### 任務卡片

**尺寸**: 固定 200px × 150px

**內容結構**:
```
┌─────────────────────┐
│ ☐ [標題]        [⋮] │
├─────────────────────┤
│ [內容預覽...]       │
│                     │
├─────────────────────┤
│ 🏷️ tag1 tag2       │
│ 📅 2024-01-15       │
└─────────────────────┘
```

**樣式**:
- 白色背景
- 灰色邊框
- hover 時陰影加深
- 過期任務紅色左邊框

**互動**:
- 點擊主體：開啟編輯
- 點擊勾選框：標記完成
- 點擊 [⋮]：顯示快捷選單（編輯/刪除/複製）

---

### 標籤系統

**顏色管理**:
- 自動分配（hash 標籤名產生色相）
- 使用 HSL 色彩空間確保辨識度

**標籤輸入**:
- Tag input 組件（支援輸入+選擇）
- 顯示既有標籤供選擇
- 支援新建標籤

---

### 截止日期處理

**視覺提示**:
- 今日到期：橙色標記
- 已過期：紅色標記 + 警告圖示
- 未來到期：灰色

**倒數顯示**:
- "3 天後"
- "今天"
- "逾期 2 天"

---

## MCP 整合設計

### MCP Server 架構

**類型**: Stdio Server  
**語言**: TypeScript (Node.js)

### Tools 定義

#### 1. create_task
```typescript
{
  name: "create_task",
  description: "建立新任務",
  inputSchema: {
    type: "object",
    properties: {
      title: { type: "string" },
      content: { type: "string" },
      tags: { type: "array", items: { type: "string" } },
      deadline: { type: "string", format: "date-time" },
      quadrant: { type: "string", enum: [...] }
    },
    required: ["title", "quadrant"]
  }
}
```

#### 2. update_task
```typescript
{
  name: "update_task",
  description: "更新任務",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "string" },
      // ... 其他可更新欄位
    },
    required: ["id"]
  }
}
```

#### 3. delete_task
```typescript
{
  name: "delete_task",
  description: "刪除任務",
  inputSchema: {
    type: "object",
    properties: {
      id: { type: "string" }
    },
    required: ["id"]
  }
}
```

#### 4. list_tasks
```typescript
{
  name: "list_tasks",
  description: "列出任務（支援篩選）",
  inputSchema: {
    type: "object",
    properties: {
      quadrant: { type: "string" },
      tags: { type: "array" },
      completed: { type: "boolean" }
    }
  }
}
```

#### 5. analyze_tasks
```typescript
{
  name: "analyze_tasks",
  description: "分析任務分佈與時間管理",
  inputSchema: {
    type: "object",
    properties: {
      period: { type: "string", enum: ["week", "month", "all"] }
    }
  }
}
```

### Resources 定義

#### tasks://all
```typescript
{
  uri: "tasks://all",
  name: "所有任務",
  mimeType: "application/json",
  description: "返回完整任務列表"
}
```

### 資料訪問策略

**問題**: MCP Server 無法直接訪問瀏覽器 localStorage

**解決方案**:
1. **匯出檔案**: 網頁提供匯出按鈕，生成 `tasks-export.json`
2. **MCP 讀取**: Server 從約定路徑讀取（如 `~/eisenhower-tasks.json`）
3. **寫回機制**: Server 修改後寫回檔案，網頁提供匯入功能

**流程**:
```
網頁 -> 匯出 JSON -> 本地檔案
                       ↓
                  MCP Server (讀取/修改)
                       ↓
網頁 <- 匯入 JSON <- 本地檔案
```

---

## 開發計劃

### Phase 1: 基礎架構（Week 1）
- [ ] Vite + React + TypeScript 專案初始化
- [ ] Tailwind CSS 設定
- [ ] 四象限 Layout 組件
- [ ] Task 資料結構定義
- [ ] Context + Reducer 狀態管理

### Phase 2: CRUD 與拖曳（Week 2）
- [ ] Task Card 組件
- [ ] 新增/編輯任務表單
- [ ] @dnd-kit 整合
- [ ] 拖曳邏輯實作
- [ ] localStorage 持久化

### Phase 3: 篩選與完成區（Week 3）
- [ ] 標籤系統 UI
- [ ] 篩選邏輯
- [ ] 完成區域組件
- [ ] 完成/取消完成功能
- [ ] 日期選擇器整合

### Phase 4: MCP 整合（Week 4）
- [ ] 設計 MCP Tools Schema
- [ ] 實作 Stdio Server
- [ ] 匯出/匯入功能
- [ ] Claude 整合測試
- [ ] 分析功能實作

### Phase 5: 優化與部署（Week 5）
- [ ] 響應式調整
- [ ] 錯誤處理
- [ ] 載入動畫
- [ ] GitHub Pages 部署設定
- [ ] README 文件撰寫

---

## 待確認問題

### UI/UX
1. **UI 風格偏好**: 簡約現代風 (Notion-like) vs 彩色卡片風 (Trello-like)？
2. **截止日期通知**: 需要瀏覽器 Notification API 嗎？
3. **匯出格式**: 除了 JSON，需要 Markdown 或 CSV 嗎？
4. **手機支援**: 需要完整響應式設計還是桌面優先？

### 功能細節
5. **標籤預設清單**: 提供常用標籤（工作/個人/學習等）還是完全自由輸入？
6. **任務排序**: 除了自由定位，需要「按截止日期排序」功能嗎？
7. **任務搜尋**: 需要全文搜尋功能嗎？
8. **歷史記錄**: 需要保留任務修改歷史嗎？

### MCP 分析
9. **分析維度**: 具體需要哪些分析？
   - 象限分佈統計（各象限任務數量）
   - 任務完成率趨勢（每週/每月）
   - 時間管理建議（根據象限分佈）
   - 過期任務警報
   - 標籤使用頻率

---

## 專案結構預覽
```
eisenhower-matrix/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── Quadrant.tsx
│   │   ├── TaskCard.tsx
│   │   ├── TaskForm.tsx
│   │   ├── CompletedArea.tsx
│   │   ├── FilterBar.tsx
│   │   └── TagInput.tsx
│   ├── contexts/
│   │   └── TaskContext.tsx
│   ├── hooks/
│   │   ├── useTasks.ts
│   │   └── useLocalStorage.ts
│   ├── types/
│   │   └── task.ts
│   ├── utils/
│   │   ├── storage.ts
│   │   └── date.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── mcp-server/
│   ├── src/
│   │   ├── index.ts
│   │   ├── tools.ts
│   │   └── resources.ts
│   ├── package.json
│   └── tsconfig.json
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

---

## 參考資源

- [React DnD Kit](https://dndkit.com/)
- [MCP Documentation](https://modelcontextprotocol.io/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

---

## 版本資訊

**版本**: 0.1.0-MVP  
**建立日期**: 2026-01-05  
**作者**: Vincent Lee