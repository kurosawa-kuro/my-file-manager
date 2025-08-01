import { GET } from '../../../../app/api/videos/[id]/stream/route';
import { NextResponse } from 'next/server';
import { listVideoFiles } from '../../../../lib/listFiles';
import fs from 'fs';

// モックの設定
const mockJson = jest.fn();
const mockNextResponse = jest.fn().mockImplementation((body, options) => ({
  status: options?.status || 200,
  headers: new Map(Object.entries(options?.headers || {})),
  json: mockJson
}));

jest.mock('next/server', () => ({
  NextResponse: mockNextResponse
}));

jest.mock('../../../../lib/listFiles');
jest.mock('fs');

const mockFs = {
  statSync: jest.fn(),
  createReadStream: jest.fn()
};

// モジュールのモック
fs.statSync = mockFs.statSync;
fs.createReadStream = mockFs.createReadStream;

describe('GET /api/videos/[id]/stream', () => {
  const mockVideoFiles = [
    {
      id: 'test-video-1',
      name: 'test-video.mp4',
      path: '/videos/test-video.mp4'
    }
  ];

  const mockFileStats = {
    size: 1024000 // 1MB
  };

  const mockReadStream = {
    pipe: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.VIDEO_DIR = '/videos';
    listVideoFiles.mockReturnValue(mockVideoFiles);
    mockFs.statSync.mockReturnValue(mockFileStats);
    mockFs.createReadStream.mockReturnValue(mockReadStream);
  });

  it('streams video file without range request', async () => {
    const mockRequest = {
      headers: {
        get: jest.fn().mockReturnValue(null) // no range header
      }
    };
    const mockParams = Promise.resolve({ id: 'test-video-1' });

    const response = await GET(mockRequest, { params: mockParams });

    expect(listVideoFiles).toHaveBeenCalledWith('/videos');
    expect(mockFs.statSync).toHaveBeenCalledWith('/videos/test-video.mp4');
    expect(mockFs.createReadStream).toHaveBeenCalledWith('/videos/test-video.mp4');
    expect(response).toBeInstanceOf(NextResponse);
    expect(response.headers.get('Content-Length')).toBe('1024000');
    expect(response.headers.get('Content-Type')).toBe('video/mp4');
  });

  it('streams video file with range request', async () => {
    const mockRequest = {
      headers: {
        get: jest.fn().mockReturnValue('bytes=0-1023') // range header
      }
    };
    const mockParams = Promise.resolve({ id: 'test-video-1' });

    const response = await GET(mockRequest, { params: mockParams });

    expect(listVideoFiles).toHaveBeenCalledWith('/videos');
    expect(mockFs.statSync).toHaveBeenCalledWith('/videos/test-video.mp4');
    expect(mockFs.createReadStream).toHaveBeenCalledWith('/videos/test-video.mp4', {
      start: 0,
      end: 1023
    });
    expect(response).toBeInstanceOf(NextResponse);
    expect(response.status).toBe(206);
    expect(response.headers.get('Content-Range')).toBe('bytes 0-1023/1024000');
    expect(response.headers.get('Accept-Ranges')).toBe('bytes');
    expect(response.headers.get('Content-Length')).toBe('1024');
    expect(response.headers.get('Content-Type')).toBe('video/mp4');
  });

  it('handles range request without end byte', async () => {
    const mockRequest = {
      headers: {
        get: jest.fn().mockReturnValue('bytes=512-') // no end byte
      }
    };
    const mockParams = Promise.resolve({ id: 'test-video-1' });

    const response = await GET(mockRequest, { params: mockParams });

    expect(mockFs.createReadStream).toHaveBeenCalledWith('/videos/test-video.mp4', {
      start: 512,
      end: 1023999 // fileSize - 1
    });
    expect(response.status).toBe(206);
    expect(response.headers.get('Content-Range')).toBe('bytes 512-1023999/1024000');
    expect(response.headers.get('Content-Length')).toBe('1023488'); // (1023999 - 512) + 1
  });

  it('returns 500 error when VIDEO_DIR environment variable is not set', async () => {
    delete process.env.VIDEO_DIR;

    const mockRequest = {
      headers: {
        get: jest.fn().mockReturnValue(null)
      }
    };
    const mockParams = Promise.resolve({ id: 'test-video-1' });

    await GET(mockRequest, { params: mockParams });

    expect(mockJson).toHaveBeenCalledWith(
      { error: '環境変数 VIDEO_DIR が未設定です。' },
      { status: 500 }
    );
  });

  it('returns 404 error when video is not found', async () => {
    const mockRequest = {
      headers: {
        get: jest.fn().mockReturnValue(null)
      }
    };
    const mockParams = Promise.resolve({ id: 'non-existent-video' });

    await GET(mockRequest, { params: mockParams });

    expect(mockJson).toHaveBeenCalledWith(
      { error: 'ビデオファイルが見つかりません。' },
      { status: 404 }
    );
  });

  it('returns 500 error when file stat fails', async () => {
    const mockRequest = {
      headers: {
        get: jest.fn().mockReturnValue(null)
      }
    };
    const mockParams = Promise.resolve({ id: 'test-video-1' });

    const mockError = new Error('File not found');
    mockFs.statSync.mockImplementation(() => {
      throw mockError;
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await GET(mockRequest, { params: mockParams });

    expect(mockJson).toHaveBeenCalledWith(
      { error: 'ビデオの配信に失敗しました。' },
      { status: 500 }
    );
    expect(consoleSpy).toHaveBeenCalledWith('Video streaming error:', mockError);

    consoleSpy.mockRestore();
  });

  it('returns 500 error when createReadStream fails', async () => {
    const mockRequest = {
      headers: {
        get: jest.fn().mockReturnValue(null)
      }
    };
    const mockParams = Promise.resolve({ id: 'test-video-1' });

    const mockError = new Error('Permission denied');
    mockFs.createReadStream.mockImplementation(() => {
      throw mockError;
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await GET(mockRequest, { params: mockParams });

    expect(mockJson).toHaveBeenCalledWith(
      { error: 'ビデオの配信に失敗しました。' },
      { status: 500 }
    );
    expect(consoleSpy).toHaveBeenCalledWith('Video streaming error:', mockError);

    consoleSpy.mockRestore();
  });

  it('handles invalid range format', async () => {
    const mockRequest = {
      headers: {
        get: jest.fn().mockReturnValue('invalid-range-format')
      }
    };
    const mockParams = Promise.resolve({ id: 'test-video-1' });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await GET(mockRequest, { params: mockParams });

    expect(mockJson).toHaveBeenCalledWith(
      { error: 'ビデオの配信に失敗しました。' },
      { status: 500 }
    );

    consoleSpy.mockRestore();
  });

  it('handles params resolution error', async () => {
    const mockRequest = {
      headers: {
        get: jest.fn().mockReturnValue(null)
      }
    };
    const mockParams = Promise.reject(new Error('Params error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await GET(mockRequest, { params: mockParams });

    expect(mockJson).toHaveBeenCalledWith(
      { error: 'ビデオの配信に失敗しました。' },
      { status: 500 }
    );

    consoleSpy.mockRestore();
  });

  it('sets correct headers for full file response', async () => {
    const mockRequest = {
      headers: {
        get: jest.fn().mockReturnValue(null)
      }
    };
    const mockParams = Promise.resolve({ id: 'test-video-1' });

    const response = await GET(mockRequest, { params: mockParams });

    expect(response.headers.get('Content-Length')).toBe('1024000');
    expect(response.headers.get('Content-Type')).toBe('video/mp4');
    expect(response.status).toBeUndefined(); // default status
  });

  it('sets correct headers for partial content response', async () => {
    const mockRequest = {
      headers: {
        get: jest.fn().mockReturnValue('bytes=0-511')
      }
    };
    const mockParams = Promise.resolve({ id: 'test-video-1' });

    const response = await GET(mockRequest, { params: mockParams });

    expect(response.status).toBe(206);
    expect(response.headers.get('Content-Range')).toBe('bytes 0-511/1024000');
    expect(response.headers.get('Accept-Ranges')).toBe('bytes');
    expect(response.headers.get('Content-Length')).toBe('512');
    expect(response.headers.get('Content-Type')).toBe('video/mp4');
  });
}); 