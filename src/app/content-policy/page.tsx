// src/app/content-policy/page.tsx
import Link from 'next/link'
import Footer from '@/components/Footer'

export default function ContentPolicy() {
  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      <nav className="border-b border-zinc-100 px-4 md:px-8 py-4 md:py-5 flex justify-between items-center">
        <Link href="/" className="text-base md:text-lg font-bold tracking-tighter">NOVEL READER</Link>
        <Link href="/browse" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">Browse</Link>
      </nav>

      <main className="max-w-3xl mx-auto px-4 md:px-8 py-10 md:py-16">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Content Policy</h1>
        <p className="text-sm text-zinc-400 mb-2">Last Updated: February 23, 2026</p>
        <p className="text-sm text-zinc-400 mb-10">This policy defines what content is permitted, how content must be labeled/handled, and how violations are managed by us. All authors publishing on Novel Reader are bound by this policy.</p>

        <div className="space-y-10 text-sm leading-relaxed text-zinc-600">

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">1. Age Rating System</h2>
            <p className="mb-4">Every novel on Novel Reader must be assigned an accurate age rating by the author before publishing. Readers can only access content appropriate for their age group. Mislabeling content is a serious violation, see Section 7.</p>

            <div className="space-y-3">
              {[
                {
                  icon: '👶',
                  label: 'Everyone',
                  age: 'All ages',
                  color: 'border-green-200 bg-green-50/50',
                  desc: 'This includes content suitable for all readers regardless of age. No violence beyond mild conflict, no romantic or sexual content, and no themes that would be inappropriate for a general audience. These include but are not limited to genres like adventure, fantasy, and slice-of-life.'
                },
                {
                  icon: '🧒',
                  label: 'Teen (13+)',
                  age: 'Ages 13 and up',
                  color: 'border-blue-200 bg-blue-50/50',
                  desc: 'There is mild action and danger, like: light and non-explicit romance, moderate language, and themes relevant to teenage experiences. There are no graphic violence, no sexual content, and no heavy adult themes such as graphic drug use or torture.'
                },
                {
                  icon: '🔞',
                  label: 'Mature (17+)',
                  age: 'Ages 17 and up',
                  color: 'border-amber-200 bg-amber-50/50',
                  desc: 'There may be moderate violence with some detail, suggestive but non-explicit romantic content, stronger language, and complex or dark themes such as war, psychological horror, addiction, or moral ambiguity. There may not be explicit sexual content.'
                },
                {
                  icon: '🔴',
                  label: 'Adult (18+)',
                  age: 'Ages 18 and up — age verification required',
                  color: 'border-red-200 bg-red-50/50',
                  desc: 'There is explicit sexual content, graphic violence, and/or extreme themes. This is only accessible to users who have verified their age as 18 or older. All adult content must comply with the prohibitions outlined in Section 2.'
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
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">2. Prohibitions and Limitations</h2>
            <p className="mb-3">The following content is <strong className="text-zinc-900">never permitted</strong> on Novel Reader under any circumstances, regardless of age rating, disclaimers, fictional framing, or claimed artistic merit. Violations will result in immediate and permanent removal of content and termination of the account, and may be reported to law enforcement if necessary.</p>

            <div className="space-y-3">
              <div className="border border-red-200 rounded-xl p-4 bg-red-50/30">
                <p className="font-semibold text-red-700 mb-1">☠️ Child Sexual Abuse Material, otherwise known as Child Porn (CSAM/CP)</p>
                <p>Any sexual content, explicit or suggestive, involving characters who are minors (under 18), regardless of whether the characters are fictional, described as adults, or from a work where ages are ambiguous. This is a zero-tolerance policy and we are legally required to report such content to the National Center for Missing and Exploited Children (NCMEC).</p>
              </div>
              <div className="border border-zinc-200 rounded-xl p-4">
                <p className="font-semibold text-zinc-800 mb-1">Violence promotion</p>
                <p>Content that instructs, promotes, or glorifies real-world violence, terrorism, or mass-harm against actual people or groups; which does not include fictional violence within a story, but content designed to incite or enable harm.</p>
              </div>
              <div className="border border-zinc-200 rounded-xl p-4">
                <p className="font-semibold text-zinc-800 mb-1">Doxxing & privacy violations</p>
                <p>Sharing or publishing private and/or personally identifiable information about real individuals without their consent, including but not limited to, home addresses, phone numbers, financial information, or private communications.</p>
              </div>
              <div className="border border-zinc-200 rounded-xl p-4">
                <p className="font-semibold text-zinc-800 mb-1">Targeted harassment</p>
                <p>Content specifically designed to harass, threaten, intimidate, or demean a real individual. This includes repeated unwanted contact and content designed to coordinate harassment campaigns (yes, even if they're popular).</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">3. Originality & Plagiarism</h2>
            <p>All content published on Novel Reader must be your own original work or content that you have explicit permission to publish. The following are strictly prohibited:</p>
            <ul className="mt-3 list-disc list-inside space-y-2 marker:text-zinc-300">
              <li>Copying another author's work, whether in whole or in part, and presenting it as your own, either from Novel Reader or any external source.</li>
              <li>Reproducing portions of copyrighted works without permission or a valid fair use basis, such as limited quantities with appropriate citation.</li>
              <li>Scraping or reposting content from other platforms without the original author's explicit consent.</li>
            </ul>
            <p className="mt-3">If you have been inspired by or are continuing a work with the author's permission, clearly state this in your novel's synopsis. Plagiarism reports can be sent to us at <a href="mailto:support@novelreader.tech" className="text-zinc-900 underline">support@novelreader.tech</a> with evidence and will be investigated promptly.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">4. AI-Generated Content</h2>
            <p>We permit the publication of AI-generated or AI-assisted content on Novel Reader, although subject to the following requirements:</p>
            <ul className="mt-3 list-disc list-inside space-y-2 marker:text-zinc-300">
              <li><strong className="text-zinc-700">The disclosure of the work is mandatory.</strong> If your novel or any chapters were written by an AI tool (such as ChatGPT, Claude AI, or Gemini), you must clearly state this in your novel's synopsis or a tag at the start of the work. Presenting AI-generated content as entirely human-written is considered a form of deception and may result in content removal.</li>
              <li>AI-assisted content, where AI assisted with editing, brainstorming, or rewrites but the core writing is human-made, does not require explicit disclosure, but disclaimers are still encouraged.</li>
              <li>AI-generated content must comply with all the other rules in this Content Policy, including age ratings and the stated prohibitions.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">5. Fanfiction</h2>
            <p>Fanfiction which are creative works based on existing intellectual properties, characters, or worlds, is welcome on Novel Reader, provided that:</p>
            <ul className="mt-3 list-disc list-inside space-y-2 marker:text-zinc-300">
              <li>The work is clearly labeled as fanfiction in the synopsis or tags.</li>
              <li>The work is not presented as an official or authorised continuation of the source material unless permitted.</li>
              <li>The work does not reproduce a substantial verbatim text from the original copyrighted work.</li>
              <li>If a copyrights holder sends a valid takedown request for their intellectual property, we will comply and remove the relevant work from our platform.</li>
            </ul>
            <p className="mt-3">Be noted that fanfiction featuring sexual content involving characters who are canonically or ambiguously minors is prohibited regardless of how the author ages them up in the story.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">6. Copyright & DMCA Takedowns</h2>
            <p>If you believe content on Novel Reader infringes your copyright, send us a DMCA takedown notice to us at <a href="mailto:support@novelreader.tech" className="text-zinc-900 underline">support@novelreader.tech</a> including:</p>
            <ul className="mt-3 list-disc list-inside space-y-1 marker:text-zinc-300">
              <li>A description (with the optional URL and/or name) of the work you claim has been copyright infringed upon.</li>
              <li>The URL or location of the allegedly infringing content on Novel Reader.</li>
              <li>Your name and necessary contact information.</li>
              <li>A statement that you have under a good-faith belief that the use is not authorized.</li>
              <li>A statement, under the penalty of perjury, that the information provided is accurate and that you are the copyright owner or is authorized to act on their behalf.</li>
            </ul>
            <p className="mt-3">We will investigate and respond within a relevant timeframe. Authors who receive takedowns may submit a counter-notice if they believe the takedown was filed in error to us.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">7. Enforcement</h2>
            <p className="mb-3">We take a graduated (step-by-step) approach to enforcement based on the severity and frequency of violations. Actions we may take include:</p>
            <div className="space-y-2">
              {[
                { label: '⚠️ Warning', desc: 'A formal notice that a particular rule has been violated. No immediate restrictions occur, but further violations will result in escalating action.' },
                { label: '🚫 Posting Ban', desc: 'The account is restricted from publishing or editing novels on the website. Reading and account access are unaffected, however.' },
                { label: '⏸ Suspension', desc: 'The account is temporarily disabled. Duration ranges from days to an indefinite time period depending on the violation.' },
                { label: '☠️ Permanent Ban', desc: 'The account and all works is permanently and irrevocably disabled. This is applied for the most serious violations or for repeat offenders.' },
              ].map((a) => (
                <div key={a.label} className="flex gap-3 border border-zinc-100 rounded-xl p-4">
                  <span className="font-semibold text-zinc-800 w-24 md:w-36 shrink-0">{a.label}</span>
                  <span>{a.desc}</span>
                </div>
              ))}
            </div>
            <p className="mt-4">The prohibition violations stated (Section 2), particularly CSAM, will always result in immediate permanent ban and referral to appropriate authorities, with no warnings issued.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">8. Appeals</h2>
            <p>If your content has been removed unjustly or your account has been actioned and you believe it was in error, you may appeal by emailing to us at <a href="mailto:support@novelreader.tech" className="text-zinc-900 underline">support@novelreader.tech</a> with the subject line of "Appeal" and a clear explanation of why you believe the moderation action was incorrect. We will review all appeals within an appropriate timeframe. Appeals regarding CSAM violations will not be considered.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">9. Reporting Violations</h2>
            <p>If you encounter content that violates this policy, please report it to us at <a href="mailto:support@novelreader.tech" className="text-zinc-900 underline">support@novelreader.tech</a> with the novel title, the URL, and a brief description of the violation. We will investigate all reports and take any appropriate action. Reports are kept purely confidential.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">10. Changes to This Policy</h2>
            <p>We may update this Content Policy at any moment with no prior notice. When we do so, we will update the date updated and, in the case of material changes, notify users via an in-app notification. Continued use of the Service after any changes take effect will constitute as your agreement of the revised Policy.</p>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  )
}