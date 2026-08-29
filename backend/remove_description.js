import { pool } from './src/db.js';

async function removeDescription() {
  const connection = await pool.getConnection();
  try {
    console.log('🔄 Checking food_items columns...');
    const [cols] = await connection.query(`
      SELECT COLUMN_NAME FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'food_items' AND COLUMN_NAME = 'description';
    `);

    if (cols.length > 0) {
      console.log('🗑️ Dropping column `description` from `food_items`...');
      await connection.query('ALTER TABLE food_items DROP COLUMN description;');
      console.log('✅ Column `description` dropped successfully from `food_items` table!');
    } else {
      console.log('ℹ️ Column `description` already does not exist in `food_items`.');
    }
  } catch (err) {
    console.error('Error modifying database:', err);
  } finally {
    connection.release();
    process.exit(0);
  }
}

removeDescription();
