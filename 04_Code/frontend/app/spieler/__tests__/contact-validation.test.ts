import { describe, it, expect } from 'vitest'
import { validateContact } from '../validate-contact'

describe('validateContact', () => {
  it('akzeptiert gültige Daten', () => {
    expect(validateContact({
      full_name: 'Sandra Nono',
      email: 'sandra@test.de',
      role: 'Mutter',
    })).toBeNull()
  })
  it('lehnt leeren Namen ab', () => {
    expect(validateContact({ full_name: '', email: 'a@b.de', role: 'Mutter' })).toBeTruthy()
  })
  it('lehnt Leerzeichen-Namen ab', () => {
    expect(validateContact({ full_name: '   ', email: 'a@b.de', role: 'Mutter' })).toBeTruthy()
  })
  it('lehnt leere E-Mail ab', () => {
    expect(validateContact({ full_name: 'Sandra', email: '', role: 'Mutter' })).toBeTruthy()
  })
  it('lehnt ungültige E-Mail ab', () => {
    expect(validateContact({ full_name: 'Sandra', email: 'kein-at', role: 'Mutter' })).toBeTruthy()
  })
  it('lehnt leere Rolle ab', () => {
    expect(validateContact({ full_name: 'Sandra', email: 'a@b.de', role: '' })).toBeTruthy()
  })
})
