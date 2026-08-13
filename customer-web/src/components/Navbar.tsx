import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, LogOut } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { SearchBar } from './SearchBar';
import { apiService } from '../services/api';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { items } = useCartStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [restaurantName, setRestaurantName] = useState('Snake Exchange');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const fetchRestaurantInfo = async () => {
      try {
        const rests = await apiService.getRestaurants();
        if (rests.length > 0) {
          setRestaurantName(rests[0].name);
        }
      } catch (error) {
        console.error('Failed to load navbar restaurant branding:', error);
      }
    };
    fetchRestaurantInfo();
  }, []);

  const handleSearch = (query: string) => {
    navigate(`/?search=${encodeURIComponent(query)}`);
  };

  return (
    <nav className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-slate-100 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-1.5 font-black text-2xl tracking-tight text-primary">
              <span>{restaurantName}</span>
            </Link>
          </div>

          {/* Desktop Search Bar (Hidden on mobile & tablet) */}
          <div className="hidden md:block flex-1 max-w-md mx-8">
            <SearchBar onSearch={handleSearch} placeholder="Search our menu..." />
          </div>

          {/* Right Actions (Desktop) */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200/70 rounded-full font-bold text-sm text-slate-800 transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-black">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span>{user.name}</span>
                </button>

                {/* User Dropdown */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-scale-up">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-extrabold text-slate-800 truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-400 font-semibold truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center space-x-2 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1.5 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-extrabold text-sm rounded-xl transition-colors cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>Login / Signup</span>
              </Link>
            )}

            <Link
              to="/cart"
              className="relative p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-primary rounded-full transition-all duration-200"
            >
              <ShoppingBag className="w-5.5 h-5.5" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[11px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Buttons */}
          <div className="flex md:hidden items-center space-x-4">
            <Link
              to="/cart"
              className="relative p-2 bg-slate-50 text-slate-700 rounded-full"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-black w-4.5 h-4.5 flex items-center justify-center rounded-full border-2 border-white shadow-xs">
                  {totalItems}
                </span>
              )}
            </Link>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-4 shadow-lg absolute w-full left-0 animate-fade-in-down">
          {/* Mobile Search */}
          <div className="py-1">
            <SearchBar onSearch={(q) => { setMobileMenuOpen(false); handleSearch(q); }} placeholder="Search our menu..." />
          </div>

          {/* Login for Mobile */}
          {isAuthenticated && user ? (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center space-x-2 text-slate-800 font-extrabold text-sm">
                <User className="w-5 h-5 text-primary" />
                <span>Signed in as {user.name}</span>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center space-x-2 text-red-600 font-bold text-xs py-1 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 text-primary font-extrabold text-sm w-full py-2 cursor-pointer"
            >
              <User className="w-5 h-5" />
              <span>Login / Signup</span>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};
