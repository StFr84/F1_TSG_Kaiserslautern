'use client'

import { useState } from 'react'
import { createEvent } from '../actions'

export default function NeuerTerminPage() {
  const [type, setType] = useState('training')

  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Neuer Termin</h1>
      <form action={createEvent} className="space-y-4">
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
          <input name="title" required defaultValue={type === 'training' ? 'Training' : ''}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Datum & Uhrzeit</label>
          <input name="starts_at" type="datetime-local" required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ort</label>
          <input name="location" placeholder="z.B. Sportplatz Betzenberg"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        {type === 'game' && <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gegner</label>
            <input name="opponent" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Treffpunkt (Uhrzeit)</label>
            <input name="meetup_at" type="datetime-local" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">RSVP Deadline</label>
            <input name="rsvp_deadline" type="datetime-local" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
        </>}
        <button type="submit" className="w-full py-2.5 rounded-lg text-white font-medium bg-[#9B1C2E]">
          Termin speichern
        </button>
      </form>
    </div>
  )
}
