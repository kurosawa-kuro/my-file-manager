import { listVideoFiles } from '../../../../../lib/listFiles.js';
import { generateThumbnail } from '../../../../../lib/thumbnail.js';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { DEFAULT_CONFIG } from '../../../../../lib/config.js';
import ConfigManager from '../../../../../lib/configManager.js';

export async function GET(request, { params }) {
  const { id } = (await params);

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

  try {
    const files = listVideoFiles(videoDir);
    const video = files.find(file => file.id === id);

    if (!video) {
      return NextResponse.json(
        { error: 'ビデオファイルが見つかりません。' },
        { status: 404 }
      );
    }

    const thumbnailUrl = await generateThumbnail(video.path, video.id);
    const thumbnailPath = path.join(process.cwd(), 'public', thumbnailUrl);
    
    if (!fs.existsSync(thumbnailPath)) {
      return NextResponse.json(
        { error: 'サムネイルの生成に失敗しました。' },
        { status: 500 }
      );
    }

    const imageBuffer = fs.readFileSync(thumbnailPath);
    
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Content-Length': imageBuffer.length.toString()
      }
    });
  } catch (err) {
    console.error('Thumbnail error:', err);
    return NextResponse.json(
      { error: 'サムネイルの取得に失敗しました。' },
      { status: 500 }
    );
  }
}