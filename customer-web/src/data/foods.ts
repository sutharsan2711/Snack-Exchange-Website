import type { FoodItem } from '../types/food';


export const foods: FoodItem[] = [
  // Burger House (burger-house)
  {
    id: 'fb-1',
    restaurantId: 'burger-house',
    name: 'Chicken Burger',
    price: 149,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    rating: 4.5,
    category: 'Burger',
    isVeg: false
  },
  {
    id: 'fb-2',
    restaurantId: 'burger-house',
    name: 'Cheese Burger',
    price: 179,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
    rating: 4.4,
    category: 'Burger',
    isVeg: true
  },
  {
    id: 'fb-3',
    restaurantId: 'burger-house',
    name: 'Veg Burger',
    price: 129,
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80',
    rating: 4.2,
    category: 'Burger',
    isVeg: true
  },
  {
    id: 'fb-4',
    restaurantId: 'burger-house',
    name: 'Onion Rings',
    price: 89,
    image: 'https://images.unsplash.com/photo-1639024471283-2bc7b3c6a267?w=600&auto=format&fit=crop&q=80',
    rating: 4.0,
    category: 'Burger',
    isVeg: true
  },
  {
    id: 'fb-5',
    restaurantId: 'burger-house',
    name: 'Chicken Wings',
    price: 199,
    image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80',
    rating: 4.4,
    category: 'Burger',
    isVeg: false
  },

  // Pizza Corner (pizza-corner)
  {
    id: 'fp-1',
    restaurantId: 'pizza-corner',
    name: 'Margherita Pizza',
    price: 249,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&auto=format&fit=crop&q=80',
    rating: 4.6,
    category: 'Pizza',
    isVeg: true
  },
  {
    id: 'fp-2',
    restaurantId: 'pizza-corner',
    name: 'Paneer Pizza',
    price: 229,
    image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600&auto=format&fit=crop&q=80',
    rating: 4.3,
    category: 'Pizza',
    isVeg: true
  },
  {
    id: 'fp-3',
    restaurantId: 'pizza-corner',
    name: 'Chicken Pizza',
    price: 299,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
    rating: 4.5,
    category: 'Pizza',
    isVeg: false
  },
  {
    id: 'fp-4',
    restaurantId: 'pizza-corner',
    name: 'Garlic Bread with Cheese',
    price: 119,
    image: 'https://images.unsplash.com/photo-1573145959956-e9fae6b8cd4e?w=600&auto=format&fit=crop&q=80',
    rating: 4.3,
    category: 'Pizza',
    isVeg: true
  },
  {
    id: 'fp-5',
    restaurantId: 'pizza-corner',
    name: 'Veg Supreme Pizza',
    price: 279,
    image: 'https://images.unsplash.com/photo-1571066811602-71683a3f680d?w=600&auto=format&fit=crop&q=80',
    rating: 4.4,
    category: 'Pizza',
    isVeg: true
  },

  // Royal Biryani (royal-biryani)
  {
    id: 'fbir-1',
    restaurantId: 'royal-biryani',
    name: 'Chicken Biryani',
    price: 199,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
    rating: 4.8,
    category: 'Biryani',
    isVeg: false
  },
  {
    id: 'fbir-2',
    restaurantId: 'royal-biryani',
    name: 'Mutton Biryani',
    price: 299,
    image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&auto=format&fit=crop&q=80',
    rating: 4.9,
    category: 'Biryani',
    isVeg: false
  },
  {
    id: 'fbir-3',
    restaurantId: 'royal-biryani',
    name: 'Veg Dum Biryani',
    price: 159,
    image: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&auto=format&fit=crop&q=80',
    rating: 4.4,
    category: 'Biryani',
    isVeg: true
  },
  {
    id: 'fbir-4',
    restaurantId: 'royal-biryani',
    name: 'Chicken Tikka',
    price: 220,
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&auto=format&fit=crop&q=80',
    rating: 4.6,
    category: 'Biryani',
    isVeg: false
  },
  {
    id: 'fbir-5',
    restaurantId: 'royal-biryani',
    name: 'Egg Biryani',
    price: 169,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
    rating: 4.3,
    category: 'Biryani',
    isVeg: false
  },

  // Wok Express (wok-express)
  {
    id: 'fch-1',
    restaurantId: 'wok-express',
    name: 'Veg Noodles',
    price: 159,
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80',
    rating: 4.1,
    category: 'Chinese',
    isVeg: true
  },
  {
    id: 'fch-2',
    restaurantId: 'wok-express',
    name: 'Chicken Noodles',
    price: 189,
    image: 'https://images.unsplash.com/photo-1612966608967-30a5b9ad11df?w=600&auto=format&fit=crop&q=80',
    rating: 4.3,
    category: 'Chinese',
    isVeg: false
  },
  {
    id: 'fch-3',
    restaurantId: 'wok-express',
    name: 'Fried Rice',
    price: 169,
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80',
    rating: 4.2,
    category: 'Chinese',
    isVeg: true
  },

  // South Indian Kitchen (south-kitchen)
  {
    id: 'fsi-1',
    restaurantId: 'south-kitchen',
    name: 'Masala Dosa',
    price: 80,
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80',
    rating: 4.7,
    category: 'South Indian',
    isVeg: true
  },
  {
    id: 'fsi-2',
    restaurantId: 'south-kitchen',
    name: 'Steam Idli',
    price: 60,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
    rating: 4.5,
    category: 'South Indian',
    isVeg: true
  },
  {
    id: 'fsi-3',
    restaurantId: 'south-kitchen',
    name: 'Onion Uttapam',
    price: 90,
    image: 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=600&auto=format&fit=crop&q=80',
    rating: 4.5,
    category: 'South Indian',
    isVeg: true
  },
  {
    id: 'fsi-4',
    restaurantId: 'south-kitchen',
    name: 'Vada',
    price: 60,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
    rating: 4.4,
    category: 'South Indian',
    isVeg: true
  },

  // Spice Kitchen (spice-kitchen)
  {
    id: 'fni-1',
    restaurantId: 'spice-kitchen',
    name: 'Paneer Butter Masala',
    price: 220,
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80',
    rating: 4.5,
    category: 'North Indian',
    isVeg: true
  },
  {
    id: 'fni-2',
    restaurantId: 'spice-kitchen',
    name: 'Butter Naan',
    price: 40,
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop&q=80',
    rating: 4.6,
    category: 'North Indian',
    isVeg: true
  },
  {
    id: 'fni-3',
    restaurantId: 'spice-kitchen',
    name: 'Dal Makhani',
    price: 180,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
    rating: 4.5,
    category: 'North Indian',
    isVeg: true
  },
  {
    id: 'fni-4',
    restaurantId: 'spice-kitchen',
    name: 'Kadhai Chicken',
    price: 260,
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80',
    rating: 4.4,
    category: 'North Indian',
    isVeg: false
  },

  // Sweet Treats (sweet-treats)
  {
    id: 'fde-1',
    restaurantId: 'sweet-treats',
    name: 'Chocolate Cake',
    price: 129,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80',
    rating: 4.6,
    category: 'Desserts',
    isVeg: true
  },
  {
    id: 'fde-2',
    restaurantId: 'sweet-treats',
    name: 'Ice Cream',
    price: 99,
    image: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&auto=format&fit=crop&q=80',
    rating: 4.4,
    category: 'Desserts',
    isVeg: true
  },
  {
    id: 'fde-3',
    restaurantId: 'sweet-treats',
    name: 'Waffle with Maple Syrup',
    price: 149,
    image: 'https://images.unsplash.com/photo-1562376502-6f769499c886?w=600&auto=format&fit=crop&q=80',
    rating: 4.5,
    category: 'Desserts',
    isVeg: true
  },

  // Cafe Coffee & Drinks (cafe-coffee)
  {
    id: 'fdr-1',
    restaurantId: 'cafe-coffee',
    name: 'Fresh Lime Soda',
    price: 79,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
    rating: 4.1,
    category: 'Drinks',
    isVeg: true
  },
  {
    id: 'fdr-2',
    restaurantId: 'cafe-coffee',
    name: 'Mango Juice',
    price: 99,
    image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=600&auto=format&fit=crop&q=80',
    rating: 4.5,
    category: 'Drinks',
    isVeg: true
  },
  {
    id: 'fdr-3',
    restaurantId: 'cafe-coffee',
    name: 'Cold Coffee',
    price: 119,
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80',
    rating: 4.6,
    category: 'Drinks',
    isVeg: true
  },
  {
    id: 'fdr-4',
    restaurantId: 'cafe-coffee',
    name: 'Iced Peach Tea',
    price: 89,
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=80',
    rating: 4.2,
    category: 'Drinks',
    isVeg: true
  },

  // Healthy Greens (healthy-greens)
  {
    id: 'fh-1',
    restaurantId: 'healthy-greens',
    name: 'Caesar Salad',
    price: 179,
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=600&auto=format&fit=crop&q=80',
    rating: 4.3,
    category: 'North Indian', // Will match when salad filters or text search is run
    isVeg: true
  },
  {
    id: 'fh-2',
    restaurantId: 'healthy-greens',
    name: 'Avocado Salad',
    price: 219,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
    rating: 4.5,
    category: 'North Indian',
    isVeg: true
  },

  // Veg Crunch
  {
    id: 'fvc-1',
    restaurantId: 'gourmet-bistro',
    name: 'Veg Nuggets',
    price: 89,
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80',
    rating: 4.5,
    category: 'Veg Crunch',
    isVeg: true
  },
  {
    id: 'fvc-2',
    restaurantId: 'gourmet-bistro',
    name: 'Onion Rings',
    price: 89,
    image: 'https://images.unsplash.com/photo-1639024471283-2bc7b3c6a267?w=600&auto=format&fit=crop&q=80',
    rating: 4.5,
    category: 'Veg Crunch',
    isVeg: true
  },
  {
    id: 'fvc-3',
    restaurantId: 'gourmet-bistro',
    name: 'Veg Fingers',
    price: 89,
    image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&auto=format&fit=crop&q=80',
    rating: 4.5,
    category: 'Veg Crunch',
    isVeg: true
  },
  {
    id: 'fvc-4',
    restaurantId: 'gourmet-bistro',
    name: 'Smiley Nuggets',
    price: 89,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80',
    rating: 4.5,
    category: 'Veg Crunch',
    isVeg: true
  },
  {
    id: 'fvc-5',
    restaurantId: 'gourmet-bistro',
    name: 'Veg Spring Roll',
    price: 89,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    rating: 4.5,
    category: 'Veg Crunch',
    isVeg: true
  },
  {
    id: 'fvc-6',
    restaurantId: 'gourmet-bistro',
    name: 'Chicken Corn Nuggets',
    price: 89,
    image: 'https://images.unsplash.com/photo-1562967916-08ffb553c6a7?w=600&auto=format&fit=crop&q=80',
    rating: 4.5,
    category: 'Veg Crunch',
    isVeg: false
  },
  {
    id: 'fvc-7',
    restaurantId: 'gourmet-bistro',
    name: 'Cheese Corn Nuggets',
    price: 89,
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80',
    rating: 4.5,
    category: 'Veg Crunch',
    isVeg: true
  },
  {
    id: 'fvc-8',
    restaurantId: 'gourmet-bistro',
    name: 'Mozzarella Stix',
    price: 89,
    image: 'https://images.unsplash.com/photo-1531749668029-2db88e4276c7?w=600&auto=format&fit=crop&q=80',
    rating: 4.5,
    category: 'Veg Crunch',
    isVeg: true
  },
  {
    id: 'fvc-9',
    restaurantId: 'gourmet-bistro',
    name: 'Mozzarella Crisp Cheese',
    price: 89,
    image: 'https://images.unsplash.com/photo-1548940740-204726a19be3?w=600&auto=format&fit=crop&q=80',
    rating: 4.5,
    category: 'Veg Crunch',
    isVeg: true
  },
  {
    id: 'fvc-10',
    restaurantId: 'gourmet-bistro',
    name: 'Cheese Jalapeno Poppers',
    price: 89,
    image: 'https://images.unsplash.com/photo-1585325701165-351af916e581?w=600&auto=format&fit=crop&q=80',
    rating: 4.5,
    category: 'Veg Crunch',
    isVeg: true
  },
  {
    id: 'fvc-11',
    restaurantId: 'gourmet-bistro',
    name: 'Paneer Spring Roll',
    price: 89,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    rating: 4.5,
    category: 'Veg Crunch',
    isVeg: true
  },
  {
    id: 'fvc-12',
    restaurantId: 'gourmet-bistro',
    name: 'Popcorn Fries',
    price: 89,
    image: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80',
    rating: 4.5,
    category: 'Veg Crunch',
    isVeg: true
  },
  {
    id: 'fvc-13',
    restaurantId: 'gourmet-bistro',
    name: 'Crispy Veggie Bites',
    price: 89,
    image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&auto=format&fit=crop&q=80',
    rating: 4.5,
    category: 'Veg Crunch',
    isVeg: true
  }
];
