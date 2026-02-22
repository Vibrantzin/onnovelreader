// src/app/dashboard/[novelId]/releases/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

type ReleaseType = 'manual' | 'datetime' | 'view_milestone' | 'follower_milestone'

export default function ReleasesManager() {
  const params = useParams()
  const novelId = params.novelId as string
  const router = useRouter()

  const [chapters, setChapters] = useState<any[]>([])
  const [scheduled, setScheduled] = useState<any[]>([])
  const [novel, setNovel] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Form state
  const [selectedChapter, setSelectedChapter] = useState('')
  const [releaseType, setReleaseType] = useState<ReleaseType>('manual')
  const [releaseDate, setReleaseDate] = useState('')
  const [viewMilestone, setViewMilestone] = useState('')
  const [followerMilestone, setFollowerMilestone] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }

    const { data: novel } = await supabase
      .from('novels')
      .select('*')
      .eq('id', novelId)
      .eq('author_id', session.user.id)
      .single()

    if (!novel) { router.push('/dashboard'); return }
    setNovel(novel)

    const [{ data: chapters }, { data: scheduled }] = await Promise.all([
      supabase.from('chapters').select('*').eq('novel_id', novelId).order('chapter_number', { ascending: true }),
      supabase.from('scheduled_releases').select('*, chapters(chapter_number, title)')
        .eq('novel_id', novelId).order('created_at', { ascending: false }),
    ])

    setChapters(chapters || [])
    setScheduled(scheduled || [])
    setLoading(false)
  }

  const handleManualRelease = async (chapterId: string, publish: boolean) => {
    await supabase.from('chapters').update({ is_published: publish }).eq('id', chapterId)
    setChapters((prev) => prev.map((c) => c.id === chapterId ? { ...c, is_published: publish } : c))
  }

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!selectedChapter) { setFormError('Please select a chapter.'); return }
    if (releaseType === 'datetime' && !releaseDate) { setFormError('Please pick a date and time.'); return }
    if (releaseType === 'view_milestone' && !viewMilestone) { setFormError('Please enter a view count.'); return }
    if (releaseType === 'follower_milestone' && !followerMilestone) { setFormError('Please enter a follower count.'); return }

    setSubmitting(true)

    const payload: any = {
      chapter_id: selectedChapter,
      novel_id: novelId,
      release_type: releaseType,
    }
    if (releaseType === 'datetime') payload.release_at = new Date(releaseDate).toISOString()
    if (releaseType === 'view_milestone') payload.view_milestone = parseInt(viewMilestone)
    if (releaseType === 'follower_milestone') payload.follower_milestone = parseInt(followerMilestone)

    const { error } = await supabase.from('scheduled_releases').insert([payload])
    if (error) { setFormError(error.message) } else { await fetchData() }
    setSubmitting(false)
  }

  const handleDeleteSchedule = async (id: string) => {
    await supabase.from('scheduled_releases').delete().eq('id', id)
    setScheduled((prev) => prev.filter((s) => s.id !== id))
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <p className="text-zinc-400 text-sm">Loading...</p>
    </div>
  )

  const unpublishedChapters = chapters.filter((c) => !c.is_published)

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 pb-20">
      <Navbar />
      <div className="bg-white border-b border-zinc-100 px-8 py-3 flex items-center gap-3 text-sm">
        <Link href={`/dashboard/${novelId}`} className="text-zinc-400 hover:text-black transition-colors">← {novel?.title}</Link>
        <span className="text-zinc-200">|</span>
        <span className="font-medium text-zinc-700">Release Manager</span>
      </div>

      <main className="max-w-3xl mx-auto mt-10 px-8">

        {/* Manual release toggles */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-1">Chapters</h2>
          <p className="text-sm text-zinc-400 mb-5">Toggle chapters on or off manually.</p>

          <div className="flex flex-col gap-3">
            {chapters.length === 0 && <p className="text-zinc-400 text-sm">No chapters yet.</p>}
            {chapters.map((ch) => (
              <div key={ch.id} className="bg-white border border-zinc-200 rounded-lg px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-400 mb-0.5">Chapter {ch.chapter_number}</p>
                  <p className="text-sm font-medium">{ch.title || `Chapter ${ch.chapter_number}`}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ch.is_published ? 'bg-green-50 text-green-600' : 'bg-zinc-100 text-zinc-400'}`}>
                    {ch.is_published ? 'Published' : 'Draft'}
                  </span>
                  <button
                    onClick={() => handleManualRelease(ch.id, !ch.is_published)}
                    className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-colors ${
                      ch.is_published
                        ? 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                        : 'bg-zinc-900 text-white hover:bg-zinc-700'
                    }`}
                  >
                    {ch.is_published ? 'Unpublish' : 'Publish Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Scheduled release form */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-1">Schedule a Release</h2>
          <p className="text-sm text-zinc-400 mb-5">Automatically publish a chapter when a condition is met.</p>

          <form onSubmit={handleSchedule} className="bg-white border border-zinc-200 rounded-xl p-6">

            {/* Chapter selector */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-2">Chapter</label>
              <select
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
                className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-zinc-500"
              >
                <option value="">— Select a chapter —</option>
                {unpublishedChapters.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    Ch. {ch.chapter_number}{ch.title ? ` — ${ch.title}` : ''}
                  </option>
                ))}
              </select>
              {unpublishedChapters.length === 0 && (
                <p className="text-xs text-zinc-400 mt-1">All chapters are already published.</p>
              )}
            </div>

            {/* Release type */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-2">Release When</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {([
                  { value: 'manual', label: 'Manual only' },
                  { value: 'datetime', label: 'Date & Time' },
                  { value: 'view_milestone', label: 'X Views reached' },
                  { value: 'follower_milestone', label: 'X Followers reached' },
                ] as { value: ReleaseType; label: string }[]).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setReleaseType(opt.value)}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors text-center ${
                      releaseType === opt.value ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Conditional inputs */}
            {releaseType === 'datetime' && (
              <div className="mb-5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-2">Release At</label>
                <input
                  type="datetime-local"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-zinc-500"
                />
              </div>
            )}
            {releaseType === 'view_milestone' && (
              <div className="mb-5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-2">Total Novel Views Required</label>
                <input
                  type="number"
                  min={1}
                  placeholder="e.g. 1000"
                  value={viewMilestone}
                  onChange={(e) => setViewMilestone(e.target.value)}
                  className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-zinc-500"
                />
              </div>
            )}
            {releaseType === 'follower_milestone' && (
              <div className="mb-5">
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-2">Total Followers Required</label>
                <input
                  type="number"
                  min={1}
                  placeholder="e.g. 500"
                  value={followerMilestone}
                  onChange={(e) => setFollowerMilestone(e.target.value)}
                  className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-zinc-500"
                />
              </div>
            )}

            {formError && <p className="text-xs text-red-500 mb-4">{formError}</p>}

            {releaseType !== 'manual' && (
              <button
                type="submit"
                disabled={submitting}
                className="bg-zinc-900 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-zinc-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Scheduling...' : 'Schedule Release'}
              </button>
            )}
          </form>
        </section>

        {/* Scheduled releases list */}
        {scheduled.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-5">Pending Schedules</h2>
            <div className="flex flex-col gap-3">
              {scheduled.map((s) => (
                <div key={s.id} className="bg-white border border-zinc-200 rounded-lg px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium mb-1">
                      Ch. {s.chapters?.chapter_number}{s.chapters?.title ? ` — ${s.chapters.title}` : ''}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {s.release_type === 'datetime' && `Releases on ${new Date(s.release_at).toLocaleString()}`}
                      {s.release_type === 'view_milestone' && `Releases at ${s.view_milestone?.toLocaleString()} views`}
                      {s.release_type === 'follower_milestone' && `Releases at ${s.follower_milestone?.toLocaleString()} followers`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${s.is_released ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                      {s.is_released ? 'Released' : 'Pending'}
                    </span>
                    {!s.is_released && (
                      <button
                        onClick={() => handleDeleteSchedule(s.id)}
                        className="text-xs text-zinc-300 hover:text-red-500 transition-colors"
                        title="Cancel schedule"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}