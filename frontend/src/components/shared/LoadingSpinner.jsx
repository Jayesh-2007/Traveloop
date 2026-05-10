function LoadingSpinner({ label = 'Loading' }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-500" role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-700" />
      <span>{label}</span>
    </div>
  );
}

export default LoadingSpinner;
