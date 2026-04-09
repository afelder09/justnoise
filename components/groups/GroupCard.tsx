import Link from 'next/link'
import type { Group } from '@/types'

interface GroupCardProps {
  group: Group
  userId: string
}

export default function GroupCard({ group, userId }: GroupCardProps) {
  const isCreator = group.creator_id === userId

  return (
    <Link
      href={`/groups/${group.id}`}
      className="block rounded-xl border border-zinc-800 bg-zinc-900 p-5 hover:border-zinc-600 transition-colors"
    >
      <div className="flex items-start justify-between mb-2">
        <h2 className="font-semibold text-zinc-100">{group.name}</h2>
        {isCreator && (
          <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 rounded px-1.5 py-0.5">
            Creator
          </span>
        )}
      </div>
      {group.description && (
        <p className="text-sm text-zinc-400 line-clamp-2">{group.description}</p>
      )}
    </Link>
  )
}
