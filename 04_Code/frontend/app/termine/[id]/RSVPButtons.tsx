'use client'

import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { upsertRSVP } from './actions'
import type { EventType, RSVPStatus } from '@/lib/types'

interface Props {
  eventId: string
  playerId: string
  eventType: EventType
  currentStatus: RSVPStatus | null
  disabled: boolean
}

export default function RSVPButtons({ eventId, playerId, eventType, currentStatus, disabled }: Props) {
  const [status, setStatus] = useState<RSVPStatus | null>(currentStatus)
  const [loading, setLoading] = useState(false)

  async function handle(newStatus: RSVPStatus) {
    if (disabled || loading) return
    setLoading(true)
    try {
      await upsertRSVP(eventId, playerId, newStatus)
      setStatus(newStatus)
    } finally {
      setLoading(false)
    }
  }

  if (eventType === 'training') {
    return (
      <button onClick={() => handle(status === 'absent' ? 'attending' : 'absent')}
        disabled={disabled || loading}
        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
          status === 'absent' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
        {status === 'absent' ? 'Abgemeldet' : 'Anwesend'}
      </button>
    )
  }

  return (
    <div className="flex gap-2">
      <button onClick={() => handle('attending')} disabled={disabled || loading} aria-label="Zusagen"
        className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${status === 'attending' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
        <Check size={16} />
      </button>
      <button onClick={() => handle('absent')} disabled={disabled || loading} aria-label="Absagen"
        className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${status === 'absent' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
        <X size={16} />
      </button>
    </div>
  )
}
