import React, { useState, useMemo } from 'react';
import { usePos } from '../context/PosContext';
import { Search, Plus, Minus, AlertCircle } from 'lucide-react';
import CartDrawer from '../components/CartDrawer';
import { FoodItem } from '../types/pos';

export const PosTerminal: React.FC = () => {
  const { foods, categories, addToCart, decrementFood, cart, isLoading } = usePos();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [vegFilter, setVegFilter] = useState<'all' | 'veg' | 'nonveg'>('all');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [justTappedId, setJustTappedId] = useState<string | null>(null);

  const filteredFoods = useMemo(() => {
    return foods.filter((food) => {
      // Category filter
      if (selectedCategory !== 'all') {
        const matchesCat =
          food.category.toLowerCase().replace(/[^a-z0-9]/g, '-') === selectedCategory.toLowerCase().replace(/[^a-z0-9]/g, '-') ||
          food.category.toLowerCase() === selectedCategory.toLowerCase();
        if (!matchesCat) return false;
      }

      // Veg/Non-Veg filter
      if (vegFilter === 'veg' && !food.isVeg) return false;
      if (vegFilter === 'nonveg' && food.isVeg) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = food.name.toLowerCase().includes(q);
        const matchesCategory = food.category.toLowerCase().includes(q);
        if (!matchesName && !matchesCategory) return false;
      }

      return true;
    });
  }, [foods, selectedCategory, vegFilter, searchQuery]);

  const handleCardClick = (food: FoodItem) => {
    addToCart(food);
    setJustTappedId(food.id);
    setTimeout(() => setJustTappedId(null), 300);
  };

  const handleIncrement = (e: React.MouseEvent, food: FoodItem) => {
    e.stopPropagation();
    addToCart(food);
    setJustTappedId(food.id);
    setTimeout(() => setJustTappedId(null), 300);
  };

  const handleDecrement = (e: React.MouseEvent, foodId: string) => {
    e.stopPropagation();
    decrementFood(foodId);
  };

  const getItemCartQuantity = (foodId: string) => {
    return cart
      .filter((item) => item.food.id === foodId)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <div className="pb-36 pt-2 px-3 max-w-lg mx-auto">
      {/* Search & Veg/Non-Veg Filter Bar */}
      <div className="flex items-center gap-2 mb-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search food item or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Veg / Non-Veg Quick Toggle */}
        <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-0.5">
          <button
            onClick={() => setVegFilter('all')}
            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition ${
              vegFilter === 'all' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setVegFilter('veg')}
            className={`px-2 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
              vegFilter === 'veg' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-xs' : 'text-slate-400 hover:text-emerald-400'
            }`}
            title="Veg Only"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            Veg
          </button>
          <button
            onClick={() => setVegFilter('nonveg')}
            className={`px-2 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
              vegFilter === 'nonveg' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-xs' : 'text-slate-400 hover:text-rose-400'
            }`}
            title="Non-Veg Only"
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
            Non
          </button>
        </div>
      </div>

      {/* Horizontal Category Carousel */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-2.5">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
            selectedCategory === 'all'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          🌟 All Items ({foods.length})
        </button>

        {categories.map((cat) => {
          const isSelected =
            selectedCategory.toLowerCase() === cat.id?.toLowerCase() ||
            selectedCategory.toLowerCase() === cat.name?.toLowerCase();
          return (
            <button
              key={cat.id || cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                isSelected
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Fast No-Image Menu Items Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-2 pt-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-24 bg-slate-900/60 rounded-2xl animate-pulse border border-slate-800/80" />
          ))}
        </div>
      ) : filteredFoods.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800/60 mt-4 p-6">
          <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="font-bold text-slate-300 text-sm">No items found</p>
          <p className="text-xs text-slate-500 mt-0.5">Try searching with a different keyword or category</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {filteredFoods.map((food) => {
            const qty = getItemCartQuantity(food.id);
            const isJustTapped = justTappedId === food.id;

            return (
              <div
                key={food.id}
                onClick={() => handleCardClick(food)}
                className={`relative bg-slate-900 border rounded-2xl p-3 flex flex-col justify-between cursor-pointer active:scale-95 transition-all shadow-sm select-none min-h-[96px] ${
                  qty > 0
                    ? 'border-orange-500/80 bg-gradient-to-br from-slate-900 via-slate-900 to-orange-950/30 ring-1 ring-orange-500/40'
                    : 'border-slate-800 hover:border-slate-700'
                } ${isJustTapped ? 'ring-2 ring-orange-400 scale-[0.98]' : ''}`}
              >
                {/* Top Row: Veg/Non-Veg Dot & Category */}
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                        food.isVeg ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                    <span className="text-[10px] text-slate-400 font-medium truncate max-w-[80px]">
                      {food.category || 'General'}
                    </span>
                  </div>

                  {qty > 0 && (
                    <span className="text-[10px] font-mono font-extrabold text-orange-400 bg-orange-500/15 px-1.5 py-0.2 rounded-full border border-orange-500/30">
                      ₹{food.price * qty}
                    </span>
                  )}
                </div>

                {/* Middle: Product Name */}
                <h4 className="font-extrabold text-xs text-slate-100 line-clamp-2 leading-snug my-1">
                  {food.name}
                </h4>

                {/* Bottom Row: Price & Interactive Stepper (+, -, number) */}
                <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-slate-800/80">
                  <span className="font-mono font-extrabold text-sm text-orange-400">
                    ₹{food.price}
                  </span>

                  {/* Quantity Stepper (When Selected) or + Button (When Unselected) */}
                  {qty > 0 ? (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center bg-slate-950 border border-orange-500/50 rounded-xl overflow-hidden shadow-xs"
                    >
                      {/* Decrement Button */}
                      <button
                        type="button"
                        onClick={(e) => handleDecrement(e, food.id)}
                        className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-white active:bg-orange-600 transition"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      {/* Number Display */}
                      <span className="w-6 text-center text-xs font-black font-mono text-orange-400 select-none">
                        {qty}
                      </span>

                      {/* Increment Button */}
                      <button
                        type="button"
                        onClick={(e) => handleIncrement(e, food)}
                        className="w-7 h-7 flex items-center justify-center text-white bg-orange-500 hover:bg-orange-600 active:bg-orange-700 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => handleIncrement(e, food)}
                      className="w-7 h-7 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-orange-500 active:text-white border border-slate-700 text-slate-200 flex items-center justify-center font-bold text-xs transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cart Drawer Component */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export default PosTerminal;
