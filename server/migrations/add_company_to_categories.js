const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME
});

const migrate = async () => {
    try {
        await pool.query(`
            ALTER TABLE equipment_categories 
            ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);
        `);
        console.log('Migration successful: Added company_id to equipment_categories');
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        pool.end();
    }
};

migrate();
