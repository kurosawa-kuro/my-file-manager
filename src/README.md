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

### 3. 設定管理

#### 方法1: 設定モーダル（推奨）
アプリケーション内の設定モーダルから変更可能です：
1. 右上の設定ボタン（⚙️）をクリック
2. 「環境設定」タブで以下を設定：
   - **動画ディレクトリ**: 動画ファイルの格納場所
   - **ファイル表示順番**: `newest`（新しい順）または`name`（名前順）
   - **QQQモード**: 特定フォルダ（qqq）のみ表示

#### 方法2: 環境変数
`.env.local` ファイルで設定（従来の方法）：

```
VIDEO_DIR=C:\\Users\\owner\\Downloads\\Video
NEXT_PUBLIC_FILE_SORT_ORDER=name
NEXT_PUBLIC_IS_QQQ_ONLY=true
```

**設定の優先順位:**
1. 設定モーダルの「環境設定」タブ
2. 環境変数（`.env.local`）
3. デフォルト値

**注意:** 設定モーダルでの変更は即座に反映されますが、環境変数の変更はアプリケーション再起動が必要です。

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
- **ファイル表示順番**: 新しいファイル順番・ファイル名順番の切り替え
- **QQQモード**: 特定フォルダ（qqq）のみの表示機能
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