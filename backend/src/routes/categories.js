import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// GET /categories
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({ message: 'Error fetching categories.' });
  }
});

// POST /categories
router.post('/', async (req, res) => {
  try {
    const { name, image } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    const trimmedName = name.trim();
    let catImage = image && image.trim() 
      ? image.trim() 
      : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&auto=format&fit=crop&q=80';

    let id = trimmedName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const [existing] = await pool.query('SELECT id FROM categories WHERE id = ? OR LOWER(name) = LOWER(?)', [id, trimmedName]);
    if (existing.length > 0) {
      return res.status(400).json({ message: `Category "${trimmedName}" already exists.` });
    }

    await pool.query('INSERT INTO categories (id, name, image) VALUES (?, ?, ?)', [id, trimmedName, catImage]);
    const [newCat] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    res.status(201).json(newCat[0]);
  } catch (err) {
    console.error('Add category error:', err);
    res.status(500).json({ message: 'Error adding category.' });
  }
});

// PUT /categories/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, image } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required.' });
    }

    const [existing] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: `Category not found with ID: ${id}` });
    }

    const oldName = existing[0].name;
    const newName = name.trim();
    const updatedImage = image && image.trim() ? image.trim() : existing[0].image;

    await pool.query('UPDATE categories SET name = ?, image = ? WHERE id = ?', [newName, updatedImage, id]);

    // Cascade update all food items that reference the old category name or id
    if (oldName.toLowerCase() !== newName.toLowerCase()) {
      await pool.query(
        'UPDATE food_items SET category = ? WHERE LOWER(TRIM(category)) = LOWER(TRIM(?)) OR LOWER(TRIM(category)) = LOWER(TRIM(?))',
        [newName, oldName, id]
      );
    }

    const [updated] = await pool.query('SELECT * FROM categories WHERE id = ?', [id]);
    res.json(updated[0]);
  } catch (err) {
    console.error('Update category error:', err);
    res.status(500).json({ message: 'Error updating category.' });
  }
});

// DELETE /categories/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Find category to get its ID and Name
    const [catRows] = await pool.query(
      'SELECT * FROM categories WHERE id = ? OR LOWER(TRIM(name)) = LOWER(TRIM(?)) OR LOWER(TRIM(id)) = LOWER(TRIM(?))',
      [id, id, id]
    );

    let catName = id;
    let targetId = id;
    if (catRows.length > 0) {
      catName = catRows[0].name;
      targetId = catRows[0].id;
    }

    // 2. Cascade delete all food items belonging to this category
    const [foodResult] = await pool.query(
      'DELETE FROM food_items WHERE LOWER(TRIM(category)) = LOWER(TRIM(?)) OR LOWER(TRIM(category)) = LOWER(TRIM(?)) OR category = ? OR category = ?',
      [catName, targetId, catName, targetId]
    );

    // 3. Delete the category itself
    const [catResult] = await pool.query(
      'DELETE FROM categories WHERE id = ? OR LOWER(TRIM(name)) = LOWER(TRIM(?)) OR LOWER(TRIM(id)) = LOWER(TRIM(?))',
      [targetId, catName, id]
    );

    if (catResult.affectedRows === 0 && foodResult.affectedRows === 0) {
      return res.status(404).json({ message: `Category not found with ID: ${id}` });
    }

    res.json({
      success: true,
      message: `Category "${catName}" and ${foodResult.affectedRows} associated food item(s) deleted successfully.`,
      deletedFoodsCount: foodResult.affectedRows,
    });
  } catch (err) {
    console.error('Delete category error:', err);
    res.status(500).json({ message: 'Error deleting category and its food items.' });
  }
});

export default router;
