'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types'

export default function Nav({ profile }: { profile: Profile | null }) {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="font-bold text-lg text-zinc-100 hover:text-white">
          Studio
        </Link>
        <div className="flex items-center gap-4">
          {profile && (
            <span className="text-sm text-zinc-400">
              {profile.display_name ?? profile.username}
            </span>
          )}
          <button
            onClick={handleSignOut}
            className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}
