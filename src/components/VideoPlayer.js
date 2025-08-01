'use client'

import { useRef, useEffect } from 'react'

export default function VideoPlayer({ video, onClose }) {
  const videoRef = useRef(null)

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.focus()
    }
  }, [])

  if (!video) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="relative max-w-6xl max-h-full w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors text-2xl z-10"
          aria-label="閉じる"
        >
          ✕
        </button>
        
        {/* Video title */}
        <div className="absolute -top-12 left-0 text-white text-lg font-semibold truncate max-w-[calc(100%-60px)]">
          {video.name}
        </div>
        
        {/* Video player */}
        {video.extension.toLowerCase() === '.ts' ? (
          <div className="w-full h-auto max-h-[80vh] bg-gray-800 rounded-lg flex flex-col items-center justify-center p-8 text-white">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold mb-2">サポートされていないファイル形式</h3>
            <p className="text-center text-gray-300 mb-4">
              .TSファイル（MPEG Transport Stream）は、このブラウザでは直接再生できません。
            </p>
            <div className="text-sm text-gray-400 text-center">
              <p>推奨解決方法:</p>
              <ul className="mt-2 space-y-1">
                <li>• MP4やWebM形式に変換してください</li>
                <li>• VLCなどの専用プレイヤーを使用してください</li>
              </ul>
            </div>
          </div>
        ) : (
          <video
            ref={videoRef}
            className="w-full h-auto max-h-[80vh] bg-black rounded-lg"
            controls
            autoPlay
            preload="metadata"
            src={`/api/videos/${video.id}/stream`}
            onError={(e) => {
              console.error('Video playback error:', {
                error: e.target.error,
                code: e.target.error?.code,
                message: e.target.error?.message,
                networkState: e.target.networkState,
                readyState: e.target.readyState,
                src: e.target.src
              })
            }}
          >
            お使いのブラウザは動画再生をサポートしていません。
          </video>
        )}
        
        {/* Video info */}
        <div className="mt-4 text-white text-sm space-y-1">
          <div className="flex items-center justify-between">
            <span>ファイル名: {video.name}</span>
            <span className="bg-white text-black bg-opacity-20 px-2 py-1 rounded">
              {video.extension.toUpperCase()}
            </span>
          </div>
          <div>更新日: {new Date(video.modified).toLocaleString('ja-JP')}</div>
        </div>
      </div>
    </div>
  )
}