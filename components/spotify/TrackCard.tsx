import Image from 'next/image'
import type { SpotifyTrack } from '@/types'
import { formatDuration } from '@/lib/utils'
import AudioPreview from './AudioPreview'

interface TrackCardProps {
  track: SpotifyTrack
  selected?: boolean
  onClick?: () => void
  showPreview?: boolean
}

export default function TrackCard({ track, selected, onClick, showPreview = true }: TrackCardProps) {
  const albumArt = track.album.images[0]?.url
  const artistNames = track.artists.map((a) => a.name).join(', ')

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
        onClick ? 'cursor-pointer' : ''
      } ${
        selected
          ? 'border-green-500 bg-green-500/10'
          : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'
      }`}
    >
      {albumArt && (
        <Image
          src={albumArt}
          alt={track.album.name}
          width={48}
          height={48}
          className="rounded flex-shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-100 truncate">{track.name}</p>
        <p className="text-xs text-zinc-400 truncate">{artistNames}</p>
        <p className="text-xs text-zinc-600 truncate">{track.album.name}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xs text-zinc-500">{formatDuration(track.duration_ms)}</span>
        {showPreview && track.preview_url && (
          <AudioPreview previewUrl={track.preview_url} />
        )}
        {selected && (
          <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    </div>
  )
}
