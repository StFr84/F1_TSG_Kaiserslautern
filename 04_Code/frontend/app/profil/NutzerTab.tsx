'use client'

import { useTransition, useState } from 'react'
import { changeRole, sendPasswordReset } from './actions'

type NutzerUser = {
  id: string
  email: string
  full_name: string
  role: string
}

export default function NutzerTab({ users, isLead }: { users: NutzerUser[]; isLead: boolean }) {
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ id: string; message: string; isError: boolean } | null>(null)

  function handleRoleChange(userId: string, newRole: string) {
    startTransition(async () => {
      await changeRole(userId, newRole)
    })
  }

  function handlePasswordReset(email: string, userId: string) {
    setFeedback(null)
    startTransition(async () => {
      const result = await sendPasswordReset(email)
      setFeedback({
        id: userId,
        message: result.error ?? 'Passwort-Reset-E-Mail gesendet',
        isError: !!result.error,
      })
    })
  }

  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
        Nutzer ({users.length})
      </p>
      <ul className="space-y-2">
        {users.map(u => (
          <li key={u.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{u.full_name}</p>
                <p className="text-xs text-gray-500 truncate">{u.email}</p>
                <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-[#9B1C2E]/10 text-[#9B1C2E]">
                  {u.role === 'trainer' ? 'Trainer' : 'Elternteil'}
                </span>
              </div>
              {isLead && (
                <div className="flex flex-col gap-2 items-end flex-shrink-0">
                  <select
                    value={u.role}
                    onChange={e => handleRoleChange(u.id, e.target.value)}
                    disabled={isPending}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white disabled:opacity-50"
                  >
                    <option value="parent">Elternteil</option>
                    <option value="trainer">Trainer</option>
                  </select>
                  <button
                    onClick={() => handlePasswordReset(u.email, u.id)}
                    disabled={isPending}
                    className="text-xs text-[#9B1C2E] underline disabled:opacity-50"
                  >
                    Passwort-Reset senden
                  </button>
                  {feedback?.id === u.id && (
                    <p className={`text-xs ${feedback.isError ? 'text-red-600' : 'text-green-600'}`}>
                      {feedback.message}
                    </p>
                  )}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
