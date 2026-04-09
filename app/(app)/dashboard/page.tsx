import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import GroupCard from '@/components/groups/GroupCard'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: memberships } = await supabase
    .from('group_members')
    .select(`
      group_id,
      joined_at,
      groups (
        id, name, description, creator_id, invite_code, created_at
      )
    `)
    .eq('user_id', user!.id)
    .order('joined_at', { ascending: false })

  const groups = memberships?.map((m) => m.groups).filter(Boolean) ?? []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-100">Your Studios</h1>
        <Link
          href="/groups/new"
          className="rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-black hover:bg-green-400 transition-colors"
        >
          + New Studio
        </Link>
      </div>

      {groups.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <p className="text-lg mb-2">No studios yet</p>
          <p className="text-sm">Create a studio or ask someone to share their invite link.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {groups.map((group) => (
            <GroupCard key={group!.id} group={group!} userId={user!.id} />
          ))}
        </div>
      )}
    </div>
  )
}
