// src/app/editor/[chapterId]/page.tsx
'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

const FONTS = [
  { label: 'Lora', value: "'Lora', serif" },
  { label: 'Crimson', value: "'Crimson Text', serif" },
  { label: 'Mono', value: "'Courier Prime', monospace" },
  { label: 'Sans', value: "'DM Sans', sans-serif" },
]

type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error'

export default function Editor() {
  const params = useParams()
  const chapterId = params.chapterId as string
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [novelId, setNovelId] = useState('')
  const [novelAgeRating, setNovelAgeRating] = useState('everyone')
  const [userAge, setUserAge] = useState<number | null>(null)
  const [font, setFont] = useState(FONTS[0].value)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const [wordCount, setWordCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const editorRef = useRef<HTMLDivElement>(null)
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null)

  // Load Google Fonts
  useEffect(() => {
    const link = document.createElement('link')
    link.href = 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,600;1,400&family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Courier+Prime:ital,wght@0,400;1,400&family=DM+Sans:wght@300;400;500&family=DM+Mono&display=swap'
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }, [])

  // Load chapter from Supabase
  useEffect(() => {
    const fetchChapter = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }

      const { data, error } = await supabase
        .from('chapters')
        .select('*, novels(author_id, id, age_rating)')
        .eq('id', chapterId)
        .single()

      if (error || !data) {
        setError('Chapter not found.')
        setLoading(false)
        return
      }

      // Make sure only the author can edit
      if (data.novels.author_id !== session.user.id) {
        router.push('/dashboard')
        return
      }

      setNovelId(data.novels.id)
      setNovelAgeRating(data.novels.age_rating || 'everyone')
      setTitle(data.title || '')

      // Fetch user age for writing restrictions
      const { data: userData } = await supabase
        .from('users')
        .select('date_of_birth')
        .eq('id', session.user.id)
        .single()
      if (userData?.date_of_birth) {
        const age = Math.floor((Date.now() - new Date(userData.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        setUserAge(age)
        // Redirect if trying to edit a novel above their age rating
        const RATING_ORDER = ['everyone', 'teen', 'mature', 'adult']
        const maxRating = age >= 18 ? 'adult' : age >= 17 ? 'mature' : 'teen'
        if (RATING_ORDER.indexOf(data.novels.age_rating || 'everyone') > RATING_ORDER.indexOf(maxRating)) {
          router.push(`/dashboard/${data.novels.id}`)
          return
        }
      }
      if (editorRef.current) {
        editorRef.current.innerHTML = data.content || ''
        updateWordCount(data.content || '')
      }
      setLoading(false)
    }
    fetchChapter()
  }, [chapterId, router])

  const updateWordCount = (html: string) => {
    const text = html.replace(/<[^>]*>/g, ' ').trim()
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0
    setWordCount(words)
  }

  const save = useCallback(async () => {
    if (!editorRef.current) return
    setSaveStatus('saving')
    const content = editorRef.current.innerHTML

    const { error } = await supabase
      .from('chapters')
      .update({ title, content })
      .eq('id', chapterId)

    setSaveStatus(error ? 'error' : 'saved')
  }, [title, chapterId])

  // Auto-save: 2 seconds after user stops typing
  const scheduleAutoSave = () => {
    setSaveStatus('unsaved')
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => save(), 2000)
  }

  const handleEditorInput = () => {
    if (editorRef.current) updateWordCount(editorRef.current.innerHTML)
    scheduleAutoSave()
  }

  // Keyboard shortcut: Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        save()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [save])

  const exec = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    scheduleAutoSave()
  }

  const insertHR = () => {
    exec('insertHTML', '<hr style="border:none;border-top:1px solid #d4d4d4;margin:2rem 0;" /><p><br></p>')
  }

  const statusLabel = {
    saved: '✓ Saved',
    saving: 'Saving...',
    unsaved: 'Unsaved changes',
    error: 'Save failed',
  }

  const statusColor = {
    saved: 'text-zinc-400',
    saving: 'text-zinc-400 animate-pulse',
    unsaved: 'text-amber-500',
    error: 'text-red-500',
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f7]">
      <p className="text-zinc-400 text-sm tracking-widest uppercase">Loading...</p>
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf9f7]">
      <p className="text-red-400 text-sm">{error}</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#faf9f7] flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* Top Bar */}
      <header className="sticky top-0 z-20 bg-[#faf9f7] border-b border-zinc-200">

        {/* Nav row */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-100">
          <div className="flex items-center gap-4">
            <Link
              href={`/dashboard/${novelId}`}
              className="text-xs font-medium text-zinc-400 hover:text-zinc-800 transition-colors tracking-widest uppercase"
            >
              ← Back
            </Link>
            <span className="text-zinc-200">|</span>
            <span className="text-xs tracking-widest uppercase text-zinc-300">Editor</span>
          </div>

          <div className="flex items-center gap-6">
            <span className={`text-xs font-medium transition-colors ${statusColor[saveStatus]}`}>
              {statusLabel[saveStatus]}
            </span>
            <span className="text-xs text-zinc-300">{wordCount.toLocaleString()} words</span>
            <button
              onClick={save}
              className="text-xs font-medium bg-zinc-900 text-white px-4 py-1.5 rounded-full hover:bg-zinc-700 transition-colors"
            >
              Save
            </button>
          </div>
        </div>

        {/* Toolbar row */}
        <div className="flex items-center gap-1 px-6 py-2 overflow-x-auto">
 
          {/* Font picker */}
          <select
            value={font}
            onChange={(e) => setFont(e.target.value)}
            className="text-xs border border-zinc-200 rounded px-2 py-1.5 bg-white text-zinc-700 focus:outline-none focus:border-zinc-400 mr-3"
          >
            {FONTS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>

          <div className="w-px h-5 bg-zinc-200 mx-1" />

          {/* Headings */}
          <ToolButton onClick={() => exec('formatBlock', 'h1')} title="Heading 1">H1</ToolButton>
          <ToolButton onClick={() => exec('formatBlock', 'h2')} title="Heading 2">H2</ToolButton>
          <ToolButton onClick={() => exec('formatBlock', 'h3')} title="Heading 3">H3</ToolButton>
          <ToolButton onClick={() => exec('formatBlock', 'p')} title="Paragraph">¶</ToolButton>

          <div className="w-px h-5 bg-zinc-200 mx-1" />

          {/* Text formatting */}
          <ToolButton onClick={() => exec('bold')} title="Bold"><b>B</b></ToolButton>
          <ToolButton onClick={() => exec('italic')} title="Italic"><i>I</i></ToolButton>
          <ToolButton onClick={() => exec('underline')} title="Underline"><u>U</u></ToolButton>
          <ToolButton onClick={() => exec('strikeThrough')} title="Strikethrough"><s>S</s></ToolButton>

          <div className="w-px h-5 bg-zinc-200 mx-1" />

          {/* Alignment */}
          <ToolButton onClick={() => exec('justifyLeft')} title="Align left">⬤◯◯</ToolButton>
          <ToolButton onClick={() => exec('justifyCenter')} title="Center">◯⬤◯</ToolButton>
          <ToolButton onClick={() => exec('justifyRight')} title="Align right">◯◯⬤</ToolButton>

          <div className="w-px h-5 bg-zinc-200 mx-1" />

          {/* Indent */}
          <ToolButton onClick={() => exec('indent')} title="Indent">→</ToolButton>
          <ToolButton onClick={() => exec('outdent')} title="Outdent">←</ToolButton>

          <div className="w-px h-5 bg-zinc-200 mx-1" />

          {/* Lists */}
          <ToolButton onClick={() => exec('insertUnorderedList')} title="Bullet list">• —</ToolButton>
          <ToolButton onClick={() => exec('insertOrderedList')} title="Numbered list">1.</ToolButton>

          <div className="w-px h-5 bg-zinc-200 mx-1" />

          {/* Divider */}
          <ToolButton onClick={insertHR} title="Insert divider">—</ToolButton>
        </div>
      </header>

      {/* Writing area */}
      <main className="flex-1 flex flex-col items-center px-4 py-12">

        {/* Chapter title */}
        <input
          type="text"
          value={title}
          onChange={(e) => { setTitle(e.target.value); scheduleAutoSave() }}
          placeholder="Chapter Title"
          className="w-full max-w-2xl text-3xl font-semibold bg-transparent border-none outline-none text-zinc-800 placeholder-zinc-300 mb-8 text-center"
          style={{ fontFamily: font }}
        />

        {/* Editor canvas */}
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleEditorInput}
          className="w-full max-w-2xl min-h-[60vh] outline-none text-zinc-800 leading-relaxed focus:outline-none"
          style={{
            fontFamily: font,
            fontSize: '1.075rem',
            lineHeight: '1.9',
          }}
          data-placeholder="Begin your story..."
        />
      </main>

      {/* Placeholder styling */}
      <style jsx global>{`
        [data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #d4d4d4;
          pointer-events: none;
        }
        [contenteditable] h1 { font-size: 2rem; font-weight: 600; margin: 1.5rem 0 0.5rem; line-height: 1.3; }
        [contenteditable] h2 { font-size: 1.5rem; font-weight: 600; margin: 1.25rem 0 0.5rem; line-height: 1.35; }
        [contenteditable] h3 { font-size: 1.2rem; font-weight: 600; margin: 1rem 0 0.4rem; line-height: 1.4; }
        [contenteditable] p  { margin: 0.5rem 0; }
        [contenteditable] ul { list-style: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
        [contenteditable] ol { list-style: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
        [contenteditable] blockquote { border-left: 3px solid #d4d4d4; margin: 1rem 0; padding-left: 1rem; color: #737373; font-style: italic; }
      `}</style>
    </div>
  )
}

function ToolButton({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      title={title}
      className="px-2.5 py-1.5 text-xs text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 rounded transition-colors min-w-[2rem] text-center"
    >
      {children}
    </button>
  )
}