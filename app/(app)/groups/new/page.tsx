import CreateGroupForm from '@/components/groups/CreateGroupForm'

export default function NewGroupPage() {
  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-zinc-100 mb-6">Create a Studio</h1>
      <CreateGroupForm />
    </div>
  )
}
