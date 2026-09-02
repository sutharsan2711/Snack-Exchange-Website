import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import { ShoppingBag, Plus, Minus, Trash2, ChevronUp, ChevronDown, Check, QrCode, Banknote, CreditCard, MessageSquare, Percent } from 'lucide-react';
import { PosOrder } from '../types/pos';
import ReceiptModal from './ReceiptModal';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onClose }) => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    updateItemNotes,
    clearCart,
    cartSubtotal,
    taxAmount,
    discountAmount,
    discountPercent,
    setDiscountPercent,
    cartTotal,
    totalItemsCount,
    orderType,
    submitOrder,
    activeStaff,
  } = usePos();

  const [isExpanded, setIsExpanded] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'UPI' | 'CARD'>('CASH');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [editingNoteItemId, setEditingNoteItemId] = useState<string | null>(null);
  const [itemNoteText, setItemNoteText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<PosOrder | null>(null);

  if (cart.length === 0 && !placedOrder) {
    return null;
  }

  const handleOpenNoteModal = (itemId: string, currentNotes: string = '') => {
    setEditingNoteItemId(itemId);
    setItemNoteText(currentNotes);
  };

  const handleSaveItemNote = () => {
    if (editingNoteItemId) {
      updateItemNotes(editingNoteItemId, itemNoteText);
      setEditingNoteItemId(null);
    }
  };

  const handlePunchOrder = async () => {
    if (cart.length === 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const order = await submitOrder(paymentMethod, customerName, customerPhone, orderNotes);
      if (order) {
        setPlacedOrder(order);
        setCustomerName('');
        setCustomerPhone('');
        setOrderNotes('');
        setIsExpanded(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Placed Order Receipt Modal */}
      {placedOrder && (
        <ReceiptModal
          order={placedOrder}
          onClose={() => {
            setPlacedOrder(null);
            onClose();
          }}
        />
      )}

      {/* Cart Backdrop when expanded */}
      {isExpanded && (
        <div
          onClick={() => setIsExpanded(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
        />
      )}

      {/* Sticky Bottom Cart Bar / Sliding Sheet */}
      <div
        className={`fixed left-0 right-0 bottom-[56px] z-40 bg-slate-900 border-t border-slate-800 shadow-2xl transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[85vh] rounded-t-3xl' : 'max-h-[68px] rounded-none'
        } flex flex-col`}
      >
        {/* Floating Mini Bar (when collapsed) */}
        {!isExpanded && (
          <div
            onClick={() => setIsExpanded(true)}
            className="px-4 py-2.5 flex items-center justify-between cursor-pointer bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black relative shadow-lg shadow-orange-500/20">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-1.5 bg-slate-950 text-orange-400 border border-orange-500/50 text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {totalItemsCount}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm text-slate-100 font-mono">₹{cartTotal}</span>
                  <span className="text-[10px] text-slate-400">({totalItemsCount} items)</span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  {orderType === 'takeaway' ? 'Takeaway Parcel' : 'Counter Billing'} • Tap to View Bill
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(true);
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1 shadow-md active:scale-95 transition"
              >
                View Bill <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Expanded Full Cart Drawer */}
        {isExpanded && (
          <div className="flex flex-col h-full max-h-[85vh] overflow-hidden">
            {/* Sheet Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                    POS Counter Bill
                    <span className="text-xs bg-slate-800 text-slate-300 font-normal px-2 py-0.5 rounded-full">
                      {orderType === 'takeaway' ? 'Takeaway' : 'Counter'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">Billed by {activeStaff.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={clearCart}
                  className="p-2 text-rose-400 hover:text-rose-300 text-xs font-semibold flex items-center gap-1 hover:bg-rose-500/10 rounded-lg transition"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center hover:text-white"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${item.food.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <p className="font-bold text-xs text-slate-200 truncate">{item.food.name}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-mono font-semibold text-slate-400">
                        ₹{item.selectedPrice} × {item.quantity} =
                      </span>
                      <span className="text-xs font-mono font-bold text-orange-400">
                        ₹{item.selectedPrice * item.quantity}
                      </span>
                    </div>
                    {item.notes ? (
                      <p className="text-[10px] text-amber-400/90 italic mt-0.5 flex items-center gap-1">
                        <MessageSquare className="w-2.5 h-2.5" /> {item.notes}
                      </p>
                    ) : null}
                  </div>

                  {/* Quantity Stepper & Note Button */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenNoteModal(item.id, item.notes)}
                      className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition"
                      title="Add special instructions"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center bg-slate-800 border border-slate-700/80 rounded-lg overflow-hidden">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-7 h-7 flex items-center justify-center text-slate-300 active:bg-slate-700 transition"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold font-mono text-slate-100">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-7 h-7 flex items-center justify-center text-slate-300 active:bg-slate-700 transition"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Optional Customer Info & Notes */}
              <div className="pt-2 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Customer Name (Optional)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-orange-500"
                  />
                  <input
                    type="tel"
                    placeholder="Phone (Optional)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-orange-500"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Order Note (e.g. Less spicy, pack separately)"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-orange-500"
                />
              </div>

              {/* Quick Discount Selector */}
              <div className="pt-2">
                <p className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                  <Percent className="w-3 h-3 text-orange-400" /> Apply Discount
                </p>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 5, 10, 15].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setDiscountPercent(pct)}
                      className={`py-1 rounded-lg text-xs font-bold border transition ${
                        discountPercent === pct
                          ? 'bg-orange-500/20 border-orange-500 text-orange-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {pct === 0 ? 'No Disc.' : `${pct}% Off`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="pt-2">
                <p className="text-[11px] font-semibold text-slate-400 mb-1.5">Payment Method</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPaymentMethod('CASH')}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition ${
                      paymentMethod === 'CASH'
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-emerald-400 mb-0.5" />
                    Cash
                  </button>
                  <button
                    onClick={() => setPaymentMethod('UPI')}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition ${
                      paymentMethod === 'UPI'
                        ? 'bg-blue-600/20 border-blue-500 text-blue-300 ring-2 ring-blue-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <QrCode className="w-4 h-4 text-blue-400 mb-0.5" />
                    UPI / QR
                  </button>
                  <button
                    onClick={() => setPaymentMethod('CARD')}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition ${
                      paymentMethod === 'CARD'
                        ? 'bg-purple-600/20 border-purple-500 text-purple-300 ring-2 ring-purple-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-purple-400 mb-0.5" />
                    Card
                  </button>
                </div>
              </div>
            </div>

            {/* Bill Summary & Punch Action */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/90 space-y-2">
              <div className="space-y-1 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono font-medium text-slate-200">₹{cartSubtotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount ({discountPercent}%)</span>
                    <span className="font-mono font-medium">-₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Taxes (5% GST)</span>
                  <span className="font-mono font-medium text-slate-200">₹{taxAmount}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-white pt-1 border-t border-slate-800">
                  <span>Total Bill</span>
                  <span className="font-mono text-orange-400 text-base">₹{cartTotal}</span>
                </div>
              </div>

              <button
                onClick={handlePunchOrder}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 active:scale-[0.98] transition disabled:opacity-50 text-sm"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">Punching Bill...</span>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Punch Bill • ₹{cartTotal} ({paymentMethod})
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Item Note Modal */}
      {editingNoteItemId && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 w-full max-w-xs shadow-2xl">
            <h4 className="font-bold text-sm text-slate-100 mb-2">Item Kitchen Instructions</h4>
            <input
              type="text"
              autoFocus
              placeholder="e.g. Extra spicy, no coriander, less oil"
              value={itemNoteText}
              onChange={(e) => setItemNoteText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-hidden focus:border-orange-500 mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setEditingNoteItemId(null)}
                className="flex-1 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveItemNote}
                className="flex-1 py-2 bg-orange-500 text-white text-xs font-bold rounded-xl"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CartDrawer;
