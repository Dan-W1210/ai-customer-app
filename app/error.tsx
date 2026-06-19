"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

/**
 * App Router のエラーバウンダリ。
 * 予期しないレンダリングエラーが発生しても画面が真っ白にならず、
 * 日本語のエラー画面と再試行ボタンを表示する。
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 開発時の調査用にコンソールへ出力
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <AlertTriangle className="h-6 w-6 text-red-500" />
        </div>
        <h1 className="mb-2 text-lg font-bold text-slate-900">
          エラーが発生しました
        </h1>
        <p className="mb-6 text-sm text-slate-600">
          予期しない問題が発生しました。お手数ですが、もう一度お試しください。
        </p>
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
        >
          <RotateCcw className="h-4 w-4" />
          再試行
        </button>
      </div>
    </main>
  );
}
