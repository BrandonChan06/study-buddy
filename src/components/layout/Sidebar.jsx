import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { name: 'Lecture Input', path: '/input', icon: 'history_edu' },
    { name: 'Flashcards', path: '/flashcards', icon: 'auto_stories' },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container dark:bg-surface-container-low border-r border-outline-variant/10 flex flex-col py-xl px-md z-40">
      <div className="mb-xl px-xs">
        <div className="flex items-center gap-sm mb-base">
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center border border-outline-variant/20">
            <span className="font-display-lg text-headline-md text-primary-fixed-dim" style={{ fontSize: '18px' }}>JD</span>
          </div>
          <div>
            <h1 className="font-display-lg text-headline-lg text-primary-fixed-dim tracking-tight">Study Buddy</h1>
            <p className="font-body-md text-caption text-on-surface-variant opacity-60">Scholarly Pursuit</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-xs">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-sm px-md py-sm rounded-lg transition-colors duration-200 ${
                isActive
                  ? 'text-primary font-bold border-r-2 border-primary bg-primary-container/10 Active: scale-95 transition-transform'
                  : 'text-on-surface-variant font-medium hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-body-md text-body-md">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
