# OpenAI Realtime API テキストチャット

OpenAI Realtime APIを使用したシンプルなテキストベースのチャットアプリケーションです。

## 機能

- リアルタイムテキストチャット
- エフェメラルキーによる安全な認証
- WebSocket接続
- レスポンシブなWebUI

## 必要な環境

- Node.js (v18以上推奨)
- OpenAI API Key

## セットアップ

### 1. 依存関係のインストール

```bash
npm install ws express dotenv cors
```

### 2. 環境変数の設定

プロジェクトルートに `.env` ファイルを作成し、OpenAI API Keyを設定します：

```
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. ファイル構成

プロジェクトフォルダに以下のファイルを配置してください：

```
project/
├── app.js          # Node.jsサーバー
├── index.html      # クライアントUI
├── .env           # 環境変数
├── package.json   # npm設定
└── README.md      # このファイル
```

## 使用方法

### 1. サーバー起動

```bash
node app.js
```

コンソールに以下が表示されます：
```
サーバーがポート3000で起動しました
ブラウザで http://localhost:3000 にアクセスしてください
```

### 2. Webクライアントアクセス

ブラウザで `http://localhost:3000` にアクセスします。

### 3. チャット開始

1. 「接続」ボタンをクリック
2. 接続完了後、テキスト入力欄にメッセージを入力
3. Enterキーまたは「送信」ボタンでメッセージ送信
4. AIからのリアルタイム返答を確認

## アーキテクチャ

### サーバー側 (app.js)
- Express.jsによるHTTPサーバー
- エフェメラルキー生成エンドポイント (`/session`)
- 静的ファイル配信
- CORS設定
- WebSocket接続テスト機能

### クライアント側 (index.html)
- バニラJavaScriptによるWebSocketクライアント
- リアルタイムチャットUI
- エフェメラルキー取得
- メッセージ送受信

## API仕様

### エンドポイント

#### `GET /session`
エフェメラルキーを生成します。

**レスポンス例:**
```json
{
  "client_secret": {
    "value": "ephemeral_key_here"
  }
}
```

### WebSocket接続

- **URL**: `wss://api.openai.com/v1/realtime`
- **モデル**: `gpt-4o-realtime-preview-2025-06-03`
- **モダリティ**: テキストのみ

## トラブルシューティング

### よくあるエラー

#### `net::ERR_CONNECTION_REFUSED`
- サーバーが起動していない可能性があります
- `node app.js` でサーバーを起動してください

#### `CORS policy error`
- サーバー側でCORS設定が正しく行われていない
- `cors` パッケージがインストールされているか確認

#### `OPENAI_API_KEY環境変数が設定されていません`
- `.env` ファイルにAPI Keyが正しく設定されているか確認
- API Keyの有効性を確認

### ログ確認

サーバー起動時に以下のログが表示されることを確認：
```
サーバーがポート3000で起動しました
ブラウザで http://localhost:3000 にアクセスしてください
テスト用Realtime API接続中...
エフェメラルキーを取得しました
Realtime APIに接続しました
```

## 技術スタック

- **Backend**: Node.js, Express.js, WebSocket
- **Frontend**: HTML, CSS, JavaScript
- **API**: OpenAI Realtime API
- **認証**: エフェメラルトークン

## 参考資料

- [OpenAI Realtime API Documentation](https://platform.openai.com/docs/guides/realtime)
- [WebSocket API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)