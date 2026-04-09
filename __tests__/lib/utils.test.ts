import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getRoundStatus,
  calculateResults,
  getTimeRemaining,
  formatDuration,
} from '@/lib/utils'
import type { Round, SubmissionWithProfile, VoteCount } from '@/types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRound(overrides: Partial<Round> = {}): Round {
  return {
    id: 'round-1',
    group_id: 'group-1',
    created_by: 'user-1',
    theme: 'Test theme',
    start_date: new Date(Date.now() - 48 * 3600_000).toISOString(),
    submission_deadline: new Date(Date.now() - 24 * 3600_000).toISOString(),
    voting_deadline: new Date(Date.now() - 1 * 3600_000).toISOString(),
    created_at: new Date(Date.now() - 72 * 3600_000).toISOString(),
    ...overrides,
  } as Round
}

function makeSubmission(id: string, userId: string): SubmissionWithProfile {
  return {
    id,
    round_id: 'round-1',
    user_id: userId,
    spotify_track_id: `track-${id}`,
    track_name: `Track ${id}`,
    artist_name: 'Artist',
    album_name: 'Album',
    album_art_url: null,
    preview_url: null,
    spotify_external_url: null,
    submitted_at: new Date().toISOString(),
    profiles: { id: userId, username: `user_${userId}`, display_name: null, avatar_url: null },
  } as SubmissionWithProfile
}

// ---------------------------------------------------------------------------
// getRoundStatus
// ---------------------------------------------------------------------------

describe('getRoundStatus', () => {
  const NOW = new Date('2024-06-15T12:00:00Z').getTime()

  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('returns upcoming when now is before start_date', () => {
    vi.setSystemTime(NOW)
    const round = makeRound({
      start_date: new Date(NOW + 3600_000).toISOString(),
      submission_deadline: new Date(NOW + 7200_000).toISOString(),
      voting_deadline: new Date(NOW + 10800_000).toISOString(),
    })
    expect(getRoundStatus(round)).toBe('upcoming')
  })

  it('returns submitting when now is between start and submission_deadline', () => {
    vi.setSystemTime(NOW)
    const round = makeRound({
      start_date: new Date(NOW - 3600_000).toISOString(),
      submission_deadline: new Date(NOW + 3600_000).toISOString(),
      voting_deadline: new Date(NOW + 7200_000).toISOString(),
    })
    expect(getRoundStatus(round)).toBe('submitting')
  })

  it('returns voting when now is between submission_deadline and voting_deadline', () => {
    vi.setSystemTime(NOW)
    const round = makeRound({
      start_date: new Date(NOW - 7200_000).toISOString(),
      submission_deadline: new Date(NOW - 3600_000).toISOString(),
      voting_deadline: new Date(NOW + 3600_000).toISOString(),
    })
    expect(getRoundStatus(round)).toBe('voting')
  })

  it('returns complete when now is after voting_deadline', () => {
    vi.setSystemTime(NOW)
    const round = makeRound({
      start_date: new Date(NOW - 10800_000).toISOString(),
      submission_deadline: new Date(NOW - 7200_000).toISOString(),
      voting_deadline: new Date(NOW - 3600_000).toISOString(),
    })
    expect(getRoundStatus(round)).toBe('complete')
  })

  it('returns submitting at exactly start_date', () => {
    vi.setSystemTime(NOW)
    const round = makeRound({
      start_date: new Date(NOW).toISOString(),
      submission_deadline: new Date(NOW + 3600_000).toISOString(),
      voting_deadline: new Date(NOW + 7200_000).toISOString(),
    })
    expect(getRoundStatus(round)).toBe('submitting')
  })
})

// ---------------------------------------------------------------------------
// calculateResults
// ---------------------------------------------------------------------------

describe('calculateResults', () => {
  it('ranks submissions by vote count descending', () => {
    const submissions = [
      makeSubmission('a', 'u1'),
      makeSubmission('b', 'u2'),
      makeSubmission('c', 'u3'),
    ]
    const voteCounts: VoteCount[] = [
      { submission_id: 'a', count: 1 },
      { submission_id: 'b', count: 3 },
      { submission_id: 'c', count: 2 },
    ]
    const results = calculateResults(submissions, voteCounts)
    expect(results[0].submission.id).toBe('b')
    expect(results[1].submission.id).toBe('c')
    expect(results[2].submission.id).toBe('a')
  })

  it('assigns correct points (3/2/1/0)', () => {
    const submissions = ['a', 'b', 'c', 'd'].map((id) => makeSubmission(id, `u${id}`))
    const voteCounts: VoteCount[] = [
      { submission_id: 'a', count: 4 },
      { submission_id: 'b', count: 3 },
      { submission_id: 'c', count: 2 },
      { submission_id: 'd', count: 1 },
    ]
    const results = calculateResults(submissions, voteCounts)
    expect(results[0].points).toBe(3)
    expect(results[1].points).toBe(2)
    expect(results[2].points).toBe(1)
    expect(results[3].points).toBe(0)
  })

  it('assigns 0 votes to submissions missing from voteCounts', () => {
    const submissions = [makeSubmission('a', 'u1'), makeSubmission('b', 'u2')]
    const results = calculateResults(submissions, [{ submission_id: 'a', count: 5 }])
    expect(results[0].submission.id).toBe('a')
    expect(results[0].vote_count).toBe(5)
    expect(results[1].submission.id).toBe('b')
    expect(results[1].vote_count).toBe(0)
  })

  it('assigns correct rank values', () => {
    const submissions = ['a', 'b'].map((id) => makeSubmission(id, `u${id}`))
    const voteCounts: VoteCount[] = [
      { submission_id: 'a', count: 2 },
      { submission_id: 'b', count: 1 },
    ]
    const results = calculateResults(submissions, voteCounts)
    expect(results[0].rank).toBe(1)
    expect(results[1].rank).toBe(2)
  })
})

// ---------------------------------------------------------------------------
// getTimeRemaining
// ---------------------------------------------------------------------------

describe('getTimeRemaining', () => {
  const NOW = new Date('2024-06-15T12:00:00Z').getTime()

  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('returns "Ended" when target is in the past', () => {
    vi.setSystemTime(NOW)
    expect(getTimeRemaining(new Date(NOW - 1000).toISOString())).toBe('Ended')
  })

  it('shows days and hours when more than 24h remain', () => {
    vi.setSystemTime(NOW)
    const target = new Date(NOW + 2 * 24 * 3600_000 + 5 * 3600_000).toISOString()
    expect(getTimeRemaining(target)).toBe('2d 5h remaining')
  })

  it('shows hours and minutes when less than 24h remain', () => {
    vi.setSystemTime(NOW)
    const target = new Date(NOW + 3 * 3600_000 + 30 * 60_000).toISOString()
    expect(getTimeRemaining(target)).toBe('3h 30m remaining')
  })

  it('shows only minutes when less than 1h remain', () => {
    vi.setSystemTime(NOW)
    const target = new Date(NOW + 45 * 60_000).toISOString()
    expect(getTimeRemaining(target)).toBe('45m remaining')
  })
})

// ---------------------------------------------------------------------------
// formatDuration
// ---------------------------------------------------------------------------

describe('formatDuration', () => {
  it('formats whole minutes', () => {
    expect(formatDuration(3 * 60_000)).toBe('3:00')
  })

  it('pads seconds with leading zero', () => {
    expect(formatDuration(3 * 60_000 + 5_000)).toBe('3:05')
  })

  it('handles zero', () => {
    expect(formatDuration(0)).toBe('0:00')
  })

  it('handles sub-second precision by flooring', () => {
    expect(formatDuration(61_999)).toBe('1:01')
  })
})
