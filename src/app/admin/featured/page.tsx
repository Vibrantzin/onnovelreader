// src/app/admin/featured/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

// Replace this with your own Supabase user ID to restrict access
// Find it in Supabase → Authentication → Users → your account
const ADMIN_USER_ID = '489099a5-b55a-4a0c-ab5c-ef788a43c764'

export default function AdminFeatured() {
  const router = useRouter()
  const [allNovels, setAllNovels] = useState<any[]>([])
  const [featured, setFeatured] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [notAuthorized, setNotAuthorized] = useState(false)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    checkAdminAndFetch()
  }, [])

  const checkAdminAndFetch = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session || session.user.id !== ADMIN_USER_ID) {
      setNotAuthorized(true)
      setLoading(false)
      return
    }

    const [{ data: novels }, { data: featuredRows }] = await Promise.all([
      supabase.from('novels').select('id, title, cover_image_url, avg_rating, view_count').order('title'),
      supabase.from('featured_novels').select('*, novels(id, title, cover_image_url)').order('display_order'),
    ])

    setAllNovels(novels || [])
    setFeatured(featuredRows || [])
    setLoading(false)
  }

  const handleAdd = async (novelId: string) => {
    if (featured.length >= 5) { setError('You can feature a maximum of 5 novels.'); return }
    if (featured.some((f) => f.novel_id === novelId)) { setError('This novel is already featured.'); return }
    setError('')

    const { error } = await supabase.from('featured_novels').insert([{
      novel_id: novelId,
      display_order: featured.length,
    }])
    if (error) {
      setError(error.message)
    } else {
      // Notify the author their novel was featured
      const novel = allNovels.find((n) => n.id === novelId)
      if (novel) {
        await supabase.rpc('send_notification', {
          p_user_id: novel.author_id,
          p_type: 'chosen_pick',
          p_title: `"${novel.title}" is now a Chosen Pick!`,
          p_message: `Congratulations! Your novel "${novel.title}" has been selected as a Chosen Pick and is now featured on the browse page.`,
          p_novel_id: novelId,
        })
      }
      await checkAdminAndFetch()
    }
  }

  const handleRemove = async (id: string) => {
    await supabase.from('featured_novels').delete().eq('id', id)
    setFeatured((prev) => prev.filter((f) => f.id !== id))
  }

  const handleMoveUp = async (index: number) => {
    if (index === 0) return
    const updated = [...featured]
    ;[updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
    // Update display_order for both
    await Promise.all([
      supabase.from('featured_novels').update({ display_order: index - 1 }).eq('id', updated[index - 1].id),
      supabase.from('featured_novels').update({ display_order: index }).eq('id', updated[index].id),
    ])
    setFeatured(updated)
  }

  const filteredNovels = allNovels.filter((n) =>
    n.title.toLowerCase().includes(search.toLowerCase())
  )

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
        <Link href="/dashboard" className="text-zinc-400 hover:text-black transition-colors">← Dashboard</Link>
        <span className="text-zinc-200">|</span>
        <span className="font-medium text-zinc-700">✦ Chosen Pick — Admin</span>
      </div>

      <main className="max-w-4xl mx-auto mt-10 px-8">

        {/* Current featured */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-1">Currently Featured <span className="text-zinc-400 text-base font-normal">({featured.length}/5)</span></h2>
          <p className="text-sm text-zinc-400 mb-5">These appear in the Chosen Pick banner on the browse page. Drag to reorder.</p>

          {featured.length === 0 ? (
            <p className="text-zinc-400 text-sm">No novels featured yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {featured.map((f, i) => (
                <div key={f.id} className="bg-white border border-zinc-200 rounded-lg px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-zinc-300 font-mono text-sm w-5 text-center">{i + 1}</span>
                    <div className="w-10 h-14 bg-zinc-100 rounded overflow-hidden shrink-0">
                      {f.novels?.cover_image_url
                        ? <img src={f.novels.cover_image_url} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-zinc-300 text-lg">📖</div>
                      }
                    </div>
                    <p className="font-medium text-sm">{f.novels?.title}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleMoveUp(i)} disabled={i === 0} className="text-xs px-2 py-1 border border-zinc-200 rounded hover:border-zinc-400 disabled:opacity-30">↑</button>
                    <button onClick={() => handleRemove(f.id)} className="text-xs text-zinc-300 hover:text-red-500 transition-colors ml-2">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Add novels */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Add a Novel</h2>
          {error && <p className="text-xs text-red-500 mb-4">{error}</p>}
          <input
            type="text"
            placeholder="Search novels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm px-4 py-2.5 border border-zinc-200 rounded-full text-sm focus:outline-none focus:border-zinc-500 mb-5"
          />
          <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
            {filteredNovels.map((n) => {
              const alreadyFeatured = featured.some((f) => f.novel_id === n.id)
              return (
                <div key={n.id} className="bg-white border border-zinc-200 rounded-lg px-5 py-3.5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-zinc-400">{(n.view_count || 0).toLocaleString()} views · {n.avg_rating > 0 ? `${n.avg_rating.toFixed(1)}★` : 'No ratings'}</p>
                  </div>
                  <button
                    onClick={() => handleAdd(n.id)}
                    disabled={alreadyFeatured || featured.length >= 5}
                    className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-colors ${
                      alreadyFeatured
                        ? 'bg-green-50 text-green-600 cursor-default'
                        : 'bg-zinc-900 text-white hover:bg-zinc-700 disabled:opacity-40'
                    }`}
                  >
                    {alreadyFeatured ? '✓ Featured' : '+ Feature'}
                  </button>
                </div>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}