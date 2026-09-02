import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import type { Order } from '../services/api';
import {
  Store,
  Clock,
  CreditCard,
  ChevronDown,
  CheckCircle,
  XCircle,
  Printer,
  Search,
  Banknote,
  QrCode,
  RefreshCw,
  ChefHat
} from 'lucide-react';

export const PosOrderManager: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [staffFilter, setStaffFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await apiService.getOrders();
      // Filter for POS orders: address contains '[POS Billing]' or 'POS Counter' or 'Staff:'
      const posOrders = data.filter((o) => {
        const addr = o.address || '';
        return (
          addr.includes('[POS Billing]') ||
          addr.includes('POS Counter') ||
          addr.includes('Staff:') ||
          addr.includes('Counter') ||
          addr.includes('Table ')
        );
      });

      const sorted = posOrders.sort((a, b) => {
        return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
      });
      setOrders(sorted);
    } catch (err) {
      console.error('Failed to load POS orders:', err);
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
      console.error('Failed to update POS order status:', err);
    }
  };

  const handlePrintReceipt = (order: Order) => {
    setPrintingOrder(order);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  // Extract staff names from orders for dynamic filter
  const staffList = Array.from(
    new Set(
      orders
        .map((o) => {
          if (o.address?.includes('Staff: ')) {
            return o.address.split('Staff: ')[1].split(' |')[0].split(' (')[0].trim();
          }
          return null;
        })
        .filter(Boolean)
    )
  );

  // Financial Stats Calculation
  const totalRevenue = orders.reduce(
    (sum, o) => sum + (o.status !== 'Cancelled' ? Number(o.total || 0) : 0),
    0
  );
  const cashTotal = orders.reduce(
    (sum, o) =>
      sum +
      (o.paymentMethod?.toUpperCase() === 'CASH' && o.status !== 'Cancelled'
        ? Number(o.total || 0)
        : 0),
    0
  );
  const upiTotal = orders.reduce(
    (sum, o) =>
      sum +
      (o.paymentMethod?.toUpperCase() === 'UPI' && o.status !== 'Cancelled'
        ? Number(o.total || 0)
        : 0),
    0
  );
  const activeOrdersCount = orders.filter(
    (o) => o.status !== 'Completed' && o.status !== 'Delivered' && o.status !== 'Cancelled'
  ).length;

  const statusColors: Record<string, string> = {
    'Pending': 'bg-blue-50 text-blue-700 border-blue-100',
    'In Kitchen': 'bg-amber-50 text-amber-700 border-amber-100',
    'Preparing': 'bg-amber-50 text-amber-700 border-amber-100',
    'Ready': 'bg-indigo-50 text-indigo-700 border-indigo-100',
    'Served': 'bg-purple-50 text-purple-700 border-purple-100',
    'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'Delivered': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'Cancelled': 'bg-rose-50 text-rose-700 border-rose-100',
  };

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== 'All' && order.status !== statusFilter) return false;
    if (paymentFilter !== 'All' && order.paymentMethod?.toUpperCase() !== paymentFilter.toUpperCase())
      return false;
    if (staffFilter !== 'All' && !order.address?.includes(`Staff: ${staffFilter}`)) return false;

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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-100 text-orange-600">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                POS & Counter Orders
                <span className="text-xs bg-orange-500 text-white font-extrabold px-2.5 py-0.5 rounded-full">
                  Staff Billed
                </span>
              </h1>
              <p className="text-slate-500 font-medium text-sm">
                Control, monitor, and print receipts for all in-store counter & staff-billed orders
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleManualRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold shadow-xs transition cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-orange-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Feed</span>
          </button>
        </div>
      </div>

      {/* POS Quick Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Total POS Revenue</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">₹{totalRevenue}</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">{orders.length} total bills</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl font-bold">
            <Store className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Counter Cash</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">₹{cashTotal}</h3>
            <p className="text-[11px] text-emerald-700/80 font-medium mt-0.5">Physical Cash In Drawer</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl font-bold">
            <Banknote className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">UPI / QR Digital</p>
            <h3 className="text-2xl font-black text-blue-600 mt-1">₹{upiTotal}</h3>
            <p className="text-[11px] text-blue-700/80 font-medium mt-0.5">Direct Bank Settlement</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl font-bold">
            <QrCode className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Active POS Tickets</p>
            <h3 className="text-2xl font-black text-orange-500 mt-1">{activeOrdersCount}</h3>
            <p className="text-[11px] text-orange-600/80 font-medium mt-0.5">In Kitchen / Preparing</p>
          </div>
          <div className="p-3 bg-orange-50 text-orange-600 rounded-2xl font-bold">
            <ChefHat className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filters & Search Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Bill ID, Staff name, or Notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden focus:border-orange-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 bg-slate-50 hover:bg-white rounded-xl text-xs font-bold text-slate-700 outline-hidden focus:border-orange-500 cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Kitchen">In Kitchen / Preparing</option>
            <option value="Preparing">Preparing</option>
            <option value="Ready">Ready</option>
            <option value="Completed">Completed / Paid</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Payment filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 bg-slate-50 hover:bg-white rounded-xl text-xs font-bold text-slate-700 outline-hidden focus:border-orange-500 cursor-pointer"
          >
            <option value="All">All Payments</option>
            <option value="CASH">Cash Bills</option>
            <option value="UPI">UPI / QR Bills</option>
            <option value="CARD">Card Bills</option>
          </select>

          {/* Staff filter */}
          {staffList.length > 0 && (
            <select
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 bg-slate-50 hover:bg-white rounded-xl text-xs font-bold text-slate-700 outline-hidden focus:border-orange-500 cursor-pointer"
            >
              <option value="All">All Staff Members</option>
              {staffList.map((st) => (
                <option key={st} value={st!}>
                  Staff: {st}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex justify-center items-center h-[40vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 text-slate-400 font-medium bg-white rounded-3xl border border-slate-100">
          <Store className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="font-bold text-slate-600">No POS Counter orders found matching criteria</p>
          <p className="text-xs text-slate-400 mt-1">Orders punched from the mobile Staff POS will appear here live.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col md:grid md:grid-cols-12"
            >
              {/* Order Info Left Column */}
              <div className="p-6 border-b md:border-b-0 md:border-r border-slate-100 md:col-span-4 space-y-4 bg-slate-50/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-orange-600 tracking-wider uppercase bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                    POS ID: {order.id}
                  </span>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      statusColors[order.status] || 'bg-slate-50 text-slate-700 border-slate-100'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs font-semibold text-slate-600">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{new Date(order.createdAt).toLocaleString()}</span>
                  </div>

                  <div className="flex items-start space-x-2 bg-white p-2.5 rounded-xl border border-slate-100">
                    <Store className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed text-slate-700 font-bold">{order.address}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center space-x-1.5">
                      <CreditCard className="w-4 h-4 text-slate-400" />
                      <span className="font-bold text-slate-700">{order.paymentMethod} (PAID)</span>
                    </div>
                    <button
                      onClick={() => handlePrintReceipt(order)}
                      className="flex items-center gap-1 text-[11px] font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded-lg border border-orange-200 transition cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print Bill
                    </button>
                  </div>
                </div>

                {/* Admin Quick Action Controls */}
                <div className="pt-3 border-t border-slate-200/80 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                    Admin Status Control
                  </label>

                  {order.status !== 'Completed' && order.status !== 'Cancelled' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleStatusChange(order.id, 'Completed')}
                        className="flex items-center justify-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs shadow-xs transition-colors cursor-pointer"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Settle / Complete</span>
                      </button>
                      <button
                        onClick={() => handleStatusChange(order.id, 'Cancelled')}
                        className="flex items-center justify-center space-x-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Cancel Bill</span>
                      </button>
                    </div>
                  )}

                  {/* Manual Dropdown Override */}
                  <div className="relative pt-1">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="w-full pl-3 pr-8 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 outline-hidden focus:border-orange-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value="Pending">Status: Pending</option>
                      <option value="In Kitchen">Status: In Kitchen</option>
                      <option value="Preparing">Status: Preparing</option>
                      <option value="Ready">Status: Ready</option>
                      <option value="Served">Status: Served</option>
                      <option value="Completed">Status: Completed</option>
                      <option value="Cancelled">Status: Cancelled</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Order Items Right Column */}
              <div className="p-6 md:col-span-8 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center justify-between">
                    <span>Billed Items</span>
                    <span className="text-[10px] text-slate-500 lowercase font-normal font-mono">
                      {order.items.length} items
                    </span>
                  </h3>
                  <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto pr-1">
                    {order.items.map((item) => (
                      <div key={item.id} className="py-2.5 flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-3">
                          <img
                            src={
                              item.foodItem.image ||
                              'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80'
                            }
                            alt={item.foodItem.name}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-100"
                          />
                          <div>
                            <span className="font-extrabold text-slate-800">{item.foodItem.name}</span>
                            <span className="text-xs text-orange-600 font-extrabold ml-1.5 font-mono">
                              x{item.quantity}
                            </span>
                          </div>
                        </div>
                        <span className="font-black font-mono text-slate-700">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals Breakdown */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs font-bold text-slate-500">
                  <div className="flex items-center space-x-4">
                    <span>Subtotal: ₹{order.subtotal}</span>
                    <span>Tax (5% GST): ₹{order.tax}</span>
                  </div>
                  <div className="text-base font-black text-slate-800">
                    Grand Total: <span className="text-orange-600 font-mono">₹{order.total}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hidden Print Receipt Template */}
      {printingOrder && (
        <div id="thermal-receipt-content" className="hidden">
          <div style={{ textAlign: 'center', marginBottom: '10px' }}>
            <h2 style={{ margin: 0, fontWeight: 'bold' }}>SNACK EXCHANGE</h2>
            <p style={{ margin: 0, fontSize: '10px' }}>POS Counter Receipt</p>
            <p style={{ margin: 0, fontSize: '9px' }}>GSTIN: 29AAAAA0000A1Z5</p>
          </div>
          <hr style={{ borderStyle: 'dashed' }} />
          <p style={{ margin: '3px 0' }}>Bill ID: #{printingOrder.id}</p>
          <p style={{ margin: '3px 0' }}>Date: {new Date(printingOrder.createdAt).toLocaleString()}</p>
          <p style={{ margin: '3px 0' }}>{printingOrder.address}</p>
          <hr style={{ borderStyle: 'dashed' }} />
          <table style={{ width: '100%', fontSize: '11px', textAlign: 'left' }}>
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th style={{ textAlign: 'right' }}>Amt</th>
              </tr>
            </thead>
            <tbody>
              {printingOrder.items.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.foodItem.name}</td>
                  <td>x{item.quantity}</td>
                  <td style={{ textAlign: 'right' }}>₹{item.price * item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <hr style={{ borderStyle: 'dashed' }} />
          <p style={{ margin: '3px 0', textAlign: 'right', fontWeight: 'bold', fontSize: '13px' }}>
            Total: ₹{printingOrder.total}
          </p>
          <p style={{ margin: '3px 0', textAlign: 'right', fontSize: '10px' }}>
            Mode: {printingOrder.paymentMethod} (PAID)
          </p>
          <hr style={{ borderStyle: 'dashed' }} />
          <p style={{ textAlign: 'center', fontSize: '9px', marginTop: '10px' }}>
            *** THANK YOU! VISIT AGAIN ***
          </p>
        </div>
      )}
    </div>
  );
};

export default PosOrderManager;
