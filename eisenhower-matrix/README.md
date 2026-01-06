# Eisenhower Matrix Task Manager

一個基於 React + TypeScript 的網頁版艾森豪矩陣任務管理工具，支援拖曳操作、標籤篩選、本地儲存與 MCP 整合。

![Version](https://img.shields.io/badge/version-0.1.0--MVP-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 特色功能

### 📊 四象限管理
- **緊急 + 重要** (DO): 立即執行的任務
- **不緊急 + 重要** (SCHEDULE): 安排時間處理
- **緊急 + 不重要** (DELEGATE): 可委派給他人
- **不緊急 + 不重要** (ELIMINATE): 減少或消除

### ✨ 核心功能
- 🎯 **拖曳操作**: 使用 @dnd-kit 實現跨象限拖曳
- 🏷️ **標籤系統**: 多標籤支援，自動顏色分配
- 📅 **截止日期**: 視覺化提醒（今日、逾期）
- ✅ **完成追蹤**: 可摺疊的完成任務區域
- 🔍 **篩選功能**: 標籤篩選 + 顯示/隱藏已完成
- 💾 **本地儲存**: 自動保存至 localStorage
- 📤 **匯出/匯入**: JSON 格式資料交換

## 技術棧

- **前端框架**: React 18 + TypeScript
- **建構工具**: Vite
- **拖曳庫**: @dnd-kit (core + sortable + utilities)
- **樣式**: Tailwind CSS
- **狀態管理**: React Context + useReducer
- **UUID 生成**: uuid

## 快速開始

### 環境需求
- Node.js >= 16
- npm >= 8

### 安裝步驟

```bash
# 1. 克隆專案
git clone <repository-url>
cd eisenhower-matrix

# 2. 安裝依賴
npm install

# 3. 啟動開發伺服器
npm run dev

# 4. 開啟瀏覽器訪問
# http://localhost:5173
```

### 建構生產版本

```bash
# 建構
npm run build

# 預覽建構結果
npm run preview
```

## 專案結構

```
eisenhower-matrix/
├── src/
│   ├── components/          # React 組件
│   │   ├── Quadrant.tsx     # 象限組件
│   │   ├── TaskCard.tsx     # 任務卡片
│   │   ├── TaskForm.tsx     # 任務表單
│   │   ├── CompletedArea.tsx # 完成區域
│   │   ├── FilterBar.tsx    # 篩選工具列
│   │   └── TagInput.tsx     # 標籤輸入
│   ├── contexts/
│   │   └── TaskContext.tsx  # 全域狀態管理
│   ├── types/
│   │   └── task.ts          # TypeScript 型別定義
│   ├── utils/
│   │   ├── storage.ts       # 本地儲存工具
│   │   └── date.ts          # 日期處理工具
│   ├── App.tsx              # 主應用組件
│   ├── main.tsx             # 應用入口
│   └── index.css            # 全域樣式
├── public/                  # 靜態資源
├── package.json
├── vite.config.ts           # Vite 設定
├── tailwind.config.js       # Tailwind 設定
└── tsconfig.json            # TypeScript 設定
```

## 使用說明

### 建立任務
1. 點擊象限右上角的 `+` 按鈕
2. 填寫任務標題（必填）、內容、標籤、截止日期
3. 點擊「建立」

### 編輯任務
- 點擊任務卡片主體開啟編輯視窗
- 或點擊卡片右上角 `⋮` 選單選擇「編輯」

### 移動任務
- 直接拖曳任務卡片至目標象限
- 從完成區拖回象限會自動取消完成狀態

### 完成任務
- 勾選任務卡片左上角的核取方塊
- 任務會自動移至完成區域

### 篩選任務
- 點擊頂部標籤篩選器選擇要顯示的標籤
- 切換「顯示已完成」開關控制完成區可見性

### 匯出/匯入
- **匯出**: 點擊「匯出」按鈕下載 JSON 檔案
- **匯入**: 點擊「匯入」按鈕選擇檔案
  - 確定 = 覆蓋現有任務
  - 取消 = 合併任務

## 資料格式

### Task 介面
```typescript
interface Task {
  id: string;                    // UUID
  title: string;                 // 任務標題
  content: string;               // 任務內容
  tags: string[];                // 標籤陣列
  createdAt: string;             // ISO 8601 格式
  deadline?: string;             // ISO 8601 格式 (可選)
  quadrant: QuadrantType;        // 象限類型
  position: {                    // 象限內座標
    x: number;                   // 0-100
    y: number;                   // 0-100
  };
  isCompleted: boolean;          // 完成狀態
}
```

## GitHub Pages 部署

### 設定 vite.config.ts
```typescript
export default defineConfig({
  base: '/eisenhower-matrix/', // 替換為你的 repo 名稱
  // ...
})
```

### 部署步驟
```bash
# 1. 建構專案
npm run build

# 2. 部署至 GitHub Pages
# (使用 gh-pages 套件或手動推送 dist 資料夾)
```

## 未來規劃

### Phase 4: MCP 整合
- [ ] 設計 MCP Tools Schema
- [ ] 實作 Stdio Server
- [ ] Claude 整合測試
- [ ] 任務分析功能

### 功能擴充
- [ ] 多語言支援 (i18n)
- [ ] 暗色模式
- [ ] 手機響應式設計
- [ ] 鍵盤快捷鍵
- [ ] 任務搜尋功能
- [ ] 自訂象限顏色
- [ ] 匯出為 Markdown/CSV

## 常見問題

### Q: 資料會遺失嗎?
A: 所有資料儲存在瀏覽器的 localStorage，不會遺失。建議定期使用匯出功能備份。

### Q: 可以在多個裝置同步嗎?
A: 目前不支援。可透過匯出/匯入 JSON 檔案手動同步。

### Q: 支援哪些瀏覽器?
A: 支援所有現代瀏覽器 (Chrome, Firefox, Safari, Edge)。

## 授權

MIT License

## 作者

Vincent Lee

## 參考資源

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [DnD Kit](https://dndkit.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Eisenhower Matrix](https://en.wikipedia.org/wiki/Time_management#The_Eisenhower_Method)
