import { Link } from 'react-router-dom';
import { Compass, Menu, UserCircle } from 'lucide-react';

function Navbar({ onMenuClick }) {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-white/95 backdrop-blur">
      <nav className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[var(--color-border)] text-[var(--color-primary)] transition hover:bg-[var(--color-surface)] lg:hidden"
            aria-label="Open navigation menu"
          >
            <Menu size={20} aria-hidden="true" />
          </button>
          <Link to="/" className="flex items-center gap-2 font-semibold text-[var(--color-primary)]">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[var(--color-primary)] text-white">
              <Compass size={21} aria-hidden="true" />
            </span>
            <span className="text-lg">Traveloop</span>
          </Link>
        </div>

        <div className="flex items-center gap-3 rounded-full border border-[var(--color-border)] bg-white py-1 pl-2 pr-3">
          <UserCircle size={28} className="text-[var(--color-primary)]" aria-hidden="true" />
          <div className="hidden leading-tight sm:block">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">Traveler</p>
            <p className="text-xs text-[var(--color-text-secondary)]">Profile</p>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
