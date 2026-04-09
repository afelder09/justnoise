'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import SpotifySearch from '@/components/spotify/SpotifySearch'
import TrackCard from '@/components/spotify/TrackCard'
import type { SpotifyTrack, Submission } from '@/types'

interface SubmitSongSectionProps {
  roundId: string
  userId: string
  existingSubmission: Submission | null
}

export default function SubmitSongSection({ roundId, userId, existingSubmission }: SubmitSongSectionProps) {
  const router = useRouter()
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null)
  const [isChanging, setIsChanging] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit() {
    if (!selectedTrack) return
    setSubmitting(true)
    setError(null)

    const supabase = createClient()

    const payload = {
      round_id: roundId,
      user_id: userId,
      spotify_track_id: selectedTrack.id,
      track_name: selectedTrack.name,
      artist_name: selectedTrack.artists.map((a) => a.name).join(', '),
      album_name: selectedTrack.album.name,
      album_art_url: selectedTrack.album.images[0]?.url ?? null,
      preview_url: selectedTrack.preview_url,
      spotify_external_url: selectedTrack.external_urls.spotify,
    }

    const { error: upsertError } = await supabase
      .from('submissions')
      .upsert(payload, { onConflict: 'round_id,user_id' })

    if (upsertError) {
      setError(upsertError.message)
      setSubmitting(false)
      return
    }

    setSubmitted(true)
    setIsChanging(false)
    router.refresh()
  }

  if (submitted || (existingSubmission && !selectedTrack && !isChanging)) {
    const display = selectedTrack ?? (existingSubmission ? {
      id: existingSubmission.spotify_track_id,
      name: existingSubmission.track_name,
      artists: [{ name: existingSubmission.artist_name }],
      album: {
        name: existingSubmission.album_name ?? '',
        images: existingSubmission.album_art_url ? [{ url: existingSubmission.album_art_url, width: 64, height: 64 }] : [],
      },
      preview_url: existingSubmission.preview_url,
      external_urls: { spotify: existingSubmission.spotify_external_url ?? '' },
      duration_ms: 0,
    } as SpotifyTrack : null)

    return (
      <div>
        <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4 mb-6 flex items-center gap-2">
          <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-green-400">Your submission is in! You can change it before the deadline.</p>
        </div>
        {display && (
          <div className="mb-4">
            <TrackCard track={display} selected showPreview={!!display.preview_url} />
          </div>
        )}
        <button
          onClick={() => { setSelectedTrack(null); setIsChanging(true) }}
          className="text-sm text-zinc-400 hover:text-zinc-100 underline underline-offset-2"
        >
          Change submission
        </button>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-zinc-100 mb-4">Submit your song</h2>
      <p className="text-sm text-zinc-400 mb-6">
        Find a song that fits the theme. Your submission is anonymous during voting.
      </p>

      <SpotifySearch
        onSelect={setSelectedTrack}
        selectedTrackId={selectedTrack?.id}
      />

      {selectedTrack && (
        <div className="mt-6">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Your pick</p>
          <TrackCard track={selectedTrack} selected showPreview={!!selectedTrack.preview_url} />
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 rounded-lg bg-green-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? 'Submitting…' : existingSubmission ? 'Update submission' : 'Submit song'}
            </button>
            <button
              onClick={() => { setSelectedTrack(null); setIsChanging(false) }}
              className="rounded-lg border border-zinc-700 px-4 py-2.5 text-sm text-zinc-300 hover:border-zinc-500 transition-colors"
            >
              Cancel
            </button>
          </div>
          {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
        </div>
      )}
    </div>
  )
}
