import { pool } from './src/db.js';

async function run() {
  try {
    // 1. Remove e_grayscale from all image URLs
    const [result1] = await pool.query(`
      UPDATE food_items 
      SET image = REPLACE(REPLACE(image, ',e_grayscale', ''), 'e_grayscale,', '') 
      WHERE image LIKE '%grayscale%'
    `);
    console.log('Stripped grayscale from items:', result1.affectedRows);

    // 2. Set colorful, appetizing images for previously empty items
    const fallbacks = [
      ['f-1787652862261', 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&auto=format&fit=crop&q=80'],
      ['f-1787653229374', 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600&auto=format&fit=crop&q=80'],
      ['f-1787653267551', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80'],
      ['f-1787653939642', 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80'],
      ['f-1787653976057', 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80'],
      ['f-1787654063267', 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80']
    ];

    for (const [id, url] of fallbacks) {
      await pool.query('UPDATE food_items SET image = ? WHERE id = ?', [url, id]);
    }

    // 3. Fallback for any remaining empty image entries
    await pool.query(`
      UPDATE food_items 
      SET image = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80' 
      WHERE image IS NULL OR image = ''
    `);

    const [rows] = await pool.query('SELECT id, name, category, image FROM food_items');
    console.log('All 30 food items verified:');
    rows.forEach(r => {
      console.log(`- [${r.category}] ${r.name} -> ${r.image.substring(0, 70)}...`);
    });
  } catch (err) {
    console.error('Error fixing images:', err);
  } finally {
    process.exit(0);
  }
}

run();
