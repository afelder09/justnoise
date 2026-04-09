import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getRoundStatus, formatDeadline, getTimeRemaining } from '@/lib/utils'
import SubmitSongSection from '@/components/rounds/SubmitSongSection'
import VotingSection from '@/components/voting/VotingSection'
import ResultsSection from '@/components/voting/ResultsSection'

export default async function RoundPage({
  params,
}: {
  params: Promise<{ groupId: string; roundId: string }>
}) {
  const { groupId, roundId } = await params
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

  const { data: round } = await supabase
    .from('rounds')
    .select('*')
    .eq('id', roundId)
    .eq('group_id', groupId)
    .single()

  if (!round) notFound()

  const { data: group } = await supabase
    .from('groups')
    .select('id, name')
    .eq('id', groupId)
    .single()

  const status = getRoundStatus(round)

  // Fetch user's own submission (always useful)
  const { data: mySubmission } = await supabase
    .from('submissions')
    .select('*')
    .eq('round_id', roundId)
    .eq('user_id', user!.id)
    .single()

  // Fetch all submissions (for voting + results)
  let submissions = null
  let votes = null
  let myVote = null

  if (status === 'voting' || status === 'complete') {
    const { data } = await supabase
      .from('submissions')
      .select('*, profiles(id, username, display_name, avatar_url)')
      .eq('round_id', roundId)

    submissions = data

    const { data: voteData } = await supabase
      .from('votes')
      .select('submission_id, voter_id')
      .eq('round_id', roundId)

    votes = voteData

    myVote = voteData?.find((v) => v.voter_id === user!.id) ?? null
  }

  const deadlineLabel =
    status === 'submitting'
      ? `Submit by ${formatDeadline(round.submission_deadline)}`
      : status === 'voting'
      ? `Vote by ${formatDeadline(round.voting_deadline)}`
      : null

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-zinc-500 mb-6">
        <Link href="/dashboard" className="hover:text-zinc-300">Studios</Link>
        <span>/</span>
        <Link href={`/groups/${groupId}`} className="hover:text-zinc-300">{group?.name}</Link>
        <span>/</span>
        <span className="text-zinc-400 truncate max-w-xs">{round.theme}</span>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-100 mb-1">{round.theme}</h1>
        {deadlineLabel && (
          <p className="text-sm text-zinc-400">{deadlineLabel}</p>
        )}
        {status === 'upcoming' && (
          <p className="text-sm text-zinc-400">
            Opens {formatDeadline(round.start_date)} · {getTimeRemaining(round.start_date)}
          </p>
        )}
        {status === 'complete' && (
          <p className="text-sm text-zinc-500">Session ended {formatDeadline(round.voting_deadline)}</p>
        )}
      </div>

      {status === 'upcoming' && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center text-zinc-400">
          <p className="text-lg font-medium text-zinc-100 mb-1">Session not started yet</p>
          <p className="text-sm">Come back when submissions open.</p>
        </div>
      )}

      {status === 'submitting' && (
        <SubmitSongSection
          roundId={roundId}
          userId={user!.id}
          existingSubmission={mySubmission}
        />
      )}

      {status === 'voting' && submissions && (
        <VotingSection
          roundId={roundId}
          userId={user!.id}
          submissions={submissions}
          myVote={myVote}
          mySubmissionId={mySubmission?.id ?? null}
        />
      )}

      {status === 'complete' && submissions && votes && (
        <ResultsSection
          submissions={submissions}
          votes={votes}
        />
      )}
    </div>
  )
}
