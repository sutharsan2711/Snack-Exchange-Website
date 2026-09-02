import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import { SlidersHorizontal, Printer, Volume2, Shield, Store, Smartphone, Info, Check } from 'lucide-react';

export const Settings: React.FC = () => {
  const { activeStaff, allStaff } = usePos();
  const [printerPaperWidth, setPrinterPaperWidth] = useState<'80mm' | '58mm'>('80mm');
  const [autoPrintBill, setAutoPrintBill] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [upiId, setUpiId] = useState('snackexchange@upi');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="pb-24 pt-2 px-3 max-w-lg mx-auto space-y-3.5">
      <div>
        <h2 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-orange-400" /> POS & Hardware Settings
        </h2>
        <p className="text-xs text-slate-400">Configure thermal printer, UPI QR, and device options</p>
      </div>

      {/* Printer Configuration */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-3">
        <h4 className="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <Printer className="w-4 h-4 text-orange-400" /> Thermal Printer Options
        </h4>

        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Receipt Paper Width:</span>
            <div className="flex gap-1.5">
              {(['80mm', '58mm'] as const).map((w) => (
                <button
                  key={w}
                  onClick={() => setPrinterPaperWidth(w)}
                  className={`px-3 py-1 rounded-lg font-bold border transition ${
                    printerPaperWidth === w
                      ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-slate-300">Auto Print on Order Punch:</span>
            <button
              onClick={() => setAutoPrintBill(!autoPrintBill)}
              className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                autoPrintBill ? 'bg-emerald-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  autoPrintBill ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Payment & UPI ID */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-3">
        <h4 className="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <Store className="w-4 h-4 text-blue-400" /> Store Payment UPI ID
        </h4>
        <div>
          <label className="text-[11px] text-slate-400 block mb-1">UPI VPA for Customer Dynamic QR Code:</label>
          <input
            type="text"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-hidden focus:border-orange-500"
          />
        </div>
      </div>

      {/* App & Audio Preferences */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-3">
        <h4 className="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <Smartphone className="w-4 h-4 text-purple-400" /> Device Preferences
        </h4>

        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-300 flex items-center gap-1.5">
            <Volume2 className="w-4 h-4 text-slate-400" /> Order Tap Sound & Haptics:
          </span>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
              soundEnabled ? 'bg-emerald-500' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                soundEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Staff Accounts info */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 space-y-2">
        <h4 className="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <Shield className="w-4 h-4 text-emerald-400" /> Registered Staff Accounts ({allStaff.length})
        </h4>
        <div className="space-y-1.5">
          {allStaff.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-950/60 border border-slate-800/80"
            >
              <span className="font-medium text-slate-200">
                {s.name} <span className="text-slate-500 text-[10px]">({s.role})</span>
              </span>
              <span className="font-mono text-slate-400 text-[11px]">PIN: {s.pin}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full py-3 bg-orange-500 hover:bg-orange-600 active:scale-[0.98] transition text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
      >
        {savedSuccess ? (
          <>
            <Check className="w-4 h-4" /> Settings Saved!
          </>
        ) : (
          'Save Preferences'
        )}
      </button>

      {/* App Version Info */}
      <div className="text-center text-[10px] text-slate-500 pt-2 flex items-center justify-center gap-1">
        <Info className="w-3 h-3" /> Snack Exchange Mobile POS v1.0 • Connected to Backend API
      </div>
    </div>
  );
};

export default Settings;
