import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';

const THUMBNAIL_DIR = path.join(process.cwd(), 'public', 'thumbnails');

// Ensure thumbnail directory exists
if (!fs.existsSync(THUMBNAIL_DIR)) {
  fs.mkdirSync(THUMBNAIL_DIR, { recursive: true });
}

export function generateThumbnail(videoPath, videoId) {
  return new Promise((resolve, reject) => {
    const thumbnailPath = path.join(THUMBNAIL_DIR, `${videoId}.jpg`);
    
    // Check if thumbnail already exists
    if (fs.existsSync(thumbnailPath)) {
      resolve(`/thumbnails/${videoId}.jpg`);
      return;
    }

    ffmpeg(videoPath)
      .screenshots({
        timestamps: ['10%'],
        filename: `${videoId}.jpg`,
        folder: THUMBNAIL_DIR,
        size: '320x240'
      })
      .on('end', () => {
        resolve(`/thumbnails/${videoId}.jpg`);
      })
      .on('error', (err) => {
        console.error('Thumbnail generation error:', err);
        reject(err);
      });
  });
}