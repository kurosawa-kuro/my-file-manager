'use client'

import { useState } from 'react'
import { useConfig } from './ConfigProvider'

export default function SettingsModal({ isOpen, onClose }) {
  const { config, updateConfig, resetConfig, exportConfig, importConfig } = useConfig()
  const [activeTab, setActiveTab] = useState('app')
  const [importData, setImportData] = useState('')
  const [message, setMessage] = useState('')

  if (!isOpen || !config) return null

  const handleInputChange = (path, value) => {
    try {
      updateConfig(path, value)
      setMessage('')
    } catch (error) {
      setMessage(`エラー: ${error.message}`)
    }
  }

  const handleReset = () => {
    if (confirm('設定をデフォルトに戻しますか？この操作は取り消せません。')) {
      resetConfig()
      setMessage('設定をリセットしました')
    }
  }

  const handleExport = () => {
    const configData = exportConfig()
    navigator.clipboard.writeText(configData).then(() => {
      setMessage('設定をクリップボードにコピーしました')
    }).catch(() => {
      setMessage('クリップボードへのコピーに失敗しました')
    })
  }

  const handleImport = () => {
    try {
      importConfig(importData)
      setImportData('')
      setMessage('設定をインポートしました')
    } catch (error) {
      setMessage(`インポートエラー: ${error.message}`)
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">⚙️ 設定</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-1/4 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
              <nav className="p-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-3 py-2 rounded-md mb-2 transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                {message && (
                  <div className={`mb-4 p-3 rounded-md ${
                    message.startsWith('エラー') || message.includes('失敗')
                      ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                      : 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                  }`}>
                    {message}
                  </div>
                )}

                {activeTab === 'app' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">アプリケーション設定</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        アプリケーション名
                      </label>
                      <input
                        type="text"
                        value={config.app.title}
                        onChange={(e) => handleInputChange('app.title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        サブタイトル
                      </label>
                      <input
                        type="text"
                        value={config.app.subtitle}
                        onChange={(e) => handleInputChange('app.subtitle', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        テーマ
                      </label>
                      <select
                        value={config.app.theme}
                        onChange={(e) => handleInputChange('app.theme', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="system">システム設定に従う</option>
                        <option value="light">ライト</option>
                        <option value="dark">ダーク</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        言語
                      </label>
                      <select
                        value={config.app.language}
                        onChange={(e) => handleInputChange('app.language', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="ja">日本語</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeTab === 'video' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">動画再生設定</h3>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="autoplay"
                        checked={config.video.autoplay}
                        onChange={(e) => handleInputChange('video.autoplay', e.target.checked)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600"
                      />
                      <label htmlFor="autoplay" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        自動再生
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        音量 ({Math.round(config.video.volume * 100)}%)
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={config.video.volume}
                        onChange={(e) => handleInputChange('video.volume', parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        再生速度 ({config.video.playbackRate}x)
                      </label>
                      <input
                        type="range"
                        min="0.25"
                        max="4"
                        step="0.25"
                        value={config.video.playbackRate}
                        onChange={(e) => handleInputChange('video.playbackRate', parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        画質
                      </label>
                      <select
                        value={config.video.quality}
                        onChange={(e) => handleInputChange('video.quality', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="auto">自動</option>
                        <option value="720p">720p</option>
                        <option value="1080p">1080p</option>
                        <option value="4k">4K</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        サムネイルサイズ
                      </label>
                      <select
                        value={config.video.thumbnailSize}
                        onChange={(e) => handleInputChange('video.thumbnailSize', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="small">小</option>
                        <option value="medium">中</option>
                        <option value="large">大</option>
                      </select>
                    </div>
                  </div>
                )}

                                 {activeTab === 'directory' && (
                   <div className="space-y-6">
                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white">ディレクトリ設定</h3>
                     
                     <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                         監視パス
                       </label>
                       <input
                         type="text"
                         value={config.directory.watchPath}
                         onChange={(e) => handleInputChange('directory.watchPath', e.target.value)}
                         placeholder="例: /path/to/videos"
                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                       />
                     </div>

                     <div className="flex items-center">
                       <input
                         type="checkbox"
                         id="isQqqOnly"
                         checked={config.directory.isQqqOnly}
                         onChange={(e) => handleInputChange('directory.isQqqOnly', e.target.checked)}
                         className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600"
                       />
                       <label htmlFor="isQqqOnly" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                         QQQモード（qqqフォルダのみ表示）
                       </label>
                     </div>
                     <div className="text-xs text-gray-500 dark:text-gray-400 ml-6">
                       有効にすると、VIDEO_DIR/qqqフォルダ内の動画ファイルのみが表示されます。
                     </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="includeSubdirectories"
                        checked={config.directory.includeSubdirectories}
                        onChange={(e) => handleInputChange('directory.includeSubdirectories', e.target.checked)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600"
                      />
                      <label htmlFor="includeSubdirectories" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        サブディレクトリを含める
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        対応フォーマット
                      </label>
                      <textarea
                        value={config.directory.supportedFormats.join(', ')}
                        onChange={(e) => handleInputChange('directory.supportedFormats', e.target.value.split(',').map(s => s.trim()))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        カンマ区切りで入力してください
                      </p>
                    </div>
                  </div>
                                 )}

                 {activeTab === 'environment' && (
                   <div className="space-y-6">
                     <h3 className="text-lg font-semibold text-gray-900 dark:text-white">環境設定</h3>
                     <p className="text-sm text-gray-600 dark:text-gray-400">
                       これらの設定は環境変数よりも優先されます。アプリケーション再起動後に反映されます。
                     </p>
                     
                     <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                         動画ディレクトリ
                       </label>
                       <input
                         type="text"
                         value={config.environment.videoDir}
                         onChange={(e) => handleInputChange('environment.videoDir', e.target.value)}
                         placeholder="例: C:\Users\owner\Downloads\Video"
                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                       />
                       <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                         動画ファイルが格納されているディレクトリのパス
                       </p>
                     </div>

                     <div>
                       <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                         ファイル表示順番
                       </label>
                       <select
                         value={config.environment.fileSortOrder}
                         onChange={(e) => handleInputChange('environment.fileSortOrder', e.target.value)}
                         className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                       >
                         <option value="newest">新しいファイル順番</option>
                         <option value="name">ファイル名順番</option>
                       </select>
                       <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                         ファイル一覧の表示順序
                       </p>
                     </div>

                     <div className="flex items-center">
                       <input
                         type="checkbox"
                         id="envIsQqqOnly"
                         checked={config.environment.isQqqOnly}
                         onChange={(e) => handleInputChange('environment.isQqqOnly', e.target.checked)}
                         className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600"
                       />
                       <label htmlFor="envIsQqqOnly" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                         QQQモード（qqqフォルダのみ表示）
                       </label>
                     </div>
                     <div className="text-xs text-gray-500 dark:text-gray-400 ml-6">
                       有効にすると、動画ディレクトリ内のqqqフォルダのみが表示されます。
                     </div>
                   </div>
                 )}

                 {activeTab === 'ui' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">UI設定</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        1ページあたりのアイテム数
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={config.ui.itemsPerPage}
                        onChange={(e) => handleInputChange('ui.itemsPerPage', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ソート基準
                      </label>
                      <select
                        value={config.ui.sortBy}
                        onChange={(e) => handleInputChange('ui.sortBy', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="name">名前</option>
                        <option value="size">サイズ</option>
                        <option value="date">日付</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ソート順
                      </label>
                      <select
                        value={config.ui.sortOrder}
                        onChange={(e) => handleInputChange('ui.sortOrder', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="asc">昇順</option>
                        <option value="desc">降順</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ファイル表示順番
                      </label>
                      <select
                        value={config.ui.fileSortOrder}
                        onChange={(e) => handleInputChange('ui.fileSortOrder', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="newest">新しいファイル順番</option>
                        <option value="name">ファイル名順番</option>
                      </select>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="gridView"
                        checked={config.ui.gridView}
                        onChange={(e) => handleInputChange('ui.gridView', e.target.checked)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600"
                      />
                      <label htmlFor="gridView" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        グリッド表示
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="showThumbnails"
                        checked={config.ui.showThumbnails}
                        onChange={(e) => handleInputChange('ui.showThumbnails', e.target.checked)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600"
                      />
                      <label htmlFor="showThumbnails" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        サムネイル表示
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="showFileInfo"
                        checked={config.ui.showFileInfo}
                        onChange={(e) => handleInputChange('ui.showFileInfo', e.target.checked)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600"
                      />
                      <label htmlFor="showFileInfo" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        ファイル情報表示
                      </label>
                    </div>
                  </div>
                )}

                {activeTab === 'performance' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">パフォーマンス設定</h3>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="enableThumbnailGeneration"
                        checked={config.performance.enableThumbnailGeneration}
                        onChange={(e) => handleInputChange('performance.enableThumbnailGeneration', e.target.checked)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600"
                      />
                      <label htmlFor="enableThumbnailGeneration" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        サムネイル生成を有効にする
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        サムネイルキャッシュサイズ
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="1000"
                        value={config.performance.thumbnailCacheSize}
                        onChange={(e) => handleInputChange('performance.thumbnailCacheSize', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        動画プリロード数
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={config.performance.videoPreloadCount}
                        onChange={(e) => handleInputChange('performance.videoPreloadCount', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'import-export' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">設定のインポート/エクスポート</h3>
                    
                    <div>
                      <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">エクスポート</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        現在の設定をクリップボードにコピーします
                      </p>
                      <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        設定をエクスポート
                      </button>
                    </div>

                    <div>
                      <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">インポート</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        設定データを貼り付けてインポートします
                      </p>
                      <textarea
                        value={importData}
                        onChange={(e) => setImportData(e.target.value)}
                        placeholder="設定データをここに貼り付けてください..."
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
                      />
                      <div className="flex space-x-4">
                        <button
                          onClick={handleImport}
                          disabled={!importData.trim()}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                          インポート
                        </button>
                        <button
                          onClick={() => setImportData('')}
                          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                        >
                          クリア
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <h4 className="text-md font-medium text-gray-900 dark:text-white mb-2">リセット</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        すべての設定をデフォルト値に戻します
                      </p>
                      <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        設定をリセット
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-4 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}