import { pool } from './src/db.js';

async function addVegCrunch() {
  const connection = await pool.getConnection();
  try {
    // 1. Insert Category 'Veg Crunch'
    await connection.query(`
      INSERT INTO categories (id, name, image) 
      VALUES ('veg-crunch', 'Veg Crunch', 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=100&auto=format&fit=crop&q=80')
      ON DUPLICATE KEY UPDATE name = 'Veg Crunch';
    `);

    const restaurantId = 'gourmet-bistro';
    const items = [
      { id: 'fvc-1', name: 'Veg Nuggets', desc: 'Crispy golden fried vegetable nuggets made with mixed veggies and herbs.', price: 89.0, img: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80', isVeg: true },
      { id: 'fvc-2', name: 'Onion Rings', desc: 'Golden-fried crispy breaded onion rings served with delicious dip.', price: 89.0, img: 'https://images.unsplash.com/photo-1639024471283-2bc7b3c6a267?w=600&auto=format&fit=crop&q=80', isVeg: true },
      { id: 'fvc-3', name: 'Veg Fingers', desc: 'Crispy crumb-coated spiced vegetable fingers fried to golden perfection.', price: 89.0, img: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&auto=format&fit=crop&q=80', isVeg: true },
      { id: 'fvc-4', name: 'Smiley Nuggets', desc: 'Fun, golden crispy potato smiley nuggets loved by all ages.', price: 89.0, img: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80', isVeg: true },
      { id: 'fvc-5', name: 'Veg Spring Roll', desc: 'Crispy fried rolls packed with spiced vegetables and savory filling.', price: 89.0, img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80', isVeg: true },
      { id: 'fvc-6', name: 'Chicken Corn Nuggets', desc: 'Crispy golden nuggets filled with juicy chicken and sweet golden corn.', price: 89.0, img: 'https://images.unsplash.com/photo-1562967916-08ffb553c6a7?w=600&auto=format&fit=crop&q=80', isVeg: false },
      { id: 'fvc-7', name: 'Cheese Corn Nuggets', desc: 'Melt-in-mouth cheesy nuggets loaded with sweet corn kernels inside a crunchy crust.', price: 89.0, img: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80', isVeg: true },
      { id: 'fvc-8', name: 'Mozzarella Stix', desc: 'Crispy breaded mozzarella cheese sticks with an irresistible stretchy cheese pull.', price: 89.0, img: 'https://images.unsplash.com/photo-1531749668029-2db88e4276c7?w=600&auto=format&fit=crop&q=80', isVeg: true },
      { id: 'fvc-9', name: 'Mozzarella Crisp Cheese', desc: 'Crunchy golden bites stuffed with rich mozzarella cheese and seasoning.', price: 89.0, img: 'https://images.unsplash.com/photo-1548940740-204726a19be3?w=600&auto=format&fit=crop&q=80', isVeg: true },
      { id: 'fvc-10', name: 'Cheese Jalapeno Poppers', desc: 'Spicy diced jalapenos blended with melted cheese inside a crunchy coating.', price: 89.0, img: 'https://images.unsplash.com/photo-1585325701165-351af916e581?w=600&auto=format&fit=crop&q=80', isVeg: true },
      { id: 'fvc-11', name: 'Paneer Spring Roll', desc: 'Crispy golden rolls stuffed with seasoned fresh paneer and vegetables.', price: 89.0, img: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80', isVeg: true },
      { id: 'fvc-12', name: 'Popcorn Fries', desc: 'Bite-sized crunchy potato popcorn fries seasoned with savory spices.', price: 89.0, img: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80', isVeg: true },
      { id: 'fvc-13', name: 'Crispy Veggie Bites', desc: 'Delectable crispy bites made from fresh garden vegetables and aromatic spices.', price: 89.0, img: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&auto=format&fit=crop&q=80', isVeg: true },
    ];

    for (const item of items) {
      await connection.query(`
        INSERT INTO food_items (id, restaurant_id, name, description, price, image, rating, category, is_veg)
        VALUES (?, ?, ?, ?, ?, ?, 4.5, 'Veg Crunch', ?)
        ON DUPLICATE KEY UPDATE 
          name = VALUES(name),
          description = VALUES(description),
          price = VALUES(price),
          image = VALUES(image),
          category = VALUES(category),
          is_veg = VALUES(is_veg)
      `, [item.id, restaurantId, item.name, item.desc, item.price, item.img, item.isVeg ? 1 : 0]);
    }

    console.log('✅ Successfully added all 13 Veg Crunch menu items to the database!');
  } catch (err) {
    console.error('Error inserting Veg Crunch items:', err);
  } finally {
    connection.release();
    process.exit(0);
  }
}

addVegCrunch();
