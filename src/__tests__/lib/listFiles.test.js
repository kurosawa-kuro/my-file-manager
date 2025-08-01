/**
 * @jest-environment node
 */

// Setup for Node.js environment
import '@testing-library/jest-dom'
process.env.VIDEO_DIR = 'C:\\test\\videos'

import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { listVideoFiles } from '../../lib/listFiles'

// Mock dependencies
jest.mock('fs')
jest.mock('path')
jest.mock('crypto')

describe('listVideoFiles', () => {
  const mockHash = {
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue('mock-hash-123')
  }

  beforeEach(() => {
    jest.clearAllMocks()
    crypto.createHash.mockReturnValue(mockHash)
  })

  it('should list video files successfully', () => {
    // Arrange
    const testDir = 'C:\\test\\videos'
    const mockFiles = ['video1.mp4', 'image.jpg', 'video2.mkv', 'document.txt']
    const mockStats = {
      isDirectory: jest.fn().mockReturnValue(false),
      size: 1024000,
      mtime: new Date('2024-01-01T12:00:00Z')
    }

    fs.readdirSync.mockReturnValue(mockFiles)
    fs.statSync.mockReturnValue(mockStats)
    path.join.mockImplementation((dir, name) => `${dir}\\${name}`)
    path.extname.mockImplementation((file) => {
      if (file.includes('.mp4')) return '.mp4'
      if (file.includes('.mkv')) return '.mkv'
      if (file.includes('.jpg')) return '.jpg'
      if (file.includes('.txt')) return '.txt'
      return ''
    })
    path.basename.mockImplementation((file) => file.split('\\').pop())

    // Act
    const result = listVideoFiles(testDir)

    // Assert
    expect(result).toHaveLength(2) // Only video files
    expect(result[0]).toMatchObject({
      id: 'mock-hash-123',
      path: 'C:\\test\\videos\\video1.mp4',
      name: 'video1.mp4',
      size: 1024000,
      extension: '.mp4'
    })
    expect(result[1]).toMatchObject({
      id: 'mock-hash-123',
      path: 'C:\\test\\videos\\video2.mkv',
      name: 'video2.mkv',
      size: 1024000,
      extension: '.mkv'
    })
  })

  it('should handle directories recursively', () => {
    // Arrange
    const testDir = 'C:\\test\\videos'
    const mockFiles = ['subfolder', 'video1.mp4']
    const mockDirStats = {
      isDirectory: jest.fn().mockReturnValue(true),
      size: 0,
      mtime: new Date()
    }
    const mockFileStats = {
      isDirectory: jest.fn().mockReturnValue(false),
      size: 1024000,
      mtime: new Date('2024-01-01T12:00:00Z')
    }

    fs.readdirSync.mockImplementation((dir) => {
      if (dir === testDir) return mockFiles
      if (dir.includes('subfolder')) return ['video2.avi']
      return []
    })
    
    fs.statSync.mockImplementation((filePath) => {
      if (filePath.includes('subfolder') && !filePath.includes('.avi')) return mockDirStats
      return mockFileStats
    })

    path.join.mockImplementation((dir, name) => `${dir}\\${name}`)
    path.extname.mockImplementation((file) => {
      if (file.includes('.mp4')) return '.mp4'
      if (file.includes('.avi')) return '.avi'
      return ''
    })
    path.basename.mockImplementation((file) => file.split('\\').pop())

    // Act
    const result = listVideoFiles(testDir)

    // Assert
    expect(result).toHaveLength(2) // video1.mp4 and video2.avi
    expect(fs.readdirSync).toHaveBeenCalledTimes(2) // Called for main dir and subfolder
  })

  it('should return empty array on error', () => {
    // Arrange
    fs.readdirSync.mockImplementation(() => {
      throw new Error('Permission denied')
    })
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    // Act
    const result = listVideoFiles('C:\\test\\videos')

    // Assert
    expect(result).toEqual([])
    expect(consoleSpy).toHaveBeenCalledWith('Error listing files:', expect.any(Error))
    
    consoleSpy.mockRestore()
  })
})