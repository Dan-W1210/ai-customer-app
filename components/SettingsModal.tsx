"use client";

import { useEffect, useState } from "react";
import { X, Eye, EyeOff, KeyRound, Trash2 } from "lucide-react";

interface SettingsModalProps {
  open: boolean;
  currentApiKey: string;
  onClose: () => void;
  onSave: (key: string) => void;
  onClear: () => void;
}

/**
 * APIキーを入力・保存する設定モーダル。
 * 入力されたキーは親コンポーネント経由で localStorage に保存される。
 */
export function SettingsModal({
  open,
  currentApiKey,
  onClose,
  onSave,
  onClear,
}: SettingsModalProps) {
  const [draft, setDraft] = useState(currentApiKey);
  const [reveal, setReveal] = useState(false);

  // モーダルを開くたびに現在のキーで初期化
  useEffect(() => {
    if (open) {
      setDraft(currentApiKey);
      setReveal(false);
    }
  }, [open, currentApiKey]);

  if (!open) return null;

  const handleSave = () => {
    onSave(draft);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      {/* 背景オーバーレイ */}
      <div
        className="absolute inset-0 bg-slate-900/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* モーダル本体 */}
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <KeyRound className="h-5 w-5 text-slate-500" />
            APIキー設定
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="閉じる"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-4 text-sm text-slate-600">
          Anthropic（Claude）のAPIキーを入力してください。キーはお使いのブラウザの
          localStorage にのみ保存され、サーバーには保管されません。
        </p>

        <label className="mb-1 block text-sm font-medium text-slate-700">
          Anthropic API Key
        </label>
        <div className="relative">
          <input
            type={reveal ? "text" : "password"}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="sk-ant-..."
            autoComplete="off"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-10 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
          <button
            type="button"
            onClick={() => setReveal((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-600"
            aria-label={reveal ? "キーを隠す" : "キーを表示"}
          >
            {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              onClear();
              setDraft("");
            }}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
            削除
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
