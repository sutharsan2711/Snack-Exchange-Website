import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { apiService } from '../services/api';
import type { Category } from '../services/api';
import type { Restaurant } from '../types/restaurant';
import type { FoodItem } from '../types/food';
import { FoodCard } from '../components/FoodCard';
import { ImageLightboxModal } from '../components/ImageLightboxModal';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useCartStore } from '../store/cartStore';
import { Star, Clock, MapPin, Flame, ShieldCheck, Sparkles, TrendingUp, Search, Info, ShoppingCart, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const Home: React.FC = () => {
  const { items, subtotal, deliveryFee, tax, total, increaseQuantity, decreaseQuantity, removeItem } = useCartStore();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParam = searchParams.get('search') || '';

  // Filtering states
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>(searchParam);
  const [foodType, setFoodType] = useState<'all' | 'veg' | 'non-veg'>('all');

  // Sync state with URL search param
  useEffect(() => {
    setSearchQuery(searchParam);
  }, [searchParam]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (val) {
      setSearchParams({ search: val });
    } else {
      setSearchParams({});
    }
  };

  useEffect(() => {
    const fetchRestaurantAndMenu = async () => {
      try {
        setLoading(true);
        const [rests, categoryData] = await Promise.all([
          apiService.getRestaurants(),
          apiService.getCategories()
        ]);
        setCategories(categoryData);

        if (rests.length > 0) {
          // Get the single restaurant (The Gourmet Bistro)
          const singleRest = rests[0];
          setRestaurant(singleRest);
          
          // Get all menu items for this restaurant and shuffle them
          const foodItems = await apiService.getFoodsByRestaurantId(singleRest.id);
          setFoods(shuffleArray(foodItems));
        }
      } catch (error) {
        console.error('Failed to load restaurant details:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurantAndMenu();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!restaurant) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-6 min-h-[60vh] flex flex-col justify-center items-center">
        <div className="text-5xl">🍽️</div>
        <h2 className="text-2xl font-black text-slate-800">Restaurant Not Found</h2>
        <p className="text-slate-500 max-w-sm">
          We couldn't load the restaurant menu. Please verify the backend service is running.
        </p>
      </div>
    );
  }

  // Get unique menu categories for filter tabs
  const menuCategories = [{ id: 'all', name: 'All', image: '' }, ...categories];

  // Filter foods by category, search query, and veg/non-veg status
  const displayedFoods = foods.filter((food) => {
    const foodCat = (food.category || '').trim().toLowerCase();
    const isCategoryValid = categories.some((c) => (c.name || '').trim().toLowerCase() === foodCat);
    
    // When "All" is selected, only show foods that belong to an existing category.
    // When a specific category is selected, match against that category name.
    const matchesCategory = selectedCategory === 'All'
      ? isCategoryValid
      : foodCat === selectedCategory.trim().toLowerCase();

    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (food.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = foodType === 'all' || 
                        (foodType === 'veg' && food.isVeg) || 
                        (foodType === 'non-veg' && !food.isVeg);
    return matchesCategory && matchesSearch && matchesType;
  });

  const showBanner = restaurant.showBanner !== false;

  return (
    <div className="min-h-screen bg-brand-light pb-12">

      {/* Offline Status Warning Notice */}
      {restaurant && restaurant.isOpen === false && (
        <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-pink-600 text-white py-3 px-4 shadow-sm border-b border-rose-700/20">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2.5 text-xs md:text-sm font-extrabold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-white animate-ping flex-shrink-0" />
            <span>
              🔴 STORE CURRENTLY CLOSED FOR ORDERS • OPERATING HOURS: {restaurant.openTime || '15:00'} – {restaurant.closeTime || '23:00'}
            </span>
          </div>
        </div>
      )}

      {/* ── Conditional Hero Section & Overview Bar (controlled by showBanner) ── */}
      {showBanner && (
        <>
          {/* Hero Section */}
          <section className="relative bg-gradient-to-br from-white via-brand-light to-primary/5 pt-12 pb-16 md:py-20 overflow-hidden border-b border-slate-100 animate-fade-in">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Text & Branding */}
              <div className="lg:col-span-7 space-y-6 md:space-y-8 text-center lg:text-left z-10">
                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-primary/10 text-primary text-xs md:text-sm font-bold rounded-full">
                  <Sparkles className="w-4 h-4 fill-primary" />
                  <span>EXPERIENCE CULINARY EXCELLENCE</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">
                  Where every flavor <br />
                  <span className="text-primary">tells a story.</span>
                </h1>
                
                <p className="text-base sm:text-lg md:text-xl text-slate-500 max-w-xl mx-auto lg:mx-0 font-medium">
                  Welcome to <span className="font-extrabold text-slate-800">{restaurant.name}</span>. Indulge in our artisan chef creations prepared fresh and delivered directly to your doorstep.
                </p>

                {/* Quick Features Row */}
                <div className="flex flex-wrap justify-center lg:justify-start gap-6 pt-2 text-slate-600 text-xs md:text-sm font-semibold">
                  <div className="flex items-center space-x-1.5">
                    <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span>Super Fast Delivery</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                    <span>100% Hygienic Kitchen</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <TrendingUp className="w-4 h-4 text-primary fill-primary/20" />
                    <span>Premium Quality Ingredients</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Premium Banner Image */}
              <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
                <div className="absolute -top-6 -left-6 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
                
                <div className="relative w-full max-w-md aspect-square bg-slate-100 rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white transform rotate-1 hover:rotate-0 transition-transform duration-500">
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent"></div>
                  
                  {/* Overlaid rating badge */}
                  <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl flex items-center space-x-3 border border-white/20">
                    <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                      <Star className="w-6 h-6 fill-amber-400 stroke-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{restaurant.rating} / 5.0</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Top Rated Dining</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* Restaurant Overview Bar */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-primary/5 rounded-2xl text-primary hidden sm:block">
                  <Info className="w-6 h-6" />
                </div>
                <div className="space-y-1 text-center sm:text-left">
                  <h3 className="text-lg font-black text-slate-800">{restaurant.name} Store Info</h3>
                  <p className="text-sm text-slate-400 font-semibold flex items-center justify-center sm:justify-start gap-1">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{restaurant.address}</span>
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 justify-center">
                {/* Rating */}
                <div className="text-center px-6 py-2 border-r border-slate-100 last:border-0">
                  <div className="flex items-center justify-center space-x-1 font-black text-slate-800 text-lg">
                    <Star className="w-5 h-5 fill-amber-400 stroke-amber-400" />
                    <span>{restaurant.rating}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Avg Rating</span>
                </div>

                {/* Delivery Time */}
                <div className="text-center px-6 py-2 border-r border-slate-100 last:border-0">
                  <div className="flex items-center justify-center space-x-1 font-black text-slate-800 text-lg">
                    <Clock className="w-5 h-5 text-primary" />
                    <span>{restaurant.deliveryTime} mins</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Delivery Time</span>
                </div>

                {/* Price Level */}
                <div className="text-center px-6 py-2 last:border-0">
                  <div className="font-black text-slate-800 text-lg">
                    {restaurant.priceRange}
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pricing Tier</span>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Menu & Ordering Section — 3-column layout */}
      <section className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 ${!showBanner ? 'pt-6' : ''}`}>

        {/* Search + Filter Controls Bar */}
        <div className="sticky top-20 bg-brand-light/95 backdrop-blur-md z-30 py-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-0.5">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Explore Our Menu</h2>
            <p className="text-sm text-slate-400 font-medium">Artisanal cuisine freshly prepared by our finest chefs</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-grow md:max-w-xs">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search dishes..."
                className="w-full pl-10 pr-4 py-2 border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white rounded-xl text-sm font-semibold text-slate-700 outline-hidden focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            {/* Veg / Non-Veg Toggles */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
              <button onClick={() => setFoodType('all')} className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${foodType === 'all' ? 'bg-white text-slate-950 shadow-xs' : 'hover:text-slate-900'}`}>All</button>
              <button onClick={() => setFoodType('veg')} className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${foodType === 'veg' ? 'bg-white text-emerald-600 shadow-xs' : 'hover:text-emerald-600'}`}>Veg</button>
              <button onClick={() => setFoodType('non-veg')} className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${foodType === 'non-veg' ? 'bg-white text-red-600 shadow-xs' : 'hover:text-red-600'}`}>Non-Veg</button>
            </div>
          </div>
        </div>

        {/* ── 3-Column Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">

          {/* ── LEFT: Category Sidebar ── */}
          <aside className="lg:col-span-2 lg:sticky lg:top-44 self-start">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-3 mb-3">Categories</h3>
            <div className="flex lg:flex-col overflow-x-auto gap-1.5 py-1 pr-1 border-b lg:border-b-0 border-slate-100">
              {menuCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3 py-2 flex items-center text-left text-sm font-bold rounded-xl whitespace-nowrap transition-all duration-200 cursor-pointer w-full ${
                    selectedCategory === cat.name
                      ? 'bg-primary text-white shadow-sm shadow-primary/20 scale-102'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </aside>

          {/* ── CENTER: Recommendations / Food Grid ── */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {selectedCategory === 'All' ? 'Our Recommendation' : selectedCategory}
                </h3>
                <span className="text-xs text-slate-400 font-bold">{displayedFoods.length} items available</span>
              </div>
            </div>

            {displayedFoods.length === 0 ? (
              <div className="text-center py-16 text-slate-400 font-medium bg-white rounded-2xl border border-slate-100">
                🍽️ No menu items match your selection.
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {displayedFoods.map((food, idx) => (
                  <FoodCard
                    key={food.id}
                    food={food}
                    restaurantId={restaurant.id}
                    restaurantName={restaurant.name}
                    isOpen={restaurant.isOpen !== false}
                    onImageClick={() => setPreviewIndex(idx)}
                    onConflict={() => {}}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Inline Cart Panel ── */}
          <aside className="lg:col-span-3 lg:sticky lg:top-44 self-start">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Cart Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/60">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Your Cart</h3>
                </div>
                {items.length > 0 && (
                  <span className="text-xs font-bold text-white bg-primary px-2 py-0.5 rounded-full">
                    {items.reduce((acc, i) => acc + i.quantity, 0)}
                  </span>
                )}
              </div>

              {items.length === 0 ? (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-10 px-5 text-center space-y-3">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                    <ShoppingCart className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-400 font-semibold">Your cart is empty</p>
                  <p className="text-xs text-slate-300 font-medium">Add items from the menu to get started!</p>
                </div>
              ) : (
                <>
                  {/* Cart Items */}
                  <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.food.id} className="flex items-center gap-3 px-4 py-3">
                        <img src={item.food.image} alt={item.food.name} className="w-11 h-11 rounded-lg object-cover bg-slate-50 flex-shrink-0" />
                        <div className="flex-grow min-w-0">
                          <p className="text-xs font-bold text-slate-800 break-words leading-tight">{item.food.name}</p>
                          <p className="text-xs text-slate-400 font-semibold">₹{item.food.price}</p>
                        </div>
                        <div className="flex items-center bg-slate-50 border border-slate-200/60 rounded-lg text-xs font-bold h-7 flex-shrink-0">
                          <button onClick={() => decreaseQuantity(item.food.id)} className="w-6 h-full flex items-center justify-center hover:bg-slate-100 rounded-l-lg cursor-pointer" aria-label="Decrease">
                            <Minus className="w-2.5 h-2.5 text-slate-600" />
                          </button>
                          <span className="px-1.5 text-slate-800">{item.quantity}</span>
                          <button onClick={() => increaseQuantity(item.food.id)} className="w-6 h-full flex items-center justify-center hover:bg-slate-100 rounded-r-lg cursor-pointer" aria-label="Increase">
                            <Plus className="w-2.5 h-2.5 text-slate-600" />
                          </button>
                        </div>
                        <button onClick={() => removeItem(item.food.id)} className="text-slate-300 hover:text-red-500 transition-colors cursor-pointer flex-shrink-0" aria-label="Remove">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Bill Summary */}
                  <div className="px-5 py-4 border-t border-slate-100 space-y-2 bg-slate-50/40">
                    <div className="flex justify-between text-xs text-slate-500 font-semibold">
                      <span>Subtotal</span><span className="text-slate-700">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 font-semibold">
                      <span>Delivery</span><span className="text-slate-700">₹{deliveryFee}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-500 font-semibold">
                      <span>Taxes</span><span className="text-slate-700">₹{tax}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-black text-slate-800 pb-2">
                      <span>Total</span><span className="text-primary">₹{total}</span>
                    </div>

                    {/* Proceed to Checkout Button */}
                    <div className="pt-2 space-y-2">
                      {restaurant.isOpen === false ? (
                        <div className="w-full py-3 bg-slate-200 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-wider text-center cursor-not-allowed">
                          🔴 Store Closed (Opens at {restaurant.openTime || '15:00'})
                        </div>
                      ) : (
                        <Link
                          to="/checkout"
                          className="w-full py-3 bg-primary hover:bg-primary-hover text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all duration-200 cursor-pointer flex items-center justify-center space-x-2"
                        >
                          <span>Proceed to Checkout</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}

                      <Link
                        to="/cart"
                        className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs text-center block transition-colors"
                      >
                        View Full Cart
                      </Link>
                    </div>
                  </div>


                </>
              )}
            </div>
          </aside>

        </div>
      </section>

      {/* Image Lightbox Modal with Next / Previous Controls */}
      <ImageLightboxModal
        foods={displayedFoods}
        currentIndex={previewIndex ?? 0}
        isOpen={previewIndex !== null}
        isStoreOpen={restaurant.isOpen !== false}
        restaurantId={restaurant.id}
        restaurantName={restaurant.name}
        onClose={() => setPreviewIndex(null)}
        onIndexChange={(newIndex) => setPreviewIndex(newIndex)}
      />

    </div>
  );
};
