'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function toLocalDatetimeString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export default function CreateRoundForm({ groupId, userId }: { groupId: string; userId: string }) {
  const router = useRouter()
  const now = new Date()
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
  const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
  const fiveDays = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000)

  const [theme, setTheme] = useState('')
  const [startDate, setStartDate] = useState(toLocalDatetimeString(now))
  const [submissionDeadline, setSubmissionDeadline] = useState(toLocalDatetimeString(threeDays))
  const [votingDeadline, setVotingDeadline] = useState(toLocalDatetimeString(fiveDays))
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const start = new Date(startDate)
    const sub = new Date(submissionDeadline)
    const vote = new Date(votingDeadline)

    if (sub <= start) {
      setError('Submission deadline must be after the start date')
      return
    }
    if (vote <= sub) {
      setError('Voting deadline must be after the submission deadline')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { data: round, error: roundError } = await supabase
      .from('rounds')
      .insert({
        group_id: groupId,
        created_by: userId,
        theme,
        start_date: start.toISOString(),
        submission_deadline: sub.toISOString(),
        voting_deadline: vote.toISOString(),
      })
      .select()
      .single()

    if (roundError) {
      setError(roundError.message)
      setLoading(false)
      return
    }

    router.push(`/groups/${groupId}/rounds/${round.id}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="theme" className="block text-sm font-medium text-zinc-300 mb-1.5">
          Theme
        </label>
        <input
          id="theme"
          type="text"
          required
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          placeholder="Songs that make you feel invincible"
          maxLength={200}
        />
      </div>

      <div>
        <label htmlFor="start_date" className="block text-sm font-medium text-zinc-300 mb-1.5">
          Start date
        </label>
        <input
          id="start_date"
          type="datetime-local"
          required
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2.5 text-sm text-zinc-100 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
        />
      </div>

      <div>
        <label htmlFor="submission_deadline" className="block text-sm font-medium text-zinc-300 mb-1.5">
          Submission deadline
        </label>
        <input
          id="submission_deadline"
          type="datetime-local"
          required
          value={submissionDeadline}
          onChange={(e) => setSubmissionDeadline(e.target.value)}
          className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2.5 text-sm text-zinc-100 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
        />
      </div>

      <div>
        <label htmlFor="voting_deadline" className="block text-sm font-medium text-zinc-300 mb-1.5">
          Voting deadline
        </label>
        <input
          id="voting_deadline"
          type="datetime-local"
          required
          value={votingDeadline}
          onChange={(e) => setVotingDeadline(e.target.value)}
          className="w-full rounded-lg bg-zinc-900 border border-zinc-700 px-3 py-2.5 text-sm text-zinc-100 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-green-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Creating…' : 'Create session'}
      </button>
    </form>
  )
}
