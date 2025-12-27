const router = require('express').Router();
const pool = require('../db');
const authorization = require('../middleware/authorization');

// Get all teams with member count
router.get('/', authorization, async (req, res) => {
    try {
        const allTeams = await pool.query(`
            SELECT t.*, 
                   c.name as company_name,
                   (SELECT COUNT(*) FROM team_members tm WHERE tm.team_id = t.id) as member_count
            FROM teams t
            LEFT JOIN companies c ON t.company_id = c.id
        `);
        res.json(allTeams.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Get single team with members
router.get('/:id', authorization, async (req, res) => {
    try {
        const { id } = req.params;
        const team = await pool.query("SELECT * FROM teams WHERE id = $1", [id]);
        
        if (team.rows.length === 0) {
            return res.status(404).json("Team not found");
        }
        
        const members = await pool.query(`
            SELECT u.id, u.name, u.email, u.role
            FROM team_members tm
            JOIN users u ON tm.user_id = u.id
            WHERE tm.team_id = $1
        `, [id]);
        
        res.json({
            ...team.rows[0],
            members: members.rows
        });
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

// Update a team
router.put('/:id', authorization, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, company_id } = req.body;
        const updatedTeam = await pool.query(
            "UPDATE teams SET name = $1, company_id = $2 WHERE id = $3 RETURNING *",
            [name, company_id, id]
        );
        res.json(updatedTeam.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Delete a team
router.delete('/:id', authorization, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM teams WHERE id = $1", [id]);
        res.json("Team was deleted!");
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Add member to team
router.post('/:id/members', authorization, async (req, res) => {
    try {
        const { id } = req.params;
        const { user_id } = req.body;
        
        // Check if already a member
        const existing = await pool.query(
            "SELECT * FROM team_members WHERE team_id = $1 AND user_id = $2",
            [id, user_id]
        );
        
        if (existing.rows.length > 0) {
            return res.status(400).json("User is already a team member");
        }
        
        await pool.query(
            "INSERT INTO team_members (team_id, user_id) VALUES ($1, $2)",
            [id, user_id]
        );
        
        res.json("Member added successfully");
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Remove member from team
router.delete('/:id/members/:userId', authorization, async (req, res) => {
    try {
        const { id, userId } = req.params;
        await pool.query(
            "DELETE FROM team_members WHERE team_id = $1 AND user_id = $2",
            [id, userId]
        );
        res.json("Member removed successfully");
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
