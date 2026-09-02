import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import { StaffMember } from '../types/pos';
import { X, Lock, CheckCircle2, ShieldCheck } from 'lucide-react';

interface StaffSwitchModalProps {
  onClose: () => void;
}

export const StaffSwitchModal: React.FC<StaffSwitchModalProps> = ({ onClose }) => {
  const { allStaff, activeStaff, switchStaff } = usePos();
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleStaffClick = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setEnteredPin('');
    setErrorMsg('');
  };

  const handleNumberInput = (num: string) => {
    if (enteredPin.length < 4) {
      const nextPin = enteredPin + num;
      setEnteredPin(nextPin);
      setErrorMsg('');

      if (nextPin.length === 4 && selectedStaff) {
        if (nextPin === selectedStaff.pin) {
          switchStaff(selectedStaff);
          onClose();
        } else {
          setErrorMsg('Incorrect 4-digit Staff PIN');
          setTimeout(() => setEnteredPin(''), 500);
        }
      }
    }
  };

  const handleDelete = () => {
    setEnteredPin((prev) => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl w-full max-w-sm flex flex-col shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">Staff Profile Switcher</h3>
              <p className="text-xs text-slate-400">Select staff member and enter PIN</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Staff Selection Grid */}
        {!selectedStaff ? (
          <div className="p-4 space-y-2.5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Account</p>
            <div className="grid grid-cols-2 gap-2">
              {allStaff.map((st) => {
                const isActive = activeStaff.id === st.id;
                return (
                  <button
                    key={st.id}
                    onClick={() => handleStaffClick(st)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all active:scale-95 ${
                      isActive
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 ring-2 ring-emerald-500/30'
                        : 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600 text-slate-200'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                      {st.name.charAt(0)}
                    </div>
                    <div className="flex-1 truncate">
                      <p className="font-bold text-xs truncate">{st.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{st.role}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 text-center mt-3">
              Default demo PINs: <span className="font-mono text-slate-400">1111</span> (Waiter), <span className="font-mono text-slate-400">2222</span> (Cashier)
            </p>
          </div>
        ) : (
          /* PIN Entry Screen */
          <div className="p-4 flex flex-col items-center">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white font-bold flex items-center justify-center text-sm shadow-md">
                {selectedStaff.name.charAt(0)}
              </div>
              <div className="text-left">
                <p className="font-extrabold text-sm text-slate-100">{selectedStaff.name}</p>
                <p className="text-xs text-emerald-400">{selectedStaff.role}</p>
              </div>
            </div>

            <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> Enter 4-Digit Staff PIN
            </p>

            {/* PIN Dots */}
            <div className="flex items-center gap-3 my-3">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full border transition-all ${
                    enteredPin.length > idx
                      ? 'bg-emerald-400 border-emerald-400 shadow-md shadow-emerald-500/40 scale-110'
                      : 'bg-slate-800 border-slate-700'
                  }`}
                />
              ))}
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-400 font-medium mb-2 animate-shake">{errorMsg}</p>
            )}

            {/* Numeric Keypad */}
            <div className="grid grid-cols-3 gap-2 w-full max-w-[240px] mt-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
                <button
                  key={k}
                  onClick={() => {
                    if (k === 'C') setEnteredPin('');
                    else if (k === '⌫') handleDelete();
                    else handleNumberInput(k);
                  }}
                  className="h-12 rounded-xl bg-slate-800 hover:bg-slate-700/80 active:bg-emerald-600 active:text-white border border-slate-700 font-bold text-lg text-slate-100 flex items-center justify-center transition active:scale-95 shadow-sm"
                >
                  {k}
                </button>
              ))}
            </div>

            <button
              onClick={() => setSelectedStaff(null)}
              className="mt-3 text-xs text-slate-400 hover:text-slate-200 underline"
            >
              Choose different staff
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffSwitchModal;
