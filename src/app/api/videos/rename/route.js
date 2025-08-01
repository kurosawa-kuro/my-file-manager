import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { listVideoFiles } from '../../../../lib/listFiles.js';
import { DEFAULT_CONFIG } from '../../../../lib/config.js';
import ConfigManager from '../../../../lib/configManager.js';

export async function POST(request) {
  try {
    const { videoId, fileName, suffix } = await request.json();
    
    if (!videoId || !fileName || !suffix) {
      return NextResponse.json(
        { error: 'videoId、fileName、suffix は必須です。' },
        { status: 400 }
      );
    }

    // Load config
    let config = DEFAULT_CONFIG;
    try {
      const configManager = new ConfigManager();
      config = configManager.loadConfig();
    } catch (error) {
      console.log('Using default config:', error.message);
    }
    
    const videoDir = config?.environment?.videoDir || process.env.VIDEO_DIR;
    
    if (!videoDir) {
      return NextResponse.json(
        { error: '動画ディレクトリが未設定です。' },
        { status: 500 }
      );
    }

    // ビデオファイルリストから実際のファイルを検索
    const videoFiles = listVideoFiles(videoDir);
    const targetVideo = videoFiles.find(video => video.id === videoId);
    
    if (!targetVideo) {
      return NextResponse.json(
        { error: `ビデオが見つかりません。ID: ${videoId}` },
        { status: 404 }
      );
    }

    // 実際のファイルパス
    const actualFilePath = targetVideo.path;
    const actualFileName = path.basename(actualFilePath);
    
    // ファイル名と拡張子を分離
    const ext = path.extname(actualFileName);
    const nameWithoutExt = path.basename(actualFileName, ext);
    
    // 新しいファイル名を作成（末尾にsuffixを追加）
    const newFileName = `${nameWithoutExt}${suffix}${ext}`;
    const newFilePath = path.join(path.dirname(actualFilePath), newFileName);
    
    // ファイルが存在するかチェック
    if (!fs.existsSync(actualFilePath)) {
      return NextResponse.json(
        { error: `ファイルが見つかりません: ${actualFilePath}` },
        { status: 404 }
      );
    }

    // 新しいファイル名が既に存在するかチェック
    if (fs.existsSync(newFilePath)) {
      return NextResponse.json(
        { error: `同名のファイルが既に存在します: ${newFileName}` },
        { status: 409 }
      );
    }

    // ファイル名を変更
    fs.renameSync(actualFilePath, newFilePath);
    
    return NextResponse.json({ 
      success: true, 
      message: `ファイル名を "${newFileName}" に変更しました。`,
      newFileName: newFileName
    });
    
  } catch (error) {
    console.error('Rename error:', error);
    return NextResponse.json(
      { error: `ファイル名の変更に失敗しました: ${error.message}` },
      { status: 500 }
    );
  }
}