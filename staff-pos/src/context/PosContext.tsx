import React, { createContext, useContext, useState, useEffect } from 'react';
import { FoodItem, CartItem, StaffMember, OrderType, PosOrder, ShiftSummary } from '../types/pos';
import { getFoods, getCategories, getOrders, createPosOrder, updateOrderStatus } from '../services/api';

const DEFAULT_STAFF: StaffMember[] = [
  { id: 'st-1', name: 'Rahul Sharma', role: 'Waiter', pin: '1111' },
  { id: 'st-2', name: 'Priya Patel', role: 'Cashier', pin: '2222' },
  { id: 'st-3', name: 'Vikram Singh', role: 'Captain', pin: '3333' },
  { id: 'st-4', name: 'Admin Manager', role: 'Manager', pin: '9999' },
];

interface PosContextType {
  foods: FoodItem[];
  categories: any[];
  isLoading: boolean;
  activeStaff: StaffMember;
  allStaff: StaffMember[];
  switchStaff: (staff: StaffMember) => void;
  orderType: OrderType;
  setOrderType: (type: OrderType) => void;
  cart: CartItem[];
  addToCart: (food: FoodItem, notes?: string) => void;
  decrementFood: (foodId: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, delta: number) => void;
  updateItemNotes: (cartItemId: string, notes: string) => void;
  clearCart: () => void;
  cartSubtotal: number;
  taxAmount: number;
  discountAmount: number;
  setDiscountPercent: (pct: number) => void;
  discountPercent: number;
  cartTotal: number;
  totalItemsCount: number;
  orders: PosOrder[];
  refreshOrders: () => Promise<void>;
  submitOrder: (paymentMethod: string, customerName?: string, customerPhone?: string, notes?: string) => Promise<PosOrder | null>;
  changeOrderStatus: (orderId: string, newStatus: string) => Promise<void>;
  shiftSummary: ShiftSummary;
}

const PosContext = createContext<PosContextType | undefined>(undefined);

export const PosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [allStaff] = useState<StaffMember[]>(DEFAULT_STAFF);
  const [activeStaff, setActiveStaff] = useState<StaffMember>(() => {
    const saved = localStorage.getItem('pos_active_staff');
    return saved ? JSON.parse(saved) : DEFAULT_STAFF[0];
  });
  const [orderType, setOrderType] = useState<OrderType>('pos_counter');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [orders, setOrders] = useState<PosOrder[]>([]);

  // Load menu and orders on startup
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [foodsData, catsData, ordersData] = await Promise.all([
        getFoods(),
        getCategories(),
        getOrders(),
      ]);
      setFoods(foodsData);
      setCategories(catsData);
      setOrders(ordersData);
    } catch (e) {
      console.error('Error loading POS initial data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(async () => {
      try {
        const freshOrders = await getOrders();
        setOrders(freshOrders);
      } catch (e) {}
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const switchStaff = (staff: StaffMember) => {
    setActiveStaff(staff);
    localStorage.setItem('pos_active_staff', JSON.stringify(staff));
  };

  const addToCart = (food: FoodItem, notes: string = '') => {
    const cartItemId = `${food.id}_${notes}`;
    setCart((prev) => {
      const existing = prev.find((item) => item.id === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.id === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { id: cartItemId, food, quantity: 1, notes, selectedPrice: food.price }];
    });
  };

  const decrementFood = (foodId: string) => {
    setCart((prev) => {
      const index = prev.findIndex((item) => item.food.id === foodId);
      if (index === -1) return prev;
      const target = prev[index];
      if (target.quantity > 1) {
        return prev.map((item, idx) =>
          idx === index ? { ...item, quantity: item.quantity - 1 } : item
        );
      } else {
        return prev.filter((_, idx) => idx !== index);
      }
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const updateItemNotes = (cartItemId: string, notes: string) => {
    setCart((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, notes } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
    setDiscountPercent(0);
  };

  const cartSubtotal = cart.reduce((acc, item) => acc + item.selectedPrice * item.quantity, 0);
  const discountAmount = Math.round((cartSubtotal * discountPercent) / 100);
  const taxableAmount = Math.max(0, cartSubtotal - discountAmount);
  const taxAmount = Math.round(taxableAmount * 0.05); // 5% GST
  const cartTotal = taxableAmount + taxAmount;
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const refreshOrders = async () => {
    const data = await getOrders();
    setOrders(data);
  };

  const submitOrder = async (
    paymentMethod: string,
    customerName: string = '',
    customerPhone: string = '',
    notes: string = ''
  ): Promise<PosOrder> => {
    const fallbackOrderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    let generatedOrderId = fallbackOrderId;

    try {
      const itemsPayload = cart.map((c) => ({
        foodId: c.food.id,
        quantity: c.quantity,
        price: c.selectedPrice,
      }));

      const res = await createPosOrder({
        restaurantId: 'gourmet-bistro',
        restaurantName: 'Snack Exchange',
        orderType,
        staffName: activeStaff.name,
        items: itemsPayload,
        subtotal: cartSubtotal,
        tax: taxAmount,
        deliveryFee: 0,
        total: cartTotal,
        paymentMethod,
        customerName,
        customerPhone,
        notes,
      });

      if (res && res.orderId) {
        generatedOrderId = res.orderId;
      }
    } catch (err) {
      console.warn('Backend API order placement failed, saving locally:', err);
    }

    const newOrder: PosOrder = {
      id: generatedOrderId,
      restaurantId: 'gourmet-bistro',
      restaurantName: 'Snack Exchange',
      orderType,
      customerName: customerName || 'Walk-In Guest',
      customerPhone,
      staffName: activeStaff.name,
      address: `[POS Billing] ${orderType === 'takeaway' ? 'Takeaway' : 'Direct Counter'} - Staff: ${activeStaff.name}`,
      items: cart.map((c) => ({
        foodId: c.food.id,
        foodName: c.food.name,
        quantity: c.quantity,
        price: c.selectedPrice,
        notes: c.notes,
        foodItem: c.food,
      })),
      subtotal: cartSubtotal,
      discount: discountAmount,
      deliveryFee: 0,
      tax: taxAmount,
      total: cartTotal,
      paymentMethod: paymentMethod as any,
      paymentStatus: 'PAID',
      status: 'In Kitchen',
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    try {
      await refreshOrders();
    } catch (e) {}

    return newOrder;
  };

  const changeOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      await refreshOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const shiftOrders = orders.filter((o) => o.address.includes('[POS Billing]') || o.address.includes('Staff:'));
  const totalSales = shiftOrders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.total : 0), 0);
  const cashSales = shiftOrders.reduce((sum, o) => sum + (o.paymentMethod === 'CASH' && o.status !== 'Cancelled' ? o.total : 0), 0);
  const upiSales = shiftOrders.reduce((sum, o) => sum + (o.paymentMethod === 'UPI' && o.status !== 'Cancelled' ? o.total : 0), 0);
  const cardSales = shiftOrders.reduce((sum, o) => sum + (o.paymentMethod === 'CARD' && o.status !== 'Cancelled' ? o.total : 0), 0);

  const shiftSummary: ShiftSummary = {
    staffId: activeStaff.id,
    staffName: activeStaff.name,
    shiftStartTime: '08:00 AM Today',
    totalOrders: shiftOrders.length,
    totalSales,
    cashSales,
    upiSales,
    cardSales,
  };

  return (
    <PosContext.Provider
      value={{
        foods,
        categories,
        isLoading,
        activeStaff,
        allStaff,
        switchStaff,
        orderType,
        setOrderType,
        cart,
        addToCart,
        decrementFood,
        removeFromCart,
        updateQuantity,
        updateItemNotes,
        clearCart,
        cartSubtotal,
        taxAmount,
        discountAmount,
        setDiscountPercent,
        discountPercent,
        cartTotal,
        totalItemsCount,
        orders,
        refreshOrders,
        submitOrder,
        changeOrderStatus,
        shiftSummary,
      }}
    >
      {children}
    </PosContext.Provider>
  );
};

export const usePos = () => {
  const context = useContext(PosContext);
  if (!context) {
    throw new Error('usePos must be used within a PosProvider');
  }
  return context;
};
