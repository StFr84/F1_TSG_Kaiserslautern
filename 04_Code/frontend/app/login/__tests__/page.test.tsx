import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import LoginPage from '../page'

const mockPush = vi.fn()
const mockRefresh = vi.fn()
const mockSignIn = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ auth: { signInWithPassword: mockSignIn } }),
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}))

describe('LoginPage', () => {
  it('zeigt E-Mail, Passwort und Einloggen-Button', () => {
    render(<LoginPage />)
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/passwort/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /einloggen/i })).toBeInTheDocument()
  })

  it('ruft signInWithPassword mit eingegebenen Daten auf und leitet weiter', async () => {
    mockSignIn.mockResolvedValue({ error: null })
    render(<LoginPage />)
    await userEvent.type(screen.getByLabelText(/e-mail/i), 'trainer@tsg.de')
    await userEvent.type(screen.getByLabelText(/passwort/i), 'geheim123')
    await userEvent.click(screen.getByRole('button', { name: /einloggen/i }))
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({ email: 'trainer@tsg.de', password: 'geheim123' })
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('zeigt Fehlermeldung bei falschem Passwort', async () => {
    mockSignIn.mockResolvedValue({ error: { message: 'Invalid credentials' } })
    render(<LoginPage />)
    await userEvent.type(screen.getByLabelText(/e-mail/i), 'trainer@tsg.de')
    await userEvent.type(screen.getByLabelText(/passwort/i), 'falsch')
    await userEvent.click(screen.getByRole('button', { name: /einloggen/i }))
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('E-Mail oder Passwort falsch.')
    })
  })
})
