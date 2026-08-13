import { create } from 'zustand';
import type { CartItem } from '../types/cart';
import type { FoodItem } from '../types/food';


interface CartStore {
  items: CartItem[];
  restaurantId: string | null;
  restaurantName: string | null; // Added to show restaurant name in cart/checkout
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  
  addItem: (food: FoodItem, restaurantId: string, restaurantName: string, force?: boolean) => { success: boolean; conflict: boolean };
  removeItem: (foodId: string) => void;
  increaseQuantity: (foodId: string) => void;
  decreaseQuantity: (foodId: string) => void;
  clearCart: () => void;
  recalculateTotals: (items: CartItem[]) => { subtotal: number; deliveryFee: number; tax: number; total: number };
}

const FLAT_DELIVERY_FEE = 30;
const TAX_PERCENTAGE = 0.05; // 5%

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  restaurantId: null,
  restaurantName: null,
  subtotal: 0,
  deliveryFee: 0,
  tax: 0,
  total: 0,

  recalculateTotals: (items) => {
    const subtotal = items.reduce((acc, item) => acc + item.food.price * item.quantity, 0);
    const deliveryFee = subtotal > 0 ? FLAT_DELIVERY_FEE : 0;
    const tax = Math.round(subtotal * TAX_PERCENTAGE);
    const total = subtotal + deliveryFee + tax;
    return { subtotal, deliveryFee, tax, total };
  },

  addItem: (food, restaurantId, restaurantName) => {
    const { items } = get();

    // Add item normally without conflict checks (single restaurant)
    const existingItemIndex = items.findIndex((item) => item.food.id === food.id);
    let newItems: CartItem[] = [];

    if (existingItemIndex > -1) {
      newItems = items.map((item, idx) =>
        idx === existingItemIndex ? { ...item, quantity: item.quantity + 1 } : item
      );
    } else {
      newItems = [...items, { food, quantity: 1 }];
    }

    const totals = get().recalculateTotals(newItems);
    set({
      items: newItems,
      restaurantId,
      restaurantName,
      ...totals,
    });

    return { success: true, conflict: false };
  },

  removeItem: (foodId) => {
    const { items } = get();
    const newItems = items.filter((item) => item.food.id !== foodId);
    const totals = get().recalculateTotals(newItems);
    
    set({
      items: newItems,
      restaurantId: newItems.length === 0 ? null : get().restaurantId,
      restaurantName: newItems.length === 0 ? null : get().restaurantName,
      ...totals,
    });
  },

  increaseQuantity: (foodId) => {
    const { items } = get();
    const newItems = items.map((item) =>
      item.food.id === foodId ? { ...item, quantity: item.quantity + 1 } : item
    );
    const totals = get().recalculateTotals(newItems);
    set({ items: newItems, ...totals });
  },

  decreaseQuantity: (foodId) => {
    const { items } = get();
    const existingItem = items.find((item) => item.food.id === foodId);
    
    if (!existingItem) return;

    let newItems: CartItem[] = [];
    if (existingItem.quantity === 1) {
      newItems = items.filter((item) => item.food.id !== foodId);
    } else {
      newItems = items.map((item) =>
        item.food.id === foodId ? { ...item, quantity: item.quantity - 1 } : item
      );
    }

    const totals = get().recalculateTotals(newItems);
    set({
      items: newItems,
      restaurantId: newItems.length === 0 ? null : get().restaurantId,
      restaurantName: newItems.length === 0 ? null : get().restaurantName,
      ...totals,
    });
  },

  clearCart: () => {
    set({
      items: [],
      restaurantId: null,
      restaurantName: null,
      subtotal: 0,
      deliveryFee: 0,
      tax: 0,
      total: 0,
    });
  },
}));
