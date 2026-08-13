import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { apiService } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { MapPin, ShoppingBag, CreditCard, CheckCircle2, ArrowLeft, Plus, Check } from 'lucide-react';

interface Address {
  id: string;
  type: string; // e.g. Home, Office
  detail: string;
}

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, subtotal, deliveryFee, tax, total, clearCart, restaurantName, restaurantId } = useCartStore();

  const [placingOrder, setPlacingOrder] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Address State
  const [addresses, setAddresses] = useState<Address[]>([
    { id: '1', type: 'Home', detail: '123 Main Street, Sector 4, New Delhi' },
    { id: '2', type: 'Office', detail: '456 Tech Park, Block C, Bangalore' },
  ]);
  const [selectedAddressId, setSelectedAddressId] = useState('1');
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddressType, setNewAddressType] = useState('Other');
  const [newAddressDetail, setNewAddressDetail] = useState('');

  if (items.length === 0 && !successOrderId) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-6 min-h-[60vh] flex flex-col justify-center items-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">No active items to checkout</h2>
        <Link
          to="/"
          className="px-6 py-2 bg-primary text-white font-extrabold rounded-xl hover:bg-primary-hover shadow cursor-pointer"
        >
          Go to Home
        </Link>
      </div>
    );
  }

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressDetail.trim()) return;

    const newAddr: Address = {
      id: Date.now().toString(),
      type: newAddressType,
      detail: newAddressDetail.trim(),
    };

    setAddresses([...addresses, newAddr]);
    setSelectedAddressId(newAddr.id);
    setShowAddAddressModal(false);
    setNewAddressDetail('');
  };

  const handlePlaceOrder = async () => {
    const selectedAddress = addresses.find((a) => a.id === selectedAddressId)?.detail || '123 Main Street, Sector 4, New Delhi';
    const restId = restaurantId || items[0]?.food?.restaurantId || 'gourmet-bistro';
    const restName = restaurantName || 'The Gourmet Bistro';

    setPlacingOrder(true);
    setOrderError(null);

    try {
      const orderData = {
        restaurantId: restId,
        restaurantName: restName,
        address: selectedAddress,
        items: items.map((item) => ({
          foodId: item.food.id,
          quantity: item.quantity,
        })),
        subtotal,
        deliveryFee,
        tax,
        total,
        paymentMethod: 'Cash on Delivery',
      };
      
      const response = await apiService.placeOrder(orderData);
      
      if (response.success) {
        setSuccessOrderId(response.orderId);
        clearCart(); // Clear the Zustand cart state upon successful order placement
      }
    } catch (err: any) {
      console.error('Order placement failed:', err);
      setOrderError(err.response?.data?.message || 'Failed to submit order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 min-h-screen">
      
      {/* Back button */}
      <div>
        <Link
          to="/cart"
          className="inline-flex items-center space-x-1.5 text-sm font-semibold text-slate-500 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cart</span>
        </Link>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight mt-2">Secure Checkout</h1>
      </div>

      {placingOrder ? (
        <div className="py-20 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center justify-center space-y-4">
          <LoadingSpinner />
          <p className="text-slate-500 font-bold animate-pulse">Contacting kitchen, placing your order...</p>
        </div>
      ) : successOrderId ? (
        /* Order Success Screen */
        <div className="max-w-md mx-auto bg-white rounded-3xl border border-slate-100 p-8 shadow-2xl text-center space-y-6 animate-scale-up">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mx-auto border-2 border-emerald-100 shadow-xs">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-800">Order Placed Successfully!</h2>
            <p className="text-sm text-slate-500 font-medium">
              Your delicious meal from <span className="font-bold text-primary">{restaurantName}</span> is being prepared.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm space-y-2">
            <div className="flex justify-between text-slate-500 font-semibold">
              <span>Order Number</span>
              <span className="font-bold text-slate-800 tracking-wider">{successOrderId}</span>
            </div>
            <div className="flex justify-between text-slate-500 font-semibold">
              <span>Estimated Delivery</span>
              <span className="font-bold text-slate-800">30-40 mins</span>
            </div>
            <div className="flex justify-between text-slate-500 font-semibold">
              <span>Payment Mode</span>
              <span className="font-bold text-slate-800">Cash on Delivery</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-extrabold text-sm uppercase tracking-wider transition-colors cursor-pointer shadow-md hover:shadow"
          >
            Track Order / Continue Shopping
          </button>
        </div>
      ) : (
        /* Checkout flow */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Columns: Address & Payment */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. Address Selection */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-slate-800 flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>Delivery Address</span>
                </h3>
                <button
                  onClick={() => setShowAddAddressModal(true)}
                  className="inline-flex items-center space-x-1 px-3 py-1.5 border border-primary/20 hover:bg-primary/5 text-xs font-bold text-primary rounded-xl transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Address</span>
                </button>
              </div>

              {/* Address List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                      selectedAddressId === addr.id
                        ? 'border-primary bg-primary/2 shadow-xs'
                        : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    {selectedAddressId === addr.id && (
                      <span className="absolute top-3 right-3 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                    <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md">
                      {addr.type}
                    </span>
                    <p className="text-sm text-slate-600 font-semibold mt-3 leading-relaxed">
                      {addr.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Payment Method */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
              <h3 className="text-lg font-extrabold text-slate-800 flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-primary" />
                <span>Payment Method</span>
              </h3>
              
              <div className="p-4 rounded-2xl border-2 border-primary bg-primary/2 shadow-xs flex items-center space-x-3.5">
                <div className="w-5 h-5 rounded-full border-4 border-primary flex-shrink-0"></div>
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800">Cash on Delivery</h4>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Pay in cash or UPI when order arrives</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Columns: Summary */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Order Summary & Bill */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-slate-800 pb-3 border-b border-slate-100 uppercase tracking-wider text-xs">
                  Order Summary
                </h3>
                <p className="text-[10px] text-primary font-bold mt-1 uppercase tracking-wide">
                  From: {restaurantName}
                </p>
              </div>

              {/* Items List */}
              <div className="max-h-48 overflow-y-auto space-y-3.5 divide-y divide-slate-50">
                {items.map((item) => (
                  <div key={item.food.id} className="flex justify-between items-center text-sm pt-2">
                    <div className="min-w-0 pr-3">
                      <span className="font-bold text-slate-800 line-clamp-1">{item.food.name}</span>
                      <span className="text-[11px] text-slate-400 font-bold">Qty: {item.quantity}</span>
                    </div>
                    <span className="font-extrabold text-slate-700">
                      ₹{item.food.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Cost Calculations */}
              <div className="space-y-3.5 text-xs text-slate-600 font-semibold border-t border-slate-100 pt-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-slate-800 font-bold">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge</span>
                  <span className="text-slate-800 font-bold">₹{deliveryFee}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes</span>
                  <span className="text-slate-800 font-bold">₹{tax}</span>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-slate-800 text-sm">
                  <span className="font-extrabold">Grand Total</span>
                  <span className="text-lg font-black text-slate-900">₹{total}</span>
                </div>
              </div>

              {orderError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl text-center">
                  ⚠️ {orderError}
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={placingOrder}
                className="w-full py-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all cursor-pointer text-center disabled:opacity-60"
              >
                {placingOrder ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>

          </div>

        </div>
      )}

      {/* Add Address Dialog Modal */}
      {showAddAddressModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4 animate-scale-up">
            <h3 className="text-lg font-extrabold text-slate-800">Add New Address</h3>
            
            <form onSubmit={handleAddAddress} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Address Type</label>
                <div className="flex space-x-2">
                  {['Home', 'Office', 'Other'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewAddressType(type)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        newAddressType === type
                          ? 'bg-primary text-white border-primary shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Address Details</label>
                <textarea
                  required
                  rows={3}
                  value={newAddressDetail}
                  onChange={(e) => setNewAddressDetail(e.target.value)}
                  placeholder="E.g. Apartment/House no., Floor, Street Name, Area, City"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAddressModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-extrabold shadow-sm hover:shadow cursor-pointer"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
