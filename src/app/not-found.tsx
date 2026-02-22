// src/app/not-found.tsx
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-zinc-900 font-sans gap-4">
      <h1 className="text-6xl font-bold text-zinc-200">404</h1>
      <p className="text-zinc-500 text-sm">This page could not be found.</p>
      <Link href="/" className="text-sm text-zinc-900 underline">
        Go home
      </Link>
    </div>
  )
}