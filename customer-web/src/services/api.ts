import axios from 'axios';
import type { Restaurant } from '../types/restaurant';
import type { FoodItem } from '../types/food';

export interface Category {
  id: string;
  name: string;
  image: string;
}

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8085/api';

// Axios instance configured to target the Spring Boot context path /api
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  /**
   * Get all categories
   */
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/categories');
    return response.data;
  },
  /**
   * Get list of all restaurants
   */
  getRestaurants: async (): Promise<Restaurant[]> => {
    const response = await api.get<Restaurant[]>('/restaurants');
    return response.data;
  },

  /**
   * Get restaurant details by ID
   */
  getRestaurantById: async (id: string): Promise<Restaurant | null> => {
    try {
      const response = await api.get<Restaurant>(`/restaurants/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      return null;
    }
  },

  /**
   * Get all food menu items for a specific restaurant
   */
  getFoodsByRestaurantId: async (restaurantId: string): Promise<FoodItem[]> => {
    const response = await api.get<FoodItem[]>(`/restaurants/${restaurantId}/foods`);
    return response.data;
  },

  /**
   * Get all food items across all restaurants
   */
  getAllFoods: async (): Promise<FoodItem[]> => {
    const response = await api.get<FoodItem[]>('/foods');
    return response.data;
  },


  /**
   * Get all customer orders
   */
  getOrders: async (): Promise<any[]> => {
    const response = await api.get<any[]>('/orders');
    return response.data;
  },

  /**
   * Submit a new customer order
   */
  placeOrder: async (orderData: {
    restaurantId: string;
    restaurantName: string;
    address: string;
    items: { foodId: string; quantity: number }[];
    subtotal: number;
    deliveryFee: number;
    tax: number;
    total: number;
    paymentMethod: string;
  }): Promise<{ success: boolean; orderId: string }> => {
    const response = await api.post<{ success: boolean; orderId: string }>('/orders', orderData);
    return response.data;
  },

  /**
   * Customer Login
   */
  login: async (credentials: any) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Customer Registration
   */
  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Google OAuth Login
   */
  loginWithGoogle: async (token: string) => {
    const response = await api.post('/auth/google', { token });
    return response.data;
  },

  /**
   * Get Customer Profile
   */
  getProfile: async (id: string | number) => {
    const response = await api.get(`/auth/profile/${id}`);
    return response.data;
  },

  /**
   * Update Customer Profile
   */
  updateProfile: async (id: string | number, profileData: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    password?: string;
  }) => {
    const response = await api.put(`/auth/profile/${id}`, profileData);
    return response.data;
  },
};
