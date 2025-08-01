'use client'

import { useState } from 'react'

export default function VideoListItem({ video, onPlay }) {
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
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-150">
      <div 
        className="flex items-center px-4 py-3 cursor-pointer group"
        onClick={() => onPlay(video)}
      >
        {/* File Icon */}
        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
          <span className="text-blue-600 dark:text-blue-400 text-lg">🎬</span>
        </div>
        
        {/* File Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {video.name}
            </h3>
            <div className="flex items-center space-x-2 ml-4">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                {video.extension.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="flex items-center mt-1 text-xs text-gray-500 dark:text-gray-400 space-x-4">
            <span>{formatFileSize(video.size)}</span>
            <span>•</span>
            <span>{formatDate(video.modified)}</span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex-shrink-0 ml-4 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {/* qqq Folder Move Button */}
          <button className="w-8 h-8 bg-green-600 hover:bg-green-700 text-white rounded-full flex items-center justify-center">
            <span className="text-xs font-bold">qqq</span>
          </button>
          
          {/* ggg Suffix Add Button */}
          <button className="w-8 h-8 bg-yellow-600 hover:bg-yellow-700 text-white rounded-full flex items-center justify-center">
            <span className="text-xs font-bold">ggg</span>
          </button>
          
          {/* Delete Button */}
          <button className="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center">
            <span className="text-xs">🗑️</span>
          </button>
          
          {/* Play Button */}
          <button className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center">
            <div className="w-0 h-0 border-l-[6px] border-l-white border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-0.5"></div>
          </button>
        </div>
      </div>
    </div>
  )
}