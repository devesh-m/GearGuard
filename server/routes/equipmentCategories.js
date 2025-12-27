const router = require('express').Router();
const pool = require('../db');
const authorization = require('../middleware/authorization');

// Get all categories with team info
router.get('/', authorization, async (req, res) => {
    try {
        const allCategories = await pool.query(`
            SELECT ec.*, t.name as team_name, u.name as responsible_user_name
            FROM equipment_categories ec
            LEFT JOIN teams t ON ec.team_id = t.id
            LEFT JOIN users u ON ec.responsible_user_id = u.id
        `);
        res.json(allCategories.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Create a category
router.post('/', authorization, async (req, res) => {
    try {
        const { name, responsible_user_id, company_id, team_id } = req.body;
        const newCategory = await pool.query(
            "INSERT INTO equipment_categories (name, responsible_user_id, company_id, team_id) VALUES ($1, $2, $3, $4) RETURNING *",
            [name, responsible_user_id, company_id, team_id || null]
        );
        res.json(newCategory.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
