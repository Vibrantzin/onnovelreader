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
        <p className="text-sm text-zinc-400 mb-2">Last Updated: February 23, 2026</p>
        <p className="text-sm text-zinc-400 mb-10">This policy explains what kinds of data Novel Reader collects, how it is used, and your rights regarding your personal information on Novel Reader.</p>

        <div className="space-y-10 text-sm leading-relaxed text-zinc-600">

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">1. Who We Are</h2>
            <p>Novel Reader is operated by a single individual @ novelreader.tech, based in the United States in the region of New York. For any privacy-related questions or requests, feel free to contact us at <a href="mailto:support@novelreader.tech" className="text-zinc-900 underline">support@novelreader.tech</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">2. Information We Collect</h2>
            <p className="mb-3">We only collect the information necessary to operate the Service. This includes:</p>

            <div className="space-y-4">
              <div className="bg-zinc-50 rounded-xl p-4">
                <p className="font-medium text-zinc-800 mb-1">Information you provide directly</p>
                <ul className="list-disc list-inside space-y-1 marker:text-zinc-300">
                  <li><strong className="text-zinc-700">Email address</strong> which is used for account authentication and notifications such as account warnings.</li>
                  <li><strong className="text-zinc-700">Password</strong> which is stored securely as a hashed value. We will never store nor access your plaintext password.</li>
                  <li><strong className="text-zinc-700">Date of birth</strong> which is used for solely to determine your age tier for content access. We do not use this information for marketing purposes or share it with anyone else.</li>
                  <li><strong className="text-zinc-700">Username</strong> which is displayed publicly on your profile and published works, which can be changed at any time.</li>
                  <li><strong className="text-zinc-700">Published content</strong> including novels, chapters, and reviews you choose to publish on the platform.</li>
                </ul>
              </div>

              <div className="bg-zinc-50 rounded-xl p-4">
                <p className="font-medium text-zinc-800 mb-1">Information collected automatically</p>
                <ul className="list-disc list-inside space-y-1 marker:text-zinc-300">
                  <li><strong className="text-zinc-700">Reading activity</strong> including but not limited to novels you view, chapters you read, and novels you follow. This information is used to power recommendations and author statistics and will not be shared with anyone else.</li>
                  <li><strong className="text-zinc-700">Reviews and ratings</strong> which is feedback you leave on novels.</li>
                </ul>
              </div>

              <div className="bg-zinc-50 rounded-xl p-4">
                <p className="font-medium text-zinc-800 mb-1">Information from third-party login (Google / GitHub OAuth)</p>
                <p>If you sign in using Google and/or GitHub, we will receive your email address and a unique identifier from that provider. We do not receive your password or any other personal data beyond what is necessary to create your account. These providers handle authentication; we only store your email and the identifier they return.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 marker:text-zinc-300">
              <li>To authenticate your account and keep it secure (we do not share the information with any other parties).</li>
              <li>To confirm your age/date of birth and restrict access to the site or age-appropriate content.</li>
              <li>To display your published works to other users on the website.</li>
              <li>To send notifications to your email and/or on the website including account warnings, milestone alerts, and moderation actions. You cannot opt out of these notifications as they are strictly necessary for account operation.</li>
              <li>To generate anonymised statistics (for instance, view counts) shown to authors for purely informational purposes about their own works.</li>
              <li>To enforce our Terms of Service and Content Policy.</li>
              <li>To manage subscription payments and author tips.</li>
            </ul>
            <p className="mt-3">We do not use your data for behavioural advertising and we do not build advertising profiles based on your history. Any promotional content displayed on the platform is limited to novels published on Novel Reader itself.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">4. Data Sharing</h2>
            <p className="mb-3">We do not sell, rent, or publish your personal data with any other third parties for their own purposes. Your data is handled only by the following services strictly for platform operation:</p>
            <ul className="list-disc list-inside space-y-2 marker:text-zinc-300">
              <li><strong className="text-zinc-700">Supabase</strong>, our database and authentication provider. Your data is stored on Supabase's infrastructure. See their privacy policy at supabase.com/privacy.</li>
              <li><strong className="text-zinc-700">Resend</strong>, which is used to deliver emails/notifications such as account verification and admin notifications. Only your email address and no other information is passed to Resend when an email needs to be sent.</li>
              <li><strong className="text-zinc-700">Google / GitHub OAuth</strong>, but only if you choose to sign in via OAuth. These providers handle your login details but we do not pass them any data beyond what the OAuth requires.</li>
              <li><strong className="text-zinc-700">Vercel</strong> which hosts the web application. Vercel may process request logs that may include information such as your IP address as part of standard hosting operations.</li>
            </ul>
            <p className="mt-3">We may disclose your information if required by law, court order, or to protect the rights and safety of users, for example, reporting CSAM to the National Center for Missing and Exploited Children (NCMEC) as required by federal law.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">5. Data Retention & Account Deletion</h2>
            <p>When you delete your account, all of your personal data and published content is permanently and irreversibly deleted from our systems, which cannot be recovered. This includes, but may not be limited to, your email, date of birth, username, all published works, reviews, reading history, and notification history.</p>
            <p className="mt-3">Deletion is processed promptly and cannot be undone. If you wish to preserve your work, please export it before deleting your account. You can delete your account at any time from the Settings page on our website.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">6. Children's Privacy (COPPA)</h2>
            <p>Novel Reader is not directed at children under 13. We do not knowingly collect personal information from anyone under 13. If we become aware that a user is under 13, we will immediately delete their account and all associated information. If you believe a minor under 13 has created an account with us, please contact us at <a href="mailto:support@novelreader.tech" className="text-zinc-900 underline">support@novelreader.tech</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">7. Cookies & Storage</h2>
            <p>We use session cookies necessary for authentication and keeping you logged in after you closed the website. We use browser session storage to remember your age verification status for the duration of your browser session. We do not use tracking cookies, analytics cookies, or advertising cookies of any kind or share any cookie information to any third-party platforms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">8. Security</h2>
            <p>We utilize technical measures to protect your information, including but not necessarily limited to, encrypted data transmission (HTTPS rather than HTTP), hashed password storage, and row-level security policies on our database and website. However, no system is completely secure, which is why we recommend and enforce you to use a strong, unique password and to contact us immediately if you suspect that your account has been compromised.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">9. Your Rights</h2>
            <p className="mb-3">You have the following rights to your personal data:</p>
            <ul className="list-disc list-inside space-y-2 marker:text-zinc-300">
              <li><strong className="text-zinc-700">Access</strong>: you may request a copy of the personal data we hold about you.</li>
              <li><strong className="text-zinc-700">Correction</strong>: you may update your username and/or date of birth from the Settings page at any time.</li>
              <li><strong className="text-zinc-700">Deletion</strong>: you may delete your account and all associated information from the Settings page.</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, feel free to contact us at <a href="mailto:support@novelreader.tech" className="text-zinc-900 underline">support@novelreader.tech</a>. We will respond within a reasonable timeframe.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy at any moment with no prior notice. When we do so, we will update the date updated and, in the case of material changes, notify users via an in-app notification. Continued use of the Service after any changes take effect will constitute as your agreement of the revised Policy.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">11. Contact</h2>
            <p>For any privacy-related questions or requests, please contact us at <a href="mailto:support@novelreader.tech" className="text-zinc-900 underline">support@novelreader.tech</a>.</p>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  )
}