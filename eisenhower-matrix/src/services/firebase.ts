import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
} from 'firebase/firestore';
import type { Unsubscribe } from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';
import type { AppState } from '../types/task';

/**
 * 使用 Google 帳號登入
 */
export const signInWithGoogle = async (): Promise<User> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google 登入失敗:', error);
    throw error;
  }
};

/**
 * 登出
 */
export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('登出失敗:', error);
    throw error;
  }
};

/**
 * 監聽使用者登入狀態
 */
export const onAuthChange = (callback: (user: User | null) => void): Unsubscribe => {
  return onAuthStateChanged(auth, callback);
};

/**
 * 儲存使用者資料到 Firestore
 */
export const saveUserState = async (userId: string, state: AppState): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, {
      ...state,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('儲存資料失敗:', error);
    throw error;
  }
};

/**
 * 載入使用者資料從 Firestore
 */
export const loadUserState = async (userId: string): Promise<AppState | null> => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { updatedAt, ...state } = data;
      return state as AppState;
    }
    return null;
  } catch (error) {
    console.error('載入資料失敗:', error);
    throw error;
  }
};

/**
 * 即時監聽使用者資料變更
 */
export const onUserStateChange = (
  userId: string,
  callback: (state: AppState | null) => void
): Unsubscribe => {
  const userDocRef = doc(db, 'users', userId);

  return onSnapshot(userDocRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { updatedAt, ...state } = data;
      callback(state as AppState);
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('監聽資料變更失敗:', error);
  });
};
