import { Outlet } from 'react-router-dom';
import Navbar from '../components/shared/Navbar.jsx';
import Sidebar from '../components/shared/Sidebar.jsx';

function AppLayout() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-primary)]">
      <Navbar />
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
