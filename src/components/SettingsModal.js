'use client'

import { useState } from 'react'
import { useConfig } from './ConfigProvider'

export default function SettingsModal({ isOpen, onClose }) {
  const { config, updateConfig, resetConfig, exportConfig, importConfig } = useConfig()
  const [activeTab, setActiveTab] = useState('app')
  const [importData, setImportData] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen || !config) return null

  const handleInputChange = async (path, value) => {
    setLoading(true)
    try {
      await updateConfig(path, value)
      setMessage('設定を更新しました')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage(`エラー: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    if (confirm('設定をデフォルトに戻しますか？この操作は取り消せません。')) {
      setLoading(true)
      try {
        await resetConfig()
        setMessage('設定をリセットしました')
        setTimeout(() => setMessage(''), 3000)
      } catch (error) {
        setMessage(`エラー: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleExport = async () => {
    setLoading(true)
    try {
      const configData = await exportConfig()
      await navigator.clipboard.writeText(configData)
      setMessage('設定をクリップボードにコピーしました')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('クリップボードへのコピーに失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    if (!importData.trim()) {
      setMessage('インポートする設定データを入力してください')
      return
    }

    setLoading(true)
    try {
      await importConfig(importData)
      setImportData('')
      setMessage('設定をインポートしました')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage(`インポートエラー: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'app', label: 'アプリ設定' },
    { id: 'video', label: '動画設定' },
    { id: 'directory', label: 'ディレクトリ設定' },
    { id: 'environment', label: '環境設定' },
    { id: 'ui', label: 'UI設定' },
    { id: 'performance', label: 'パフォーマンス' },
    { id: 'import-export', label: 'インポート/エクスポート' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">設定</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {message && (
          <div className="px-6 py-3 bg-blue-50 dark:bg-blue-900 border-b border-blue-200 dark:border-blue-700">
            <p className="text-blue-800 dark:text-blue-200">{message}</p>
          </div>
        )}

        <div className="flex">
          {/* タブナビゲーション */}
          <div className="w-48 border-r border-gray-200 dark:border-gray-700">
            <nav className="p-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-3 py-2 rounded-md mb-1 transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* 設定コンテンツ */}
          <div className="flex-1 p-6 overflow-y-auto">
            {loading && (
              <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-75 flex items-center justify-center z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {activeTab === 'app' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">アプリ設定</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    アプリタイトル
                  </label>
                  <input
                    type="text"
                    value={config.app?.title || ''}
                    onChange={(e) => handleInputChange('app.title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    サブタイトル
                  </label>
                  <input
                    type="text"
                    value={config.app?.subtitle || ''}
                    onChange={(e) => handleInputChange('app.subtitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    テーマ
                  </label>
                  <select
                    value={config.app?.theme || 'system'}
                    onChange={(e) => handleInputChange('app.theme', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="light">ライト</option>
                    <option value="dark">ダーク</option>
                    <option value="system">システム</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    言語
                  </label>
                  <select
                    value={config.app?.language || 'ja'}
                    onChange={(e) => handleInputChange('app.language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="ja">日本語</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'video' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">動画設定</h3>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.video?.autoplay || false}
                      onChange={(e) => handleInputChange('video.autoplay', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">自動再生</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    音量 ({Math.round((config.video?.volume || 0.7) * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={config.video?.volume || 0.7}
                    onChange={(e) => handleInputChange('video.volume', parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    再生速度
                  </label>
                  <select
                    value={config.video?.playbackRate || 1.0}
                    onChange={(e) => handleInputChange('video.playbackRate', parseFloat(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value={0.25}>0.25x</option>
                    <option value={0.5}>0.5x</option>
                    <option value={0.75}>0.75x</option>
                    <option value={1.0}>1.0x</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2.0}>2.0x</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    画質
                  </label>
                  <select
                    value={config.video?.quality || 'auto'}
                    onChange={(e) => handleInputChange('video.quality', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="auto">自動</option>
                    <option value="720p">720p</option>
                    <option value="1080p">1080p</option>
                    <option value="4k">4K</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    サムネイルサイズ
                  </label>
                  <select
                    value={config.video?.thumbnailSize || 'medium'}
                    onChange={(e) => handleInputChange('video.thumbnailSize', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="small">小</option>
                    <option value="medium">中</option>
                    <option value="large">大</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'directory' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">ディレクトリ設定</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    監視パス
                  </label>
                  <input
                    type="text"
                    value={config.directory?.watchPath || ''}
                    onChange={(e) => handleInputChange('directory.watchPath', e.target.value)}
                    placeholder="例: C:\Videos"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.directory?.includeSubdirectories || true}
                      onChange={(e) => handleInputChange('directory.includeSubdirectories', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">サブディレクトリを含める</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    対応フォーマット
                  </label>
                  <input
                    type="text"
                    value={config.directory?.supportedFormats?.join(', ') || ''}
                    onChange={(e) => handleInputChange('directory.supportedFormats', e.target.value.split(',').map(f => f.trim()))}
                    placeholder=".mp4, .webm, .avi"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            )}

            {activeTab === 'environment' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">環境設定</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    動画ディレクトリ
                  </label>
                  <input
                    type="text"
                    value={config.environment?.videoDir || ''}
                    onChange={(e) => handleInputChange('environment.videoDir', e.target.value)}
                    placeholder="例: C:\Users\owner\Downloads\Video"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.environment?.isQqqOnly || false}
                      onChange={(e) => handleInputChange('environment.isQqqOnly', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">QQQ専用モード</span>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'ui' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">UI設定</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    1ページあたりのアイテム数
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={config.ui?.itemsPerPage || 20}
                    onChange={(e) => handleInputChange('ui.itemsPerPage', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ソート基準
                  </label>
                  <select
                    value={config.ui?.sortBy || 'name'}
                    onChange={(e) => handleInputChange('ui.sortBy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="name">名前</option>
                    <option value="size">サイズ</option>
                    <option value="date">日付</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ソート順
                  </label>
                  <select
                    value={config.ui?.sortOrder || 'asc'}
                    onChange={(e) => handleInputChange('ui.sortOrder', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="asc">昇順</option>
                    <option value="desc">降順</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.ui?.gridView || false}
                      onChange={(e) => handleInputChange('ui.gridView', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">グリッド表示</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.ui?.showThumbnails || true}
                      onChange={(e) => handleInputChange('ui.showThumbnails', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">サムネイル表示</span>
                  </label>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.ui?.showFileInfo || true}
                      onChange={(e) => handleInputChange('ui.showFileInfo', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">ファイル情報表示</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    ファイルソート順
                  </label>
                  <select
                    value={config.ui?.fileSortOrder || 'newest'}
                    onChange={(e) => handleInputChange('ui.fileSortOrder', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="newest">新しい順</option>
                    <option value="name">名前順</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">パフォーマンス設定</h3>
                
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={config.performance?.enableThumbnailGeneration || true}
                      onChange={(e) => handleInputChange('performance.enableThumbnailGeneration', e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">サムネイル生成を有効にする</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    サムネイルキャッシュサイズ
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    value={config.performance?.thumbnailCacheSize || 100}
                    onChange={(e) => handleInputChange('performance.thumbnailCacheSize', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    動画プリロード数
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={config.performance?.videoPreloadCount || 3}
                    onChange={(e) => handleInputChange('performance.videoPreloadCount', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            )}

            {activeTab === 'import-export' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">インポート/エクスポート</h3>
                
                <div>
                  <button
                    onClick={handleExport}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  >
                    設定をエクスポート
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    設定データ
                  </label>
                  <textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder="エクスポートした設定データをここに貼り付けてください"
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <button
                    onClick={handleImport}
                    disabled={loading || !importData.trim()}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    設定をインポート
                  </button>
                </div>

                <div>
                  <button
                    onClick={handleReset}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    設定をリセット
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}