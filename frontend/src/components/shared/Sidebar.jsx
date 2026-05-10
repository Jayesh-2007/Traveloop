import { NavLink } from 'react-router-dom';
import { Home, Luggage, PlusCircle, StickyNote } from 'lucide-react';

const links = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/trips', label: 'My Trips', icon: Luggage },
  { to: '/trips/new', label: 'Create Trip', icon: PlusCircle },
  { to: '/trips/demo/notes', label: 'Trip Notes', icon: StickyNote },
];

function Sidebar() {
  return (
    <aside className="hidden w-56 shrink-0 md:block">
      <div className="sticky top-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
        <nav className="space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-[var(--color-text-secondary)] hover:bg-white hover:text-[var(--color-primary)]',
                ].join(' ')
              }
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}

export default Sidebar;
