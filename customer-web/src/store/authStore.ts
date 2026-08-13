import { create } from 'zustand';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  avatar?: string;
}

interface AuthStore {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (userData: UserProfile) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => {
  // Load saved user from localStorage
  const savedUser = localStorage.getItem('customer_user');
  const initialUser = savedUser ? JSON.parse(savedUser) : null;

  return {
    user: initialUser,
    isAuthenticated: !!initialUser,

    login: (userData) => {
      localStorage.setItem('customer_user', JSON.stringify(userData));
      set({ user: userData, isAuthenticated: true });
    },

    logout: () => {
      localStorage.removeItem('customer_user');
      set({ user: null, isAuthenticated: false });
    },
  };
});
