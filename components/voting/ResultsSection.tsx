import Image from 'next/image'
import { calculateResults } from '@/lib/utils'
import AudioPreview from '@/components/spotify/AudioPreview'

interface Submission {
  id: string
  user_id: string
  track_name: string
  artist_name: string
  album_name: string | null
  album_art_url: string | null
  preview_url: string | null
  profiles: {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
  } | { id: string; username: string; display_name: string | null; avatar_url: string | null }[]
}

interface Vote {
  submission_id: string
  voter_id: string
}

interface ResultsSectionProps {
  submissions: Submission[]
  votes: Vote[]
}

const rankEmoji: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }
const pointsLabel: Record<number, string> = { 1: '3 pts', 2: '2 pts', 3: '1 pt' }

export default function ResultsSection({ submissions, votes }: ResultsSectionProps) {
  const voteCounts = Object.entries(
    votes.reduce<Record<string, number>>((acc, v) => {
      acc[v.submission_id] = (acc[v.submission_id] ?? 0) + 1
      return acc
    }, {})
  ).map(([submission_id, count]) => ({ submission_id, count }))

  // Map submissions to the format calculateResults expects
  const mappedSubmissions = submissions.map((s) => ({
    ...s,
    profiles: Array.isArray(s.profiles) ? s.profiles[0] : s.profiles,
  }))

  // Sort by vote count
  const sorted = [...mappedSubmissions].sort((a, b) => {
    const countA = voteCounts.find((v) => v.submission_id === a.id)?.count ?? 0
    const countB = voteCounts.find((v) => v.submission_id === b.id)?.count ?? 0
    return countB - countA
  })

  return (
    <div>
      <h2 className="text-lg font-semibold text-zinc-100 mb-6">Results</h2>
      <div className="space-y-3">
        {sorted.map((submission, index) => {
          const rank = index + 1
          const voteCount = voteCounts.find((v) => v.submission_id === submission.id)?.count ?? 0
          const profile = submission.profiles
          const points = rank <= 3 ? pointsLabel[rank] : null

          return (
            <div
              key={submission.id}
              className={`rounded-xl border p-4 ${
                rank === 1
                  ? 'border-yellow-500/30 bg-yellow-500/5'
                  : 'border-zinc-800 bg-zinc-900'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl w-8 text-center flex-shrink-0">
                  {rankEmoji[rank] ?? <span className="text-sm text-zinc-500">#{rank}</span>}
                </div>

                {submission.album_art_url && (
                  <Image
                    src={submission.album_art_url}
                    alt={submission.album_name ?? ''}
                    width={56}
                    height={56}
                    className="rounded flex-shrink-0"
                  />
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-zinc-100 truncate">{submission.track_name}</p>
                  <p className="text-sm text-zinc-400 truncate">{submission.artist_name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Submitted by{' '}
                    <span className="text-zinc-300">
                      {profile?.display_name ?? profile?.username}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  {submission.preview_url && (
                    <AudioPreview previewUrl={submission.preview_url} />
                  )}
                  <div className="text-right">
                    <p className="text-sm font-semibold text-zinc-100">
                      {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
                    </p>
                    {points && (
                      <p className="text-xs text-green-400">{points}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-8 text-zinc-500">
          <p>No submissions for this round.</p>
        </div>
      )}
    </div>
  )
}
