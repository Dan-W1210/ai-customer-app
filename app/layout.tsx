import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIカスタマーサポート 自動返信下書きツール",
  description:
    "顧客からの問い合わせ内容と対応トーンを入力すると、AIが返信メールの下書きを自動生成します。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  );
}
