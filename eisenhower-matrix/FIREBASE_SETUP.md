# Firebase 設定指引

## 📋 功能說明

整合 Firebase 後，您的 Eisenhower Matrix 應用程式將具備：

- ✅ **Google 帳號登入**：一鍵使用 Google 帳號登入
- ✅ **跨裝置同步**：在多個裝置間即時同步任務資料
- ✅ **離線支援**：沒網路時仍可使用，有網路時自動同步
- ✅ **資料安全**：資料加密儲存在 Google Cloud
- ✅ **雙重備份**：同時使用 Firebase 和 localStorage

## 🚀 設定步驟

### 1. 建立 Firebase 專案

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 點擊「新增專案」或「Add project」
3. 輸入專案名稱，例如：`eisenhower-matrix`
4. （可選）啟用 Google Analytics
5. 點擊「建立專案」

### 2. 啟用 Authentication

1. 在 Firebase 專案中，點擊左側選單的「Authentication」
2. 點擊「Get started」或「開始使用」
3. 在「Sign-in method」分頁中：
   - 點擊「Google」
   - 將開關切換為「啟用」
   - 選擇專案支援電子郵件
   - 點擊「儲存」

### 3. 啟用 Firestore Database

1. 在左側選單點擊「Firestore Database」
2. 點擊「建立資料庫」
3. 選擇「測試模式」開始（稍後會設定安全規則）
4. 選擇資料庫位置（建議選擇 `asia-east1` 台灣）
5. 點擊「啟用」

### 4. 設定 Firestore 安全規則

在 Firestore Database 中，切換到「Rules」分頁，貼上以下規則：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 使用者只能讀寫自己的資料
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

點擊「發布」來套用規則。

### 5. 取得 Firebase 配置

1. 在 Firebase 專案首頁，點擊「網頁」圖示（</>）
2. 輸入應用程式暱稱，例如：`Eisenhower Matrix Web`
3. **不需要**設定 Firebase Hosting（我們使用 GitHub Pages）
4. 複製 `firebaseConfig` 物件中的值

### 6. 設定環境變數

1. 在 `eisenhower-matrix/` 目錄下，編輯 `.env` 檔案
2. 將 Firebase 配置值填入對應欄位：

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

### 7. 設定授權網域（重要！）

為了在 GitHub Pages 上使用 Google 登入，需要將您的網域加入授權清單：

1. 在 Firebase Console 的「Authentication」
2. 切換到「Settings」分頁
3. 在「Authorized domains」區域
4. 點擊「Add domain」
5. 加入以下網域：
   - `localhost`（本地開發用）
   - `your-username.github.io`（替換成您的 GitHub 使用者名稱）

例如：`lwsvincent.github.io`

## 🧪 測試

### 本地測試

```bash
cd eisenhower-matrix
npm run dev
```

開啟 http://localhost:5173，應該能看到：
- 右上角出現「用 Google 登入啟用同步」按鈕
- 點擊後彈出 Google 登入視窗
- 登入成功後顯示您的名字和「已同步」標記

### 部署到 GitHub Pages

```bash
npm run deploy
```

然後前往 `https://your-username.github.io/WorkingPanel` 測試。

## 💡 使用方式

### 未登入狀態
- 資料儲存在瀏覽器的 localStorage
- 只在單一裝置/瀏覽器可用
- 可以使用匯出/匯入功能備份

### 已登入狀態
- 資料即時同步到 Firebase Cloud Firestore
- 在任何裝置登入同一個 Google 帳號即可存取
- 離線時自動使用 localStorage，有網路時自動同步
- localStorage 同時作為備份

## 🔐 安全性

- ✅ `.env` 檔案已加入 `.gitignore`，不會上傳到 GitHub
- ✅ Firestore 安全規則確保使用者只能存取自己的資料
- ✅ Firebase API Key 可以公開（已限制網域）
- ✅ 所有傳輸使用 HTTPS 加密

## ❓ 常見問題

### Q: API Key 洩漏安全嗎？
A: Firebase Web API Key 是設計可以公開的，因為：
- 已透過「Authorized domains」限制只有您的網域可用
- Firestore 安全規則限制資料存取權限
- 無法透過 API Key 存取其他使用者的資料

### Q: 如何關閉同步功能？
A: 點擊右上角的「登出」按鈕即可，應用程式會自動切換回 localStorage。

### Q: 資料會遺失嗎？
A: 不會，因為：
- Firebase 提供雲端備份
- localStorage 同時保存一份備份
- 可以隨時使用匯出功能下載 JSON 檔案

### Q: Firebase 免費額度夠用嗎？
A: 對於個人使用綽綽有餘：
- Firestore：每天 50,000 次讀取、20,000 次寫入
- Authentication：無限次登入
- 儲存空間：1GB

## 📞 需要協助？

如果設定過程遇到問題，請檢查：
1. `.env` 檔案中的所有值都已正確填入
2. Firestore 安全規則已正確設定
3. 授權網域包含您的 GitHub Pages 網址
4. 瀏覽器 Console 是否有錯誤訊息

---

設定完成後，您的任務管理工具就具備了跨裝置同步功能！🎉
