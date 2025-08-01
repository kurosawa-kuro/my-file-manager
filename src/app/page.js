'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import VideoListItem from '../components/VideoListItem'
import VideoPlayer from '../components/VideoPlayer'
import ThemeToggle from '../components/ThemeToggle'
import SettingsButton from '../components/SettingsButton'
import SortSelector from '../components/SortSelector'
import { useConfig } from '../components/ConfigProvider'

export default function Home() {
  const { config } = useConfig()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [error, setError] = useState(null)
  // 設定ファイルのenvironmentセクションを優先、フォールバックとして設定ファイルのuiセクションを使用
  const [sortOrder, setSortOrder] = useState(() => {
    return config?.environment?.fileSortOrder || config?.ui?.fileSortOrder || 'newest'
  })
  const [isQqqOnly, setIsQqqOnly] = useState(false)
  const [currentDirectory, setCurrentDirectory] = useState('')
  const isInitialized = useRef(false)

  useEffect(() => {
    // 設定ファイルのenvironmentセクションが変更された場合に更新
    const envSortOrder = config?.environment?.fileSortOrder
    if (envSortOrder && sortOrder !== envSortOrder) {
      setSortOrder(envSortOrder)
    } else if (!envSortOrder && config?.ui?.fileSortOrder && sortOrder !== config.ui.fileSortOrder) {
      setSortOrder(config.ui.fileSortOrder)
    }
  }, [config?.environment?.fileSortOrder, config?.ui?.fileSortOrder, sortOrder])

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true)
      // クエリパラメータを指定しない場合、APIが設定ファイルから自動的に取得する
      const res = await fetch('/api/videos')
      const data = await res.json()
      
      if (res.ok) {
        setVideos(data.videos || [])
        setIsQqqOnly(data.isQqqOnly || false)
        setCurrentDirectory(data.directory || '')
        
        // 初期化時のみ、APIから返されたsortOrderを使用（設定ファイルが優先される）
        if (!isInitialized.current && data.sortOrder && data.sortOrder !== sortOrder) {
          console.log('Initializing sort order from API:', data.sortOrder)
          setSortOrder(data.sortOrder)
          isInitialized.current = true
        }
      } else {
        setError(data.error || '動画の取得に失敗しました')
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [sortOrder, isInitialized])

  useEffect(() => {
    fetchVideos()
  }, [fetchVideos])

  const handleVideoPlay = (video) => {
    setSelectedVideo(video)
  }

  const handleClosePlayer = () => {
    setSelectedVideo(null)
  }

  const handleFileMove = (videoId) => {
    setVideos(prevVideos => prevVideos.filter(video => video.id !== videoId))
  }

  const handleSortChange = (newSortOrder) => {
    setSortOrder(newSortOrder)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600 dark:text-gray-400">動画を読み込み中...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <div className="text-gray-800 dark:text-gray-200 mb-4">{error}</div>
          <button
            onClick={fetchVideos}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            再試行
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                🎬 {config?.app?.title || 'Video File Manager'}
                {isQqqOnly && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                    QQQモード
                  </span>
                )}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {config?.app?.subtitle || 'ローカル動画ファイルマネージャー'}
                {currentDirectory && (
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-500">
                    📁 {currentDirectory}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {videos.length} 件の動画
              </div>
              <SortSelector currentSort={sortOrder} onSortChange={handleSortChange} />
              <SettingsButton />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {videos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {isQqqOnly ? 'QQQフォルダに動画ファイルが見つかりません' : '動画ファイルが見つかりません'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {isQqqOnly 
                ? 'QQQフォルダに動画ファイルがないか、アクセスできません。'
                : '設定されたディレクトリに動画ファイルがないか、アクセスできません。'
              }
            </p>
            <button
              onClick={fetchVideos}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              更新
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {videos.map((video, index) => (
              <VideoListItem
                key={video.id}
                video={video}
                onPlay={handleVideoPlay}
                onFileMove={handleFileMove}
              />
            ))}
          </div>
        )}
      </main>

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayer
          video={selectedVideo}
          onClose={handleClosePlayer}
        />
      )}
    </div>
  )
}
