/**
 * @jest-environment node
 */

// Setup for Node.js environment
import '@testing-library/jest-dom'
process.env.VIDEO_DIR = 'C:\\test\\videos'

import { POST } from '../../../app/api/videos/move/route'
import { listVideoFiles } from '../../../lib/listFiles'
import fs from 'fs'
import path from 'path'

// Mock dependencies
jest.mock('../../../lib/listFiles')
jest.mock('fs')
jest.mock('path')

describe('/api/videos/move', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.VIDEO_DIR = 'C:\\test\\videos'
  })

  it('should move video to qqq folder successfully', async () => {
    // Arrange
    const mockVideo = {
      id: 'test-id-1',
      path: 'C:\\test\\videos\\video1.mp4',
      name: 'video1.mp4'
    }

    listVideoFiles.mockReturnValue([mockVideo])
    fs.existsSync.mockImplementation((filePath) => {
      // Mock qqq folder doesn't exist, but source file exists
      if (filePath.includes('qqq')) return false
      if (filePath === mockVideo.path) return true
      return false
    })
    fs.mkdirSync.mockReturnValue(undefined)
    fs.renameSync.mockReturnValue(undefined)
    path.join.mockImplementation((...args) => args.join('\\'))
    path.basename.mockReturnValue('video1.mp4')

    const request = {
      json: async () => ({
        videoId: 'test-id-1',
        fileName: 'video1.mp4'
      })
    }

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.message).toContain('video1.mp4')
    expect(data.message).toContain('qqqフォルダに移動しました')
    expect(fs.mkdirSync).toHaveBeenCalledWith('C:\\Users\\owner\\Downloads\\Video\\qqq', { recursive: true })
    expect(fs.renameSync).toHaveBeenCalled()
  })

  it('should return error when video not found', async () => {
    // Arrange
    listVideoFiles.mockReturnValue([])

    const request = {
      json: async () => ({
        videoId: 'non-existent-id',
        fileName: 'video1.mp4'
      })
    }

    // Act
    const response = await POST(request)
    const data = await response.json()

    // Assert
    expect(response.status).toBe(404)
    expect(data.error).toContain('ビデオが見つかりません')
  })
})