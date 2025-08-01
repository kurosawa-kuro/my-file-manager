import { POST } from '../../../app/api/videos/rename/route';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { listVideoFiles } from '../../../lib/listFiles';

// モックの設定
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn()
  }
}));

jest.mock('fs');
jest.mock('path');
jest.mock('../../../lib/listFiles');

const mockFs = {
  existsSync: jest.fn(),
  renameSync: jest.fn()
};

const mockPath = {
  basename: jest.fn(),
  extname: jest.fn(),
  dirname: jest.fn(),
  join: jest.fn()
};

// モジュールのモック
fs.existsSync = mockFs.existsSync;
fs.renameSync = mockFs.renameSync;
path.basename = mockPath.basename;
path.extname = mockPath.extname;
path.dirname = mockPath.dirname;
path.join = mockPath.join;

describe('POST /api/videos/rename', () => {
  const mockVideoFiles = [
    {
      id: 'test-video-1',
      name: 'test-video.mp4',
      path: '/videos/test-video.mp4'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.VIDEO_DIR = '/videos';
    listVideoFiles.mockReturnValue(mockVideoFiles);
  });

  it('renames video file successfully', async () => {
    const requestBody = {
      videoId: 'test-video-1',
      fileName: 'test-video.mp4',
      suffix: '_renamed'
    };

    const mockRequest = {
      json: jest.fn().mockResolvedValue(requestBody)
    };

    // モックの設定
    mockFs.existsSync
      .mockReturnValueOnce(true) // source file exists
      .mockReturnValueOnce(false); // target file does not exist
    mockPath.basename
      .mockReturnValueOnce('test-video.mp4') // actualFileName
      .mockReturnValueOnce('test-video'); // nameWithoutExt
    mockPath.extname.mockReturnValue('.mp4');
    mockPath.dirname.mockReturnValue('/videos');
    mockPath.join.mockReturnValue('/videos/test-video_renamed.mp4');

    const response = await POST(mockRequest);

    expect(NextResponse.json).toHaveBeenCalledWith({
      success: true,
      message: 'ファイル名を "test-video_renamed.mp4" に変更しました。',
      newFileName: 'test-video_renamed.mp4'
    });
    expect(mockFs.renameSync).toHaveBeenCalledWith(
      '/videos/test-video.mp4',
      '/videos/test-video_renamed.mp4'
    );
  });

  it('returns 400 error when required fields are missing', async () => {
    const requestBody = {
      videoId: 'test-video-1'
      // fileName and suffix are missing
    };

    const mockRequest = {
      json: jest.fn().mockResolvedValue(requestBody)
    };

    await POST(mockRequest);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'videoId、fileName、suffix は必須です。' },
      { status: 400 }
    );
  });

  it('returns 500 error when VIDEO_DIR environment variable is not set', async () => {
    delete process.env.VIDEO_DIR;

    const requestBody = {
      videoId: 'test-video-1',
      fileName: 'test-video.mp4',
      suffix: '_renamed'
    };

    const mockRequest = {
      json: jest.fn().mockResolvedValue(requestBody)
    };

    await POST(mockRequest);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: '環境変数 VIDEO_DIR が未設定です。' },
      { status: 500 }
    );
  });

  it('returns 404 error when video is not found', async () => {
    const requestBody = {
      videoId: 'non-existent-video',
      fileName: 'test-video.mp4',
      suffix: '_renamed'
    };

    const mockRequest = {
      json: jest.fn().mockResolvedValue(requestBody)
    };

    await POST(mockRequest);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'ビデオが見つかりません。ID: non-existent-video' },
      { status: 404 }
    );
  });

  it('returns 404 error when source file does not exist', async () => {
    const requestBody = {
      videoId: 'test-video-1',
      fileName: 'test-video.mp4',
      suffix: '_renamed'
    };

    const mockRequest = {
      json: jest.fn().mockResolvedValue(requestBody)
    };

    mockFs.existsSync.mockReturnValue(false);

    await POST(mockRequest);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'ファイルが見つかりません: /videos/test-video.mp4' },
      { status: 404 }
    );
  });

  it('returns 409 error when target file already exists', async () => {
    const requestBody = {
      videoId: 'test-video-1',
      fileName: 'test-video.mp4',
      suffix: '_renamed'
    };

    const mockRequest = {
      json: jest.fn().mockResolvedValue(requestBody)
    };

    mockFs.existsSync
      .mockReturnValueOnce(true) // source file exists
      .mockReturnValueOnce(true); // target file exists
    mockPath.basename
      .mockReturnValueOnce('test-video.mp4')
      .mockReturnValueOnce('test-video');
    mockPath.extname.mockReturnValue('.mp4');
    mockPath.dirname.mockReturnValue('/videos');
    mockPath.join.mockReturnValue('/videos/test-video_renamed.mp4');

    await POST(mockRequest);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: '同名のファイルが既に存在します: test-video_renamed.mp4' },
      { status: 409 }
    );
  });

  it('returns 500 error when rename operation fails', async () => {
    const requestBody = {
      videoId: 'test-video-1',
      fileName: 'test-video.mp4',
      suffix: '_renamed'
    };

    const mockRequest = {
      json: jest.fn().mockResolvedValue(requestBody)
    };

    const mockError = new Error('Permission denied');
    mockFs.existsSync.mockReturnValue(true);
    mockFs.renameSync.mockImplementation(() => {
      throw mockError;
    });
    mockPath.basename
      .mockReturnValueOnce('test-video.mp4')
      .mockReturnValueOnce('test-video');
    mockPath.extname.mockReturnValue('.mp4');
    mockPath.dirname.mockReturnValue('/videos');
    mockPath.join.mockReturnValue('/videos/test-video_renamed.mp4');

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await POST(mockRequest);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'ファイル名の変更に失敗しました: Permission denied' },
      { status: 500 }
    );
    expect(consoleSpy).toHaveBeenCalledWith('Rename error:', mockError);

    consoleSpy.mockRestore();
  });

  it('handles request parsing error', async () => {
    const mockRequest = {
      json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
    };

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await POST(mockRequest);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'ファイル名の変更に失敗しました: Invalid JSON' },
      { status: 500 }
    );

    consoleSpy.mockRestore();
  });
}); 