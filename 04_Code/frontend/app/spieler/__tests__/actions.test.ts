import { describe, it, expect } from 'vitest'
import { validatePlayer } from '../actions'

describe('validatePlayer', () => {
  it('akzeptiert gültige Daten', () => {
    expect(validatePlayer({ first_name: 'Luca', birth_year: 2017 })).toBe(true)
  })
  it('lehnt leeren Namen ab', () => {
    expect(validatePlayer({ first_name: '', birth_year: 2017 })).toBe(false)
  })
  it('lehnt zukünftiges Geburtsjahr ab', () => {
    expect(validatePlayer({ first_name: 'Luca', birth_year: 2099 })).toBe(false)
  })
  it('lehnt Geburtsjahr vor 1990 ab', () => {
    expect(validatePlayer({ first_name: 'Luca', birth_year: 1989 })).toBe(false)
  })
})
