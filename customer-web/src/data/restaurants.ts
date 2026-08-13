import type { Restaurant } from '../types/restaurant';


export const restaurants: Restaurant[] = [
  {
    id: 'burger-house',
    name: 'Burger House',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    rating: 4.5,
    cuisines: ['Burgers', 'Fast Food', 'Snacks'],
    deliveryTime: 25,
    priceRange: '₹200 for two',
    address: '101, Foodie Lane, Sector 5, City Center',
    featured: true
  },
  {
    id: 'pizza-corner',
    name: 'Pizza Corner',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
    rating: 4.3,
    cuisines: ['Pizza', 'Italian', 'Pasta'],
    deliveryTime: 30,
    priceRange: '₹350 for two',
    address: '102, Crust Avenue, Sector 3, Market Road',
    featured: true
  },
  {
    id: 'spice-kitchen',
    name: 'Spice Kitchen',
    image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&auto=format&fit=crop&q=80',
    rating: 4.4,
    cuisines: ['North Indian', 'Mughlai', 'Curry'],
    deliveryTime: 40,
    priceRange: '₹400 for two',
    address: '204, Curry Road, Sector 8, Main Highway',
    featured: false
  },
  {
    id: 'wok-express',
    name: 'Wok Express',
    image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600&auto=format&fit=crop&q=80',
    rating: 4.2,
    cuisines: ['Chinese', 'Asian', 'Noodles'],
    deliveryTime: 35,
    priceRange: '₹300 for two',
    address: '15, Noodle Chowk, Sector 2, Commercial Hub',
    featured: false
  },
  {
    id: 'south-kitchen',
    name: 'South Indian Kitchen',
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80',
    rating: 4.6,
    cuisines: ['South Indian', 'Healthy', 'Vegetarian'],
    deliveryTime: 20,
    priceRange: '₹150 for two',
    address: '56, Dosa Junction, Sector 11, Temple Side',
    featured: true
  },
  {
    id: 'tasty-bites',
    name: 'Tasty Bites',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600&auto=format&fit=crop&q=80',
    rating: 4.1,
    cuisines: ['Fast Food', 'Snacks', 'Beverages'],
    deliveryTime: 22,
    priceRange: '₹180 for two',
    address: '78, Chat Corner, Sector 1, High Street',
    featured: false
  },
  {
    id: 'royal-biryani',
    name: 'Royal Biryani',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
    rating: 4.7,
    cuisines: ['Biryani', 'Mughlai', 'Kebab'],
    deliveryTime: 35,
    priceRange: '₹350 for two',
    address: '89, Kebab Gali, Sector 4, Royal District',
    featured: true
  },
  {
    id: 'sweet-treats',
    name: 'Sweet Treats',
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&auto=format&fit=crop&q=80',
    rating: 4.5,
    cuisines: ['Desserts', 'Ice Cream', 'Bakery'],
    deliveryTime: 18,
    priceRange: '₹200 for two',
    address: '20, Waffle Street, Sector 6, Boulevard Road',
    featured: false
  },
  {
    id: 'healthy-greens',
    name: 'Healthy Greens',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80',
    rating: 4.4,
    cuisines: ['Salads', 'Healthy', 'Vegetarian'],
    deliveryTime: 24,
    priceRange: '₹250 for two',
    address: '12, Fitness Road, Sector 10, Green Gardens',
    featured: false
  },
  {
    id: 'cafe-coffee',
    name: 'Cafe Coffee & Drinks',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop&q=80',
    rating: 4.2,
    cuisines: ['Drinks', 'Cafe', 'Beverages'],
    deliveryTime: 15,
    priceRange: '₹150 for two',
    address: '55, Espresso Way, Sector 9, Corporate Park',
    featured: false
  }
];
