# CLAUDE.md

このファイルは、このリポジトリで作業する Claude Code への指示書です。

## プロジェクト概要

- **プロジェクト名**: ai-customer-app
- **概要**: AIカスタマーサポート・自動返信下書きツール
- **目的**: 顧客からの問い合わせ文を入力すると、AIが返信の下書きを自動生成する。サポート担当者の返信業務を高速化する。

## 技術スタック

| 領域 | 採用技術 |
| --- | --- |
| フレームワーク | Next.js (App Router) |
| 言語 | TypeScript（基本）/ JavaScript |
| スタイリング | Tailwind CSS（プレーンな Tailwind、または shadcn/ui などのモダンなコンポーネント） |
| 状態管理・データ保存 | ブラウザの localStorage（APIキーの保存用） |
| バックエンド・API処理 | Next.js の Route Handlers（`app/api/...` 形式のルート） |
| AI通信 | 最新の `@google/generative-ai`（Gemini）または `@anthropic-ai/sdk`（Claude） |

## アーキテクチャ方針

- **外部の複雑なデータベース（PostgreSQL、Firebase など）は使わない。**
- まずは **フロントエンド + Next.js の API 機能だけで完結する**、シンプルで爆速に動作する構成にする。
- データの永続化が必要な場合は、原則 **ブラウザの localStorage** を使う。
- APIキーは localStorage に保存し、AI通信は Next.js の Route Handler 経由で行う（キーをサーバー側に送ってからAIへリクエストする形でも、用途に応じて検討する）。

## ディレクトリ構成（想定）

```
app/
  page.tsx            # メイン画面（問い合わせ入力 → 返信下書き表示）
  layout.tsx
  api/
    generate/
      route.ts        # AIへ返信下書き生成をリクエストする Route Handler
components/            # UIコンポーネント（shadcn/ui など）
lib/                   # AIクライアント・ユーティリティ
```

## コーディング規約・進め方

- 返答・コミットメッセージ・コメントは **日本語** で書く。
- TypeScript を基本とし、型を活用する。
- 依存は最小限に保ち、シンプルさと動作速度を優先する。
- 環境変数やAPIキーをリポジトリにコミットしない（`.gitignore` で除外）。

## 開発コマンド

```bash
npm install     # 依存インストール
npm run dev     # 開発サーバー起動（http://localhost:3000）
npm run build   # 本番ビルド
npm run start   # 本番サーバー起動
npm run lint    # Lint
```

## 実装メモ

- AIモデルは `lib/constants.ts` の `CLAUDE_MODEL`（`claude-opus-4-8`）で定義。
- APIキーはユーザーが設定モーダルで入力し、localStorage（`lib/constants.ts` の `API_KEY_STORAGE_KEY`）に保存。
- フロントは `/api/generate` へ `x-api-key` ヘッダーでキーを渡し、Route Handler が Anthropic SDK で通信する。サーバーの `.env` にキーは不要。
