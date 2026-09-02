import React from 'react';
import { PosOrder } from '../types/pos';
import { Printer, Share2, CheckCircle, X, QrCode } from 'lucide-react';

interface ReceiptModalProps {
  order: PosOrder;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `POS Receipt - ${order.id}`,
        text: `Snack Exchange POS Bill #${order.id} | Total: ₹${order.total} | ${order.address}`,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`Snack Exchange POS Bill #${order.id} | Total: ₹${order.total}`);
      alert('Bill details copied to clipboard!');
    }
  };

  const orderTimeFormatted = new Date(order.createdAt).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm flex flex-col shadow-2xl overflow-hidden max-h-[90vh]">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-center text-white relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/20 text-white flex items-center justify-center hover:bg-black/30 transition"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-12 h-12 rounded-full bg-white/20 mx-auto flex items-center justify-center mb-1">
            <CheckCircle className="w-7 h-7 text-white" />
          </div>
          <h3 className="font-extrabold text-base">Bill Generated Successfully!</h3>
          <p className="text-xs text-emerald-100 font-mono">Invoice ID: #{order.id}</p>
        </div>

        {/* Printable Thermal Receipt Simulation */}
        <div className="p-4 overflow-y-auto flex-1">
          <div
            id="thermal-receipt-content"
            className="bg-white text-slate-900 p-4 rounded-xl shadow-inner font-mono text-xs space-y-3 border border-slate-200"
          >
            {/* Store Banner */}
            <div className="text-center pb-2 border-b border-dashed border-slate-400">
              <h2 className="font-black text-sm uppercase tracking-wider text-slate-900">Snack Exchange</h2>
              <p className="text-[10px] text-slate-600">Restaurant & Food POS</p>
              <p className="text-[9px] text-slate-500">GSTIN: 29AAAAA0000A1Z5</p>
              <p className="text-[9px] text-slate-500">Ph: +91 98765 43210</p>
            </div>

            {/* Order Info */}
            <div className="text-[11px] space-y-0.5 text-slate-700">
              <div className="flex justify-between">
                <span>Bill No:</span>
                <span className="font-bold text-slate-900">#{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Date & Time:</span>
                <span>{orderTimeFormatted}</span>
              </div>
              <div className="flex justify-between">
                <span>Order Mode:</span>
                <span className="font-bold uppercase text-slate-900">
                  {order.orderType === 'takeaway' ? 'Takeaway Parcel' : 'POS Counter Bill'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Billed By:</span>
                <span>{order.staffName}</span>
              </div>
              {order.customerName && order.customerName !== 'Walk-In Guest' && (
                <div className="flex justify-between">
                  <span>Customer:</span>
                  <span>{order.customerName}</span>
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="border-t border-b border-dashed border-slate-400 py-2 space-y-1.5">
              <div className="flex justify-between font-bold text-[11px] pb-1 border-b border-slate-200">
                <span className="flex-1">Item</span>
                <span className="w-10 text-center">Qty</span>
                <span className="w-14 text-right">Amt</span>
              </div>
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-[11px]">
                  <span className="flex-1 truncate pr-1">
                    {item.foodName || item.foodItem?.name || `Item ${idx + 1}`}
                  </span>
                  <span className="w-10 text-center">x{item.quantity}</span>
                  <span className="w-14 text-right font-bold">
                    ₹{(item.price || item.foodItem?.price || 0) * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            {/* Calculation Breakup */}
            <div className="space-y-1 text-[11px] text-slate-700">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{order.subtotal}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount:</span>
                  <span>-₹{order.discount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>GST (5%):</span>
                <span>₹{order.tax}</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-1 border-t border-slate-300">
                <span>Grand Total:</span>
                <span>₹{order.total}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span>Payment Mode:</span>
                <span className="font-bold uppercase text-emerald-700">{order.paymentMethod} (PAID)</span>
              </div>
            </div>

            {/* UPI QR Code Preview */}
            {order.paymentMethod === 'UPI' && (
              <div className="pt-2 pb-1 text-center border-t border-dashed border-slate-300">
                <div className="inline-block p-2 bg-slate-100 rounded-lg border border-slate-300 mb-1">
                  <QrCode className="w-16 h-16 mx-auto text-slate-800" />
                </div>
                <p className="text-[9px] text-slate-500 font-sans">UPI ID: snackexchange@upi</p>
              </div>
            )}

            {/* Footer */}
            <div className="text-center pt-2 border-t border-dashed border-slate-400 text-[10px] text-slate-600">
              <p>*** THANK YOU! VISIT AGAIN ***</p>
              <p className="text-[8px] text-slate-400 mt-0.5">Powered by Snack Exchange Staff POS</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 grid grid-cols-3 gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition active:scale-95"
          >
            <Printer className="w-4 h-4 text-orange-400" /> Print
          </button>
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition active:scale-95"
          >
            <Share2 className="w-4 h-4 text-blue-400" /> Share
          </button>
          <button
            onClick={onClose}
            className="flex items-center justify-center gap-1.5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs rounded-xl shadow-md transition active:scale-95"
          >
            New Bill
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
