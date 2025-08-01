import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { generateThumbnail } from '../../../../../lib/thumbnail.js';
import { listVideoFiles } from '../../../../../lib/listFiles.js';
import { getConfigManager } from '../../../../../lib/unifiedConfigManager.js';
import { DEFAULT_CONFIG } from '../../../../../lib/config.js';

export async function GET(request, { params }) {
  const { id } = params;
  
  if (!id) {
    return NextResponse.json(
      { error: 'ビデオIDが必要です。' },
      { status: 400 }
    );
  }

  try {
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

    // ビデオファイルリストから対象ファイルを検索
    const videoFiles = listVideoFiles(videoDir);
    const targetVideo = videoFiles.find(video => video.id === id);
    
    if (!targetVideo) {
      return NextResponse.json(
        { error: `ビデオが見つかりません。ID: ${id}` },
        { status: 404 }
      );
    }

    const thumbnailPath = path.join(process.cwd(), 'public', 'thumbnails', `${id}.jpg`);
    
    // サムネイルが既に存在する場合はそれを返す
    if (fs.existsSync(thumbnailPath)) {
      const thumbnailBuffer = fs.readFileSync(thumbnailPath);
      return new NextResponse(thumbnailBuffer, {
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=3600'
        }
      });
    }

    // サムネイルを生成
    const thumbnailBuffer = await generateThumbnail(targetVideo.path);
    
    // サムネイルディレクトリが存在しない場合は作成
    const thumbnailDir = path.dirname(thumbnailPath);
    if (!fs.existsSync(thumbnailDir)) {
      fs.mkdirSync(thumbnailDir, { recursive: true });
    }
    
    // サムネイルを保存
    fs.writeFileSync(thumbnailPath, thumbnailBuffer);
    
    return new NextResponse(thumbnailBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    return NextResponse.json(
      { error: 'サムネイルの生成に失敗しました。' },
      { status: 500 }
    );
  }
}