import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import JoinGroupButton from '@/components/groups/JoinGroupButton'

export default async function InvitePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?next=/invite/${code}`)
  }

  const { data: group } = await supabase
    .from('groups')
    .select('id, name, description, creator_id, profiles(username, display_name)')
    .eq('invite_code', code)
    .single()

  if (!group) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-zinc-100 mb-2">Invite not found</h1>
          <p className="text-zinc-400 text-sm">This invite link may be invalid or expired.</p>
        </div>
      </div>
    )
  }

  // Check if already a member
  const { data: existing } = await supabase
    .from('group_members')
    .select('user_id')
    .eq('group_id', group.id)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    redirect(`/groups/${group.id}`)
  }

  const creator = Array.isArray(group.profiles) ? group.profiles[0] : group.profiles

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <p className="text-sm text-zinc-400 mb-2">You&apos;ve been invited to join the studio</p>
        <h1 className="text-2xl font-bold text-zinc-100 mb-1">{group.name}</h1>
        {group.description && (
          <p className="text-sm text-zinc-400 mb-1">{group.description}</p>
        )}
        <p className="text-xs text-zinc-500 mb-8">
          Created by {creator?.display_name ?? creator?.username}
        </p>
        <JoinGroupButton groupId={group.id} userId={user.id} />
      </div>
    </div>
  )
}
