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
        <p className="text-sm text-zinc-400 mb-2">Last Updated: February 23, 2026</p>
        <p className="text-sm text-zinc-400 mb-10">Operated by an individual @ novelreader.tech</p>

        <div className="space-y-10 text-sm leading-relaxed text-zinc-600">

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">1. Who We Are</h2>
            <p>Novel Reader ("we," "us," "the Service") is a web-based work publishing platform operated by a single individual at novelreader.tech. By creating an account or using any part of the Service, you agree to be bound by these Terms of Service ("Terms"). If you do not agree, please refrain from using the Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">2. Eligibility</h2>
            <p>You must be at minimum <strong className="text-zinc-800">13 years old</strong> to create an account. By registering an account with us, you represent and warrant that you are at least 13 or older and that all provided information is accurate. If we discover that an account is utilized by someone under 13, we will immediately terminate the account and delete all associated data.</p>
            <p className="mt-3">Access to mature content (rated 17+) requires you to be at least 17. Access to adult content (rated 18+) requires you to be at least 18. Misrepresenting your age to access restricted content is a violation of these Terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">3. Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your login credentials and for the activity that occurs on your account. You must notify us at <a href="mailto:support@novelreader.tech" className="text-zinc-900 underline">support@novelreader.tech</a> if you suspect unauthorized access and usage. We are not liable for losses or damages resulting from such unauthorized use of your account.</p>
            <p className="mt-3">You may not create any accounts for others, operate accounts to circumvent punishments, or use artificial or automated means to create accounts. Any user found violating this Terms will be immediately terminated from our platform with all associated information removed.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">4. Your Content</h2>
            <p>You retain and will continue to retain full ownership of any novels, images, or any other content that you publish on Novel Reader ("Your Content"). By publishing such material, you grant Novel Reader a non-exclusive, royalty-free, and worldwide license to display, distribute, and promote Your Content on the platform solely for operating the Service.</p>
            <p className="mt-3">This license immediately ends when you delete your content or your account. Upon the account deletion, all of Your Content is permanently removed from our systems. You represent and warrant that:</p>
            <ul className="mt-3 list-disc list-inside space-y-1 marker:text-zinc-300">
              <li>You own or possess the rights to publish all content you post.</li>
              <li>Your content does not infringe on any copyright, trademark, or any other intellectual property rights.</li>
              <li>Your content complies with these and others' Terms and Content Policies.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">5. Prohibited Content & Conduct</h2>
            <p>You may not publish or engage in any of the following subsequently mentioned. Violations of these Terms may result in the content removal, account suspension, or termination based on our discretion:</p>
            <ul className="mt-3 list-disc list-inside space-y-2 marker:text-zinc-300">
              <li><strong className="text-zinc-800">Child sexual abuse material, otherwise known as Child porn (CSAM/CP)</strong>: we have zero tolerance and will be immediately reported to the proper authorities.</li>
              <li>Content that advocates, glorifies, or instructs real-world violence or terrorism.</li>
              <li>Plagiarism (publishing another person's work as your own without their permission.)</li>
              <li>AI ("Artificial Intelligence")-generated content published without clear disclosure to readers.</li>
              <li>Targeted harassment, threats, or doxxing of any individual. Furthermore, any unsolicited, harmful or libelous information about any real-life individual.</li>
              <li>Content that infringes copyright or intellectual property rights.</li>
              <li>Spam, phishing, or any deceptive content of any kind.</li>
              <li>Circumventing age verification to access restricted content.</li>
            </ul>
            <p className="mt-3">Fan fiction ("Fanfiction", "Fan-fiction") based on preexisting works is permitted provided that it is clearly labeled as such and does not infringe on any copyright.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">6. Age Ratings & Mature Content</h2>
            <p>Authors are required to accurately label their content with the appropriate age rating suitable for their work. The four labels that is provided are: Everyone, Teen (13+), Mature (17+), and Adult (18+). Deliberately mislabeling content to circumvent age restrictions, for instance, marking adult content as "Everyone", is a severe violation and grounds for immediate punishment at our discretion.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">7. Monetisation</h2>
            <p>Novel Reader may offer (further) optional paid features including, but not limited to, tipping and premium subscriptions for authors. Any additional charges will be clearly disclosed and stated before payment. We may also display promotional content for solely novels published on our platform. We do not display any third-party advertising. Subscription and tipping terms and policies will be provided at the point of purchase.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">8. Copyright & DMCA</h2>
            <p>We will respect and honor intellectual property rights and will expect our users to do the same. If you believe any content on Novel Reader infringes your copyright, please send us a DMCA takedown notice to us at <a href="mailto:support@novelreader.tech" className="text-zinc-900 underline">support@novelreader.tech</a> with the subsequent information:</p>
            <ul className="mt-3 list-disc list-inside space-y-1 marker:text-zinc-300">
              <li>A description (with the optional URL and/or name) of the work you claim has been copyright infringed upon.</li>
              <li>The URL or location of the allegedly infringing content on Novel Reader.</li>
              <li>Your name and necessary contact information.</li>
              <li>A statement that you have under a good-faith belief that the use is not authorized.</li>
              <li>A statement, under the penalty of perjury, that the information provided is accurate and that you are the copyright owner or is authorized to act on their behalf.</li>
            </ul>
            <p className="mt-3">We may investigate valid notices and will remove infringing content as soon as possible. Repeat infringers will have their accounts permanently banned from our platform and their data wiped.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">9. Enforcement & Moderation</h2>
            <p>We reserve the right to remove any violating content and take any of the following actions against accounts that violate our Terms, at our sole discretion: issuing a warning, restricting novel-posting privileges, temporary suspension, or termination from our platform. The severity of our actions will generally reflect the severity of the violation. We are not obligated to provide advance notice nor a reason of doing so before acting upon serious violations such as CSAM or targeted harassment.</p>
            <p className="mt-3">If you believe a moderation action against your account was made unjustly by us, you may appeal to us by emailing us at <a href="mailto:support@novelreader.tech" className="text-zinc-900 underline">support@novelreader.tech</a>. We will review all appeals and, if accepted, take action within 7 business days.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">10. Disclaimers</h2>
            <p>The Service is provided "as is" and "as available" without warranties of any kind, express or implied. We do not guarantee uninterrupted, error-free operation. We are not responsible for the accuracy, completeness, or legality of content posted by users. Your use of the Service is at your own risk. If you believe there are any mistakes, please feel free to reach out to us at <a href="mailto:support@novelreader.tech" className="text-zinc-900 underline">support@novelreader.tech</a>.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">11. Limitation of Liability</h2>
            <p>To the fullest extent permitted by the applicable law, Novel Reader and its operator shall not be liable for any indirect, incidental, special, consequential, or any punitive damages arising out of or relating to your use of the Service, including but not limited to loss of data, loss of revenue, or loss of goodwill, even if advised of the possibility of such damages.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">12. Governing Law</h2>
            <p>These Terms are governed by and is interpreted in accordance with the laws of the United States. Any disputes arising under these Terms will be subject to the jurisdiction of the courts of the United States, particularly in the region of New York.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">13. Changes to These Terms</h2>
            <p>We may update these Terms at any moment with no prior notice. When we do so, we will update the effective date at the top of this page and for any material changes, notify users via an in-app notification. Continued use of the Service after any changes take effect will constitute as your agreement of the revised Terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 mb-3">14. Contact</h2>
            <p>For any questions about the Terms, please contact us at <a href="mailto:support@novelreader.tech" className="text-zinc-900 underline">support@novelreader.tech</a>.</p>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  )
}