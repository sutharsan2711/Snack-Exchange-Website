import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8085/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  rating: number;
  category: string;
  restaurantId: string;
  isVeg: boolean;
  inStock?: boolean;
}

export interface OrderItem {
  id: number;
  foodItem: FoodItem;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  restaurantId: string;
  restaurantName: string;
  address: string;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export const apiService = {
  getFoods: async (): Promise<FoodItem[]> => {
    const response = await api.get<FoodItem[]>('/foods');
    return response.data;
  },

  getOrders: async (): Promise<Order[]> => {
    const response = await api.get<Order[]>('/orders');
    return response.data;
  },

  updateOrderStatus: async (id: string, status: string): Promise<Order> => {
    const response = await api.put<Order>(`/orders/${id}/status`, { status });
    return response.data;
  },
};
