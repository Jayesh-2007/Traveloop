import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import Button from './Button.jsx';

function EmptyState({ action, description, eyebrow = 'Ready when you are', icon: Icon, title }) {
  const { label, ...buttonAction } = action || {};
  const actionProps = action?.to ? { as: Link, to: action.to } : {};

  return (
    <div className="relative overflow-hidden rounded-3xl border border-dashed border-emerald-200/80 bg-white px-6 py-10 text-center shadow-sm shadow-slate-200/70 sm:px-8 sm:py-12">
      <div className="pointer-events-none absolute inset-x-8 top-7 h-24 rounded-full bg-gradient-to-r from-emerald-100 via-sky-100 to-amber-100 blur-3xl" />
      <div className="relative">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] border border-white bg-gradient-to-br from-emerald-50 via-white to-sky-50 shadow-lg shadow-emerald-900/10">
          {Icon ? (
            <Icon size={34} className="text-emerald-700" aria-hidden="true" />
          ) : (
            <Sparkles size={34} className="text-emerald-700" aria-hidden="true" />
          )}
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
          {eyebrow}
        </p>
        <h3 className="mt-3 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
          {title}
        </h3>
        {description && (
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">{description}</p>
        )}
        {action && (
          <div className="mt-7">
            <Button {...actionProps} {...buttonAction}>
              {label}
              <ArrowRight size={16} aria-hidden="true" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default EmptyState;
