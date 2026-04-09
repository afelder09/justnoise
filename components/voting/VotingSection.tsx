'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import TrackCard from '@/components/spotify/TrackCard'
import type { SpotifyTrack } from '@/types'

interface Submission {
  id: string
  spotify_track_id: string
  track_name: string
  artist_name: string
  album_name: string | null
  album_art_url: string | null
  preview_url: string | null
  spotify_external_url: string | null
  user_id: string
}

interface VotingSectionProps {
  roundId: string
  userId: string
  submissions: Submission[]
  myVote: { submission_id: string } | null
  mySubmissionId: string | null
}

export default function VotingSection({
  roundId,
  userId,
  submissions,
  myVote,
  mySubmissionId,
}: VotingSectionProps) {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState<string | null>(myVote?.submission_id ?? null)
  const [voting, setVoting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [voted, setVoted] = useState(!!myVote)

  async function handleVote() {
    if (!selectedId) return
    setVoting(true)
    setError(null)

    const supabase = createClient()

    if (myVote) {
      // Update existing vote
      const { error } = await supabase
        .from('votes')
        .update({ submission_id: selectedId })
        .eq('round_id', roundId)
        .eq('voter_id', userId)

      if (error) {
        setError(error.message)
        setVoting(false)
        return
      }
    } else {
      const { error } = await supabase
        .from('votes')
        .insert({ round_id: roundId, voter_id: userId, submission_id: selectedId })

      if (error) {
        if (error.message.includes('self')) {
          setError("You can't vote for your own song!")
        } else {
          setError(error.message)
        }
        setVoting(false)
        return
      }
    }

    setVoted(true)
    setVoting(false)
    router.refresh()
  }

  // Shuffle submissions to avoid positional bias (stable per session using sort)
  const shuffled = [...submissions].sort((a, b) => a.id.localeCompare(b.id))

  const toTrack = (s: Submission): SpotifyTrack => ({
    id: s.spotify_track_id,
    name: s.track_name,
    artists: [{ name: s.artist_name }],
    album: {
      name: s.album_name ?? '',
      images: s.album_art_url ? [{ url: s.album_art_url, width: 64, height: 64 }] : [],
    },
    preview_url: s.preview_url,
    external_urls: { spotify: s.spotify_external_url ?? '' },
    duration_ms: 0,
  })

  return (
    <div>
      <h2 className="text-lg font-semibold text-zinc-100 mb-2">Vote for your favorite</h2>
      <p className="text-sm text-zinc-400 mb-6">
        Submissions are anonymous. Pick the song that fits the theme best.
        {mySubmissionId && ' You cannot vote for your own song.'}
      </p>

      {voted && (
        <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4 mb-6 flex items-center gap-2">
          <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-green-400">Vote submitted! You can change it before the deadline.</p>
        </div>
      )}

      <div className="space-y-3 mb-6">
        {shuffled.map((submission) => {
          const isOwn = submission.id === mySubmissionId
          return (
            <div key={submission.id} className={isOwn ? 'opacity-50 cursor-not-allowed' : ''}>
              <TrackCard
                track={toTrack(submission)}
                selected={selectedId === submission.id}
                onClick={isOwn ? undefined : () => setSelectedId(submission.id)}
                showPreview={!isOwn && !!submission.preview_url}
              />
              {isOwn && (
                <p className="text-xs text-zinc-500 mt-1 px-1">Your submission</p>
              )}
            </div>
          )
        })}
      </div>

      {error && <p className="text-sm text-red-400 mb-3">{error}</p>}

      <button
        onClick={handleVote}
        disabled={!selectedId || voting}
        className="rounded-lg bg-green-500 px-6 py-2.5 text-sm font-semibold text-black hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {voting ? 'Submitting vote…' : voted ? 'Update vote' : 'Submit vote'}
      </button>
    </div>
  )
}
