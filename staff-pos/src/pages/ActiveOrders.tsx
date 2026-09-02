import React, { useState } from 'react';
import { usePos } from '../context/PosContext';
import { PosOrder } from '../types/pos';
import { Clock, CheckCircle2, ChefHat, Utensils, Receipt, XCircle, Search, RefreshCw } from 'lucide-react';
import ReceiptModal from '../components/ReceiptModal';

export const ActiveOrders: React.FC = () => {
  const { orders, changeOrderStatus, refreshOrders } = usePos();
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('active');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<PosOrder | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshOrders();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const filteredOrders = orders.filter((order) => {
    // Status Filter
    if (selectedStatusTab === 'active') {
      if (order.status === 'Completed' || order.status === 'Cancelled' || order.status === 'Delivered') return false;
    } else if (selectedStatusTab === 'kitchen') {
      if (order.status !== 'In Kitchen' && order.status !== 'Pending') return false;
    } else if (selectedStatusTab === 'completed') {
      if (order.status !== 'Completed' && order.status !== 'Delivered') return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = order.id.toLowerCase().includes(q);
      const matchAddress = order.address.toLowerCase().includes(q);
      const matchStaff = order.staffName.toLowerCase().includes(q);
      if (!matchId && !matchAddress && !matchStaff) return false;
    }

    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'In Kitchen':
      case 'Pending':
        return (
          <span className="flex items-center gap-1 bg-amber-500/15 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-md text-[10px] font-bold">
            <ChefHat className="w-3 h-3" /> In Kitchen
          </span>
        );
      case 'Ready':
        return (
          <span className="flex items-center gap-1 bg-blue-500/15 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-md text-[10px] font-bold">
            <Clock className="w-3 h-3" /> Ready to Serve
          </span>
        );
      case 'Served':
        return (
          <span className="flex items-center gap-1 bg-purple-500/15 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-md text-[10px] font-bold">
            <Utensils className="w-3 h-3" /> Served at Table
          </span>
        );
      case 'Completed':
      case 'Delivered':
        return (
          <span className="flex items-center gap-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-md text-[10px] font-bold">
            <CheckCircle2 className="w-3 h-3" /> Completed & Paid
          </span>
        );
      case 'Cancelled':
        return (
          <span className="flex items-center gap-1 bg-rose-500/15 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-md text-[10px] font-bold">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md text-[10px] font-bold">
            {status}
          </span>
        );
    }
  };

  const getNextStatusAction = (status: string) => {
    switch (status) {
      case 'Pending':
      case 'In Kitchen':
        return { label: 'Mark Ready', next: 'Ready', color: 'bg-blue-600 hover:bg-blue-500' };
      case 'Ready':
        return { label: 'Mark Served', next: 'Served', color: 'bg-purple-600 hover:bg-purple-500' };
      case 'Served':
        return { label: 'Settle Bill & Finish', next: 'Completed', color: 'bg-emerald-600 hover:bg-emerald-500' };
      default:
        return null;
    }
  };

  return (
    <div className="pb-24 pt-2 px-3 max-w-lg mx-auto">
      {/* Receipt Modal */}
      {selectedReceiptOrder && (
        <ReceiptModal
          order={selectedReceiptOrder}
          onClose={() => setSelectedReceiptOrder(null)}
        />
      )}

      {/* Header & Refresh */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="font-extrabold text-base text-slate-100">Live Orders & Tables</h2>
          <p className="text-xs text-slate-400">Track and advance kitchen & table orders</p>
        </div>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 active:scale-95 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-orange-400' : ''}`} />
          Sync
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by Order #, Table, or Staff..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-orange-500"
        />
      </div>

      {/* Status Filter Tabs */}
      <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl mb-3">
        {[
          { id: 'active', label: 'Active' },
          { id: 'kitchen', label: 'Kitchen' },
          { id: 'completed', label: 'Completed' },
          { id: 'all', label: 'All' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedStatusTab(tab.id)}
            className={`py-1.5 text-xs font-bold rounded-lg transition ${
              selectedStatusTab === tab.id
                ? 'bg-orange-500 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800/60 p-6">
          <Utensils className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="font-bold text-slate-300 text-sm">No orders found</p>
          <p className="text-xs text-slate-500 mt-0.5">There are no orders matching this filter</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const nextAction = getNextStatusAction(order.status);
            const timeAgo = new Date(order.createdAt).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={order.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 shadow-sm space-y-2.5"
              >
                {/* Order Top Bar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-100 font-mono">
                      #{order.id}
                    </span>
                    {getStatusBadge(order.status)}
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" /> {timeAgo}
                  </span>
                </div>

                {/* Location / Table & Staff */}
                <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-slate-800/60">
                  <span className="font-semibold text-orange-400">{order.address}</span>
                  <span className="text-slate-400 font-mono text-[10px]">{order.paymentMethod}</span>
                </div>

                {/* Items Summary */}
                <div className="space-y-1 text-xs text-slate-300 py-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-200">
                        <span className="font-bold font-mono text-orange-400">{item.quantity}x</span>{' '}
                        {item.foodName || item.foodItem?.name || `Item ${idx + 1}`}
                      </span>
                      <span className="font-mono text-slate-400">
                        ₹{(item.price || item.foodItem?.price || 0) * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Order Total & Action Footer */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Bill</span>
                    <span className="font-extrabold font-mono text-sm text-white">₹{order.total}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* View/Print Receipt */}
                    <button
                      onClick={() => setSelectedReceiptOrder(order)}
                      className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white active:scale-95 transition"
                      title="View Receipt"
                    >
                      <Receipt className="w-4 h-4 text-orange-400" />
                    </button>

                    {/* Next status advance */}
                    {nextAction && (
                      <button
                        onClick={() => changeOrderStatus(order.id, nextAction.next)}
                        className={`px-3 py-1.5 rounded-xl text-white text-xs font-bold shadow-sm transition active:scale-95 ${nextAction.color}`}
                      >
                        {nextAction.label}
                      </button>
                    )}

                    {/* Quick cancel if pending */}
                    {(order.status === 'Pending' || order.status === 'In Kitchen') && (
                      <button
                        onClick={() => {
                          if (confirm(`Cancel order #${order.id}?`)) {
                            changeOrderStatus(order.id, 'Cancelled');
                          }
                        }}
                        className="p-2 rounded-xl bg-slate-800 border border-slate-700/80 text-rose-400 hover:bg-rose-950/40 active:scale-95 transition"
                        title="Cancel Order"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
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

export default ActiveOrders;
