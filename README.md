# ai-customer-app

AIカスタマーサポート・自動返信下書きツール。顧客からの問い合わせ内容と対応トーンを入力すると、Claude（Anthropic）が返信メールの下書きを自動生成します。

## 特徴

- **問い合わせ入力 → 返信下書き生成**: 左側に問い合わせ内容と対応トーン（丁寧／お詫び／簡潔／親しみやすい）を入力し、ボタン一つで返信文を生成。
- **クリップボードにコピー**: 生成された返信文をワンクリックでコピー。
- **APIキーはユーザー入力 + localStorage 保存**: 各ユーザーが自分の Anthropic APIキーを設定画面で入力。ブラウザの localStorage に保存され、リロードしても保持されます。サーバーにはキーを保管しません。
- **APIキー未入力時のバリデーション**: 未設定で生成を実行するとトーストで通知し、設定モーダルを自動表示。

## 技術スタック

- Next.js 14 (App Router) / TypeScript
- Tailwind CSS / lucide-react（アイコン）
- Route Handlers (`app/api/generate/route.ts`)
- `@anthropic-ai/sdk`（Claude / モデル: `claude-opus-4-8`）

## セットアップ

```bash
npm install
npm run dev
```

ブラウザで http://localhost:3000 を開きます。

## 使い方

1. 画面右上の「設定」をクリックし、Anthropic の APIキー（`sk-ant-...`）を入力して保存します。
   - APIキーは [Anthropic Console](https://console.anthropic.com/) で取得できます。
   - キーはブラウザの localStorage にのみ保存されます。
2. 左側に顧客からの問い合わせ内容を入力し、対応トーンを選択します。
3. 「返信を生成」を押すと、右側に返信メールの下書きが表示されます。
4. 「クリップボードにコピー」でコピーして利用します。

## アーキテクチャ

```
app/
  layout.tsx              # ルートレイアウト
  page.tsx                # メイン画面（入力フォーム + 生成結果）
  globals.css
  api/
    generate/route.ts     # x-api-key ヘッダーでユーザーのキーを受け取り Claude と通信
components/
  SettingsModal.tsx       # APIキー入力モーダル
  Toast.tsx               # トースト通知
lib/
  constants.ts            # モデルID・トーン定義・localStorage キー
  useApiKey.ts            # APIキーの localStorage 読み書きフック
```

APIキーはフロントエンドの localStorage から取得し、`/api/generate` へのリクエスト時に `x-api-key` ヘッダーで渡します。Route Handler はそのキーで Anthropic クライアントを生成して通信するため、サーバー側の環境変数にキーを置く必要はありません。
