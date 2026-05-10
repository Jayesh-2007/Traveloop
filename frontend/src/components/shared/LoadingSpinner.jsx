function LoadingSpinner({ label = 'Loading' }) {
  return (
    <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]" role="status">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]" />
      <span>{label}</span>
    </div>
  );
}

export default LoadingSpinner;
