import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

async function getFullOrder(orderRow) {
  const [items] = await pool.query(
    `SELECT oi.id, oi.quantity, oi.price,
            fi.id as food_id, fi.restaurant_id, fi.name as food_name,
            fi.price as food_price,
            fi.image as food_image, fi.rating as food_rating,
            fi.category as food_cat, fi.is_veg
     FROM order_items oi
     LEFT JOIN food_items fi ON oi.food_id = fi.id
     WHERE oi.order_id = ?`,
    [orderRow.id]
  );

  const formattedItems = items.map((item) => ({
    id: item.id,
    quantity: item.quantity,
    price: Number(item.price),
    foodItem: {
      id: item.food_id,
      restaurantId: item.restaurant_id,
      name: item.food_name || 'Food Item',
      description: '',
      price: Number(item.food_price || item.price),
      image: item.food_image || '',
      rating: Number(item.food_rating || 5.0),
      category: item.food_cat || '',
      isVeg: Boolean(item.is_veg),
    },
  }));

  return {
    id: orderRow.id,
    restaurantId: orderRow.restaurant_id,
    restaurantName: orderRow.restaurant_name || '',
    address: orderRow.address,
    subtotal: Number(orderRow.subtotal),
    deliveryFee: Number(orderRow.delivery_fee),
    tax: Number(orderRow.tax),
    total: Number(orderRow.total),
    paymentMethod: orderRow.payment_method || 'COD',
    status: orderRow.status || 'Pending',
    createdAt: orderRow.created_at,
    items: formattedItems,
  };
}

// GET /orders
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    const orders = await Promise.all(rows.map(getFullOrder));
    res.json(orders);
  } catch (err) {
    console.error('Get orders error:', err);
    res.status(500).json({ message: 'Error fetching orders.' });
  }
});

// POST /orders
router.post('/', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      restaurantId,
      restaurantName = 'Snake Exchange',
      address,
      items,
      subtotal,
      deliveryFee,
      tax,
      total,
      paymentMethod = 'COD',
    } = req.body;

    if (!restaurantId || !address || !items || !Array.isArray(items) || items.length === 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'restaurantId, address, and items are required.' });
    }

    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await connection.query(
      `INSERT INTO orders (id, restaurant_id, restaurant_name, address, subtotal, delivery_fee, tax, total, payment_method, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?)`,
      [orderId, restaurantId, restaurantName, address, Number(subtotal), Number(deliveryFee), Number(tax), Number(total), paymentMethod, now]
    );

    for (const item of items) {
      let foodId = item.foodId;
      const [foodRows] = await connection.query('SELECT price FROM food_items WHERE id = ?', [foodId]);
      let price = foodRows.length > 0 ? Number(foodRows[0].price) : (item.price ? Number(item.price) : 0);

      if (foodRows.length === 0) {
        const [anyFoods] = await connection.query('SELECT id, price FROM food_items LIMIT 1');
        if (anyFoods.length > 0) {
          foodId = anyFoods[0].id;
          if (!price) price = Number(anyFoods[0].price);
        }
      }

      await connection.query(
        `INSERT INTO order_items (order_id, food_id, quantity, price) VALUES (?, ?, ?, ?)`,
        [orderId, foodId, item.quantity, price]
      );
    }

    await connection.commit();
    res.status(201).json({ success: true, orderId });
  } catch (err) {
    await connection.rollback();
    console.error('Place order error:', err);
    res.status(500).json({ message: 'Error placing order.', error: err.message });
  } finally {
    connection.release();
  }
});

// PUT /orders/:id/status
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'status is required.' });
    }

    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: `Order not found with ID: ${id}` });
    }

    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    const [updatedRows] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
    const updatedOrder = await getFullOrder(updatedRows[0]);
    res.json(updatedOrder);
  } catch (err) {
    console.error('Update order status error:', err);
    res.status(500).json({ message: 'Error updating order status.' });
  }
});

export default router;
