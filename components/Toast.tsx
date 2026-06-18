"use client";

import { useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export type ToastType = "success" | "error";

export interface ToastState {
  message: string;
  type: ToastType;
}

interface ToastProps {
  toast: ToastState | null;
  onClose: () => void;
}

/**
 * 画面右下に表示するシンプルなトースト。
 * 4秒で自動的に閉じる。
 */
export function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isError = toast.type === "error";

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in">
      <div
        className={`flex items-start gap-3 rounded-lg px-4 py-3 shadow-lg ring-1 ${
          isError
            ? "bg-red-50 text-red-800 ring-red-200"
            : "bg-emerald-50 text-emerald-800 ring-emerald-200"
        }`}
      >
        {isError ? (
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        ) : (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
        )}
        <p className="max-w-xs text-sm font-medium">{toast.message}</p>
        <button
          type="button"
          onClick={onClose}
          className="ml-2 shrink-0 rounded p-0.5 hover:bg-black/5"
          aria-label="閉じる"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
