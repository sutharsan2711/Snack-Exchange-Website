import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import { Wallet, Banknote, QrCode, CreditCard, TrendingUp, Users, Clock, ShieldCheck, Printer, CheckCircle2 } from 'lucide-react';

export const ShiftRegister: React.FC = () => {
  const { shiftSummary, activeStaff, orders } = usePos();
  const [openingCash, setOpeningCash] = useState<number>(2000);
  const [isDrawerSettled, setIsDrawerSettled] = useState(false);

  const totalCashInDrawer = openingCash + shiftSummary.cashSales;

  const handlePrintSummary = () => {
    window.print();
  };

  return (
    <div className="pb-24 pt-2 px-3 max-w-lg mx-auto space-y-3.5">
      {/* Header */}
      <div>
        <h2 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-orange-400" /> POS Shift & Cash Register
        </h2>
        <p className="text-xs text-slate-400">Current shift balance & daily collection</p>
      </div>

      {/* Staff Shift Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-extrabold text-sm border border-emerald-500/30">
              {activeStaff.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-100">{activeStaff.name}</h3>
              <p className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> {activeStaff.role} • Active Shift
              </p>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
            {shiftSummary.shiftStartTime}
          </span>
        </div>

        {/* Total Sales Big Display */}
        <div className="pt-3 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-400 font-medium">Total POS Collection</p>
            <h1 className="text-2xl font-black font-mono text-white tracking-tight">
              ₹{shiftSummary.totalSales}
            </h1>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-slate-400 font-medium">Total Orders</p>
            <h2 className="text-xl font-bold font-mono text-orange-400">
              {shiftSummary.totalOrders}
            </h2>
          </div>
        </div>
      </div>

      {/* Payment Modes Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-emerald-400">Cash</span>
            <Banknote className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="font-mono font-extrabold text-base text-slate-100">
            ₹{shiftSummary.cashSales}
          </p>
          <span className="text-[10px] text-slate-500 mt-1">In register</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-blue-400">UPI / QR</span>
            <QrCode className="w-4 h-4 text-blue-400" />
          </div>
          <p className="font-mono font-extrabold text-base text-slate-100">
            ₹{shiftSummary.upiSales}
          </p>
          <span className="text-[10px] text-slate-500 mt-1">Direct bank</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-purple-400">Card</span>
            <CreditCard className="w-4 h-4 text-purple-400" />
          </div>
          <p className="font-mono font-extrabold text-base text-slate-100">
            ₹{shiftSummary.cardSales}
          </p>
          <span className="text-[10px] text-slate-500 mt-1">POS Machine</span>
        </div>
      </div>

      {/* Cash Drawer Calculator */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-3">
        <h4 className="font-bold text-xs text-slate-200 uppercase tracking-wider">
          Physical Cash Drawer Balance
        </h4>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Opening Float / Change Cash:</span>
            <div className="flex items-center gap-1">
              <span className="text-slate-400">₹</span>
              <input
                type="number"
                value={openingCash}
                onChange={(e) => setOpeningCash(Number(e.target.value) || 0)}
                className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-right text-xs font-mono font-bold text-slate-100"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-slate-400">
            <span>Shift Cash Sales:</span>
            <span className="font-mono font-bold text-emerald-400">+₹{shiftSummary.cashSales}</span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-sm font-extrabold text-white">
            <span>Expected Cash in Drawer:</span>
            <span className="font-mono text-orange-400 text-base">₹{totalCashInDrawer}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={handlePrintSummary}
          className="py-3 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-bold text-slate-200 flex items-center justify-center gap-2 active:scale-95 transition"
        >
          <Printer className="w-4 h-4 text-orange-400" />
          Print Shift Report
        </button>

        <button
          onClick={() => {
            setIsDrawerSettled(true);
            alert(`Shift successfully closed for ${activeStaff.name}. Total sales: ₹${shiftSummary.totalSales}`);
          }}
          className="py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl text-xs font-extrabold text-white flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
        >
          <CheckCircle2 className="w-4 h-4" />
          {isDrawerSettled ? 'Shift Settled' : 'Close Shift / Settle'}
        </button>
      </div>
    </div>
  );
};

export default ShiftRegister;
