'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function JoinGroupButton({ groupId, userId }: { groupId: string; userId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleJoin() {
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase
      .from('group_members')
      .insert({ group_id: groupId, user_id: userId })

    if (error) {
      setError('Failed to join group. Please try again.')
      setLoading(false)
      return
    }

    router.push(`/groups/${groupId}`)
  }

  return (
    <div>
      {error && <p className="text-sm text-red-400 mb-3">{error}</p>}
      <button
        onClick={handleJoin}
        disabled={loading}
        className="w-full rounded-lg bg-green-500 px-6 py-3 font-semibold text-black hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Joining…' : 'Join Studio'}
      </button>
    </div>
  )
}
