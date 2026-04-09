import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-zinc-100 mb-8">Profile</h1>
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 space-y-4">
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Username</p>
          <p className="text-zinc-100">@{profile?.username}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Display name</p>
          <p className="text-zinc-100">{profile?.display_name ?? '—'}</p>
        </div>
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Email</p>
          <p className="text-zinc-100">{user.email}</p>
        </div>
      </div>
    </div>
  )
}
