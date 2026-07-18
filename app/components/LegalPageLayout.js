import Link from "next/link";

export default function LegalPageLayout({
  title,
  description,
  updatedAt,
  children,
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
              BY
            </span>
            <span className="text-lg font-semibold tracking-tight">
              Before You Move There
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 transition hover:text-emerald-600"
          >
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">
          Legal
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-3 text-lg leading-relaxed text-slate-600">{description}</p>
        )}
        {updatedAt && (
          <p className="mt-4 text-sm text-slate-500">Last updated: {updatedAt}</p>
        )}
        <div className="mt-10 space-y-8 text-base leading-relaxed text-slate-700">
          {children}
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white px-6 py-8">
        <nav
          className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-slate-500"
          aria-label="Legal"
        >
          <Link href="/privacy-policy" className="transition hover:text-emerald-600">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="transition hover:text-emerald-600">
            Terms of Service
          </Link>
          <Link href="/about" className="transition hover:text-emerald-600">
            About
          </Link>
          <Link href="/contact" className="transition hover:text-emerald-600">
            Contact
          </Link>
          <Link href="/pricing" className="transition hover:text-emerald-600">
            Pricing
          </Link>
        </nav>
        <p className="mt-4 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Before You Move There
        </p>
      </footer>
    </div>
  );
}

export function LegalSection({ title, children }) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
