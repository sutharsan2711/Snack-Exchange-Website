import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { Minus, Plus, Trash2, ArrowLeft, ShoppingCart, ArrowRight } from 'lucide-react';

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    restaurantName,
    subtotal,
    deliveryFee,
    tax,
    total,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
    clearCart,
  } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-6 min-h-[60vh] flex flex-col justify-center items-center">
        <div className="relative">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
            <ShoppingCart className="w-12 h-12" />
          </div>
          <span className="absolute -top-1 -right-1 bg-primary w-4.5 h-4.5 rounded-full animate-ping"></span>
        </div>
        <h2 className="text-2xl font-black text-slate-800">Your Cart is Empty</h2>
        <p className="text-slate-500 max-w-sm">
          Good food is always cooking! Go ahead, order some yummy items from the menu.
        </p>
        <Link
          to="/"
          className="px-6 py-2.5 bg-primary text-white font-extrabold rounded-xl hover:bg-primary-hover shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer inline-flex items-center space-x-2"
        >
          <span>Explore Menu</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 min-h-screen">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link
            to="/"
            className="inline-flex items-center space-x-1.5 text-sm font-semibold text-slate-500 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Ordering</span>
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">Your Basket</h1>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline flex items-center space-x-1 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Cart items list */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <div className="pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Ordering from</span>
              <h2 className="text-lg font-bold text-primary">{restaurantName}</h2>
            </div>

            <div className="divide-y divide-slate-100">
              {items.map((item) => (
                <div key={item.food.id} className="py-4 flex items-center justify-between gap-4">
                  {/* Food Info */}
                  <div className="flex items-center space-x-3 min-w-0">
                    <img
                      src={item.food.image}
                      alt={item.food.name}
                      className="w-14 h-14 rounded-lg object-cover bg-slate-50 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-800 truncate">{item.food.name}</h4>
                      <p className="text-xs text-slate-400 font-semibold">₹{item.food.price} each</p>
                    </div>
                  </div>

                  {/* Quantity adjustment & total */}
                  <div className="flex items-center space-x-4 flex-shrink-0">
                    {/* Quantity selectors */}
                    <div className="flex items-center bg-slate-50 border border-slate-200/50 rounded-lg text-primary text-xs font-bold h-7.5">
                      <button
                        onClick={() => decreaseQuantity(item.food.id)}
                        className="w-7 h-full flex items-center justify-center hover:bg-slate-100 rounded-l-lg cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3 text-slate-600" />
                      </button>
                      <span className="px-2 text-slate-800 text-sm font-bold">{item.quantity}</span>
                      <button
                        onClick={() => increaseQuantity(item.food.id)}
                        className="w-7 h-full flex items-center justify-center hover:bg-slate-100 rounded-r-lg cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3 text-slate-600" />
                      </button>
                    </div>

                    {/* Total Price for item */}
                    <div className="w-16 text-right font-extrabold text-slate-800 text-sm">
                      ₹{item.food.price * item.quantity}
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => removeItem(item.food.id)}
                      className="text-slate-300 hover:text-red-500 transition-colors cursor-pointer"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Pricing Summary Sidepanel */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6">
            <h3 className="text-base font-extrabold text-slate-800 pb-3 border-b border-slate-100 uppercase tracking-wider text-xs">
              Bill Details
            </h3>
            
            <div className="space-y-3.5 text-sm text-slate-600 font-semibold">
              <div className="flex justify-between">
                <span>Item Total</span>
                <span className="text-slate-800 font-bold">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Partner Fee</span>
                <span className="text-slate-800 font-bold">₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & Charges</span>
                <span className="text-slate-800 font-bold">₹{tax}</span>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center text-slate-800">
                <span className="font-extrabold">To Pay</span>
                <span className="text-xl font-black text-slate-900">₹{total}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
