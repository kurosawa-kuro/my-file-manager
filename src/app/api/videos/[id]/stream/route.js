import { listVideoFiles } from '../../../../../lib/listFiles.js';
import { NextResponse } from 'next/server';
import fs from 'fs';

export async function GET(request, { params }) {
  const { VIDEO_DIR } = process.env;
  const { id } = (await params);

  if (!VIDEO_DIR) {
    return NextResponse.json(
      { error: '環境変数 VIDEO_DIR が未設定です。' },
      { status: 500 }
    );
  }

  try {
    const files = listVideoFiles(VIDEO_DIR);
    const video = files.find(file => file.id === id);

    if (!video) {
      return NextResponse.json(
        { error: 'ビデオファイルが見つかりません。' },
        { status: 404 }
      );
    }

    const videoPath = video.path;
    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = request.headers.get('range');

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      
      return new NextResponse(file, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize.toString(),
          'Content-Type': 'video/mp4'
        }
      });
    } else {
      const file = fs.createReadStream(videoPath);
      return new NextResponse(file, {
        headers: {
          'Content-Length': fileSize.toString(),
          'Content-Type': 'video/mp4'
        }
      });
    }
  } catch (err) {
    console.error('Video streaming error:', err);
    return NextResponse.json(
      { error: 'ビデオの配信に失敗しました。' },
      { status: 500 }
    );
  }
}