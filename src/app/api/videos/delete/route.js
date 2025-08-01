import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { listVideoFiles } from '../../../../lib/listFiles.js';

export async function POST(request) {
  try {
    const { videoId, fileName } = await request.json();
    
    if (!videoId || !fileName) {
      return NextResponse.json(
        { error: 'videoId と fileName は必須です。' },
        { status: 400 }
      );
    }

    const { VIDEO_DIR } = process.env;
    
    if (!VIDEO_DIR) {
      return NextResponse.json(
        { error: '環境変数 VIDEO_DIR が未設定です。' },
        { status: 500 }
      );
    }

    // 削除予定フォルダパス
    const deleteFolderPath = 'C:\\Users\\owner\\Downloads\\Video_Local\\delete';
    
    // 削除予定フォルダが存在しない場合は作成
    if (!fs.existsSync(deleteFolderPath)) {
      fs.mkdirSync(deleteFolderPath, { recursive: true });
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

    // 実際のファイルパス
    const actualFilePath = targetVideo.path;
    const actualFileName = path.basename(actualFilePath);
    
    // 移動先ファイルパス
    const targetFilePath = path.join(deleteFolderPath, actualFileName);
    
    // ファイルが存在するかチェック
    if (!fs.existsSync(actualFilePath)) {
      return NextResponse.json(
        { error: `ファイルが見つかりません: ${actualFilePath}` },
        { status: 404 }
      );
    }

    // ファイルを削除予定フォルダに移動
    fs.renameSync(actualFilePath, targetFilePath);
    
    return NextResponse.json({ 
      success: true, 
      message: `ファイル "${actualFileName}" を削除予定フォルダに移動しました。` 
    });
    
  } catch (error) {
    console.error('Delete move error:', error);
    return NextResponse.json(
      { error: `ファイルの移動に失敗しました: ${error.message}` },
      { status: 500 }
    );
  }
}