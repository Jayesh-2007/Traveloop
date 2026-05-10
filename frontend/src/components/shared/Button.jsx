function Button({
  as: Component = 'button',
  children,
  className = '',
  disabled = false,
  type = 'button',
  variant = 'primary',
  ...props
}) {
  const variants = {
    primary: 'bg-emerald-700 text-white shadow-sm shadow-emerald-900/10 hover:bg-emerald-800',
    secondary:
      'border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50',
    danger: 'bg-red-600 text-white shadow-sm shadow-red-900/10 hover:bg-red-700',
  };
  const buttonProps = Component === 'button' ? { disabled, type } : {};

  return (
    <Component
      className={[
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-emerald-700/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:active:scale-100',
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
