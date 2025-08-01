// デフォルト設定
const DEFAULT_CONFIG = {
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
}

// 設定スキーマ定義
const CONFIG_SCHEMA = {
  app: {
    title: { type: 'string', required: true, minLength: 1 },
    subtitle: { type: 'string', required: false },
    theme: { type: 'string', enum: ['light', 'dark', 'system'], required: true },
    language: { type: 'string', enum: ['ja', 'en'], required: true }
  },
  video: {
    autoplay: { type: 'boolean', required: true },
    volume: { type: 'number', min: 0, max: 1, required: true },
    playbackRate: { type: 'number', min: 0.25, max: 4, required: true },
    quality: { type: 'string', enum: ['auto', '720p', '1080p', '4k'], required: true },
    thumbnailSize: { type: 'string', enum: ['small', 'medium', 'large'], required: true }
  },
  directory: {
    watchPath: { type: 'string', required: false },
    includeSubdirectories: { type: 'boolean', required: true },
    supportedFormats: { type: 'array', items: 'string', required: true }
  },
  ui: {
    itemsPerPage: { type: 'number', min: 1, max: 100, required: true },
    sortBy: { type: 'string', enum: ['name', 'size', 'date'], required: true },
    sortOrder: { type: 'string', enum: ['asc', 'desc'], required: true },
    gridView: { type: 'boolean', required: true },
    showThumbnails: { type: 'boolean', required: true },
    showFileInfo: { type: 'boolean', required: true },
    fileSortOrder: { type: 'string', enum: ['newest', 'name'], required: true }
  },
  performance: {
    enableThumbnailGeneration: { type: 'boolean', required: true },
    thumbnailCacheSize: { type: 'number', min: 10, max: 1000, required: true },
    videoPreloadCount: { type: 'number', min: 0, max: 10, required: true }
  },
  environment: {
    videoDir: { type: 'string', required: true },
    isQqqOnly: { type: 'boolean', required: true }
  }
}

// 設定バリデーター
class ConfigValidator {
  static validateValue(key, value, schema) {
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

  static validateConfig(config) {
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
}

// 設定マージユーティリティ
class ConfigMerger {
  static mergeConfig(defaultConfig, userConfig) {
    const merged = {}

    for (const section in defaultConfig) {
      merged[section] = {
        ...defaultConfig[section],
        ...(userConfig[section] || {})
      }
    }

    return merged
  }

  static getNestedValue(obj, path) {
    const keys = path.split('.')
    let current = obj

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key]
      } else {
        return undefined
      }
    }

    return current
  }

  static setNestedValue(obj, path, value) {
    const keys = path.split('.')
    const lastKey = keys.pop()
    let current = obj

    for (const key of keys) {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {}
      }
      current = current[key]
    }

    current[lastKey] = value
  }
}

export { 
  DEFAULT_CONFIG, 
  CONFIG_SCHEMA, 
  ConfigValidator, 
  ConfigMerger 
}