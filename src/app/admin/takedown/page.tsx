// src/app/admin/takedown/page.tsx
'use client'


export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

const ADMIN_USER_ID = process.env.NEXT_PUBLIC_ADMIN_USER_ID || ''

export default function AdminTakedown() {

  useEffect(() => { document.title = 'Admin — Content Moderation | Novel Reader' }, [])
  const [novels, setNovels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [notAuthorized, setNotAuthorized] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'taken_down'>('all')
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [reasonInputs, setReasonInputs] = useState<Record<string, string>>({})

  useEffect(() => { checkAndFetch() }, [])

  const checkAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || session.user.id !== ADMIN_USER_ID) {
      setNotAuthorized(true)
      setLoading(false)
      return
    }

    // Fetch novels and users separately to avoid join issues
    const { data: novelsData, error } = await supabase
      .from('novels')
      .select('id, title, synopsis, cover_image_url, is_taken_down, takedown_reason, is_published, genres, age_rating, view_count, author_id')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch error:', error)
      setLoading(false)
      return
    }

    // Fetch all users to match author usernames
    const { data: usersData } = await supabase
      .from('users')
      .select('id, username')

    const usersMap: Record<string, string> = {}
    ;(usersData || []).forEach((u: any) => { usersMap[u.id] = u.username })

    const enriched = (novelsData || []).map((n: any) => ({
      ...n,
      author_username: usersMap[n.author_id] || 'Unknown',
    }))

    setNovels(enriched)
    setLoading(false)
  }

  const handleTakedown = async (novelId: string) => {
    const reason = reasonInputs[novelId]
    if (!reason?.trim()) { alert('Please enter a reason for the takedown.'); return }
    if (!confirm('Take down this novel? The author will be notified.')) return

    setProcessingId(novelId)
    const { data: { session } } = await supabase.auth.getSession()
    const { error } = await supabase.rpc('admin_takedown_novel', {
      p_novel_id: novelId,
      p_reason: reason,
      p_admin_id: session!.user.id,
    })

    if (!error) {
      const novel = novels.find((n) => n.id === novelId)
      if (novel) {
        await supabase.rpc('send_notification', {
          p_user_id: novel.author_id,
          p_type: 'admin_warning',
          p_title: `Your novel "${novel.title}" has been taken down`,
          p_message: `Your novel "${novel.title}" has been removed from Novel Reader for the following reason: ${reason}. If you believe this is a mistake, please contact us to appeal.`,
          p_novel_id: novelId,
        })
      }
      await checkAndFetch()
    }
    setProcessingId(null)
  }

  const handleRestore = async (novelId: string) => {
    if (!confirm('Restore this novel? The author can re-publish it from their dashboard.')) return
    setProcessingId(novelId)

    const { error } = await supabase.rpc('admin_restore_novel', {
      p_novel_id: novelId,
    })

    if (!error) {
      const novel = novels.find((n) => n.id === novelId)
      if (novel) {
        await supabase.rpc('send_notification', {
          p_user_id: novel.author_id,
          p_type: 'admin_warning',
          p_title: `Your novel "${novel.title}" has been restored`,
          p_message: `After review, your novel "${novel.title}" has been restored. You may re-publish it from your dashboard.`,
          p_novel_id: novelId,
        })
      }
      await checkAndFetch()
    }
    setProcessingId(null)
  }

  const filtered = novels.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.author_username.toLowerCase().includes(search.toLowerCase())
    const matchesFilter =
      filter === 'all' ? true :
      filter === 'taken_down' ? n.is_taken_down :
      !n.is_taken_down
    return matchesSearch && matchesFilter
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
      <div className="bg-white border-b border-zinc-100 px-4 md:px-4 md:px-8 py-3 flex flex-wrap items-center gap-3 text-sm">
        <Link href="/admin/featured" className="text-zinc-400 hover:text-black transition-colors">← Admin</Link>
        <span className="text-zinc-200">|</span>
        <span className="font-medium text-zinc-700">🚫 Content Moderation</span>
        <span className="ml-auto text-xs text-zinc-400">{novels.length} total novels</span>
      </div>

      <main className="max-w-5xl mx-auto mt-6 md:mt-10 px-4 md:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl md:text-xl md:text-2xl font-semibold mb-1">Content Moderation</h1>
            <p className="text-sm text-zinc-400">Take down novels that violate content policies. Authors are notified automatically.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'active', 'taken_down'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                  filter === f ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400'
                }`}
              >
                {f === 'all' ? `All (${novels.length})` : f === 'active' ? `Active (${novels.filter(n => !n.is_taken_down).length})` : `Taken Down (${novels.filter(n => n.is_taken_down).length})`}
              </button>
            ))}
          </div>
        </div>

        <input
          type="text"
          placeholder="Search by title or author..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-6 px-4 py-2.5 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-zinc-500"
        />

        {filtered.length === 0 ? (
          <div className="text-center py-10 md:py-16">
            <p className="text-zinc-300 text-xl md:text-2xl md:text-4xl mb-3">📚</p>
            <p className="text-zinc-400 text-sm">No novels found.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map((novel) => (
              <div
                key={novel.id}
                className={`bg-white border rounded-xl p-5 ${novel.is_taken_down ? 'border-red-200 bg-red-50/30' : 'border-zinc-200'}`}
              >
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="w-12 h-16 bg-zinc-100 rounded-lg overflow-hidden shrink-0">
                    {novel.cover_image_url
                      ? <img src={novel.cover_image_url} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-lg">📖</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-zinc-900 truncate">{novel.title}</h3>
                      {novel.is_taken_down && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium shrink-0">Taken Down</span>
                      )}
                      {novel.age_rating === 'adult' && (
                        <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-medium shrink-0">18+</span>
                      )}
                      {!novel.is_published && !novel.is_taken_down && (
                        <span className="text-xs bg-zinc-100 text-zinc-400 px-2 py-0.5 rounded-full font-medium shrink-0">Unpublished</span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mb-1">
                      by <span className="font-medium text-zinc-600">{novel.author_username}</span>
                      {' · '}{(novel.genres || []).slice(0, 3).join(', ') || 'No genres'}
                      {' · '}{(novel.view_count || 0).toLocaleString()} views
                    </p>
                    {novel.takedown_reason && (
                      <p className="text-xs text-red-500 mt-1 font-medium">⚠️ Reason: {novel.takedown_reason}</p>
                    )}
                    {novel.synopsis && (
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{novel.synopsis}</p>
                    )}
                  </div>
                  <Link
                    href={`/novel/${novel.id}`}
                    target="_blank"
                    className="text-xs text-zinc-400 hover:text-zinc-700 shrink-0 transition-colors"
                  >
                    View →
                  </Link>
                </div>

                {!novel.is_taken_down ? (
                  <div className="mt-4 flex gap-3 items-end">
                    <input
                      type="text"
                      placeholder="Reason for takedown (required)..."
                      value={reasonInputs[novel.id] || ''}
                      onChange={(e) => setReasonInputs((prev) => ({ ...prev, [novel.id]: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg text-xs focus:outline-none focus:border-red-300"
                    />
                    <button
                      onClick={() => handleTakedown(novel.id)}
                      disabled={processingId === novel.id}
                      className="text-xs font-semibold bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors whitespace-nowrap"
                    >
                      {processingId === novel.id ? 'Processing...' : '🚫 Take Down'}
                    </button>
                  </div>
                ) : (
                  <div className="mt-3">
                    <button
                      onClick={() => handleRestore(novel.id)}
                      disabled={processingId === novel.id}
                      className="text-xs font-semibold bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                    >
                      {processingId === novel.id ? 'Processing...' : '✓ Restore Novel'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}