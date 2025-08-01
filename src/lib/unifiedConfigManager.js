import { DEFAULT_CONFIG, CONFIG_SCHEMA, ConfigValidator, ConfigMerger } from './config.js'

// localStorage設定ストレージ
class LocalStorageConfigStorage {
  constructor(storageKey = 'videoFileManagerConfig') {
    this.storageKey = storageKey
  }

  async save(config) {
    if (typeof window === 'undefined') {
      console.warn('localStorage is not available on server side')
      return false
    }
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(config))
      return true
    } catch (error) {
      console.error('Failed to save to localStorage:', error)
      return false
    }
  }

  async load() {
    if (typeof window === 'undefined') {
      console.warn('localStorage is not available on server side')
      return null
    }
    
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error('Failed to load from localStorage:', error)
      return null
    }
  }

  async reset() {
    if (typeof window === 'undefined') {
      console.warn('localStorage is not available on server side')
      return false
    }
    
    try {
      localStorage.removeItem(this.storageKey)
      return true
    } catch (error) {
      console.error('Failed to reset localStorage:', error)
      return false
    }
  }
}

// 統一された設定管理クラス
class UnifiedConfigManager {
  constructor() {
    this.config = { ...DEFAULT_CONFIG }
    this.listeners = new Set()
    this.storage = new LocalStorageConfigStorage()
    this.initialized = false
  }

  async init() {
    if (this.initialized) return

    await this.loadConfig()
    this.initialized = true
  }

  async loadConfig() {
    try {
      const storedConfig = await this.storage.load()
      if (storedConfig) {
        ConfigValidator.validateConfig(storedConfig)
        this.config = ConfigMerger.mergeConfig(DEFAULT_CONFIG, storedConfig)
      }
    } catch (error) {
      console.warn('Failed to load config:', error.message)
      this.config = { ...DEFAULT_CONFIG }
    }

    return this.config
  }

  async saveConfig(newConfig = null) {
    try {
      const configToSave = newConfig || this.config
      ConfigValidator.validateConfig(configToSave)

      const success = await this.storage.save(configToSave)
      
      if (success && newConfig) {
        this.config = { ...configToSave }
        this.notifyListeners(this.config)
      }

      return success
    } catch (error) {
      console.error('Failed to save config:', error.message)
      throw error
    }
  }

  async get(path) {
    if (!this.initialized) {
      await this.init()
    }
    return ConfigMerger.getNestedValue(this.config, path)
  }

  async set(path, value) {
    if (!this.initialized) {
      await this.init()
    }

    const keys = path.split('.')
    const sectionKey = keys[0]

    // バリデーション
    if (CONFIG_SCHEMA[sectionKey] && CONFIG_SCHEMA[sectionKey][keys[keys.length - 1]]) {
      ConfigValidator.validateValue(path, value, CONFIG_SCHEMA[sectionKey][keys[keys.length - 1]])
    }

    // 設定を更新
    ConfigMerger.setNestedValue(this.config, path, value)
    
    // 保存
    await this.saveConfig()
    
    // リスナーに通知
    this.notifyListeners(this.config)
  }

  async reset() {
    if (!this.initialized) {
      await this.init()
    }

    await this.storage.reset()
    this.config = { ...DEFAULT_CONFIG }
    this.notifyListeners(this.config)
  }

  async exportConfig() {
    if (!this.initialized) {
      await this.init()
    }
    return JSON.stringify(this.config, null, 2)
  }

  async importConfig(configString) {
    try {
      const importedConfig = JSON.parse(configString)
      ConfigValidator.validateConfig(importedConfig)
      
      await this.saveConfig(importedConfig)
      return true
    } catch (error) {
      throw new Error(`Failed to import config: ${error.message}`)
    }
  }

  subscribe(listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  notifyListeners(config) {
    this.listeners.forEach(listener => {
      try {
        listener(config)
      } catch (error) {
        console.error('Config listener error:', error)
      }
    })
  }

  getDefaultConfig() {
    return { ...DEFAULT_CONFIG }
  }

  // サーバーサイドでの設定取得（API用）
  async getConfigForAPI() {
    if (typeof window !== 'undefined') {
      // クライアントサイドでは現在の設定を返す
      return this.config
    } else {
      // サーバーサイドではlocalStorageから読み込み
      return await this.loadConfig()
    }
  }
}

// シングルトンインスタンス
let configManagerInstance = null

export async function getConfigManager() {
  if (!configManagerInstance) {
    configManagerInstance = new UnifiedConfigManager()
    await configManagerInstance.init()
  }
  return configManagerInstance
}

export default UnifiedConfigManager 