import React from 'react';
import { Plus, Minus, ZoomIn } from 'lucide-react';
import type { FoodItem } from '../types/food';
import { useCartStore } from '../store/cartStore';

interface FoodCardProps {
  food: FoodItem;
  restaurantId: string;
  restaurantName: string;
  isOpen?: boolean;
  onImageClick?: () => void;
  onConflict: (food: FoodItem) => void;
}

const DEFAULT_FOOD_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';

export const FoodCard: React.FC<FoodCardProps> = ({
  food,
  restaurantId,
  restaurantName,
  isOpen = true,
  onImageClick,
  onConflict,
}) => {
  const { items, addItem, increaseQuantity, decreaseQuantity } = useCartStore();

  const cartItem = items.find((item) => item.food.id === food.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAdd = () => {
    const result = addItem(food, restaurantId, restaurantName, false);
    if (result.conflict) {
      onConflict(food);
    }
  };

  return (
    <div className="flex justify-between items-start p-4 md:p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
      
      {/* Text Info */}
      <div className="flex-grow pr-4 flex flex-col h-full">
        {/* Veg/Non-Veg Badge */}
        <div className="flex items-center space-x-2">
          <div
            className={`w-4 h-4 border flex items-center justify-center rounded-sm ${
              food.isVeg ? 'border-emerald-600' : 'border-red-600'
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                food.isVeg ? 'bg-emerald-600' : 'bg-red-600'
              }`}
            ></div>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {food.isVeg ? 'Veg' : 'Non-Veg'}
          </span>
        </div>

        {/* Name */}
        <h4 className="text-base md:text-lg font-bold text-slate-800 mt-2 leading-snug break-words">
          {food.name}
        </h4>

        {/* Price */}
        <div className="text-base font-extrabold text-slate-800 mt-1">
          ₹{food.price}
        </div>
      </div>

      {/* Image and Add Button container */}
      <div className="relative flex-shrink-0 w-28 h-28 md:w-32 md:h-32 bg-slate-50 rounded-xl overflow-hidden shadow-inner flex flex-col items-center group">
        <button
          type="button"
          onClick={onImageClick}
          className="w-full h-full cursor-zoom-in relative block text-left"
          title={`Click to view full image of ${food.name}`}
          aria-label={`View full image for ${food.name}`}
        >
          <img
            src={food.image || DEFAULT_FOOD_IMAGE}
            alt={food.name}
            className={`w-full h-full object-cover transition-all duration-300 ${
              !isOpen
                ? 'grayscale contrast-90 opacity-70'
                : 'group-hover:scale-105'
            }`}
            loading="lazy"
            onError={(e) => {
              const target = e.currentTarget;
              if (target.src !== DEFAULT_FOOD_IMAGE) {
                target.src = DEFAULT_FOOD_IMAGE;
              }
            }}
          />

          {/* Hover zoom indicator hint */}
          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
            <div className="p-1.5 bg-black/60 rounded-full text-white backdrop-blur-xs shadow-md transform scale-90 group-hover:scale-100 transition-transform">
              <ZoomIn className="w-4 h-4" />
            </div>
          </div>
        </button>

        {/* Closed Store Shadow Overlay & Tag */}
        {!isOpen && (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/20 pointer-events-none rounded-xl" />
            <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-rose-600/90 backdrop-blur-xs text-white text-[9px] font-black uppercase tracking-wider rounded-md shadow-sm pointer-events-none">
              Closed
            </div>
          </>
        )}

        {/* Add/Quantity selector button overlay */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-4/5 z-10">
          {!isOpen ? (
            <button
              disabled
              className="w-full py-1.5 bg-slate-200/90 text-slate-500 border border-slate-300/80 rounded-lg font-bold text-xs cursor-not-allowed text-center backdrop-blur-xs shadow-xs"
            >
              CLOSED
            </button>
          ) : quantity > 0 ? (
            <div className="flex items-center justify-between bg-white text-primary border border-primary/20 shadow-lg rounded-lg font-bold text-sm h-8">
              <button
                onClick={() => decreaseQuantity(food.id)}
                className="w-8 h-full flex items-center justify-center hover:bg-primary/5 transition-colors rounded-l-lg cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-slate-800">{quantity}</span>
              <button
                onClick={() => increaseQuantity(food.id)}
                className="w-8 h-full flex items-center justify-center hover:bg-primary/5 transition-colors rounded-r-lg cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className="w-full py-1.5 bg-white text-primary hover:bg-primary hover:text-white border border-primary/25 shadow-lg rounded-lg font-extrabold text-sm transition-all duration-200 cursor-pointer text-center"
            >
              ADD
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
