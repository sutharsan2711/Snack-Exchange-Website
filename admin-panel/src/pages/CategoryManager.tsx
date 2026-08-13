import React, { useEffect, useRef, useState } from 'react';
import { apiService, api } from '../services/api';
import type { Category, FoodItem } from '../services/api';
import { Plus, Edit2, Trash2, X, Search, FolderPlus, Upload, Image } from 'lucide-react';

export const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [foodType, setFoodType] = useState<'all' | 'veg' | 'non-veg'>('all');

  // Modal form states
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formName, setFormName] = useState('');
  const [formImage, setFormImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const [catData, foodData] = await Promise.all([
        apiService.getCategories(),
        apiService.getFoods(),
      ]);
      setCategories(catData);
      setFoods(foodData);
    } catch (err) {
      console.error('Failed to load menu categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((cat) => {
    const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase());
    const catFoods = foods.filter((f) => f.category.toLowerCase() === cat.name.toLowerCase());
    const hasVeg = catFoods.some((f) => f.isVeg);
    const hasNonVeg = catFoods.some((f) => !f.isVeg);

    let matchesType = true;
    if (foodType === 'veg') {
      matchesType = hasVeg || catFoods.length === 0;
    } else if (foodType === 'non-veg') {
      matchesType = hasNonVeg || catFoods.length === 0;
    }

    return matchesSearch && matchesType;
  });

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormName('');
    setFormImage('');
    setImagePreview('');
    setShowModal(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormImage(cat.image);
    setImagePreview(cat.image);
    setShowModal(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category? Any dishes associated with it may become uncategorized.')) return;
    try {
      await apiService.deleteCategory(id);
      setCategories(categories.filter(c => c.id !== id));
    } catch (err) {
      console.error('Failed to delete category:', err);
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormImage(val);
    setImagePreview(val);
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
      const response = await api.post<{ url: string }>('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const serverUrl = `http://localhost:8085/api${response.data.url}`;
      setFormImage(serverUrl);
    } catch (err) {
      console.error('Failed to upload image:', err);
      alert('Image upload failed. Please try a URL instead.');
      setImagePreview(formImage);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    try {
      if (editingCategory) {
        const updated = await apiService.updateCategory(editingCategory.id, {
          name: formName.trim(),
          image: formImage.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80',
        });
        setCategories(categories.map(c => c.id === editingCategory.id ? updated : c));
      } else {
        const created = await apiService.addCategory({
          name: formName.trim(),
          image: formImage.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80',
        });
        setCategories([...categories, created]);
      }
      setShowModal(false);
    } catch (err) {
      console.error('Failed to save category:', err);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] overflow-hidden space-y-4">
      {/* Page Header (Fixed at Top) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Category Management</h1>
          <p className="text-slate-500 font-medium">Add, update, or remove menu categories for Snake Exchange</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center space-x-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-150 cursor-pointer self-start sm:self-center"
        >
          <Plus className="w-5 h-5" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Static Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between flex-shrink-0">
        {/* Search Input Bar */}
        <div className="relative flex-grow max-w-md w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search menu categories..."
            className="w-full pl-9 pr-4 py-2 border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white rounded-xl text-sm font-semibold outline-hidden focus:border-indigo-600 transition-colors"
          />
        </div>

        {/* All / Veg / Non-Veg Filter Toggle */}
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
            {filteredCategories.length} categor{filteredCategories.length !== 1 ? 'ies' : 'y'}
          </span>
        </div>
      </div>

      {/* Scrollable Table Area */}
      {loading ? (
        <div className="flex justify-center items-center h-[30vh] flex-shrink-0">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-20 text-slate-400 font-medium bg-white rounded-3xl border border-slate-100 flex-shrink-0">
          📁 No categories found matching your filters.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-y-auto flex-1 min-h-0 relative">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10">
              <tr className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Category Name</th>
                <th className="px-6 py-4">Menu Items Breakdown</th>
                <th className="px-6 py-4">System ID</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-semibold text-slate-700">
              {filteredCategories.map((cat) => {
                const catDishes = foods.filter(f => f.category.toLowerCase() === cat.name.toLowerCase());
                const vegCount = catDishes.filter(f => f.isVeg).length;
                const nonVegCount = catDishes.filter(f => !f.isVeg).length;

                return (
                  <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-100 shadow-xs"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80';
                        }}
                      />
                    </td>
                    <td className="px-6 py-4 font-extrabold text-slate-800">
                      {cat.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {vegCount} Veg
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-lg border border-red-100/60">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          {nonVegCount} Non-Veg
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      {cat.id}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(cat)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Category"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 transform animate-scale-up">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-2">
                <FolderPlus className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-800 text-lg">
                  {editingCategory ? 'Edit Category' : 'Create Category'}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Category Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Desserts"
                  className="w-full px-4 py-2 border border-slate-200 focus:bg-white rounded-xl text-sm font-semibold outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
                />
              </div>

              {/* Image Section */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Category Image</label>

                {/* Preview */}
                {imagePreview && (
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-50">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                )}
                {!imagePreview && (
                  <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-slate-300">
                    <Image className="w-7 h-7" />
                  </div>
                )}

                {/* Upload Local File */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center space-x-2 px-4 py-2 border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 rounded-xl text-sm font-bold text-slate-600 hover:text-indigo-700 transition-colors cursor-pointer disabled:opacity-60"
                >
                  <Upload className="w-4 h-4" />
                  <span>{uploading ? 'Uploading...' : 'Upload Local Image'}</span>
                </button>

                {/* OR divider */}
                <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
                  <div className="flex-1 h-px bg-slate-100" />
                  <span>OR enter URL</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>

                <input
                  type="text"
                  value={formImage}
                  onChange={handleImageUrlChange}
                  placeholder="https://images.unsplash.com/... or /hero.png"
                  className="w-full px-4 py-2 border border-slate-200 focus:bg-white rounded-xl text-sm font-semibold outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-sm font-bold text-slate-600 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-extrabold shadow-md hover:shadow cursor-pointer disabled:opacity-60"
                >
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

