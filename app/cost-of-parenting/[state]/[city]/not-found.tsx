import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center bg-cream px-4 text-center text-stone-700">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-800">
        404
      </p>
      <h1 className="font-serif mt-3 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
        City guide not found
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-stone-600 sm:text-base">
        We don&apos;t have a parenting cost baseline for that city and state yet.
        Try a curated metro or head home.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/cost-of-parenting/tx/austin"
          className="inline-flex items-center justify-center rounded-full bg-teal-700 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-teal-800"
        >
          Explore Austin costs
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full border border-stone-300/80 bg-white px-6 py-3 text-sm font-medium text-stone-800 transition-all hover:border-teal-700/40 hover:text-teal-900"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
