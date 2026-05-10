import { Outlet } from 'react-router-dom';
import Navbar from '../components/shared/Navbar.jsx';
import Sidebar from '../components/shared/Sidebar.jsx';

function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <Sidebar />
      <div className="min-h-screen lg:pl-72">
        <Navbar />
        <main className="h-[calc(100vh-5rem)] overflow-y-auto px-4 py-6 sm:px-7 lg:px-10">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
