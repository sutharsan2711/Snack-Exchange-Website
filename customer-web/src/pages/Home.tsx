import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiService } from '../services/api';
import type { Category } from '../services/api';
import type { Restaurant } from '../types/restaurant';
import type { FoodItem } from '../types/food';
import { FoodCard } from '../components/FoodCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Star, Clock, MapPin, Flame, ShieldCheck, Sparkles, TrendingUp, Search, Info } from 'lucide-react';

export const Home: React.FC = () => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  
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
          
          // Get all menu items for this restaurant
          const foodItems = await apiService.getFoodsByRestaurantId(singleRest.id);
          setFoods(foodItems);
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
    const matchesCategory = selectedCategory === 'All' || food.category === selectedCategory;
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          food.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = foodType === 'all' || 
                        (foodType === 'veg' && food.isVeg) || 
                        (foodType === 'non-veg' && !food.isVeg);
    return matchesCategory && matchesSearch && matchesType;
  });

  return (
    <div className="space-y-12 pb-20">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-white via-brand-light to-primary/5 pt-12 pb-16 md:py-20 overflow-hidden border-b border-slate-100">
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

      {/* Menu & Ordering Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header and Live Search Controls */}
        <div className="sticky top-20 bg-brand-light/95 backdrop-blur-md z-30 py-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
              Explore Our Menu
            </h2>
            <p className="text-sm text-slate-400 font-medium">Artisanal cuisine freshly prepared by our finest chefs</p>
          </div>
          
          {/* Filters Row */}
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
              <button
                onClick={() => setFoodType('all')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  foodType === 'all' ? 'bg-white text-slate-950 shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFoodType('veg')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  foodType === 'veg' ? 'bg-white text-emerald-600 shadow-xs' : 'hover:text-emerald-600'
                }`}
              >
                Veg
              </button>
              <button
                onClick={() => setFoodType('non-veg')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  foodType === 'non-veg' ? 'bg-white text-red-600 shadow-xs' : 'hover:text-red-600'
                }`}
              >
                Non-Veg
              </button>
            </div>
          </div>
        </div>

        {/* Menu layout: Sidebar + Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Categories Sidebar */}
          <div className="md:col-span-3 space-y-2 md:sticky md:top-44 self-start">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-3 mb-3">Menu Categories</h3>
            <div className="flex md:flex-col overflow-x-auto gap-1.5 py-1 pr-1 border-b md:border-b-0 border-slate-100">
              {menuCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3 py-2 flex items-center space-x-2.5 text-left text-sm font-bold rounded-xl whitespace-nowrap transition-all duration-200 cursor-pointer w-full ${
                    selectedCategory === cat.name
                      ? 'bg-primary text-white shadow-sm shadow-primary/20 scale-102'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {cat.id !== 'all' && cat.image && (
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-5 h-5 rounded-full object-cover border border-slate-100/50"
                    />
                  )}
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dishes Grid */}
          <div className="md:col-span-9 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">
                {selectedCategory === 'All' ? 'Our Recommendation' : selectedCategory}
              </h3>
              <span className="text-xs text-slate-400 font-bold">{displayedFoods.length} items available</span>
            </div>

            {displayedFoods.length === 0 ? (
              <div className="text-center py-16 text-slate-400 font-medium bg-white rounded-2xl border border-slate-100">
                🍽️ No menu items match your selection.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {displayedFoods.map((food) => (
                  <FoodCard
                    key={food.id}
                    food={food}
                    restaurantId={restaurant.id}
                    restaurantName={restaurant.name}
                    onConflict={() => {}}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      </section>

    </div>
  );
};
