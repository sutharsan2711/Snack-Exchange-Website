import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import { UtensilsCrossed, RefreshCw, ShoppingBag, Zap } from 'lucide-react';
import StaffSwitchModal from './StaffSwitchModal';

export const Header: React.FC = () => {
  const { activeStaff, orderType, setOrderType, refreshOrders, isLoading } = usePos();
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSync = async () => {
    setIsRefreshing(true);
    await refreshOrders();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const toggleOrderType = () => {
    setOrderType(orderType === 'pos_counter' ? 'takeaway' : 'pos_counter');
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80 px-3.5 py-2.5 flex items-center justify-between shadow-lg">
        {/* Left: Branding & Billing Mode Toggle */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-md shadow-orange-500/20 text-white font-black text-base">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1">
                Snack Exchange <span className="text-[10px] bg-orange-500/20 text-orange-400 font-mono px-1.5 py-0.5 rounded border border-orange-500/30">POS BILLING</span>
              </h1>
            </div>
            {/* Quick Mode Switcher */}
            <button
              onClick={toggleOrderType}
              className="mt-0.5 inline-block text-left active:scale-95 transition-transform"
            >
              {orderType === 'pos_counter' ? (
                <span className="flex items-center gap-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[11px] font-bold">
                  <Zap className="w-3 h-3" /> Counter Bill (Tap to switch)
                </span>
              ) : (
                <span className="flex items-center gap-1 bg-blue-500/15 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full text-[11px] font-bold">
                  <ShoppingBag className="w-3 h-3" /> Takeaway Parcel (Tap to switch)
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Right: Sync & Staff Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSync}
            disabled={isRefreshing || isLoading}
            className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-300 active:bg-slate-700 transition"
            title="Refresh Orders & Menu"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-orange-400' : ''}`} />
          </button>

          <button
            onClick={() => setShowStaffModal(true)}
            className="flex items-center gap-1.5 bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 rounded-full pl-1.5 pr-2.5 py-1 active:scale-95 transition-all text-xs"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-[10px]">
              {activeStaff.name.charAt(0)}
            </div>
            <div className="text-left leading-tight max-w-[70px] truncate">
              <span className="font-semibold text-slate-200 block truncate">{activeStaff.name.split(' ')[0]}</span>
              <span className="text-[9px] text-emerald-400 font-mono block">{activeStaff.role}</span>
            </div>
          </button>
        </div>
      </header>

      {/* Staff Modal */}
      {showStaffModal && <StaffSwitchModal onClose={() => setShowStaffModal(false)} />}
    </>
  );
};

export default Header;
