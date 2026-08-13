import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock } from 'lucide-react';
import type { Restaurant } from '../types/restaurant';


interface RestaurantCardProps {
  restaurant: Restaurant;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
  return (
    <Link
      to={`/restaurants/${restaurant.id}`}
      className="group flex flex-col bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* Image container */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {restaurant.featured && (
          <span className="absolute top-3 left-3 px-2.5 py-1 bg-primary text-white text-xs font-bold rounded-md shadow-sm">
            Featured
          </span>
        )}
      </div>

      {/* Info container */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-slate-800 group-hover:text-primary transition-colors duration-200 line-clamp-1">
          {restaurant.name}
        </h3>
        
        {/* Cuisines */}
        <p className="text-sm text-slate-500 line-clamp-1 mt-1">
          {restaurant.cuisines.join(', ')}
        </p>

        {/* Details row */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50 text-xs font-semibold text-slate-600">
          {/* Rating */}
          <div className="flex items-center space-x-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg">
            <Star className="w-3.5 h-3.5 fill-emerald-600 stroke-emerald-600" />
            <span>{restaurant.rating.toFixed(1)}</span>
          </div>

          {/* Delivery Time */}
          <div className="flex items-center space-x-1 text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span>{restaurant.deliveryTime} mins</span>
          </div>

          {/* Price Range */}
          <div className="text-slate-700 font-bold">
            {restaurant.priceRange}
          </div>
        </div>
      </div>
    </Link>
  );
};
