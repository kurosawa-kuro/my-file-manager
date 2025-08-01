# Video File Manager

ローカル動画ファイルの一覧表示・サムネイル生成・再生を行うNext.jsアプリケーション

## 🚀 クイックスタート

### 1. 依存関係のインストール

```bash
npm install
```

### 2. FFmpegのセットアップ

サムネイル生成にFFmpegが必要です。

**Windows:**
```bash
# Chocolatey
choco install ffmpeg

# または winget
winget install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt install ffmpeg

# CentOS/RHEL
sudo yum install ffmpeg
```

### 3. 環境変数の設定

`.env.local` ファイルで動画ディレクトリを設定（既に設定済み）：

```
VIDEO_DIR=C:\\Users\\owner\\Downloads\\Video
```

### 4. 開発サーバーの起動

```bash
# プロジェクトルートから
make dev

# または直接
cd src && npm run dev
```

### 5. アプリケーションへのアクセス

ブラウザで [http://localhost:8080](http://localhost:8080) を開きます。

## 📁 対応ファイル形式

- `.mp4`
- `.mkv` 
- `.mov`
- `.avi`
- `.webm`

## 🎨 機能

- **動画一覧表示**: グリッドレイアウトでカード形式
- **サムネイル生成**: FFmpegによる自動生成とキャッシュ
- **動画再生**: HTML5 videoプレーヤー（ストリーミング対応）
- **ダークモード**: ライト/ダーク切り替え
- **レスポンシブ**: モバイル対応UI

## 🛠 開発コマンド

```bash
# 開発サーバー（ポート8080）
make dev

# プロダクションビルド
make build

# プロダクション起動
make start

# コードのリント
make lint

# FFmpegセットアップ確認
node src/scripts/setup-ffmpeg.js
```

## 📂 ディレクトリ構造

```
src/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   └── videos/        # 動画関連API
│   │   ├── layout.js          # ルートレイアウト
│   │   └── page.js            # メインページ
│   ├── components/            # Reactコンポーネント
│   │   ├── VideoCard.js       # 動画カード
│   │   ├── VideoPlayer.js     # 動画プレーヤー
│   │   ├── ThemeProvider.js   # テーマプロバイダー
│   │   └── ThemeToggle.js     # テーマ切り替え
│   ├── lib/                   # ユーティリティ
│   │   ├── listFiles.js       # ファイル一覧取得
│   │   └── thumbnail.js       # サムネイル生成
│   └── scripts/               # セットアップスクリプト
└── public/
    └── thumbnails/            # 生成されたサムネイル
```

## ⚠️ 注意事項

- **ローカル実行専用**: ファイルシステムに直接アクセスするため、Vercel等へのデプロイは非対応
- **FFmpeg必須**: サムネイル生成にFFmpegが必要
- **セキュリティ**: パストラバーサル対策済み（環境変数で指定されたディレクトリのみアクセス可能）

## 🔧 トラブルシューティング

### サムネイルが表示されない
1. FFmpegがインストールされているか確認: `ffmpeg -version`
2. 動画ファイルが対応形式か確認
3. ディスクの空き容量を確認

### 動画が再生されない
1. ブラウザが対応しているファイル形式か確認
2. ファイルが破損していないか確認
3. ネットワーク接続を確認

### 動画が表示されない
1. VIDEO_DIRが正しく設定されているか確認
2. 指定されたディレクトリに動画ファイルが存在するか確認
3. ファイルアクセス権限を確認