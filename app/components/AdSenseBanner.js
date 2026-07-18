/**
 * Native-styled AdSense placement placeholder. Swap the inner slot for a real
 * <ins class="adsbygoogle" …> unit when AdSense is configured in production.
 */
export default function AdSenseBanner({ label = "Sponsored", className = "" }) {
  return (
    <aside
      className={`overflow-hidden rounded-2xl border border-dashed border-slate-600/80 bg-gradient-to-br from-slate-900 via-slate-800/90 to-slate-900 ${className}`}
      aria-label="Advertisement"
    >
      <div className="flex min-h-[120px] flex-col items-center justify-center gap-3 px-6 py-8 text-center sm:min-h-[90px] sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-700/80 text-xs font-bold uppercase tracking-wider text-slate-400">
            Ad
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              {label}
            </p>
            <p className="mt-0.5 text-sm font-medium text-slate-300">
              Neighborhood insights · Google AdSense
            </p>
            <p className="mt-1 text-xs text-slate-500">
              728×90 leaderboard · responsive unit
            </p>
          </div>
        </div>
        <div className="hidden h-12 w-full max-w-md rounded-lg border border-slate-600/50 bg-slate-800/60 sm:block" />
      </div>
    </aside>
  );
}
