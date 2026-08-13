import axios from 'axios';
import type { Restaurant } from '../types/restaurant';
import type { FoodItem } from '../types/food';

export interface Category {
  id: string;
  name: string;
  image: string;
}

// Axios instance configured to target the Spring Boot context path /api
export const api = axios.create({
  baseURL: 'http://localhost:8085/api',
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
};
