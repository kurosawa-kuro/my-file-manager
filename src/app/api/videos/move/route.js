import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { listVideoFiles } from '../../../../lib/listFiles.js';

export async function POST(request) {
  try {
    const { videoId, fileName } = await request.json();
    
    console.log('Move request:', { videoId, fileName });
    
    if (!videoId || !fileName) {
      return NextResponse.json(
        { error: 'videoId と fileName は必須です。' },
        { status: 400 }
      );
    }

    const { VIDEO_DIR } = process.env;
    
    console.log('VIDEO_DIR:', VIDEO_DIR);
    
    if (!VIDEO_DIR) {
      return NextResponse.json(
        { error: '環境変数 VIDEO_DIR が未設定です。' },
        { status: 500 }
      );
    }

    // 移動先のフォルダパス
    const qqqFolderPath = 'C:\\Users\\owner\\Downloads\\Video\\qqq';
    
    // 移動先フォルダが存在しない場合は作成
    if (!fs.existsSync(qqqFolderPath)) {
      fs.mkdirSync(qqqFolderPath, { recursive: true });
      console.log('Created qqq folder');
    }

    // ビデオファイルリストから実際のファイルを検索
    const videoFiles = listVideoFiles(VIDEO_DIR);
    const targetVideo = videoFiles.find(video => video.id === videoId);
    
    if (!targetVideo) {
      return NextResponse.json(
        { error: `ビデオが見つかりません。ID: ${videoId}` },
        { status: 404 }
      );
    }

    // 実際のファイルパス（listFiles.jsから取得したパス）
    const actualFilePath = targetVideo.path;
    const actualFileName = path.basename(actualFilePath);
    
    // 移動先ファイルパス
    const targetFilePath = path.join(qqqFolderPath, actualFileName);
    
    console.log('Paths:', {
      actualFilePath,
      targetFilePath,
      actualFileName,
      exists: fs.existsSync(actualFilePath)
    });
    
    // ファイルが存在するかチェック
    if (!fs.existsSync(actualFilePath)) {
      return NextResponse.json(
        { error: `ファイルが見つかりません: ${actualFilePath}` },
        { status: 404 }
      );
    }

    // ファイルを移動
    fs.renameSync(actualFilePath, targetFilePath);
    
    console.log('File moved successfully');
    
    return NextResponse.json({ 
      success: true, 
      message: `ファイル "${actualFileName}" をqqqフォルダに移動しました。` 
    });
    
  } catch (error) {
    console.error('File move error:', error);
    return NextResponse.json(
      { error: `ファイルの移動に失敗しました: ${error.message}` },
      { status: 500 }
    );
  }
}