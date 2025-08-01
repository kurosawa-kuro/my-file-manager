import { DEFAULT_CONFIG, CONFIG_SCHEMA } from './config.js'

class ConfigManager {
  constructor() {
    this.config = { ...DEFAULT_CONFIG }
    this.listeners = new Set()
    this.storageKey = 'videoFileManagerConfig'
  }

  validateValue(key, value, schema) {
    if (schema.required && (value === undefined || value === null)) {
      throw new Error(`${key} is required`)
    }

    if (value === undefined || value === null) {
      return true
    }

    switch (schema.type) {
      case 'string':
        if (typeof value !== 'string') {
          throw new Error(`${key} must be a string`)
        }
        if (schema.minLength && value.length < schema.minLength) {
          throw new Error(`${key} must be at least ${schema.minLength} characters`)
        }
        if (schema.enum && !schema.enum.includes(value)) {
          throw new Error(`${key} must be one of: ${schema.enum.join(', ')}`)
        }
        break

      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          throw new Error(`${key} must be a number`)
        }
        if (schema.min !== undefined && value < schema.min) {
          throw new Error(`${key} must be at least ${schema.min}`)
        }
        if (schema.max !== undefined && value > schema.max) {
          throw new Error(`${key} must be at most ${schema.max}`)
        }
        break

      case 'boolean':
        if (typeof value !== 'boolean') {
          throw new Error(`${key} must be a boolean`)
        }
        break

      case 'array':
        if (!Array.isArray(value)) {
          throw new Error(`${key} must be an array`)
        }
        break

      default:
        throw new Error(`Unknown type: ${schema.type}`)
    }

    return true
  }

  validateConfig(config) {
    const errors = []

    const validateSection = (sectionKey, sectionConfig, sectionSchema) => {
      if (!sectionConfig || typeof sectionConfig !== 'object') {
        errors.push(`${sectionKey} section is required and must be an object`)
        return
      }

      for (const [key, schema] of Object.entries(sectionSchema)) {
        try {
          this.validateValue(`${sectionKey}.${key}`, sectionConfig[key], schema)
        } catch (error) {
          errors.push(error.message)
        }
      }
    }

    for (const [sectionKey, sectionSchema] of Object.entries(CONFIG_SCHEMA)) {
      validateSection(sectionKey, config[sectionKey], sectionSchema)
    }

    if (errors.length > 0) {
      throw new Error(`Config validation failed: ${errors.join(', ')}`)
    }

    return true
  }

  loadConfig() {
    try {
      if (typeof window === 'undefined') {
        return this.config
      }

      const stored = localStorage.getItem(this.storageKey)
      if (stored) {
        const parsedConfig = JSON.parse(stored)
        this.validateConfig(parsedConfig)
        
        this.config = this.mergeConfig(DEFAULT_CONFIG, parsedConfig)
      }
    } catch (error) {
      console.warn('Failed to load config from localStorage:', error.message)
      this.config = { ...DEFAULT_CONFIG }
    }

    return this.config
  }

  saveConfig(newConfig = null) {
    try {
      if (typeof window === 'undefined') {
        return false
      }

      const configToSave = newConfig || this.config
      this.validateConfig(configToSave)

      localStorage.setItem(this.storageKey, JSON.stringify(configToSave))
      
      if (newConfig) {
        this.config = { ...configToSave }
        this.notifyListeners(this.config)
      }

      return true
    } catch (error) {
      console.error('Failed to save config:', error.message)
      throw error
    }
  }

  mergeConfig(defaultConfig, userConfig) {
    const merged = {}

    for (const section in defaultConfig) {
      merged[section] = {
        ...defaultConfig[section],
        ...(userConfig[section] || {})
      }
    }

    return merged
  }

  get(path) {
    const keys = path.split('.')
    let current = this.config

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key]
      } else {
        return undefined
      }
    }

    return current
  }

  set(path, value) {
    const keys = path.split('.')
    const lastKey = keys.pop()
    let current = this.config

    for (const key of keys) {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {}
      }
      current = current[key]
    }

    const sectionKey = keys[0]
    const fieldKey = keys.slice(1).concat(lastKey).join('.')
    const fullKey = `${sectionKey}.${fieldKey}`

    if (CONFIG_SCHEMA[sectionKey] && CONFIG_SCHEMA[sectionKey][lastKey]) {
      this.validateValue(fullKey, value, CONFIG_SCHEMA[sectionKey][lastKey])
    }

    current[lastKey] = value
    this.saveConfig()
  }

  reset() {
    this.config = { ...DEFAULT_CONFIG }
    this.saveConfig()
  }

  exportConfig() {
    return JSON.stringify(this.config, null, 2)
  }

  importConfig(configString) {
    try {
      const importedConfig = JSON.parse(configString)
      this.validateConfig(importedConfig)
      this.config = this.mergeConfig(DEFAULT_CONFIG, importedConfig)
      this.saveConfig()
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
}

export default ConfigManager