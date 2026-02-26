// src/components/Footer.tsx
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-zinc-100 mt-20">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-10 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-10">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1 mb-2 md:mb-0">
            <h3 className="text-base font-bold tracking-tighter mb-3">NOVEL READER</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              A minimalist platform for authors to write their stories and readers to discover their next favorite world.
            </p>
          </div>

          {/* Discover */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-3">Discover</h4>
            <ul className="flex flex-col gap-2">
              <li><Link href="/browse" className="text-xs text-zinc-400 hover:text-zinc-900 transition-colors">Browse Novels</Link></li>
            </ul>
          </div>

          {/* Authors */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-3">Authors</h4>
            <ul className="flex flex-col gap-2">
              <li><Link href="/dashboard" className="text-xs text-zinc-400 hover:text-zinc-900 transition-colors">Dashboard</Link></li>
              <li><Link href="/login" className="text-xs text-zinc-400 hover:text-zinc-900 transition-colors">Sign Up</Link></li>
              <li><Link href="/settings" className="text-xs text-zinc-400 hover:text-zinc-900 transition-colors">Settings</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider mb-3">Legal</h4>
            <ul className="flex flex-col gap-2">
              <li><Link href="/terms" className="text-xs text-zinc-400 hover:text-zinc-900 transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-xs text-zinc-400 hover:text-zinc-900 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/content-policy" className="text-xs text-zinc-400 hover:text-zinc-900 transition-colors">Content Policy</Link></li>
              <li>
                <a href="mailto:support@novelreader.tech" className="text-xs text-zinc-400 hover:text-zinc-900 transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-zinc-100 pt-5 md:pt-6 flex flex-col md:flex-row justify-between items-center gap-2 md:gap-3">
          <p className="text-xs text-zinc-300">© {new Date().getFullYear()} Novel Reader. All rights reserved.</p>
          <p className="text-xs text-zinc-300">
            Made with care for readers and writers everywhere.
          </p>
        </div>
      </div>
    </footer>
  )
}