// src/app/page.tsx
'use client'


import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function Home() {

  useEffect(() => { document.title = 'Novel Reader — Write. Publish. Connect.' }, [])
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const TAGLINES = [
    'A minimalist platform for authors to write their stories and readers to discover their next favorite world.',
    'We handle copyright issues seriously; if you suspect that your novels has been pirated on this website, feel free to contact us.',
    "At Novel Reader, we do not provide third-party advertising. Any ads that you see are for novels and can be disabled in the settings. Isn't that nice?",
    'Have any suggestions for this website? Feel free to reach out and suggest anything!',
    '"In my personal opinion, we have the best payout rates and we do not own the copyright for your novels. That makes us stand out." - Founder of Novel Reader.',
  	'Did you know that there are 8 unique descriptions for this page? Try to find them all!',
  	"A simple website designed for the reader's convenience and the writer's benefit. No tricky clauses, no hidden messages.",
  	'A lot of time and care was placed on this website. Please feel free to explore all its functions and capabilities!',
  ]
  const [tagline, setTagline] = useState('')
  useEffect(() => {
    setTagline(TAGLINES[Math.floor(Math.random() * TAGLINES.length)])
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setIsLoggedIn(true)
    })
  }, [])

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans">
      <Navbar />
      <main className="max-w-4xl mx-auto mt-12 md:mt-24 px-4 md:px-8 text-center">
        <h2 className="text-xl md:text-2xl md:text-3xl md:text-5xl font-semibold leading-tight mb-6">
          Write. Publish. <br /> Connect with readers.
        </h2>
        <p className="text-zinc-500 text-lg mb-10 max-w-xl mx-auto">
          {tagline}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <Link
            href="/browse"
            className="px-4 md:px-8 py-3 bg-white text-zinc-900 border border-zinc-200 rounded font-medium hover:bg-zinc-50 transition-all"
          >
            Browse Novels
          </Link>
          <Link
            href={isLoggedIn ? '/dashboard' : '/login'}
            className="px-4 md:px-8 py-3 bg-black text-white rounded font-medium hover:bg-zinc-800 transition-all"
          >
            Start Writing
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}