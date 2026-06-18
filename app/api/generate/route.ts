import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { CLAUDE_MODEL } from "@/lib/constants";

// このルートは Node.js ランタイムで動かす（Anthropic SDK を使用するため）
export const runtime = "nodejs";

interface GenerateRequestBody {
  inquiry?: string;
  tone?: string;
}

export async function POST(request: Request) {
  // 1. ユーザーが localStorage から渡してきた API キーをヘッダーで受け取る
  //    （サーバー側の .env のキーではなく、ユーザー自身のキーを使う）
  const apiKey = request.headers.get("x-api-key");

  if (!apiKey) {
    return NextResponse.json(
      { error: "APIキーが指定されていません。設定からAPIキーを入力してください。" },
      { status: 401 }
    );
  }

  // 2. リクエストボディの取得とバリデーション
  let body: GenerateRequestBody;
  try {
    body = (await request.json()) as GenerateRequestBody;
  } catch {
    return NextResponse.json(
      { error: "リクエストの形式が不正です。" },
      { status: 400 }
    );
  }

  const inquiry = body.inquiry?.trim();
  const toneInstruction = body.tone?.trim();

  if (!inquiry) {
    return NextResponse.json(
      { error: "問い合わせ内容が入力されていません。" },
      { status: 400 }
    );
  }

  // 3. ユーザーのキーで Anthropic クライアントを生成
  const client = new Anthropic({ apiKey });

  // 4. システムプロンプト：返信本文のみを出力させる
  const systemPrompt = [
    "あなたは企業のカスタマーサポート担当者です。",
    "顧客からの問い合わせに対して、日本語で適切な返信メールの本文を作成してください。",
    `指定されたトーン: ${toneInstruction || "丁寧でプロフェッショナルなトーン"}。`,
    "出力は返信メールの本文のみとし、前置きや説明・補足コメントは一切含めないでください。",
    "宛名（〇〇様）や署名は必要に応じて含めて構いません。",
  ].join("\n");

  try {
    const message = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `以下は顧客からの問い合わせ内容です。これに対する返信メールの本文を作成してください。\n\n---\n${inquiry}\n---`,
        },
      ],
    });

    // 5. レスポンスからテキストブロックを取り出す
    const reply = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    return NextResponse.json({ reply });
  } catch (error) {
    // 6. Anthropic SDK の典型的なエラーを分かりやすく返す
    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: "APIキーが無効です。設定を確認してください。" },
        { status: 401 }
      );
    }
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "レート制限に達しました。しばらくしてから再度お試しください。" },
        { status: 429 }
      );
    }
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: `AIとの通信でエラーが発生しました: ${error.message}` },
        { status: error.status ?? 500 }
      );
    }

    return NextResponse.json(
      { error: "予期しないエラーが発生しました。" },
      { status: 500 }
    );
  }
}
