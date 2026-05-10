function Button({
  as: Component = 'button',
  children,
  className = '',
  disabled = false,
  size = 'md',
  type = 'button',
  variant = 'primary',
  ...props
}) {
  const variants = {
    primary:
      'bg-gradient-to-r from-emerald-700 to-teal-700 text-white shadow-lg shadow-emerald-900/15 hover:from-emerald-600 hover:to-teal-600 hover:shadow-emerald-900/25',
    secondary:
      'border border-slate-200/90 bg-white text-slate-700 shadow-sm shadow-slate-200/70 hover:border-emerald-200 hover:bg-emerald-50/40 hover:text-slate-950 hover:shadow-md hover:shadow-slate-200/80',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
    dark: 'bg-slate-950 text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800',
    danger: 'bg-red-600 text-white shadow-lg shadow-red-900/10 hover:bg-red-700',
  };
  const sizes = {
    sm: 'rounded-xl px-3 py-2 text-xs',
    md: 'rounded-2xl px-4 py-2.5 text-sm',
    lg: 'rounded-2xl px-5 py-3 text-sm',
  };
  const buttonProps = Component === 'button' ? { disabled, type } : {};

  return (
    <Component
      className={[
        'inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap font-semibold transition duration-200 ease-out hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] focus:outline-none focus:ring-4 focus:ring-emerald-700/15 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:active:scale-100',
        sizes[size] || sizes.md,
        variants[variant] || variants.primary,
        className,
      ].join(' ')}
      {...buttonProps}
      {...props}
    >
      {children}
    </Component>
  );
}

export default Button;
