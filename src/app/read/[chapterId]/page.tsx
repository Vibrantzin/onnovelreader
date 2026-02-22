// src/app/read/[chapterId]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

const FONTS = [
  { label: 'Lora', value: "'Lora', serif" },
  { label: 'Crimson', value: "'Crimson Text', serif" },
  { label: 'Mono', value: "'Courier Prime', monospace" },
  { label: 'Sans', value: "'DM Sans', sans-serif" },
]

export default function ReadChapter() {
  const params = useParams()
  const chapterId = params.chapterId as string
  const router = useRouter()

  const [chapter, setChapter] = useState<any>(null)
  const [novel, setNovel] = useState<any>(null)
  const [allChapters, setAllChapters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [font, setFont] = useState(FONTS[0].value)
  const [fontSize, setFontSize] = useState(17)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Courier+Prime:ital,wght@0,400;1,400&family=DM+Sans:wght@300;400;500&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }, [])

  useEffect(() => {
    fetchChapter()
  }, [chapterId])

  const fetchChapter = async () => {
    setLoading(true)
    const { data: chapter } = await supabase
      .from('chapters')
      .select('*, novels(id, title)')
      .eq('id', chapterId)
      .eq('is_published', true)
      .single()

    if (!chapter) { router.push('/browse'); return }
    setChapter(chapter)
    setNovel(chapter.novels)

    const { data: allChapters } = await supabase
      .from('chapters')
      .select('id, chapter_number, title, is_published')
      .eq('novel_id', chapter.novels.id)
      .eq('is_published', true)
      .order('chapter_number', { ascending: true })

    setAllChapters(allChapters || [])
    setLoading(false)
    window.scrollTo(0, 0)
  }

  const currentIndex = allChapters.findIndex((c) => c.id === chapterId)
  const prevChapter = allChapters[currentIndex - 1]
  const nextChapter = allChapters[currentIndex + 1]

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f7]">
      <p className="text-zinc-400 text-sm tracking-widest uppercase animate-pulse">Loading...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#faf9f7]" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-[#faf9f7]/95 backdrop-blur border-b border-zinc-200">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Link href={`/novel/${novel?.id}`} className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors shrink-0">
              ← {novel?.title}
            </Link>
            <span className="text-zinc-200 shrink-0">|</span>
            <span className="text-xs text-zinc-400 truncate">
              Ch. {chapter.chapter_number}{chapter.title ? ` — ${chapter.title}` : ''}
            </span>
          </div>

          {/* Settings toggle */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors ml-4 shrink-0"
          >
            Aa
          </button>
        </div>

        {/* Reading settings panel */}
        {showSettings && (
          <div className="border-t border-zinc-100 bg-white px-6 py-4">
            <div className="max-w-3xl mx-auto flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Font</span>
                {FONTS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setFont(f.value)}
                    style={{ fontFamily: f.value }}
                    className={`text-xs px-3 py-1.5 rounded border transition-colors ${font === f.value ? 'border-zinc-900 text-zinc-900' : 'border-zinc-200 text-zinc-400 hover:border-zinc-400'}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">Size</span>
                <button onClick={() => setFontSize((s) => Math.max(13, s - 1))} className="text-xs px-2 py-1 border border-zinc-200 rounded hover:border-zinc-400">−</button>
                <span className="text-xs text-zinc-500 w-6 text-center">{fontSize}</span>
                <button onClick={() => setFontSize((s) => Math.min(24, s + 1))} className="text-xs px-2 py-1 border border-zinc-200 rounded hover:border-zinc-400">+</button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Chapter content */}
      <article className="max-w-2xl mx-auto px-6 py-14">
        <h1
          className="text-2xl font-semibold text-zinc-800 mb-10 text-center"
          style={{ fontFamily: font }}
        >
          {chapter.title || `Chapter ${chapter.chapter_number}`}
        </h1>

        <div
          className="prose prose-zinc max-w-none"
          style={{ fontFamily: font, fontSize: `${fontSize}px`, lineHeight: '1.95' }}
          dangerouslySetInnerHTML={{ __html: chapter.content || '<p>This chapter has no content yet.</p>' }}
        />
      </article>

      {/* Chapter navigation */}
      <div className="max-w-2xl mx-auto px-6 pb-20 flex justify-between items-center border-t border-zinc-200 pt-8">
        {prevChapter ? (
          <Link
            href={`/read/${prevChapter.id}`}
            className="flex flex-col items-start group"
          >
            <span className="text-xs text-zinc-400 mb-1">← Previous</span>
            <span className="text-sm font-medium text-zinc-700 group-hover:text-black transition-colors">
              Ch. {prevChapter.chapter_number}{prevChapter.title ? `: ${prevChapter.title}` : ''}
            </span>
          </Link>
        ) : <div />}

        {nextChapter ? (
          <Link
            href={`/read/${nextChapter.id}`}
            className="flex flex-col items-end group"
          >
            <span className="text-xs text-zinc-400 mb-1">Next →</span>
            <span className="text-sm font-medium text-zinc-700 group-hover:text-black transition-colors">
              Ch. {nextChapter.chapter_number}{nextChapter.title ? `: ${nextChapter.title}` : ''}
            </span>
          </Link>
        ) : (
          <Link href={`/novel/${novel?.id}`} className="text-sm font-medium text-zinc-500 hover:text-black transition-colors">
            Back to novel →
          </Link>
        )}
      </div>
    </div>
  )
}