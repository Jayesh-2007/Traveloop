import { Link } from 'react-router-dom';
import Button from './Button.jsx';

function EmptyState({ action, description, icon: Icon, title }) {
  const { label, ...buttonAction } = action || {};
  const actionProps = action?.to ? { as: Link, to: action.to } : {};

  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center shadow-sm shadow-slate-200/60">
      {Icon && (
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
          <Icon size={24} aria-hidden="true" />
        </div>
      )}
      <h3 className="mt-4 text-base font-semibold text-slate-950">{title}</h3>
      {description && (
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
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
