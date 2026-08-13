import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:8085/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Restaurant {
  id: string;
  name: string;
  image: string;
  rating: number;
  cuisines: string[];
  deliveryTime: number;
  priceRange: string;
  address: string;
  featured: boolean;
}

export interface Category {
  id: string;
  name: string;
  image: string;
}

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
  // Fetch all foods (for dashboard stats calculations)
  getFoods: async (): Promise<FoodItem[]> => {
    const response = await api.get<FoodItem[]>('/foods');
    return response.data;
  },

  // Category CRUD endpoints
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  },

  addCategory: async (categoryData: { name: string; image: string }): Promise<Category> => {
    const response = await api.post<Category>('/categories', categoryData);
    return response.data;
  },

  updateCategory: async (id: string, categoryData: { name: string; image: string }): Promise<Category> => {
    const response = await api.put<Category>(`/categories/${id}`, categoryData);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<{ success: boolean }> => {
    const response = await api.delete<{ success: boolean }>(`/categories/${id}`);
    return response.data;
  },

  // Fetch all orders
  getOrders: async (): Promise<Order[]> => {
    const response = await api.get<Order[]>('/orders');
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (id: string, status: string): Promise<Order> => {
    const response = await api.put<Order>(`/orders/${id}/status`, { status });
    return response.data;
  },

  // Restaurant settings endpoints
  getRestaurants: async (): Promise<Restaurant[]> => {
    const response = await api.get<Restaurant[]>('/restaurants');
    return response.data;
  },

  updateRestaurant: async (id: string, restaurantData: Restaurant): Promise<Restaurant> => {
    const response = await api.put<Restaurant>(`/restaurants/${id}`, restaurantData);
    return response.data;
  },
};
