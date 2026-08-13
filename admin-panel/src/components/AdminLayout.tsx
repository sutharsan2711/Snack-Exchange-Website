import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Utensils, ShoppingCart, LogOut, FolderOpen,
  Settings, ChefHat, Layout, Clock, BarChart3
} from 'lucide-react';
import { apiService } from '../services/api';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [restaurantName, setRestaurantName] = useState<string>('Loading...');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchRestaurantName = async () => {
    try {
      const rests = await apiService.getRestaurants();
      if (rests && rests.length > 0) {
        setRestaurantName(rests[0].name);
      } else {
        setRestaurantName('My Restaurant');
      }
    } catch (e) {
      console.error('Failed to fetch restaurant name in AdminLayout:', e);
      setRestaurantName('My Restaurant');
    }
  };

  useEffect(() => {
    fetchRestaurantName();
  }, [location.pathname]); // re-fetch when navigating (e.g. after updating Store Settings)

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Analytics & Reports', href: '/analytics', icon: BarChart3 },
    { name: 'Menu Manager', href: '/menu', icon: ChefHat },
    { name: 'Category Management', href: '/categories', icon: FolderOpen },
    { name: 'Order Management', href: '/orders', icon: ShoppingCart },
    { name: 'Store Customization', href: '/settings', icon: Settings },
    { name: 'Customer Footer Customizer', href: '/footer', icon: Layout },
  ];


  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between shadow-xl fixed top-0 left-0 h-full z-40">
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
            <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center font-black text-sm shrink-0">
              AD
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-white truncate">Store Manager</p>
              <p className="text-[10px] text-slate-400 font-semibold truncate">admin@snakeexchange.com</p>
            </div>
          </div>
          <button className="flex items-center space-x-3 text-slate-400 hover:text-red-400 font-bold text-sm w-full px-2 py-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer">
            <LogOut className="w-4 h-4" />
            <span>Logout Portal</span>
          </button>
        </div>
      </aside>

      {/* Main Content — offset by sidebar */}
      <div className="flex-1 flex flex-col min-h-screen ml-64">

        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 shadow-xs sticky top-0 z-30">
          <div className="font-extrabold text-slate-700 text-sm">
            Restaurant: <span className="text-indigo-600 font-black">{restaurantName}</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Live clock */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-mono">{formatTime(currentTime)}</span>
            </div>
            {/* Status pill */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              System Online
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                AD
              </div>
              <span className="text-sm font-bold text-slate-600">Store Manager</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-grow p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
};
