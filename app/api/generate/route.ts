import Anthropic from "@anthropic-ai/sdk";
import { NextResponse } from "next/server";
import { CLAUDE_MODEL } from "@/lib/constants";

// このルートは Node.js ランタイムで動かす（Anthropic SDK を使用するため）
export const runtime = "nodejs";

interface GenerateRequestBody {
  inquiry?: string;
  tone?: string;
}

// Anthropic SDK の例外を日本語メッセージと HTTP ステータスに変換する
function mapError(error: unknown): { message: string; status: number } {
  if (error instanceof Anthropic.AuthenticationError) {
    return { message: "APIキーが無効です。設定を確認してください。", status: 401 };
  }
  if (error instanceof Anthropic.RateLimitError) {
    return {
      message: "レート制限に達しました。しばらくしてから再度お試しください。",
      status: 429,
    };
  }
  if (error instanceof Anthropic.APIError) {
    return {
      message: `AIとの通信でエラーが発生しました: ${error.message}`,
      status: error.status ?? 500,
    };
  }
  return { message: "予期しないエラーが発生しました。", status: 500 };
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

  // 5. ストリーミングを開始
  const anthropicStream = client.messages.stream({
    model: CLAUDE_MODEL,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: `以下は顧客からの問い合わせ内容です。これに対する返信メールの本文を作成してください。\n\n---\n${inquiry}\n---`,
      },
    ],
  });

  // 6. 最初のイベントを先に取得し、認証エラー等は通常の HTTP ステータスで返す
  //    （ここで失敗すればまだ本文を送信していないため JSON エラーを返せる）
  const iterator = anthropicStream[Symbol.asyncIterator]();
  let firstResult: IteratorResult<Anthropic.MessageStreamEvent>;
  try {
    firstResult = await iterator.next();
  } catch (error) {
    const { message, status } = mapError(error);
    return NextResponse.json({ error: message }, { status });
  }

  // 7. テキストデルタをそのままプレーンテキストとして流す
  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enqueueText = (event: Anthropic.MessageStreamEvent) => {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          controller.enqueue(encoder.encode(event.delta.text));
        }
      };

      try {
        enqueueText(firstResult.value);
        let result = await iterator.next();
        while (!result.done) {
          enqueueText(result.value);
          result = await iterator.next();
        }
        controller.close();
      } catch (error) {
        // ストリーミング途中のエラー。既にヘッダーは送信済みのため
        // ストリームを中断し、フロント側でエラートーストを表示させる。
        controller.error(error);
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
