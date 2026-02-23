// src/app/content-policy/page.tsx
import Link from 'next/link'
import Footer from '@/components/Footer'

export default function ContentPolicy() {
  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      <nav className="border-b border-zinc-100 px-8 py-5 flex justify-between items-center">
        <Link href="/" className="text-lg font-bold tracking-tighter">NOVEL READER</Link>
        <Link href="/browse" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">Browse</Link>
      </nav>

      <main className="max-w-3xl mx-auto px-8 py-16">
        <h1 className="text-3xl font-bold mb-2">Content Policy</h1>
        <p className="text-sm text-zinc-400 mb-2">Effective date: February 22, 2026</p>
        <p className="text-sm text-zinc-400 mb-10">This policy defines what content is permitted, how content must be labeled, and how violations are handled. All authors publishing on Novel Reader are bound by this policy.</p>

        <div className="space-y-10 text-sm leading-relaxed text-zinc-600">

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">1. Age Rating System</h2>
            <p className="mb-4">Every novel on Novel Reader must be assigned an accurate age rating by the author before publishing. Readers can only access content appropriate for their verified age. Mislabeling content is a serious violation — see Section 7.</p>

            <div className="space-y-3">
              {[
                {
                  icon: '👶',
                  label: 'Everyone',
                  age: 'All ages',
                  color: 'border-green-200 bg-green-50/50',
                  desc: 'Content suitable for all readers regardless of age. No violence beyond mild conflict, no romantic or sexual content, no themes that would be inappropriate for a general audience. Think adventure, lighthearted fantasy, slice-of-life.'
                },
                {
                  icon: '🧒',
                  label: 'Teen (13+)',
                  age: 'Ages 13 and up',
                  color: 'border-blue-200 bg-blue-50/50',
                  desc: 'Mild action and peril, light non-explicit romance, moderate language, and themes relevant to teenage experiences. No graphic violence, no sexual content, no heavy adult themes such as graphic drug use or torture.'
                },
                {
                  icon: '🔞',
                  label: 'Mature (17+)',
                  age: 'Ages 17 and up',
                  color: 'border-amber-200 bg-amber-50/50',
                  desc: 'Moderate violence with some detail, suggestive but non-explicit romantic content, stronger language, and complex or dark themes such as war, psychological horror, addiction, or moral ambiguity. No explicit sexual content.'
                },
                {
                  icon: '🔴',
                  label: 'Adult (18+)',
                  age: 'Ages 18 and up — age verification required',
                  color: 'border-red-200 bg-red-50/50',
                  desc: 'Explicit sexual content, graphic violence, and/or extreme themes. Only accessible to users who have verified their age as 18 or older. All Adult content must still comply with the absolute prohibitions in Section 2.'
                },
              ].map((r) => (
                <div key={r.label} className={`border rounded-xl p-4 ${r.color}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{r.icon}</span>
                    <span className="font-semibold text-zinc-900">{r.label}</span>
                    <span className="text-xs text-zinc-400 ml-1">— {r.age}</span>
                  </div>
                  <p>{r.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">2. Absolute Prohibitions</h2>
            <p className="mb-3">The following content is <strong className="text-zinc-900">never permitted</strong> on Novel Reader under any circumstances, regardless of age rating, fictional framing, or claimed artistic merit. Violations will result in immediate and permanent removal of content and termination of the account, and may be reported to law enforcement.</p>

            <div className="space-y-3">
              <div className="border border-red-200 rounded-xl p-4 bg-red-50/30">
                <p className="font-semibold text-red-700 mb-1">☠️ Child Sexual Abuse Material (CSAM)</p>
                <p>Any sexual content — explicit or suggestive — involving characters who are minors (under 18), regardless of whether the characters are fictional, described as adults, or from a work where ages are ambiguous. This is a zero-tolerance policy. We are legally required to report such content to the National Center for Missing and Exploited Children (NCMEC).</p>
              </div>
              <div className="border border-zinc-200 rounded-xl p-4">
                <p className="font-semibold text-zinc-800 mb-1">Violence promotion</p>
                <p>Content that instructs, promotes, or glorifies real-world violence, terrorism, or mass harm against actual people or groups — not fictional violence within a story, but content designed to incite or enable real harm.</p>
              </div>
              <div className="border border-zinc-200 rounded-xl p-4">
                <p className="font-semibold text-zinc-800 mb-1">Doxxing & privacy violations</p>
                <p>Sharing or publishing private, personally identifiable information about real individuals without their consent, including home addresses, phone numbers, financial information, or private communications.</p>
              </div>
              <div className="border border-zinc-200 rounded-xl p-4">
                <p className="font-semibold text-zinc-800 mb-1">Targeted harassment</p>
                <p>Content specifically designed to harass, threaten, intimidate, or demean a specific real individual. This includes repeated unwanted contact and content designed to coordinate harassment campaigns.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">3. Originality & Plagiarism</h2>
            <p>All content published on Novel Reader must be your own original work or content you have explicit permission to publish. The following are strictly prohibited:</p>
            <ul className="mt-3 list-disc list-inside space-y-2 marker:text-zinc-300">
              <li>Copying another author's work — in whole or in part — and presenting it as your own, whether from Novel Reader or any external source.</li>
              <li>Reproducing substantial portions of copyrighted works without permission or a valid fair use basis.</li>
              <li>Scraping or reposting content from other platforms without the original author's explicit consent.</li>
            </ul>
            <p className="mt-3">If you have been inspired by or are continuing a work with a co-author's permission, clearly state this in your novel's synopsis. Plagiarism reports can be sent to <a href="mailto:support@novelreader.tech" className="text-zinc-900 underline">support@novelreader.tech</a> with evidence and we will investigate promptly.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">4. AI-Generated Content</h2>
            <p>We permit the publication of AI-generated or AI-assisted content on Novel Reader, subject to the following requirements:</p>
            <ul className="mt-3 list-disc list-inside space-y-2 marker:text-zinc-300">
              <li><strong className="text-zinc-700">Disclosure is mandatory.</strong> If your novel or any chapters were substantially written by an AI tool (such as ChatGPT, Claude, Gemini, or similar), you must clearly state this in your novel's synopsis or a note at the start of the work. Presenting AI-generated content as entirely human-written is considered a form of deception and may result in content removal.</li>
              <li>AI-assisted content — where AI helped with editing, brainstorming, or rewrites but the core writing is human — does not require disclosure, but disclosure is encouraged.</li>
              <li>AI-generated content must comply with all other rules in this Content Policy, including age ratings and absolute prohibitions.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">5. Fan Fiction</h2>
            <p>Fan fiction — creative works based on existing intellectual properties, characters, or worlds — is welcome on Novel Reader, provided:</p>
            <ul className="mt-3 list-disc list-inside space-y-2 marker:text-zinc-300">
              <li>The work is clearly labeled as fan fiction in the synopsis or tags.</li>
              <li>The work is not presented as an official or authorised continuation of the source material.</li>
              <li>The work does not reproduce substantial verbatim text from the original copyrighted work.</li>
              <li>If a rights holder sends a valid takedown request for their IP, we will comply and remove the relevant fan fiction.</li>
            </ul>
            <p className="mt-3">Fan fiction featuring sexual content involving characters who are canonically or ambiguously minors is prohibited regardless of how the author ages them up in the story.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">6. Copyright & DMCA Takedowns</h2>
            <p>If you believe content on Novel Reader infringes your copyright, send a DMCA notice to <a href="mailto:support@novelreader.tech" className="text-zinc-900 underline">support@novelreader.tech</a> including:</p>
            <ul className="mt-3 list-disc list-inside space-y-1 marker:text-zinc-300">
              <li>Identification of the copyrighted work claimed to be infringed.</li>
              <li>The URL of the allegedly infringing content on Novel Reader.</li>
              <li>Your contact information (name, email, address).</li>
              <li>A statement of good-faith belief that the use is not authorised by the copyright owner.</li>
              <li>A statement, under penalty of perjury, that the information is accurate and you are authorised to act.</li>
            </ul>
            <p className="mt-3">We will investigate and respond within 5 business days. Authors who receive takedowns may submit a counter-notice if they believe the takedown was filed in error.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">7. Enforcement</h2>
            <p className="mb-3">We take a graduated approach to enforcement based on the severity and frequency of violations. Actions we may take include:</p>
            <div className="space-y-2">
              {[
                { label: '⚠️ Warning', desc: 'A formal notice that a rule has been violated. No immediate restrictions, but further violations will result in escalating action.' },
                { label: '🚫 Posting Ban', desc: 'The account is restricted from publishing or editing novels. Reading and account access are unaffected.' },
                { label: '⏸ Suspension', desc: 'The account is temporarily disabled. Duration ranges from days to indefinite depending on the violation.' },
                { label: '☠️ Permanent Ban', desc: 'The account is permanently and irrevocably disabled. Applied for the most serious violations or for repeat offenders.' },
              ].map((a) => (
                <div key={a.label} className="flex gap-3 border border-zinc-100 rounded-xl p-4">
                  <span className="font-semibold text-zinc-800 w-36 shrink-0">{a.label}</span>
                  <span>{a.desc}</span>
                </div>
              ))}
            </div>
            <p className="mt-4">Absolute prohibition violations (Section 2) — particularly CSAM — will always result in immediate permanent ban and referral to appropriate authorities, with no warnings issued.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">8. Appeals</h2>
            <p>If your content has been removed or your account has been actioned and you believe it was in error, you may appeal by emailing <a href="mailto:support@novelreader.tech" className="text-zinc-900 underline">support@novelreader.tech</a> with the subject line "Appeal" and a clear explanation of why you believe the action was incorrect. We will review all appeals within 7 business days. Appeals regarding CSAM violations will not be considered.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">9. Reporting Violations</h2>
            <p>If you encounter content that violates this policy, please report it to <a href="mailto:support@novelreader.tech" className="text-zinc-900 underline">support@novelreader.tech</a> with the novel title, the URL, and a brief description of the violation. We investigate all reports and take appropriate action. Reports are kept confidential.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">10. Changes to This Policy</h2>
            <p>We may update this Content Policy from time to time. We will notify users of material changes via an in-app notification and update the effective date above. Continued use of the platform after changes take effect constitutes acceptance of the updated policy.</p>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  )
}