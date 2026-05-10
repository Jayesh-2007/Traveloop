const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
};

function LoadingSpinner({ centered = false, label = 'Loading', size = 'md' }) {
  const spinner = (
    <div className="flex items-center gap-3 text-sm text-[var(--color-text-secondary)]" role="status">
      <span
        className={[
          'animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-primary)]',
          sizeClasses[size] || sizeClasses.md,
        ].join(' ')}
      />
      <span>{label}</span>
    </div>
  );

  if (centered) {
    return <div className="flex min-h-40 items-center justify-center">{spinner}</div>;
  }

  return spinner;
}

export default LoadingSpinner;
