// src/components/AgeGate.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const NSFW_GENRES = [
  'Adult', 'Ecchi', 'Harem', 'Mature', 'Smut', 'Yaoi', 'Yuri',
  'Shoujo Ai', 'Shounen Ai', 'LGBT+', 'Gender Bender'
]

export function isNSFW(genres: string[], ageRating?: string): boolean {
  if (ageRating === 'adult' || ageRating === 'mature') return true
  return (genres || []).some((g) => NSFW_GENRES.includes(g))
}

type Props = {
  onVerified: () => void
  onDeclined: () => void
}

export default function AgeGate({ onVerified, onDeclined }: Props) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-8 text-center shadow-2xl">
        <div className="text-4xl mb-4">🔞</div>
        <h2 className="text-xl font-bold text-zinc-900 mb-2">Mature Content</h2>
        <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
          This novel contains mature or adult content. You must be 18 or older to access it.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onVerified}
            className="w-full bg-zinc-900 text-white py-3 rounded-full text-sm font-semibold hover:bg-zinc-700 transition-colors"
          >
            I am 18 or older — Continue
          </button>
          <button
            onClick={onDeclined}
            className="w-full bg-white text-zinc-500 border border-zinc-200 py-3 rounded-full text-sm font-medium hover:bg-zinc-50 transition-colors"
          >
            I am under 18 — Go back
          </button>
        </div>
        <p className="text-xs text-zinc-300 mt-4">
          By continuing you confirm you are of legal age in your jurisdiction.
        </p>
      </div>
    </div>
  )
}