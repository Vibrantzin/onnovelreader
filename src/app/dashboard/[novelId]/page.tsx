// src/app/dashboard/[novelId]/page.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

const NSFW_GENRES = ['Adult', 'Ecchi', 'Harem', 'Mature', 'Smut', 'Yaoi', 'Yuri', 'Shoujo Ai', 'Shounen Ai', 'LGBT+', 'Gender Bender']

const GENRES = [
  'Action', 'Adult', 'Adventure', 'Anime & Comics', 'Comedy', 'Drama',
  'Eastern', 'Ecchi', 'Fan-fiction', 'Fantasy', 'Game', 'Gender Bender',
  'Harem', 'Historical', 'Horror', 'Isekai', 'Josei', 'LGBT+', 'LitRPG',
  'Magic', 'Magical Realism', 'Martial Arts', 'Mature', 'Mecha', 'Military',
  'Modern Life', 'Mystery', 'Other', 'Psychological', 'Reincarnation',
  'Romance', 'School Life', 'Sci-fi', 'Seinen', 'Shoujo', 'Shoujo Ai',
  'Shounen', 'Shounen Ai', 'Slice of Life', 'Smut', 'Sports', 'Supernatural',
  'System', 'Thriller', 'Tragedy', 'Urban', 'Video Games', 'War', 'Wuxia',
  'Xianxia', 'Xuanhuan', 'Yaoi', 'Yuri',
]

export default function NovelDetail() {
  const params = useParams()
  const novelId = params.novelId as string
  const router = useRouter()

  const [novel, setNovel] = useState<any>(null)
  const [chapters, setChapters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [chapterTitle, setChapterTitle] = useState('')
  const [error, setError] = useState('')
  const [deletingNovel, setDeletingNovel] = useState(false)
  const [togglingPublish, setTogglingPublish] = useState(false)

  // Genres
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [showGenrePicker, setShowGenrePicker] = useState(false)
  const [savingGenres, setSavingGenres] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [showTagEditor, setShowTagEditor] = useState(false)
  const [savingTags, setSavingTags] = useState(false)
  const [tagError, setTagError] = useState('')
  const [ageRating, setAgeRating] = useState('everyone')
  const [savingRating, setSavingRating] = useState(false)
  const [userAge, setUserAge] = useState<number | null>(null)
  const [maxAllowedRating, setMaxAllowedRating] = useState('adult')

  // Cover upload
  const [coverUploading, setCoverUploading] = useState(false)
  const [coverError, setCoverError] = useState('')
  const coverInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }

    const { data: novelData, error: novelError } = await supabase
      .from('novels')
      .select('*')
      .eq('id', novelId)
      .eq('author_id', session.user.id)
      .single()

    if (novelError || !novelData) {
      router.push('/dashboard')
      return
    }

    // Fetch user age to enforce writing restrictions
    const { data: userData } = await supabase
      .from('users')
      .select('date_of_birth, age_verified')
      .eq('id', session.user.id)
      .single()

    if (userData?.date_of_birth) {
      const age = Math.floor((Date.now() - new Date(userData.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      setUserAge(age)
      if (age >= 18) setMaxAllowedRating('adult')
      else if (age >= 17) setMaxAllowedRating('mature')
      else if (age >= 13) setMaxAllowedRating('teen')
      else setMaxAllowedRating('everyone')
    }

    setNovel(novelData)
    setSelectedGenres(novelData.genres || [])
    setTags(novelData.tags || [])
    setAgeRating(novelData.age_rating || 'everyone')

    const { data: chaptersData } = await supabase
      .from('chapters')
      .select('*')
      .eq('novel_id', novelId)
      .order('chapter_number', { ascending: true })

    if (chaptersData) setChapters(chaptersData)
    setLoading(false)
  }

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) => {
      if (prev.includes(genre)) return prev.filter((g) => g !== genre)
      if (prev.length >= 3) return prev // max 3
      return [...prev, genre]
    })
  }

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase().replace(/[^a-z0-9 _-]/g, '')
    if (!trimmed) return
    if (trimmed.length > 30) { setTagError('Tags must be 30 characters or fewer.'); return }
    if (tags.length >= 50) { setTagError('You can add up to 50 tags.'); return }
    if (tags.includes(trimmed)) { setTagError('That tag already exists.'); return }
    setTagError('')
    setTags((prev) => [...prev, trimmed])
    setTagInput('')
  }

  const handleRemoveTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAddTag() }
    if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1))
    }
  }

  const handleSaveTags = async () => {
    setSavingTags(true)
    const { error } = await supabase
      .from('novels')
      .update({ tags })
      .eq('id', novelId)
    if (error) setTagError('Failed to save tags.')
    else { setNovel((n: any) => ({ ...n, tags })); setShowTagEditor(false) }
    setSavingTags(false)
  }

  const handleSaveGenres = async () => {
    setSavingGenres(true)
    const { error } = await supabase
      .from('novels')
      .update({ genres: selectedGenres })
      .eq('id', novelId)

    if (error) {
      setError('Failed to save genres: ' + error.message)
    } else {
      setNovel((n: any) => ({ ...n, genres: selectedGenres }))
      setShowGenrePicker(false)
    }
    setSavingGenres(false)
  }

  const handleTogglePublish = async () => {
    setTogglingPublish(true)
    const newStatus = !novel.is_published
    const { error } = await supabase
      .from('novels')
      .update({ is_published: newStatus })
      .eq('id', novelId)

    if (error) {
      setError('Failed to update publish status: ' + error.message)
    } else {
      setNovel((n: any) => ({ ...n, is_published: newStatus }))
    }
    setTogglingPublish(false)
  }

  const handleSaveAgeRating = async (rating: string) => {
    const RATING_ORDER = ['everyone', 'teen', 'mature', 'adult']
    if (RATING_ORDER.indexOf(rating) > RATING_ORDER.indexOf(maxAllowedRating)) return
    setSavingRating(true)
    setAgeRating(rating)
    await supabase.from('novels').update({ age_rating: rating }).eq('id', novelId)
    setNovel((n: any) => ({ ...n, age_rating: rating }))
    setSavingRating(false)
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setCoverError('Please select an image file.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setCoverError('Image must be under 5MB.')
      return
    }

    setCoverUploading(true)
    setCoverError('')

    const fileExt = file.name.split('.').pop()
    const filePath = `${novelId}/cover.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('covers')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      setCoverError('Upload failed: ' + uploadError.message)
      setCoverUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('covers')
      .getPublicUrl(filePath)

    const { error: updateError } = await supabase
      .from('novels')
      .update({ cover_image_url: publicUrl })
      .eq('id', novelId)

    if (updateError) {
      setCoverError('Failed to save cover: ' + updateError.message)
    } else {
      setNovel((n: any) => ({ ...n, cover_image_url: publicUrl }))
    }

    setCoverUploading(false)
  }

  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const nextNumber = chapters.length + 1

    const { data, error } = await supabase
      .from('chapters')
      .insert([{
        novel_id: novelId,
        chapter_number: nextNumber,
        title: chapterTitle || `Chapter ${nextNumber}`,
        content: '',
        is_published: false,
      }])
      .select()
      .single()

    if (error) {
      setError('Failed to create chapter: ' + error.message)
    } else if (data) {
      router.push(`/editor/${data.id}`)
    }
  }

  const handleDeleteChapter = async (chapterId: string) => {
    if (!confirm('Are you sure you want to delete this chapter? This cannot be undone.')) return

    const { error } = await supabase
      .from('chapters')
      .delete()
      .eq('id', chapterId)

    if (!error) {
      setChapters(chapters.filter((c) => c.id !== chapterId))
    }
  }

  const handleDeleteNovel = async () => {
    const confirmed = window.prompt(
      `This will permanently delete "${novel.title}" and all its chapters. Type the novel title to confirm:`
    )
    if (confirmed !== novel.title) {
      if (confirmed !== null) alert('Title did not match. Novel was not deleted.')
      return
    }

    setDeletingNovel(true)

    const { error } = await supabase
      .from('novels')
      .delete()
      .eq('id', novelId)

    if (error) {
      setError('Failed to delete novel: ' + error.message)
      setDeletingNovel(false)
    } else {
      router.push('/dashboard')
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <p className="text-zinc-400 text-sm">Loading...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 pb-16 md:pb-20">
      <Navbar />
      <div className="bg-white border-b border-zinc-100 px-4 md:px-4 md:px-8 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3 text-sm">
          <Link href="/dashboard" className="text-zinc-400 hover:text-black transition-colors">← Dashboard</Link>
          <span className="text-zinc-200">|</span>
          <span className="font-medium text-zinc-700 truncate max-w-xs">{novel?.title}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDeleteNovel}
            disabled={deletingNovel}
            className="text-sm font-medium text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
          >
            {deletingNovel ? 'Deleting...' : 'Delete Novel'}
          </button>
          <button
            onClick={handleTogglePublish}
            disabled={togglingPublish}
            className={`text-sm font-medium px-4 py-1.5 rounded transition-colors disabled:opacity-50 ${
              novel?.is_published
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            {togglingPublish ? '...' : novel?.is_published ? '● Published' : '○ Unpublished'}
          </button>
          <Link
            href={`/dashboard/${novelId}/releases`}
            className="text-sm font-medium bg-zinc-100 text-zinc-700 px-4 py-1.5 rounded hover:bg-zinc-200 transition-colors"
          >
            Release Manager
          </Link>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="bg-black text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-zinc-800 transition-colors"
          >
            {isCreating ? 'Cancel' : '+ New Chapter'}
          </button>
        </div>
      </div>

      <main className="max-w-3xl mx-auto mt-12 px-4 md:px-8">

        {/* Cover + info section */}
        <div className="flex gap-6 mb-10 items-start">
          <div className="flex-shrink-0">
            <div className="w-28 h-40 bg-zinc-200 rounded-lg overflow-hidden shadow-sm border border-zinc-200">
              {novel?.cover_image_url ? (
                <img src={novel.cover_image_url} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl md:text-2xl md:text-3xl text-zinc-300">📖</div>
              )}
            </div>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              className="hidden"
            />
            <button
              onClick={() => coverInputRef.current?.click()}
              disabled={coverUploading}
              className="mt-2 w-full text-xs font-medium text-zinc-500 hover:text-zinc-900 border border-zinc-200 rounded py-1.5 bg-white hover:border-zinc-400 transition-colors disabled:opacity-50"
            >
              {coverUploading ? 'Uploading...' : novel?.cover_image_url ? 'Change Cover' : 'Upload Cover'}
            </button>
            {coverError && <p className="text-xs text-red-500 mt-1">{coverError}</p>}
          </div>

          <div className="flex-1">
            <h2 className="text-xl md:text-2xl md:text-3xl font-semibold mb-2">{novel?.title}</h2>
            {novel?.synopsis && (
              <p className="text-zinc-500 text-sm mb-4 max-w-xl">{novel.synopsis}</p>
            )}

            {/* Genres display + edit */}
            <div className="flex flex-wrap gap-1.5 items-center">
              {(novel?.genres || []).length === 0 && !showGenrePicker && (
                <span className="text-xs text-zinc-400">No genres set.</span>
              )}
              {(novel?.genres || []).map((g: string) => (
                <span key={g} className="text-xs bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-full">{g}</span>
              ))}
              <button
                onClick={() => setShowGenrePicker(!showGenrePicker)}
                className="text-xs font-medium text-zinc-400 hover:text-zinc-800 border border-dashed border-zinc-300 hover:border-zinc-500 px-2.5 py-1 rounded-full transition-colors"
              >
                {showGenrePicker ? 'Cancel' : '✎ Edit Genres'}
              </button>
            </div>

            {/* Age rating selector */}
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-zinc-400 font-medium">Age Rating:</span>
              {[
                { value: 'everyone', label: '👶 Everyone' },
                { value: 'teen', label: '🧒 Teen (13+)' },
                { value: 'mature', label: '🔞 Mature (17+)' },
                { value: 'adult', label: '🔴 Adult (18+)' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleSaveAgeRating(opt.value)}
                  disabled={savingRating || ['everyone','teen','mature','adult'].indexOf(opt.value) > ['everyone','teen','mature','adult'].indexOf(maxAllowedRating)}
                  className={`text-xs px-3 py-1 rounded-full border font-medium transition-colors disabled:opacity-50 ${
                    ageRating === opt.value
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : (['everyone','teen','mature','adult'].indexOf(opt.value) > ['everyone','teen','mature','adult'].indexOf(maxAllowedRating))
                      ? 'bg-zinc-50 text-zinc-300 border-zinc-100 cursor-not-allowed'
                      : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {maxAllowedRating !== 'adult' && (
              <p className="text-xs text-amber-600 mt-2">
                ⚠️ Some ratings are unavailable — you must be the required age to publish content at that rating.
              </p>
            )}

            {/* Tags section */}
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs text-zinc-400 font-medium">Tags:</span>
                {tags.length === 0 && !showTagEditor && (
                  <span className="text-xs text-zinc-400">No tags set.</span>
                )}
                {tags.slice(0, showTagEditor ? 0 : tags.length).map((tag) => (
                  <span key={tag} className="text-xs bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full">#{tag}</span>
                ))}
                <button
                  onClick={() => { setShowTagEditor(!showTagEditor); setTagError('') }}
                  className="text-xs font-medium text-zinc-400 hover:text-zinc-800 border border-dashed border-zinc-300 hover:border-zinc-500 px-2.5 py-1 rounded-full transition-colors"
                >
                  {showTagEditor ? 'Cancel' : '✎ Edit Tags'}
                </button>
              </div>

              {showTagEditor && (
                <div className="mt-2 bg-white border border-zinc-200 rounded-xl p-4 max-w-xl">
                  <p className="text-xs text-zinc-400 mb-2">
                    Up to 50 tags, 30 characters each. Press Enter to add.{' '}
                    <span className="font-medium text-zinc-600">{tags.length}/50</span>
                  </p>
                  {/* Tag chips */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {tags.map((tag) => (
                      <span key={tag} className="flex items-center gap-1 text-xs bg-zinc-100 text-zinc-700 px-2.5 py-1 rounded-full">
                        #{tag}
                        <button onClick={() => handleRemoveTag(tag)} className="text-zinc-400 hover:text-zinc-700 leading-none">✕</button>
                      </span>
                    ))}
                  </div>
                  {/* Input */}
                  {tags.length < 50 && (
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => { setTagInput(e.target.value.slice(0, 30)); setTagError('') }}
                        onKeyDown={handleTagKeyDown}
                        placeholder="Add a tag..."
                        maxLength={30}
                        className="flex-1 text-xs border border-zinc-200 rounded-lg px-3 py-2 focus:outline-none focus:border-zinc-400"
                      />
                      <button
                        onClick={handleAddTag}
                        className="text-xs font-medium bg-zinc-100 hover:bg-zinc-200 text-zinc-700 px-3 py-2 rounded-lg transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  )}
                  {tagError && <p className="text-xs text-red-500 mb-2">{tagError}</p>}
                  <button
                    onClick={handleSaveTags}
                    disabled={savingTags}
                    className="bg-zinc-900 text-white px-5 py-2 rounded-full text-xs font-semibold hover:bg-zinc-700 disabled:opacity-50 transition-colors"
                  >
                    {savingTags ? 'Saving...' : 'Save Tags'}
                  </button>
                </div>
              )}
            </div>

            {/* Genre picker panel */}
            {showGenrePicker && (
              <div className="mt-4 bg-white border border-zinc-200 rounded-xl p-5 max-w-xl">
                <p className="text-xs text-zinc-400 mb-3">
                  Select up to 3 genres.{' '}
                  <span className="font-medium text-zinc-600">{selectedGenres.length}/3 selected</span>
                </p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {GENRES.map((g) => {
                    const isSelected = selectedGenres.includes(g)
                    const isDisabled = !isSelected && selectedGenres.length >= 3
                    return (
                      <button
                        key={g}
                        onClick={() => toggleGenre(g)}
                        disabled={isDisabled}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                          isSelected
                            ? 'bg-zinc-900 text-white border-zinc-900'
                            : isDisabled
                            ? 'bg-zinc-50 text-zinc-300 border-zinc-100 cursor-not-allowed'
                            : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                        }`}
                      >
                        {g}
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={handleSaveGenres}
                  disabled={savingGenres}
                  className="bg-zinc-900 text-white px-5 py-2 rounded-full text-xs font-semibold hover:bg-zinc-700 disabled:opacity-50 transition-colors"
                >
                  {savingGenres ? 'Saving...' : 'Save Genres'}
                </button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
            {error}
          </div>
        )}

        <h3 className="text-xl font-semibold mb-5">Chapters</h3>

        {/* New chapter form */}
        {isCreating && (
          <form onSubmit={handleCreateChapter} className="bg-white p-6 rounded border border-zinc-200 mb-6 shadow-sm">
            <h3 className="font-semibold mb-4">New Chapter</h3>
            <input
              type="text"
              placeholder={`Chapter ${chapters.length + 1} Title (optional)`}
              value={chapterTitle}
              onChange={(e) => setChapterTitle(e.target.value)}
              className="w-full mb-4 px-4 py-2 border border-zinc-300 rounded focus:outline-none focus:border-black text-sm"
            />
            <button
              type="submit"
              className="bg-black text-white px-6 py-2 rounded text-sm font-medium hover:bg-zinc-800"
            >
              Create & Open Editor
            </button>
          </form>
        )}

        {/* Chapter list */}
        <div className="flex flex-col gap-3">
          {chapters.length === 0 && !isCreating ? (
            <p className="text-zinc-400 text-sm">No chapters yet. Create your first one!</p>
          ) : (
            chapters.map((chapter) => (
              <div
                key={chapter.id}
                className="bg-white border border-zinc-200 rounded px-6 py-4 flex items-center justify-between hover:border-zinc-400 transition-colors group"
              >
                <div>
                  <p className="text-xs text-zinc-400 mb-0.5">Chapter {chapter.chapter_number}</p>
                  <h3 className="font-medium text-zinc-900">
                    {chapter.title || `Chapter ${chapter.chapter_number}`}
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${chapter.is_published ? 'bg-green-50 text-green-600' : 'bg-zinc-100 text-zinc-400'}`}>
                    {chapter.is_published ? 'Published' : 'Draft'}
                  </span>
                  <Link
                    href={`/editor/${chapter.id}`}
                    className="text-sm font-medium text-black border-b border-transparent group-hover:border-black transition-colors"
                  >
                    Edit →
                  </Link>
                  <button
                    onClick={() => handleDeleteChapter(chapter.id)}
                    className="text-xs text-zinc-300 hover:text-red-500 transition-colors ml-2"
                    title="Delete chapter"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}