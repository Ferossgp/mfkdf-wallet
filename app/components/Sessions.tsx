import { SettingsStore } from '~/store/SettingsStore'
import { useSnapshot } from 'valtio'

export default function SessionsPage() {
  const { sessions } = useSnapshot(SettingsStore.state)

  if (!sessions.length) {
    return (
      <>
        <p>No sessions</p>
      </>
    )
  }

  return (
    <>
      {sessions.length
        ? sessions.map(session => {
          const { name } = session.peer.metadata
          return (
            <div
              key={session.topic}

            >
              {name}
            </div>
          )
        })
        : null}
    </>
  )
}