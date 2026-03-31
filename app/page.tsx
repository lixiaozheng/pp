import { PasswordGenerator } from "@/components/password-generator";

const faqs = [
  {
    question: "Is this password generator safe to use?",
    answer:
      "Yes. Passwords are generated locally in your browser using the Web Crypto API. The page does not send or store your password on a server.",
  },
  {
    question: "Should I use a random password or a passphrase?",
    answer:
      "Use a random password when you can store it in a password manager. Use a passphrase when you may need to type it yourself more often.",
  },
  {
    question: "Do strong passwords always need symbols?",
    answer:
      "Not always. Length and uniqueness matter more than forcing every character type. Symbols can help, but they are not the only path to a strong password.",
  },
  {
    question: "Can I reuse one strong password everywhere?",
    answer:
      "No. Even a strong password becomes risky when it is reused. Use a different password for every important account.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export default function Page() {
  return (
    <main className="page-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <section className="hero-layout">
        <div className="hero-copy">
          <p className="eyebrow">Secure by default. Clear by design.</p>
          <h1 className="display-title">Generate strong passwords with less noise and more trust.</h1>
          <p className="hero-text">
            Create strong passwords, memorable passphrases, and secure PINs in seconds. Everything runs locally in your
            browser, with plain-English guidance that helps you choose the right format for each account.
          </p>

          <div className="hero-metrics">
            <div>
              <strong>Local only</strong>
              <span>Generated with Web Crypto, never uploaded.</span>
            </div>
            <div>
              <strong>Modern guidance</strong>
              <span>Built around length, uniqueness, and practical use.</span>
            </div>
            <div>
              <strong>Easy to act on</strong>
              <span>Templates explain what to use for banking, work, Wi-Fi, and PIN-only systems.</span>
            </div>
          </div>
        </div>

        <PasswordGenerator />
      </section>

      <section className="content-grid">
        <article className="panel panel-soft">
          <p className="eyebrow">Why this is strong</p>
          <h2 className="section-title">Security advice people can actually use</h2>
          <div className="mt-6 space-y-5 text-sm leading-7 text-[var(--muted)]">
            <p>
              The biggest improvement for most people is not adding one more symbol. It is choosing a unique password
              for every important account and making it long enough that guessing becomes impractical.
            </p>
            <p>
              That is why this tool starts with real-world templates instead of pushing one “perfect” format. Banking
              needs maximum randomness. Wi-Fi passwords benefit from length and readability. PIN-only systems need a
              different approach entirely.
            </p>
            <p>
              You do not need to memorize everything. When you can, save random passwords in a trusted password manager
              and let the generator handle the hard part.
            </p>
          </div>
        </article>

        <article className="panel panel-soft">
          <p className="eyebrow">How to use safely</p>
          <h2 className="section-title">A few habits make a huge difference</h2>
          <ul className="mt-6 space-y-4 text-sm leading-7 text-[var(--muted)]">
            <li>Use a unique password for every account that matters.</li>
            <li>Prefer random passwords for sites you can save in a password manager.</li>
            <li>Use passphrases when you expect to type the password manually.</li>
            <li>Turn on multi-factor authentication whenever the service offers it.</li>
            <li>Replace any password that has been reused after a breach or device compromise.</li>
          </ul>
        </article>
      </section>

      <section className="faq-section panel panel-soft">
        <p className="eyebrow">FAQ</p>
        <h2 className="section-title">Questions people ask before they trust a generator</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {faqs.map((faq) => (
            <article key={faq.question} className="faq-card">
              <h3 className="text-lg font-semibold text-[var(--ink)]">{faq.question}</h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{faq.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
