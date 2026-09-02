import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import type { Order } from '../services/api';
import { MapPin, Clock, CreditCard, ChevronDown, CheckCircle, XCircle, Truck, Store, Globe, Search, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export const OrderManager: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState<'All' | 'Online' | 'POS'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await apiService.getOrders();
      // Sort orders descending by createdAt
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

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchOrders();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 12000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await apiService.updateOrderStatus(orderId, newStatus);
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  const isPosOrder = (order: Order) => {
    const addr = order.address || '';
    return (
      addr.includes('[POS Billing]') ||
      addr.includes('POS Counter') ||
      addr.includes('Staff:') ||
      addr.includes('Counter') ||
      addr.includes('Table ')
    );
  };

  const statusColors: Record<string, string> = {
    'Pending': 'bg-blue-50 text-blue-700 border-blue-100',
    'Preparing': 'bg-amber-50 text-amber-700 border-amber-100',
    'In Kitchen': 'bg-amber-50 text-amber-700 border-amber-100',
    'Out for Delivery': 'bg-indigo-50 text-indigo-700 border-indigo-100',
    'Ready': 'bg-indigo-50 text-indigo-700 border-indigo-100',
    'Served': 'bg-purple-50 text-purple-700 border-purple-100',
    'Delivered': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'Cancelled': 'bg-red-50 text-red-700 border-red-100',
  };

  const onlineOrdersCount = orders.filter((o) => !isPosOrder(o)).length;
  const posOrdersCount = orders.filter((o) => isPosOrder(o)).length;

  const filteredOrders = orders.filter((order) => {
    const isPos = isPosOrder(order);

    // Source filter
    if (sourceFilter === 'Online' && isPos) return false;
    if (sourceFilter === 'POS' && !isPos) return false;

    // Status filter
    if (statusFilter !== 'All' && order.status !== statusFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = order.id.toLowerCase().includes(q);
      const matchAddress = order.address.toLowerCase().includes(q);
      if (!matchId && !matchAddress) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Order Management</h1>
          <p className="text-slate-500 font-medium">
            Monitor incoming customer online orders & in-store POS counter orders
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/pos-orders"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-extrabold shadow-sm transition"
          >
            <Store className="w-4 h-4" />
            <span>Open Dedicated POS Screen</span>
          </Link>
          <button
            onClick={handleManualRefresh}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition"
            title="Refresh Feed"
          >
            <RefreshCw className={`w-4 h-4 text-indigo-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Order Source Tabs & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Source Switcher Buttons */}
        <div className="flex p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setSourceFilter('All')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              sourceFilter === 'All'
                ? 'bg-white text-indigo-600 shadow-xs font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All Orders ({orders.length})
          </button>
          <button
            onClick={() => setSourceFilter('Online')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              sourceFilter === 'Online'
                ? 'bg-white text-indigo-600 shadow-xs font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Online Web ({onlineOrdersCount})
          </button>
          <button
            onClick={() => setSourceFilter('POS')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              sourceFilter === 'POS'
                ? 'bg-white text-orange-600 shadow-xs font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            POS Counter ({posOrdersCount})
          </button>
        </div>

        {/* Search & Status filter */}
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Order ID, Address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden focus:border-indigo-600"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-slate-200 bg-slate-50 hover:bg-white rounded-xl text-xs font-bold text-slate-700 outline-hidden focus:border-indigo-600 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Preparing">Preparing</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered / Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-[40vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 text-slate-400 font-medium bg-white rounded-3xl border border-slate-100">
          📦 No orders found matching selection.
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const isPos = isPosOrder(order);

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col md:grid md:grid-cols-12"
              >
                {/* Order Info Left Column */}
                <div className="p-6 border-b md:border-b-0 md:border-r border-slate-100 md:col-span-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full ${
                          isPos
                            ? 'text-orange-700 bg-orange-100 border border-orange-200'
                            : 'text-indigo-600 bg-indigo-50 border border-indigo-100'
                        }`}
                      >
                        {isPos ? 'POS' : 'WEB'} #{order.id}
                      </span>
                      {isPos ? (
                        <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                          Staff Bill
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                          Online
                        </span>
                      )}
                    </div>

                    {/* Status indicator */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        statusColors[order.status] || 'bg-slate-50 text-slate-700 border-slate-100'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs font-semibold text-slate-500">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{new Date(order.createdAt).toLocaleString()}</span>
                    </div>

                    <div className="flex items-start space-x-2">
                      {isPos ? (
                        <Store className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                      )}
                      <span className="line-clamp-2 leading-relaxed font-bold text-slate-700">
                        {order.address}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4 text-slate-400" />
                      <span>{order.paymentMethod}</span>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                      Quick Actions
                    </label>

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
                          onClick={() => handleStatusChange(order.id, isPos ? 'Completed' : 'Out for Delivery')}
                          className="flex items-center justify-center space-x-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-extrabold text-xs shadow-xs transition-colors cursor-pointer"
                        >
                          <Truck className="w-4 h-4" />
                          <span>{isPos ? 'Mark Completed' : 'Dispatch'}</span>
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
                        <option value="In Kitchen">Status: In Kitchen</option>
                        <option value="Out for Delivery">Status: Out for Delivery</option>
                        <option value="Delivered">Status: Delivered / Completed</option>
                        <option value="Cancelled">Status: Cancelled</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Order Items Right Column */}
                <div className="p-6 md:col-span-8 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      Order Details
                    </h3>
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
                              <span className="text-xs text-slate-400 font-bold ml-1.5">
                                x{item.quantity}
                              </span>
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
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderManager;
