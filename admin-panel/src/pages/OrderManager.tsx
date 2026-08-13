import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import type { Order } from '../services/api';
import { MapPin, Clock, CreditCard, ChevronDown, CheckCircle, XCircle, Truck } from 'lucide-react';

export const OrderManager: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await apiService.getOrders();
      // Sort orders descending by createdAt (or position if no date is set)
      const sorted = data.sort((a, b) => {
        return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
      });
      setOrders(sorted);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await apiService.updateOrderStatus(orderId, newStatus);
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  const statusColors: Record<string, string> = {
    'Pending': 'bg-blue-50 text-blue-700 border-blue-100',
    'Preparing': 'bg-amber-50 text-amber-700 border-amber-100',
    'Out for Delivery': 'bg-indigo-50 text-indigo-700 border-indigo-100',
    'Delivered': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'Cancelled': 'bg-red-50 text-red-700 border-red-100',
  };

  const filteredOrders = statusFilter === 'All' 
    ? orders 
    : orders.filter(o => o.status === statusFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Order Management</h1>
          <p className="text-slate-500 font-medium">Track customer orders, preparation workflow, and dispatch status</p>
        </div>

        {/* Filter select */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-slate-200 bg-white rounded-xl text-sm font-bold text-slate-700 outline-hidden focus:border-indigo-600 transition-colors"
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Preparing">Preparing</option>
          <option value="Out for Delivery">Out for Delivery</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-[40vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 text-slate-400 font-medium bg-white rounded-3xl border border-slate-100">
          📦 No orders found matching status selection.
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col md:grid md:grid-cols-12"
            >
              {/* Order Info Left Column */}
              <div className="p-6 border-b md:border-b-0 md:border-r border-slate-100 md:col-span-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-600 tracking-wider uppercase bg-indigo-50 px-2.5 py-0.5 rounded-full">
                    ID: {order.id}
                  </span>
                  
                  {/* Status indicator */}
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusColors[order.status] || 'bg-slate-50 text-slate-700 border-slate-100'}`}>
                    {order.status}
                  </span>
                </div>

                <div className="space-y-3.5 text-xs font-semibold text-slate-500">
                  {/* Time */}
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{new Date(order.createdAt).toLocaleString()}</span>
                  </div>

                  {/* Address */}
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2 leading-relaxed">{order.address}</span>
                  </div>

                  {/* Payment */}
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    <span>{order.paymentMethod}</span>
                  </div>
                </div>

                {/* Quick Action Buttons for Online Orders */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Quick Actions</label>

                  {order.status === 'Pending' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleStatusChange(order.id, 'Preparing')}
                        className="flex items-center justify-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs shadow-xs transition-colors cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Accept Order</span>
                      </button>
                      <button
                        onClick={() => handleStatusChange(order.id, 'Cancelled')}
                        className="flex items-center justify-center space-x-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-extrabold text-xs shadow-xs transition-colors cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Cancel Order</span>
                      </button>
                    </div>
                  )}

                  {order.status === 'Preparing' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleStatusChange(order.id, 'Out for Delivery')}
                        className="flex items-center justify-center space-x-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-extrabold text-xs shadow-xs transition-colors cursor-pointer"
                      >
                        <Truck className="w-4 h-4" />
                        <span>Dispatch</span>
                      </button>
                      <button
                        onClick={() => handleStatusChange(order.id, 'Cancelled')}
                        className="flex items-center justify-center space-x-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}

                  {order.status === 'Out for Delivery' && (
                    <button
                      onClick={() => handleStatusChange(order.id, 'Delivered')}
                      className="w-full flex items-center justify-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Mark Delivered</span>
                    </button>
                  )}

                  {/* Manual Dropdown Override */}
                  <div className="relative pt-1">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="w-full pl-3 pr-8 py-1.5 border border-slate-200 bg-slate-50 hover:bg-slate-100 focus:bg-white rounded-xl text-xs font-bold text-slate-600 outline-hidden focus:border-indigo-600 transition-all appearance-none cursor-pointer"
                    >
                      <option value="Pending">Status: Pending</option>
                      <option value="Preparing">Status: Preparing</option>
                      <option value="Out for Delivery">Status: Out for Delivery</option>
                      <option value="Delivered">Status: Delivered</option>
                      <option value="Cancelled">Status: Cancelled</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Order Items Right Column */}
              <div className="p-6 md:col-span-8 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Order Details</h3>
                  <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto pr-1">
                    {order.items.map((item) => (
                      <div key={item.id} className="py-2 flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.foodItem.image}
                            alt={item.foodItem.name}
                            className="w-8 h-8 rounded-lg object-cover border border-slate-100"
                          />
                          <div>
                            <span className="font-extrabold text-slate-800">{item.foodItem.name}</span>
                            <span className="text-xs text-slate-400 font-bold ml-1.5">x{item.quantity}</span>
                          </div>
                        </div>
                        <span className="font-black text-slate-700">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Totals Summary */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-slate-500">
                  <div className="flex items-center space-x-4">
                    <span>Subtotal: ₹{order.subtotal}</span>
                    <span>Fee: ₹{order.deliveryFee}</span>
                    <span>Tax: ₹{order.tax}</span>
                  </div>
                  <div className="text-base font-black text-slate-800">
                    Total: <span className="text-indigo-600">₹{order.total}</span>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};
