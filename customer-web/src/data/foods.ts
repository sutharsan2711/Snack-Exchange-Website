import type { FoodItem } from '../types/food';


export const foods: FoodItem[] = [
  // Burger House (burger-house)
  {
    id: 'fb-1',
    restaurantId: 'burger-house',
    name: 'Chicken Burger',
    description: 'Juicy chicken patty, melted cheddar cheese, fresh lettuce, tomato, and house burger sauce.',
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
    description: 'Classic grilled beef patty (mock) with double cheddar, sweet pickles, onions, mustard, and ketchup.',
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
    description: 'Crispy mixed veg patty, fresh lettuce, red onion, vine tomatoes, and creamy garlic mayonnaise.',
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
    description: 'Golden-fried breaded onion rings (8 pcs) served with smoky BBQ dip.',
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
    description: 'Spicy barbecue glazed chicken wings (6 pcs) served with cool ranch dressing.',
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
    description: 'Classic sourdough crust topped with rich tomato marinara, fresh mozzarella, extra virgin olive oil, and sweet basil.',
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
    description: 'Spiced tandoori paneer cubes, diced capsicum, red onion, green chillies, and premium mozzarella cheese.',
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
    description: 'Grilled BBQ chicken breast chunks, black olives, sliced jalapenos, and onions over rich marinara.',
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
    description: 'Toasted artisan baguette slices rubbed with garlic butter and topped with melted mozzarella.',
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
    description: 'Loaded with button mushrooms, red onions, colorful bell peppers, sweet corn, black olives, and mozzarella.',
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
    description: 'Aromatic long-grain Basmati rice layered with marinated chicken, saffron, fried onions, and fresh mint.',
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
    description: 'Tender baby goat pieces cooked in rich spices, slow-dum styled with premium basmati rice and cardamoms.',
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
    description: 'Seasonal fresh garden vegetables marinated in spiced yogurt and layered with aromatic basmati rice.',
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
    description: 'Boneless chicken cubes marinated in tandoori spices and grilled over coal (6 pcs) with mint chutney.',
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
    description: 'Fragrant basmati biryani rice served with two hard-boiled eggs in spicy gravy.',
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
    description: 'Wok-tossed hakka noodles with julienned cabbage, carrots, bell peppers, and scallions in light soy sauce.',
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
    description: 'Wok-tossed noodles with shredded chicken breast, scrambled egg, vegetables, and savory oyster sauce.',
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
    description: 'Steamed rice stir-fried in a hot wok with fresh vegetables, garlic, spring onions, and light soy sauce.',
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
    description: 'Golden, crispy rice and lentil crepe stuffed with spiced potato mash, served with piping hot Sambar and coconut-tomato chutneys.',
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
    description: 'Super soft, fluffy steamed rice-lentil cakes (2 pcs) served with traditional sambar and creamy coconut chutney.',
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
    description: 'Thick savory pancake topped with finely chopped red onions, green chillies, cilantro, and brushed with ghee.',
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
    description: 'Crispy deep-fried lentil donuts (2 pcs) flavored with black pepper and ginger, served with fresh coconut chutney.',
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
    description: 'Fresh cottage cheese cubes cooked in a velvety tomato-cream gravy with mild Indian spices.',
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
    description: 'Classic Indian flatbread made of refined flour, baked inside a clay tandoor and generousy glazed with fresh butter.',
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
    description: 'Creamy black lentils and red kidney beans, simmered overnight with butter, cream, and warm spices.',
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
    description: 'Spicy and flavorful chicken pieces tossed with thick bell peppers, onions, tomatoes, and freshly ground kadhai masala.',
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
    description: 'Fudge-filled double-deck chocolate sponge cake slice, topped with rich chocolate ganache.',
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
    description: 'Premium double scoop ice cream. Choose from Madagascan Vanilla, Dark Belgian Chocolate, or Alphonso Mango.',
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
    description: 'Crisp, golden Belgian waffle dusted with powdered sugar and drizzled with maple syrup.',
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
    description: 'Zesty fresh key lime juice blended with soda water. Choice of Sweet, Salted, or Mixed.',
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
    description: 'Thick, sweet, fresh pulp juice made from choice sun-ripened Alphonso mangoes.',
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
    description: 'Classic double-shot espresso blended with chilled milk, sugar, and topped with a scoop of vanilla ice cream.',
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
    description: 'Chilled black tea infused with sweet peach syrup, sliced peaches, and fresh mint leaves.',
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
    description: 'Crisp romaine lettuce tossed in caesar dressing, garlic herb croutons, and grated parmesan cheese.',
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
    description: 'Diced avocado, cucumbers, cherry tomatoes, and red onions with a simple lemon-olive oil dressing.',
    price: 219,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
    rating: 4.5,
    category: 'North Indian',
    isVeg: true
  }
];
