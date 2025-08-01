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
    supportedFormats: ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.wmv', '.flv', '.mkv']
  },
  ui: {
    itemsPerPage: 20,
    sortBy: 'name',
    sortOrder: 'asc',
    gridView: false,
    showThumbnails: true,
    showFileInfo: true
  },
  performance: {
    enableThumbnailGeneration: true,
    thumbnailCacheSize: 100,
    videoPreloadCount: 3
  }
}

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
    showFileInfo: { type: 'boolean', required: true }
  },
  performance: {
    enableThumbnailGeneration: { type: 'boolean', required: true },
    thumbnailCacheSize: { type: 'number', min: 10, max: 1000, required: true },
    videoPreloadCount: { type: 'number', min: 0, max: 10, required: true }
  }
}

export { DEFAULT_CONFIG, CONFIG_SCHEMA }