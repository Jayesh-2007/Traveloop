import { Loader2 } from 'lucide-react';

const variantClasses = {
  primary: 'bg-[var(--color-primary)] text-white shadow-sm hover:brightness-95 focus-visible:outline-[var(--color-primary)]',
  secondary:
    'border border-[var(--color-border)] bg-white text-[var(--color-primary)] shadow-sm hover:bg-[var(--color-surface)] focus-visible:outline-[var(--color-primary)]',
  danger: 'bg-[var(--color-error)] text-white shadow-sm hover:brightness-95 focus-visible:outline-[var(--color-error)]',
};

function Button({
  as: Component = 'button',
  children,
  className = '',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  variant = 'primary',
  ...props
}) {
  const isDisabled = disabled || loading;
  const buttonProps =
    Component === 'button'
      ? { disabled: isDisabled, type }
      : { 'aria-disabled': isDisabled, tabIndex: isDisabled ? -1 : undefined };

  function handleClick(event) {
    if (isDisabled) {
      event.preventDefault();
      return;
    }

    onClick?.(event);
  }

  return (
    <Component
      className={[
        'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition sm:px-5 sm:py-2.5',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        'disabled:pointer-events-none disabled:opacity-60',
        isDisabled && Component !== 'button' ? 'pointer-events-none opacity-60' : '',
        variantClasses[variant] || variantClasses.primary,
        className,
      ].join(' ')}
      onClick={handleClick}
      {...buttonProps}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
      <span>{children}</span>
    </Component>
  );
}

export default Button;
