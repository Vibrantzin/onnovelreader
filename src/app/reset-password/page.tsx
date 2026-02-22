// src/app/reset-password/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // When the user clicks the reset link in their email, Supabase
    // redirects here with a session already established in the URL hash.
    // We just need to confirm a session exists.
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setIsValidSession(true)
      } else {
        setIsError(true)
        setMessage('This reset link is invalid or has expired. Please request a new one.')
      }
    }
    checkSession()
  }, [])

  const handleReset = async () => {
    if (!password || !confirmPassword) {
      setIsError(true)
      setMessage('Please fill in both fields.')
      return
    }
    if (password !== confirmPassword) {
      setIsError(true)
      setMessage('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setIsError(true)
      setMessage('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setIsError(true)
      setMessage(error.message)
    } else {
      setIsError(false)
      setMessage('Password updated successfully! Redirecting you to your dashboard...')
      setTimeout(() => router.push('/dashboard'), 2500)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-zinc-900 font-sans">
      <div className="w-full max-w-sm p-8">

        {/* Branding */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold tracking-tighter mb-2">NOVEL READER</h1>
          <p className="text-sm text-zinc-500">Choose a new password for your account.</p>
        </div>

        <div className="flex flex-col gap-4">
          {isValidSession ? (
            <>
              <input
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-zinc-200 rounded-sm focus:outline-none focus:border-zinc-900 transition-colors text-sm"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-zinc-200 rounded-sm focus:outline-none focus:border-zinc-900 transition-colors text-sm"
              />

              {message && (
                <p className={`text-xs text-center py-2 px-3 rounded ${
                  isError ? 'bg-red-50 text-red-600' : 'bg-zinc-50 text-zinc-600'
                }`}>
                  {message}
                </p>
              )}

              <button
                onClick={handleReset}
                disabled={loading}
                className="w-full bg-black text-white py-3 rounded-sm text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 mt-2"
              >
                {loading ? 'Updating...' : 'Update password'}
              </button>
            </>
          ) : (
            <>
              {message && (
                <p className={`text-xs text-center py-2 px-3 rounded ${
                  isError ? 'bg-red-50 text-red-600' : 'bg-zinc-50 text-zinc-600'
                }`}>
                  {message}
                </p>
              )}
              <button
                onClick={() => router.push('/login')}
                className="w-full bg-black text-white py-3 rounded-sm text-sm font-medium hover:bg-zinc-800 transition-colors mt-2"
              >
                Back to log in
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  )
}