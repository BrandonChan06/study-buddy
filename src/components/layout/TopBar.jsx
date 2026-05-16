import { useLocation } from 'react-router-dom';

export default function TopBar() {
  const location = useLocation();
  const pathName = location.pathname.substring(1).charAt(0).toUpperCase() + location.pathname.slice(2);

  return (
    <header className="docked full-width top-0 sticky bg-surface dark:bg-surface-dim bg-surface-container-low flex justify-between items-center w-full px-margin-desktop h-16 z-30">
      <div className="flex items-center gap-sm">
        <span className="text-on-surface-variant font-label-md text-label-md">Home</span>
        <span className="text-on-surface-variant/40">/</span>
        <span className="text-primary font-bold border-b-2 border-primary pb-1 font-label-md text-label-md">{pathName || 'Dashboard'}</span>
      </div>
      <div className="flex items-center gap-lg">
        <div className="relative group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input className="bg-surface-container-lowest border border-outline-variant/20 rounded-full py-xs pl-10 pr-md focus:outline-none focus:border-primary/50 text-label-md font-label-md w-64 transition-all duration-300" placeholder="Search archives..." type="text"/>
        </div>
        <div className="flex items-center gap-md">
          <button className="text-on-surface-variant hover:text-on-surface transition-opacity focus:outline-none">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/30">
            <img alt="User Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDX7Z9oVc8u8Co6Q0DIo5gLvqdG2WV-cDXf3CtZEOeDCRZRLHK4N5VwUJ2dsZUTjjwVg7JUUqD1vToC8WCU5dvakHbjZ11eH_YpprmvgFlj30xUiSGLBK4CLCv3xpupnvXEJfm1icOgigdPSoSYr2qQ1g6FWe8XoqqIkCl_wBTNnlupDaG3W2G3jvoJTaKGbJ1fRSBskO_-OWlu2j7m7M13APGKhJN7m7rttLiZGW4vA48BGt-BLlzXjESI-yn7Yp-tOLBZlh1qJsg"/>
          </div>
        </div>
      </div>
    </header>
  );
}
