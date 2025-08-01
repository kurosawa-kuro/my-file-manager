'use client';

import { useState, useEffect } from 'react';

export default function ConfigManager({ isOpen, onClose }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadConfig();
    }
  }, [isOpen]);

  const loadConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/config');
      const data = await response.json();
      if (data.success) {
        setConfig(data.config);
      } else {
        setMessage('設定の読み込みに失敗しました');
      }
    } catch (error) {
      setMessage('設定の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (section, key, value) => {
    setLoading(true);
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ section, key, value }),
      });
      const data = await response.json();
      if (data.success) {
        setMessage('設定を更新しました');
        await loadConfig(); // 設定を再読み込み
      } else {
        setMessage(data.error || '設定の更新に失敗しました');
      }
    } catch (error) {
      setMessage('設定の更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const resetConfig = async () => {
    if (!confirm('設定をリセットしますか？')) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/config', {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setMessage('設定をリセットしました');
        await loadConfig();
      } else {
        setMessage(data.error || '設定のリセットに失敗しました');
      }
    } catch (error) {
      setMessage('設定のリセットに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const renderSettingField = (section, key, value, schema) => {
    const handleChange = (newValue) => {
      updateSetting(section, key, newValue);
    };

    switch (schema.type) {
      case 'string':
        if (schema.enum) {
          return (
            <select
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              className="w-full p-2 border rounded"
              disabled={loading}
            >
              {schema.enum.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          );
        }
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full p-2 border rounded"
            disabled={loading}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleChange(Number(e.target.value))}
            min={schema.min}
            max={schema.max}
            className="w-full p-2 border rounded"
            disabled={loading}
          />
        );

      case 'boolean':
        return (
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => handleChange(e.target.checked)}
            className="w-4 h-4"
            disabled={loading}
          />
        );

      case 'array':
        return (
          <input
            type="text"
            value={Array.isArray(value) ? value.join(', ') : ''}
            onChange={(e) => handleChange(e.target.value.split(',').map(s => s.trim()))}
            className="w-full p-2 border rounded"
            placeholder="カンマ区切りで入力"
            disabled={loading}
          />
        );

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full p-2 border rounded"
            disabled={loading}
          />
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">設定管理</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {message && (
          <div className="mb-4 p-2 bg-blue-100 text-blue-800 rounded">
            {message}
          </div>
        )}

        {loading && (
          <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 rounded">
            処理中...
          </div>
        )}

        {config && (
          <div className="space-y-6">
            {/* Environment Section */}
            <div className="border rounded p-4">
              <h3 className="text-lg font-semibold mb-3">環境設定</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    動画ディレクトリ
                  </label>
                  {renderSettingField('environment', 'videoDir', config.environment?.videoDir, {
                    type: 'string',
                    required: true
                  })}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    ファイルソート順
                  </label>
                  {renderSettingField('environment', 'fileSortOrder', config.environment?.fileSortOrder, {
                    type: 'string',
                    enum: ['newest', 'name']
                  })}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    QQQフォルダのみ表示
                  </label>
                  {renderSettingField('environment', 'isQqqOnly', config.environment?.isQqqOnly, {
                    type: 'boolean'
                  })}
                </div>
              </div>
            </div>

            {/* App Section */}
            <div className="border rounded p-4">
              <h3 className="text-lg font-semibold mb-3">アプリケーション設定</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    タイトル
                  </label>
                  {renderSettingField('app', 'title', config.app?.title, {
                    type: 'string',
                    required: true
                  })}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    サブタイトル
                  </label>
                  {renderSettingField('app', 'subtitle', config.app?.subtitle, {
                    type: 'string'
                  })}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    テーマ
                  </label>
                  {renderSettingField('app', 'theme', config.app?.theme, {
                    type: 'string',
                    enum: ['light', 'dark', 'system']
                  })}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    言語
                  </label>
                  {renderSettingField('app', 'language', config.app?.language, {
                    type: 'string',
                    enum: ['ja', 'en']
                  })}
                </div>
              </div>
            </div>

            {/* Video Section */}
            <div className="border rounded p-4">
              <h3 className="text-lg font-semibold mb-3">動画設定</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    自動再生
                  </label>
                  {renderSettingField('video', 'autoplay', config.video?.autoplay, {
                    type: 'boolean'
                  })}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    音量
                  </label>
                  {renderSettingField('video', 'volume', config.video?.volume, {
                    type: 'number',
                    min: 0,
                    max: 1
                  })}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    再生速度
                  </label>
                  {renderSettingField('video', 'playbackRate', config.video?.playbackRate, {
                    type: 'number',
                    min: 0.25,
                    max: 4
                  })}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    品質
                  </label>
                  {renderSettingField('video', 'quality', config.video?.quality, {
                    type: 'string',
                    enum: ['auto', '720p', '1080p', '4k']
                  })}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    サムネイルサイズ
                  </label>
                  {renderSettingField('video', 'thumbnailSize', config.video?.thumbnailSize, {
                    type: 'string',
                    enum: ['small', 'medium', 'large']
                  })}
                </div>
              </div>
            </div>

            {/* UI Section */}
            <div className="border rounded p-4">
              <h3 className="text-lg font-semibold mb-3">UI設定</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    1ページあたりのアイテム数
                  </label>
                  {renderSettingField('ui', 'itemsPerPage', config.ui?.itemsPerPage, {
                    type: 'number',
                    min: 1,
                    max: 100
                  })}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    ソート基準
                  </label>
                  {renderSettingField('ui', 'sortBy', config.ui?.sortBy, {
                    type: 'string',
                    enum: ['name', 'size', 'date']
                  })}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    ソート順
                  </label>
                  {renderSettingField('ui', 'sortOrder', config.ui?.sortOrder, {
                    type: 'string',
                    enum: ['asc', 'desc']
                  })}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    グリッド表示
                  </label>
                  {renderSettingField('ui', 'gridView', config.ui?.gridView, {
                    type: 'boolean'
                  })}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    サムネイル表示
                  </label>
                  {renderSettingField('ui', 'showThumbnails', config.ui?.showThumbnails, {
                    type: 'boolean'
                  })}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    ファイル情報表示
                  </label>
                  {renderSettingField('ui', 'showFileInfo', config.ui?.showFileInfo, {
                    type: 'boolean'
                  })}
                </div>
              </div>
            </div>

            {/* Performance Section */}
            <div className="border rounded p-4">
              <h3 className="text-lg font-semibold mb-3">パフォーマンス設定</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    サムネイル生成を有効化
                  </label>
                  {renderSettingField('performance', 'enableThumbnailGeneration', config.performance?.enableThumbnailGeneration, {
                    type: 'boolean'
                  })}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    サムネイルキャッシュサイズ
                  </label>
                  {renderSettingField('performance', 'thumbnailCacheSize', config.performance?.thumbnailCacheSize, {
                    type: 'number',
                    min: 10,
                    max: 1000
                  })}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    動画プリロード数
                  </label>
                  {renderSettingField('performance', 'videoPreloadCount', config.performance?.videoPreloadCount, {
                    type: 'number',
                    min: 0,
                    max: 10
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <button
            onClick={resetConfig}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            disabled={loading}
          >
            設定をリセット
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
} 