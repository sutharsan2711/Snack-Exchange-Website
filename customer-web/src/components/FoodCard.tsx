import React from 'react';
import { Star, Plus, Minus } from 'lucide-react';
import type { FoodItem } from '../types/food';
import { useCartStore } from '../store/cartStore';


interface FoodCardProps {
  food: FoodItem;
  restaurantId: string;
  restaurantName: string;
  onConflict: (food: FoodItem) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({
  food,
  restaurantId,
  restaurantName,
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
        <h4 className="text-base md:text-lg font-bold text-slate-800 mt-2 line-clamp-1">
          {food.name}
        </h4>

        {/* Rating */}
        <div className="flex items-center space-x-1 mt-1 text-xs text-amber-500 font-semibold">
          <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
          <span>{food.rating.toFixed(1)}</span>
        </div>

        {/* Price */}
        <div className="text-base font-extrabold text-slate-800 mt-1">
          ₹{food.price}
        </div>

        {/* Description */}
        <p className="text-xs md:text-sm text-slate-500 mt-2 line-clamp-2 md:line-clamp-3">
          {food.description}
        </p>
      </div>

      {/* Image and Add Button container */}
      <div className="relative flex-shrink-0 w-28 h-28 md:w-32 md:h-32 bg-slate-50 rounded-xl overflow-hidden shadow-inner flex flex-col items-center">
        <img
          src={food.image}
          alt={food.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Add/Quantity selector button overlay */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-4/5">
          {quantity > 0 ? (
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
