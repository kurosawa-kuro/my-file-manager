import { generateThumbnail } from '../../lib/thumbnail';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';

// モックの設定
jest.mock('fluent-ffmpeg');
jest.mock('fs');
jest.mock('path');

const mockPath = {
  join: jest.fn(),
  cwd: jest.fn()
};

const mockFs = {
  existsSync: jest.fn(),
  mkdirSync: jest.fn()
};

const mockFfmpeg = {
  screenshots: jest.fn().mockReturnThis(),
  on: jest.fn().mockReturnThis()
};

// モジュールのモック
path.join = mockPath.join;
fs.existsSync = mockFs.existsSync;
fs.mkdirSync = mockFs.mkdirSync;
ffmpeg.mockReturnValue(mockFfmpeg);

describe('thumbnail', () => {
  const mockVideoPath = '/path/to/video.mp4';
  const mockVideoId = 'test-video-123';
  const mockThumbnailDir = '/mock/thumbnails';
  const mockThumbnailPath = '/mock/thumbnails/test-video-123.jpg';

  beforeEach(() => {
    jest.clearAllMocks();
    
    // デフォルトのモック設定
    mockPath.join.mockImplementation((...args) => {
      // THUMBNAIL_DIR construction: path.join(process.cwd(), 'public', 'thumbnails')
      if (args.length === 3 && args[0] === '/mock/cwd' && args[1] === 'public' && args[2] === 'thumbnails') {
        return mockThumbnailDir;
      }
      // thumbnailPath construction: path.join(THUMBNAIL_DIR, `${videoId}.jpg`)
      if (args.length === 2 && args[0] === mockThumbnailDir && args[1] === 'test-video-123.jpg') {
        return mockThumbnailPath;
      }
      return args.join('/');
    });
    
    process.cwd = jest.fn().mockReturnValue('/mock/cwd');
  });

  describe('generateThumbnail', () => {
    it('returns existing thumbnail path if thumbnail already exists', async () => {
      mockFs.existsSync.mockReturnValue(true);

      const result = await generateThumbnail(mockVideoPath, mockVideoId);

      expect(result).toBe('/thumbnails/test-video-123.jpg');
      expect(mockFs.existsSync).toHaveBeenCalledWith(mockThumbnailPath);
      expect(mockFfmpeg.screenshots).not.toHaveBeenCalled();
    });

    it('generates new thumbnail when it does not exist', async () => {
      mockFs.existsSync.mockReturnValue(false);

      // ffmpegの成功コールバックをシミュレート
      mockFfmpeg.on.mockImplementation((event, callback) => {
        if (event === 'end') {
          setTimeout(() => callback(), 0);
        }
        return mockFfmpeg;
      });

      const resultPromise = generateThumbnail(mockVideoPath, mockVideoId);

      // 非同期処理を待つ
      const result = await resultPromise;

      expect(result).toBe('/thumbnails/test-video-123.jpg');
      expect(mockFfmpeg.screenshots).toHaveBeenCalledWith({
        timestamps: ['10%'],
        filename: 'test-video-123.jpg',
        folder: mockThumbnailDir,
        size: '320x240'
      });
    });

    it('rejects promise when ffmpeg encounters an error', async () => {
      mockFs.existsSync.mockReturnValue(false);

      const mockError = new Error('FFmpeg error');

      // ffmpegのエラーコールバックをシミュレート
      mockFfmpeg.on.mockImplementation((event, callback) => {
        if (event === 'error') {
          setTimeout(() => callback(mockError), 0);
        }
        return mockFfmpeg;
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(generateThumbnail(mockVideoPath, mockVideoId)).rejects.toThrow('FFmpeg error');

      expect(consoleSpy).toHaveBeenCalledWith('Thumbnail generation error:', mockError);
      consoleSpy.mockRestore();
    });

    it('creates thumbnail directory if it does not exist', async () => {
      mockFs.existsSync
        .mockReturnValueOnce(false) // THUMBNAIL_DIR check
        .mockReturnValueOnce(false); // thumbnailPath check

      mockFfmpeg.on.mockImplementation((event, callback) => {
        if (event === 'end') {
          setTimeout(() => callback(), 0);
        }
        return mockFfmpeg;
      });

      await generateThumbnail(mockVideoPath, mockVideoId);

      expect(mockFs.mkdirSync).toHaveBeenCalledWith(mockThumbnailDir, { recursive: true });
    });

    it('does not create thumbnail directory if it already exists', async () => {
      mockFs.existsSync
        .mockReturnValueOnce(true) // THUMBNAIL_DIR exists
        .mockReturnValueOnce(false); // thumbnailPath does not exist

      mockFfmpeg.on.mockImplementation((event, callback) => {
        if (event === 'end') {
          setTimeout(() => callback(), 0);
        }
        return mockFfmpeg;
      });

      await generateThumbnail(mockVideoPath, mockVideoId);

      expect(mockFs.mkdirSync).not.toHaveBeenCalled();
    });

    it('uses correct path construction for thumbnail directory', () => {
      mockFs.existsSync.mockReturnValue(false);

      // モジュールを再読み込みしてTHUMBNAIL_DIRの構築をテスト
      jest.resetModules();
      require('../../lib/thumbnail');

      expect(mockPath.join).toHaveBeenCalledWith('/mock/cwd', 'public', 'thumbnails');
    });

    it('uses correct path construction for thumbnail file', async () => {
      mockFs.existsSync.mockReturnValue(false);

      mockFfmpeg.on.mockImplementation((event, callback) => {
        if (event === 'end') {
          setTimeout(() => callback(), 0);
        }
        return mockFfmpeg;
      });

      await generateThumbnail(mockVideoPath, mockVideoId);

      expect(mockPath.join).toHaveBeenCalledWith(mockThumbnailDir, 'test-video-123.jpg');
    });
  });
}); 