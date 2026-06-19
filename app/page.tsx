"use client";

import { useState } from "react";
import { Settings, Sparkles, Copy, Check, Loader2 } from "lucide-react";
import { TONE_OPTIONS } from "@/lib/constants";
import { useApiKey } from "@/lib/useApiKey";
import { SettingsModal } from "@/components/SettingsModal";
import { Toast, type ToastState } from "@/components/Toast";

export default function Home() {
  const { apiKey, saveApiKey, clearApiKey, loaded } = useApiKey();

  // フォーム入力
  const [inquiry, setInquiry] = useState("");
  const [tone, setTone] = useState(TONE_OPTIONS[0].value);

  // 生成結果・状態
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // UI 状態
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = (message: string, type: ToastState["type"]) =>
    setToast({ message, type });

  // 返信を生成する
  const handleGenerate = async () => {
    // 1. APIキーのバリデーション
    if (!apiKey) {
      showToast("設定からAPIキーを入力してください。", "error");
      setSettingsOpen(true);
      return;
    }
    // 2. 問い合わせ内容のバリデーション
    if (!inquiry.trim()) {
      showToast("問い合わせ内容を入力してください。", "error");
      return;
    }

    const toneInstruction =
      TONE_OPTIONS.find((t) => t.value === tone)?.instruction ?? "";

    setLoading(true);
    setReply("");
    setCopied(false);

    try {
      // 3. localStorage のキーを x-api-key ヘッダーでバックエンドへ渡す
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({ inquiry, tone: toneInstruction }),
      });

      // 4. エラー時は JSON でメッセージが返るのでトースト表示
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        showToast(data?.error ?? "生成に失敗しました。", "error");
        return;
      }

      // 5. 本文はストリーミングで届くため、逐次読み取って表示する
      const reader = res.body?.getReader();
      if (!reader) {
        showToast("レスポンスの読み取りに失敗しました。", "error");
        return;
      }

      const decoder = new TextDecoder();
      let accumulated = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setReply(accumulated);
      }
      accumulated += decoder.decode();
      setReply(accumulated);

      showToast("返信の下書きを生成しました。", "success");
    } catch {
      // ストリーミング途中の中断・通信エラーなど
      showToast("通信エラーが発生しました。生成が中断された可能性があります。", "error");
    } finally {
      setLoading(false);
    }
  };

  // クリップボードへコピー
  const handleCopy = async () => {
    if (!reply) return;
    try {
      await navigator.clipboard.writeText(reply);
      setCopied(true);
      showToast("クリップボードにコピーしました。", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("コピーに失敗しました。", "error");
    }
  };

  return (
    <main className="min-h-screen">
      {/* ヘッダー */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-slate-900" />
            <h1 className="text-lg font-bold text-slate-900">
              AIカスタマーサポート 自動返信下書きツール
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Settings className="h-4 w-4" />
            設定
            {loaded && (
              <span
                className={`ml-1 h-2 w-2 rounded-full ${
                  apiKey ? "bg-emerald-500" : "bg-red-400"
                }`}
                title={apiKey ? "APIキー設定済み" : "APIキー未設定"}
              />
            )}
          </button>
        </div>
      </header>

      {/* メインコンテンツ：左に入力フォーム、右に生成結果 */}
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* 左カラム：入力フォーム */}
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-base font-semibold text-slate-900">
              問い合わせ内容
            </h2>

            <label className="mb-1 block text-sm font-medium text-slate-700">
              顧客からの問い合わせ内容
            </label>
            <textarea
              value={inquiry}
              onChange={(e) => setInquiry(e.target.value)}
              rows={10}
              placeholder="例）先日購入した商品が届きません。注文番号は12345です。いつ届きますか？"
              className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />

            <label className="mb-1 mt-4 block text-sm font-medium text-slate-700">
              対応トーン
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            >
              {TONE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  返信を生成
                </>
              )}
            </button>
          </section>

          {/* 右カラム：生成結果 */}
          <section className="rounded-xl border border-slate-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">
                生成された返信文
              </h2>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!reply}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-600" />
                    コピー済み
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    クリップボードにコピー
                  </>
                )}
              </button>
            </div>

            {reply ? (
              <pre className="min-h-[20rem] whitespace-pre-wrap rounded-lg bg-slate-50 p-4 font-sans text-sm leading-relaxed text-slate-800">
                {reply}
              </pre>
            ) : (
              <div className="flex min-h-[20rem] items-center justify-center rounded-lg bg-slate-50 p-4 text-center text-sm text-slate-400">
                {loading
                  ? "AIが返信を作成しています..."
                  : "ここに生成された返信文が表示されます。"}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* 設定モーダル */}
      <SettingsModal
        open={settingsOpen}
        currentApiKey={apiKey}
        onClose={() => setSettingsOpen(false)}
        onSave={(key) => {
          saveApiKey(key);
          showToast("APIキーを保存しました。", "success");
        }}
        onClear={() => {
          clearApiKey();
          showToast("APIキーを削除しました。", "success");
        }}
      />

      {/* トースト通知 */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </main>
  );
}
