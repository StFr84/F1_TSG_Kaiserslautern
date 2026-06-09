import { describe, it, expect } from 'vitest'
import { validatePlayer } from '../validate'

describe('validatePlayer', () => {
  it('akzeptiert gültigen Namen', () => {
    expect(validatePlayer({ first_name: 'Luca' })).toBe(true)
  })
  it('lehnt leeren Namen ab', () => {
    expect(validatePlayer({ first_name: '' })).toBe(false)
  })
  it('lehnt Leerzeichen-Namen ab', () => {
    expect(validatePlayer({ first_name: '   ' })).toBe(false)
  })
})
