// src/app/admin/accounts/page.tsx
'use client'


export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

const ADMIN_USER_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID || ''

const STATUS_CONFIG = {
  active:           { label: 'Active',           color: 'bg-green-100 text-green-700',  icon: '✓' },
  warned:           { label: 'Warned',            color: 'bg-yellow-100 text-yellow-700', icon: '⚠️' },
  posting_banned:   { label: 'Posting Banned',    color: 'bg-orange-100 text-orange-700', icon: '🚫' },
  suspended:        { label: 'Suspended',         color: 'bg-red-100 text-red-700',      icon: '⏸' },
  permanently_banned: { label: 'Permanently Banned', color: 'bg-zinc-900 text-white',   icon: '☠️' },
}

const ACTIONS = [
  { value: 'active',             label: '✓ Restore to Active',       desc: 'Remove all restrictions' },
  { value: 'warned',             label: '⚠️ Issue Warning',           desc: 'Formal warning, no restrictions' },
  { value: 'posting_banned',     label: '🚫 Ban from Posting',        desc: 'Cannot publish or edit novels' },
  { value: 'suspended',          label: '⏸ Suspend Account',         desc: 'Cannot log in (temporary)' },
  { value: 'permanently_banned', label: '☠️ Permanently Ban',         desc: 'Account permanently disabled' },
]

export default function AdminAccounts() {

  useEffect(() => { document.title = 'Admin — Account Moderation | Novel Reader' }, [])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [notAuthorized, setNotAuthorized] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('all')
  const [selected, setSelected] = useState<any | null>(null)
  const [action, setAction] = useState('warned')
  const [reason, setReason] = useState('')
  const [duration, setDuration] = useState('')
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState('')
  const [isError, setIsError] = useState(false)
  const [log, setLog] = useState<any[]>([])

  useEffect(() => { checkAndFetch() }, [])

  const checkAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || session.user.id !== ADMIN_USER_ID) {
      setNotAuthorized(true)
      setLoading(false)
      return
    }

    const [{ data: usersData }, { data: logData }] = await Promise.all([
      supabase.from('users')
        .select('id, username, account_status, status_reason, status_expires_at, status_updated_at, date_of_birth')
        .order('username'),
      supabase.from('moderation_log')
        .select('*, users!target_user_id(username)')
        .order('created_at', { ascending: false })
        .limit(50),
    ])

    setUsers(usersData || [])
    setLog(logData || [])
    setLoading(false)
  }

  const handleAction = async () => {
    if (!selected) return
    if (!reason.trim()) { setIsError(true); setResult('Please provide a reason.'); return }
    if (selected.id === ADMIN_USER_ID) { setIsError(true); setResult('You cannot moderate yourself.'); return }

    setProcessing(true)
    setResult('')

    let expiresAt: string | null = null
    if (duration && action === 'suspended') {
      const days = parseInt(duration)
      if (!isNaN(days) && days > 0) {
        const exp = new Date()
        exp.setDate(exp.getDate() + days)
        expiresAt = exp.toISOString()
      }
    }

    const { data: { session } } = await supabase.auth.getSession()

    const { error } = await supabase.rpc('admin_moderate_user', {
      p_admin_id: session!.user.id,
      p_target_user_id: selected.id,
      p_action: action,
      p_reason: reason,
      p_expires_at: expiresAt,
    })

    if (error) {
      setIsError(true)
      setResult('Error: ' + error.message)
    } else {
      // Notify the user
      const actionConfig = ACTIONS.find(a => a.value === action)
      await supabase.rpc('send_notification', {
        p_user_id: selected.id,
        p_type: 'admin_warning',
        p_title: `Account Action: ${actionConfig?.label}`,
        p_message: action === 'active'
          ? `Your account restrictions have been lifted. You can now use Novel Reader normally.`
          : `Your account has received the following action: ${actionConfig?.label}. Reason: ${reason}${expiresAt ? `. This expires on ${new Date(expiresAt).toLocaleDateString()}.` : ''}. If you believe this is a mistake, contact support@novelreader.tech.`,
        p_novel_id: null,
      })

      setIsError(false)
      setResult(`Action applied: ${actionConfig?.label} for ${selected.username}.`)
      setSelected(null)
      setReason('')
      setDuration('')
      await checkAndFetch()
    }

    setProcessing(false)
  }

  const filtered = users.filter((u) => {
    const matchSearch = u.username.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' ? true : u.account_status === filter
    return matchSearch && matchFilter
  })

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <p className="text-zinc-400 text-sm">Loading...</p>
    </div>
  )

  if (notAuthorized) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
      <h1 className="text-6xl font-bold text-zinc-200">404</h1>
      <p className="text-zinc-500 text-sm">This page could not be found.</p>
      <a href="/" className="text-sm text-zinc-900 underline">Go home</a>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 pb-20">
      <Navbar />
      <div className="bg-white border-b border-zinc-100 px-8 py-3 flex items-center gap-3 text-sm">
        <Link href="/admin/featured" className="text-zinc-400 hover:text-black transition-colors">← Admin</Link>
        <span className="text-zinc-200">|</span>
        <span className="font-medium text-zinc-700">👤 Account Moderation</span>
        <span className="ml-auto text-xs text-zinc-400">{users.length} total users</span>
      </div>

      <main className="max-w-6xl mx-auto mt-10 px-8 flex gap-8">

        {/* Left: User list */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-semibold mb-2">Account Moderation</h1>
          <p className="text-sm text-zinc-400 mb-6">Select a user to apply a moderation action.</p>

          <div className="flex gap-2 flex-wrap mb-4">
            {['all', 'active', 'warned', 'posting_banned', 'suspended', 'permanently_banned'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                  filter === f ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400'
                }`}
              >
                {f === 'all' ? `All (${users.length})` : STATUS_CONFIG[f as keyof typeof STATUS_CONFIG]?.label}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full mb-4 px-4 py-2.5 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-zinc-500"
          />

          <div className="flex flex-col gap-2">
            {filtered.map((user) => {
              const statusConf = STATUS_CONFIG[user.account_status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.active
              const isSelected = selected?.id === user.id
              return (
                <button
                  key={user.id}
                  onClick={() => { setSelected(isSelected ? null : user); setResult(''); setAction('warned') }}
                  className={`text-left border rounded-xl px-4 py-3 transition-colors ${
                    isSelected ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 bg-white hover:border-zinc-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium text-sm text-zinc-900">{user.username}</span>
                      {user.id === ADMIN_USER_ID && (
                        <span className="ml-2 text-xs text-amber-600 font-medium">(you)</span>
                      )}
                      {user.status_reason && user.account_status !== 'active' && (
                        <p className="text-xs text-zinc-400 mt-0.5 truncate max-w-xs">{user.status_reason}</p>
                      )}
                      {user.status_expires_at && (
                        <p className="text-xs text-zinc-300 mt-0.5">
                          Expires: {new Date(user.status_expires_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${statusConf.color}`}>
                      {statusConf.icon} {statusConf.label}
                    </span>
                  </div>
                </button>
              )
            })}
            {filtered.length === 0 && (
              <p className="text-zinc-400 text-sm text-center py-8">No users found.</p>
            )}
          </div>
        </div>

        {/* Right: Action panel */}
        <div className="w-80 shrink-0">
          {selected ? (
            <div className="bg-white border border-zinc-200 rounded-xl p-6 sticky top-24">
              <h2 className="font-semibold text-zinc-900 mb-1">Moderating: <span className="text-zinc-600">{selected.username}</span></h2>
              <p className="text-xs text-zinc-400 mb-5">
                Current status: <span className="font-medium">{STATUS_CONFIG[selected.account_status as keyof typeof STATUS_CONFIG]?.label || 'Active'}</span>
              </p>

              <div className="flex flex-col gap-2 mb-5">
                {ACTIONS.map((a) => (
                  <button
                    key={a.value}
                    onClick={() => setAction(a.value)}
                    className={`text-left px-3 py-2.5 rounded-lg border text-xs transition-colors ${
                      action === a.value ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 hover:border-zinc-400'
                    }`}
                  >
                    <div className="font-medium">{a.label}</div>
                    <div className={`text-[11px] mt-0.5 ${action === a.value ? 'text-zinc-400' : 'text-zinc-400'}`}>{a.desc}</div>
                  </button>
                ))}
              </div>

              {action === 'suspended' && (
                <div className="mb-4">
                  <label className="text-xs font-medium text-zinc-600 block mb-1">Duration (days, leave blank for indefinite)</label>
                  <input
                    type="number"
                    placeholder="e.g. 7"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    min="1"
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-xs focus:outline-none focus:border-zinc-500"
                  />
                </div>
              )}

              <div className="mb-4">
                <label className="text-xs font-medium text-zinc-600 block mb-1">Reason (required)</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="Describe why this action is being taken..."
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-xs focus:outline-none focus:border-zinc-500 resize-none"
                />
              </div>

              {result && (
                <p className={`text-xs mb-3 py-2 px-3 rounded-lg ${isError ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                  {result}
                </p>
              )}

              <button
                onClick={handleAction}
                disabled={processing}
                className={`w-full py-2.5 rounded-full text-sm font-semibold disabled:opacity-50 transition-colors ${
                  action === 'permanently_banned'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : action === 'active'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-zinc-900 text-white hover:bg-zinc-700'
                }`}
              >
                {processing ? 'Applying...' : 'Apply Action'}
              </button>
              <button
                onClick={() => { setSelected(null); setResult('') }}
                className="w-full mt-2 py-2 text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="bg-white border border-zinc-100 rounded-xl p-6 sticky top-24">
              <p className="text-sm text-zinc-400 text-center">Select a user from the list to take action.</p>
            </div>
          )}

          {/* Recent actions log */}
          {log.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Recent Actions</h3>
              <div className="flex flex-col gap-2">
                {log.slice(0, 10).map((entry) => (
                  <div key={entry.id} className="bg-white border border-zinc-100 rounded-lg px-3 py-2.5">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-medium text-zinc-700">
                        {(entry.users as any)?.username || 'Unknown'}
                      </span>
                      <span className="text-[10px] text-zinc-300">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {STATUS_CONFIG[entry.new_status as keyof typeof STATUS_CONFIG]?.label || entry.action}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  )
}