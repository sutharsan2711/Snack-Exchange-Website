import React, { useEffect, useRef, useState } from 'react';
import { apiService, api } from '../services/api';
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
      const serverUrl = `http://localhost:8085/api${response.data.url}`;
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
      });

      setRestaurant(updated);
      setMessage({ type: 'success', text: 'Store configurations updated successfully! Changes will reflect on the live website immediately.' });
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
          <span>Store Customization</span>
        </h1>
        <p className="text-slate-500 font-medium">Fully customize the customer storefront design, branding, and details</p>
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
              <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider">Live</span>
            </div>

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

          </div>
        </div>

      </form>
    </div>
  );
};
