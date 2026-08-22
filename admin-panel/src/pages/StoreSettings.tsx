import React, { useEffect, useRef, useState } from 'react';
import { apiService, api, API_BASE_URL } from '../services/api';
import type { Restaurant } from '../services/api';
import { Save, Store, Eye, Clock, MapPin, Upload, Image } from 'lucide-react';

export const StoreSettings: React.FC = () => {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [address, setAddress] = useState('');
  const [deliveryTime, setDeliveryTime] = useState(25);
  const [priceRange, setPriceRange] = useState('');
  const [rating, setRating] = useState(4.8);
  const [cuisines, setCuisines] = useState('');

  // ON / OFF Toggle states
  const [showBanner, setShowBanner] = useState(true);

  // Store Operating Hours & Timings state
  const [openTime, setOpenTime] = useState('15:00');
  const [closeTime, setCloseTime] = useState('23:00');
  const [autoSchedule, setAutoSchedule] = useState(true);
  const [manualIsOpen, setManualIsOpen] = useState(true);

  useEffect(() => {
    const fetchStoreDetails = async () => {
      try {
        setLoading(true);
        const data = await apiService.getRestaurants();
        if (data.length > 0) {
          const store = data[0];
          setRestaurant(store);
          setName(store.name);
          setImage(store.image);
          setImagePreview(store.image);
          setAddress(store.address);
          setDeliveryTime(store.deliveryTime);
          setPriceRange(store.priceRange);
          setRating(store.rating);
          setCuisines(store.cuisines.join(', '));
          setShowBanner(store.showBanner !== undefined ? store.showBanner : true);
          setOpenTime(store.openTime || '15:00');
          setCloseTime(store.closeTime || '23:00');
          setAutoSchedule(store.autoSchedule !== undefined ? store.autoSchedule : true);
          setManualIsOpen(store.manualIsOpen !== undefined ? store.manualIsOpen : (store.isOpen !== undefined ? store.isOpen : true));
        }
      } catch (err) {
        console.error('Failed to load store settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStoreDetails();
  }, []);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file);
    setImagePreview(localPreview);

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post<{ url: string }>('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const serverUrl = `${API_BASE_URL}${response.data.url}`;
      setImage(serverUrl);
    } catch (err) {
      console.error('Failed to upload banner:', err);
      alert('Image upload failed. Please enter a URL instead.');
      setImagePreview(image);
    } finally {
      setUploading(false);
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setImage(val);
    setImagePreview(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant) return;

    try {
      setSaving(true);
      setMessage(null);

      const updatedCuisines = cuisines
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c.length > 0);

      const updated = await apiService.updateRestaurant(restaurant.id, {
        ...restaurant,
        name,
        image,
        address,
        deliveryTime,
        priceRange,
        rating,
        cuisines: updatedCuisines,
        showBanner,
        openTime,
        closeTime,
        autoSchedule,
        isOpen: manualIsOpen,
      });

      setRestaurant(updated);
      setMessage({ type: 'success', text: 'Store configurations and operating schedule updated successfully! Changes reflect on the live website immediately.' });
    } catch (err) {
      console.error('Failed to save store settings:', err);
      setMessage({ type: 'error', text: 'Failed to update store configurations. Please check details and try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[50vh] gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="text-slate-400 text-sm font-semibold">Loading store settings...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="text-center py-20 text-slate-400 font-medium bg-white rounded-3xl border border-slate-100 shadow-sm">
        ⚠️ No restaurant profile found in database. Seeding must be incomplete.
      </div>
    );
  }

  // Determine preview URL - if it's a relative path like /hero.png, point to customer-web port
  const getPreviewUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('/') && !url.startsWith('//')) {
      return `http://localhost:5173${url}`;
    }
    return url;
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <Store className="w-8 h-8 text-indigo-600" />
          <span>Store Customization & Timings</span>
        </h1>
        <p className="text-slate-500 font-medium">Configure store operating hours, offline schedule, and storefront branding</p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl text-sm font-semibold border ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
              : 'bg-rose-50 text-rose-800 border-rose-100'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Form Inputs (Left side) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* SINGLE MASTER STORE CUSTOMIZATION ON / OFF BUTTON */}
          <div className={`p-6 rounded-3xl border shadow-sm transition-all ${
            showBanner ? 'bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/40 border-indigo-200' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black ${
                    showBanner ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-slate-200 text-slate-500'
                  }`}>
                    <Store className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-800">
                      Store Customization / Hero Landing
                    </h2>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      showBanner ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {showBanner ? '🟢 FULL STORE CUSTOMIZATION ACTIVE' : '⚪ DIRECT MENU CATEGORIES MODE'}
                    </span>
                  </div>
                </div>
                <p className="text-xs font-semibold text-slate-500 pt-1">
                  {showBanner
                    ? 'Storefront shows rich hero landing banner, restaurant branding story, and overview.'
                    : 'Hero banner is hidden. Customers directly see menu categories and food dishes upon visiting.'}
                </p>
              </div>

              {/* Single ON / OFF Switch Button */}
              <button
                type="button"
                onClick={() => setShowBanner(!showBanner)}
                className={`relative inline-flex h-9 w-20 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden self-start sm:self-auto shadow-inner ${
                  showBanner ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-8 w-8 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out text-xs font-black leading-8 text-center ${
                    showBanner ? 'translate-x-11 text-indigo-600' : 'translate-x-0 text-slate-400'
                  }`}
                >
                  {showBanner ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>
          </div>

          {/* STORE OPERATING HOURS & TIMING CONTROLLER */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-800">Operating Hours & Offline Control</h2>
              </div>
              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                restaurant.isOpen ? 'text-emerald-700 bg-emerald-100' : 'text-rose-700 bg-rose-100'
              }`}>
                {restaurant.isOpen ? '🟢 STORE IS ONLINE' : '🔴 STORE IS OFFLINE'}
              </span>
            </div>

            {/* Timings Input Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <span>Daily Opening Time</span>
                </label>
                <input
                  type="time"
                  required
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 focus:bg-white rounded-xl text-sm font-black text-slate-800 outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
                />
                <span className="text-[10px] text-slate-400 font-semibold block">Daily Start Time (e.g. 15:00 for 3:00 PM)</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <span>Daily Closing Time</span>
                </label>
                <input
                  type="time"
                  required
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 focus:bg-white rounded-xl text-sm font-black text-slate-800 outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
                />
                <span className="text-[10px] text-slate-400 font-semibold block">Daily End Time (e.g. 23:00 for 11:00 PM)</span>
              </div>
            </div>

            {/* Schedule Mode Selector */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                    Automated Schedule Mode
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Automatically opens store at {openTime} and switches offline at {closeTime} daily.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoSchedule(!autoSchedule)}
                  className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    autoSchedule ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                      autoSchedule ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Manual Override Option when Auto Schedule is off */}
              {!autoSchedule && (
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Manual Store Status:</span>
                  <button
                    type="button"
                    onClick={() => setManualIsOpen(!manualIsOpen)}
                    className={`px-3 py-1 rounded-xl text-xs font-black cursor-pointer transition-all ${
                      manualIsOpen
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-rose-600 text-white shadow-xs'
                    }`}
                  >
                    {manualIsOpen ? 'Force Store OPEN 🟢' : 'Force Store CLOSED 🔴'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-50 pb-3">Branding & Logistics</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Restaurant Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Gourmet Bistro"
                  className="w-full px-4 py-2 border border-slate-200 focus:bg-white rounded-xl text-sm font-semibold outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Store Rating</label>
                <input
                  type="number"
                  step="0.1"
                  min="1.0"
                  max="5.0"
                  required
                  value={rating}
                  onChange={(e) => setRating(parseFloat(e.target.value))}
                  placeholder="4.8"
                  className="w-full px-4 py-2 border border-slate-200 focus:bg-white rounded-xl text-sm font-semibold outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Avg Delivery Time (mins)</label>
                <input
                  type="number"
                  required
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(parseInt(e.target.value))}
                  placeholder="25"
                  className="w-full px-4 py-2 border border-slate-200 focus:bg-white rounded-xl text-sm font-semibold outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Price Range / Cost Description</label>
                <input
                  type="text"
                  required
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  placeholder="e.g. ₹250 for two"
                  className="w-full px-4 py-2 border border-slate-200 focus:bg-white rounded-xl text-sm font-semibold outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Address Details</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="101, Bistro Lane, Sector 5..."
                className="w-full px-4 py-2 border border-slate-200 focus:bg-white rounded-xl text-sm font-semibold outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Cuisines (Comma Separated)</label>
              <input
                type="text"
                required
                value={cuisines}
                onChange={(e) => setCuisines(e.target.value)}
                placeholder="e.g. Chinese, Indian, Italian, Desserts"
                className="w-full px-4 py-2 border border-slate-200 focus:bg-white rounded-xl text-sm font-semibold outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
              />
            </div>
          </div>

          {/* Banner Image Section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-50 pb-3">Banner & Theme</h2>
            
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Store Banner Image</label>

              {/* Banner Preview */}
              {imagePreview ? (
                <div className="relative h-32 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200">
                  <img
                    src={getPreviewUrl(imagePreview)}
                    alt="Banner Preview"
                    className="w-full h-full object-cover opacity-80"
                    onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                  <div className="absolute bottom-3 left-4 text-white">
                    <span className="text-xs font-bold bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-md">Current Banner</span>
                  </div>
                </div>
              ) : (
                <div className="h-32 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-300 gap-2">
                  <Image className="w-8 h-8" />
                  <span className="text-xs font-semibold">No banner image set</span>
                </div>
              )}

              {/* Upload Local File */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBannerUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center space-x-2 px-4 py-2.5 border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 rounded-xl text-sm font-bold text-slate-600 hover:text-indigo-700 transition-colors cursor-pointer disabled:opacity-60 w-full justify-center"
              >
                <Upload className="w-4 h-4" />
                <span>{uploading ? 'Uploading image...' : 'Upload Local Banner Image'}</span>
              </button>

              {/* OR divider */}
              <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
                <div className="flex-1 h-px bg-slate-100" />
                <span>OR enter URL</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              <input
                type="text"
                value={image}
                onChange={handleImageUrlChange}
                placeholder="https://images.unsplash.com/... or /hero.png"
                className="w-full px-4 py-2 border border-slate-200 focus:bg-white rounded-xl text-sm font-semibold outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={saving || uploading}
              className="flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-150 cursor-pointer"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Saving Config...' : 'Apply Changes'}</span>
            </button>
          </div>
        </div>

        {/* Live Preview (Right side) */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden sticky top-6">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-slate-500" />
                <h3 className="font-extrabold text-slate-800 text-sm">Storefront Preview</h3>
              </div>
              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                showBanner ? 'text-indigo-700 bg-indigo-100' : 'text-amber-700 bg-amber-100'
              }`}>
                {showBanner ? '🟢 HERO CUSTOMIZATION' : '⚡ DIRECT MENU'}
              </span>
            </div>

            {showBanner ? (
              <>
                {/* Simulated Live View Header */}
                <div className="relative h-44 w-full bg-slate-900">
                  {imagePreview ? (
                    <img
                      src={getPreviewUrl(imagePreview)}
                      alt="Preview Banner"
                      className="w-full h-full object-cover opacity-80"
                      onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">No image provided</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h4 className="text-xl font-black tracking-tight">{name || 'Restaurant Name'}</h4>
                    <div className="flex items-center text-[10px] space-x-1 text-slate-200 mt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="truncate max-w-[200px]">{address || 'Address not set'}</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Live Info Widget */}
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-center space-x-0.5 text-slate-800 font-extrabold text-sm">
                        <span className="text-amber-500">★</span>
                        <span>{rating || '4.8'}</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">Rating</span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-center space-x-0.5 text-slate-800 font-extrabold text-sm">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{deliveryTime || '25'}m</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">Delivery</span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-center space-x-0.5 text-slate-800 font-extrabold text-sm">
                        <span>{priceRange || '₹250'}</span>
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">Cost</span>
                    </div>
                  </div>

                  {/* Cuisines tag line */}
                  {cuisines && (
                    <div className="border-t border-slate-100 pt-3">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Cuisines Offered</span>
                      <div className="flex flex-wrap gap-1">
                        {cuisines.split(',').map((c, i) => (
                          <span key={i} className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md">
                            {c.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Direct Menu Preview (Hero & story bypassed) */
              <div className="p-4 space-y-4">
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/60 text-amber-800 text-xs font-semibold">
                  ⚡ <strong>Direct Menu Mode:</strong> Landing page skips banner and directly presents menu categories.
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Category Tabs Preview</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['All Dishes', 'Burgers', 'Pizza', 'Main Course', 'Desserts'].map((cat, i) => (
                      <span key={i} className={`px-2.5 py-1 rounded-xl text-[11px] font-bold ${
                        i === 0 ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Top Menu Items</span>
                  <div className="space-y-2">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>🍔 Classic Cheeseburger</span>
                      <span className="text-emerald-600">₹149</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>🍕 Margherita Pizza</span>
                      <span className="text-emerald-600">₹299</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </form>
    </div>
  );
};
