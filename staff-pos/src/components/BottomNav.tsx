import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, ClipboardList, Wallet, SlidersHorizontal } from 'lucide-react';
import { usePos } from '../context/PosContext';

export const BottomNav: React.FC = () => {
  const { totalItemsCount, orders } = usePos();

  const activeOrdersCount = orders.filter(
    (o) => o.status !== 'Completed' && o.status !== 'Cancelled' && o.status !== 'Delivered'
  ).length;

  const navItems = [
    {
      to: '/',
      label: 'Terminal',
      icon: LayoutGrid,
      badge: totalItemsCount > 0 ? totalItemsCount : null,
      badgeColor: 'bg-orange-500',
    },
    {
      to: '/orders',
      label: 'Orders',
      icon: ClipboardList,
      badge: activeOrdersCount > 0 ? activeOrdersCount : null,
      badgeColor: 'bg-emerald-500',
    },
    {
      to: '/register',
      label: 'Shift Sales',
      icon: Wallet,
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: SlidersHorizontal,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/80 px-2 py-1.5 shadow-2xl safe-area-bottom">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
                  isActive
                    ? 'text-orange-400 font-bold scale-105'
                    : 'text-slate-400 hover:text-slate-200 font-medium'
                }`
              }
            >
              <div className="relative">
                <Icon className="w-5 h-5 mb-0.5" />
                {item.badge !== null && (
                  <span
                    className={`absolute -top-1.5 -right-2.5 ${item.badgeColor} text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-scale`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] tracking-tight">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
