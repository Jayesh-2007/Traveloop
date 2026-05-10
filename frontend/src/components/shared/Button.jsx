function Button({ children, className = '', type = 'button', variant = 'primary', ...props }) {
  const variants = {
    primary: 'bg-[var(--color-primary)] text-white hover:brightness-95',
    secondary:
      'border border-[var(--color-border)] bg-white text-[var(--color-primary)] hover:bg-[var(--color-surface)]',
  };

  return (
    <button
      type={type}
      className={[
        'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant] || variants.primary,
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
