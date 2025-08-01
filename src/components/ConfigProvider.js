'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import ConfigManager from '../lib/configManager'

const ConfigContext = createContext()

let configManagerInstance = null

function getConfigManager() {
  if (!configManagerInstance) {
    configManagerInstance = new ConfigManager()
  }
  return configManagerInstance
}

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [configManager] = useState(() => getConfigManager())

  useEffect(() => {
    try {
      const loadedConfig = configManager.loadConfig()
      setConfig(loadedConfig)
    } catch (error) {
      console.error('Failed to load config:', error)
      setConfig(configManager.getDefaultConfig())
    } finally {
      setLoading(false)
    }

    const unsubscribe = configManager.subscribe((newConfig) => {
      setConfig({ ...newConfig })
    })

    return unsubscribe
  }, [configManager])

  const updateConfig = (path, value) => {
    try {
      configManager.set(path, value)
    } catch (error) {
      console.error('Failed to update config:', error)
      throw error
    }
  }

  const resetConfig = () => {
    configManager.reset()
  }

  const exportConfig = () => {
    return configManager.exportConfig()
  }

  const importConfig = (configString) => {
    return configManager.importConfig(configString)
  }

  const value = {
    config,
    loading,
    updateConfig,
    resetConfig,
    exportConfig,
    importConfig,
    get: (path) => configManager.get(path)
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