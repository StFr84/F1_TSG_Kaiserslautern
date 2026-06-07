'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, MessageCircle, User } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/termine', label: 'Termine', icon: Calendar },
  { href: '/nachrichten', label: 'Nachrichten', icon: MessageCircle },
  { href: '/profil', label: 'Profil', icon: User },
]

export default function BottomNav() {
  const pathname = usePathname()
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-50 max-w-md mx-auto"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href === '/dashboard' ? '/dashboard' : href)
        return (
          <Link key={href} href={href} aria-current={active ? 'page' : undefined}
            className="flex-1 flex flex-col items-center pt-2 pb-1 gap-0.5 relative">
            {active && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-[#9B1C2E]" />
            )}
            <Icon size={22} color={active ? '#9B1C2E' : '#9ca3af'} />
            <span className="text-xs font-medium" style={{ color: active ? '#9B1C2E' : '#9ca3af' }}>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
