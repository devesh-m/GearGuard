const router = require('express').Router();
const pool = require('../db');
const authorization = require('../middleware/authorization');

// Get all equipment
router.get('/', authorization, async (req, res) => {
    try {
        // Join with categories, work centers, companies, and users to get names
        const allEquipment = await pool.query(`
            SELECT e.*, 
                   ec.name as category_name, 
                   wc.name as work_center_name,
                   c.name as company_name,
                   u_tech.name as technician_name,
                   u_assign.name as assigned_user_name
            FROM equipment e
            LEFT JOIN equipment_categories ec ON e.category_id = ec.id
            LEFT JOIN work_centers wc ON e.work_center_id = wc.id
            LEFT JOIN companies c ON e.company_id = c.id
            LEFT JOIN users u_tech ON e.technician_id = u_tech.id
            LEFT JOIN users u_assign ON e.assigned_to_user_id = u_assign.id
        `);
        res.json(allEquipment.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Get single equipment
router.get('/:id', authorization, async (req, res) => {
    try {
        const { id } = req.params;
        const equipment = await pool.query("SELECT * FROM equipment WHERE id = $1", [id]);
        res.json(equipment.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Create equipment
router.post('/', authorization, async (req, res) => {
    try {
        const { name, serial_number, category_id, technician_id, assigned_to_user_id, department, work_center_id, location, health_status, company_id } = req.body;
        const newEquipment = await pool.query(
            "INSERT INTO equipment (name, serial_number, category_id, technician_id, assigned_to_user_id, department, work_center_id, location, health_status, company_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
            [name, serial_number, category_id, technician_id, assigned_to_user_id, department, work_center_id, location, health_status, company_id]
        );
        res.json(newEquipment.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Update equipment
router.put('/:id', authorization, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, serial_number, category_id, technician_id, assigned_to_user_id, department, work_center_id, location, health_status, company_id } = req.body;
        const updateEquipment = await pool.query(
            "UPDATE equipment SET name = $1, serial_number = $2, category_id = $3, technician_id = $4, assigned_to_user_id = $5, department = $6, work_center_id = $7, location = $8, health_status = $9, company_id = $10 WHERE id = $11 RETURNING *",
            [name, serial_number, category_id, technician_id, assigned_to_user_id, department, work_center_id, location, health_status, company_id, id]
        );
        res.json(updateEquipment.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Delete equipment
router.delete('/:id', authorization, async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM equipment WHERE id = $1", [id]);
        res.json("Equipment was deleted!");
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
