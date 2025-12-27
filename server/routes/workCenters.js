const router = require('express').Router();
const pool = require('../db');
const authorization = require('../middleware/authorization');

// Get all work centers
router.get('/', authorization, async (req, res) => {
    try {
        const allWorkCenters = await pool.query("SELECT * FROM work_centers");
        res.json(allWorkCenters.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Create a work center
router.post('/', authorization, async (req, res) => {
    try {
        const { name, code, tag, cost_per_hour, capacity, oee_target, alternative_work_center_id, time_efficiency } = req.body;
        const newWorkCenter = await pool.query(
            "INSERT INTO work_centers (name, code, tag, cost_per_hour, capacity, oee_target, alternative_work_center_id, time_efficiency) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
            [name, code, tag, cost_per_hour, capacity, oee_target, alternative_work_center_id || null, time_efficiency || null]
        );
        res.json(newWorkCenter.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Update a work center
router.put('/:id', authorization, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, code, tag, cost_per_hour, capacity, oee_target, alternative_work_center_id, time_efficiency } = req.body;
        const updateWorkCenter = await pool.query(
            "UPDATE work_centers SET name = $1, code = $2, tag = $3, cost_per_hour = $4, capacity = $5, oee_target = $6, alternative_work_center_id = $7, time_efficiency = $8 WHERE id = $9 RETURNING *",
            [name, code, tag, cost_per_hour, capacity, oee_target, alternative_work_center_id || null, time_efficiency || null, id]
        );
        res.json(updateWorkCenter.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Delete a work center
router.delete('/:id', authorization, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM work_centers WHERE id = $1", [id]);
        res.json("Work Center was deleted!");
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
