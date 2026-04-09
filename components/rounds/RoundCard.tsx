import Link from 'next/link'
import type { Round, RoundStatus } from '@/types'
import { formatDeadline, getTimeRemaining } from '@/lib/utils'

const statusConfig: Record<RoundStatus, { label: string; color: string }> = {
  upcoming: { label: 'Upcoming', color: 'text-zinc-400 bg-zinc-800 border-zinc-700' },
  submitting: { label: 'Submit songs', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  voting: { label: 'Voting', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  complete: { label: 'Complete', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
}

interface RoundCardProps {
  round: Round
  groupId: string
  status: RoundStatus
}

export default function RoundCard({ round, groupId, status }: RoundCardProps) {
  const config = statusConfig[status]

  const deadline =
    status === 'submitting'
      ? round.submission_deadline
      : status === 'voting'
      ? round.voting_deadline
      : null

  return (
    <Link
      href={`/groups/${groupId}/rounds/${round.id}`}
      className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-5 py-4 hover:border-zinc-600 transition-colors"
    >
      <div>
        <h3 className="font-semibold text-zinc-100">{round.theme}</h3>
        <p className="text-xs text-zinc-500 mt-0.5">
          {status === 'upcoming'
            ? `Starts ${formatDeadline(round.start_date)}`
            : status === 'complete'
            ? `Ended ${formatDeadline(round.voting_deadline)}`
            : deadline
            ? getTimeRemaining(deadline)
            : ''}
        </p>
      </div>
      <span className={`text-xs border rounded px-2 py-0.5 ${config.color}`}>
        {config.label}
      </span>
    </Link>
  )
}
