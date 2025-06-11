import WebSocket from "ws";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// .envファイルを読み込み
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS設定
app.use(cors());

// 静的ファイル配信（HTMLファイル用）
app.use(express.static(__dirname));

// エフェメラルキーを生成するエンドポイント
app.get("/session", async (req, res) => {
  try {
    const r = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2025-06-03",
        voice: "verse",
        modalities: ["text"], // テキストのみに制限
      }),
    });
    const data = await r.json();
    res.send(data);
  } catch (error) {
    console.error("セッション作成エラー:", error);
    res.status(500).send({ error: "セッション作成に失敗しました" });
  }
});

// WebSocket接続を開始する関数
async function connectToRealtime() {
  try {
    // まずエフェメラルキーを取得
    const tokenResponse = await fetch("http://localhost:3000/session");
    const sessionData = await tokenResponse.json();
    const ephemeralKey = sessionData.client_secret.value;

    console.log("エフェメラルキーを取得しました");

    // WebSocket接続
    const url = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2025-06-03";
    const ws = new WebSocket(url, {
      headers: {
        "Authorization": `Bearer ${ephemeralKey}`,
        "OpenAI-Beta": "realtime=v1",
      },
    });

    ws.on("open", function open() {
      console.log("Realtime APIに接続しました");
      
      // セッションを設定（テキストのみ）
      const sessionConfig = {
        type: "session.update",
        session: {
          modalities: ["text"],
          instructions: "あなたは親切なアシスタントです。簡潔に日本語で回答してください。",
          voice: "verse",
          input_audio_format: "pcm16",
          output_audio_format: "pcm16",
          input_audio_transcription: {
            model: "whisper-1"
          },
          turn_detection: {
            type: "server_vad",
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 200
          },
          tools: [],
          tool_choice: "auto",
          temperature: 0.8,
          max_response_output_tokens: "inf"
        }
      };

      ws.send(JSON.stringify(sessionConfig));

      // テスト用メッセージを送信
      setTimeout(() => {
        const message = {
          type: "conversation.item.create",
          item: {
            type: "message",
            role: "user",
            content: [
              {
                type: "input_text",
                text: "こんにちは！元気ですか？"
              }
            ]
          }
        };
        ws.send(JSON.stringify(message));
        
        // レスポンス生成を要求
        const responseCreate = {
          type: "response.create",
          response: {
            modalities: ["text"]
          }
        };
        ws.send(JSON.stringify(responseCreate));
      }, 1000);
    });

    ws.on("message", function incoming(message) {
      const data = JSON.parse(message.toString());
      console.log("受信イベント:", data.type);
      
      // テキストレスポンスのみ表示
      if (data.type === "response.text.delta") {
        process.stdout.write(data.delta);
      } else if (data.type === "response.text.done") {
        console.log("\n--- レスポンス完了 ---");
      } else if (data.type === "error") {
        console.error("エラー:", data.error);
      }
    });

    ws.on("error", function error(err) {
      console.error("WebSocketエラー:", err);
    });

    ws.on("close", function close() {
      console.log("接続が閉じられました");
    });

  } catch (error) {
    console.error("接続エラー:", error);
  }
}

// サーバー起動
app.listen(3000, () => {
  console.log("サーバーがポート3000で起動しました");
  console.log("ブラウザで http://localhost:3000 にアクセスしてください");
  
  // サーバー起動後にWebSocket接続を開始（テスト用）
  setTimeout(() => {
    console.log("テスト用Realtime API接続中...");
    connectToRealtime();
  }, 1000);
});

// 環境変数チェック
if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY環境変数が設定されていません");
  process.exit(1);
}