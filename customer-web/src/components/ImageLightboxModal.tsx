import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Plus, Minus } from 'lucide-react';
import type { FoodItem } from '../types/food';
import { useCartStore } from '../store/cartStore';

interface ImageLightboxModalProps {
  foods: FoodItem[];
  currentIndex: number;
  isOpen: boolean;
  isStoreOpen: boolean;
  restaurantId: string;
  restaurantName: string;
  onClose: () => void;
  onIndexChange: (index: number) => void;
  onConflict?: (food: FoodItem) => void;
}

const DEFAULT_FOOD_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  foods,
  currentIndex,
  isOpen,
  isStoreOpen,
  restaurantId,
  restaurantName,
  onClose,
  onIndexChange,
  onConflict,
}) => {
  const { items, addItem, increaseQuantity, decreaseQuantity } = useCartStore();

  const currentFood = foods[currentIndex];

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (foods.length <= 1) return;
    const nextIdx = currentIndex > 0 ? currentIndex - 1 : foods.length - 1;
    onIndexChange(nextIdx);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (foods.length <= 1) return;
    const nextIdx = currentIndex < foods.length - 1 ? currentIndex + 1 : 0;
    onIndexChange(nextIdx);
  };

  // Keyboard navigation: Escape, ArrowLeft, ArrowRight
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, foods.length]);

  if (!isOpen || !currentFood) return null;

  const cartItem = items.find((item) => item.food.id === currentFood.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAdd = () => {
    const result = addItem(currentFood, restaurantId, restaurantName, false);
    if (result.conflict && onConflict) {
      onConflict(currentFood);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      {/* Outer Container with Floating Next/Prev Buttons */}
      <div
        className="relative max-w-xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl animate-scale-up border border-slate-100/30 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Floating Header with Close & Counter */}
        <div className="absolute top-3.5 inset-x-3.5 z-20 flex items-center justify-between pointer-events-none">
          {/* Index Counter Pill */}
          <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-xs font-bold shadow-md pointer-events-auto">
            {currentIndex + 1} / {foods.length}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-black/60 hover:bg-black/85 text-white backdrop-blur-md transition-all cursor-pointer shadow-md pointer-events-auto hover:scale-105"
            aria-label="Close image preview"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Large Image Viewport with Previous & Next Overlays */}
        <div className="relative w-full h-72 sm:h-84 bg-slate-950 overflow-hidden select-none flex items-center justify-center">
          <img
            key={currentFood.id}
            src={currentFood.image || DEFAULT_FOOD_IMAGE}
            alt={currentFood.name}
            className="w-full h-full object-cover transition-opacity duration-300 animate-fade-in"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== DEFAULT_FOOD_IMAGE) {
                target.src = DEFAULT_FOOD_IMAGE;
              }
            }}
          />

          {/* Previous Button (<) */}
          {foods.length > 1 && (
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-all cursor-pointer shadow-lg hover:scale-110 active:scale-95 border border-white/10"
              title="Previous dish (Left arrow)"
              aria-label="Previous food item"
            >
              <ChevronLeft className="w-6 h-6 -ml-0.5" />
            </button>
          )}

          {/* Next Button (>) */}
          {foods.length > 1 && (
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-all cursor-pointer shadow-lg hover:scale-110 active:scale-95 border border-white/10"
              title="Next dish (Right arrow)"
              aria-label="Next food item"
            >
              <ChevronRight className="w-6 h-6 -mr-0.5" />
            </button>
          )}

          {/* Veg/Non-Veg Tag on Image */}
          <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-white/95 backdrop-blur-md rounded-lg flex items-center gap-1.5 shadow-md">
            <div
              className={`w-3 h-3 border flex items-center justify-center rounded-xs ${
                currentFood.isVeg ? 'border-emerald-600' : 'border-red-600'
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  currentFood.isVeg ? 'bg-emerald-600' : 'bg-red-600'
                }`}
              />
            </div>
            <span className="text-xs font-bold text-slate-800">
              {currentFood.isVeg ? 'Vegetarian' : 'Non-Veg'}
            </span>
          </div>
        </div>

        {/* Modal Body & Info */}
        <div className="p-5 sm:p-6 bg-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">
                {currentFood.category}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 leading-snug">
                {currentFood.name}
              </h3>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 flex-shrink-0">
              ₹{currentFood.price}
            </div>
          </div>

          {/* Navigation & Action Footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            {/* Quick Navigation Buttons (Previous / Next) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                disabled={foods.length <= 1}
                className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={foods.length <= 1}
                className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Cart Actions */}
            <div>
              {!isStoreOpen ? (
                <span className="px-4 py-2.5 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl font-bold text-xs sm:text-sm">
                  Store Closed
                </span>
              ) : quantity > 0 ? (
                <div className="flex items-center bg-primary/10 border border-primary/20 rounded-xl text-primary font-bold text-sm h-10 px-2">
                  <button
                    onClick={() => decreaseQuantity(currentFood.id)}
                    className="w-8 h-full flex items-center justify-center hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4 text-primary" />
                  </button>
                  <span className="px-3 text-slate-900 font-extrabold text-base">{quantity}</span>
                  <button
                    onClick={() => increaseQuantity(currentFood.id)}
                    className="w-8 h-full flex items-center justify-center hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4 text-primary" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAdd}
                  className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-black text-xs sm:text-sm shadow-md shadow-primary/20 transition-all cursor-pointer text-center"
                >
                  ADD TO CART • ₹{currentFood.price}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
