'use client'

import { Trash2 } from 'lucide-react'
import { deleteEvent } from './actions'

export default function DeleteEventButton({ eventId }: { eventId: string }) {
  async function handleDelete() {
    if (!confirm('Termin wirklich löschen?')) return
    await deleteEvent(eventId)
  }

  return (
    <button type="button" onClick={handleDelete} className="p-2 rounded-lg bg-red-50 text-red-500">
      <Trash2 size={16} />
    </button>
  )
}
