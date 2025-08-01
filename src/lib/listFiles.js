import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const VIDEO_EXT = new Set(['.mp4', '.mkv', '.mov', '.avi', '.webm', '.ts']);

export function listVideoFiles(dir) {
  try {
    const files = fs.readdirSync(dir).flatMap((name) => {
      const full = path.join(dir, name);
      const stat = fs.statSync(full);

      if (stat.isDirectory()) return listVideoFiles(full);
      if (VIDEO_EXT.has(path.extname(full).toLowerCase())) {
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

    // Sort by creation time, newest first
    return files.sort((a, b) => new Date(b.created) - new Date(a.created));
  } catch (error) {
    console.error('Error listing files:', error);
    return [];
  }
}