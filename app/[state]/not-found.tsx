import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function StateHubNotFound() {
  return (
    <div className="min-h-screen bg-cream text-stone-700">
      <Navbar />
      <main className="mx-auto max-w-xl px-6 py-16 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-800">
          State hub
        </p>
        <h1 className="font-serif mt-3 text-3xl font-semibold text-stone-900">
          State guide not found
        </h1>
        <p className="mt-3 text-base text-stone-600">
          We don&apos;t have a state hub for that route yet. Try a tracked
          metro like Texas or California.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/tx"
            className="rounded-full bg-teal-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-teal-800"
          >
            Texas hub
          </Link>
          <Link
            href="/ca"
            className="rounded-full border border-stone-200 bg-white px-5 py-2.5 text-sm font-medium text-stone-800 hover:border-teal-700/40"
          >
            California hub
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
