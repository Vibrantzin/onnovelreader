// src/components/Navbar.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const ADMIN_USER_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID || ''

type Notification = {
  id: string
  type: string
  title: string
  message: string
  novel_id: string | null
  is_read: boolean
  created_at: string
}

const NOTIF_ICONS: Record<string, string> = {
  chosen_pick:        '✦',
  follower_milestone: '👥',
  review_milestone:   '⭐',
  view_milestone:     '📈',
  admin_warning:      '⚠️',
  copyright_notice:   '⚠️',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.is_read).length

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session)
      setIsAdmin(session?.user?.id === ADMIN_USER_ID)
      if (session) fetchNotifications(session.user.id)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsLoggedIn(!!session)
      setIsAdmin(session?.user?.id === ADMIN_USER_ID)
      if (session) fetchNotifications(session.user.id)
      else setNotifications([])
    })

    return () => subscription.unsubscribe()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Real-time: subscribe to new notifications for this user
  useEffect(() => {
    if (!isLoggedIn) return
    let channel: any

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      channel = supabase
        .channel('notifications')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${session.user.id}`,
        }, (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev])
        })
        .subscribe()
    })

    return () => { if (channel) supabase.removeChannel(channel) }
  }, [isLoggedIn])

  const fetchNotifications = async (userId: string) => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)
    if (data) setNotifications(data)
  }

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.is_read).map((n) => n.id)
    if (unread.length === 0) return
    await supabase.from('notifications').update({ is_read: true }).in('id', unread)
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  const markOneRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n))
  }

  const clearAll = async () => {
    const ids = notifications.map((n) => n.id)
    if (ids.length === 0) return
    await supabase.from('notifications').delete().in('id', ids)
    setNotifications([])
  }

  const clearOne = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    await supabase.from('notifications').delete().eq('id', id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const handleNotifClick = (notif: Notification) => {
    markOneRead(notif.id)
    setShowDropdown(false)
    if (notif.novel_id) router.push(`/novel/${notif.novel_id}`)
  }

  const isActive = (path: string) =>
    pathname === path ? 'text-zinc-900 border-b border-zinc-900' : 'text-zinc-500 hover:text-zinc-900'

  return (
    <>
      <header className="bg-white border-b border-zinc-200 px-4 md:px-8 py-4 md:py-5 flex justify-between items-center sticky top-0 z-30">

        {/* Left: logo + desktop nav */}
        <div className="flex items-center gap-6">
          <Link href="/" className="text-base md:text-lg font-bold tracking-tighter text-zinc-900">
            NOVEL READER
          </Link>

          {/* Desktop nav — left-aligned, hidden on mobile */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
            <Link href="/browse" className={`transition-colors ${isActive('/browse')}`}>Browse</Link>
            {isLoggedIn && (
              <Link href="/dashboard" className={`transition-colors ${isActive('/dashboard')}`}>Dashboard</Link>
            )}
            {isLoggedIn && (
              <Link href="/settings" className={`transition-colors ${isActive('/settings')}`}>Settings</Link>
            )}
            {isAdmin && (
              <div className="relative group">
                <button className="text-sm font-medium text-amber-600 hover:text-amber-800 transition-colors">
                  Admin ▾
                </button>
                <div className="absolute top-full left-0 mt-1 w-44 bg-white border border-zinc-200 rounded-lg shadow-lg overflow-hidden opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-50">
                  <Link href="/admin/featured" className="block px-4 py-2.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">✦ Chosen Pick</Link>
                  <Link href="/admin/notifications" className="block px-4 py-2.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">⚠️ Send Notification</Link>
                  <Link href="/admin/takedown" className="block px-4 py-2.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">🚫 Content Moderation</Link>
                  <Link href="/admin/accounts" className="block px-4 py-2.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 transition-colors">👤 Account Moderation</Link>
                </div>
              </div>
            )}
          </nav>
        </div>

        {/* Right: bell + auth + hamburger */}
        <div className="flex items-center gap-2 md:gap-4">

          {/* Bell icon */}
          {isLoggedIn && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => { setShowDropdown(!showDropdown); if (!showDropdown) markAllRead() }}
                className="relative p-2 text-zinc-500 hover:text-zinc-900 transition-colors"
                aria-label="Notifications"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Dropdown */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-72 md:w-80 bg-white border border-zinc-200 rounded-xl shadow-lg overflow-hidden z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
                    <span className="text-sm font-semibold text-zinc-800">Notifications</span>
                    <div className="flex items-center gap-3">
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors">
                          Mark all read
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button onClick={clearAll} className="text-xs text-red-400 hover:text-red-600 transition-colors">
                          Clear all
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <p className="text-zinc-300 text-2xl mb-2">🔔</p>
                        <p className="text-xs text-zinc-400">No notifications yet</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`relative w-full text-left border-b border-zinc-50 flex gap-3 items-start group/notif ${
                            !notif.is_read ? 'bg-blue-50/40' : ''
                          }`}
                        >
                          <button
                            onClick={() => handleNotifClick(notif)}
                            className="flex-1 flex gap-3 items-start px-4 py-3 hover:bg-zinc-50 transition-colors text-left"
                          >
                            <span className="text-base mt-0.5 shrink-0">{NOTIF_ICONS[notif.type] || '🔔'}</span>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-semibold truncate ${!notif.is_read ? 'text-zinc-900' : 'text-zinc-600'}`}>
                                {notif.title}
                              </p>
                              <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">{notif.message}</p>
                              <p className="text-[10px] text-zinc-300 mt-1">{timeAgo(notif.created_at)}</p>
                            </div>
                            {!notif.is_read && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                            )}
                          </button>
                          {/* Per-notification clear button */}
                          <button
                            onClick={(e) => clearOne(e, notif.id)}
                            className="absolute right-2 top-2 w-5 h-5 flex items-center justify-center rounded-full text-zinc-300 hover:text-zinc-600 hover:bg-zinc-100 transition-colors opacity-0 group-hover/notif:opacity-100 text-xs"
                            aria-label="Dismiss"
                          >✕</button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Auth button — desktop only */}
          <div className="hidden md:block">
            {isLoggedIn ? (
              <button
                onClick={async () => { await supabase.auth.signOut(); router.push('/') }}
                className="text-sm font-medium bg-zinc-100 px-4 py-2 rounded hover:bg-zinc-200 transition-colors"
              >
                Sign Out
              </button>
            ) : (
              <Link href="/login" className="text-sm font-medium bg-black text-white px-4 py-2 rounded-full hover:bg-zinc-800 transition-colors">
                Sign In
              </Link>
            )}
          </div>

          {/* Hamburger — mobile only */}
          <button
            className="md:hidden p-2 text-zinc-600 hover:text-zinc-900"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Menu"
          >
            {showMobileMenu ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 top-[57px] z-20 bg-white flex flex-col overflow-y-auto">
          <nav className="flex flex-col px-6 py-4 flex-1">
            <Link href="/browse" onClick={() => setShowMobileMenu(false)} className="py-4 text-base font-medium text-zinc-800 border-b border-zinc-100">Browse</Link>
            {isLoggedIn && <Link href="/dashboard" onClick={() => setShowMobileMenu(false)} className="py-4 text-base font-medium text-zinc-800 border-b border-zinc-100">Dashboard</Link>}
            {isLoggedIn && <Link href="/settings" onClick={() => setShowMobileMenu(false)} className="py-4 text-base font-medium text-zinc-800 border-b border-zinc-100">Settings</Link>}
            {isAdmin && (
              <>
                <p className="pt-5 pb-2 text-xs font-semibold text-amber-600 uppercase tracking-wider">Admin</p>
                <Link href="/admin/featured" onClick={() => setShowMobileMenu(false)} className="py-4 text-base font-medium text-zinc-800 border-b border-zinc-100">✦ Chosen Pick</Link>
                <Link href="/admin/notifications" onClick={() => setShowMobileMenu(false)} className="py-4 text-base font-medium text-zinc-800 border-b border-zinc-100">⚠️ Send Notification</Link>
                <Link href="/admin/takedown" onClick={() => setShowMobileMenu(false)} className="py-4 text-base font-medium text-zinc-800 border-b border-zinc-100">🚫 Content Moderation</Link>
                <Link href="/admin/accounts" onClick={() => setShowMobileMenu(false)} className="py-4 text-base font-medium text-zinc-800 border-b border-zinc-100">👤 Account Moderation</Link>
              </>
            )}
          </nav>
          <div className="px-6 py-5 border-t border-zinc-100">
            {isLoggedIn ? (
              <button
                onClick={async () => { await supabase.auth.signOut(); router.push('/'); setShowMobileMenu(false) }}
                className="w-full text-sm font-medium bg-zinc-100 px-4 py-3 rounded hover:bg-zinc-200 transition-colors"
              >
                Sign Out
              </button>
            ) : (
              <Link href="/login" onClick={() => setShowMobileMenu(false)} className="block w-full text-center text-sm font-medium bg-black text-white px-4 py-3 rounded-full hover:bg-zinc-800 transition-colors">
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  )
}