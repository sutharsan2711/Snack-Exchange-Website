import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

export const CartButton: React.FC = () => {
  const { items, total } = useCartStore();
  
  if (items.length === 0) return null;

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-lg z-40 animate-bounce-subtle">
      <Link
        to="/cart"
        className="flex items-center justify-between bg-primary hover:bg-primary-hover text-white px-5 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 ring-4 ring-primary/10"
      >
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-white/80">
              {totalItems} {totalItems === 1 ? 'item' : 'items'} added
            </p>
            <p className="text-base font-extrabold">₹{total}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 font-bold text-sm uppercase tracking-wider">
          <span>View Cart</span>
          <ArrowRight className="w-4 h-4 animate-pulse" />
        </div>
      </Link>
    </div>
  );
};
