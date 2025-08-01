import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const VIDEO_EXT = new Set(['.mp4', '.mkv', '.mov', '.avi', '.webm', '.ts']);

export function listVideoFiles(dir, sortOrder = null, config = null) {
  try {
    // Check if IS_QQQ_ONLY is enabled (environment variable or config)
    // 設定ファイルのenvironmentセクションを優先、フォールバックとして環境変数を使用
    const isQqqOnly = (config?.environment?.isQqqOnly !== undefined ? config.environment.isQqqOnly : 
                      process.env.NEXT_PUBLIC_IS_QQQ_ONLY === 'true' || process.env.IS_QQQ_ONLY === 'true' || 
                      (config?.directory?.isQqqOnly === true));
    
    // If IS_QQQ_ONLY is true, only scan the qqq subdirectory
    if (isQqqOnly) {
      const qqqDir = path.join(dir, 'qqq');
      if (!fs.existsSync(qqqDir)) {
        if (process.env.NODE_ENV === 'development') {
          console.log('QQQ directory not found:', qqqDir)
        }
        return [];
      }
      dir = qqqDir;
    }

    const files = fs.readdirSync(dir).flatMap((name) => {
      const full = path.join(dir, name);
      const stat = fs.statSync(full);

      if (stat.isDirectory()) return listVideoFiles(full);
      if (VIDEO_EXT.has(path.extname(full).toLowerCase())) {
        // QQQモードの場合、ファイル名に'ggg'が含まれるファイルを除外
        if (isQqqOnly && name.toLowerCase().includes('ggg')) {
          if (process.env.NODE_ENV === 'development') {
            console.log('Excluding file with "ggg" in filename:', name)
          }
          return [];
        }
        
        // Generate unique ID for each file
        const id = crypto.createHash('md5').update(full).digest('hex');
        return [{
          id,
          path: full,
          name: path.basename(full),
          folder: path.dirname(full),
          size: stat.size,
          modified: stat.mtime.toISOString(),
          created: stat.birthtime.toISOString(),
          extension: path.extname(full).toLowerCase()
        }];
      }
      return [];
    });

    // Determine sort order from config, parameter, environment variable, or default
    // 設定ファイルのenvironmentセクションを優先、フォールバックとして環境変数を使用
    const fileSortOrder = sortOrder || 
                         (config?.environment?.fileSortOrder !== undefined ? config.environment.fileSortOrder : 
                          process.env.NEXT_PUBLIC_FILE_SORT_ORDER || process.env.FILE_SORT_ORDER || 'newest');
    
    // Sort files based on the specified order
    if (fileSortOrder === 'name') {
      // Sort by filename (alphabetical order)
      return files.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
    } else {
      // Default: Sort by creation time, newest first
      return files.sort((a, b) => new Date(b.created) - new Date(a.created));
    }
  } catch (error) {
    console.error('Error listing files:', error);
    return [];
  }
}