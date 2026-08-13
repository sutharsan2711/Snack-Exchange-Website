import React, { useEffect, useRef, useState } from 'react';
import { api, apiService } from '../services/api';
import type { FoodItem, Category } from '../services/api';
import {
  Plus, Edit2, Trash2, X, Search, Upload, Image,
  Star, ChefHat, Tag, ToggleLeft, ToggleRight,
} from 'lucide-react';

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  image: '',
  rating: '4.5',
  category: '',
  isVeg: true,
};

export const MenuManager: React.FC = () => {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [foodType, setFoodType] = useState<'all' | 'veg' | 'non-veg'>('all');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true);
      const [foodData, catData] = await Promise.all([
        apiService.getFoods(),
        apiService.getCategories(),
      ]);
      setFoods(foodData);
      setCategories(catData);
    } catch (err) {
      console.error('Failed to load menu items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ── Filters ──────────────────────────────────────────────────────────────
  const displayed = foods.filter((f) => {
    const matchesCat = filterCat === 'All' || f.category === filterCat;
    const q = searchQuery.toLowerCase();
    const matchesQ =
      f.name.toLowerCase().includes(q) ||
      f.description.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q);
    const matchesType =
      foodType === 'all' ||
      (foodType === 'veg' && f.isVeg) ||
      (foodType === 'non-veg' && !f.isVeg);

    return matchesCat && matchesQ && matchesType;
  });

  // ── Modal helpers ────────────────────────────────────────────────────────
  const openAddModal = () => {
    setEditingFood(null);
    setForm({ ...EMPTY_FORM, category: categories[0]?.name ?? '' });
    setImagePreview('');
    setShowModal(true);
  };

  const openEditModal = (food: FoodItem) => {
    setEditingFood(food);
    setForm({
      name: food.name,
      description: food.description,
      price: String(food.price),
      image: food.image,
      rating: String(food.rating),
      category: food.category,
      isVeg: food.isVeg,
    });
    setImagePreview(food.image);
    setShowModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const localPreview = URL.createObjectURL(file);
    setImagePreview(localPreview);
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post<{ url: string }>('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const serverUrl = `http://localhost:8085/api${res.data.url}`;
      setForm((f) => ({ ...f, image: serverUrl }));
    } catch {
      alert('Image upload failed. Please try a URL instead.');
      setImagePreview(form.image);
    } finally {
      setUploading(false);
    }
  };

  const handleImageUrlChange = (val: string) => {
    setForm((f) => ({ ...f, image: val }));
    setImagePreview(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.category) return;
    try {
      setSaving(true);
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price) || 0,
        image: form.image.trim(),
        rating: parseFloat(form.rating) || 4.5,
        category: form.category,
        isVeg: form.isVeg,
      };
      if (editingFood) {
        const res = await api.put<FoodItem>(`/foods/${editingFood.id}`, payload);
        setFoods((prev) => prev.map((f) => (f.id === editingFood.id ? res.data : f)));
      } else {
        const res = await api.post<FoodItem>('/foods', payload);
        setFoods((prev) => [...prev, res.data]);
      }
      setShowModal(false);
    } catch (err) {
      console.error('Failed to save food item:', err);
      alert('Save failed. Check all fields and try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (food: FoodItem) => {
    if (!window.confirm(`Delete "${food.name}" from the menu?`)) return;
    try {
      await api.delete(`/foods/${food.id}`);
      setFoods((prev) => prev.filter((f) => f.id !== food.id));
    } catch (err) {
      console.error('Failed to delete food item:', err);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] overflow-hidden space-y-4">

      {/* Static Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <ChefHat className="w-8 h-8 text-indigo-600" />
            Menu Manager
          </h1>
          <p className="text-slate-500 font-medium">
            Add, edit, or remove food items — changes reflect live on the customer menu
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center justify-center space-x-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-150 cursor-pointer self-start sm:self-center"
        >
          <Plus className="w-5 h-5" />
          <span>Add Menu Item</span>
        </button>
      </div>

      {/* Static Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3 flex-shrink-0">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search */}
          <div className="relative flex-grow max-w-sm w-full">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, description, category..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white rounded-xl text-sm font-semibold outline-hidden focus:border-indigo-600 transition-colors"
            />
          </div>

          {/* All / Veg / Non-Veg Toggle */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={() => setFoodType('all')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  foodType === 'all' ? 'bg-white text-slate-900 shadow-xs font-black' : 'hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFoodType('veg')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                  foodType === 'veg' ? 'bg-emerald-500 text-white shadow-xs font-black' : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${foodType === 'veg' ? 'bg-white' : 'bg-emerald-500'}`} />
                Veg
              </button>
              <button
                type="button"
                onClick={() => setFoodType('non-veg')}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 ${
                  foodType === 'non-veg' ? 'bg-red-500 text-white shadow-xs font-black' : 'text-red-700 hover:bg-red-50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${foodType === 'non-veg' ? 'bg-white' : 'bg-red-500'}`} />
                Non-Veg
              </button>
            </div>

            <span className="text-xs text-slate-400 font-bold whitespace-nowrap">
              {displayed.length} item{displayed.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
          {['All', ...categories.map((c) => c.name)].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                filterCat === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Table Area */}
      {loading ? (
        <div className="flex justify-center items-center h-[30vh] flex-shrink-0">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : displayed.length === 0 ? (
        <div className="text-center py-20 text-slate-400 font-medium bg-white rounded-3xl border border-slate-100 flex-shrink-0">
          No menu items found matching your filters.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-y-auto flex-1 min-h-0 relative">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10">
              <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Rating</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
              {displayed.map((food) => (
                <tr key={food.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={food.image}
                        alt={food.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-xs flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80';
                        }}
                      />
                      <div>
                        <p className="font-extrabold text-slate-800 leading-tight">{food.name}</p>
                        <p className="text-xs text-slate-400 font-medium line-clamp-1 max-w-xs mt-0.5">
                          {food.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg">
                      <Tag className="w-3 h-3" />
                      {food.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-amber-500 font-bold text-sm">
                      <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                      {food.rating.toFixed(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-extrabold text-slate-800">
                    &#8377;{food.price}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg ${
                        food.isVeg ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${food.isVeg ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      {food.isVeg ? 'Veg' : 'Non-Veg'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(food)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Item"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(food)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">

            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 flex-shrink-0">
              <div className="flex items-center space-x-2">
                <ChefHat className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-800 text-lg">
                  {editingFood ? 'Edit Menu Item' : 'Add Menu Item'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">

              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Item Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Chicken Burger"
                  className="w-full px-4 py-2 border border-slate-200 focus:bg-white rounded-xl text-sm font-semibold outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Describe the dish — ingredients, preparation, taste..."
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-200 focus:bg-white rounded-xl text-sm font-semibold outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors resize-none"
                />
              </div>

              {/* Category + Price + Rating */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 focus:bg-white rounded-xl text-sm font-semibold outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors bg-white"
                  >
                    <option value="">Select...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Price (&#8377;) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.5"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    placeholder="149"
                    className="w-full px-3 py-2 border border-slate-200 focus:bg-white rounded-xl text-sm font-semibold outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-400" /> Rating
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={form.rating}
                    onChange={(e) => setForm((f) => ({ ...f, rating: e.target.value }))}
                    placeholder="4.5"
                    className="w-full px-3 py-2 border border-slate-200 focus:bg-white rounded-xl text-sm font-semibold outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
                  />
                </div>
              </div>

              {/* Veg Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div>
                  <p className="text-sm font-bold text-slate-700">Food Type</p>
                  <p className="text-xs text-slate-400">Mark as vegetarian or non-vegetarian</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, isVeg: !f.isVeg }))}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  {form.isVeg ? (
                    <>
                      <ToggleRight className="w-8 h-8 text-emerald-500" />
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Veg</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-8 h-8 text-slate-400" />
                      <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">Non-Veg</span>
                    </>
                  )}
                </button>
              </div>

              {/* Image */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Item Image</label>
                {imagePreview ? (
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-50">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-slate-300">
                    <Image className="w-7 h-7" />
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                  className="flex items-center space-x-2 px-4 py-2 border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 rounded-xl text-sm font-bold text-slate-600 hover:text-indigo-700 transition-colors cursor-pointer disabled:opacity-60">
                  <Upload className="w-4 h-4" />
                  <span>{uploading ? 'Uploading...' : 'Upload Image'}</span>
                </button>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
                  <div className="flex-1 h-px bg-slate-100" />
                  <span>OR enter URL</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>
                <input type="text" value={form.image}
                  onChange={(e) => handleImageUrlChange(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-4 py-2 border border-slate-200 focus:bg-white rounded-xl text-sm font-semibold outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors" />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-600 cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={saving || uploading}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-extrabold shadow-md hover:shadow cursor-pointer disabled:opacity-60">
                  {saving ? 'Saving...' : editingFood ? 'Save Changes' : 'Add to Menu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
