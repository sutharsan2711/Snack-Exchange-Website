import React, { useEffect, useRef, useState } from 'react';
import { api, apiService, API_BASE_URL } from '../services/api';
import type { FoodItem, Category } from '../services/api';
import {
  Plus, Edit2, Trash2, X, Search, Upload, Image,
  ChefHat, Tag, ToggleLeft, ToggleRight,
  ChevronDown, ChevronUp, MoreVertical, FolderPlus, AlertTriangle, ArrowLeft,
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
  const [returnToCatModal, setReturnToCatModal] = useState<Category | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Layout mode state
  const [layoutMode, setLayoutMode] = useState<'list' | 'windows'>('windows');

  // Category Modal form states
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [catToDelete, setCatToDelete] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catImage, setCatImage] = useState('');
  const [catImagePreview, setCatImagePreview] = useState('');
  const [catUploading, setCatUploading] = useState(false);
  const [catDeleting, setCatDeleting] = useState(false);
  const catFileInputRef = useRef<HTMLInputElement>(null);

  // Category modal handlers
  const openAddCatModal = () => {
    setEditingCat(null);
    setCatName('');
    setCatImage('');
    setCatImagePreview('');
    setShowCatModal(true);
  };

  const openEditCatModal = (cat: Category) => {
    setEditingCat(cat);
    setCatName(cat.name);
    setCatImage(cat.image);
    setCatImagePreview(cat.image);
    setShowCatModal(true);
  };

  const handleCatFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const localPreview = URL.createObjectURL(file);
    setCatImagePreview(localPreview);
    try {
      setCatUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post<{ url: string }>('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const serverUrl = `${API_BASE_URL}${response.data.url}`;
      setCatImage(serverUrl);
    } catch {
      alert('Image upload failed.');
      setCatImagePreview(catImage);
    } finally {
      setCatUploading(false);
    }
  };

  const handleCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

    try {
      if (editingCat) {
        const updated = await apiService.updateCategory(editingCat.id, {
          name: catName.trim(),
          image: catImage.trim(),
        });
        setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
        // Update food items local state matching old category name
        setFoods((prev) =>
          prev.map((f) => (f.category.toLowerCase() === editingCat.name.toLowerCase() ? { ...f, category: updated.name } : f))
        );
      } else {
        const created = await apiService.addCategory({
          name: catName.trim(),
          image: catImage.trim(),
        });
        setCategories((prev) => [...prev, created]);
      }
      setShowCatModal(false);
    } catch (err) {
      console.error('Failed to save category:', err);
      alert('Failed to save category. Please check details.');
    }
  };

  const handleDeleteCategory = (cat: Category) => {
    setCatToDelete(cat);
  };

  const confirmDeleteCategory = async () => {
    if (!catToDelete) return;
    try {
      setCatDeleting(true);
      await apiService.deleteCategory(catToDelete.id);
      // Remove category from state
      setCategories((prev) => prev.filter((c) => c.id !== catToDelete.id));
      // Remove all food items in this category from state
      setFoods((prev) =>
        prev.filter(
          (f) =>
            f.category.toLowerCase() !== catToDelete.name.toLowerCase() &&
            f.category.toLowerCase() !== catToDelete.id.toLowerCase()
        )
      );
      if (filterCat.toLowerCase() === catToDelete.name.toLowerCase() || filterCat.toLowerCase() === catToDelete.id.toLowerCase()) {
        setFilterCat('All');
      }
      setCatToDelete(null);
    } catch (err) {
      console.error('Failed to delete category:', err);
      alert('Failed to delete category and food items.');
    } finally {
      setCatDeleting(false);
    }
  };

  // Mobile accordion state
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  
  // Mobile item active/inactive state (saved to localStorage for persistence)
  const [disabledItems, setDisabledItems] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('admin_disabled_items');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleCatExpanded = (catName: string) => {
    setExpandedCats((prev) => ({
      ...prev,
      [catName]: !prev[catName],
    }));
  };

  const toggleItemActive = (foodId: string) => {
    setDisabledItems((prev) => {
      const updated = { ...prev, [foodId]: !prev[foodId] };
      localStorage.setItem('admin_disabled_items', JSON.stringify(updated));
      return updated;
    });
  };

  // Auto-expand categories on load
  useEffect(() => {
    if (categories.length > 0) {
      const initial: Record<string, boolean> = {};
      categories.forEach(c => {
        initial[c.name] = true;
      });
      setExpandedCats(initial);
    }
  }, [categories]);

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
  const openAddModal = (defaultCategory?: string, returnCat?: Category | null) => {
    setEditingFood(null);
    setReturnToCatModal(returnCat || null);
    setForm({ ...EMPTY_FORM, category: defaultCategory || categories[0]?.name || '' });
    setImagePreview('');
    setShowModal(true);
  };

  const openEditModal = (food: FoodItem, returnCat?: Category | null) => {
    setEditingFood(food);
    setReturnToCatModal(returnCat || null);
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

  const handleFoodModalBack = () => {
    setShowModal(false);
    if (returnToCatModal) {
      openEditCatModal(returnToCatModal);
      setReturnToCatModal(null);
    }
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
      const serverUrl = `${API_BASE_URL}${res.data.url}`;
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
      if (returnToCatModal) {
        openEditCatModal(returnToCatModal);
        setReturnToCatModal(null);
      }
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
  };  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full space-y-4">
      {/* ───────────────── DESKTOP VIEW (md and above) ───────────────── */}
      <div className="hidden md:flex flex-col h-[calc(100vh-8rem)] overflow-hidden space-y-4">
        {/* Static Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-shrink-0">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <ChefHat className="w-8 h-8 text-indigo-600" />
              Menu & Categories
            </h1>
            <p className="text-slate-500 font-medium">
              Manage categories and food items in a single unified workspace
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => openAddCatModal()}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-white hover:bg-slate-50 text-indigo-600 border border-indigo-200 rounded-xl font-bold shadow-xs hover:shadow-sm transition-all duration-150 cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Add Category</span>
            </button>

            <button
              onClick={() => openAddModal()}
              className="flex items-center justify-center space-x-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-150 cursor-pointer"
            >
              <Plus className="w-5 h-5" />
              <span>Add Menu Item</span>
            </button>
          </div>
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

          {/* Category Filter Chips & CRUD Operations */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="flex flex-wrap gap-2">
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

            {/* Edit / Delete active Category inline */}
            {filterCat !== 'All' && (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/60 px-3 py-1 rounded-xl">
                <button
                  onClick={() => setFilterCat('All')}
                  className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 font-bold cursor-pointer transition-all mr-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to All</span>
                </button>
                <span className="text-slate-300">|</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Category Options:</span>
                <button
                  onClick={() => {
                    const selected = categories.find((c) => c.name === filterCat);
                    if (selected) openEditCatModal(selected);
                  }}
                  className="text-xs text-indigo-650 hover:text-indigo-800 font-black cursor-pointer hover:underline transition-all"
                >
                  Edit Name
                </button>
                <span className="text-slate-350">|</span>
                <button
                  onClick={() => {
                    const selected = categories.find((c) => c.name === filterCat);
                    if (selected) handleDeleteCategory(selected);
                  }}
                  className="text-xs text-red-650 hover:text-red-800 font-black cursor-pointer hover:underline transition-all"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Main Area (Table or Windows) */}
        {loading ? (
          <div className="flex justify-center items-center h-[30vh] flex-shrink-0">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-20 text-slate-400 font-medium bg-white rounded-3xl border border-slate-100 flex-shrink-0">
            No items found matching your filters.
          </div>
        ) : layoutMode === 'windows' ? (
          /* WINDOWS VIEW TILE GRID (DESKTOP) */
          <div className="flex-1 overflow-y-auto min-h-0 pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((cat) => {
                const categoryFoods = displayed.filter((f) => f.category.toLowerCase() === cat.name.toLowerCase());
                const vegCount = categoryFoods.filter((f) => f.isVeg).length;
                const nonVegCount = categoryFoods.length - vegCount;

                return (
                  <div
                    key={cat.id}
                    className="bg-indigo-600/5 hover:bg-indigo-600/10 border border-indigo-100 rounded-3xl p-5 shadow-xs flex flex-col justify-between h-80 space-y-4"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 min-w-0">
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-100 shadow-xs flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-slate-800 text-sm leading-tight truncate">{cat.name}</h4>
                            <p className="text-[10px] text-slate-450 font-bold uppercase mt-0.5 whitespace-nowrap">
                              {categoryFoods.length} items • {vegCount} V / {nonVegCount} N
                            </p>
                          </div>
                        </div>

                        {/* Category Action Menu */}
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          <button
                            onClick={() => openEditCatModal(cat)}
                            className="p-1 hover:bg-indigo-650/10 rounded-lg text-indigo-600 transition-colors cursor-pointer"
                            title="Edit Category"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-1 hover:bg-red-50 rounded-lg text-red-655 transition-colors cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Food Grid within this Category Window */}
                      <div className="mt-4 space-y-2 max-h-40 overflow-y-auto pr-1">
                        {categoryFoods.length === 0 ? (
                          <p className="text-[10px] text-slate-400 text-center py-4">No menu items active</p>
                        ) : (
                          categoryFoods.map((food) => (
                            <div
                              key={food.id}
                              className="group flex items-center justify-between bg-white border border-slate-100 p-2 rounded-xl text-xs font-semibold hover:border-indigo-300 shadow-2xs hover:shadow-xs transition-all"
                            >
                              <span
                                onClick={() => openEditModal(food)}
                                className="truncate text-slate-700 max-w-[100px] hover:text-indigo-600 cursor-pointer font-bold"
                                title={`Click to edit "${food.name}"`}
                              >
                                {food.name}
                              </span>
                              <div className="flex items-center space-x-1 flex-shrink-0">
                                <span className="text-indigo-600 font-extrabold text-xs mr-0.5">&#8377;{food.price}</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditModal(food);
                                  }}
                                  className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                  title={`Edit "${food.name}"`}
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(food);
                                  }}
                                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  title={`Delete "${food.name}" from category`}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Bottom actions */}
                    <button
                      onClick={() => {
                        setForm((f) => ({ ...f, category: cat.name }));
                        openAddModal();
                      }}
                      className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer text-center shadow-xs"
                    >
                      + Add Item
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* LIST VIEW TABLE (DESKTOP) */
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-y-auto flex-1 min-h-0 relative">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10">
                <tr className="text-xs font-bold text-slate-505 uppercase tracking-wider">
                  <th className="px-6 py-4">Item</th>
                  <th className="px-6 py-4">Category</th>
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
      </div>

      {/* ───────────────── MOBILE VIEW (below md, matches screenshot) ───────────────── */}
      <div className="block md:hidden space-y-4 pb-20">
        {/* Action buttons row */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={openAddCatModal}
              className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              + Category
            </button>
            <button
              onClick={() => {
                setForm((f) => ({ ...f, category: categories[0]?.name || '' }));
                openAddModal();
              }}
              className="text-[10px] font-black text-orange-600 bg-orange-50 px-2 py-1 rounded-lg hover:bg-orange-100 transition-colors"
            >
              + Create Item
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for items"
            className="w-full pl-4 pr-10 py-3 bg-slate-100 border border-transparent rounded-2xl text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:border-slate-200"
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <Search className="w-4 h-4" />
          </span>
        </div>

        {/* Categories Accordions (List Mode) OR Tile Grid (Windows Mode) */}
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-orange-500" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-100 text-xs font-medium">
            No categories available. Click "+ Category" above to start!
          </div>
        ) : layoutMode === 'windows' ? (
          /* WINDOWS VIEW TILE GRID (MOBILE) */
          <div className="grid grid-cols-2 gap-4">
            {categories.map((cat) => {
              const categoryFoods = displayed.filter((f) => f.category.toLowerCase() === cat.name.toLowerCase());
              return (
                <div
                  key={cat.id}
                  onClick={() => {
                    setFilterCat(cat.name);
                    setLayoutMode('list'); // switch to list view with filter applied to focus
                  }}
                  className="bg-white border border-slate-150 rounded-2xl p-3 flex flex-col justify-between h-36 active:scale-98 transition-all cursor-pointer shadow-3xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-8 h-8 rounded-lg object-cover border border-slate-50 flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80';
                        }}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditCatModal(cat);
                        }}
                        className="p-1 hover:bg-slate-100 rounded text-indigo-600"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-slate-800 text-xs truncate leading-tight">{cat.name}</h4>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">
                        {categoryFoods.length} items
                      </p>
                    </div>
                  </div>
                  <span className="text-[8px] font-black text-indigo-600 uppercase tracking-wider block mt-2 text-right">
                    View list →
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          /* LIST VIEW ACCORDIONS (MOBILE) */
          <div className="space-y-3">
            {categories.map((cat) => {
              const categoryFoods = displayed.filter((f) => f.category.toLowerCase() === cat.name.toLowerCase());
              const isExpanded = !!expandedCats[cat.name];

              return (
                <div key={cat.id} className="bg-white border border-slate-150/70 rounded-2xl overflow-hidden shadow-xs">
                  {/* Category Header */}
                  <div
                    onClick={() => toggleCatExpanded(cat.name)}
                    className="px-4 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/40 select-none"
                  >
                    <h3 className="text-sm font-black text-slate-800 tracking-tight leading-none flex items-center gap-1.5">
                      {cat.name} Live Cooking
                      <span className="text-[10px] text-slate-400 font-bold">
                        ({categoryFoods.length})
                      </span>
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Open options sheet or confirm deletion directly
                          const op = window.confirm(`Category: "${cat.name}"\n-----------------\nOK to EDIT name/image?\nCancel to DELETE category?`);
                          if (op) {
                            openEditCatModal(cat);
                          } else {
                            handleDeleteCategory(cat);
                          }
                        }}
                        className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      <span className="text-slate-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </span>
                    </div>
                  </div>

                  {/* Accordion Content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-slate-50 pt-3 space-y-4 bg-slate-55/10">
                      {/* Add item button */}
                      <button
                        onClick={() => {
                          setForm((f) => ({ ...f, category: cat.name }));
                          openAddModal();
                        }}
                        className="w-full border border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-3 flex items-center justify-center space-x-2 text-slate-500 hover:text-indigo-600 transition-colors text-xs font-bold bg-white cursor-pointer"
                      >
                        <span className="w-5 h-5 bg-slate-100 text-emerald-600 rounded-full flex items-center justify-center font-extrabold text-sm border border-slate-200/50">+</span>
                        <span>Add an item</span>
                      </button>

                      {/* Items list inside accordion */}
                      {categoryFoods.length === 0 ? (
                        <p className="text-[11px] text-slate-400 text-center py-2">
                          No items in this category. Click "Add an item" above!
                        </p>
                      ) : (
                        <div className="divide-y divide-slate-100">
                          {categoryFoods.map((food) => {
                            const isDisabled = !!disabledItems[food.id];
                            return (
                              <div key={food.id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                                <div className="flex items-start space-x-3 min-w-0">
                                  {/* Food Image */}
                                  <img
                                    src={food.image}
                                    alt={food.name}
                                    className={`w-14 h-14 object-cover rounded-xl border border-slate-100 flex-shrink-0 bg-slate-50 ${
                                      isDisabled ? 'grayscale opacity-50' : ''
                                    }`}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src =
                                        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80';
                                    }}
                                  />

                                  {/* Detail Text */}
                                  <div className="min-w-0">
                                    {/* Veg/Non-Veg Badge */}
                                    <div
                                      className={`w-3.5 h-3.5 border flex items-center justify-center rounded-sm leading-none flex-shrink-0 ${
                                        food.isVeg ? 'border-emerald-600' : 'border-red-600'
                                      }`}
                                    >
                                      <div
                                        className={`w-1.5 h-1.5 rounded-full ${
                                          food.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                                        }`}
                                      />
                                    </div>

                                    {/* Food Name & Price */}
                                    <h4 className="text-xs font-black text-slate-800 mt-1 line-clamp-1">
                                      {food.name}, <span className="text-slate-500 font-extrabold">₹{food.price}</span>
                                    </h4>

                                    {/* Action Links */}
                                    <div className="flex items-center space-x-3 mt-1 text-[10px] font-bold text-slate-400">
                                      <button
                                        onClick={() => {
                                          alert(
                                            `Dish Preview:\n-----------------\nName: ${food.name}\nDescription: ${food.description || 'No description'}\nCategory: ${food.category}\nPrice: ₹${food.price}\nType: ${food.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}\nStock: ${isDisabled ? 'Out of Stock' : 'In Stock'}`
                                          );
                                        }}
                                        className="hover:text-slate-650 underline cursor-pointer"
                                      >
                                        Preview
                                      </button>
                                      <button
                                        onClick={() => openEditModal(food)}
                                        className="hover:text-indigo-600 underline cursor-pointer"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => handleDelete(food)}
                                        className="hover:text-red-600 underline cursor-pointer"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* Active Toggle Switch (reflecting status) */}
                                <button
                                  onClick={() => toggleItemActive(food.id)}
                                  className={`w-11 h-6 rounded-full transition-colors duration-200 relative flex-shrink-0 cursor-pointer outline-hidden ${
                                    !isDisabled ? 'bg-emerald-500' : 'bg-slate-200'
                                  }`}
                                  aria-label="Toggle item status"
                                >
                                  <span
                                    className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-200 ${
                                      !isDisabled ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                                  />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Mobile quick category float button */}
        <div className="fixed bottom-20 right-4 z-40">
          <button
            onClick={() => {
              const jumpList = categories.map((c) => c.name).join('\n• ');
              alert(`Select Quick Jump Category:\n---------------------\n• ${jumpList}`);
            }}
            className="w-12 h-12 bg-slate-950 text-white rounded-full flex flex-col items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-transform cursor-pointer outline-hidden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            <span className="text-[7px] font-black tracking-wider mt-0.5 leading-none">MENU</span>
          </button>
        </div>
      </div>

      {/* ───────────────── SHARED ADD / EDIT FOOD MODAL ───────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col animate-scale-up">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-55 flex-shrink-0">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleFoodModalBack}
                  className="p-1.5 hover:bg-slate-200/60 rounded-xl text-slate-600 hover:text-slate-900 transition-colors cursor-pointer mr-1"
                  title="Back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <ChefHat className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-800 text-lg">
                  {editingFood ? 'Edit Menu Item' : 'Add Menu Item'}
                </h3>
              </div>
              <button
                onClick={handleFoodModalBack}
                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                title="Close"
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

              {/* Category + Price */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 focus:bg-white rounded-xl text-sm font-semibold outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors bg-white animate-fade-in"
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
                      <span className="text-xs font-bold text-red-600 bg-red-55 px-2 py-0.5 rounded-md">Non-Veg</span>
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
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                {editingFood ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      handleDelete(editingFood);
                    }}
                    className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Dish</span>
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex items-center space-x-3">
                  <button type="button" onClick={handleFoodModalBack}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-600 cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" disabled={saving || uploading}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-extrabold shadow-md hover:shadow cursor-pointer disabled:opacity-60">
                    {saving ? 'Saving...' : editingFood ? 'Save Changes' : 'Add to Menu'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────── SHARED ADD / EDIT CATEGORY MODAL ───────────────── */}
      {showCatModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 transform animate-scale-up">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCatModal(false)}
                  className="p-1.5 hover:bg-slate-200/60 rounded-xl text-slate-600 hover:text-slate-900 transition-colors cursor-pointer mr-1"
                  title="Back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <FolderPlus className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-800 text-lg">
                  {editingCat ? 'Edit Category' : 'Create Category'}
                </h3>
              </div>
              <button
                onClick={() => setShowCatModal(false)}
                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCatSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Category Name</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="e.g. Desserts"
                  className="w-full px-4 py-2 border border-slate-200 focus:bg-white rounded-xl text-sm font-semibold outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
                />
              </div>

              {/* Category Image */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Category Image</label>
                {catImagePreview ? (
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-50">
                    <img
                      src={catImagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-slate-300">
                    <Image className="w-7 h-7" />
                  </div>
                )}

                <input
                  ref={catFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCatFileUpload}
                />
                <button
                  type="button"
                  onClick={() => catFileInputRef.current?.click()}
                  disabled={catUploading}
                  className="flex items-center space-x-2 px-4 py-2 border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 rounded-xl text-sm font-bold text-slate-600 hover:text-indigo-700 transition-colors cursor-pointer disabled:opacity-60"
                >
                  <Upload className="w-4 h-4" />
                  <span>{catUploading ? 'Uploading...' : 'Upload Local Image'}</span>
                </button>

                <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
                  <div className="flex-1 h-px bg-slate-100" />
                  <span>OR enter URL</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

                <input
                  type="text"
                  value={catImage}
                  onChange={(e) => {
                    setCatImage(e.target.value);
                    setCatImagePreview(e.target.value);
                  }}
                  placeholder="https://images.unsplash.com/... or /hero.png"
                  className="w-full px-4 py-2 border border-slate-200 focus:bg-white rounded-xl text-sm font-semibold outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
                />
              </div>

              {/* Category Food Items List & Quick Edit/Delete */}
              {editingCat && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Dishes in this Category ({foods.filter((f) => f.category.toLowerCase() === editingCat.name.toLowerCase()).length})
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCatModal(false);
                        openAddModal(editingCat.name, editingCat);
                      }}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                    >
                      + Add New Dish
                    </button>
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                    {foods.filter((f) => f.category.toLowerCase() === editingCat.name.toLowerCase()).length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-2">No food items in this category yet.</p>
                    ) : (
                      foods
                        .filter((f) => f.category.toLowerCase() === editingCat.name.toLowerCase())
                        .map((food) => (
                          <div
                            key={food.id}
                            className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-150 text-xs font-semibold"
                          >
                            <span className="truncate text-slate-800 max-w-[170px]">{food.name}</span>
                            <div className="flex items-center space-x-1.5 flex-shrink-0">
                              <span className="text-indigo-600 font-extrabold mr-1">&#8377;{food.price}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setShowCatModal(false);
                                  openEditModal(food, editingCat);
                                }}
                                className="px-2 py-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(food)}
                                className="px-2 py-1 text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCatModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={catUploading}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-extrabold shadow-md hover:shadow cursor-pointer disabled:opacity-60"
                >
                  {editingCat ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Deletion Confirmation Modal */}
      {catToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-scale-up">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 flex-shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800">
                  Delete Category & Foods
                </h3>
                <p className="text-xs text-slate-500 font-medium">Permanent database deletion</p>
              </div>
            </div>

            <div className="p-4 bg-rose-50/70 border border-rose-100 rounded-2xl space-y-2">
              <p className="text-sm font-bold text-rose-950">
                Are you sure you want to delete category <span className="font-black text-rose-600">"{catToDelete.name}"</span> and all food items in it?
              </p>
              <p className="text-xs text-rose-700 font-medium">
                All food dishes under this category ({foods.filter(f => f.category.toLowerCase() === catToDelete.name.toLowerCase() || f.category.toLowerCase() === catToDelete.id.toLowerCase()).length} items) will be deleted permanently from both the store and database.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setCatToDelete(null)}
                disabled={catDeleting}
                className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-600 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteCategory}
                disabled={catDeleting}
                className="flex items-center space-x-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white rounded-xl text-sm font-black shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>{catDeleting ? 'Deleting...' : 'Delete Category & Foods'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
