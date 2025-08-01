'use client'

import { useState } from 'react'

export default function VideoCard({ video, onPlay }) {
  const [imageError, setImageError] = useState(false)

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ja-JP')
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      <div 
        className="relative cursor-pointer group"
        onClick={() => onPlay(video)}
      >
        <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
          {!imageError ? (
            <img
              src={video.thumbnailUrl}
              alt={video.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
              onError={(e) => {
                console.error('Thumbnail load error:', video.thumbnailUrl, e);
                console.error('Error details:', e.target.src, e.target.complete, e.target.naturalWidth, e.target.naturalHeight);
                setImageError(true);
              }}
              onLoad={(e) => {
                console.log('Thumbnail loaded:', video.thumbnailUrl);
                console.log('Image dimensions:', e.target.naturalWidth, 'x', e.target.naturalHeight);
                console.log('Image src:', e.target.src);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <div className="text-4xl mb-2">🎬</div>
                <div className="text-sm">サムネイル生成中...</div>
              </div>
            </div>
          )}
          
          {/* Play button overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
            <div className="w-16 h-16 bg-white bg-opacity-80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="w-0 h-0 border-l-[16px] border-l-gray-800 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1"></div>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate mb-2">
            {video.name}
          </h3>
          
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <div className="flex items-center justify-between">
              <span>サイズ: {formatFileSize(video.size)}</span>
              <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                {video.extension.toUpperCase()}
              </span>
            </div>
            <div>更新日: {formatDate(video.modified)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}