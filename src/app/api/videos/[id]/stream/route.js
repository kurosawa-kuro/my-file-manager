import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getConfigManager } from '../../../../../lib/unifiedConfigManager.js';
import { DEFAULT_CONFIG } from '../../../../../lib/config.js';
import { listVideoFiles } from '../../../../../lib/listFiles.js';

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

    const filePath = targetVideo.path;
    
    // ファイルが存在するかチェック
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'ファイルが見つかりません。' },
        { status: 404 }
      );
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = request.headers.get('range');

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      return new NextResponse(file, { status: 206, headers: head });
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      const file = fs.createReadStream(filePath);
      return new NextResponse(file, { headers: head });
    }
  } catch (error) {
    console.error('Stream error:', error);
    return NextResponse.json(
      { error: 'ビデオストリーミングに失敗しました。' },
      { status: 500 }
    );
  }
}