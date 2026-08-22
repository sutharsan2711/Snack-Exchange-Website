import { create } from 'zustand';

export interface UserProfile {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  address?: string;
  role?: string;
  avatar?: string;
}

interface AuthStore {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (userData: UserProfile) => void;
  logout: () => void;
  updateUser: (updatedFields: Partial<UserProfile>) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => {
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

    updateUser: (updatedFields) => {
      const current = get().user;
      if (!current) return;
      const updated = { ...current, ...updatedFields };
      localStorage.setItem('customer_user', JSON.stringify(updated));
      set({ user: updated });
    },
  };
});
