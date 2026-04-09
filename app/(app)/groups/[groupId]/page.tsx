import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import RoundCard from '@/components/rounds/RoundCard'
import InviteButton from '@/components/groups/InviteButton'
import { getRoundStatus } from '@/lib/utils'

export default async function GroupPage({ params }: { params: Promise<{ groupId: string }> }) {
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
    .select('*')
    .eq('id', groupId)
    .single()

  if (!group) notFound()

  const { data: rounds } = await supabase
    .from('rounds')
    .select('*')
    .eq('group_id', groupId)
    .order('start_date', { ascending: false })

  const { data: members } = await supabase
    .from('group_members')
    .select('user_id, joined_at, profiles(id, username, display_name)')
    .eq('group_id', groupId)

  const isCreator = group.creator_id === user!.id
  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${group.invite_code}`

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-300">
              Studios
            </Link>
            <span className="text-zinc-600">/</span>
            <span className="text-sm text-zinc-400">{group.name}</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100">{group.name}</h1>
          {group.description && (
            <p className="text-sm text-zinc-400 mt-1">{group.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <InviteButton inviteUrl={inviteUrl} />
          {isCreator && (
            <Link
              href={`/groups/${groupId}/rounds/new`}
              className="rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-black hover:bg-green-400 transition-colors"
            >
              + New Session
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Sessions</h2>
          {!rounds || rounds.length === 0 ? (
            <div className="rounded-xl border border-zinc-800 p-8 text-center text-zinc-500">
              <p>{isCreator ? 'Start your first session!' : 'No sessions yet.'}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rounds.map((round) => (
                <RoundCard
                  key={round.id}
                  round={round}
                  groupId={groupId}
                  status={getRoundStatus(round)}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Members</h2>
            <Link href={`/groups/${groupId}/leaderboard`} className="text-xs text-green-400 hover:text-green-300">
              Leaderboard →
            </Link>
          </div>
          <div className="space-y-2">
            {members?.map((m) => {
              const profile = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles
              return (
                <div key={m.user_id} className="flex items-center gap-2.5 rounded-lg bg-zinc-900 px-3 py-2.5">
                  <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-medium text-zinc-300">
                    {(profile?.display_name ?? profile?.username ?? '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm text-zinc-200">{profile?.display_name ?? profile?.username}</p>
                    {group.creator_id === m.user_id && (
                      <p className="text-xs text-green-400">Creator</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
