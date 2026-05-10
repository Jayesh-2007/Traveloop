import { Outlet } from 'react-router-dom';
import Navbar from '../components/shared/Navbar.jsx';
import Sidebar from '../components/shared/Sidebar.jsx';

function AppLayout() {
  return (
    <div className="min-h-screen overflow-x-hidden text-slate-950">
      <Sidebar />
      <div className="min-h-screen lg:pl-72">
        <Navbar />
        <main className="px-4 pb-28 pt-5 sm:px-7 sm:pt-7 lg:px-10 lg:pb-10">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
