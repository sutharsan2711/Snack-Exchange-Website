import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import type { FoodItem, Order } from '../services/api';
import { Utensils, ShoppingBag, DollarSign, TrendingUp, Clock } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurantName, setRestaurantName] = useState('Snake Exchange');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [foodData, orderData, restData] = await Promise.all([
          apiService.getFoods(),
          apiService.getOrders(),
          apiService.getRestaurants(),
        ]);
        setFoods(foodData);
        setOrders(orderData);
        if (restData.length > 0) {
          setRestaurantName(restData[0].name);
        }
      } catch (err) {
        console.error('Failed to load dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Calculate statistics
  const totalFoods = foods.length;
  const totalOrders = orders.length;
  
  // Successful orders revenue
  const completedOrders = orders.filter(o => o.status !== 'Cancelled');
  const revenue = completedOrders.reduce((acc, o) => acc + o.total, 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(revenue / totalOrders) : 0;
  
  const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Preparing').length;

  const stats = [
    {
      name: 'Total Menu Items',
      value: totalFoods,
      icon: Utensils,
      color: 'bg-blue-500',
      description: 'Active dishes on the menu',
    },
    {
      name: 'Total Orders',
      value: totalOrders,
      icon: ShoppingBag,
      color: 'bg-amber-500',
      description: 'Customer order submissions',
    },
    {
      name: 'Total Revenue',
      value: `₹${revenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-emerald-500',
      description: 'Excludes cancelled orders',
    },
    {
      name: 'Avg Order Value',
      value: `₹${avgOrderValue}`,
      icon: TrendingUp,
      color: 'bg-indigo-500',
      description: 'Average spent per order',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Dashboard</h1>
        <p className="text-slate-500 font-medium">Real-time performance summary of {restaurantName}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
              <div className={`p-4 rounded-2xl ${stat.color} text-white shadow-lg`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">{stat.name}</span>
                <span className="text-2xl font-black text-slate-800 block">{stat.value}</span>
                <span className="text-[10px] text-slate-400 font-semibold block">{stat.description}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Orders summary section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Alerts */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg font-extrabold text-slate-800">Operational Overview</h2>
            {pendingOrders > 0 && (
              <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full animate-pulse">
                {pendingOrders} Action Required
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-sm font-semibold text-slate-500 block">Pending / Preparing Orders</span>
              <span className="text-3xl font-black text-slate-800 block">{pendingOrders}</span>
              <span className="text-xs text-slate-400 font-medium">Currently in the kitchen</span>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-sm font-semibold text-slate-500 block">Completed Deliveries</span>
              <span className="text-3xl font-black text-slate-800 block">
                {orders.filter(o => o.status === 'Delivered').length}
              </span>
              <span className="text-xs text-slate-400 font-medium">Dispatched and closed orders</span>
            </div>
          </div>
        </div>

        {/* Quick Links / Help */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-950 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold">
              <Clock className="w-3.5 h-3.5 text-indigo-300" />
              <span>STORE IS ACTIVE</span>
            </div>
            <h3 className="text-xl font-extrabold">Instant Seeding System</h3>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Manage your food menu, categories, pricing, and live customer orders directly. Any changes made here are instantly pushed to the customer website interface.
            </p>
          </div>
          <div className="pt-6 border-t border-white/10 text-xs font-semibold text-indigo-300">
            Snake Exchange Admin Portal v1.0
          </div>
        </div>
      </div>
    </div>
  );
};
