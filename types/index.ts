import type { Database } from './database'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Group = Database['public']['Tables']['groups']['Row']
export type GroupMember = Database['public']['Tables']['group_members']['Row']
export type Round = Database['public']['Tables']['rounds']['Row']
export type Submission = Database['public']['Tables']['submissions']['Row']
export type Vote = Database['public']['Tables']['votes']['Row']

export type RoundStatus = 'upcoming' | 'submitting' | 'voting' | 'complete'

export interface RoundWithStatus extends Round {
  status: RoundStatus
}

export interface SubmissionWithProfile extends Submission {
  profiles: Pick<Profile, 'id' | 'username' | 'display_name' | 'avatar_url'>
}

export interface VoteCount {
  submission_id: string
  count: number
}

export interface RoundResult {
  submission: SubmissionWithProfile
  vote_count: number
  rank: number
  points: number
}

export interface LeaderboardEntry {
  user_id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  total_points: number
  wins: number
}

export interface SpotifyTrack {
  id: string
  name: string
  artists: { name: string }[]
  album: {
    name: string
    images: { url: string; width: number; height: number }[]
  }
  preview_url: string | null
  external_urls: { spotify: string }
  duration_ms: number
}
