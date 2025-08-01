import { GET } from '../../../../app/api/videos/[id]/thumbnail/route';
import { NextResponse } from 'next/server';
import { listVideoFiles } from '../../../../lib/listFiles';
import { generateThumbnail } from '../../../../lib/thumbnail';
import fs from 'fs';
import path from 'path';

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
jest.mock('../../../../lib/thumbnail');
jest.mock('fs');
jest.mock('path');

const mockFs = {
  existsSync: jest.fn(),
  readFileSync: jest.fn()
};

const mockPath = {
  join: jest.fn()
};

// モジュールのモック
fs.existsSync = mockFs.existsSync;
fs.readFileSync = mockFs.readFileSync;
path.join = mockPath.join;

describe('GET /api/videos/[id]/thumbnail', () => {
  const mockVideoFiles = [
    {
      id: 'test-video-1',
      name: 'test-video.mp4',
      path: '/videos/test-video.mp4'
    }
  ];

  const mockImageBuffer = Buffer.from('fake-image-data');
  const mockThumbnailUrl = '/thumbnails/test-video-1.jpg';
  const mockThumbnailPath = '/mock/public/thumbnails/test-video-1.jpg';

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.VIDEO_DIR = '/videos';
    process.cwd = jest.fn().mockReturnValue('/mock');
    listVideoFiles.mockReturnValue(mockVideoFiles);
    generateThumbnail.mockResolvedValue(mockThumbnailUrl);
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(mockImageBuffer);
    mockPath.join.mockReturnValue(mockThumbnailPath);
  });

  it('returns thumbnail image successfully', async () => {
    const mockRequest = {};
    const mockParams = Promise.resolve({ id: 'test-video-1' });

    const response = await GET(mockRequest, { params: mockParams });

    expect(listVideoFiles).toHaveBeenCalledWith('/videos');
    expect(generateThumbnail).toHaveBeenCalledWith('/videos/test-video.mp4', 'test-video-1');
    expect(mockPath.join).toHaveBeenCalledWith('/mock', 'public', mockThumbnailUrl);
    expect(mockFs.existsSync).toHaveBeenCalledWith(mockThumbnailPath);
    expect(mockFs.readFileSync).toHaveBeenCalledWith(mockThumbnailPath);
    expect(response).toBeInstanceOf(NextResponse);
    expect(response.headers.get('Content-Type')).toBe('image/jpeg');
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=31536000, immutable');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET');
    expect(response.headers.get('Content-Length')).toBe(mockImageBuffer.length.toString());
  });

  it('returns 500 error when VIDEO_DIR environment variable is not set', async () => {
    delete process.env.VIDEO_DIR;

    const mockRequest = {};
    const mockParams = Promise.resolve({ id: 'test-video-1' });

    await GET(mockRequest, { params: mockParams });

    expect(mockJson).toHaveBeenCalledWith(
      { error: '環境変数 VIDEO_DIR が未設定です。' },
      { status: 500 }
    );
  });

  it('returns 404 error when video is not found', async () => {
    const mockRequest = {};
    const mockParams = Promise.resolve({ id: 'non-existent-video' });

    await GET(mockRequest, { params: mockParams });

    expect(mockJson).toHaveBeenCalledWith(
      { error: 'ビデオファイルが見つかりません。' },
      { status: 404 }
    );
  });

  it('returns 500 error when thumbnail file does not exist', async () => {
    const mockRequest = {};
    const mockParams = Promise.resolve({ id: 'test-video-1' });

    mockFs.existsSync.mockReturnValue(false);

    await GET(mockRequest, { params: mockParams });

    expect(mockJson).toHaveBeenCalledWith(
      { error: 'サムネイルの生成に失敗しました。' },
      { status: 500 }
    );
  });

  it('returns 500 error when generateThumbnail fails', async () => {
    const mockRequest = {};
    const mockParams = Promise.resolve({ id: 'test-video-1' });

    const mockError = new Error('FFmpeg error');
    generateThumbnail.mockRejectedValue(mockError);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await GET(mockRequest, { params: mockParams });

    expect(mockJson).toHaveBeenCalledWith(
      { error: 'サムネイルの取得に失敗しました。' },
      { status: 500 }
    );
    expect(consoleSpy).toHaveBeenCalledWith('Thumbnail error:', mockError);

    consoleSpy.mockRestore();
  });

  it('returns 500 error when file read fails', async () => {
    const mockRequest = {};
    const mockParams = Promise.resolve({ id: 'test-video-1' });

    const mockError = new Error('File read error');
    mockFs.readFileSync.mockImplementation(() => {
      throw mockError;
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await GET(mockRequest, { params: mockParams });

    expect(mockJson).toHaveBeenCalledWith(
      { error: 'サムネイルの取得に失敗しました。' },
      { status: 500 }
    );
    expect(consoleSpy).toHaveBeenCalledWith('Thumbnail error:', mockError);

    consoleSpy.mockRestore();
  });

  it('handles params resolution error', async () => {
    const mockRequest = {};
    const mockParams = Promise.reject(new Error('Params error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    await GET(mockRequest, { params: mockParams });

    expect(mockJson).toHaveBeenCalledWith(
      { error: 'サムネイルの取得に失敗しました。' },
      { status: 500 }
    );

    consoleSpy.mockRestore();
  });

  it('sets correct response headers', async () => {
    const mockRequest = {};
    const mockParams = Promise.resolve({ id: 'test-video-1' });

    const response = await GET(mockRequest, { params: mockParams });

    expect(response.headers.get('Content-Type')).toBe('image/jpeg');
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=31536000, immutable');
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET');
    expect(response.headers.get('Content-Length')).toBe(mockImageBuffer.length.toString());
  });
}); 