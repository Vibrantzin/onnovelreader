// src/app/novel/[novelId]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          className={`text-2xl transition-colors ${s <= (hover || value) ? 'text-amber-400' : 'text-zinc-200'}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export default function NovelPage() {
  const params = useParams()
  const novelId = params.novelId as string
  const router = useRouter()

  const [novel, setNovel] = useState<any>(null)
  const [chapters, setChapters] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [session, setSession] = useState<any>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  // Review form
  const [userReview, setUserReview] = useState<any>(null)
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [deletingReview, setDeletingReview] = useState(false)
  const [reviewError, setReviewError] = useState('')

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    setSession(session)

    const { data: novelData, error: novelError } = await supabase
      .from('novels')
      .select('*')
      .eq('id', novelId)
      .single()

    if (novelError || !novelData) {
      console.error('Novel fetch error:', novelError)
      setFetchError('Novel not found.')
      setLoading(false)
      return
    }

    // Block access to unpublished novels unless you are the author
    if (!novelData.is_published && novelData.author_id !== session?.user?.id) {
      setFetchError('This novel is not available.')
      setLoading(false)
      return
    }

    const { data: authorData } = await supabase
      .from('users')
      .select('username')
      .eq('id', novelData.author_id)
      .single()

    const novel = { ...novelData, author_username: authorData?.username || 'Unknown' }

    const [{ data: chapters }, { data: reviews }] = await Promise.all([
      supabase.from('chapters')
        .select('id, chapter_number, title, is_published, created_at')
        .eq('novel_id', novelId)
        .eq('is_published', true)
        .order('chapter_number', { ascending: true }),
      supabase.from('reviews')
        .select('*, users(username)')
        .eq('novel_id', novelId)
        .order('created_at', { ascending: false }),
    ])

    setNovel(novel)
    setChapters(chapters || [])
    setReviews(reviews || [])

    if (session) {
      const { data: followData } = await supabase
        .from('novel_followers')
        .select('novel_id')
        .eq('novel_id', novelId)
        .eq('user_id', session.user.id)
        .single()
      setIsFollowing(!!followData)

      const existing = (reviews || []).find((r: any) => r.user_id === session.user.id)
      if (existing) {
        setUserReview(existing)
        setRating(existing.rating)
        setReviewText(existing.content || '')
      } else {
        setUserReview(null)
        setRating(0)
        setReviewText('')
      }
    }

    // Only log a view once per browser session per novel — prevents refresh farming
    const viewKey = `viewed_novel_${novelId}`
    if (!sessionStorage.getItem(viewKey)) {
      sessionStorage.setItem(viewKey, '1')
      await supabase.from('novel_views').insert([{ novel_id: novelId, user_id: session?.user?.id || null }])
      await supabase.rpc('check_and_release_milestones', { p_novel_id: novelId })
    }

    setLoading(false)
  }

  const handleFollow = async () => {
    if (!session) { router.push('/login'); return }
    if (isFollowing) {
      await supabase.from('novel_followers').delete()
        .eq('novel_id', novelId).eq('user_id', session.user.id)
      setIsFollowing(false)
      setNovel((n: any) => ({ ...n, follower_count: Math.max(0, n.follower_count - 1) }))
    } else {
      await supabase.from('novel_followers').insert([{ novel_id: novelId, user_id: session.user.id }])
      setIsFollowing(true)
      setNovel((n: any) => ({ ...n, follower_count: n.follower_count + 1 }))
    }
    await supabase.rpc('check_and_release_milestones', { p_novel_id: novelId })
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) { router.push('/login'); return }
    if (rating === 0) { setReviewError('Please select a star rating.'); return }
    setSubmittingReview(true)
    setReviewError('')

    if (userReview) {
      const { error } = await supabase.from('reviews')
        .update({ rating, content: reviewText })
        .eq('id', userReview.id)
      if (error) { setReviewError(error.message); setSubmittingReview(false); return }
    } else {
      const { error } = await supabase.from('reviews')
        .insert([{ novel_id: novelId, user_id: session.user.id, rating, content: reviewText }])
      if (error) { setReviewError(error.message); setSubmittingReview(false); return }
    }

    await fetchAll()
    setSubmittingReview(false)
  }

  const handleDeleteReview = async () => {
    if (!userReview) return
    if (!confirm('Are you sure you want to delete your review?')) return
    setDeletingReview(true)

    const { error } = await supabase.from('reviews').delete().eq('id', userReview.id)
    if (error) {
      setReviewError('Failed to delete review: ' + error.message)
    } else {
      await fetchAll()
    }
    setDeletingReview(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f7]">
      <p className="text-zinc-400 text-sm tracking-widest uppercase animate-pulse">Loading...</p>
    </div>
  )

  if (fetchError) return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f7] flex-col gap-4">
      <p className="text-zinc-500 text-sm">{fetchError}</p>
      <Link href="/browse" className="text-sm font-medium text-zinc-900 underline">Back to Browse</Link>
    </div>
  )

  const avgRating = novel?.avg_rating || 0

  return (
    <div className="min-h-screen bg-[#faf9f7] text-zinc-900 font-sans">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-12">

        {/* Novel header */}
        <div className="flex gap-8 mb-12">
          <div className="flex-shrink-0 w-36 h-52 bg-zinc-200 rounded-lg overflow-hidden shadow-md">
            {novel.cover_image_url ? (
              <img src={novel.cover_image_url} alt={novel.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl text-zinc-300">📖</div>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-1">{novel.title}</h1>
            <p className="text-sm text-zinc-400 mb-3">
              by <span className="text-zinc-600 font-medium">{novel.author_username}</span>
            </p>

            <div className="flex flex-wrap gap-1.5 mb-4">
              {(novel.genres || []).map((g: string) => (
                <span key={g} className="text-xs bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-full">{g}</span>
              ))}
            </div>

            <div className="flex items-center gap-6 text-sm text-zinc-500 mb-5">
              <span>
                <span className="text-amber-400 font-medium">{avgRating > 0 ? Number(avgRating).toFixed(1) : '—'}</span>
                {' '}★ <span className="text-zinc-300">({novel.review_count} reviews)</span>
              </span>
              <span>{(novel.view_count || 0).toLocaleString()} views</span>
              <span>{(novel.follower_count || 0).toLocaleString()} followers</span>
              <span>{chapters.length} chapters</span>
            </div>

            <div className="flex gap-3">
              {chapters.length > 0 && (
                <Link
                  href={`/read/${chapters[0].id}`}
                  className="bg-zinc-900 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-zinc-700 transition-colors"
                >
                  Start Reading
                </Link>
              )}
              <button
                onClick={handleFollow}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold border transition-colors ${
                  isFollowing
                    ? 'bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-700'
                    : 'bg-white text-zinc-900 border-zinc-300 hover:border-zinc-900'
                }`}
              >
                {isFollowing ? '✓ Following' : '+ Follow'}
              </button>
            </div>
          </div>
        </div>

        {/* Synopsis */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold mb-3">Synopsis</h2>
          <p className="text-zinc-600 leading-relaxed">{novel.synopsis || 'No synopsis provided.'}</p>
        </section>

        {/* Chapters list */}
        <section className="mb-12">
          <h2 className="text-lg font-semibold mb-4">Chapters</h2>
          {chapters.length === 0 ? (
            <p className="text-zinc-400 text-sm">No chapters published yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {chapters.map((ch) => (
                <Link
                  key={ch.id}
                  href={`/read/${ch.id}`}
                  className="flex items-center justify-between bg-white border border-zinc-200 rounded-lg px-5 py-3.5 hover:border-zinc-400 transition-colors group"
                >
                  <div>
                    <span className="text-xs text-zinc-400 mr-2">Ch. {ch.chapter_number}</span>
                    <span className="text-sm font-medium text-zinc-800 group-hover:text-black">
                      {ch.title || `Chapter ${ch.chapter_number}`}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-300 group-hover:text-zinc-500 transition-colors">Read →</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Reviews section */}
        <section>
          <h2 className="text-lg font-semibold mb-6">Reviews</h2>

          {session ? (
            <form onSubmit={handleReviewSubmit} className="bg-white border border-zinc-200 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">{userReview ? 'Edit your review' : 'Write a review'}</h3>
                {userReview && (
                  <button
                    type="button"
                    onClick={handleDeleteReview}
                    disabled={deletingReview}
                    className="text-xs text-zinc-300 hover:text-red-500 transition-colors disabled:opacity-50"
                  >
                    {deletingReview ? 'Deleting...' : 'Delete review'}
                  </button>
                )}
              </div>
              <StarPicker value={rating} onChange={setRating} />
              <textarea
                placeholder="Share your thoughts... (optional)"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={3}
                className="w-full mt-4 px-4 py-3 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-zinc-500 resize-none"
              />
              {reviewError && <p className="text-xs text-red-500 mt-2">{reviewError}</p>}
              <button
                type="submit"
                disabled={submittingReview}
                className="mt-3 bg-zinc-900 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-zinc-700 disabled:opacity-50 transition-colors"
              >
                {submittingReview ? 'Saving...' : userReview ? 'Update Review' : 'Submit Review'}
              </button>
            </form>
          ) : (
            <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-6 mb-8 text-center">
              <p className="text-sm text-zinc-500 mb-3">Sign in to leave a review</p>
              <Link href="/login" className="text-sm font-semibold text-zinc-900 underline">Sign in</Link>
            </div>
          )}

          {reviews.length === 0 ? (
            <p className="text-zinc-400 text-sm">No reviews yet. Be the first!</p>
          ) : (
            <div className="flex flex-col gap-4">
              {reviews.map((r) => (
                <div key={r.id} className="bg-white border border-zinc-200 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-zinc-700">{r.users?.username || 'Reader'}</span>
                    <span className="text-amber-400 text-sm">
                      {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                    </span>
                  </div>
                  {r.content && <p className="text-sm text-zinc-600 leading-relaxed">{r.content}</p>}
                  <p className="text-xs text-zinc-300 mt-2">{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}