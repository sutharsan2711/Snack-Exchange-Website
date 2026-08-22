import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag, Clock, MapPin, CheckCircle2, AlertCircle, RefreshCw,
  ChefHat, Truck, Utensils, CreditCard
} from 'lucide-react';
import { apiService } from '../services/api';

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      setRefreshing(true);
      const data = await apiService.getOrders();
      // Sort newest first
      const sorted = (data || []).sort(
        (a: any, b: any) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      );
      setOrders(sorted);
    } catch (err) {
      console.error('Failed to load customer orders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Poll every 6 seconds for live order status updates from Kitchen/Admin
    const interval = setInterval(fetchOrders, 6000);
    return () => clearInterval(interval);
  }, []);

  const getStatusStep = (status: string) => {
    switch (status) {
      case 'Pending':
        return 1;
      case 'Preparing':
        return 2;
      case 'Out for Delivery':
        return 3;
      case 'Delivered':
        return 4;
      case 'Cancelled':
        return -1;
      default:
        return 1;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 text-xs font-extrabold rounded-full inline-flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Order Placed
          </span>
        );
      case 'Preparing':
        return (
          <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-black rounded-full inline-flex items-center gap-1.5 animate-pulse">
            <ChefHat className="w-3.5 h-3.5 text-amber-600" /> Cooking in Kitchen
          </span>
        );
      case 'Out for Delivery':
        return (
          <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 text-xs font-black rounded-full inline-flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-purple-600" /> Out for Delivery
          </span>
        );
      case 'Delivered':
        return (
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black rounded-full inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Delivered
          </span>
        );
      case 'Cancelled':
        return (
          <span className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 text-xs font-extrabold rounded-full inline-flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 min-h-[75vh]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">My Orders & Live Tracking</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Track your live meal preparation and review your past order receipts
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={refreshing}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Live Refresh'}</span>
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : orders.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center space-y-6 shadow-xs max-w-lg mx-auto">
          <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center text-primary mx-auto">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-800">No Orders Found</h2>
            <p className="text-sm text-slate-500 font-medium">
              You haven't placed any food orders yet. Browse our menu to satisfy your cravings!
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-6 py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-black text-sm uppercase tracking-wider transition-all shadow-md hover:shadow cursor-pointer"
          >
            <Utensils className="w-4 h-4" />
            <span>Browse Delicious Menu</span>
          </Link>
        </div>
      ) : (
        /* Orders List */
        <div className="space-y-6">
          {orders.map((order) => {
            const step = getStatusStep(order.status);
            const isCancelled = order.status === 'Cancelled';

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-xs hover:shadow-md transition-shadow space-y-6"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-base font-black text-slate-800 tracking-wider">
                        #{order.id}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <p className="text-xs text-slate-400 font-medium">
                      Placed on {new Date(order.createdAt).toLocaleString([], {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <div className="text-right sm:self-center">
                    <span className="text-xs text-slate-400 font-semibold block">Total Amount</span>
                    <span className="text-xl font-black text-primary">₹{order.total}</span>
                  </div>
                </div>

                {/* Live Order Progress Tracker */}
                {!isCancelled ? (
                  <div className="py-2">
                    <div className="grid grid-cols-4 gap-2 text-center relative">
                      {/* Step 1 */}
                      <div className="space-y-2">
                        <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-black transition-all ${
                          step >= 1 ? 'bg-primary text-white shadow-xs' : 'bg-slate-100 text-slate-400'
                        }`}>
                          ✓
                        </div>
                        <span className={`text-[11px] block font-bold ${step >= 1 ? 'text-slate-800' : 'text-slate-400'}`}>
                          Order Confirmed
                        </span>
                      </div>

                      {/* Step 2 */}
                      <div className="space-y-2">
                        <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-black transition-all ${
                          step >= 2 ? 'bg-primary text-white shadow-xs animate-bounce' : 'bg-slate-100 text-slate-400'
                        }`}>
                          <ChefHat className="w-4 h-4" />
                        </div>
                        <span className={`text-[11px] block font-bold ${step >= 2 ? 'text-slate-800' : 'text-slate-400'}`}>
                          Cooking in Kitchen
                        </span>
                      </div>

                      {/* Step 3 */}
                      <div className="space-y-2">
                        <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-black transition-all ${
                          step >= 3 ? 'bg-primary text-white shadow-xs' : 'bg-slate-100 text-slate-400'
                        }`}>
                          <Truck className="w-4 h-4" />
                        </div>
                        <span className={`text-[11px] block font-bold ${step >= 3 ? 'text-slate-800' : 'text-slate-400'}`}>
                          Out for Delivery
                        </span>
                      </div>

                      {/* Step 4 */}
                      <div className="space-y-2">
                        <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-black transition-all ${
                          step >= 4 ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-400'
                        }`}>
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className={`text-[11px] block font-bold ${step >= 4 ? 'text-emerald-600' : 'text-slate-400'}`}>
                          Delivered
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-xs font-bold flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>This order has been cancelled. If you have questions, please reach out to customer support.</span>
                  </div>
                )}

                {/* Items & Delivery Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
                  {/* Left Column: Items List */}
                  <div className="md:col-span-7 space-y-3">
                    <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                      Ordered Dishes ({order.items?.length || 0})
                    </h4>
                    <div className="space-y-2.5">
                      {order.items?.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-3 bg-slate-50/70 rounded-2xl border border-slate-100"
                        >
                          <div className="flex items-center space-x-3">
                            {item.foodItem?.image && (
                              <img
                                src={item.foodItem.image}
                                alt={item.foodItem.name}
                                className="w-12 h-12 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80';
                                }}
                              />
                            )}
                            <div>
                              <div className="flex items-center space-x-1.5">
                                <span
                                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                    item.foodItem?.isVeg ? 'bg-emerald-500' : 'bg-red-500'
                                  }`}
                                />
                                <span className="font-extrabold text-slate-800 text-sm block">
                                  {item.foodItem?.name || 'Delicious Dish'}
                                </span>
                              </div>
                              <span className="text-xs text-slate-400 font-semibold">
                                ₹{item.price} × {item.quantity}
                              </span>
                            </div>
                          </div>
                          <span className="text-sm font-black text-slate-800">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Delivery Details & Receipt Summary */}
                  <div className="md:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                        Delivery Address
                      </h4>
                      <div className="flex items-start space-x-2 text-xs font-semibold text-slate-700">
                        <MapPin className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>{order.address || 'Standard Delivery Address'}</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-200/60">
                      <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                        Payment & Bill Summary
                      </h4>
                      <div className="flex justify-between text-xs text-slate-600 font-medium">
                        <span>Payment Method</span>
                        <span className="font-bold text-slate-800 flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-slate-400" />
                          {order.paymentMethod || 'Cash on Delivery'}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-600 font-medium">
                        <span>Subtotal</span>
                        <span>₹{order.subtotal}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-600 font-medium">
                        <span>Delivery Fee</span>
                        <span>₹{order.deliveryFee}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-600 font-medium">
                        <span>Tax</span>
                        <span>₹{order.tax}</span>
                      </div>
                      <div className="flex justify-between text-sm font-black text-slate-800 pt-2 border-t border-slate-200">
                        <span>Grand Total</span>
                        <span className="text-primary font-black">₹{order.total}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
