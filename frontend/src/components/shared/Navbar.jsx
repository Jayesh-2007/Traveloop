import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

function Navbar() {
  return (
    <header className="border-b border-[var(--color-border)] bg-white">
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 font-semibold text-[var(--color-primary)]">
          <Compass size={24} aria-hidden="true" />
          <span>Traveloop</span>
        </Link>
        <Link
          to="/profile"
          className="text-sm font-medium text-[var(--color-text-secondary)] transition hover:text-[var(--color-primary)]"
        >
          Profile
        </Link>
      </nav>
    </header>
  );
}

export default Navbar;
