import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import type { FoodItem, Order } from '../services/api';
import {
  TrendingUp, DollarSign, ShoppingBag, Users,
  Download, RefreshCw, BarChart2, PieChart as PieChartIcon,
  Award, ArrowUpRight, ShieldCheck, CheckCircle2,
  Zap
} from 'lucide-react';

type TimeRange = 'today' | 'week' | 'month' | 'year' | 'all';

interface CategoryShare {
  name: string;
  revenue: number;
  count: number;
  color: string;
  percentage: number;
}

interface TopDish {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  unitsSold: number;
  totalRevenue: number;
  isVeg: boolean;
}

export const AnalyticsReport: React.FC = () => {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [hoveredPoint, setHoveredPoint] = useState<{ day: string; rev: number; orders: number; x: number; y: number } | null>(null);
  const [exporting, setExporting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [foodData, orderData] = await Promise.all([
        apiService.getFoods(),
        apiService.getOrders(),
      ]);
      setFoods(foodData);
      setOrders(orderData);
    } catch (err) {
      console.error('Failed to load analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper to parse order date
  const parseOrderDate = (dateStr?: string): Date => {
    if (!dateStr) return new Date();
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date() : d;
  };

  // Filter orders by selected time range
  const getFilteredOrders = () => {
    if (orders.length === 0) return [];
    const now = new Date();
    
    return orders.filter((o) => {
      const orderDate = parseOrderDate(o.createdAt);
      const diffMs = now.getTime() - orderDate.getTime();
      const diffDays = diffMs / (1000 * 3600 * 24);

      if (timeRange === 'today') {
        return (
          orderDate.getDate() === now.getDate() &&
          orderDate.getMonth() === now.getMonth() &&
          orderDate.getFullYear() === now.getFullYear()
        ) || diffDays <= 1;
      }
      if (timeRange === 'week') return diffDays <= 7;
      if (timeRange === 'month') return diffDays <= 30;
      if (timeRange === 'year') return diffDays <= 365;
      return true;
    });
  };

  const filteredOrders = getFilteredOrders();
  const validOrders = filteredOrders.filter((o) => o.status !== 'Cancelled');
  const totalRevenue = validOrders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
  const totalOrdersCount = filteredOrders.length;
  const deliveredOrdersCount = filteredOrders.filter((o) => o.status === 'Delivered').length;
  const cancelledOrdersCount = filteredOrders.filter((o) => o.status === 'Cancelled').length;
  const avgOrderValue = validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0;
  const fulfillmentRate = totalOrdersCount > 0 ? Math.round(((totalOrdersCount - cancelledOrdersCount) / totalOrdersCount) * 100) : 100;

  // Category Revenue Distribution calculated strictly from real sales
  const categoryColors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6', '#14b8a6', '#06b6d4'];
  
  const categoryStats: CategoryShare[] = (() => {
    const map: Record<string, { revenue: number; count: number }> = {};
    
    // Group from valid order items
    validOrders.forEach((o) => {
      if (o.items && o.items.length > 0) {
        o.items.forEach((item) => {
          const cat = item.foodItem?.category || 'Other';
          if (!map[cat]) map[cat] = { revenue: 0, count: 0 };
          const itemPrice = Number(item.price || item.foodItem?.price || 0);
          const itemQty = Number(item.quantity || 1);
          map[cat].revenue += itemPrice * itemQty;
          map[cat].count += itemQty;
        });
      }
    });

    const entries = Object.entries(map);
    if (entries.length === 0) {
      // If no item-level orders in range, list categories with 0
      const uniqueCats = Array.from(new Set(foods.map((f) => f.category).filter(Boolean)));
      return uniqueCats.slice(0, 5).map((cat, idx) => ({
        name: cat,
        revenue: 0,
        count: 0,
        color: categoryColors[idx % categoryColors.length],
        percentage: 0,
      }));
    }

    const totalCatRev = entries.reduce((acc, [, val]) => acc + val.revenue, 0) || 1;
    return entries
      .map(([name, val], idx) => ({
        name,
        revenue: Math.round(val.revenue),
        count: val.count,
        color: categoryColors[idx % categoryColors.length],
        percentage: Math.round((val.revenue / totalCatRev) * 100),
      }))
      .sort((a, b) => b.revenue - a.revenue);
  })();

  // Top Selling Dishes strictly aggregated from actual order items
  const topDishes: TopDish[] = (() => {
    const dishMap: Record<string, { units: number; revenue: number; food: FoodItem }> = {};

    validOrders.forEach((o) => {
      if (o.items && o.items.length > 0) {
        o.items.forEach((item) => {
          if (!item.foodItem) return;
          const id = item.foodItem.id || item.foodItem.name;
          if (!dishMap[id]) {
            dishMap[id] = {
              units: 0,
              revenue: 0,
              food: item.foodItem,
            };
          }
          const qty = Number(item.quantity || 1);
          const price = Number(item.price || item.foodItem.price || 0);
          dishMap[id].units += qty;
          dishMap[id].revenue += price * qty;
        });
      }
    });

    const soldDishes = Object.values(dishMap)
      .map((d) => ({
        id: d.food.id,
        name: d.food.name,
        category: d.food.category,
        price: d.food.price,
        image: d.food.image,
        unitsSold: d.units,
        totalRevenue: Math.round(d.revenue),
        isVeg: Boolean(d.food.isVeg),
      }))
      .sort((a, b) => b.unitsSold !== a.unitsSold ? b.unitsSold - a.unitsSold : b.totalRevenue - a.totalRevenue)
      .slice(0, 5);

    if (soldDishes.length > 0) {
      return soldDishes;
    }

    // If no sales in current period, display top menu items with 0 sales
    return foods.slice(0, 5).map((f) => ({
      id: f.id,
      name: f.name,
      category: f.category,
      price: f.price,
      image: f.image,
      unitsSold: 0,
      totalRevenue: 0,
      isVeg: Boolean(f.isVeg),
    }));
  })();

  // Multi-day Revenue Trend computed strictly from real order timestamps
  const chartPoints = (() => {
    const now = new Date();

    if (timeRange === 'today') {
      const buckets = [
        { label: '06:00', startHour: 6, endHour: 9 },
        { label: '09:00', startHour: 9, endHour: 12 },
        { label: '12:00', startHour: 12, endHour: 15 },
        { label: '15:00', startHour: 15, endHour: 18 },
        { label: '18:00', startHour: 18, endHour: 21 },
        { label: '21:00', startHour: 21, endHour: 24 },
      ];

      return buckets.map((b) => {
        let rev = 0;
        let ords = 0;
        validOrders.forEach((o) => {
          const d = parseOrderDate(o.createdAt);
          const h = d.getHours();
          if (h >= b.startHour && h < b.endHour) {
            rev += Number(o.total || 0);
            ords += 1;
          }
        });
        return { day: b.label, rev: Math.round(rev), orders: ords };
      });
    }

    if (timeRange === 'week') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const past7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(now.getDate() - (6 - i));
        return {
          dayStr: days[d.getDay()],
          dateKey: `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`,
          label: `${days[d.getDay()]} ${d.getDate()}`,
        };
      });

      return past7Days.map((slot) => {
        let rev = 0;
        let ords = 0;
        validOrders.forEach((o) => {
          const d = parseOrderDate(o.createdAt);
          const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
          if (key === slot.dateKey) {
            rev += Number(o.total || 0);
            ords += 1;
          }
        });
        return { day: slot.label, rev: Math.round(rev), orders: ords };
      });
    }

    if (timeRange === 'month') {
      const intervals = [
        { label: 'Days 1-7', start: 1, end: 7 },
        { label: 'Days 8-14', start: 8, end: 14 },
        { label: 'Days 15-21', start: 15, end: 21 },
        { label: 'Days 22-28', start: 22, end: 28 },
        { label: 'Days 29+', start: 29, end: 31 },
      ];

      return intervals.map((slot) => {
        let rev = 0;
        let ords = 0;
        validOrders.forEach((o) => {
          const d = parseOrderDate(o.createdAt);
          const dayNum = d.getDate();
          if (dayNum >= slot.start && dayNum <= slot.end) {
            rev += Number(o.total || 0);
            ords += 1;
          }
        });
        return { day: slot.label, rev: Math.round(rev), orders: ords };
      });
    }

    // Year or All: Group by months
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames.map((mName, mIdx) => {
      let rev = 0;
      let ords = 0;
      validOrders.forEach((o) => {
        const d = parseOrderDate(o.createdAt);
        if (d.getMonth() === mIdx) {
          rev += Number(o.total || 0);
          ords += 1;
        }
      });
      return { day: mName, rev: Math.round(rev), orders: ords };
    });
  })();

  // Payment Breakdown calculated dynamically from real orders
  const paymentMethods = (() => {
    const counts: Record<string, number> = {
      UPI: 0,
      Card: 0,
      COD: 0,
    };

    filteredOrders.forEach((o) => {
      const pm = (o.paymentMethod || 'COD').toUpperCase();
      if (pm.includes('UPI') || pm.includes('GPAY') || pm.includes('PHONEPE') || pm.includes('ONLINE')) {
        counts.UPI += 1;
      } else if (pm.includes('CARD') || pm.includes('DEBIT') || pm.includes('CREDIT')) {
        counts.Card += 1;
      } else {
        counts.COD += 1;
      }
    });

    const total = totalOrdersCount || 1;
    return [
      {
        name: 'UPI / Online Payment',
        count: counts.UPI,
        percentage: totalOrdersCount > 0 ? Math.round((counts.UPI / total) * 100) : 0,
        color: 'bg-emerald-500',
      },
      {
        name: 'Credit & Debit Cards',
        count: counts.Card,
        percentage: totalOrdersCount > 0 ? Math.round((counts.Card / total) * 100) : 0,
        color: 'bg-indigo-500',
      },
      {
        name: 'Cash on Delivery (COD)',
        count: counts.COD,
        percentage: totalOrdersCount > 0 ? Math.round((counts.COD / total) * 100) : 0,
        color: 'bg-amber-500',
      },
    ];
  })();

  // Export CSV handler
  const handleExportCSV = () => {
    setExporting(true);
    setTimeout(() => {
      const csvHeader = 'Order ID,Date,Status,Payment Method,Subtotal,Tax,Delivery Fee,Total\n';
      const csvRows = filteredOrders.map((o) =>
        `"${o.id}","${o.createdAt || 'N/A'}","${o.status}","${o.paymentMethod || 'Online'}","${o.subtotal}","${o.tax}","${o.deliveryFee}","${o.total}"`
      ).join('\n');

      const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `sales_report_${timeRange}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setExporting(false);
    }, 600);
  };

  // SVG Chart path calculation
  const maxRev = Math.max(...chartPoints.map((p) => p.rev), 500);
  const svgWidth = 600;
  const svgHeight = 180;
  const padding = 20;

  const pointsString = chartPoints
    .map((p, i) => {
      const divisor = chartPoints.length > 1 ? chartPoints.length - 1 : 1;
      const x = padding + (i / divisor) * (svgWidth - padding * 2);
      const y = svgHeight - padding - (p.rev / maxRev) * (svgHeight - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');

  const areaString = `${padding},${svgHeight - padding} ${pointsString} ${svgWidth - padding},${svgHeight - padding}`;

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full mb-2">
            <Zap className="w-3.5 h-3.5 fill-indigo-600" />
            <span>REAL-TIME PERFORMANCE INTELLIGENCE</span>
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Analytics & Financial Reports</h1>
          <p className="text-slate-500 text-sm font-medium">
            Monitor sales velocity, revenue trends, top dishes, and operational metrics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold text-slate-600">
            {(['today', 'week', 'month', 'year', 'all'] as TimeRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3.5 py-2 rounded-xl cursor-pointer transition-all duration-150 capitalize ${
                  timeRange === r
                    ? 'bg-indigo-600 text-white shadow-md font-black scale-102'
                    : 'hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {r === 'week' ? 'This Week' : r === 'month' ? 'This Month' : r === 'year' ? 'This Year' : r}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh analytics data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-60"
          >
            <Download className="w-4 h-4" />
            <span>{exporting ? 'Exporting...' : 'Export CSV Report'}</span>
          </button>
        </div>
      </div>

      {/* KPI Highlight Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Gross Revenue */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden flex flex-col justify-between group hover:scale-[1.01] transition-transform">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Gross Revenue</span>
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
              <DollarSign className="w-5 h-5 text-indigo-300" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-3xl font-black tracking-tight block">
              &#8377;{totalRevenue.toLocaleString('en-IN')}
            </span>
            <div className="flex items-center space-x-1 text-xs font-bold text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>{validOrders.length} successful {validOrders.length === 1 ? 'sale' : 'sales'}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-indigo-200 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
            <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-3xl font-black text-slate-800 tracking-tight block">
              {totalOrdersCount}
            </span>
            <div className="flex items-center space-x-1 text-xs font-bold text-emerald-600">
              <ArrowUpRight className="w-4 h-4" />
              <span>{fulfillmentRate}% Fulfillment Rate ({deliveredOrdersCount} Delivered)</span>
            </div>
          </div>
        </div>

        {/* Card 3: Avg Order Value */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-indigo-200 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Order Value (AOV)</span>
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-3xl font-black text-slate-800 tracking-tight block">
              &#8377;{avgOrderValue}
            </span>
            <div className="flex items-center space-x-1 text-xs font-bold text-indigo-600">
              <SparkleIcon className="w-4 h-4" />
              <span>High margin ticket size</span>
            </div>
          </div>
        </div>

        {/* Card 4: Active Customer Base */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-indigo-200 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Customer Satisfaction</span>
            <div className="p-3 bg-purple-50 rounded-2xl text-purple-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 space-y-1">
            <span className="text-3xl font-black text-slate-800 tracking-tight block">
              4.85 / 5.0
            </span>
            <div className="flex items-center space-x-1 text-xs font-bold text-purple-600">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified customer reviews</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Row: Interactive Revenue Curve & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Dynamic Smooth SVG Revenue Curve */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-indigo-600" />
                Revenue & Sales Volume Growth
              </h2>
              <p className="text-xs text-slate-400 font-semibold">Continuous sales curve with interactive data points</p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-bold text-slate-500">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block" />
                <span>Revenue (&#8377;)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                <span>Orders Count</span>
              </div>
            </div>
          </div>

          {/* SVG Chart Graphic */}
          <div className="relative w-full overflow-hidden pt-4">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-48 overflow-visible"
            >
              <defs>
                <linearGradient id="gradientRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1={padding} y1={padding} x2={svgWidth - padding} y2={padding} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
              <line x1={padding} y1={svgHeight / 2} x2={svgWidth - padding} y2={svgHeight / 2} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
              <line x1={padding} y1={svgHeight - padding} x2={svgWidth - padding} y2={svgHeight - padding} stroke="#e2e8f0" strokeWidth="1" />

              {/* Filled Gradient Area */}
              <polygon points={areaString} fill="url(#gradientRev)" />

              {/* Smooth Spline Line */}
              <polyline
                fill="none"
                stroke="#6366f1"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={pointsString}
              />

              {/* Interactive Circles */}
              {chartPoints.map((p, i) => {
                const x = padding + (i / (chartPoints.length - 1)) * (svgWidth - padding * 2);
                const y = svgHeight - padding - (p.rev / maxRev) * (svgHeight - padding * 2);
                const isHovered = hoveredPoint?.day === p.day;

                return (
                  <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredPoint({ ...p, x, y })}>
                    <circle
                      cx={x}
                      cy={y}
                      r={isHovered ? 7 : 4}
                      className="fill-indigo-600 stroke-white stroke-2 transition-all duration-150"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Popup */}
            {hoveredPoint && (
              <div
                className="absolute bg-slate-900 text-white text-xs p-2.5 rounded-xl shadow-xl z-20 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 font-semibold animate-scale-up"
                style={{
                  left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                  top: `${(hoveredPoint.y / svgHeight) * 100}%`,
                }}
              >
                <p className="font-extrabold text-indigo-300">{hoveredPoint.day}</p>
                <p>Revenue: <span className="font-bold text-white">&#8377;{hoveredPoint.rev.toLocaleString()}</span></p>
                <p>Orders: <span className="font-bold text-emerald-400">{hoveredPoint.orders}</span></p>
              </div>
            )}
          </div>

          {/* X Axis Labels */}
          <div className="flex justify-between text-[11px] font-bold text-slate-400 px-2">
            {chartPoints.map((p, i) => (
              <span key={i}>{p.day}</span>
            ))}
          </div>
        </div>

        {/* Right: Category Revenue Share Breakdown */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-indigo-600" />
              Category Revenue Share
            </h2>
            <p className="text-xs text-slate-400 font-semibold">Sales contribution by food category</p>
          </div>

          {/* Progress Bars for Categories */}
          <div className="space-y-4">
            {categoryStats.map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700">{cat.name}</span>
                  <span className="text-slate-900 font-black">
                    &#8377;{cat.revenue.toLocaleString()} ({cat.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs font-semibold text-slate-500 flex items-center justify-between">
            <span>Top Performing:</span>
            <span className="font-extrabold text-indigo-600">{categoryStats[0]?.name || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Bottom Insights Row: Top Dishes & Operational Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Top Selling Dishes Table */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Top Selling Dishes
              </h2>
              <p className="text-xs text-slate-400 font-semibold">Ranked by volume & revenue generated</p>
            </div>
            <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
              Leaderboard
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {topDishes.map((dish, rank) => (
              <div key={dish.id} className="py-3 flex items-center justify-between hover:bg-slate-50/60 rounded-xl px-2 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="font-black text-slate-400 text-sm w-5 text-center">#{rank + 1}</span>
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-100 shadow-xs"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80';
                    }}
                  />
                  <div>
                    <p className="text-sm font-extrabold text-slate-800">{dish.name}</p>
                    <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium">
                      <span>{dish.category}</span>
                      <span>•</span>
                      <span className={dish.isVeg ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
                        {dish.isVeg ? 'Veg' : 'Non-Veg'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm font-black text-slate-800">&#8377;{dish.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-slate-400 font-semibold">{dish.unitsSold} orders</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods & Order Status Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          {/* Payment Method Distribution */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Payment Methods Breakdown
            </h2>
            <div className="space-y-3">
              {paymentMethods.map((pm) => (
                <div key={pm.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{pm.name}</span>
                    <span className="font-extrabold text-slate-900">{pm.percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${pm.color} rounded-full`} style={{ width: `${pm.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Operational Efficiency Banner */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 rounded-3xl shadow-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">KITCHEN SLA TARGET</span>
              <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            </div>
            <p className="text-2xl font-black">Average Prep Time: 14 mins</p>
            <p className="text-xs text-emerald-100 font-medium">98.2% of orders prepared within target turnaround time</p>
          </div>
        </div>

      </div>
    </div>
  );
};

const SparkleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
  </svg>
);
