"use client";

import { useCallback, useEffect, useState } from "react";
import { API_KEY_STORAGE_KEY } from "./constants";

/**
 * APIキーを localStorage に保存・読み出しするためのカスタムフック。
 * ページをリロードしてもキーが保持される。
 */
export function useApiKey() {
  const [apiKey, setApiKeyState] = useState<string>("");
  // localStorage の読み込みが完了したか（SSR ハイドレーション対策）
  const [loaded, setLoaded] = useState(false);

  // 初回マウント時に localStorage から読み込む
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(API_KEY_STORAGE_KEY);
      if (stored) {
        setApiKeyState(stored);
      }
    } catch {
      // localStorage が使えない環境では何もしない
    } finally {
      setLoaded(true);
    }
  }, []);

  // キーを保存する
  const saveApiKey = useCallback((key: string) => {
    const trimmed = key.trim();
    setApiKeyState(trimmed);
    try {
      if (trimmed) {
        window.localStorage.setItem(API_KEY_STORAGE_KEY, trimmed);
      } else {
        window.localStorage.removeItem(API_KEY_STORAGE_KEY);
      }
    } catch {
      // 保存に失敗しても state は更新済み
    }
  }, []);

  // キーを削除する
  const clearApiKey = useCallback(() => {
    setApiKeyState("");
    try {
      window.localStorage.removeItem(API_KEY_STORAGE_KEY);
    } catch {
      // noop
    }
  }, []);

  return { apiKey, saveApiKey, clearApiKey, loaded };
}
