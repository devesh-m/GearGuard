const router = require('express').Router();
const pool = require('../db');
const authorization = require('../middleware/authorization');

// Get all teams
router.get('/', authorization, async (req, res) => {
    try {
        const allTeams = await pool.query("SELECT * FROM teams");
        res.json(allTeams.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Create a team
router.post('/', authorization, async (req, res) => {
    try {
        const { name, company_id } = req.body;
        const newTeam = await pool.query(
            "INSERT INTO teams (name, company_id) VALUES ($1, $2) RETURNING *",
            [name, company_id]
        );
        res.json(newTeam.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
