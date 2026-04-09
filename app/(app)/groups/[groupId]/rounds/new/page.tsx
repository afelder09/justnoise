import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CreateRoundForm from '@/components/rounds/CreateRoundForm'

export default async function NewRoundPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: group } = await supabase
    .from('groups')
    .select('id, name, creator_id')
    .eq('id', groupId)
    .single()

  if (!group) notFound()

  // Only creator can create rounds
  if (group.creator_id !== user!.id) {
    redirect(`/groups/${groupId}`)
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <p className="text-sm text-zinc-500 mb-1">{group.name}</p>
        <h1 className="text-2xl font-bold text-zinc-100">New Session</h1>
      </div>
      <CreateRoundForm groupId={groupId} userId={user!.id} />
    </div>
  )
}
