import axios from 'axios';
import { FoodItem, Category, PosOrder } from '../types/pos';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8085/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

export const getFoods = async (restaurantId: string = 'gourmet-bistro'): Promise<FoodItem[]> => {
  try {
    const res = await api.get('/foods');
    return res.data;
  } catch (err) {
    console.warn('API fetch foods failed, using cached/fallback:', err);
    return [
      { id: 'f-1', restaurantId, name: 'Crispy Veg Burger', price: 149, category: 'Burgers', isVeg: true, rating: 4.8, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80' },
      { id: 'f-2', restaurantId, name: 'Spicy Chicken Wings', price: 289, category: 'Starters', isVeg: false, rating: 4.9, image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400&auto=format&fit=crop&q=80' },
      { id: 'f-3', restaurantId, name: 'Paneer Butter Masala', price: 299, category: 'Main Course', isVeg: true, rating: 4.7, image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&auto=format&fit=crop&q=80' },
      { id: 'f-4', restaurantId, name: 'Butter Naan (2 pcs)', price: 80, category: 'Breads', isVeg: true, rating: 4.6, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&auto=format&fit=crop&q=80' },
      { id: 'f-5', restaurantId, name: 'Cold Coffee with Ice Cream', price: 120, category: 'Beverages', isVeg: true, rating: 4.9, image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400&auto=format&fit=crop&q=80' },
      { id: 'f-6', restaurantId, name: 'Masala French Fries', price: 110, category: 'Snacks', isVeg: true, rating: 4.5, image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=400&auto=format&fit=crop&q=80' },
    ];
  }
};

export const getCategories = async (): Promise<Category[]> => {
  try {
    const res = await api.get('/categories');
    return res.data;
  } catch (err) {
    console.warn('API fetch categories failed, using fallback:', err);
    return [
      { id: 'all', name: 'All Items' },
      { id: 'burgers', name: 'Burgers' },
      { id: 'starters', name: 'Starters' },
      { id: 'main-course', name: 'Main Course' },
      { id: 'breads', name: 'Breads' },
      { id: 'snacks', name: 'Snacks' },
      { id: 'beverages', name: 'Beverages' },
    ];
  }
};

export const getOrders = async (): Promise<PosOrder[]> => {
  try {
    const res = await api.get('/orders');
    return res.data.map((order: any) => {
      const address = order.address || '';
      const isPos = address.includes('[POS Billing]') || address.includes('POS Counter') || address.includes('Staff:');
      
      let staffName = 'Staff';
      if (address.includes('Staff: ')) {
        staffName = address.split('Staff: ')[1].split(' |')[0].split(' (')[0];
      }

      let customerName = 'Walk-In Guest';
      if (address.includes('Cust: ')) {
        customerName = address.split('Cust: ')[1].split(' |')[0].split(' [')[0];
      }

      return {
        id: order.id,
        restaurantId: order.restaurantId || 'gourmet-bistro',
        restaurantName: order.restaurantName || 'Snack Exchange',
        orderType: (address.toLowerCase().includes('takeaway') ? 'takeaway' : 'pos_counter') as any,
        customerName,
        staffName,
        address: order.address || 'POS Counter',
        items: order.items || [],
        subtotal: Number(order.subtotal || 0),
        discount: 0,
        deliveryFee: Number(order.deliveryFee || 0),
        tax: Number(order.tax || 0),
        total: Number(order.total || 0),
        paymentMethod: (order.paymentMethod?.toUpperCase() || 'CASH') as any,
        paymentStatus: order.status === 'Completed' || order.status === 'Delivered' ? 'PAID' : 'PAID',
        status: order.status || 'Pending',
        createdAt: order.createdAt || new Date().toISOString(),
      };
    });
  } catch (err) {
    console.warn('API fetch orders failed:', err);
    return [];
  }
};

export const createPosOrder = async (orderPayload: {
  restaurantId: string;
  restaurantName: string;
  orderType: string;
  staffName: string;
  items: { foodId: string; quantity: number }[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
}): Promise<{ success: boolean; orderId: string }> => {
  const typeLabel = orderPayload.orderType === 'takeaway' ? 'Takeaway' : 'Direct Counter';
  const addressString = `[POS Billing] ${typeLabel} - Staff: ${orderPayload.staffName}${
    orderPayload.customerName ? ` | Cust: ${orderPayload.customerName}` : ''
  }${orderPayload.customerPhone ? ` | Ph: ${orderPayload.customerPhone}` : ''}${
    orderPayload.notes ? ` | Note: ${orderPayload.notes}` : ''
  }`;

  const payload = {
    restaurantId: orderPayload.restaurantId || 'gourmet-bistro',
    restaurantName: orderPayload.restaurantName || 'Snack Exchange',
    address: addressString,
    items: orderPayload.items,
    subtotal: orderPayload.subtotal,
    deliveryFee: orderPayload.deliveryFee || 0,
    tax: orderPayload.tax || 0,
    total: orderPayload.total,
    paymentMethod: orderPayload.paymentMethod || 'CASH',
  };

  const res = await api.post('/orders', payload);
  return res.data;
};

export const updateOrderStatus = async (orderId: string, status: string): Promise<any> => {
  const res = await api.put(`/orders/${orderId}/status`, { status });
  return res.data;
};

export default api;
