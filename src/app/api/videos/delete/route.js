import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { DEFAULT_CONFIG } from '../../../../lib/config.js';
import { getConfigManager } from '../../../../lib/unifiedConfigManager.js';

export async function DELETE(request) {
  try {
    const { videoId } = await request.json();
    
    if (!videoId) {
      return NextResponse.json(
        { error: 'videoId は必須です。' },
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
    const filePath = path.join(videoDir, videoId);
    
    // ファイルが存在するかチェック
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'ファイルが見つかりません。' },
        { status: 404 }
      );
    }

    // ファイルを削除
    fs.unlinkSync(filePath);

    return NextResponse.json({
      success: true,
      message: 'ファイルを削除しました。',
      videoId
    });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: `ファイルの削除に失敗しました: ${error.message}` },
      { status: 500 }
    );
  }
}