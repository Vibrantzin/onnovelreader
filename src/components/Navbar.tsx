// src/components/Navbar.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const isActive = (path: string) =>
    pathname === path ? 'text-zinc-900 border-b border-zinc-900' : 'text-zinc-500 hover:text-zinc-900'

  return (
    <header className="bg-white border-b border-zinc-200 px-8 py-5 flex justify-between items-center sticky top-0 z-30">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-lg font-bold tracking-tighter text-zinc-900">
          NOVEL READER
        </Link>
        <nav className="flex items-center gap-5 text-sm font-medium">
          <Link href="/browse" className={`transition-colors ${isActive('/browse')}`}>Browse</Link>
          {isLoggedIn && (
            <Link href="/dashboard" className={`transition-colors ${isActive('/dashboard')}`}>Dashboard</Link>
          )}
          {isLoggedIn && (
            <Link href="/settings" className={`transition-colors ${isActive('/settings')}`}>Settings</Link>
          )}
        </nav>
      </div>

      <div>
        {isLoggedIn ? (
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              router.push('/')
            }}
            className="text-sm font-medium bg-zinc-100 px-4 py-2 rounded hover:bg-zinc-200 transition-colors"
          >
            Sign Out
          </button>
        ) : (
          <Link
            href="/login"
            className="text-sm font-medium bg-black text-white px-4 py-2 rounded-full hover:bg-zinc-800 transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  )
}