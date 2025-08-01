import { listVideoFiles } from '../../../lib/listFiles.js';
import { NextResponse } from 'next/server';

export async function GET() {
  const { VIDEO_DIR } = process.env;

  if (!VIDEO_DIR) {
    return NextResponse.json(
      { error: '環境変数 VIDEO_DIR が未設定です。' },
      { status: 500 }
    );
  }

  try {
    const files = listVideoFiles(VIDEO_DIR);
    const videos = files.map(file => ({
      ...file,
      thumbnailUrl: `/api/videos/${file.id}/thumbnail`
    }));
    
    return NextResponse.json({ videos });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'ファイル一覧の取得に失敗しました。' },
      { status: 500 }
    );
  }
}