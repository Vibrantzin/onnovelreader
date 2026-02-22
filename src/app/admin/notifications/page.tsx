// src/app/admin/notifications/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

const ADMIN_USER_ID = '489099a5-b55a-4a0c-ab5c-ef788a43c764'

type NotifType = 'admin_warning' | 'copyright_notice' | 'chosen_pick'

export default function AdminNotifications() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [novels, setNovels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [notAuthorized, setNotAuthorized] = useState(false)

  // Form
  const [targetType, setTargetType] = useState<'user' | 'author'>('user')
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedNovel, setSelectedNovel] = useState('')
  const [notifType, setNotifType] = useState<NotifType>('admin_warning')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState('')
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    checkAndFetch()
  }, [])

  const checkAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || session.user.id !== ADMIN_USER_ID) {
      setNotAuthorized(true)
      setLoading(false)
      return
    }

    const [{ data: users }, { data: novels }] = await Promise.all([
      supabase.from('users').select('id, username').order('username'),
      supabase.from('novels').select('id, title, author_id').order('title'),
    ])

    setUsers(users || [])

    // Enrich novels with author usernames separately
    const novelsWithAuthors = await Promise.all(
      (novels || []).map(async (novel: any) => {
        const user = (users || []).find((u: any) => u.id === novel.author_id)
        return { ...novel, author_username: user?.username || 'Unknown' }
      })
    )
    setNovels(novelsWithAuthors)
    setLoading(false)
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !message.trim()) { setIsError(true); setResult('Please fill in title and message.'); return }

    setSending(true)
    setResult('')

    let targetUserId = selectedUser

    // If targeting by novel, get the author
    if (targetType === 'author' && selectedNovel) {
      const novel = novels.find((n) => n.id === selectedNovel)
      if (novel) targetUserId = novel.author_id
    }

    if (!targetUserId) { setIsError(true); setResult('Please select a target.'); setSending(false); return }

    const { error } = await supabase.rpc('send_notification', {
      p_user_id: targetUserId,
      p_type: notifType,
      p_title: title,
      p_message: message,
      p_novel_id: selectedNovel || null,
    })

    if (error) {
      setIsError(true)
      setResult('Failed: ' + error.message)
    } else {
      // Fire email for critical notification types
      if (notifType === 'admin_warning' || notifType === 'copyright_notice') {
        try {
          const { error: emailError } = await supabase.functions.invoke('notify-email', {
            body: { user_id: targetUserId, title, message },
          })
          if (emailError) console.error('Email send error:', emailError)
          setIsError(false)
          setResult('Notification sent and email delivered.')
        } catch (e) {
          console.error('Email function unreachable:', e)
          // Notification was still saved in-app — only email failed
          setIsError(false)
          setResult('Notification sent (email delivery failed — check Edge Function deployment).')
        }
      } else {
        setIsError(false)
        setResult('Notification sent successfully.')
      }
      setTitle('')
      setMessage('')
      setSelectedUser('')
      setSelectedNovel('')
    }
    setSending(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <p className="text-zinc-400 text-sm">Loading...</p>
    </div>
  )

  if (notAuthorized) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-zinc-900 font-sans gap-4">
      <h1 className="text-6xl font-bold text-zinc-200">404</h1>
      <p className="text-zinc-500 text-sm">This page could not be found.</p>
      <a href="/" className="text-sm text-zinc-900 underline">Go home</a>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 pb-20">
      <Navbar />
      <div className="bg-white border-b border-zinc-100 px-8 py-3 flex items-center gap-3 text-sm">
        <Link href="/admin/featured" className="text-zinc-400 hover:text-black transition-colors">← Featured</Link>
        <span className="text-zinc-200">|</span>
        <span className="font-medium text-zinc-700">⚠️ Admin — Send Notification</span>
      </div>

      <main className="max-w-2xl mx-auto mt-10 px-8">
        <h1 className="text-2xl font-semibold mb-2">Send Notification</h1>
        <p className="text-sm text-zinc-400 mb-8">Send warnings, copyright notices, or announcements to users. Critical types will also trigger an email.</p>

        <form onSubmit={handleSend} className="bg-white border border-zinc-200 rounded-xl p-6 flex flex-col gap-5">

          {/* Target type */}
          <div>
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-2">Send to</label>
            <div className="flex gap-2">
              {(['user', 'author'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setTargetType(t); setSelectedUser(''); setSelectedNovel('') }}
                  className={`text-xs px-4 py-2 rounded-full border font-medium transition-colors ${
                    targetType === t ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  {t === 'user' ? 'Specific User' : 'Novel Author'}
                </button>
              ))}
            </div>
          </div>

          {/* User or Novel selector */}
          {targetType === 'user' ? (
            <div>
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-2">User</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-zinc-500"
              >
                <option value="">— Select a user —</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.username}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-2">Novel</label>
              <select
                value={selectedNovel}
                onChange={(e) => setSelectedNovel(e.target.value)}
                className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-zinc-500"
              >
                <option value="">— Select a novel —</option>
                {novels.map((n) => (
                  <option key={n.id} value={n.id}>{n.title} — by {n.author_username}</option>
                ))}
              </select>
            </div>
          )}

          {/* Notification type */}
          <div>
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-2">Type</label>
            <div className="flex flex-wrap gap-2">
              {([
                { value: 'admin_warning', label: '⚠️ Warning' },
                { value: 'copyright_notice', label: '⚠️ Copyright Notice' },
                { value: 'chosen_pick', label: '✦ Chosen Pick' },
              ] as { value: NotifType; label: string }[]).map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setNotifType(opt.value)}
                  className={`text-xs px-4 py-2 rounded-full border font-medium transition-colors ${
                    notifType === opt.value ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Copyright Notice — Action Required"
              className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-zinc-500"
            />
          </div>

          {/* Message */}
          <div>
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Write the full notification message here..."
              className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-zinc-500 resize-none"
            />
            {(notifType === 'admin_warning' || notifType === 'copyright_notice') && (
              <p className="text-xs text-amber-500 mt-1.5">⚠️ This type will also send an email to the user.</p>
            )}
          </div>

          {result && (
            <p className={`text-xs py-2 px-3 rounded ${isError ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
              {result}
            </p>
          )}

          <button
            type="submit"
            disabled={sending}
            className="bg-zinc-900 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-zinc-700 disabled:opacity-50 transition-colors w-fit"
          >
            {sending ? 'Sending...' : 'Send Notification'}
          </button>
        </form>
      </main>
    </div>
  )
}