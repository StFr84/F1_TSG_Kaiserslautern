import { describe, it, expect } from 'vitest'
import { formatEventDate, formatEventTime, isUpcoming } from '../format'

describe('formatEventDate', () => {
  it('gibt deutsches Datumsformat zurück', () => {
    expect(formatEventDate('2026-06-10T17:00:00+02:00')).toMatch(/Juni/)
  })
})

describe('formatEventTime', () => {
  it('gibt HH:MM zurück', () => {
    expect(formatEventTime('2026-06-10T17:00:00+02:00')).toMatch(/\d{2}:\d{2}/)
  })
})

describe('isUpcoming', () => {
  it('gibt true zurück für Datum in der Zukunft', () => {
    const future = new Date(Date.now() + 86400000).toISOString()
    expect(isUpcoming(future)).toBe(true)
  })
  it('gibt false zurück für Datum in der Vergangenheit', () => {
    const past = new Date(Date.now() - 86400000).toISOString()
    expect(isUpcoming(past)).toBe(false)
  })
})
