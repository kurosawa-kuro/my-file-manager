'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { getConfigManager } from '../lib/unifiedConfigManager.js'

const ConfigContext = createContext()

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [configManager, setConfigManager] = useState(null)

  useEffect(() => {
    let unsubscribe = null

    const initializeConfig = async () => {
      try {
        const manager = await getConfigManager()
        setConfigManager(manager)

        const loadedConfig = await manager.loadConfig()
        setConfig(loadedConfig)

        unsubscribe = manager.subscribe((newConfig) => {
          setConfig({ ...newConfig })
        })
      } catch (error) {
        console.error('Failed to initialize config:', error)
        // デフォルト設定を使用
        try {
          const manager = await getConfigManager()
          setConfigManager(manager)
          setConfig(manager.getDefaultConfig())
        } catch (fallbackError) {
          console.error('Failed to create fallback config manager:', fallbackError)
          // 最後の手段として、ハードコードされたデフォルト設定を使用
          setConfig({
            app: {
              title: 'Video File Manager',
              subtitle: 'ローカル動画ファイルマネージャー',
              theme: 'system',
              language: 'ja'
            },
            video: {
              autoplay: false,
              volume: 0.7,
              playbackRate: 1.0,
              quality: 'auto',
              thumbnailSize: 'medium'
            },
            directory: {
              watchPath: '',
              includeSubdirectories: true,
              supportedFormats: ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.ts']
            },
            ui: {
              itemsPerPage: 20,
              sortBy: 'name',
              sortOrder: 'asc',
              gridView: false,
              showThumbnails: true,
              showFileInfo: true,
              fileSortOrder: 'newest'
            },
            performance: {
              enableThumbnailGeneration: true,
              thumbnailCacheSize: 100,
              videoPreloadCount: 3
            },
            environment: {
              videoDir: 'C:\\Users\\owner\\Downloads\\Video',
              isQqqOnly: false
            }
          })
        }
      } finally {
        setLoading(false)
      }
    }

    initializeConfig()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  const updateConfig = async (path, value) => {
    if (!configManager) {
      throw new Error('Config manager not initialized')
    }

    try {
      await configManager.set(path, value)
    } catch (error) {
      console.error('Failed to update config:', error)
      throw error
    }
  }

  const resetConfig = async () => {
    if (!configManager) {
      throw new Error('Config manager not initialized')
    }

    try {
      await configManager.reset()
    } catch (error) {
      console.error('Failed to reset config:', error)
      throw error
    }
  }

  const exportConfig = async () => {
    if (!configManager) {
      throw new Error('Config manager not initialized')
    }

    try {
      return await configManager.exportConfig()
    } catch (error) {
      console.error('Failed to export config:', error)
      throw error
    }
  }

  const importConfig = async (configString) => {
    if (!configManager) {
      throw new Error('Config manager not initialized')
    }

    try {
      return await configManager.importConfig(configString)
    } catch (error) {
      console.error('Failed to import config:', error)
      throw error
    }
  }

  const getConfigValue = async (path) => {
    if (!configManager) {
      throw new Error('Config manager not initialized')
    }

    try {
      return await configManager.get(path)
    } catch (error) {
      console.error('Failed to get config value:', error)
      throw error
    }
  }

  const value = {
    config,
    loading,
    updateConfig,
    resetConfig,
    exportConfig,
    importConfig,
    get: getConfigValue
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600 dark:text-gray-400">設定を読み込み中...</div>
        </div>
      </div>
    )
  }

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfig() {
  const context = useContext(ConfigContext)
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider')
  }
  return context
}

export default ConfigProvider