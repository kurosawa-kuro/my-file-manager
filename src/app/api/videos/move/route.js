import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { DEFAULT_CONFIG } from '../../../../lib/config.js';
import { getConfigManager } from '../../../../lib/unifiedConfigManager.js';

export async function POST(request) {
  try {
    const { sourcePath, destinationPath } = await request.json();
    
    if (!sourcePath || !destinationPath) {
      return NextResponse.json(
        { error: 'sourcePath と destinationPath は必須です。' },
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

    const fullSourcePath = path.join(videoDir, sourcePath);
    const fullDestinationPath = path.join(videoDir, destinationPath);

    // ファイルが存在するかチェック
    if (!fs.existsSync(fullSourcePath)) {
      return NextResponse.json(
        { error: 'ソースファイルが見つかりません。' },
        { status: 404 }
      );
    }

    // 移動先のディレクトリを作成
    const destinationDir = path.dirname(fullDestinationPath);
    if (!fs.existsSync(destinationDir)) {
      fs.mkdirSync(destinationDir, { recursive: true });
    }

    // ファイルを移動
    fs.renameSync(fullSourcePath, fullDestinationPath);

    return NextResponse.json({
      success: true,
      message: 'ファイルを移動しました。',
      sourcePath,
      destinationPath
    });
  } catch (error) {
    console.error('Move error:', error);
    return NextResponse.json(
      { error: `ファイルの移動に失敗しました: ${error.message}` },
      { status: 500 }
    );
  }
}