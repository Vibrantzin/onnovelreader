'use client'

export const dynamic = 'force-dynamic'


import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function Dashboard() {

  useEffect(() => { document.title = 'Your Library | Novel Reader' }, [])
  const [novels, setNovels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [accountStatus, setAccountStatus] = useState('active')
  const [statusReason, setStatusReason] = useState('')
  const [userAge, setUserAge] = useState<number | null>(null)
  const [suspensionExpiry, setSuspensionExpiry] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState('')
  const [synopsis, setSynopsis] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    checkUserAndFetchNovels()
  }, [])

  // Precise timer: fires at the exact moment a timed suspension expires
  useEffect(() => {
    if (!suspensionExpiry) return
    const msUntilExpiry = new Date(suspensionExpiry).getTime() - Date.now()
    if (msUntilExpiry <= 0) return
    const timer = setTimeout(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      await supabase.from('users').update({
        account_status: 'active',
        status_reason: null,
        status_expires_at: null,
        status_updated_at: new Date().toISOString(),
      }).eq('id', session.user.id)
      setAccountStatus('active')
      setStatusReason('')
      setSuspensionExpiry(null)
    }, msUntilExpiry)
    return () => clearTimeout(timer)
  }, [suspensionExpiry])

  const checkUserAndFetchNovels = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      // Fetch user status and novels in parallel
      const [{ data: userData }, { data: novelsData, error: novelsError }] = await Promise.all([
        supabase
          .from('users')
          .select('account_status, status_reason, status_expires_at, date_of_birth')
          .eq('id', session.user.id)
          .single(),
        supabase
          .from('novels')
          .select('*')
          .eq('author_id', session.user.id)
          .order('created_at', { ascending: false }),
      ])

      // Handle account status
      if (userData) {
        let status = userData.account_status || 'active'

        // Auto-lift expired suspensions
        if (status === 'suspended' && userData.status_expires_at) {
          if (new Date(userData.status_expires_at) <= new Date()) {
            // Already expired — lift immediately
            await supabase.from('users').update({
              account_status: 'active',
              status_reason: null,
              status_expires_at: null,
              status_updated_at: new Date().toISOString(),
            }).eq('id', session.user.id)
            status = 'active'
          } else {
            // Not yet expired — store expiry so timer can fire at exact moment
            setSuspensionExpiry(userData.status_expires_at)
          }
        }

        setAccountStatus(status)
        setStatusReason(userData.status_reason || '')
        if (userData.date_of_birth) {
          const age = Math.floor((Date.now() - new Date(userData.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
          setUserAge(age)
        }

        // Sign out suspended/banned users
        if (status === 'suspended' || status === 'permanently_banned') {
          await supabase.auth.signOut()
          router.push('/login?banned=1')
          return
        }
      }

      if (novelsError) {
        console.error('Fetch error:', novelsError)
        setError('Failed to load novels: ' + novelsError.message)
      }

      if (novelsData) setNovels(novelsData)
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('Something went wrong. Please refresh the page.')
    }
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
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 pb-16 md:pb-20">
      <Navbar />

      <main className="max-w-4xl mx-auto mt-12 px-4 md:px-8">
        {(accountStatus === 'posting_banned' || accountStatus === 'warned') && (
          <div className={`border rounded-xl p-4 mb-6 flex gap-3 items-start ${accountStatus === 'posting_banned' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'}`}>
            <span className="text-xl">{accountStatus === 'posting_banned' ? '🚫' : '⚠️'}</span>
            <div>
              <p className={`text-sm font-semibold ${accountStatus === 'posting_banned' ? 'text-red-700' : 'text-yellow-700'}`}>
                {accountStatus === 'posting_banned' ? 'Your account has been restricted from posting.' : 'Your account has received a warning.'}
              </p>
              {statusReason && <p className={`text-xs mt-1 ${accountStatus === 'posting_banned' ? 'text-red-500' : 'text-yellow-600'}`}>Reason: {statusReason}</p>}
              <p className="text-xs mt-1 text-zinc-400">If you believe this is a mistake, contact support@novelreader.tech.</p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
          <h2 className="text-xl md:text-2xl md:text-3xl font-semibold">Your Library</h2>
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
            {userAge !== null && userAge < 18 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4 text-xs text-amber-700">
                ⚠️ As a user under 18, your novels will be limited to <strong>Teen (13+)</strong> rating or below. Adult genres and ratings will be unavailable.
              </div>
            )}
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