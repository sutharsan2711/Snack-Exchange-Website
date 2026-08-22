import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const isSslRequired = process.env.DB_SSL === 'true' || 
  (process.env.DB_HOST && process.env.DB_HOST.includes('tidbcloud.com')) ||
  (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('tidbcloud.com'));

const poolConfig = process.env.DATABASE_URL
  ? {
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      connectTimeout: 10000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      ssl: isSslRequired ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } : undefined,
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'sutharsan',
      database: process.env.DB_NAME || 'foodie_db',
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      connectTimeout: 10000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      ssl: isSslRequired ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } : undefined,
    };

export const pool = mysql.createPool(poolConfig);

/**
 * Auto-initialize database tables and seed initial demo data
 */
export async function initDB() {
  const connection = await pool.getConnection();
  try {
    // 1. Create tables
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(100) NOT NULL,
        role VARCHAR(50) NOT NULL,
        phone VARCHAR(20),
        address VARCHAR(500),
        active BOOLEAN NOT NULL DEFAULT true
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        image VARCHAR(500)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS restaurants (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        image VARCHAR(500),
        rating DOUBLE DEFAULT 0,
        delivery_time INT DEFAULT 30,
        price_range VARCHAR(100),
        address VARCHAR(255),
        featured BOOLEAN NOT NULL DEFAULT false,
        is_open BOOLEAN NOT NULL DEFAULT true,
        show_banner BOOLEAN NOT NULL DEFAULT true,
        open_time VARCHAR(10) NOT NULL DEFAULT '15:00',
        close_time VARCHAR(10) NOT NULL DEFAULT '23:00',
        auto_schedule BOOLEAN NOT NULL DEFAULT true
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Ensure columns exist if table was previously created
    try {
      await connection.query(`ALTER TABLE restaurants ADD COLUMN is_open BOOLEAN NOT NULL DEFAULT true;`);
    } catch {
      // Column already exists
    }
    try {
      await connection.query(`ALTER TABLE restaurants ADD COLUMN show_banner BOOLEAN NOT NULL DEFAULT true;`);
    } catch {
      // Column already exists
    }
    try {
      await connection.query(`ALTER TABLE restaurants ADD COLUMN open_time VARCHAR(10) NOT NULL DEFAULT '15:00';`);
    } catch {
      // Column already exists
    }
    try {
      await connection.query(`ALTER TABLE restaurants ADD COLUMN close_time VARCHAR(10) NOT NULL DEFAULT '23:00';`);
    } catch {
      // Column already exists
    }
    try {
      await connection.query(`ALTER TABLE restaurants ADD COLUMN auto_schedule BOOLEAN NOT NULL DEFAULT true;`);
    } catch {
      // Column already exists
    }

    await connection.query(`
      CREATE TABLE IF NOT EXISTS restaurant_cuisines (
        restaurant_id VARCHAR(50) NOT NULL,
        cuisine VARCHAR(255) NOT NULL,
        PRIMARY KEY (restaurant_id, cuisine),
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS food_items (
        id VARCHAR(50) PRIMARY KEY,
        restaurant_id VARCHAR(50) NOT NULL,
        name VARCHAR(100) NOT NULL,
        description VARCHAR(500),
        price DOUBLE NOT NULL,
        image VARCHAR(500),
        rating DOUBLE DEFAULT 5.0,
        category VARCHAR(50),
        is_veg BOOLEAN NOT NULL DEFAULT true,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(50) PRIMARY KEY,
        restaurant_id VARCHAR(50) NOT NULL,
        restaurant_name VARCHAR(100),
        address VARCHAR(500) NOT NULL,
        subtotal DOUBLE NOT NULL,
        delivery_fee DOUBLE NOT NULL,
        tax DOUBLE NOT NULL,
        total DOUBLE NOT NULL,
        payment_method VARCHAR(50),
        status VARCHAR(50) DEFAULT 'Pending',
        created_at DATETIME NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        order_id VARCHAR(50) NOT NULL,
        food_id VARCHAR(50) NOT NULL,
        quantity INT NOT NULL,
        price DOUBLE NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (food_id) REFERENCES food_items(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Ensure order_items foreign keys have ON DELETE CASCADE
    try {
      const [foodFks] = await connection.query(`
        SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'order_items' 
        AND COLUMN_NAME = 'food_id' 
        AND REFERENCED_TABLE_NAME IS NOT NULL
      `);
      for (const fk of foodFks) {
        if (fk.CONSTRAINT_NAME !== 'fk_order_items_food') {
          await connection.query(`ALTER TABLE order_items DROP FOREIGN KEY \`${fk.CONSTRAINT_NAME}\``);
          await connection.query(`
            ALTER TABLE order_items 
            ADD CONSTRAINT fk_order_items_food 
            FOREIGN KEY (food_id) REFERENCES food_items(id) ON DELETE CASCADE
          `);
        }
      }

      const [orderFks] = await connection.query(`
        SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'order_items' 
        AND COLUMN_NAME = 'order_id' 
        AND REFERENCED_TABLE_NAME IS NOT NULL
      `);
      for (const fk of orderFks) {
        if (fk.CONSTRAINT_NAME !== 'fk_order_items_order') {
          await connection.query(`ALTER TABLE order_items DROP FOREIGN KEY \`${fk.CONSTRAINT_NAME}\``);
          await connection.query(`
            ALTER TABLE order_items 
            ADD CONSTRAINT fk_order_items_order 
            FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
          `);
        }
      }
    } catch (e) {
      console.warn('Foreign key cascade check note:', e.message);
    }

    // 2. Check if seeding is needed
    const [userRows] = await connection.query('SELECT COUNT(*) as count FROM users');
    if (userRows[0].count === 0) {
      console.log('🌱 Seeding initial user data...');
      await connection.query(`
        INSERT INTO users (name, email, password, role, phone, address, active) VALUES
        ('Store Manager', 'admin@snakeexchange.com', 'admin123', 'ADMIN', '+91 99999 88888', 'Admin Head Office, New Delhi', true),
        ('Alex Johnson', 'customer@example.com', 'customer123', 'CUSTOMER', '+91 98765 43210', '123 Main Street, Sector 4, New Delhi', true)
      `);
    }

    const [restRows] = await connection.query('SELECT COUNT(*) as count FROM restaurants');
    if (restRows[0].count === 0) {
      await connection.query(`
        INSERT INTO restaurants (id, name, image, rating, delivery_time, price_range, address, featured, is_open, show_banner) VALUES
        ('gourmet-bistro', 'Snack Exchange', '/hero.png', 4.8, 20, '₹150 for two', 'Shop No. 8, Meena Food Court, Vasantham Nagar, Thudiyalur Road, Saravanampatti, Coimbatore, Tamil Nadu 641035', true, true, true)
      `);

      const cuisines = ["Burgers", "Momos", "Fries", "Sandwiches", "Shakes", "Waffles", "Snacks", "Beverages"];
      for (const c of cuisines) {
        await connection.query(`INSERT INTO restaurant_cuisines (restaurant_id, cuisine) VALUES ('gourmet-bistro', ?)`, [c]);
      }
    }

    const [catRows] = await connection.query('SELECT COUNT(*) as count FROM categories');
    if (catRows[0].count === 0) {
      console.log('🌱 Seeding initial categories and menu items...');

      // Seed Categories
      await connection.query(`
        INSERT INTO categories (id, name, image) VALUES
        ('burger', 'Burger', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&auto=format&fit=crop&q=80'),
        ('pizza', 'Pizza', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=100&auto=format&fit=crop&q=80'),
        ('biryani', 'Biryani', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=100&auto=format&fit=crop&q=80'),
        ('chinese', 'Chinese', 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=100&auto=format&fit=crop&q=80'),
        ('south-indian', 'South Indian', 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=100&auto=format&fit=crop&q=80'),
        ('north-indian', 'North Indian', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=100&auto=format&fit=crop&q=80'),
        ('desserts', 'Desserts', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=100&auto=format&fit=crop&q=80'),
        ('drinks', 'Drinks', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=100&auto=format&fit=crop&q=80')
      `);

      // Seed Food Items
      const foods = [
        ['fb-1', 'gourmet-bistro', 'Chicken Burger', 'Juicy chicken patty, melted cheddar cheese, fresh lettuce, tomato, and house burger sauce.', 149.0, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80', 4.5, 'Burger', false],
        ['fb-2', 'gourmet-bistro', 'Cheese Burger', 'Classic grilled beef patty (mock) with double cheddar, sweet pickles, onions, mustard, and ketchup.', 179.0, 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80', 4.4, 'Burger', true],
        ['fb-3', 'gourmet-bistro', 'Veg Burger', 'Crispy potato patty with fresh lettuce, red onion, vine tomatoes, and creamy garlic mayonnaise.', 129.0, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80', 4.2, 'Burger', true],
        ['fb-4', 'gourmet-bistro', 'Onion Rings', 'Golden-fried breaded onion rings (8 pcs) served with smoky BBQ dip.', 89.0, 'https://images.unsplash.com/photo-1625938146369-adc83368bda7?w=600&auto=format&fit=crop&q=80', 4.0, 'Burger', true],
        ['fb-5', 'gourmet-bistro', 'Chicken Wings', 'Spicy barbecue glazed chicken wings (6 pcs) served with cool ranch dressing.', 199.0, 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80', 4.4, 'Burger', false],
        ['fp-1', 'gourmet-bistro', 'Margherita Pizza', 'Classic sourdough crust topped with rich tomato marinara, fresh mozzarella, extra virgin olive oil, and sweet basil.', 249.0, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&auto=format&fit=crop&q=80', 4.6, 'Pizza', true],
        ['fp-2', 'gourmet-bistro', 'Paneer Pizza', 'Spiced tandoori paneer cubes, diced capsicum, red onion, green chillies, and premium mozzarella cheese.', 229.0, 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600&auto=format&fit=crop&q=80', 4.3, 'Pizza', true],
        ['fp-3', 'gourmet-bistro', 'Chicken Pizza', 'Grilled BBQ chicken breast chunks, black olives, sliced jalapenos, and onions over rich marinara.', 299.0, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80', 4.5, 'Pizza', false],
        ['fp-4', 'gourmet-bistro', 'Garlic Bread with Cheese', 'Toasted artisan baguette slices rubbed with garlic butter and topped with melted mozzarella.', 119.0, 'https://images.unsplash.com/photo-1573145959956-e9fae6b8cd4e?w=600&auto=format&fit=crop&q=80', 4.3, 'Pizza', true],
        ['fp-5', 'gourmet-bistro', 'Veg Supreme Pizza', 'Loaded with button mushrooms, red onions, colorful bell peppers, sweet corn, black olives, and mozzarella.', 279.0, 'https://images.unsplash.com/photo-1571066811602-71683a3f680d?w=600&auto=format&fit=crop&q=80', 4.4, 'Pizza', true],
        ['fbir-1', 'gourmet-bistro', 'Chicken Biryani', 'Aromatic long-grain Basmati rice layered with marinated chicken, saffron, fried onions, and fresh mint.', 199.0, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80', 4.8, 'Biryani', false],
        ['fbir-2', 'gourmet-bistro', 'Mutton Biryani', 'Tender baby goat pieces cooked in rich spices, slow-dum styled with premium basmati rice and cardamoms.', 299.0, 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&auto=format&fit=crop&q=80', 4.9, 'Biryani', false],
        ['fbir-3', 'gourmet-bistro', 'Veg Dum Biryani', 'Seasonal fresh garden vegetables marinated in spiced yogurt and layered with aromatic basmati rice.', 159.0, 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=600&auto=format&fit=crop&q=80', 4.4, 'Biryani', true],
        ['fbir-4', 'gourmet-bistro', 'Chicken Tikka', 'Boneless chicken cubes marinated in tandoori spices and grilled over coal (6 pcs) with mint chutney.', 220.0, 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&auto=format&fit=crop&q=80', 4.6, 'Biryani', false],
        ['fbir-5', 'gourmet-bistro', 'Egg Biryani', 'Fragrant basmati biryani rice served with two hard-boiled eggs in spicy gravy.', 169.0, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80', 4.3, 'Biryani', false],
        ['fch-1', 'gourmet-bistro', 'Veg Noodles', 'Wok-tossed hakka noodles with julienned cabbage, carrots, bell peppers, and scallions in light soy sauce.', 159.0, 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80', 4.1, 'Chinese', true],
        ['fch-2', 'gourmet-bistro', 'Chicken Noodles', 'Wok-tossed noodles with shredded chicken breast, scrambled egg, vegetables, and savory oyster sauce.', 189.0, 'https://images.unsplash.com/photo-1612966608967-30a5b9ad11df?w=600&auto=format&fit=crop&q=80', 4.3, 'Chinese', false],
        ['fch-3', 'gourmet-bistro', 'Fried Rice', 'Steamed rice stir-fried in a hot wok with fresh vegetables, garlic, spring onions, and light soy sauce.', 169.0, 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80', 4.2, 'Chinese', true],
        ['fsi-1', 'gourmet-bistro', 'Masala Dosa', 'Golden, crispy rice and lentil crepe stuffed with spiced potato mash, served with piping hot Sambar and coconut-tomato chutneys.', 80.0, 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80', 4.7, 'South Indian', true],
        ['fsi-2', 'gourmet-bistro', 'Steam Idli', 'Super soft, fluffy steamed rice-lentil cakes (2 pcs) served with traditional sambar and creamy coconut chutney.', 60.0, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80', 4.5, 'South Indian', true],
        ['fsi-3', 'gourmet-bistro', 'Onion Uttapam', 'Thick savory pancake topped with finely chopped red onions, green chillies, cilantro, and brushed with ghee.', 90.0, 'https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=600&auto=format&fit=crop&q=80', 4.5, 'South Indian', true],
        ['fsi-4', 'gourmet-bistro', 'Vada', 'Crispy deep-fried lentil donuts (2 pcs) flavored with black pepper and ginger, served with fresh coconut chutney.', 60.0, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80', 4.4, 'South Indian', true],
        ['fni-1', 'gourmet-bistro', 'Paneer Butter Masala', 'Fresh cottage cheese cubes cooked in a velvety tomato-cream gravy with mild Indian spices.', 220.0, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80', 4.5, 'North Indian', true],
        ['fni-2', 'gourmet-bistro', 'Butter Naan', 'Classic Indian flatbread made of refined flour, baked inside a clay tandoor and generousy glazed with fresh butter.', 40.0, 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop&q=80', 4.6, 'North Indian', true],
        ['fni-3', 'gourmet-bistro', 'Dal Makhani', 'Creamy black lentils and red kidney beans, simmered overnight with butter, cream, and warm spices.', 180.0, 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80', 4.5, 'North Indian', true],
        ['fni-4', 'gourmet-bistro', 'Kadhai Chicken', 'Spicy and flavorful chicken pieces tossed with thick bell peppers, onions, tomatoes, and freshly ground kadhai masala.', 260.0, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80', 4.4, 'North Indian', false],
        ['fde-1', 'gourmet-bistro', 'Chocolate Cake', 'Fudge-filled double-deck chocolate sponge cake slice, topped with rich chocolate ganache.', 129.0, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80', 4.6, 'Desserts', true],
        ['fde-2', 'gourmet-bistro', 'Ice Cream', 'Premium double scoop ice cream. Choose from Madagascan Vanilla, Dark Belgian Chocolate, or Alphonso Mango.', 99.0, 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&auto=format&fit=crop&q=80', 4.4, 'Desserts', true],
        ['fde-3', 'gourmet-bistro', 'Waffle with Maple Syrup', 'Crisp, golden Belgian waffle dusted with powdered sugar and drizzled with maple syrup.', 149.0, 'https://images.unsplash.com/photo-1562376502-6f769499c886?w=600&auto=format&fit=crop&q=80', 4.5, 'Desserts', true],
        ['fdr-1', 'gourmet-bistro', 'Fresh Lime Soda', 'Zesty fresh key lime juice blended with soda water. Choice of Sweet, Salted, or Mixed.', 79.0, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80', 4.1, 'Drinks', true],
        ['fdr-2', 'gourmet-bistro', 'Mango Juice', 'Thick, sweet, fresh pulp juice made from choice sun-ripened Alphonso mangoes.', 99.0, 'https://images.unsplash.com/photo-1546173159-315724a31696?w=600&auto=format&fit=crop&q=80', 4.5, 'Drinks', true],
        ['fdr-3', 'gourmet-bistro', 'Cold Coffee', 'Classic double-shot espresso blended with chilled milk, sugar, and topped with a scoop of vanilla ice cream.', 119.0, 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80', 4.6, 'Drinks', true],
        ['fdr-4', 'gourmet-bistro', 'Iced Peach Tea', 'Chilled black tea infused with sweet peach syrup, sliced peaches, and fresh mint leaves.', 89.0, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=80', 4.2, 'Drinks', true],
        ['fh-1', 'gourmet-bistro', 'Caesar Salad', 'Crisp romaine lettuce tossed in caesar dressing, garlic herb croutons, and grated parmesan cheese.', 179.0, 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=600&auto=format&fit=crop&q=80', 4.3, 'Salads', true],
        ['fh-2', 'gourmet-bistro', 'Avocado Salad', 'Diced avocado, cucumbers, cherry tomatoes, and red onions with a simple lemon-olive oil dressing.', 219.0, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80', 4.5, 'Salads', true]
      ];

      for (const f of foods) {
        await connection.query(
          `INSERT INTO food_items (id, restaurant_id, name, description, price, image, rating, category, is_veg) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          f
        );
      }
      console.log('✅ Categories and Menu items seeded successfully!');
    }
  } catch (err) {
    console.error('Error during database initialization:', err);
    throw err;
  } finally {
    connection.release();
  }
}
