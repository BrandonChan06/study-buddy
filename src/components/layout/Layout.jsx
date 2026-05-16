import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function Layout() {
  return (
    <>
      <div className="grain-overlay fixed inset-0 z-50"></div>
      <Sidebar />
      <main className="ml-64 min-h-screen flex flex-col">
        <TopBar />
        <Outlet />
        <footer className="mt-auto py-lg px-margin-desktop border-t border-outline-variant/10 opacity-40 text-center">
          <p className="font-label-md text-caption uppercase tracking-[0.2em]">Ex Libris • Study Buddy • MMXXIV</p>
        </footer>
      </main>
    </>
  );
}
