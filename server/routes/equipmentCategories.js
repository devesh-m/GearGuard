const router = require('express').Router();
const pool = require('../db');
const authorization = require('../middleware/authorization');

// Get all categories
router.get('/', authorization, async (req, res) => {
    try {
        const allCategories = await pool.query("SELECT * FROM equipment_categories");
        res.json(allCategories.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Create a category
router.post('/', authorization, async (req, res) => {
    try {
        const { name, responsible_user_id, company_id } = req.body;
        const newCategory = await pool.query(
            "INSERT INTO equipment_categories (name, responsible_user_id, company_id) VALUES ($1, $2, $3) RETURNING *",
            [name, responsible_user_id, company_id]
        );
        res.json(newCategory.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
