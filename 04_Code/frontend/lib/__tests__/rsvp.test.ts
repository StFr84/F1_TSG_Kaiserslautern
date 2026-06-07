import { describe, it, expect } from 'vitest'
import { getDefaultRSVP, isDeadlinePassed } from '../rsvp'

describe('getDefaultRSVP', () => {
  it('gibt attending zurück für Training (Opt-out)', () => {
    expect(getDefaultRSVP('training')).toBe('attending')
  })
  it('gibt null zurück für Spiel (explizite Bestätigung)', () => {
    expect(getDefaultRSVP('game')).toBeNull()
  })
  it('gibt null zurück für other', () => {
    expect(getDefaultRSVP('other')).toBeNull()
  })
})

describe('isDeadlinePassed', () => {
  it('gibt false zurück wenn keine Deadline', () => {
    expect(isDeadlinePassed(null)).toBe(false)
  })
  it('gibt true zurück wenn Deadline in der Vergangenheit', () => {
    expect(isDeadlinePassed(new Date(Date.now() - 1000).toISOString())).toBe(true)
  })
  it('gibt false zurück wenn Deadline in der Zukunft', () => {
    expect(isDeadlinePassed(new Date(Date.now() + 86400000).toISOString())).toBe(false)
  })
})
