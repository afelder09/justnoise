import type { Round, RoundStatus, RoundResult, SubmissionWithProfile, VoteCount } from '@/types'

export function getRoundStatus(round: Round): RoundStatus {
  const now = new Date()
  const startDate = new Date(round.start_date)
  const submissionDeadline = new Date(round.submission_deadline)
  const votingDeadline = new Date(round.voting_deadline)

  if (now < startDate) return 'upcoming'
  if (now < submissionDeadline) return 'submitting'
  if (now < votingDeadline) return 'voting'
  return 'complete'
}

export function calculateResults(
  submissions: SubmissionWithProfile[],
  voteCounts: VoteCount[]
): RoundResult[] {
  const countMap = new Map(voteCounts.map((v) => [v.submission_id, v.count]))

  const sorted = [...submissions].sort((a, b) => {
    const countA = countMap.get(a.id) ?? 0
    const countB = countMap.get(b.id) ?? 0
    return countB - countA
  })

  return sorted.map((submission, index) => {
    const rank = index + 1
    const points = rank === 1 ? 3 : rank === 2 ? 2 : rank === 3 ? 1 : 0
    return {
      submission,
      vote_count: countMap.get(submission.id) ?? 0,
      rank,
      points,
    }
  })
}

export function formatDeadline(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function getTimeRemaining(dateStr: string): string {
  const now = new Date()
  const target = new Date(dateStr)
  const diffMs = target.getTime() - now.getTime()

  if (diffMs <= 0) return 'Ended'

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  if (days > 0) return `${days}d ${hours}h remaining`
  if (hours > 0) return `${hours}h ${minutes}m remaining`
  return `${minutes}m remaining`
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
