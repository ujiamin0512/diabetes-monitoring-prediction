import { useEffect, useState } from 'react'
import { ensureAnonSession } from './lib/session'
import { listMembers } from './lib/members'
import { UserPickerScreen } from './screens/UserPickerScreen'
import { AddMemberScreen } from './screens/AddMemberScreen'
import { DailyLoggingScreen } from './screens/DailyLoggingScreen'
import { LoadingState } from './components/LoadingState'
import type { Member } from './lib/types'

type View = 'loading' | 'picker' | 'add-member' | 'daily-logging' | 'error'

function App() {
  const [view, setView] = useState<View>('loading')
  const [ownerId, setOwnerId] = useState<string | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [activeMember, setActiveMember] = useState<Member | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function boot() {
      try {
        const uid = await ensureAnonSession()
        setOwnerId(uid)
        const memberList = await listMembers()
        setMembers(memberList)
        setView('picker')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong starting the app.')
        setView('error')
      }
    }
    boot()
  }, [])

  function handleMemberCreated(member: Member) {
    setMembers((prev) => [...prev, member])
    setActiveMember(member)
    setView('daily-logging')
  }

  function handleMemberUpdated(member: Member) {
    setMembers((prev) => prev.map((m) => (m.id === member.id ? member : m)))
    setActiveMember(member)
  }

  if (view === 'loading') {
    return <LoadingState message="Getting things ready..." />
  }

  if (view === 'error') {
    return (
      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-2xl font-semibold text-[var(--color-danger)]">{error}</p>
      </div>
    )
  }

  if (view === 'picker' || !ownerId) {
    return (
      <UserPickerScreen
        members={members}
        onSelect={(member) => {
          setActiveMember(member)
          setView('daily-logging')
        }}
        onAddUser={() => setView('add-member')}
      />
    )
  }

  if (view === 'add-member') {
    return (
      <AddMemberScreen ownerId={ownerId} onCreated={handleMemberCreated} onCancel={() => setView('picker')} />
    )
  }

  if (view === 'daily-logging' && activeMember) {
    return (
      <DailyLoggingScreen
        member={activeMember}
        onMemberUpdated={handleMemberUpdated}
        onSwitchUser={() => {
          setActiveMember(null)
          setView('picker')
        }}
      />
    )
  }

  return null
}

export default App
