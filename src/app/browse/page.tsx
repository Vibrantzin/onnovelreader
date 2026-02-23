// src/app/browse/page.tsx
'use client'


import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { isNSFW } from '@/components/AgeGate'

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

function scoreNovel(novel: any): number {
  const now = Date.now()
  const created = new Date(novel.created_at).getTime()
  const ageInDays = (now - created) / (1000 * 60 * 60 * 24)
  // Blend of rating, views, recency — older novels need sustained views to stay hot
  const recencyBoost = Math.max(0, 30 - ageInDays) / 30
  return (novel.avg_rating * 2) + Math.log1p(novel.view_count) + recencyBoost * 3
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="text-xs text-amber-400 tracking-tighter">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s}>{s <= Math.round(rating) ? '★' : '☆'}</span>
      ))}
      <span className="text-zinc-400 ml-1">{rating > 0 ? rating.toFixed(1) : 'No ratings'}</span>
    </span>
  )
}

function NovelCard({ novel }: { novel: any }) {
  return (
    <Link href={`/novel/${novel.id}`} className="group block">
      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden hover:border-zinc-400 hover:shadow-md transition-all duration-200">
        {/* Cover */}
        <div className="aspect-[2/3] bg-zinc-100 relative overflow-hidden">
          {novel.cover_image_url ? (
            <img src={novel.cover_image_url} alt={novel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-zinc-300 text-4xl">📖</span>
            </div>
          )}
        </div>
        {/* Info */}
        <div className="p-3">
          <h3 className="font-semibold text-sm text-zinc-900 line-clamp-1 mb-1">{novel.title}</h3>
          <StarRating rating={novel.avg_rating || 0} />
          <div className="flex flex-wrap gap-1 mt-2">
            {(novel.genres || []).slice(0, 2).map((g: string) => (
              <span key={g} className="text-[10px] bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded-full">{g}</span>
            ))}
          </div>
          <p className="text-[11px] text-zinc-400 mt-2">{(novel.view_count || 0).toLocaleString()} views</p>
        </div>
      </div>
    </Link>
  )
}

function Section({ title, subtitle, novels }: { title: string; subtitle: string; novels: any[] }) {
  if (novels.length === 0) return null
  return (
    <section className="mb-14">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-zinc-900">{title}</h2>
        <p className="text-sm text-zinc-400 mt-0.5">{subtitle}</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {novels.slice(0, 5).map((n) => <NovelCard key={n.id} novel={n} />)}
      </div>
    </section>
  )
}

export default function Browse() {

  useEffect(() => { document.title = 'Browse Novels | Novel Reader' }, [])
  const [allNovels, setAllNovels] = useState<any[]>([])
  const [featured, setFeatured] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [ageVerified, setAgeVerified] = useState(false)
  const [userAgeRating, setUserAgeRating] = useState<string>('everyone')
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [featuredIndex, setFeaturedIndex] = useState(0)
  const [maxAgeRating, setMaxAgeRating] = useState('teen')

  useEffect(() => {
    fetchData()
  }, [])

  // Auto-rotate featured banner
  useEffect(() => {
    if (featured.length <= 1) return
    const t = setInterval(() => setFeaturedIndex((i) => (i + 1) % featured.length), 5000)
    return () => clearInterval(t)
  }, [featured])

  const fetchData = async () => {
    const { data: { session } } = await supabase.auth.getSession()

    // Determine max age rating for this user
    const RATING_ORDER = ['everyone', 'teen', 'mature', 'adult']
    let userMaxRating = 'teen' // default for logged-out users

    if (session) {
      const { data: userData } = await supabase
        .from('users')
        .select('age_verified, date_of_birth')
        .eq('id', session.user.id)
        .single()

      if (userData?.date_of_birth) {
        const age = Math.floor((Date.now() - new Date(userData.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        if (age >= 18) userMaxRating = 'adult'
        else if (age >= 17) userMaxRating = 'mature'
        else if (age >= 13) userMaxRating = 'teen'
        else userMaxRating = 'everyone'
      }
    }
    setMaxAgeRating(userMaxRating)

    const [{ data: novels }, { data: featuredRows }] = await Promise.all([
      supabase
        .from('novels')
        .select('*')
        .eq('is_published', true)
        .eq('is_taken_down', false),
      supabase
        .from('featured_novels')
        .select('novel_id, display_order')
        .order('display_order', { ascending: true })
        .limit(5),
    ])

    const maxIndex = RATING_ORDER.indexOf(userMaxRating)

    // Filter novels by age rating
    const ageFiltered = (novels || []).filter((n: any) => {
      const novelIndex = RATING_ORDER.indexOf(n.age_rating || 'everyone')
      if (userMaxRating !== 'adult' && isNSFW(n.genres || [], n.age_rating)) return false
      return novelIndex <= maxIndex
    })

    setAllNovels(ageFiltered)

    if (featuredRows && ageFiltered) {
      const featuredIds = featuredRows.map((f: any) => f.novel_id)
      const featuredNovels = featuredIds
        .map((id: string) => ageFiltered.find((n: any) => n.id === id))
        .filter(Boolean)
      setFeatured(featuredNovels)
    }

    setLoading(false)
  }

  const publishedNovels = allNovels.filter((n) => n.view_count >= 0)

  const filteredNovels = publishedNovels.filter((n) => {
    const matchesGenre = selectedGenre ? (n.genres || []).includes(selectedGenre) : true
    const matchesSearch = search ? n.title.toLowerCase().includes(search.toLowerCase()) : true
    return matchesGenre && matchesSearch
  })

  const readersPick = [...publishedNovels].sort((a, b) => b.view_count - a.view_count)
  const topNovels = [...publishedNovels].sort((a, b) => scoreNovel(b) - scoreNovel(a))

  const currentFeatured = featured[featuredIndex]

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f7]">
      <p className="text-zinc-400 text-sm tracking-widest uppercase animate-pulse">Loading...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#faf9f7] text-zinc-900 font-sans">

      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* Featured Banner (Chosen Pick) */}
        {currentFeatured && (
          <section className="mb-14 relative rounded-2xl overflow-hidden h-72 bg-zinc-900">
            {currentFeatured.cover_image_url && (
              <img
                src={currentFeatured.cover_image_url}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-30"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-900/70 to-transparent" />
            <div className="relative z-10 h-full flex flex-col justify-center px-10">
              <span className="text-xs font-semibold tracking-widest text-amber-400 uppercase mb-3">✦ Chosen Pick</span>
              <h2 className="text-3xl font-bold text-white mb-2 max-w-md">{currentFeatured.title}</h2>
              <p className="text-zinc-300 text-sm max-w-sm line-clamp-2 mb-5">{currentFeatured.synopsis}</p>
              <Link
                href={`/novel/${currentFeatured.id}`}
                className="inline-block bg-white text-zinc-900 text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-zinc-100 transition-colors w-fit"
              >
                Read Now →
              </Link>
            </div>
            {/* Dots */}
            {featured.length > 1 && (
              <div className="absolute bottom-4 right-6 flex gap-1.5">
                {featured.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setFeaturedIndex(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${i === featuredIndex ? 'bg-white' : 'bg-white/30'}`}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* Search + Genre Filter */}
        <div className="mb-10">
          <input
            type="text"
            placeholder="Search novels..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2.5 border border-zinc-200 rounded-full text-sm focus:outline-none focus:border-zinc-500 bg-white mb-5"
          />
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedGenre(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${!selectedGenre ? 'bg-zinc-900 text-white' : 'bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-400'}`}
            >
              All
            </button>
            {GENRES.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGenre(selectedGenre === g ? null : g)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${selectedGenre === g ? 'bg-zinc-900 text-white' : 'bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-400'}`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Filtered results (only shown when searching or genre selected) */}
        {(search || selectedGenre) && (
          <section className="mb-14">
            <h2 className="text-xl font-semibold mb-5">
              {search ? `Results for "${search}"` : selectedGenre}
              <span className="text-zinc-400 text-sm font-normal ml-2">({filteredNovels.length} novels)</span>
            </h2>
            {filteredNovels.length === 0 ? (
              <p className="text-zinc-400 text-sm">No novels found.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredNovels.map((n) => <NovelCard key={n.id} novel={n} />)}
              </div>
            )}
          </section>
        )}

        {/* Recommendation sections (shown when not searching) */}
        {!search && !selectedGenre && (
          <>
            <Section
              title="Reader's Pick"
              subtitle="Most viewed by the community"
              novels={readersPick}
            />
            <Section
              title="Top Novels"
              subtitle="Consistently loved — rising stars and timeless reads"
              novels={topNovels}
            />
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}