'use client'

import { useState, useCallback, useRef } from 'react'
import type { SpotifyTrack } from '@/types'
import TrackCard from './TrackCard'

interface SpotifySearchProps {
  onSelect: (track: SpotifyTrack) => void
  selectedTrackId?: string
}

export default function SpotifySearch({ onSelect, selectedTrackId }: SpotifySearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SpotifyTrack[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/spotify/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setResults(data.tracks ?? [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    setQuery(value)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(value), 400)
  }

  return (
    <div>
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search for a song..."
          className="w-full rounded-lg bg-zinc-900 border border-zinc-700 pl-9 pr-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {loading && (
        <p className="text-xs text-zinc-500 mt-2 px-1">Searching…</p>
      )}

      {results.length > 0 && (
        <div className="mt-3 space-y-2 max-h-80 overflow-y-auto">
          {results.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              selected={track.id === selectedTrackId}
              onClick={() => onSelect(track)}
              showPreview={false}
            />
          ))}
        </div>
      )}
    </div>
  )
}
