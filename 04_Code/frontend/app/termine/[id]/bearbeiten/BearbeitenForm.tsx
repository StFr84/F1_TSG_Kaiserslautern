'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateEvent } from '../actions'

interface Props {
  event: {
    id: string
    type: string
    title: string
    starts_at: string
    location: string | null
    opponent: string | null
    meetup_at: string | null
    rsvp_deadline: string | null
  }
}

function toLocalDatetime(iso: string | null) {
  if (!iso) return ''
  return new Date(iso).toISOString().slice(0, 16)
}

export default function BearbeitenForm({ event }: Props) {
  const [type, setType] = useState(event.type)
  const router = useRouter()
  const action = updateEvent.bind(null, event.id)

  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Termin bearbeiten</h1>
      <form action={action} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Typ</label>
          <select name="type" value={type} onChange={e => setType(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="training">Training</option>
            <option value="game">Spiel</option>
            <option value="other">Sonstiges</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
          <input name="title" required defaultValue={event.title}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Datum & Uhrzeit</label>
          <input name="starts_at" type="datetime-local" required defaultValue={toLocalDatetime(event.starts_at)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ort</label>
          <input name="location" defaultValue={event.location ?? ''}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        {type === 'game' && <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gegner</label>
            <input name="opponent" defaultValue={event.opponent ?? ''}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Treffpunkt (Uhrzeit)</label>
            <input name="meetup_at" type="datetime-local" defaultValue={toLocalDatetime(event.meetup_at)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">RSVP Deadline</label>
            <input name="rsvp_deadline" type="datetime-local" defaultValue={toLocalDatetime(event.rsvp_deadline)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
        </>}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()}
            className="flex-1 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm">
            Abbrechen
          </button>
          <button type="submit"
            className="flex-1 py-2.5 rounded-lg text-white font-medium text-sm bg-[#9B1C2E]">
            Speichern
          </button>
        </div>
      </form>
    </div>
  )
}
