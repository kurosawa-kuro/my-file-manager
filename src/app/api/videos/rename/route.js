import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { DEFAULT_CONFIG } from '../../../../lib/config.js';
import { getConfigManager } from '../../../../lib/unifiedConfigManager.js';

export async function POST(request) {
  try {
    const { videoId, newName } = await request.json();
    
    if (!videoId || !newName) {
      return NextResponse.json(
        { error: 'videoId と newName は必須です。' },
        { status: 400 }
      );
    }

    // Load config
    let config = DEFAULT_CONFIG;
    try {
      const configManager = await getConfigManager();
      config = await configManager.getConfigForAPI();
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

    // ファイルパスを構築
    const oldFilePath = path.join(videoDir, videoId);
    const newFilePath = path.join(videoDir, newName);
    
    // ファイルが存在するかチェック
    if (!fs.existsSync(oldFilePath)) {
      return NextResponse.json(
        { error: 'ファイルが見つかりません。' },
        { status: 404 }
      );
    }

    // 新しいファイル名が既に存在するかチェック
    if (fs.existsSync(newFilePath)) {
      return NextResponse.json(
        { error: '指定されたファイル名は既に存在します。' },
        { status: 409 }
      );
    }

    // ファイルをリネーム
    fs.renameSync(oldFilePath, newFilePath);

    return NextResponse.json({
      success: true,
      message: 'ファイル名を変更しました。',
      oldName: videoId,
      newName: newName
    });
  } catch (error) {
    console.error('Rename error:', error);
    return NextResponse.json(
      { error: `ファイル名の変更に失敗しました: ${error.message}` },
      { status: 500 }
    );
  }
}