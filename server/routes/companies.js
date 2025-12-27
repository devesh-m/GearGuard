const router = require('express').Router();
const pool = require('../db');
const authorization = require('../middleware/authorization');

// Get all companies
router.get('/', authorization, async (req, res) => {
    try {
        const allCompanies = await pool.query("SELECT * FROM companies");
        res.json(allCompanies.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Create a company
router.post('/', authorization, async (req, res) => {
    try {
        const { name, address } = req.body;
        const newCompany = await pool.query(
            "INSERT INTO companies (name, address) VALUES ($1, $2) RETURNING *",
            [name, address]
        );
        res.json(newCompany.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
