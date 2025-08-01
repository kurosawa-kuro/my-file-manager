/**
 * FFmpeg セットアップスクリプト
 * 
 * このスクリプトは開発環境でのFFmpegセットアップをガイドします。
 * 実際のインストールは手動で行う必要があります。
 */

const fs = require('fs');
const path = require('path');

console.log('🎬 Video File Manager - FFmpeg セットアップガイド');
console.log('================================================');
console.log('');

// FFmpegがインストールされているかチェック
function checkFFmpeg() {
  const { execSync } = require('child_process');
  try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
    console.log('✅ FFmpeg は既にインストールされています');
    return true;
  } catch (error) {
    console.log('❌ FFmpeg がインストールされていません');
    return false;
  }
}

// セットアップ手順を表示
function showSetupInstructions() {
  console.log('');
  console.log('📋 FFmpeg インストール手順:');
  console.log('');
  
  if (process.platform === 'win32') {
    console.log('Windows:');
    console.log('1. https://ffmpeg.org/download.html#build-windows からFFmpegをダウンロード');
    console.log('2. 解凍してPATHに追加');
    console.log('3. または Chocolatey: choco install ffmpeg');
    console.log('4. または winget: winget install ffmpeg');
  } else if (process.platform === 'darwin') {
    console.log('macOS:');
    console.log('1. Homebrew: brew install ffmpeg');
    console.log('2. または MacPorts: port install ffmpeg');
  } else {
    console.log('Linux:');
    console.log('1. Ubuntu/Debian: sudo apt install ffmpeg');
    console.log('2. CentOS/RHEL: sudo yum install ffmpeg');
    console.log('3. または公式サイトからビルド');
  }
  
  console.log('');
  console.log('インストール後、以下のコマンドで確認してください:');
  console.log('ffmpeg -version');
}

// サムネイルディレクトリの作成
function createThumbnailDirectory() {
  const thumbnailDir = path.join(process.cwd(), 'public', 'thumbnails');
  
  if (!fs.existsSync(thumbnailDir)) {
    fs.mkdirSync(thumbnailDir, { recursive: true });
    console.log('📁 サムネイルディレクトリを作成しました:', thumbnailDir);
  } else {
    console.log('📁 サムネイルディレクトリは既に存在します:', thumbnailDir);
  }
}

// メイン実行
function main() {
  const ffmpegInstalled = checkFFmpeg();
  
  if (!ffmpegInstalled) {
    showSetupInstructions();
    console.log('');
    console.log('⚠️  FFmpegをインストールしてから再度実行してください');
    process.exit(1);
  }
  
  createThumbnailDirectory();
  
  console.log('');
  console.log('🎉 セットアップ完了！');
  console.log('');
  console.log('次のステップ:');
  console.log('1. npm run dev でアプリケーションを起動');
  console.log('2. http://localhost:8080 でアクセス');
  console.log('3. 動画ディレクトリを確認: ' + (process.env.VIDEO_DIR || 'C:\\Users\\owner\\Downloads\\Video'));
}

main();