import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VideoPlayer from '../../components/VideoPlayer';

// HTMLVideoElementのfocusメソッドをモック
const mockFocus = jest.fn();
Object.defineProperty(HTMLVideoElement.prototype, 'focus', {
  writable: true,
  value: mockFocus,
});

describe('VideoPlayer', () => {
  const mockVideo = {
    id: 'test-video-1',
    name: 'test-video.mp4',
    extension: 'mp4',
    modified: '2024-01-01T00:00:00.000Z'
  };

  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders nothing when video prop is null', () => {
    const { container } = render(<VideoPlayer video={null} onClose={mockOnClose} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders video player modal when video prop is provided', () => {
    render(<VideoPlayer video={mockVideo} onClose={mockOnClose} />);
    
    expect(screen.getByRole('button', { name: '閉じる' })).toBeInTheDocument();
    expect(screen.getByText('test-video.mp4')).toBeInTheDocument();
    expect(screen.getByText('MP4')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<VideoPlayer video={mockVideo} onClose={mockOnClose} />);
    
    const closeButton = screen.getByRole('button', { name: '閉じる' });
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when background overlay is clicked', () => {
    render(<VideoPlayer video={mockVideo} onClose={mockOnClose} />);
    
    const overlay = screen.getByRole('button', { name: '閉じる' }).closest('div').parentElement;
    fireEvent.click(overlay);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when video container is clicked', () => {
    render(<VideoPlayer video={mockVideo} onClose={mockOnClose} />);
    
    const videoContainer = screen.getByText('test-video.mp4').closest('div');
    fireEvent.click(videoContainer);
    
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('renders video element with correct attributes', () => {
    render(<VideoPlayer video={mockVideo} onClose={mockOnClose} />);
    
    const video = document.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('controls');
    expect(video).toHaveAttribute('autoPlay');
    expect(video).toHaveAttribute('preload', 'metadata');
    expect(video).toHaveAttribute('src', '/api/videos/test-video-1/stream');
  });

  it('renders video with correct src attribute', () => {
    render(<VideoPlayer video={mockVideo} onClose={mockOnClose} />);
    
    const video = document.querySelector('video');
    expect(video).toBeInTheDocument();
    expect(video).toHaveAttribute('src', '/api/videos/test-video-1/stream');
  });

  it('displays video information correctly', () => {
    render(<VideoPlayer video={mockVideo} onClose={mockOnClose} />);
    
    expect(screen.getByText('ファイル名: test-video.mp4')).toBeInTheDocument();
    expect(screen.getByText(/更新日:/)).toBeInTheDocument();
  });

  it('focuses video element on mount', async () => {
    render(<VideoPlayer video={mockVideo} onClose={mockOnClose} />);
    
    // useEffectが非同期で実行されるのを少し待つ
    await waitFor(() => {
      expect(mockFocus).toHaveBeenCalledTimes(1);
    });
  });

  it('handles video error gracefully', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<VideoPlayer video={mockVideo} onClose={mockOnClose} />);
    
    const video = document.querySelector('video');
    fireEvent.error(video, { target: { error: new Error('Video error') } });
    
    expect(consoleSpy).toHaveBeenCalledWith('Video playback error:', expect.any(Object));
    
    consoleSpy.mockRestore();
  });

  it('renders fallback text for unsupported browsers', () => {
    render(<VideoPlayer video={mockVideo} onClose={mockOnClose} />);
    
    expect(screen.getByText('お使いのブラウザは動画再生をサポートしていません。')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<VideoPlayer video={mockVideo} onClose={mockOnClose} />);
    
    const overlay = container.firstChild;
    expect(overlay).toHaveClass('fixed', 'inset-0', 'bg-black', 'bg-opacity-90', 'flex', 'items-center', 'justify-center', 'z-50', 'p-4');
    
    const video = document.querySelector('video');
    expect(video).toHaveClass('w-full', 'h-auto', 'max-h-[80vh]', 'bg-black', 'rounded-lg');
  });
}); 