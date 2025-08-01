import { POST } from '../../../app/api/videos/delete/route';
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
  mkdirSync: jest.fn(),
  renameSync: jest.fn()
};

const mockPath = {
  basename: jest.fn(),
  join: jest.fn()
};

// モジュールのモック
fs.existsSync = mockFs.existsSync;
fs.mkdirSync = mockFs.mkdirSync;
fs.renameSync = mockFs.renameSync;
path.basename = mockPath.basename;
path.join = mockPath.join;

describe('POST /api/videos/delete', () => {
  const mockVideoFiles = [
    {
      id: 'test-video-1',
      name: 'test-video.mp4',
      path: '/videos/test-video.mp4'
    }
  ];

  const deleteFolderPath = 'C:\\Users\\owner\\Downloads\\Video_Local\\delete';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.VIDEO_DIR = '/videos';
    listVideoFiles.mockReturnValue(mockVideoFiles);
  });

  it('moves video file to delete folder successfully', async () => {
    const requestBody = {
      videoId: 'test-video-1',
      fileName: 'test-video.mp4'
    };

    const mockRequest = {
      json: jest.fn().mockResolvedValue(requestBody)
    };

    // モックの設定
    mockFs.existsSync
      .mockReturnValueOnce(true) // delete folder exists
      .mockReturnValueOnce(true); // source file exists
    mockPath.basename.mockReturnValue('test-video.mp4');
    mockPath.join.mockReturnValue(`${deleteFolderPath}/test-video.mp4`);

    await POST(mockRequest);

    expect(NextResponse.json).toHaveBeenCalledWith({
      success: true,
      message: 'ファイル "test-video.mp4" を削除予定フォルダに移動しました。'
    });
    expect(mockFs.renameSync).toHaveBeenCalledWith(
      '/videos/test-video.mp4',
      `${deleteFolderPath}/test-video.mp4`
    );
  });

  it('creates delete folder if it does not exist', async () => {
    const requestBody = {
      videoId: 'test-video-1',
      fileName: 'test-video.mp4'
    };

    const mockRequest = {
      json: jest.fn().mockResolvedValue(requestBody)
    };

    // モックの設定
    mockFs.existsSync
      .mockReturnValueOnce(false) // delete folder does not exist
      .mockReturnValueOnce(true); // source file exists
    mockPath.basename.mockReturnValue('test-video.mp4');
    mockPath.join.mockReturnValue(`${deleteFolderPath}/test-video.mp4`);

    await POST(mockRequest);

    expect(mockFs.mkdirSync).toHaveBeenCalledWith(deleteFolderPath, { recursive: true });
    expect(mockFs.renameSync).toHaveBeenCalledWith(
      '/videos/test-video.mp4',
      `${deleteFolderPath}/test-video.mp4`
    );
  });

  it('returns 400 error when required fields are missing', async () => {
    const requestBody = {
      videoId: 'test-video-1'
      // fileName is missing
    };

    const mockRequest = {
      json: jest.fn().mockResolvedValue(requestBody)
    };

    await POST(mockRequest);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'videoId と fileName は必須です。' },
      { status: 400 }
    );
  });

  it('returns 500 error when VIDEO_DIR environment variable is not set', async () => {
    delete process.env.VIDEO_DIR;

    const requestBody = {
      videoId: 'test-video-1',
      fileName: 'test-video.mp4'
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
      fileName: 'test-video.mp4'
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
      fileName: 'test-video.mp4'
    };

    const mockRequest = {
      json: jest.fn().mockResolvedValue(requestBody)
    };

    mockFs.existsSync
      .mockReturnValueOnce(true) // delete folder exists
      .mockReturnValueOnce(false); // source file does not exist

    await POST(mockRequest);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'ファイルが見つかりません: /videos/test-video.mp4' },
      { status: 404 }
    );
  });

  it('returns 500 error when move operation fails', async () => {
    const requestBody = {
      videoId: 'test-video-1',
      fileName: 'test-video.mp4'
    };

    const mockRequest = {
      json: jest.fn().mockResolvedValue(requestBody)
    };

    const mockError = new Error('Permission denied');
    mockFs.existsSync
      .mockReturnValueOnce(true) // delete folder exists
      .mockReturnValueOnce(true); // source file exists
    mockFs.renameSync.mockImplementation(() => {
      throw mockError;
    });
    mockPath.basename.mockReturnValue('test-video.mp4');
    mockPath.join.mockReturnValue(`${deleteFolderPath}/test-video.mp4`);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await POST(mockRequest);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'ファイルの移動に失敗しました: Permission denied' },
      { status: 500 }
    );
    expect(consoleSpy).toHaveBeenCalledWith('Delete move error:', mockError);

    consoleSpy.mockRestore();
  });

  it('handles request parsing error', async () => {
    const mockRequest = {
      json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
    };

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await POST(mockRequest);

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: 'ファイルの移動に失敗しました: Invalid JSON' },
      { status: 500 }
    );

    consoleSpy.mockRestore();
  });

  it('uses correct delete folder path', async () => {
    const requestBody = {
      videoId: 'test-video-1',
      fileName: 'test-video.mp4'
    };

    const mockRequest = {
      json: jest.fn().mockResolvedValue(requestBody)
    };

    mockFs.existsSync
      .mockReturnValueOnce(false) // delete folder does not exist
      .mockReturnValueOnce(true); // source file exists
    mockPath.basename.mockReturnValue('test-video.mp4');
    mockPath.join.mockReturnValue(`${deleteFolderPath}/test-video.mp4`);

    await POST(mockRequest);

    expect(mockFs.mkdirSync).toHaveBeenCalledWith(deleteFolderPath, { recursive: true });
  });
}); 