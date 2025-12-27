const router = require('express').Router();
const pool = require('../db');
const authorization = require('../middleware/authorization');

// Get all maintenance requests
router.get('/', authorization, async (req, res) => {
    try {
        const { status, technician_id, maintenance_for } = req.query;
        
        let query = `
            SELECT mr.*, 
                   u.name as created_by_name,
                   t.name as team_name,
                   tech.name as technician_name,
                   CASE 
                       WHEN mr.maintenance_for = 'equipment' THEN eq.name
                       WHEN mr.maintenance_for = 'work_center' THEN wc.name
                   END as resource_name,
                   CASE 
                       WHEN mr.maintenance_for = 'equipment' THEN ec.name
                       ELSE NULL
                   END as category_name,
                   CASE 
                       WHEN mr.maintenance_for = 'work_center' THEN alt_wc.name
                       ELSE NULL
                   END as alternative_work_center_name
            FROM maintenance_requests mr
            LEFT JOIN users u ON mr.created_by_id = u.id
            LEFT JOIN teams t ON mr.team_id = t.id
            LEFT JOIN users tech ON mr.technician_id = tech.id
            LEFT JOIN equipment eq ON mr.maintenance_for = 'equipment' AND mr.resource_id = eq.id
            LEFT JOIN equipment_categories ec ON eq.category_id = ec.id
            LEFT JOIN work_centers wc ON mr.maintenance_for = 'work_center' AND mr.resource_id = wc.id
            LEFT JOIN work_centers alt_wc ON wc.alternative_work_center_id = alt_wc.id
        `;
        
        const conditions = [];
        const values = [];
        
        if (status) {
            conditions.push(`mr.status = $${conditions.length + 1}`);
            values.push(status);
        }
        
        if (technician_id) {
            conditions.push(`mr.technician_id = $${conditions.length + 1}`);
            values.push(technician_id);
        }
        
        if (maintenance_for) {
            conditions.push(`mr.maintenance_for = $${conditions.length + 1}`);
            values.push(maintenance_for);
        }
        
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        
        query += ' ORDER BY mr.created_at DESC';
        
        const requests = await pool.query(query, values);
        res.json(requests.rows);
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Create a new maintenance request
router.post('/', authorization, async (req, res) => {
    try {
        const { subject, maintenance_for, resource_id, type, team_id, technician_id, scheduled_date, duration, priority, instructions, notes } = req.body;
        
        // Validate that resource_id exists in the correct table
        if (maintenance_for === 'equipment') {
            const equipment = await pool.query("SELECT id FROM equipment WHERE id = $1", [resource_id]);
            if (equipment.rows.length === 0) {
                return res.status(400).json("Equipment not found");
            }
        } else if (maintenance_for === 'work_center') {
            const workCenter = await pool.query("SELECT id FROM work_centers WHERE id = $1", [resource_id]);
            if (workCenter.rows.length === 0) {
                return res.status(400).json("Work Center not found");
            }
        } else {
            return res.status(400).json("Invalid maintenance_for value");
        }
        
        const newRequest = await pool.query(
            `INSERT INTO maintenance_requests 
             (subject, created_by_id, maintenance_for, resource_id, type, team_id, technician_id, scheduled_date, duration, priority, instructions, notes) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
             RETURNING *`,
            [subject, req.user, maintenance_for, resource_id, type, team_id, technician_id, scheduled_date, duration, priority, instructions, notes]
        );
        
        res.json(newRequest.rows[0]);
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Update request status
router.put('/:id/status', authorization, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        const updatedRequest = await pool.query(
            "UPDATE maintenance_requests SET status = $1 WHERE id = $2 RETURNING *",
            [status, id]
        );
        
        if (updatedRequest.rows.length === 0) {
            return res.status(404).json("Request not found");
        }
        
        res.json(updatedRequest.rows[0]);
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

// Assign technician to request
router.put('/:id/assign', authorization, async (req, res) => {
    try {
        const { id } = req.params;
        const { technician_id } = req.body;
        
        const updatedRequest = await pool.query(
            "UPDATE maintenance_requests SET technician_id = $1 WHERE id = $2 RETURNING *",
            [technician_id, id]
        );
        
        if (updatedRequest.rows.length === 0) {
            return res.status(404).json("Request not found");
        }
        
        res.json(updatedRequest.rows[0]);
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
