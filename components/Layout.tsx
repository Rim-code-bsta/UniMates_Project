import React, { useEffect, useState } from 'react';
import { Home, MessageCircle, User, Settings, ShieldAlert } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { User as UserType, UserRole } from '../types';
import { getUnreadCounts } from '../services/dbService';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: UserType | null;
}

const Layout: React.FC<LayoutProps> = ({ children, currentUser }) => {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const isAuthPage = location.pathname === '/' || location.pathname === '/register' || location.pathname === '/setup';

  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
        setUnreadCount(getUnreadCounts(currentUser.id));
    }, 2000);
    return () => clearInterval(interval);
  }, [currentUser]);

  if (isAuthPage) {
    return <div className="min-h-screen bg-slate-50">{children}</div>;
  }

  // Determine Navigation Items based on Role
  let navItems = [];
  
  if (currentUser?.role === UserRole.ADMIN) {
    // Admin Navigation: Restricted (No matching, no chat)
    navItems = [
        { icon: ShieldAlert, label: 'Admin Dashboard', path: '/admin' },
        { icon: User, label: 'Profile', path: '/profile' }
    ];
  } else {
    // Student Navigation
    navItems = [
        { icon: Home, label: 'Home', path: '/home' },
        { icon: MessageCircle, label: 'Matches', path: '/matches', badge: unreadCount },
        { icon: User, label: 'Profile', path: '/profile' },
        { icon: Settings, label: 'Settings', path: '/settings' }
    ];
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0 md:pl-64">
      {/* Desktop Sidebar (Optional enhancement) */}
      <div className="hidden md:flex fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 flex-col p-6 z-50">
        <h1 className="text-2xl font-bold text-primary-600 mb-8">UniMates</h1>
        <nav className="space-y-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative ${
                location.pathname === item.path
                  ? 'bg-primary-50 text-primary-600 font-semibold'
                  : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <item.icon size={20} />
              {item.label}
              {item.badge ? (
                <span className="absolute right-4 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto min-h-screen">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-lg border-t border-slate-200 px-6 py-3 flex justify-between items-center z-50 pb-safe">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 transition-colors relative ${
              location.pathname.startsWith(item.path)
                ? 'text-primary-600'
                : 'text-slate-400'
            }`}
          >
            <div className="relative">
                <item.icon
                size={24}
                strokeWidth={location.pathname.startsWith(item.path) ? 2.5 : 2}
                />
                {item.badge ? (
                    <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                        {item.badge > 9 ? '9+' : item.badge}
                    </span>
                ) : null}
            </div>
            <span className="text-[10px] font-medium text-center">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Layout;