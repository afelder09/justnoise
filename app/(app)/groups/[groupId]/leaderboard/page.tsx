import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{ groupId: string }>
}) {
  const { groupId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Verify membership
  const { data: membership } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', groupId)
    .eq('user_id', user!.id)
    .single()

  if (!membership) notFound()

  const { data: group } = await supabase
    .from('groups')
    .select('id, name')
    .eq('id', groupId)
    .single()

  if (!group) notFound()

  // Compute leaderboard from votes + submissions
  const { data: rounds } = await supabase
    .from('rounds')
    .select('id, voting_deadline')
    .eq('group_id', groupId)
    .lte('voting_deadline', new Date().toISOString())

  const completedRoundIds = rounds?.map((r) => r.id) ?? []

  interface PointsMap {
    [userId: string]: {
      username: string
      display_name: string | null
      avatar_url: string | null
      total_points: number
      wins: number
    }
  }

  const pointsMap: PointsMap = {}

  for (const roundId of completedRoundIds) {
    const { data: submissions } = await supabase
      .from('submissions')
      .select('id, user_id, profiles(username, display_name, avatar_url)')
      .eq('round_id', roundId)

    const { data: votes } = await supabase
      .from('votes')
      .select('submission_id')
      .eq('round_id', roundId)

    if (!submissions || !votes) continue

    const voteCounts: Record<string, number> = {}
    for (const v of votes) {
      voteCounts[v.submission_id] = (voteCounts[v.submission_id] ?? 0) + 1
    }

    const ranked = [...submissions].sort(
      (a, b) => (voteCounts[b.id] ?? 0) - (voteCounts[a.id] ?? 0)
    )

    ranked.forEach((sub, index) => {
      const rank = index + 1
      const pts = rank === 1 ? 3 : rank === 2 ? 2 : rank === 3 ? 1 : 0
      const profile = Array.isArray(sub.profiles) ? sub.profiles[0] : sub.profiles

      if (!pointsMap[sub.user_id]) {
        pointsMap[sub.user_id] = {
          username: profile?.username ?? 'unknown',
          display_name: profile?.display_name ?? null,
          avatar_url: profile?.avatar_url ?? null,
          total_points: 0,
          wins: 0,
        }
      }
      pointsMap[sub.user_id].total_points += pts
      if (rank === 1 && pts > 0) pointsMap[sub.user_id].wins += 1
    })
  }

  const leaderboard = Object.entries(pointsMap)
    .map(([userId, data]) => ({ userId, ...data }))
    .sort((a, b) => b.total_points - a.total_points || b.wins - a.wins)

  const rankEmoji: Record<number, string> = { 0: '🥇', 1: '🥈', 2: '🥉' }

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-zinc-500 mb-6">
        <Link href="/dashboard" className="hover:text-zinc-300">Studios</Link>
        <span>/</span>
        <Link href={`/groups/${groupId}`} className="hover:text-zinc-300">{group.name}</Link>
        <span>/</span>
        <span className="text-zinc-400">Leaderboard</span>
      </div>

      <h1 className="text-2xl font-bold text-zinc-100 mb-8">Leaderboard</h1>

      {leaderboard.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          <p>No completed sessions yet. Points will appear here after sessions end.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((entry, index) => (
            <div
              key={entry.userId}
              className={`flex items-center gap-4 rounded-xl border px-5 py-4 ${
                index === 0
                  ? 'border-yellow-500/30 bg-yellow-500/5'
                  : 'border-zinc-800 bg-zinc-900'
              }`}
            >
              <div className="text-2xl w-8 text-center">
                {rankEmoji[index] ?? <span className="text-sm text-zinc-500">#{index + 1}</span>}
              </div>
              <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-medium text-zinc-300 flex-shrink-0">
                {(entry.display_name ?? entry.username)[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-zinc-100">{entry.display_name ?? entry.username}</p>
                <p className="text-xs text-zinc-500">@{entry.username}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-zinc-100">{entry.total_points} pts</p>
                <p className="text-xs text-zinc-500">{entry.wins} {entry.wins === 1 ? 'win' : 'wins'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
