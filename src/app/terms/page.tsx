// src/app/terms/page.tsx
import Link from 'next/link'
import Footer from '@/components/Footer'

export default function Terms() {
  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      <nav className="border-b border-zinc-100 px-8 py-5 flex justify-between items-center">
        <Link href="/" className="text-lg font-bold tracking-tighter">NOVEL READER</Link>
        <Link href="/browse" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors">Browse</Link>
      </nav>

      <main className="max-w-3xl mx-auto px-8 py-16">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-zinc-400 mb-2">Effective date: February 22, 2026</p>
        <p className="text-sm text-zinc-400 mb-10">Operated by an individual — novelreader.tech</p>

        <div className="space-y-10 text-sm leading-relaxed text-zinc-600">

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">1. Who We Are</h2>
            <p>Novel Reader ("we," "us," "the Service") is a web-based fiction publishing platform operated by a sole individual at novelreader.tech. By creating an account or using any part of the Service, you agree to be legally bound by these Terms of Service ("Terms"). If you do not agree, you must not use the Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">2. Eligibility</h2>
            <p>You must be at least <strong className="text-zinc-800">13 years old</strong> to create an account. By registering, you represent and warrant that you are 13 or older and that all information you provide is accurate, including your date of birth. If we learn that an account belongs to someone under 13, we will immediately terminate it and delete associated data.</p>
            <p className="mt-3">Access to mature content (rated 17+) requires you to be at least 17. Access to adult content (rated 18+) requires you to be at least 18 and to have completed age verification. Misrepresenting your age to access restricted content is a material violation of these Terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">3. Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account. You must notify us immediately at <a href="mailto:support@novelreader.tech" className="text-zinc-900 underline">support@novelreader.tech</a> if you suspect unauthorized access. We are not liable for losses resulting from unauthorized use of your account.</p>
            <p className="mt-3">You may not create accounts for others, operate multiple accounts to circumvent suspensions, or use automated means to create accounts.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">4. Your Content</h2>
            <p>You retain full ownership of any novels, chapters, or other content you publish on Novel Reader ("Your Content"). By publishing content, you grant Novel Reader a non-exclusive, royalty-free, worldwide license to display, distribute, and promote Your Content on the platform solely for the purpose of operating the Service.</p>
            <p className="mt-3">This license ends when you delete your content or your account. Upon account deletion, all of Your Content is permanently removed from our systems. You represent and warrant that:</p>
            <ul className="mt-3 list-disc list-inside space-y-1 marker:text-zinc-300">
              <li>You own or have the rights to publish all content you post.</li>
              <li>Your content does not infringe any copyright, trademark, or other intellectual property rights.</li>
              <li>Your content complies with these Terms and our Content Policy.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">5. Prohibited Content & Conduct</h2>
            <p>You may not publish or engage in the following. Violations may result in content removal, account suspension, or permanent ban:</p>
            <ul className="mt-3 list-disc list-inside space-y-2 marker:text-zinc-300">
              <li><strong className="text-zinc-800">Child sexual abuse material (CSAM)</strong> — zero tolerance, immediately reported to authorities.</li>
              <li>Content that promotes, glorifies, or instructs real-world violence or terrorism.</li>
              <li>Plagiarism — publishing another person's work as your own without permission.</li>
              <li>AI-generated content published without clear disclosure to readers.</li>
              <li>Targeted harassment, threats, or doxxing of any individual.</li>
              <li>Content that infringes third-party copyright or intellectual property rights.</li>
              <li>Spam, phishing, or deceptive content of any kind.</li>
              <li>Circumventing age verification to access restricted content.</li>
            </ul>
            <p className="mt-3">Fan fiction based on existing works is permitted provided it is clearly labeled as such and does not infringe copyright.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">6. Age Ratings & Mature Content</h2>
            <p>Authors are required to accurately label their content with the appropriate age rating. The four tiers are: Everyone, Teen (13+), Mature (17+), and Adult (18+). Deliberately mislabeling content to circumvent age restrictions — for example, marking adult content as "Everyone" — is a serious violation and grounds for immediate account termination.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">7. Monetisation</h2>
            <p>Novel Reader may offer optional paid features including reader tipping for authors and premium subscriptions. Any charges will be clearly disclosed before payment. We may also display promotional content for novels published on the platform. We do not display third-party advertising. Subscription and tipping terms will be provided at the point of purchase.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">8. Copyright & DMCA</h2>
            <p>We respect intellectual property rights and expect our users to do the same. If you believe content on Novel Reader infringes your copyright, please send a DMCA takedown notice to <a href="mailto:support@novelreader.tech" className="text-zinc-900 underline">support@novelreader.tech</a> with the following information:</p>
            <ul className="mt-3 list-disc list-inside space-y-1 marker:text-zinc-300">
              <li>A description of the copyrighted work you claim has been infringed.</li>
              <li>The URL or location of the allegedly infringing content on Novel Reader.</li>
              <li>Your name, address, and contact information.</li>
              <li>A statement that you have a good-faith belief that the use is not authorized.</li>
              <li>A statement, under penalty of perjury, that the information is accurate and that you are the copyright owner or authorized to act on their behalf.</li>
            </ul>
            <p className="mt-3">We will investigate valid notices and remove infringing content promptly. Repeat infringers will have their accounts terminated.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">9. Enforcement & Moderation</h2>
            <p>We reserve the right to remove any content and take any of the following actions against accounts that violate these Terms, at our sole discretion: issuing a formal warning, restricting posting privileges, temporary suspension, or permanent ban. The severity of action will generally reflect the severity of the violation. We are not obligated to provide advance notice before acting on serious violations such as CSAM or targeted harassment.</p>
            <p className="mt-3">If you believe a moderation action against your account was made in error, you may appeal by emailing <a href="mailto:support@novelreader.tech" className="text-zinc-900 underline">support@novelreader.tech</a>. We will review all appeals within 7 business days.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">10. Disclaimers</h2>
            <p>The Service is provided "as is" and "as available" without warranties of any kind, express or implied. We do not guarantee uninterrupted, error-free operation. We are not responsible for the accuracy, completeness, or legality of content posted by users. Your use of the Service is at your own risk.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">11. Limitation of Liability</h2>
            <p>To the fullest extent permitted by applicable law, Novel Reader and its operator shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the Service, including but not limited to loss of data, loss of revenue, or loss of goodwill, even if advised of the possibility of such damages.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">12. Governing Law</h2>
            <p>These Terms are governed by and construed in accordance with the laws of the United States. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of the United States.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">13. Changes to These Terms</h2>
            <p>We may update these Terms from time to time. When we do, we will update the effective date at the top of this page and, for material changes, notify users via an in-app notification. Continued use of the Service after changes take effect constitutes your acceptance of the revised Terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">14. Contact</h2>
            <p>For any questions about these Terms, contact us at <a href="mailto:support@novelreader.tech" className="text-zinc-900 underline">support@novelreader.tech</a>.</p>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  )
}