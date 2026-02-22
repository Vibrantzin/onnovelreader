'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function Dashboard() {
  const [novels, setNovels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState('')
  const [synopsis, setSynopsis] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    checkUserAndFetchNovels()
  }, [])

  const checkUserAndFetchNovels = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }

    const { data, error } = await supabase
      .from('novels')
      .select('*')
      .eq('author_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch error:', error)
      setError('Failed to load novels: ' + error.message)
    }

    if (data) setNovels(data)
    setLoading(false)
  }

  const handleCreateNovel = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }

    const { data, error } = await supabase
      .from('novels')
      .insert([{ title, synopsis, author_id: session.user.id }])
      .select()
      .single()

    if (error) {
      console.error('Insert error:', error)
      setError('Failed to create novel: ' + error.message)
    } else if (data) {
      setNovels([data, ...novels])
      setIsCreating(false)
      setTitle('')
      setSynopsis('')
    }

    setIsSubmitting(false)
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 pb-20">
      <Navbar />

      <main className="max-w-4xl mx-auto mt-12 px-8">
        <div className="flex justify-between items-end mb-8">
          <h2 className="text-3xl font-semibold">Your Library</h2>
          <button
            onClick={() => { setIsCreating(!isCreating); setError('') }}
            className="bg-black text-white px-5 py-2 rounded text-sm font-medium hover:bg-zinc-800 transition-colors"
          >
            {isCreating ? 'Cancel' : '+ New Novel'}
          </button>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        {isCreating && (
          <form onSubmit={handleCreateNovel} className="bg-white p-6 rounded border border-zinc-200 mb-8 shadow-sm">
            <h3 className="font-semibold mb-4">Start a new story</h3>
            <input
              type="text"
              placeholder="Novel Title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full mb-4 px-4 py-2 border border-zinc-300 rounded focus:outline-none focus:border-black"
            />
            <textarea
              placeholder="Synopsis (What is the story about?)"
              required
              rows={4}
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              className="w-full mb-4 px-4 py-2 border border-zinc-300 rounded focus:outline-none focus:border-black resize-none"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-black text-white px-6 py-2 rounded text-sm font-medium hover:bg-zinc-800 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Novel'}
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {novels.length === 0 && !isCreating ? (
            <p className="text-zinc-500">You haven't started any stories yet.</p>
          ) : (
            novels.map((novel) => (
              <div key={novel.id} className="bg-white p-6 rounded border border-zinc-200 hover:border-zinc-400 transition-colors group">
                <h3 className="text-xl font-semibold mb-2">{novel.title}</h3>
                <p className="text-zinc-600 text-sm line-clamp-3 mb-6">{novel.synopsis}</p>
                <Link
                  href={`/dashboard/${novel.id}`}
                  className="text-sm font-medium text-black border-b border-transparent group-hover:border-black transition-colors"
                >
                  Manage Chapters &rarr;
                </Link>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}