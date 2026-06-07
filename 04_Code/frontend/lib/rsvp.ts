import type { EventType, RSVPStatus } from './types'

export function getDefaultRSVP(eventType: EventType): RSVPStatus | null {
  return eventType === 'training' ? 'attending' : null
}

export function isDeadlinePassed(deadline: string | null): boolean {
  if (!deadline) return false
  return new Date(deadline) < new Date()
}
