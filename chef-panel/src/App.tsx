import React, { useState, useEffect } from 'react';
import { apiService } from './services/api';
import type { FoodItem, Order } from './services/api';
import {
  ChefHat, Flame, Clock, CheckCircle, AlertTriangle, RefreshCw,
  PackageX, PackageCheck, Search, Bell, Plus, Play, Tag, Volume2, VolumeX, Sparkles
} from 'lucide-react';

interface ExtendedPrepTimes {
  [orderId: string]: number; // minutes target, e.g. 20 default, 35 extended
}

interface OutOfStockItems {
  [foodId: string]: boolean;
}

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'stock'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Custom prep time targets per order (default 20 mins, max 35 mins)
  const [prepTargets, setPrepTargets] = useState<ExtendedPrepTimes>(() => {
    try {
      const saved = localStorage.getItem('chef_prep_targets');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Out of stock tracking
  const [outOfStock, setOutOfStock] = useState<OutOfStockItems>(() => {
    try {
      const saved = localStorage.getItem('chef_out_of_stock');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Search in stock tab
  const [stockSearch, setStockSearch] = useState('');
  const [stockCategory, setStockCategory] = useState('All');

  // Fetch live orders & food items
  const fetchData = async () => {
    try {
      const [orderData, foodData] = await Promise.all([
        apiService.getOrders(),
        apiService.getFoods(),
      ]);

      // Sort newest first
      const sortedOrders = orderData.sort(
        (a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()
      );

      setOrders(sortedOrders);
      setFoods(foodData);
    } catch (err) {
      console.error('Failed to load kitchen data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto refresh interval (every 5s)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchData();
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Persist prep targets
  useEffect(() => {
    localStorage.setItem('chef_prep_targets', JSON.stringify(prepTargets));
  }, [prepTargets]);

  // Persist out of stock
  useEffect(() => {
    localStorage.setItem('chef_out_of_stock', JSON.stringify(outOfStock));
  }, [outOfStock]);

  // Handle Order Status Update
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await apiService.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Extend Prep Time (20-25 min default -> 35 min)
  const handleExtendPrepTime = (orderId: string) => {
    setPrepTargets((prev) => ({
      ...prev,
      [orderId]: 35, // extend to 35 minutes max as requested
    }));
  };

  // Toggle Out of Stock
  const toggleOutOfStock = (foodId: string) => {
    setOutOfStock((prev) => ({
      ...prev,
      [foodId]: !prev[foodId],
    }));
  };

  // Filter Active vs Upcoming vs Past orders
  const upcomingOrders = orders.filter((o) => o.status === 'Pending');
  const preparingOrders = orders.filter((o) => o.status === 'Preparing');
  const completedOrders = orders.filter((o) => o.status === 'Out for Delivery' || o.status === 'Delivered');

  // Categories for Stock tab
  const categories = ['All', ...Array.from(new Set(foods.map((f) => f.category)))];

  const filteredFoods = foods.filter((f) => {
    const matchesCat = stockCategory === 'All' || f.category === stockCategory;
    const matchesSearch = f.name.toLowerCase().includes(stockSearch.toLowerCase()) ||
                          f.category.toLowerCase().includes(stockSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-2xl">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-amber-500 to-orange-600 p-2.5 rounded-2xl shadow-lg shadow-amber-500/20">
            <ChefHat className="w-7 h-7 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-black text-white tracking-tight">CHEF KITCHEN DISPLAY SYSTEM (KDS)</h1>
              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-black rounded-md">LIVE KITCHEN</span>
            </div>
            <p className="text-xs text-slate-400 font-semibold">Snake Exchange • Kitchen Order Management & Stock Control</p>
          </div>
        </div>

        {/* Action Controls & Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Navigation Tabs */}
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span>Kitchen Orders ({upcomingOrders.length + preparingOrders.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('stock')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === 'stock'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <PackageX className="w-4 h-4" />
              <span>Out of Stock Manager ({Object.values(outOfStock).filter(Boolean).length})</span>
            </button>
          </div>

          {/* Refresh & Toggles */}
          <div className="flex items-center space-x-2 border-l border-slate-800 pl-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                autoRefresh ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-spin' : ''}`} />
              <span>{autoRefresh ? 'Live Sync ON' : 'Paused'}</span>
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors cursor-pointer"
              title="Toggle sound alert"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {loading ? (
          <div className="flex justify-center items-center h-[50vh]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
          </div>
        ) : activeTab === 'orders' ? (
          <div className="space-y-8">
            
            {/* Section 1: Upcoming Placed Orders */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                  <h2 className="text-lg font-black text-white tracking-wide uppercase">
                    Upcoming Placed Orders ({upcomingOrders.length})
                  </h2>
                </div>
                <span className="text-xs text-slate-400 font-semibold">Orders waiting to be accepted</span>
              </div>

              {upcomingOrders.length === 0 ? (
                <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center text-slate-500 font-medium">
                  🛎️ No upcoming new orders right now.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      prepTarget={prepTargets[order.id] || 20}
                      outOfStockMap={outOfStock}
                      onAccept={() => handleStatusChange(order.id, 'Preparing')}
                      onCancel={() => handleStatusChange(order.id, 'Cancelled')}
                      onExtend={() => handleExtendPrepTime(order.id)}
                      isUpcoming={true}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Section 2: Orders in Preparation (Active Kitchen Queue) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
                  <h2 className="text-lg font-black text-white tracking-wide uppercase">
                    In Preparation ({preparingOrders.length})
                  </h2>
                </div>
                <span className="text-xs text-amber-400 font-bold">Default Prep: 20-25 min • Max Extend: 35 min</span>
              </div>

              {preparingOrders.length === 0 ? (
                <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center text-slate-500 font-medium">
                  🔥 Kitchen active queue empty. Accept an upcoming order to start cooking!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {preparingOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      prepTarget={prepTargets[order.id] || 20}
                      outOfStockMap={outOfStock}
                      onComplete={() => handleStatusChange(order.id, 'Out for Delivery')}
                      onCancel={() => handleStatusChange(order.id, 'Cancelled')}
                      onExtend={() => handleExtendPrepTime(order.id)}
                      isUpcoming={false}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Section 3: Recently Ready / Dispatched Orders */}
            {completedOrders.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-slate-800/80">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                  Dispatched / Completed ({completedOrders.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {completedOrders.slice(0, 6).map((order) => (
                    <div key={order.id} className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4 flex items-center justify-between text-xs opacity-75">
                      <div>
                        <span className="font-extrabold text-slate-300">Order #{order.id}</span>
                        <p className="text-[10px] text-slate-500">{order.items.length} items • &#8377;{order.total}</p>
                      </div>
                      <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 font-bold rounded-lg text-[10px]">
                        {order.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        ) : (
          /* Stock & Menu Availability Tab */
          <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <PackageX className="w-6 h-6 text-amber-500" />
                  Kitchen Out of Stock Manager
                </h2>
                <p className="text-xs text-slate-400 font-medium">
                  Toggle dish availability live when ingredients run out in the kitchen
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative max-w-xs w-full">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={stockSearch}
                    onChange={(e) => setStockSearch(e.target.value)}
                    placeholder="Search dish..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 outline-none focus:border-amber-500"
                  />
                </div>

                <select
                  value={stockCategory}
                  onChange={(e) => setStockCategory(e.target.value)}
                  className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-slate-300 outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Food Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredFoods.map((food) => {
                const isOut = !!outOfStock[food.id];
                return (
                  <div
                    key={food.id}
                    className={`bg-slate-900 border rounded-3xl p-5 space-y-4 transition-all ${
                      isOut ? 'border-red-500/40 bg-red-950/10' : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                      <img
                        src={food.image}
                        alt={food.name}
                        className={`w-full h-full object-cover ${isOut ? 'grayscale opacity-40' : ''}`}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80';
                        }}
                      />
                      {isOut && (
                        <div className="absolute inset-0 bg-red-950/80 backdrop-blur-xs flex items-center justify-center">
                          <span className="px-3 py-1 bg-red-600 text-white font-black text-xs rounded-full uppercase tracking-wider">
                            OUT OF STOCK
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-extrabold text-white text-sm line-clamp-1">{food.name}</h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${food.isVeg ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {food.isVeg ? 'Veg' : 'Non-Veg'}
                        </span>
                      </div>
                      <p className="text-xs text-amber-400 font-black">&#8377;{food.price}</p>
                    </div>

                    {/* Stock Toggle Button */}
                    <button
                      onClick={() => toggleOutOfStock(food.id)}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center space-x-2 cursor-pointer transition-all ${
                        isOut
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg'
                          : 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {isOut ? (
                        <>
                          <PackageCheck className="w-4 h-4" />
                          <span>Mark Back IN STOCK</span>
                        </>
                      ) : (
                        <>
                          <PackageX className="w-4 h-4" />
                          <span>Mark OUT OF STOCK</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// ── Kitchen Order Card Component with Dynamic Timer & 35-min Extension ──
interface OrderCardProps {
  order: Order;
  prepTarget: number; // e.g. 20 default, 35 extended
  outOfStockMap: OutOfStockItems;
  onAccept?: () => void;
  onComplete?: () => void;
  onCancel: () => void;
  onExtend: () => void;
  isUpcoming: boolean;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  prepTarget,
  outOfStockMap,
  onAccept,
  onComplete,
  onCancel,
  onExtend,
  isUpcoming,
}) => {
  const [elapsed, setElapsed] = useState(0);

  // Calculate elapsed time since order created / started
  useEffect(() => {
    const orderTime = new Date(order.createdAt).getTime();
    const updateTimer = () => {
      const now = new Date().getTime();
      const diffSec = Math.max(0, Math.floor((now - orderTime) / 1000));
      setElapsed(diffSec);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [order.createdAt]);

  const totalTargetSec = prepTarget * 60; // 20 min = 1200s, 35 min = 2100s
  const remainingSec = Math.max(0, totalTargetSec - elapsed);
  const remMinutes = Math.floor(remainingSec / 60);
  const remSeconds = remainingSec % 60;
  const isOverdue = elapsed > totalTargetSec;
  const isExtended = prepTarget >= 35;

  return (
    <div
      className={`bg-slate-900 border rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-4 relative overflow-hidden transition-all ${
        isOverdue
          ? 'border-red-500 bg-red-950/20'
          : isExtended
          ? 'border-amber-500/50 bg-amber-950/10'
          : 'border-slate-800'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <span className="text-xs font-mono text-amber-400 font-extrabold block">Order #{order.id}</span>
          <span className="text-[10px] text-slate-500 font-medium">
            Placed {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Prep Timer Pill */}
        <div className="text-right">
          <div
            className={`px-3 py-1 rounded-xl text-xs font-black inline-flex items-center space-x-1.5 ${
              isOverdue
                ? 'bg-red-500 text-white animate-pulse'
                : isExtended
                ? 'bg-amber-500 text-slate-950'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>
              {isOverdue
                ? `OVERDUE (+${Math.floor((elapsed - totalTargetSec) / 60)}m)`
                : `${String(remMinutes).padStart(2, '0')}:${String(remSeconds).padStart(2, '0')} left`}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5 font-bold">
            Target: {prepTarget} Mins {isExtended ? '(Extended)' : ''}
          </span>
        </div>
      </div>

      {/* Item List */}
      <div className="space-y-2 flex-1">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dishes to Cook</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {order.items.map((item) => {
            const isItemOut = !!outOfStockMap[item.foodItem?.id];
            return (
              <div
                key={item.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                  isItemOut
                    ? 'bg-red-950/30 border-red-800/40 text-red-300'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${item.foodItem?.isVeg ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <div>
                    <span className="font-extrabold text-white block">{item.foodItem?.name || 'Dish Item'}</span>
                    {isItemOut && <span className="text-[10px] text-red-400 font-bold">⚠️ Item Marked Out of Stock</span>}
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 font-black rounded-lg text-xs">
                  x{item.quantity}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Extension Control & Actions */}
      <div className="pt-3 border-t border-slate-800 space-y-2">
        {!isUpcoming && !isExtended && (
          <button
            onClick={onExtend}
            className="w-full py-1.5 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Extend Prep Time to 35 Mins</span>
          </button>
        )}

        {isUpcoming ? (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onAccept}
              className="py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 shadow-md cursor-pointer transition-all"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>Accept & Cook</span>
            </button>
            <button
              onClick={onCancel}
              className="py-2.5 px-3 bg-slate-800 hover:bg-red-950/40 text-slate-400 hover:text-red-400 rounded-xl text-xs font-bold cursor-pointer transition-colors"
            >
              <span>Cancel</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={onComplete}
              className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center justify-center space-x-1.5 shadow-lg cursor-pointer transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Mark Ready for Pickup</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

