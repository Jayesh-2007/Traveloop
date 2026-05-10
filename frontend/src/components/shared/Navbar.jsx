import { Link } from 'react-router-dom';
import { Bell, Compass, PlusCircle, Search, Sparkles } from 'lucide-react';

function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/80 bg-white/85 shadow-sm shadow-slate-200/60 backdrop-blur-xl">
      <nav className="flex h-20 items-center justify-between gap-4 px-5 sm:px-7 lg:px-10">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-900/20">
            <Compass size={22} aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-semibold text-slate-950">Traveloop</span>
            <span className="hidden truncate text-xs font-medium text-slate-500 sm:block">
              Travel planning workspace
            </span>
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 justify-center px-4 md:flex">
          <div className="relative w-full max-w-xl">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search trips, destinations, notes..."
              className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-200 focus:bg-white focus:ring-4 focus:ring-emerald-700/10"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="hidden items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100 lg:flex"
          >
            <Sparkles size={16} aria-hidden="true" />
            AI Planner
          </Link>
          <Link
            to="/trips/new"
            className="hidden items-center gap-2 rounded-2xl bg-slate-950 px-3.5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-slate-800 sm:flex"
          >
            <PlusCircle size={16} aria-hidden="true" />
            Plan Trip
          </Link>
          <button
            type="button"
            className="hidden h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm shadow-slate-200/60 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-700 sm:flex"
            aria-label="Notifications"
          >
            <Bell size={18} aria-hidden="true" />
          </button>
          <Link
            to="/profile"
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 shadow-sm shadow-slate-200/60 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-sm font-semibold text-white">
              TR
            </span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-sm font-semibold text-slate-900">Traveler</span>
              <span className="block text-xs font-medium text-slate-500">Profile</span>
            </span>
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
