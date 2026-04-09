'use client'

import { useState, useRef } from 'react'

export default function AudioPreview({ previewUrl }: { previewUrl: string }) {
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  function toggle(e: React.MouseEvent) {
    e.stopPropagation()

    if (playing) {
      audioRef.current?.pause()
      setPlaying(false)
    } else {
      // Pause any other playing audio
      document.querySelectorAll('audio').forEach((a) => a.pause())

      if (!audioRef.current) {
        audioRef.current = new Audio(previewUrl)
        audioRef.current.onended = () => setPlaying(false)
      }
      audioRef.current.play()
      setPlaying(true)
    }
  }

  return (
    <button
      onClick={toggle}
      className="w-8 h-8 rounded-full bg-zinc-700 hover:bg-green-500 flex items-center justify-center transition-colors"
      title={playing ? 'Pause preview' : 'Play preview'}
    >
      {playing ? (
        <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  )
}
