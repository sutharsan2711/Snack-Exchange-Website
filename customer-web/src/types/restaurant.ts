export interface Restaurant {
  id: string;
  name: string;
  image: string;
  rating: number;
  cuisines: string[];
  deliveryTime: number; // In minutes, e.g. 25
  priceRange: string; // E.g., "₹200 for two"
  address: string;
  featured?: boolean;
}
