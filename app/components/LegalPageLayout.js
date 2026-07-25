import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LegalPageLayout({
  title,
  description,
  updatedAt,
  children,
}) {
  return (
    <div className="min-h-screen bg-cream text-stone-700">
      <Navbar />

      <main className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-teal-800">
          Legal
        </p>
        <h1 className="font-serif mt-2 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 text-lg leading-relaxed text-stone-600">{description}</p>
        ) : null}
        {updatedAt ? (
          <p className="mt-4 text-sm text-stone-500">Last updated: {updatedAt}</p>
        ) : null}
        <div className="mt-10 space-y-8 text-base leading-relaxed text-stone-700">
          {children}
        </div>
        <p className="mt-10">
          <Link href="/" className="text-sm font-medium text-teal-800 hover:underline">
            ← Back to home
          </Link>
        </p>
      </main>

      <Footer />
    </div>
  );
}

export function LegalSection({ title, children }) {
  return (
    <section>
      <h2 className="font-serif text-xl font-semibold text-stone-900">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
