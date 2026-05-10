import { NavLink } from 'react-router-dom';
import {
  CheckSquare,
  Home,
  Luggage,
  Map,
  PlusCircle,
  Sparkles,
  StickyNote,
} from 'lucide-react';

function getNavigationLinks() {
  return [
    { to: '/', label: 'Dashboard', icon: Home, end: true },
    { to: '/trips', label: 'My Trips', icon: Luggage },
    { to: '/trips/new', label: 'Create Trip', icon: PlusCircle },
    { to: '/trips', label: 'Itinerary', icon: Map },
    { to: '/trips', label: 'Checklist', icon: CheckSquare },
    { to: '/trips', label: 'Trip Notes', icon: StickyNote },
  ].filter(Boolean);
}

function Sidebar() {
  const links = getNavigationLinks();
  const mobileLinks = links.slice(0, 4);

  return (
    <>
      <aside className="hidden border-r border-white/10 bg-slate-950 lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-72 lg:flex-col">
        <div className="flex h-full flex-col px-5 py-6">
          <div className="mb-8 rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-sm shadow-black/10">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-300 text-slate-950 shadow-lg shadow-emerald-500/20">
                <Sparkles size={19} aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">Travel Studio</p>
                <p className="text-xs font-medium text-slate-400">Plan, share, revisit</p>
              </div>
            </div>
          </div>

          <div className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Workspace
          </div>

          <nav className="space-y-1.5">
            {links.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  [
                    'group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition duration-200 ease-out',
                    isActive
                      ? 'bg-white text-slate-950 shadow-lg shadow-black/20'
                      : 'text-slate-400 hover:bg-white/10 hover:text-white',
                  ].join(' ')
                }
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 transition group-hover:bg-white/10">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-4 h-1.5 rounded-full bg-gradient-to-r from-emerald-400 via-sky-300 to-amber-300" />
            <p className="text-sm font-semibold text-white">Demo-ready flow</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Dashboard to AI planning, itinerary, checklist, budget, and share actions in a single path.
            </p>
          </div>
        </div>
      </aside>

      <nav className="fixed inset-x-3 bottom-3 z-40 rounded-3xl border border-white/80 bg-white/95 p-2 shadow-2xl shadow-slate-900/15 backdrop-blur-xl lg:hidden" aria-label="Mobile navigation">
        <div className="grid grid-cols-4 gap-1">
          {mobileLinks.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                [
                  'flex min-w-0 flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-semibold transition duration-200',
                  isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900',
                ].join(' ')
              }
            >
              <Icon size={18} aria-hidden="true" />
              <span className="max-w-full truncate">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}

export default Sidebar;
