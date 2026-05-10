import { Link } from 'react-router-dom';
import Button from './Button.jsx';

function EmptyState({ action, description, icon: Icon, title }) {
  const { label, ...buttonAction } = action || {};
  const actionProps = action?.to ? { as: Link, to: action.to } : {};

  return (
    <div className="rounded-lg border border-dashed border-[var(--color-border)] bg-white px-6 py-10 text-center">
      {Icon && (
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface)] text-[var(--color-primary)]">
          <Icon size={24} aria-hidden="true" />
        </div>
      )}
      <h3 className="mt-4 text-base font-semibold text-[var(--color-text-primary)]">{title}</h3>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-text-secondary)]">{description}</p>
      )}
      {action && (
        <div className="mt-6">
          <Button {...actionProps} {...buttonAction}>
            {label}
          </Button>
        </div>
      )}
    </div>
  );
}

export default EmptyState;
