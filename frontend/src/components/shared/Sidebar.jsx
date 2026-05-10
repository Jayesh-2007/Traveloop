import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Luggage, PlusCircle, User, X } from 'lucide-react';

const navigationLinks = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/trips', label: 'My Trips', icon: Luggage },
  { to: '/trips/new', label: 'Create Trip', icon: PlusCircle },
  { to: '/profile', label: 'Profile', icon: User },
];

function SidebarContent({ onNavigate }) {
  return (
    <nav className="space-y-1">
      {navigationLinks.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          onClick={onNavigate}
          className={({ isActive }) =>
            [
              'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition',
              isActive
                ? 'bg-[var(--color-primary)] text-white shadow-sm'
                : 'text-[var(--color-text-secondary)] hover:bg-white hover:text-[var(--color-primary)]',
            ].join(' ')
          }
        >
          <Icon size={18} aria-hidden="true" />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

function Sidebar({ isOpen = false, onClose }) {
  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-6 lg:block">
        <SidebarContent />
      </aside>

      <div
        className={[
          'fixed inset-0 z-40 bg-[var(--color-text-primary)]/35 transition-opacity lg:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-5 shadow-xl transition-transform duration-200 lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        aria-label="Mobile navigation"
      >
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
            Navigation
          </p>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--color-border)] bg-white text-[var(--color-primary)]"
            aria-label="Close navigation menu"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <SidebarContent onNavigate={onClose} />
      </aside>
    </>
  );
}

export default Sidebar;
