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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setIsLoggedIn(true)
    })
  }, [])

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans">
      <Navbar />
      <main className="max-w-4xl mx-auto mt-24 px-8 text-center">
        <h2 className="text-5xl font-semibold leading-tight mb-6">
          Write. Publish. <br /> Connect with readers.
        </h2>
        <p className="text-zinc-500 text-lg mb-10 max-w-xl mx-auto">
          A minimalist space for authors to craft their stories and readers to discover their next favorite world.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/browse"
            className="px-8 py-3 bg-white text-zinc-900 border border-zinc-200 rounded font-medium hover:bg-zinc-50 transition-all"
          >
            Browse Novels
          </Link>
          <Link
            href={isLoggedIn ? '/dashboard' : '/login'}
            className="px-8 py-3 bg-black text-white rounded font-medium hover:bg-zinc-800 transition-all"
          >
            Start Writing
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}