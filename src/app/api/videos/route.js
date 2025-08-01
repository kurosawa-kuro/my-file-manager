import { listVideoFiles } from '../../../lib/listFiles.js';
import { NextResponse } from 'next/server';
import { DEFAULT_CONFIG } from '../../../lib/config.js';
import ConfigManager from '../../../lib/configManager.js';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  
  // Load config
  let config = DEFAULT_CONFIG;
  try {
    const configManager = new ConfigManager();
    config = configManager.loadConfig();
  } catch (error) {
    console.log('Using default config:', error.message);
  }
  
  // 設定ファイルのenvironmentセクションを優先、フォールバックとして環境変数を使用
  const videoDir = config?.environment?.videoDir || process.env.VIDEO_DIR;
  const envSortOrder = config?.environment?.fileSortOrder !== undefined ? config.environment.fileSortOrder : 
                      (process.env.NEXT_PUBLIC_FILE_SORT_ORDER || process.env.FILE_SORT_ORDER);
  const querySortOrder = searchParams.get('sort');
  const sortOrder = querySortOrder || envSortOrder || 'newest';
  
  const isQqqOnly = config?.environment?.isQqqOnly !== undefined ? config.environment.isQqqOnly : 
                   (process.env.NEXT_PUBLIC_IS_QQQ_ONLY === 'true' || process.env.IS_QQQ_ONLY === 'true' || config.directory.isQqqOnly);

  if (!videoDir) {
    return NextResponse.json(
      { error: '動画ディレクトリが未設定です。' },
      { status: 500 }
    );
  }

  try {
    const files = listVideoFiles(videoDir, sortOrder, config);
    const videos = files.map(file => ({
      ...file,
      thumbnailUrl: `/api/videos/${file.id}/thumbnail`
    }));
    
    return NextResponse.json({ 
      videos, 
      sortOrder,
      isQqqOnly,
      directory: isQqqOnly ? `${videoDir}/qqq` : videoDir
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'ファイル一覧の取得に失敗しました。' },
      { status: 500 }
    );
  }
}