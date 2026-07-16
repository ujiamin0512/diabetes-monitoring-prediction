import type { Member } from '../lib/types'

interface UserPickerScreenProps {
  members: Member[]
  onSelect: (member: Member) => void
  onAddUser: () => void
}

export function UserPickerScreen({ members, onSelect, onAddUser }: UserPickerScreenProps) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-6 py-10">
      <h1 className="text-center text-4xl font-bold text-[var(--color-text)]">Who's logging today?</h1>

      <div className="flex flex-col gap-4">
        {members.map((member) => (
          <button
            key={member.id}
            type="button"
            onClick={() => onSelect(member)}
            className="min-h-20 rounded-2xl border-2 border-gray-300 bg-[var(--color-surface)] px-6 text-3xl font-bold text-[var(--color-text)] shadow-sm"
          >
            {member.name}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onAddUser}
        className="min-h-20 rounded-2xl bg-[var(--color-primary)] px-6 text-3xl font-bold text-white shadow-sm"
      >
        + Add User
      </button>
    </div>
  )
}
