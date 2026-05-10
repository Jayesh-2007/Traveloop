import { NavLink } from 'react-router-dom';
import { Home, Luggage, PlusCircle, Sparkles, StickyNote } from 'lucide-react';

const links = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/trips', label: 'My Trips', icon: Luggage },
  { to: '/trips/new', label: 'Create Trip', icon: PlusCircle },
  { to: '/trips/demo/notes', label: 'Trip Notes', icon: StickyNote },
];

function Sidebar() {
  return (
    <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-72 lg:flex-col border-r border-slate-200 bg-slate-950">
      <div className="flex h-full flex-col px-5 py-6">
        <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-sm shadow-black/10">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950">
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
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                [
                  'group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium transition duration-200',
                  isActive
                    ? 'bg-white text-slate-950 shadow-sm shadow-black/20'
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

        <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.04] p-4">
          <p className="text-sm font-semibold text-white">Next best trip</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Keep your saved routes, notes, and packing plans moving in one workspace.
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
