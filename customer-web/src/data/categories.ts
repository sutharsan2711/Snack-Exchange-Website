export interface Category {
  id: string;
  name: string;
  icon: string;
}

export const categories: Category[] = [
  { id: 'burger', name: 'Burger', icon: '🍔' },
  { id: 'pizza', name: 'Pizza', icon: '🍕' },
  { id: 'biryani', name: 'Biryani', icon: '🍛' },
  { id: 'chinese', name: 'Chinese', icon: '🍜' },
  { id: 'south-indian', name: 'South Indian', icon: '🫓' },
  { id: 'north-indian', name: 'North Indian', icon: '🍲' },
  { id: 'desserts', name: 'Desserts', icon: '🍰' },
  { id: 'drinks', name: 'Drinks', icon: '🥤' },
  { id: 'veg-crunch', name: 'Veg Crunch', icon: '🍟' }
];
