// src/app/login/page.tsx
'use client'


import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type View = 'login' | 'signup' | 'forgot'

export default function Login() {

  useEffect(() => { document.title = 'Sign In | Novel Reader' }, [])
  const [view, setView] = useState<View>('login')
  const [email, setEmail] = useState('')
  const [statusMsg, setStatusMsg] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [dob, setDob] = useState('')
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) router.push('/dashboard')
    }
    checkUser()
  }, [router])

  const switchView = (newView: View) => {
    setView(newView)
    setMessage('')
    setIsError(false)
    setPassword('')
    setConfirmPassword('')
  }

  const showError = (msg: string) => { setMessage(msg); setIsError(true) }
  const showSuccess = (msg: string) => { setMessage(msg); setIsError(false) }

  const handleLogin = async () => {
    if (!email || !password) return showError('Please fill in all fields.')
    setLoading(true)
    setMessage('')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      showError(error.message.toLowerCase().includes('invalid login') ? 'Incorrect email or password.' : error.message)
    } else if (data.user) {
      router.push('/dashboard')
    }
    setLoading(false)
  }

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) return showError('Please fill in all fields.')
    if (!dob) return showError('Please enter your date of birth.')
    const age = Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    if (age < 13) return showError('You must be at least 13 years old to create an account.')
    if (password !== confirmPassword) return showError('Passwords do not match.')
    if (password.length < 6) return showError('Password must be at least 6 characters.')

    setLoading(true)
    setMessage('')

    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      showError(
        error.message.toLowerCase().includes('already') ? 'An account with this email already exists.' : error.message
      )
    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
      showError('An account with this email already exists.')
    } else {
      // Save DOB and age_verified status
      if (data.user) {
        const age = Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        await supabase.from('users').update({
          date_of_birth: dob,
          age_verified: age >= 18,
        }).eq('id', data.user.id)
      }
      showSuccess('Account created! Check your email to verify your account.')
    }
    setLoading(false)
  }

  const handleForgotPassword = async () => {
    if (!email) return showError('Please enter your email address.')
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) { showError(error.message) }
    else { showSuccess('Password reset link sent! Check your email.') }
    setLoading(false)
  }

  const handleOAuth = async (provider: 'google' | 'github') => {
    setOauthLoading(provider)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })
    if (error) {
      showError(error.message)
      setOauthLoading(null)
    }
    // On success Supabase redirects automatically — no need to clear loading
  }

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleSubmit() }

  const handleSubmit = () => {
    if (view === 'login') handleLogin()
    else if (view === 'signup') handleSignup()
    else handleForgotPassword()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-zinc-900 font-sans px-4">
      <div className="w-full max-w-sm p-6 md:p-8">

        {statusMsg && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-4 py-4 text-center">
            <p className="text-sm font-semibold text-red-700 mb-1">Account Restricted</p>
            <p className="text-xs text-red-500">{statusMsg}</p>
          </div>
        )}

        {/* Branding */}
        <div className="text-center mb-10">
          <h1 className="text-xl md:text-xl md:text-2xl font-bold tracking-tighter mb-2">NOVEL READER</h1>
          <p className="text-sm text-zinc-500">
            {view === 'login' && 'Welcome back to your stories.'}
            {view === 'signup' && 'Create your account to start writing.'}
            {view === 'forgot' && "We'll send you a reset link."}
          </p>
        </div>

        <div className="flex flex-col gap-4">

          {/* OAuth buttons — shown on login + signup only */}
          {view !== 'forgot' && (
            <>
              <button
                onClick={() => handleOAuth('google')}
                disabled={!!oauthLoading}
                className="w-full flex items-center justify-center gap-3 border border-zinc-200 py-3 rounded-sm text-sm font-medium hover:bg-zinc-50 transition-colors disabled:opacity-50"
              >
                {oauthLoading === 'google' ? 'Redirecting...' : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>

              <button
                onClick={() => handleOAuth('github')}
                disabled={!!oauthLoading}
                className="w-full flex items-center justify-center gap-3 border border-zinc-200 py-3 rounded-sm text-sm font-medium hover:bg-zinc-50 transition-colors disabled:opacity-50"
              >
                {oauthLoading === 'github' ? 'Redirecting...' : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                    Continue with GitHub
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-zinc-100" />
                <span className="text-xs text-zinc-400">or</span>
                <div className="flex-1 h-px bg-zinc-100" />
              </div>
            </>
          )}

          {/* Email */}
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
              className="w-full px-4 py-3 border border-zinc-200 rounded-sm focus:outline-none focus:border-zinc-900 transition-colors text-sm"
          />

          {/* Password */}
          {view !== 'forgot' && (
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-3 border border-zinc-200 rounded-sm focus:outline-none focus:border-zinc-900 transition-colors text-sm"
            />
          )}

          {/* Confirm password */}
          {view === 'signup' && (
            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-4 py-3 border border-zinc-200 rounded-sm focus:outline-none focus:border-zinc-900 transition-colors text-sm"
            />
          )}

          {/* Date of birth */}
          {view === 'signup' && (
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                onKeyDown={handleKeyDown}
              className="w-full px-4 py-3 border border-zinc-200 rounded-sm focus:outline-none focus:border-zinc-900 transition-colors text-sm"
              />
              <p className="text-xs text-zinc-300 mt-1">Required. Used to verify your age for mature content.</p>
            </div>
          )}

          {/* Message */}
          {message && (
            <p className={`text-xs text-center py-2 px-3 rounded ${isError ? 'bg-red-50 text-red-600' : 'bg-zinc-50 text-zinc-600'}`}>
              {message}
            </p>
          )}

          {/* Forgot link */}
          {view === 'login' && (
            <button
              onClick={() => switchView('forgot')}
              className="text-xs text-zinc-400 hover:text-zinc-700 text-right transition-colors"
            >
              Forgot your password?
            </button>
          )}

          {/* Primary action */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-sm text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Processing...' : view === 'login' ? 'Log in' : view === 'signup' ? 'Create account' : 'Send reset link'}
          </button>

          {/* View switchers */}
          <div className="flex flex-col gap-2 mt-2">
            {view === 'login' && (
              <button onClick={() => switchView('signup')} className="w-full bg-white text-zinc-900 border border-zinc-200 py-3 rounded-sm text-sm font-medium hover:bg-zinc-50 transition-colors">
                Create account
              </button>
            )}
            {view === 'signup' && (
              <button onClick={() => switchView('login')} className="w-full bg-white text-zinc-900 border border-zinc-200 py-3 rounded-sm text-sm font-medium hover:bg-zinc-50 transition-colors">
                Already have an account? Log in
              </button>
            )}
            {view === 'forgot' && (
              <button onClick={() => switchView('login')} className="w-full bg-white text-zinc-900 border border-zinc-200 py-3 rounded-sm text-sm font-medium hover:bg-zinc-50 transition-colors">
                Back to log in
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}