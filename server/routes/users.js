const router = require('express').Router();
const pool = require('../db');
const authorization = require('../middleware/authorization');

// Get all users (for dropdowns)
router.get('/', authorization, async (req, res) => {
    try {
        const { role } = req.query;
        let query = "SELECT id, name, role FROM users";
        const values = [];
        
        if (role) {
            query += " WHERE role = $1";
            values.push(role);
        }
        
        const users = await pool.query(query, values);
        res.json(users.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
