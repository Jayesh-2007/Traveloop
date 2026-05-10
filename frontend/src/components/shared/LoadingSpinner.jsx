function LoadingSpinner({ label = 'Loading' }) {
  return (
    <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm shadow-slate-200/60" role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-700" />
      <span>{label}</span>
    </div>
  );
}

export function SkeletonBlock({ className = '' }) {
  return (
    <div
      className={['shimmer rounded-2xl bg-slate-100', className].join(' ')}
      aria-hidden="true"
    />
  );
}

export function LoadingCards({ count = 3 }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading content">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="rounded-2xl border border-white/80 bg-white p-5 shadow-sm shadow-slate-200/70">
          <SkeletonBlock className="h-32" />
          <SkeletonBlock className="mt-5 h-5 w-2/3" />
          <SkeletonBlock className="mt-3 h-4 w-full" />
          <SkeletonBlock className="mt-2 h-4 w-4/5" />
          <div className="mt-5 grid grid-cols-2 gap-3">
            <SkeletonBlock className="h-10" />
            <SkeletonBlock className="h-10" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default LoadingSpinner;
