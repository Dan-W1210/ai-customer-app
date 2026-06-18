// アプリ全体で共有する定数

// localStorage に保存する際のキー名
export const API_KEY_STORAGE_KEY = "ai-customer-app:anthropic-api-key";

// 利用する Claude モデル ID
export const CLAUDE_MODEL = "claude-opus-4-8";

// 対応トーンの選択肢（セレクトボックス用）
export interface ToneOption {
  value: string;
  label: string;
  /** 生成プロンプトに渡すトーンの説明 */
  instruction: string;
}

export const TONE_OPTIONS: ToneOption[] = [
  {
    value: "polite",
    label: "丁寧",
    instruction: "丁寧で礼儀正しく、プロフェッショナルなトーン",
  },
  {
    value: "apologetic",
    label: "お詫び",
    instruction: "誠実にお詫びの気持ちを伝え、相手に寄り添う謝罪のトーン",
  },
  {
    value: "concise",
    label: "簡潔",
    instruction: "要点を押さえた、簡潔で分かりやすいトーン",
  },
  {
    value: "friendly",
    label: "親しみやすい",
    instruction: "親しみやすく柔らかい、フレンドリーなトーン",
  },
];
