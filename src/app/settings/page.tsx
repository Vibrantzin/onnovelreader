// src/app/settings/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Settings() {
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Profile
  const [username, setUsername] = useState('')
  const [dob, setDob] = useState('')
  const [ageVerified, setAgeVerified] = useState(false)
  const [savingDob, setSavingDob] = useState(false)
  const [dobMsg, setDobMsg] = useState('')
  const [showDobBanner, setShowDobBanner] = useState(false)
  const [originalUsername, setOriginalUsername] = useState('')
  const [savingUsername, setSavingUsername] = useState(false)
  const [usernameMsg, setUsernameMsg] = useState('')
  const [usernameError, setUsernameError] = useState(false)

  // Password
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState('')
  const [passwordError, setPasswordError] = useState(false)

  // Delete account
  const [deletingAccount, setDeletingAccount] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/login'); return }
      setSession(session)

      const { data: userData } = await supabase
        .from('users')
        .select('username, date_of_birth, age_verified')
        .eq('id', session.user.id)
        .single()

      if (userData) {
        setUsername(userData.username)
        setOriginalUsername(userData.username)
        setDob(userData.date_of_birth || '')
        setAgeVerified(userData.age_verified || false)
        if (!userData.date_of_birth) setShowDobBanner(true)
      }
      setLoading(false)
    }
    fetchUser()
  }, [router])

  const handleSaveDob = async () => {
    if (!dob) { setDobMsg('Please select your date of birth.'); return }
    setSavingDob(true)
    const age = Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    if (age < 13) { setDobMsg('You must be at least 13 years old.'); setSavingDob(false); return }
    const { error } = await supabase.from('users').update({
      date_of_birth: dob,
      age_verified: age >= 18,
    }).eq('id', session.user.id)
    if (error) { setDobMsg(error.message) }
    else {
      setAgeVerified(age >= 18)
      setShowDobBanner(false)
      setDobMsg(age >= 18 ? 'Age verified! You can now access mature content.' : 'Date of birth saved.')
    }
    setSavingDob(false)
  }

  const handleSaveUsername = async () => {
    if (!username.trim()) { setUsernameError(true); setUsernameMsg('Username cannot be empty.'); return }
    if (username === originalUsername) { setUsernameError(false); setUsernameMsg('That is already your username.'); return }
    if (username.length < 3) { setUsernameError(true); setUsernameMsg('Username must be at least 3 characters.'); return }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) { setUsernameError(true); setUsernameMsg('Only letters, numbers, and underscores allowed.'); return }

    setSavingUsername(true)
    setUsernameMsg('')

    const { error } = await supabase
      .from('users')
      .update({ username })
      .eq('id', session.user.id)

    if (error) {
      setUsernameError(true)
      setUsernameMsg(error.message.includes('unique') ? 'That username is already taken.' : error.message)
    } else {
      setUsernameError(false)
      setOriginalUsername(username)
      setUsernameMsg('Username updated successfully!')
    }
    setSavingUsername(false)
  }

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) { setPasswordError(true); setPasswordMsg('Please fill in both fields.'); return }
    if (newPassword !== confirmPassword) { setPasswordError(true); setPasswordMsg('Passwords do not match.'); return }
    if (newPassword.length < 6) { setPasswordError(true); setPasswordMsg('Password must be at least 6 characters.'); return }

    setSavingPassword(true)
    setPasswordMsg('')

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setPasswordError(true)
      setPasswordMsg(error.message)
    } else {
      setPasswordError(false)
      setPasswordMsg('Password updated successfully!')
      setNewPassword('')
      setConfirmPassword('')
    }
    setSavingPassword(false)
  }

  const handleDeleteAccount = async () => {
    const confirmed = window.prompt(
      'This will permanently delete your account and all your novels. Type DELETE to confirm:'
    )
    if (confirmed !== 'DELETE') {
      if (confirmed !== null) alert('Confirmation did not match. Account was not deleted.')
      return
    }

    setDeletingAccount(true)
    // Sign out first, then the user row deletion cascades via DB
    await supabase.from('users').delete().eq('id', session.user.id)
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <p className="text-zinc-400 text-sm">Loading...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 pb-20">
      <header className="bg-white border-b border-zinc-200 px-8 py-5 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold tracking-tighter">NOVEL READER</Link>
          <nav className="flex items-center gap-5 text-sm font-medium text-zinc-500">
            <Link href="/browse" className="hover:text-zinc-900 transition-colors">Browse</Link>
            <Link href="/dashboard" className="hover:text-zinc-900 transition-colors">Dashboard</Link>
            <Link href="/settings" className="text-zinc-900 border-b border-zinc-900">Settings</Link>
          </nav>
        </div>
        <button
          onClick={async () => { await supabase.auth.signOut(); router.push('/') }}
          className="text-sm font-medium bg-zinc-100 px-4 py-2 rounded hover:bg-zinc-200 transition-colors"
        >
          Sign Out
        </button>
      </header>

      <main className="max-w-xl mx-auto mt-12 px-8">
        <h1 className="text-3xl font-semibold mb-10">User Settings</h1>

        {/* DOB banner for existing users */}
        {showDobBanner && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6 flex items-start gap-3">
            <span className="text-xl">🔞</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800 mb-1">Please verify your age</p>
              <p className="text-xs text-amber-600 mb-3">We need your date of birth to determine which content you can access. This is required for mature content.</p>
              <div className="flex gap-3 items-end flex-wrap">
                <div>
                  <label className="text-xs text-amber-700 block mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="px-3 py-2 border border-amber-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 bg-white"
                  />
                </div>
                <button
                  onClick={handleSaveDob}
                  disabled={savingDob}
                  className="bg-amber-500 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-amber-600 disabled:opacity-50 transition-colors"
                >
                  {savingDob ? 'Saving...' : 'Verify Age'}
                </button>
              </div>
              {dobMsg && <p className="text-xs text-amber-700 mt-2">{dobMsg}</p>}
            </div>
          </div>
        )}

        {/* Username */}
        <section className="bg-white border border-zinc-200 rounded-xl p-6 mb-6">
          <h2 className="text-base font-semibold mb-1">Username</h2>
          <p className="text-sm text-zinc-400 mb-4">This is how other readers will see you.</p>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-zinc-500 mb-3"
          />
          {usernameMsg && (
            <p className={`text-xs mb-3 ${usernameError ? 'text-red-500' : 'text-green-600'}`}>{usernameMsg}</p>
          )}
          <button
            onClick={handleSaveUsername}
            disabled={savingUsername}
            className="bg-zinc-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-zinc-700 disabled:opacity-50 transition-colors"
          >
            {savingUsername ? 'Saving...' : 'Save Username'}
          </button>
        </section>

        {/* Email (read-only) */}
        <section className="bg-white border border-zinc-200 rounded-xl p-6 mb-6">
          <h2 className="text-base font-semibold mb-1">Email</h2>
          <p className="text-sm text-zinc-400 mb-4">Your account email address.</p>
          <input
            type="email"
            value={session?.user?.email || ''}
            disabled
            className="w-full px-4 py-2.5 border border-zinc-100 rounded-lg text-sm bg-zinc-50 text-zinc-400 cursor-not-allowed"
          />
        </section>

        {/* Date of Birth */}
        <section className="bg-white border border-zinc-200 rounded-xl p-6 mb-6">
          <h2 className="text-base font-semibold mb-1">Date of Birth</h2>
          <p className="text-sm text-zinc-400 mb-4">
            Used to verify your age for mature content.
            {ageVerified && <span className="text-green-600 font-medium"> ✓ Age verified (18+)</span>}
          </p>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-zinc-500 mb-3"
          />
          {dobMsg && <p className={`text-xs mb-3 ${dobMsg.includes('verified') ? 'text-green-600' : 'text-zinc-500'}`}>{dobMsg}</p>}
          <button
            onClick={handleSaveDob}
            disabled={savingDob}
            className="bg-zinc-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-zinc-700 disabled:opacity-50 transition-colors"
          >
            {savingDob ? 'Saving...' : 'Save Date of Birth'}
          </button>
        </section>

        {/* Change Password */}
        <section className="bg-white border border-zinc-200 rounded-xl p-6 mb-6">
          <h2 className="text-base font-semibold mb-1">Change Password</h2>
          <p className="text-sm text-zinc-400 mb-4">Choose a new password for your account.</p>
          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-zinc-500 mb-3"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2.5 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:border-zinc-500 mb-3"
          />
          {passwordMsg && (
            <p className={`text-xs mb-3 ${passwordError ? 'text-red-500' : 'text-green-600'}`}>{passwordMsg}</p>
          )}
          <button
            onClick={handleChangePassword}
            disabled={savingPassword}
            className="bg-zinc-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-zinc-700 disabled:opacity-50 transition-colors"
          >
            {savingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </section>

        {/* Danger zone */}
        <section className="bg-white border border-red-100 rounded-xl p-6">
          <h2 className="text-base font-semibold text-red-500 mb-1">Danger Zone</h2>
          <p className="text-sm text-zinc-400 mb-4">
            Permanently delete your account, all your novels, and chapters. This cannot be undone.
          </p>
          <button
            onClick={handleDeleteAccount}
            disabled={deletingAccount}
            className="text-sm font-medium text-red-500 border border-red-200 px-5 py-2 rounded-full hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            {deletingAccount ? 'Deleting...' : 'Delete My Account'}
          </button>
        </section>
      </main>
    </div>
  )
}