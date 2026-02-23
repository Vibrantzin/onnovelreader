// src/app/privacy/page.tsx
import Link from 'next/link'
import Footer from '@/components/Footer'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      <nav className="border-b border-zinc-100 px-8 py-5 flex justify-between items-center">
        <Link href="/" className="text-lg font-bold tracking-tighter">NOVEL READER</Link>
        <Link href="/browse" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">Browse</Link>
      </nav>

      <main className="max-w-3xl mx-auto px-8 py-16">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-zinc-400 mb-2">Effective date: February 22, 2026</p>
        <p className="text-sm text-zinc-400 mb-10">This policy explains what data Novel Reader collects, how it is used, and your rights regarding your personal information.</p>

        <div className="space-y-10 text-sm leading-relaxed text-zinc-600">

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">1. Who We Are</h2>
            <p>Novel Reader is operated by a sole individual at novelreader.tech, based in the United States. For privacy-related questions or requests, contact us at <a href="mailto:support@novelreader.tech" className="text-zinc-900 underline">support@novelreader.tech</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">2. Information We Collect</h2>
            <p className="mb-3">We collect only the information necessary to operate the Service. This includes:</p>

            <div className="space-y-4">
              <div className="bg-zinc-50 rounded-xl p-4">
                <p className="font-medium text-zinc-800 mb-1">Information you provide directly</p>
                <ul className="list-disc list-inside space-y-1 marker:text-zinc-300">
                  <li><strong className="text-zinc-700">Email address</strong> — used for account authentication and transactional notifications such as account warnings.</li>
                  <li><strong className="text-zinc-700">Password</strong> — stored securely as a hashed value. We never store or access your plaintext password.</li>
                  <li><strong className="text-zinc-700">Date of birth</strong> — used solely to determine your age tier for content access. We do not use this for marketing or share it with anyone.</li>
                  <li><strong className="text-zinc-700">Username</strong> — displayed publicly on your profile and published works.</li>
                  <li><strong className="text-zinc-700">Published content</strong> — novels, chapters, and reviews you choose to publish on the platform.</li>
                </ul>
              </div>

              <div className="bg-zinc-50 rounded-xl p-4">
                <p className="font-medium text-zinc-800 mb-1">Information collected automatically</p>
                <ul className="list-disc list-inside space-y-1 marker:text-zinc-300">
                  <li><strong className="text-zinc-700">Reading activity</strong> — novels you view, chapters you read, and novels you follow. Used to power recommendations and author statistics.</li>
                  <li><strong className="text-zinc-700">Reviews and ratings</strong> — feedback you leave on novels.</li>
                </ul>
              </div>

              <div className="bg-zinc-50 rounded-xl p-4">
                <p className="font-medium text-zinc-800 mb-1">Information from third-party login (Google / GitHub)</p>
                <p>If you sign in using Google or GitHub, we receive your email address and a unique identifier from that provider. We do not receive your password or any other personal data beyond what is necessary to create your account. These providers handle authentication — we only store your email and the identifier they return.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 marker:text-zinc-300">
              <li>To authenticate your account and keep it secure.</li>
              <li>To verify your age and restrict access to age-appropriate content.</li>
              <li>To display your published works to other users.</li>
              <li>To send transactional notifications — account warnings, milestone alerts, and moderation actions. You cannot opt out of these as they are necessary for account operation.</li>
              <li>To generate anonymised statistics (e.g. view counts) shown to authors about their own works.</li>
              <li>To enforce our Terms of Service and Content Policy.</li>
              <li>To process subscription payments and author tips (when these features are launched).</li>
            </ul>
            <p className="mt-3">We do not use your data for behavioural advertising and we do not build advertising profiles. Any promotional content on the platform is limited to novels published on Novel Reader itself.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">4. Data Sharing</h2>
            <p className="mb-3">We do not sell, rent, or share your personal data with third parties for their own purposes. Your data is handled only by the following services strictly for platform operation:</p>
            <ul className="list-disc list-inside space-y-2 marker:text-zinc-300">
              <li><strong className="text-zinc-700">Supabase</strong> — our database and authentication provider. Your data is stored on Supabase's infrastructure. See their privacy policy at supabase.com/privacy.</li>
              <li><strong className="text-zinc-700">Resend</strong> — used to deliver transactional emails such as account verification and admin notifications. Only your email address is passed to Resend when an email needs to be sent.</li>
              <li><strong className="text-zinc-700">Google / GitHub</strong> — only if you choose to sign in via OAuth. These providers process your login but we do not pass them any data beyond what the OAuth flow requires.</li>
              <li><strong className="text-zinc-700">Vercel</strong> — hosts the web application. Vercel may process request logs that include your IP address as part of standard hosting operations.</li>
            </ul>
            <p className="mt-3">We may disclose your information if required by law, court order, or to protect the rights and safety of users — for example, reporting CSAM to the National Center for Missing and Exploited Children (NCMEC) as required by federal law.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">5. Data Retention & Account Deletion</h2>
            <p>When you delete your account, all of your personal data and published content is permanently and irreversibly deleted from our systems. This includes your email, date of birth, username, all novels and chapters, reviews, reading history, and notification history.</p>
            <p className="mt-3">Deletion is processed promptly and cannot be undone. If you wish to preserve your work, please export it before deleting your account. You can delete your account at any time from your Settings page.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">6. Children's Privacy (COPPA)</h2>
            <p>Novel Reader is not directed at children under 13. We do not knowingly collect personal information from anyone under 13. If we become aware that a user is under 13, we will immediately delete their account and all associated data. If you believe a child under 13 has created an account, please contact us at <a href="mailto:support@novelreader.tech" className="text-zinc-900 underline">support@novelreader.tech</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">7. Cookies & Storage</h2>
            <p>We use session cookies necessary for authentication and keeping you logged in. We use browser session storage to remember your age verification status for the duration of your browser session. We do not use tracking cookies, analytics cookies, or advertising cookies of any kind.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">8. Security</h2>
            <p>We implement reasonable technical and organisational measures to protect your data, including encrypted data transmission (HTTPS), hashed password storage, and row-level security policies on our database. However, no system is completely secure. We encourage you to use a strong, unique password and to contact us immediately if you suspect your account has been compromised.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">9. Your Rights</h2>
            <p className="mb-3">You have the following rights with respect to your personal data:</p>
            <ul className="list-disc list-inside space-y-2 marker:text-zinc-300">
              <li><strong className="text-zinc-700">Access</strong> — you may request a copy of the personal data we hold about you.</li>
              <li><strong className="text-zinc-700">Correction</strong> — you may update your username and date of birth from your Settings page at any time.</li>
              <li><strong className="text-zinc-700">Deletion</strong> — you may delete your account and all associated data from your Settings page.</li>
              <li><strong className="text-zinc-700">Portability</strong> — you may request an export of your data by contacting us.</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, contact us at <a href="mailto:support@novelreader.tech" className="text-zinc-900 underline">support@novelreader.tech</a>. We will respond within 30 days.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. When we do, we will update the effective date and notify users of material changes via an in-app notification. Continued use of the Service after changes take effect constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">11. Contact</h2>
            <p>For any privacy-related questions or requests, contact us at <a href="mailto:support@novelreader.tech" className="text-zinc-900 underline">support@novelreader.tech</a>.</p>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  )
}