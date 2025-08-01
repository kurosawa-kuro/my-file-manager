import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import VideoListItem from '../../components/VideoListItem'

// Mock fetch globally
global.fetch = jest.fn()

describe('VideoListItem', () => {
  const mockVideo = {
    id: 'test-id-1',
    name: 'test-video.mp4',
    size: 1024000,
    modified: '2024-01-01T12:00:00.000Z',
    extension: '.mp4'
  }

  const mockOnPlay = jest.fn()
  const mockOnFileMove = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    fetch.mockClear()
  })

  it('should render video information correctly', () => {
    // Act
    render(
      <VideoListItem 
        video={mockVideo} 
        onPlay={mockOnPlay} 
        onFileMove={mockOnFileMove} 
      />
    )

    // Assert
    expect(screen.getByText('test-video.mp4')).toBeInTheDocument()
    expect(screen.getByText('1000 KB')).toBeInTheDocument()
    expect(screen.getByText('2024/1/1')).toBeInTheDocument()
    expect(screen.getByText('.MP4')).toBeInTheDocument()
  })

  it('should call onPlay when video item is clicked', () => {
    // Arrange
    render(
      <VideoListItem 
        video={mockVideo} 
        onPlay={mockOnPlay} 
        onFileMove={mockOnFileMove} 
      />
    )

    // Act
    fireEvent.click(screen.getByText('test-video.mp4'))

    // Assert
    expect(mockOnPlay).toHaveBeenCalledWith(mockVideo)
  })

  it('should show action buttons on hover', () => {
    // Arrange
    render(
      <VideoListItem 
        video={mockVideo} 
        onPlay={mockOnPlay} 
        onFileMove={mockOnFileMove} 
      />
    )

    // Act & Assert
    expect(screen.getByTitle('qqqフォルダに移動')).toBeInTheDocument()
    expect(screen.getByTitle('ファイル名末尾に ggg を追加')).toBeInTheDocument()
    expect(screen.getByTitle('削除予定フォルダに移動')).toBeInTheDocument()
  })

  it('should call move API when qqq button is clicked', async () => {
    // Arrange
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'Moved successfully' })
    })

    render(
      <VideoListItem 
        video={mockVideo} 
        onPlay={mockOnPlay} 
        onFileMove={mockOnFileMove} 
      />
    )

    // Act
    fireEvent.click(screen.getByTitle('qqqフォルダに移動'))

    // Assert
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/videos/move', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoId: 'test-id-1',
          fileName: 'test-video.mp4'
        })
      })
      expect(mockOnFileMove).toHaveBeenCalledWith('test-id-1')
    })
  })
})