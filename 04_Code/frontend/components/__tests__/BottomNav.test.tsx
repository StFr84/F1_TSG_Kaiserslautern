import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import BottomNav from '../BottomNav'

vi.mock('next/navigation', () => ({ usePathname: () => '/dashboard' }))

describe('BottomNav', () => {
  it('zeigt alle 4 Navigationspunkte', () => {
    render(<BottomNav />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Termine')).toBeInTheDocument()
    expect(screen.getByText('Nachrichten')).toBeInTheDocument()
    expect(screen.getByText('Profil')).toBeInTheDocument()
  })
  it('markiert aktive Route mit aria-current="page"', () => {
    render(<BottomNav />)
    expect(screen.getByText('Home').closest('a')).toHaveAttribute('aria-current', 'page')
  })
})
