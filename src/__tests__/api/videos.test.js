/**
 * @jest-environment node
 */

// Setup for Node.js environment
import '@testing-library/jest-dom'
process.env.VIDEO_DIR = 'C:\\test\\videos'

import { GET } from '../../app/api/videos/route'
import { listVideoFiles } from '../../lib/listFiles'

// Mock the listVideoFiles function
jest.mock('../../lib/listFiles', () => ({
  listVideoFiles: jest.fn()
}))

describe('/api/videos', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.VIDEO_DIR = 'C:\\test\\videos'
  })

  it('should return video list successfully', async () => {
    // Arrange
    const mockVideos = [
      {
        id: 'test-id-1',
        path: 'C:\\test\\videos\\video1.mp4',
        name: 'video1.mp4',
        size: 1024000,
        modified: '2024-01-01T00:00:00.000Z',
        extension: '.mp4'
      }
    ]
    
    listVideoFiles.mockReturnValue(mockVideos)

    // Act
    const response = await GET()
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data.videos).toHaveLength(1)
    expect(data.videos[0]).toMatchObject({
      id: 'test-id-1',
      name: 'video1.mp4',
      size: 1024000,
      thumbnailUrl: '/api/videos/test-id-1/thumbnail'
    })
    expect(listVideoFiles).toHaveBeenCalledWith('C:\\test\\videos')
  })

  it('should return error when VIDEO_DIR is not set', async () => {
    // Arrange
    delete process.env.VIDEO_DIR

    // Act
    const response = await GET()
    const data = await response.json()

    // Assert
    expect(response.status).toBe(500)
    expect(data.error).toBe('環境変数 VIDEO_DIR が未設定です。')
  })
})