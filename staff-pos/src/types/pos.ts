export interface FoodItem {
  id: string;
  restaurantId: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  rating?: number;
  category: string;
  isVeg: boolean;
}

export interface Category {
  id: string;
  name: string;
  image?: string;
}

export interface CartItem {
  id: string;
  food: FoodItem;
  quantity: number;
  notes?: string;
  selectedPrice: number;
}

export type OrderType = 'pos_counter' | 'takeaway';

export type PaymentMethod = 'CASH' | 'UPI' | 'CARD' | 'SPLIT';

export interface StaffMember {
  id: string;
  name: string;
  role: 'Waiter' | 'Cashier' | 'Captain' | 'Manager';
  pin: string;
  avatar?: string;
}

export interface PosOrder {
  id: string;
  restaurantId: string;
  restaurantName: string;
  orderType: OrderType;
  customerName?: string;
  customerPhone?: string;
  staffName: string;
  address: string;
  items: {
    id?: string;
    foodId?: string;
    foodName?: string;
    quantity: number;
    price: number;
    notes?: string;
    foodItem?: FoodItem;
  }[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'PAID' | 'PENDING' | 'REFUNDED';
  status: 'Pending' | 'In Kitchen' | 'Preparing' | 'Ready' | 'Served' | 'Completed' | 'Delivered' | 'Cancelled' | string;
  createdAt: string;
}

export interface ShiftSummary {
  staffId: string;
  staffName: string;
  shiftStartTime: string;
  totalOrders: number;
  totalSales: number;
  cashSales: number;
  upiSales: number;
  cardSales: number;
}
