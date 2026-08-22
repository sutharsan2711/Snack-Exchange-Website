import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

function isWithinOperatingHours(openTime = '15:00', closeTime = '23:00') {
  try {
    const now = new Date();
    // Calculate IST time (UTC + 5 hours 30 mins)
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const istTime = new Date(utcTime + (5.5 * 3600000));
    const currentMinutes = istTime.getHours() * 60 + istTime.getMinutes();

    const [openH, openM] = (openTime || '15:00').split(':').map(Number);
    const [closeH, closeM] = (closeTime || '23:00').split(':').map(Number);

    const openMinutes = (openH || 0) * 60 + (openM || 0);
    const closeMinutes = (closeH || 0) * 60 + (closeM || 0);

    if (openMinutes <= closeMinutes) {
      return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
    } else {
      // Overnight hours (e.g. 18:00 to 02:00)
      return currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
    }
  } catch (e) {
    return true;
  }
}

async function getRestaurantWithCuisines(restaurantRow) {
  const [cuisines] = await pool.query(
    'SELECT cuisine FROM restaurant_cuisines WHERE restaurant_id = ?',
    [restaurantRow.id]
  );

  const openTime = restaurantRow.open_time || '15:00';
  const closeTime = restaurantRow.close_time || '23:00';
  const autoSchedule = restaurantRow.auto_schedule !== undefined ? Boolean(restaurantRow.auto_schedule) : true;
  const manualIsOpen = restaurantRow.is_open !== undefined ? Boolean(restaurantRow.is_open) : true;

  // If autoSchedule is enabled, determine open status from time; otherwise use manual override
  const effectiveIsOpen = autoSchedule ? isWithinOperatingHours(openTime, closeTime) : manualIsOpen;

  return {
    id: restaurantRow.id,
    name: restaurantRow.name,
    image: restaurantRow.image || '',
    rating: Number(restaurantRow.rating || 0),
    cuisines: cuisines.map((c) => c.cuisine),
    deliveryTime: Number(restaurantRow.delivery_time || 30),
    priceRange: restaurantRow.price_range || '',
    address: restaurantRow.address || '',
    featured: Boolean(restaurantRow.featured),
    isOpen: effectiveIsOpen,
    manualIsOpen,
    autoSchedule,
    openTime,
    closeTime,
    showBanner: restaurantRow.show_banner !== undefined ? Boolean(restaurantRow.show_banner) : true,
  };
}

// GET /restaurants
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM restaurants');
    const results = await Promise.all(rows.map(getRestaurantWithCuisines));
    res.json(results);
  } catch (err) {
    console.error('Get restaurants error:', err);
    res.status(500).json({ message: 'Error fetching restaurants.' });
  }
});

// GET /restaurants/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM restaurants WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: `Restaurant not found with ID: ${id}` });
    }
    const result = await getRestaurantWithCuisines(rows[0]);
    res.json(result);
  } catch (err) {
    console.error('Get restaurant error:', err);
    res.status(500).json({ message: 'Error fetching restaurant details.' });
  }
});

// PUT /restaurants/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      image,
      address,
      deliveryTime,
      priceRange,
      rating,
      cuisines,
      featured,
      isOpen,
      showBanner,
      openTime,
      closeTime,
      autoSchedule,
    } = req.body;

    const [existing] = await pool.query('SELECT * FROM restaurants WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: `Restaurant not found with ID: ${id}` });
    }

    const current = existing[0];
    const updatedName = name !== undefined ? name : current.name;
    const updatedImage = image !== undefined ? image : current.image;
    const updatedAddress = address !== undefined ? address : current.address;
    const updatedDeliveryTime = deliveryTime !== undefined ? Number(deliveryTime) : current.delivery_time;
    const updatedPriceRange = priceRange !== undefined ? priceRange : current.price_range;
    const updatedRating = rating !== undefined ? Number(rating) : current.rating;
    const updatedFeatured = featured !== undefined ? (featured ? 1 : 0) : current.featured;
    const updatedIsOpen = isOpen !== undefined ? (isOpen ? 1 : 0) : (current.is_open !== undefined ? current.is_open : 1);
    const updatedShowBanner = showBanner !== undefined ? (showBanner ? 1 : 0) : (current.show_banner !== undefined ? current.show_banner : 1);
    const updatedOpenTime = openTime !== undefined ? openTime : (current.open_time || '15:00');
    const updatedCloseTime = closeTime !== undefined ? closeTime : (current.close_time || '23:00');
    const updatedAutoSchedule = autoSchedule !== undefined ? (autoSchedule ? 1 : 0) : (current.auto_schedule !== undefined ? current.auto_schedule : 1);

    await pool.query(
      `UPDATE restaurants 
       SET name = ?, image = ?, address = ?, delivery_time = ?, price_range = ?, rating = ?, featured = ?, is_open = ?, show_banner = ?, open_time = ?, close_time = ?, auto_schedule = ?
       WHERE id = ?`,
      [
        updatedName,
        updatedImage,
        updatedAddress,
        updatedDeliveryTime,
        updatedPriceRange,
        updatedRating,
        updatedFeatured,
        updatedIsOpen,
        updatedShowBanner,
        updatedOpenTime,
        updatedCloseTime,
        updatedAutoSchedule,
        id,
      ]
    );

    if (Array.isArray(cuisines)) {
      await pool.query('DELETE FROM restaurant_cuisines WHERE restaurant_id = ?', [id]);
      for (const c of cuisines) {
        if (c && c.trim()) {
          await pool.query('INSERT INTO restaurant_cuisines (restaurant_id, cuisine) VALUES (?, ?)', [id, c.trim()]);
        }
      }
    }

    const [updatedRows] = await pool.query('SELECT * FROM restaurants WHERE id = ?', [id]);
    const result = await getRestaurantWithCuisines(updatedRows[0]);
    res.json(result);
  } catch (err) {
    console.error('Update restaurant error:', err);
    res.status(500).json({ message: 'Error updating restaurant.' });
  }
});

// GET /restaurants/:id/foods
router.get('/:id/foods', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM food_items WHERE restaurant_id = ? ORDER BY id ASC', [id]);
    const foods = rows.map((row) => ({
      id: row.id,
      restaurantId: row.restaurant_id,
      name: row.name,
      description: row.description || '',
      price: Number(row.price),
      image: row.image || '',
      rating: Number(row.rating || 5.0),
      category: row.category || '',
      isVeg: Boolean(row.is_veg),
    }));
    res.json(foods);
  } catch (err) {
    console.error('Get foods by restaurant error:', err);
    res.status(500).json({ message: 'Error fetching foods for restaurant.' });
  }
});

export default router;
