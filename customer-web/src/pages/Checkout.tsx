import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { apiService } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { MapPin, ShoppingBag, CreditCard, CheckCircle2, ArrowLeft, ArrowRight, Plus, Check, Smartphone, Banknote, ShieldCheck, QrCode, Building2 } from 'lucide-react';

interface Address {
  id: string;
  type: string; // e.g. Home, Office
  detail: string;
}

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const { items, subtotal, deliveryFee, tax, total, clearCart, restaurantName, restaurantId } = useCartStore();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
    }
  }, [isAuthenticated, navigate]);

  const [placingOrder, setPlacingOrder] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState<string | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Address State
  const [addresses, setAddresses] = useState<Address[]>([
    { id: '1', type: 'Home', detail: 'Shop No. 8, Meena Food Court, Saravanampatti, Coimbatore' },
    { id: '2', type: 'Office', detail: 'CHIL SEZ IT Park, Saravanampatti, Coimbatore' },
  ]);
  const [selectedAddressId, setSelectedAddressId] = useState('1');
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddressType, setNewAddressType] = useState('Other');
  const [newAddressDetail, setNewAddressDetail] = useState('');

  // Payment Method States
  const [paymentMode, setPaymentMode] = useState<'ONLINE' | 'COD'>('ONLINE');
  const [onlineSubMethod, setOnlineSubMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [upiId, setUpiId] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

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
    const selectedAddress = addresses.find((a) => a.id === selectedAddressId)?.detail || 'Saravanampatti, Coimbatore';
    const restId = restaurantId || items[0]?.food?.restaurantId || 'gourmet-bistro';
    const restName = restaurantName || 'Snack Exchange';

    setPlacingOrder(true);
    setOrderError(null);

    let finalPaymentMethod = 'Cash on Delivery';
    if (paymentMode === 'ONLINE') {
      if (onlineSubMethod === 'UPI') {
        finalPaymentMethod = upiId.trim() ? `Online Payment (UPI: ${upiId.trim()})` : 'Online Payment (UPI / GPay / PhonePe)';
      } else if (onlineSubMethod === 'CARD') {
        finalPaymentMethod = cardNumber ? `Online Payment (Card ending in ${cardNumber.slice(-4)})` : 'Online Payment (Credit/Debit Card)';
      } else {
        finalPaymentMethod = `Online Payment (${selectedBank})`;
      }
    }

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
        paymentMethod: finalPaymentMethod,
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

          <div className="space-y-2.5">
            <button
              onClick={() => navigate('/orders')}
              className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-extrabold text-sm uppercase tracking-wider transition-all cursor-pointer shadow-md hover:shadow flex items-center justify-center space-x-2"
            >
              <span>View & Track Order Live</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors cursor-pointer"
            >
              <span>Continue Shopping</span>
            </button>
          </div>
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
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${selectedAddressId === addr.id
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
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-slate-800 flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <span>Choose Payment Method</span>
                </h3>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>100% Secure Checkout</span>
                </span>
              </div>

              {/* Main Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Online Payment Option */}
                <div
                  onClick={() => setPaymentMode('ONLINE')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                    paymentMode === 'ONLINE'
                      ? 'border-primary bg-primary/2 shadow-xs'
                      : 'border-slate-150 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMode === 'ONLINE' ? 'border-primary' : 'border-slate-300'
                      }`}>
                        {paymentMode === 'ONLINE' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                          <span>Online Payment</span>
                          <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">FASTEST</span>
                        </h4>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">UPI, GPay, PhonePe, Cards, NetBanking</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Brands Logo Badges */}
                  <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100/80">
                    <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-extrabold text-slate-600 rounded">GPay</span>
                    <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-extrabold text-purple-700 rounded">PhonePe</span>
                    <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-extrabold text-sky-600 rounded">Paytm UPI</span>
                    <span className="px-2 py-0.5 bg-slate-100 text-[10px] font-extrabold text-slate-600 rounded">Visa/Mastercard</span>
                  </div>
                </div>

                {/* 2. Cash on Delivery Option */}
                <div
                  onClick={() => setPaymentMode('COD')}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative ${
                    paymentMode === 'COD'
                      ? 'border-primary bg-primary/2 shadow-xs'
                      : 'border-slate-150 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        paymentMode === 'COD' ? 'border-primary' : 'border-slate-300'
                      }`}>
                        {paymentMode === 'COD' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-slate-800">Cash on Delivery</h4>
                        <p className="text-xs text-slate-400 font-semibold mt-0.5">Pay in cash or scan UPI on arrival</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100/80 text-[10px] font-bold text-slate-500">
                    <Banknote className="w-3.5 h-3.5 text-slate-400" />
                    <span>Exact change recommended for cash</span>
                  </div>
                </div>

              </div>

              {/* Online Payment Sub-Tabs & Details */}
              {paymentMode === 'ONLINE' && (
                <div className="mt-4 p-5 bg-slate-50 rounded-2xl border border-slate-150 space-y-4 animate-scale-up">
                  <div className="flex items-center space-x-2 border-b border-slate-200/80 pb-3">
                    <button
                      type="button"
                      onClick={() => setOnlineSubMethod('UPI')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                        onlineSubMethod === 'UPI'
                          ? 'bg-primary text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>UPI & QR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOnlineSubMethod('CARD')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                        onlineSubMethod === 'CARD'
                          ? 'bg-primary text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Credit / Debit Card</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOnlineSubMethod('NETBANKING')}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                        onlineSubMethod === 'NETBANKING'
                          ? 'bg-primary text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span>Net Banking</span>
                    </button>
                  </div>

                  {/* Sub-Method 1: UPI */}
                  {onlineSubMethod === 'UPI' && (
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">Enter UPI ID / VPA</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. yourname@okhdfcbank or 9876543210@paytm"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="flex-1 px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
                          />
                        </div>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5">
                          <QrCode className="w-5 h-5 text-indigo-600" />
                          <div>
                            <p className="font-bold text-slate-800">Scan & Pay via any UPI App</p>
                            <p className="text-[10px] text-slate-400 font-semibold">QR code will be available on the next step</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">INSTANT</span>
                      </div>
                    </div>
                  )}

                  {/* Sub-Method 2: Cards */}
                  {onlineSubMethod === 'CARD' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Card Number</label>
                        <input
                          type="text"
                          maxLength={19}
                          placeholder="4532 •••• •••• 8892"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Expiry Date</label>
                          <input
                            type="text"
                            maxLength={5}
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-center font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">CVV / CVC</label>
                          <input
                            type="password"
                            maxLength={4}
                            placeholder="•••"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-center font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sub-Method 3: Net Banking */}
                  {onlineSubMethod === 'NETBANKING' && (
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700">Select Your Bank</label>
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-semibold text-slate-700"
                      >
                        <option value="HDFC Bank">HDFC Bank</option>
                        <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                        <option value="ICICI Bank">ICICI Bank</option>
                        <option value="Axis Bank">Axis Bank</option>
                        <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                        <option value="Canara Bank">Canara Bank</option>
                        <option value="Other Bank">Other Indian Bank</option>
                      </select>
                    </div>
                  )}
                </div>
              )}
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
                      <span className="font-bold text-slate-800 block break-words">{item.food.name}</span>
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
                      className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${newAddressType === type
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
