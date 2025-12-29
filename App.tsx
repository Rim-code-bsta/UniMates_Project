import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './components/Auth';
import ProfileSetup from './components/ProfileSetup';
import Home from './components/Home';
import ChatList from './components/ChatList';
import ChatRoom from './components/ChatRoom';
import AdminDashboard from './components/AdminDashboard';
import Layout from './components/Layout';
import Settings from './components/Settings';
import Profile from './components/Profile';
import UserProfile from './components/UserProfile';
import { User, UserRole, Notification } from './types';
import { getNotifications, markNotificationRead, getUserById } from './services/dbService';
import { Bell, X } from 'lucide-react';

// Toast Notification Component
const NotificationToast = ({ userId }: { userId: string }) => {
    const [activeNotif, setActiveNotif] = useState<Notification | null>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            const notifs = getNotifications(userId);
            const latest = notifs.find(n => !n.read);
            if (latest && (!activeNotif || latest.id !== activeNotif.id)) {
                setActiveNotif(latest);
                // Auto dismiss after 5 seconds
                setTimeout(() => {
                    markNotificationRead(latest.id);
                    setActiveNotif(null);
                }, 5000);
            }
        }, 2000);
        return () => clearInterval(interval);
    }, [userId, activeNotif]);

    if (!activeNotif) return null;

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl p-4 border border-slate-200 z-[100] animate-slide-up flex gap-3 items-start">
            <div className="bg-primary-100 p-2 rounded-full text-primary-600">
                <Bell size={20} />
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-slate-800 text-sm">{activeNotif.title}</h4>
                <p className="text-slate-600 text-xs mt-0.5 line-clamp-2">{activeNotif.message}</p>
            </div>
            <button onClick={() => { markNotificationRead(activeNotif.id); setActiveNotif(null); }} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
            </button>
        </div>
    );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('unimates_session');
  };

  useEffect(() => {
    // Check local storage for persistent login session
    const storedUser = localStorage.getItem('unimates_session');
    if (storedUser) {
        try {
            const parsedUser = JSON.parse(storedUser);
            // Verify against database to ensure user is not banned and data is up to date
            const freshUser = getUserById(parsedUser.id);
            
            if (freshUser && !freshUser.isBanned) {
                setUser(freshUser);
                localStorage.setItem('unimates_session', JSON.stringify(freshUser));
            } else {
                // User is banned or deleted
                handleLogout();
            }
        } catch (e) {
            handleLogout();
        }
    }
    setLoading(false);
  }, []);

  // Poll for ban status while logged in
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
        const fresh = getUserById(user.id);
        if (!fresh || fresh.isBanned) {
            handleLogout();
            alert("Your account has been suspended.");
            window.location.href = '#/';
        }
    }, 2000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('unimates_session', JSON.stringify(loggedInUser));
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('unimates_session', JSON.stringify(updatedUser));
  };

  if (loading) return null;

  return (
    <HashRouter>
      <Layout currentUser={user}>
        {user && <NotificationToast userId={user.id} />}
        <Routes>
          <Route 
            path="/" 
            element={user ? (user.role === UserRole.ADMIN ? <Navigate to="/admin" /> : <Navigate to="/home" />) : <Auth onLogin={handleLogin} />} 
          />
          <Route 
            path="/register" 
            element={user ? (user.role === UserRole.ADMIN ? <Navigate to="/admin" /> : <Navigate to="/home" />) : <Auth onLogin={handleLogin} />} 
          />
          <Route 
            path="/setup" 
            element={user ? <ProfileSetup user={user} onUpdateUser={handleUpdateUser} /> : <Navigate to="/" />} 
          />
          
          {/* Student Protected Routes */}
          <Route 
            path="/home" 
            element={user ? (user.role === UserRole.ADMIN ? <Navigate to="/admin" /> : <Home currentUser={user} />) : <Navigate to="/" />} 
          />
          <Route 
            path="/matches" 
            element={user ? (user.role === UserRole.ADMIN ? <Navigate to="/admin" /> : <ChatList currentUser={user} />) : <Navigate to="/" />} 
          />
          <Route 
            path="/chat/:matchId" 
            element={user ? (user.role === UserRole.ADMIN ? <Navigate to="/admin" /> : <ChatRoom currentUser={user} />) : <Navigate to="/" />} 
          />
          <Route 
            path="/settings" 
            element={user ? (user.role === UserRole.ADMIN ? <Navigate to="/admin" /> : <Settings currentUser={user} onLogout={handleLogout} />) : <Navigate to="/" />} 
          />

          {/* Shared Routes */}
          <Route 
            path="/user/:userId" 
            element={user ? <UserProfile currentUser={user} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/profile" 
            element={user ? <Profile user={user} onLogout={handleLogout} /> : <Navigate to="/" />} 
          />
           
           {/* Admin Protected Routes */}
          <Route 
            path="/admin" 
            element={user?.role === UserRole.ADMIN ? <AdminDashboard /> : <Navigate to="/home" />} 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;