import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Utensils, ShoppingCart, LogOut,
  Settings, ChefHat, Layout, Clock, BarChart3, Users
} from 'lucide-react';
import { apiService } from '../services/api';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [restaurantName, setRestaurantName] = useState<string>('Loading...');
  const [restaurantData, setRestaurantData] = useState<any>(null);
  const [isStoreOpen, setIsStoreOpen] = useState<boolean>(true);
  const [togglingStore, setTogglingStore] = useState<boolean>(false);
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('admin_user');
    if (!saved) {
      navigate('/login');
    } else {
      setAdminUser(JSON.parse(saved));
    }
  }, [navigate]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchRestaurantName = async () => {
    try {
      const rests = await apiService.getRestaurants();
      if (rests && rests.length > 0) {
        const store = rests[0];
        setRestaurantData(store);
        setRestaurantName(store.name);
        setIsStoreOpen(store.isOpen !== undefined ? store.isOpen : true);
      } else {
        setRestaurantName('My Restaurant');
      }
    } catch (e) {
      console.error('Failed to fetch restaurant name in AdminLayout:', e);
      setRestaurantName('My Restaurant');
    }
  };

  const handleToggleStoreStatus = async () => {
    if (!restaurantData || togglingStore) return;
    try {
      setTogglingStore(true);
      const newStatus = !isStoreOpen;
      const updated = await apiService.updateRestaurant(restaurantData.id, {
        ...restaurantData,
        isOpen: newStatus,
      });
      setRestaurantData(updated);
      setIsStoreOpen(updated.isOpen !== undefined ? updated.isOpen : newStatus);
    } catch (err) {
      console.error('Failed to toggle store status:', err);
    } finally {
      setTogglingStore(false);
    }
  };

  useEffect(() => {
    fetchRestaurantName();
  }, [location.pathname]); // re-fetch when navigating (e.g. after updating Store Settings)

  const handleLogout = () => {
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_token');
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Analytics & Reports', href: '/analytics', icon: BarChart3 },
    { name: 'Menu & Categories', href: '/menu', icon: ChefHat },
    { name: 'Order Management', href: '/orders', icon: ShoppingCart },
    { name: 'Staff & User Control', href: '/users', icon: Users },
    { name: 'Store Customization', href: '/settings', icon: Settings },
    { name: 'Customer Footer Customizer', href: '/footer', icon: Layout },
  ];


  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Desktop Only */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col justify-between shadow-xl fixed top-0 left-0 h-full z-40">
        <div className="p-6 space-y-8">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <Utensils className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-black text-base block leading-tight">{restaurantName || 'Snake Exchange'} Admin</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Management Portal</span>
            </div>
          </div>

          {/* Nav */}
          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar bottom: user card + logout */}
        <div className="p-5 border-t border-slate-800 space-y-3">
          <div className="flex items-center space-x-3 px-2 py-2 bg-slate-800 rounded-xl">
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center font-black text-xs shrink-0 text-white">
              {adminUser ? adminUser.name.slice(0, 2).toUpperCase() : 'AD'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-white truncate">{adminUser ? adminUser.name : 'Store Manager'}</p>
              <p className="text-[10px] text-slate-400 font-semibold truncate">{adminUser ? adminUser.email : 'admin@snakeexchange.com'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 text-slate-400 hover:text-red-400 font-bold text-sm w-full px-2 py-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Portal</span>
          </button>
        </div>
      </aside>

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col min-h-screen ml-0 md:ml-64 pb-16 md:pb-0">

        {/* Desktop Header */}
        <header className="hidden md:flex h-16 bg-white border-b border-slate-100 items-center justify-between px-8 shadow-xs sticky top-0 z-30">
          <div className="font-extrabold text-slate-700 text-sm">
            Restaurant: <span className="text-indigo-600 font-black">{restaurantName}</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Live clock */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-mono">{formatTime(currentTime)}</span>
            </div>
            {/* Interactive Store Status Button */}
            <button
              type="button"
              onClick={handleToggleStoreStatus}
              disabled={togglingStore}
              title="Click to Toggle Store Online / Offline"
              className={`flex items-center gap-2 text-xs font-black px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer shadow-xs ${
                isStoreOpen
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isStoreOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              <span>{isStoreOpen ? 'Store Online' : 'Store Offline'}</span>
              <span className={`px-1.5 py-0.2 text-[9px] rounded-md font-black text-white ${isStoreOpen ? 'bg-emerald-600' : 'bg-rose-600'}`}>
                {isStoreOpen ? 'ON' : 'OFF'}
              </span>
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                {adminUser ? adminUser.name.slice(0, 2).toUpperCase() : 'AD'}
              </div>
              <span className="text-sm font-bold text-slate-600">{adminUser ? adminUser.name : 'Store Manager'}</span>
            </div>
          </div>
        </header>

        {/* Mobile Header (matching user's screenshot) */}
        <header className="flex md:hidden bg-white border-b border-slate-100 px-6 py-4 flex-col justify-center sticky top-0 z-35 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-black text-slate-800 tracking-tight leading-tight">
                {restaurantName || 'Snack Exchange'} - Saravanampatti
              </h1>
              <p className="text-xs text-slate-400 font-bold tracking-wide mt-0.5">
                Saravanampatti
              </p>
            </div>
            <button className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-grow p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex justify-around items-center z-50 md:hidden shadow-lg">
          {/* Orders */}
          <Link
            to="/orders"
            className={`flex flex-col items-center justify-center w-20 h-full space-y-1 transition-colors cursor-pointer ${
              location.pathname === '/orders' ? 'text-orange-600 font-black' : 'text-slate-400 hover:text-slate-650'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/></svg>
            <span className="text-[10px] font-bold">Orders</span>
          </Link>

          {/* Menu */}
          <Link
            to="/menu"
            className={`flex flex-col items-center justify-center w-20 h-full space-y-1 transition-colors cursor-pointer ${
              location.pathname === '/menu' ? 'text-orange-600 font-black' : 'text-slate-400 hover:text-slate-650'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            <span className="text-[10px] font-bold">Menu</span>
          </Link>

          {/* Complaints */}
          <button
            onClick={() => alert("Complaints module is coming soon!")}
            className="flex flex-col items-center justify-center w-20 h-full space-y-1 text-slate-400 hover:text-slate-650 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span className="text-[10px] font-bold">Complaints</span>
          </button>

          {/* Reviews */}
          <button
            onClick={() => alert("Reviews module is coming soon!")}
            className="flex flex-col items-center justify-center w-20 h-full space-y-1 text-slate-400 hover:text-slate-650 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <span className="text-[10px] font-bold">Reviews</span>
          </button>
        </div>

      </div>
    </div>
  );
};
