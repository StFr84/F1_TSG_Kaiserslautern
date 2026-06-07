'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, MessageCircle, User } from 'lucide-react'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/termine', label: 'Termine', icon: Calendar },
  { href: '/nachrichten', label: 'Nachrichten', icon: MessageCircle },
  { href: '/profil', label: 'Profil', icon: User },
]

export default function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-50 max-w-md mx-auto">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link key={href} href={href} aria-current={active ? 'page' : undefined}
            className="flex-1 flex flex-col items-center py-2 gap-0.5">
            <Icon size={22} color={active ? '#9B1C2E' : '#9ca3af'} />
            <span className="text-xs" style={{ color: active ? '#9B1C2E' : '#9ca3af' }}>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
