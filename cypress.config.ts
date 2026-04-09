import { defineConfig } from 'cypress'
import { createClient } from '@supabase/supabase-js'

interface CreateUserArgs {
  email: string
  password: string
  username: string
}

interface CreateRoundArgs {
  groupId: string
  createdBy: string
  phase: 'upcoming' | 'submitting' | 'voting' | 'complete'
  theme: string
}

interface InsertSubmissionArgs {
  roundId: string
  userId: string
  trackData?: {
    spotify_track_id?: string
    track_name?: string
    artist_name?: string
    album_name?: string
  }
}

interface InsertVoteArgs {
  roundId: string
  voterId: string
  submissionId: string
}

function adminClient(config: Cypress.PluginConfigOptions) {
  return createClient(
    config.env.SUPABASE_URL as string,
    config.env.SUPABASE_SERVICE_ROLE_KEY as string,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

function hoursFromNow(h: number): string {
  return new Date(Date.now() + h * 3600_000).toISOString()
}

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 3600_000).toISOString()
}

function roundTimestamps(phase: CreateRoundArgs['phase']) {
  switch (phase) {
    case 'upcoming':
      return {
        start_date: hoursFromNow(1),
        submission_deadline: hoursFromNow(25),
        voting_deadline: hoursFromNow(49),
      }
    case 'submitting':
      return {
        start_date: hoursAgo(2),
        submission_deadline: hoursFromNow(22),
        voting_deadline: hoursFromNow(46),
      }
    case 'voting':
      return {
        start_date: hoursAgo(48),
        submission_deadline: hoursAgo(2),
        voting_deadline: hoursFromNow(22),
      }
    case 'complete':
      return {
        start_date: hoursAgo(96),
        submission_deadline: hoursAgo(48),
        voting_deadline: hoursAgo(2),
      }
  }
}

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    viewportWidth: 1280,
    viewportHeight: 800,
    video: false,
    setupNodeEvents(on, config) {
      on('task', {
        async createUser({ email, password, username }: CreateUserArgs) {
          const admin = adminClient(config)
          const { data, error } = await admin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { username, display_name: username },
          })
          if (error) throw new Error(`createUser failed: ${error.message}`)
          return { id: data.user.id, email, password, username }
        },

        async deleteUser({ userId }: { userId: string }) {
          const admin = adminClient(config)
          const { error } = await admin.auth.admin.deleteUser(userId)
          if (error) throw new Error(`deleteUser failed: ${error.message}`)
          return null
        },

        async cleanupTestData({ userIds }: { userIds: string[] }) {
          const admin = adminClient(config)
          for (const userId of userIds) {
            await admin.auth.admin.deleteUser(userId)
          }
          return null
        },

        async createGroup({
          name,
          createdBy,
          inviteCode,
        }: {
          name: string
          createdBy: string
          inviteCode: string
        }) {
          const admin = adminClient(config)
          const { data, error } = await admin
            .from('groups')
            .insert({ name, creator_id: createdBy, invite_code: inviteCode })
            .select()
            .single()
          if (error) throw new Error(`createGroup failed: ${error.message}`)
          // The on_group_created trigger (handle_new_group) auto-inserts the creator
          // into group_members — no manual insert needed.
          return data
        },

        async createRoundInPhase({ groupId, createdBy, phase, theme }: CreateRoundArgs) {
          const admin = adminClient(config)
          const timestamps = roundTimestamps(phase)
          const { data, error } = await admin
            .from('rounds')
            .insert({ group_id: groupId, created_by: createdBy, theme, ...timestamps })
            .select()
            .single()
          if (error) throw new Error(`createRoundInPhase failed: ${error.message}`)
          return data
        },

        async insertSubmission({ roundId, userId, trackData = {} }: InsertSubmissionArgs) {
          const admin = adminClient(config)
          const { data, error } = await admin
            .from('submissions')
            .upsert({
              round_id: roundId,
              user_id: userId,
              spotify_track_id: trackData.spotify_track_id ?? 'track_test',
              track_name: trackData.track_name ?? 'Test Track',
              artist_name: trackData.artist_name ?? 'Test Artist',
              album_name: trackData.album_name ?? 'Test Album',
            }, { onConflict: 'round_id,user_id' })
            .select()
            .single()
          if (error) throw new Error(`insertSubmission failed: ${error.message}`)
          return data
        },

        async insertVote({ roundId, voterId, submissionId }: InsertVoteArgs) {
          const admin = adminClient(config)
          const { data, error } = await admin
            .from('votes')
            .insert({ round_id: roundId, voter_id: voterId, submission_id: submissionId })
            .select()
            .single()
          if (error) throw new Error(`insertVote failed: ${error.message}`)
          return data
        },

        async trySelfVote({ roundId, voterId, submissionId }: InsertVoteArgs) {
          const admin = adminClient(config)
          const { error } = await admin
            .from('votes')
            .insert({ round_id: roundId, voter_id: voterId, submission_id: submissionId })
          // Return the error message (or null if somehow it succeeded)
          return error?.message ?? null
        },

        async getSubmission({ roundId, userId }: { roundId: string; userId: string }) {
          const admin = adminClient(config)
          const { data } = await admin
            .from('submissions')
            .select()
            .eq('round_id', roundId)
            .eq('user_id', userId)
          return data ?? []
        },

        async getVote({ roundId, voterId }: { roundId: string; voterId: string }) {
          const admin = adminClient(config)
          const { data } = await admin
            .from('votes')
            .select()
            .eq('round_id', roundId)
            .eq('voter_id', voterId)
          return data ?? []
        },

        async getProfile({ userId }: { userId: string }) {
          const admin = adminClient(config)
          const { data } = await admin.from('profiles').select().eq('id', userId).single()
          return data
        },

        async addGroupMember({ groupId, userId }: { groupId: string; userId: string }) {
          const admin = adminClient(config)
          const { error } = await admin
            .from('group_members')
            .insert({ group_id: groupId, user_id: userId })
          if (error) throw new Error(`addGroupMember failed: ${error.message}`)
          return null
        },

        async getGroupMembers({ groupId }: { groupId: string }) {
          const admin = adminClient(config)
          const { data } = await admin
            .from('group_members')
            .select()
            .eq('group_id', groupId)
          return data ?? []
        },
      })
    },
  },
  env: {
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
})
