'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { inviteParent } from './actions'

const initialState = { error: '', success: false }

export default function EinladenForm({ isLead }: { isLead: boolean }) {
  const [state, formAction, pending] = useActionState(inviteParent, initialState)
  const [role, setRole] = useState('parent')

  if (state.success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
        <p className="text-green-800 font-medium text-sm">Einladung gesendet!</p>
        <p className="text-green-700 text-xs mt-1">Der Nutzer erhält in Kürze eine E-Mail.</p>
        <button onClick={() => window.location.reload()}
          className="mt-4 text-sm text-[#9B1C2E] underline">
          Weitere Einladung senden
        </button>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input name="full_name" required placeholder="Vorname Nachname"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
        <input name="email" type="email" required placeholder="nutzer@beispiel.de"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>
      {isLead ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rolle</label>
          <select name="role" value={role} onChange={e => setRole(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
            <option value="parent">Elternteil</option>
            <option value="trainer">Trainer</option>
          </select>
        </div>
      ) : (
        <input type="hidden" name="role" value="parent" />
      )}
      {state.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>
      )}
      <button type="submit" disabled={pending}
        className="w-full py-2.5 rounded-lg text-white font-medium bg-[#9B1C2E] disabled:opacity-50">
        {pending ? 'Wird gesendet…' : 'Einladung senden'}
      </button>
    </form>
  )
}
