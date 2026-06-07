import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import LoginPage from '../page'

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ auth: { signInWithPassword: vi.fn() } }),
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}))

describe('LoginPage', () => {
  it('zeigt E-Mail, Passwort und Einloggen-Button', () => {
    render(<LoginPage />)
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/passwort/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /einloggen/i })).toBeInTheDocument()
  })
})
