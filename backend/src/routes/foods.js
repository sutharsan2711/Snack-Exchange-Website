import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

function cleanImageUrl(url) {
  if (!url) return '';
  return String(url).replace(/,e_grayscale/g, '').replace(/e_grayscale,/g, '').replace(/e_grayscale/g, '');
}

function formatFood(row) {
  return {
    id: row.id,
    restaurantId: row.restaurant_id,
    name: row.name,
    description: row.description || '',
    price: Number(row.price),
    image: cleanImageUrl(row.image),
    rating: Number(row.rating || 5.0),
    category: row.category || '',
    isVeg: Boolean(row.is_veg),
  };
}

// GET /foods
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM food_items ORDER BY id ASC');
    res.json(rows.map(formatFood));
  } catch (err) {
    console.error('Get foods error:', err);
    res.status(500).json({ message: 'Error fetching food items.' });
  }
});

// POST /foods
router.post('/', async (req, res) => {
  try {
    const { name, description, price, image, rating = 5.0, category, isVeg = true, restaurantId = 'gourmet-bistro' } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ message: 'Name and price are required.' });
    }

    const id = `f-${Date.now()}`;
    await pool.query(
      `INSERT INTO food_items (id, restaurant_id, name, description, price, image, rating, category, is_veg)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, restaurantId, name, description || '', Number(price), image || '', Number(rating), category || '', isVeg ? 1 : 0]
    );

    const [rows] = await pool.query('SELECT * FROM food_items WHERE id = ?', [id]);
    res.status(201).json(formatFood(rows[0]));
  } catch (err) {
    console.error('Add food error:', err);
    res.status(500).json({ message: 'Error adding food item.' });
  }
});

// PUT /foods/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image, rating, category, isVeg } = req.body;

    const [existing] = await pool.query('SELECT * FROM food_items WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: `Food item not found with ID: ${id}` });
    }

    const current = existing[0];
    const updatedName = name !== undefined ? name : current.name;
    const updatedDesc = description !== undefined ? description : current.description;
    const updatedPrice = price !== undefined ? Number(price) : current.price;
    const updatedImage = image !== undefined ? image : current.image;
    const updatedRating = rating !== undefined ? Number(rating) : current.rating;
    const updatedCategory = category !== undefined ? category : current.category;
    const updatedIsVeg = isVeg !== undefined ? (isVeg ? 1 : 0) : current.is_veg;

    await pool.query(
      `UPDATE food_items 
       SET name = ?, description = ?, price = ?, image = ?, rating = ?, category = ?, is_veg = ?
       WHERE id = ?`,
      [updatedName, updatedDesc, updatedPrice, updatedImage, updatedRating, updatedCategory, updatedIsVeg, id]
    );

    const [rows] = await pool.query('SELECT * FROM food_items WHERE id = ?', [id]);
    res.json(formatFood(rows[0]));
  } catch (err) {
    console.error('Update food error:', err);
    res.status(500).json({ message: 'Error updating food item.' });
  }
});

// DELETE /foods/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM food_items WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: `Food item not found with ID: ${id}` });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Delete food error:', err);
    res.status(500).json({ message: 'Error deleting food item.' });
  }
});

export default router;
